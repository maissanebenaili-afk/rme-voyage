/** @jest-environment node */
import {
  EPISODES,
  FIN,
  aDesVoix,
  clip,
  voixAuxTemps,
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
import { dessinerEpisode, ouvertureBouche, ouvertureVoix } from '@/lib/kalimat/dessin';
import { CASTING, repliquesAParler, texteAParler } from '@/lib/kalimat/voix';
import { FREQUENCE, ambiances, enWav, genererSon } from '@/lib/kalimat/son';

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
    dessinerEpisode(ctx, ep, GENERIQUE + 1.5, 'sans-serif', 'es', { sousTitres: true });
    expect(textes.join('')).toContain('brilla');
    expect(textes).toContain('chouf = mira');
    expect(textes.join('')).toContain('Inès : ');
  });
});

describe('Kalimat : les voix', () => {
  it('écrit les mots de darija pour que la voix les prononce bien', () => {
    expect(texteAParler('Reviens, *3afak* !', 'fr')).toBe('Reviens, âafak !');
    expect(texteAParler('*Chouf*, Adam', 'es')).toBe('chuf, Adam');
    expect(texteAParler('Tu réponds : *labas, hamdoullah* !', 'fr')).toBe('Tu réponds : labasse, hamdoullah !');
  });

  it('prépare toutes les répliques à dire, avec la voix de chaque personnage', () => {
    const ep = EPISODES[0];
    const liste = repliquesAParler(ep, 'fr');
    expect(liste).toHaveLength(ep.plans.length + 5);
    expect(liste[0].cle).toBe('g');
    expect(liste[1]).toMatchObject({ cle: 'p00', qui: 'ines', voix: CASTING.ines.voix });
    for (const r of liste) expect(r.texte).not.toMatch(/[*3]/);
  });

  it('cale l’épisode doublé sur la durée des voix', () => {
    const ep = EPISODES[0];
    expect(aDesVoix(ep, 'fr')).toBe(true);
    // Les trois épisodes sont doublés, en français et en espagnol.
    for (const e of EPISODES) for (const l of LANGUES) expect(aDesVoix(e, l)).toBe(true);
    const c = clip(ep, 'fr', 'p00');
    expect(c).toBeDefined();
    expect(momentA(ep, GENERIQUE).duree).toBeCloseTo(Math.max(1.4, Math.round((0.2 + (c?.duree ?? 0) + 0.5) * 10) / 10), 5);
    const places = voixAuxTemps(ep, 'fr');
    expect(places).toHaveLength(ep.plans.length + 5);
    for (let i = 1; i < places.length; i++) expect(places[i].debut).toBeGreaterThan(places[i - 1].debut);
    expect(places[places.length - 1].debut + places[places.length - 1].clip.duree).toBeLessThan(dureeEpisode(ep, 'fr'));
  });

  it('ouvre la bouche avec la voix, et la ferme quand elle s’arrête', () => {
    const voix = { fichier: '', duree: 0.1, bouche: '09' };
    expect(ouvertureVoix(voix, 0)).toBe(-1);
    expect(ouvertureVoix(voix, 0.2 + 1 / 30)).toBeGreaterThan(0.9);
    expect(ouvertureVoix(voix, 5)).toBe(-1);
  });

  it('mélange les voix à la musique', () => {
    const ep = EPISODES[2];
    const voix = new Float32Array(FREQUENCE).map((_, i) => 0.5 * Math.sin(i / 5));
    const sans = genererSon(ep, 'fr');
    const avec = genererSon(ep, 'fr', [{ debut: 10, donnees: voix }]);
    const energie = (p: Float32Array) => p.subarray(10 * FREQUENCE, 11 * FREQUENCE).reduce((s, v) => s + v * v, 0);
    expect(energie(avec)).toBeGreaterThan(energie(sans) * 2);
  });

  it('laisse l’image doublée libre de texte ; sous-titres et sens des mots seulement si on les demande', () => {
    const ep = EPISODES[0];
    const sans = fauxCanvas();
    dessinerEpisode(sans.ctx, ep, GENERIQUE + 1.5, 'sans-serif', 'fr');
    expect(sans.textes).toEqual([]);
    const avec = fauxCanvas();
    dessinerEpisode(avec.ctx, ep, GENERIQUE + 1.5, 'sans-serif', 'fr', { sousTitres: true });
    expect(avec.textes.join('')).toContain('Inès : ');
    expect(avec.textes.join('')).toContain('la mer');
    expect(avec.textes).toContain('chouf = regarde');
  });

  it('met le sens des mots nouveaux dans les sous-titres YouTube', () => {
    expect(sousTitresSrt(EPISODES[0], 'fr')).toContain('INÈS : Chouf, Adam, la mer elle brille !\n(chouf = regarde)');
  });

  it('change la musique selon la scène : suspense quand Mchicha disparaît, tendresse avec Mima', () => {
    const [ep1, , ep3] = EPISODES;
    expect(ambiances(ep3, 'fr').map((s) => s.ambiance)).toEqual(['joie', 'suspense', 'joie']);
    expect(ambiances(ep1, 'fr').map((s) => s.ambiance)).toContain('tendre');
    const fin = ambiances(ep1, 'fr').at(-1);
    expect(fin?.fin).toBeCloseTo(dureeEpisode(ep1, 'fr'), 5);
  });
});
