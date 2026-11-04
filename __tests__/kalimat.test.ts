/** @jest-environment node */
import {
  EPISODES,
  FIN,
  GENERIQUE,
  LANGUES,
  MOTS,
  dureeEpisode,
  dureePlan,
  lignes,
  momentA,
  morceaux,
  motsConnus,
  repliques,
  sousTitresSrt,
  suivant,
  texteBrut,
  traductions,
} from '@/lib/kalimat/episodes';
import { LEXIQUE, cleDuMot } from '@/lib/kalimat/lexique';
import { dessinerEpisode, ouvertureBouche } from '@/lib/kalimat/dessin';
import { FREQUENCE, enWav, genererSon } from '@/lib/kalimat/son';

// Un faux canvas : accepte tous les appels de dessin et garde les textes écrits.
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

const plan = (texte: string) => ({ decor: 'port' as const, persos: [], texte: { fr: texte, es: texte } });

describe('Kalimat : les épisodes', () => {
  it('laisse le temps d’écrire puis de lire chaque bulle, au moins 2,4 secondes', () => {
    expect(dureePlan(plan('*Salam* !'))).toBe(2.4);
    expect(dureePlan(plan('x'.repeat(60)))).toBe(4.5);
  });

  it('garde des épisodes courts, format Short, dans les deux langues', () => {
    for (const ep of EPISODES) {
      for (const l of LANGUES) {
        expect(dureeEpisode(ep, l)).toBeGreaterThanOrEqual(40);
        expect(dureeEpisode(ep, l)).toBeLessThanOrEqual(90);
      }
    }
  });

  it('a des répliques cohérentes : celui qui parle est à l’écran, les astérisques vont par deux', () => {
    for (const ep of EPISODES) {
      for (const p of ep.plans) {
        if (p.parle) expect(p.persos.map((q) => q.id)).toContain(p.parle);
        for (const l of LANGUES) expect((p.texte[l].match(/\*/g) ?? []).length % 2).toBe(0);
      }
    }
  });

  it('sait ce qui est à l’écran à chaque instant', () => {
    const ep = EPISODES[0];
    expect(momentA(ep, -5).partie).toBe('generique');
    expect(momentA(ep, GENERIQUE)).toMatchObject({ partie: 'plan', index: 0, local: 0, debut: GENERIQUE });
    const debutMots = dureeEpisode(ep) - MOTS - FIN;
    expect(momentA(ep, debutMots - 0.01)).toMatchObject({ partie: 'plan', index: ep.plans.length - 1 });
    expect(momentA(ep, debutMots + 1).partie).toBe('mots');
    const fin = momentA(ep, 10_000);
    expect(fin.partie).toBe('fin');
    expect(fin.local).toBeCloseTo(FIN, 5);
  });

  it('annonce l’épisode suivant à la fin', () => {
    expect(suivant(EPISODES[0])?.numero).toBe(2);
    expect(suivant(EPISODES[EPISODES.length - 1])).toBeUndefined();
  });
});

describe('Kalimat : apprendre la darija petit à petit', () => {
  it('a chaque mot coloré dans le dictionnaire, avec son sens en français et en espagnol', () => {
    const manquants: string[] = [];
    for (const ep of EPISODES) {
      for (const p of ep.plans) {
        for (const l of LANGUES) {
          for (const m of morceaux(p.texte[l]).filter((x) => x.fort)) {
            const cles = LEXIQUE[cleDuMot(m.texte)] ? [cleDuMot(m.texte)] : m.texte.split(/[\s,]+/).map(cleDuMot).filter(Boolean);
            for (const c of cles) if (!LEXIQUE[c]?.fr || !LEXIQUE[c]?.es) manquants.push(`${ep.numero}/${l} : ${c}`);
          }
        }
      }
    }
    expect(manquants).toEqual([]);
  });

  it('traduit un mot nouveau la première fois seulement', () => {
    const [ep1, ep2, ep3] = EPISODES;
    expect(traductions(ep1, 0, 'fr').map((e) => `${e.mot} = ${e.fr}`)).toEqual(['chouf = regarde']);
    expect(traductions(ep1, 1, 'fr').map((e) => e.mot)).toEqual(['salam']);
    expect(traductions(ep1, 2, 'fr')).toEqual([]);
    // « salam » est appris à l’épisode 1 : plus traduit ensuite
    expect(motsConnus(2).has('salam')).toBe(true);
    expect(traductions(ep2, 0, 'fr').map((e) => e.mot)).toEqual(['safi']);
    // « chouf » n’était pas un mot du jour : on le rappelle à l’épisode 3
    expect(traductions(ep3, 3, 'es').map((e) => `${e.mot} = ${e.es}`)).toEqual(['chouf = mira']);
  });

  it('ne traduit pas un mot de la langue de la version, mais traduit celui d’une autre langue', () => {
    const ep1 = EPISODES[0];
    const i = ep1.plans.findIndex((p) => p.texte.fr === '*Vale* !');
    expect(traductions(ep1, i, 'fr').map((e) => e.fr)).toEqual(['d’accord (espagnol)']);
    expect(traductions(ep1, i, 'es').map((e) => e.es)).toEqual(['vale (francés)']);
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
    const une = lignes('Qui veut de l’*atay* ?', 100, mesure);
    expect(une).toHaveLength(1);
    expect(une[0].find((m) => m.fort)?.texte).toBe('atay');
  });

  it('ouvre la bouche selon la lettre qui s’écrit, et la ferme à la fin', () => {
    expect(ouvertureBouche('*Salam* !', 0)).toBe(-1);
    expect(ouvertureBouche('Aaaa', 0.3)).toBeGreaterThan(0.9);
    expect(ouvertureBouche('Aaaa', 10)).toBe(-1);
  });
});

