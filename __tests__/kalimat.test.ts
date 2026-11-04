/** @jest-environment node */
import {
  EPISODES,
  FIN,
  GENERIQUE,
  MOTS,
  dureeEpisode,
  dureePlan,
  lignes,
  momentA,
  morceaux,
  repliques,
  sousTitresSrt,
  texteBrut,
} from '@/lib/kalimat/episodes';
import { dessinerEpisode } from '@/lib/kalimat/dessin';

// Un faux canvas : accepte tous les appels de dessin et compte les textes écrits.
function fauxCanvas() {
  const textes: string[] = [];
  const ctx = new Proxy(
    {},
    {
      get(_cible, nom) {
        if (nom === 'measureText') return (s: string) => ({ width: s.length * 30 });
        if (nom === 'createLinearGradient' || nom === 'createRadialGradient') return () => ({ addColorStop() {} });
        if (nom === 'fillText') return (s: string) => textes.push(s);
        return () => undefined;
      },
      set: () => true,
    },
  ) as unknown as CanvasRenderingContext2D;
  return { ctx, textes };
}

describe('Kalimat : les épisodes', () => {
  it('donne à chaque bulle le temps d’être lue, au moins 2,2 secondes', () => {
    expect(dureePlan({ decor: 'port', persos: [], texte: '*Salam* !' })).toBe(2.2);
    expect(dureePlan({ decor: 'port', persos: [], texte: 'x'.repeat(60) })).toBe(4);
    expect(dureePlan({ decor: 'port', persos: [], texte: 'court', duree: 3 })).toBe(3);
  });

  it('garde des épisodes courts, format Short : entre 40 et 60 secondes', () => {
    for (const ep of EPISODES) {
      expect(dureeEpisode(ep)).toBeGreaterThanOrEqual(40);
      expect(dureeEpisode(ep)).toBeLessThanOrEqual(60);
    }
  });

  it('a des répliques cohérentes : celui qui parle est à l’écran, les astérisques vont par deux', () => {
    for (const ep of EPISODES) {
      for (const plan of ep.plans) {
        if (plan.parle) expect(plan.persos.map((p) => p.id)).toContain(plan.parle);
        expect((plan.texte.match(/\*/g) ?? []).length % 2).toBe(0);
      }
    }
  });

  it('sait ce qui est à l’écran à chaque instant', () => {
    const ep = EPISODES[0];
    expect(momentA(ep, -5).partie).toBe('generique');
    expect(momentA(ep, GENERIQUE)).toMatchObject({ partie: 'plan', index: 0, local: 0 });
    const debutMots = dureeEpisode(ep) - MOTS - FIN;
    expect(momentA(ep, debutMots - 0.01)).toMatchObject({ partie: 'plan', index: ep.plans.length - 1 });
    expect(momentA(ep, debutMots + 1).partie).toBe('mots');
    const fin = momentA(ep, 10_000);
    expect(fin.partie).toBe('fin');
    expect(fin.local).toBeCloseTo(FIN, 5);
  });
});

describe('Kalimat : le texte des bulles', () => {
  it('colore les mots entre astérisques', () => {
    expect(morceaux('*Salam*, Inès')).toEqual([
      { texte: 'Salam', fort: true },
      { texte: ', Inès', fort: false },
    ]);
    expect(texteBrut('*Fin* Mchicha ?')).toBe('Fin Mchicha ?');
  });

  it('coupe en lignes sans laisser un point d’exclamation tout seul', () => {
    const mesure = (s: string) => s.length;
    const rangees = lignes('*Bslama* ! *Doei* !', 10, mesure);
    expect(rangees.map((l) => l.map((m) => m.texte).join('').trim())).toEqual(['Bslama !', 'Doei !']);
    // l’apostrophe ne coupe pas un mot en deux couleurs
    const une = lignes('Qui veut de l’*atay* ?', 100, mesure);
    expect(une).toHaveLength(1);
    expect(une[0].find((m) => m.fort)?.texte).toBe('atay');
  });
});

describe('Kalimat : sous-titres pour les voix et YouTube', () => {
  it('écrit un fichier .srt horodaté, avec le nom de celui qui parle', () => {
    const srt = sousTitresSrt(EPISODES[0]);
    expect(srt.startsWith('1\n00:00:00,000 --> 00:00:04,000\nKalimat, les mots du bled. Épisode 1')).toBe(true);
    expect(srt).toContain('00:00:04,000 --> ');
    expect(srt).toContain('INÈS : Chouf, Adam, la mer elle brille !');
    expect(srt).not.toContain('*');
  });

  it('enchaîne les répliques sans trou jusqu’à la fin', () => {
    for (const ep of EPISODES) {
      const r = repliques(ep);
      for (let i = 1; i < r.length; i++) expect(r[i].debut).toBeCloseTo(r[i - 1].fin, 5);
      expect(r[r.length - 1].fin).toBeCloseTo(dureeEpisode(ep), 5);
    }
  });
});

describe('Kalimat : le dessin', () => {
  it('dessine chaque image de chaque épisode sans erreur', () => {
    for (const ep of EPISODES) {
      const { ctx } = fauxCanvas();
      for (let t = 0; t <= dureeEpisode(ep); t += 0.25) expect(() => dessinerEpisode(ctx, ep, t)).not.toThrow();
    }
  });

  it('écrit la réplique du moment dans la bulle', () => {
    const ep = EPISODES[0];
    const { ctx, textes } = fauxCanvas();
    dessinerEpisode(ctx, ep, GENERIQUE + 0.5);
    expect(textes.join('')).toContain('Chouf');
    expect(textes).toContain('Inès');
  });
});