describe('Kalimat : sous-titres pour les voix et YouTube', () => {
  it('écrit un fichier .srt horodaté, avec le nom de celui qui parle, dans chaque langue', () => {
    const srt = sousTitresSrt(EPISODES[0], 'fr');
    expect(srt.startsWith('1\n00:00:00,000 --> 00:00:04,000\nKalimat, les mots du bled. Épisode 1')).toBe(true);
    expect(srt).toContain('INÈS : Chouf, Adam, la mer elle brille !');
    expect(srt).not.toContain('*');
    expect(sousTitresSrt(EPISODES[0], 'es')).toContain('INÈS : Chouf, Adam, ¡el mar brilla!');
  });

  it('enchaîne les répliques sans trou jusqu’à la fin', () => {
    for (const ep of EPISODES) {
      for (const l of LANGUES) {
        const r = repliques(ep, l);
        for (let i = 1; i < r.length; i++) expect(r[i].debut).toBeCloseTo(r[i - 1].fin, 5);
        expect(r[r.length - 1].fin).toBeCloseTo(dureeEpisode(ep, l), 5);
      }
    }
  });
});

describe('Kalimat : le son', () => {
  it('fabrique une piste de la durée de l’épisode, audible et sans saturation', () => {
    const ep = EPISODES[2];
    const piste = genererSon(ep, 'fr');
    expect(piste.length).toBe(Math.ceil(dureeEpisode(ep, 'fr') * FREQUENCE));
    let max = 0;
    let carres = 0;
    for (const v of piste) {
      max = Math.max(max, Math.abs(v));
      carres += v * v;
    }
    expect(max).toBeLessThanOrEqual(1);
    expect(Math.sqrt(carres / piste.length)).toBeGreaterThan(0.02);
  });

  it('écrit un vrai fichier WAV', () => {
    const wav = enWav(new Float32Array([0, 0.5, -0.5, 1]));
    expect(String.fromCharCode(...wav.subarray(0, 4))).toBe('RIFF');
    expect(String.fromCharCode(...wav.subarray(8, 12))).toBe('WAVE');
    expect(wav.length).toBe(44 + 8);
  });
});

describe('Kalimat : le dessin', () => {
  it('dessine chaque image de chaque épisode, dans les deux langues, sans erreur', () => {
    for (const ep of EPISODES) {
      for (const l of LANGUES) {
        const { ctx } = fauxCanvas();
        for (let t = 0; t <= dureeEpisode(ep, l); t += 0.25) expect(() => dessinerEpisode(ctx, ep, t, 'sans-serif', l)).not.toThrow();
      }
    }
  });

  it('écrit la réplique et sa traduction dans la langue choisie', () => {
    const ep = EPISODES[0];
    const { ctx, textes } = fauxCanvas();
    dessinerEpisode(ctx, ep, GENERIQUE + 2.5, 'sans-serif', 'es');
    expect(textes.join('')).toContain('brilla');
    expect(textes).toContain(' = mira');
    expect(textes).toContain('Inès');
  });
});
