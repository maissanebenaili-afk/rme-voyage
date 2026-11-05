// La musique et les bruitages de Kalimat, fabriqués par le calcul.
//
// Une musique originale dans l'esprit des animés des années 80 : cordes en
// trémolo, harpe en arpèges, une mélodie qui chante. Elle change selon la scène
// (joie, tendresse, suspense) avec des fondus, se fait plus douce quand les
// personnages parlent, et reprend le thème au générique et à la fin.
// Le son est calé sur le temps de l'épisode : le même sur le site et dans la vidéo.

import {
  DEBUT_ECRITURE,
  FIN,
  GENERIQUE,
  LETTRES_PAR_SECONDE,
  MOTS,
  ambianceDuPlan,
  clip,
  cleDuPlan,
  dureeEpisode,
  dureePlan,
  morceaux,
  type Ambiance,
  type Episode,
  type Langue,
} from './episodes';

export const FREQUENCE = 44100;

/** Une voix déjà décodée, à placer dans la piste. */
export interface VoixPlacee {
  debut: number;
  donnees: Float32Array;
}

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);
const TEMPS = 60 / 92;
const MESURE = 4 * TEMPS;

// --- Les instruments -------------------------------------------------------------

// Une période de chaque timbre, calculée une fois : bien plus rapide que des sinus à chaque échantillon.
const TAILLE = 4096;
function table(harmoniques: [number, number, number][]): Float32Array {
  const t = new Float32Array(TAILLE);
  for (let i = 0; i < TAILLE; i++) {
    const p = (2 * Math.PI * i) / TAILLE;
    for (const [rang, force, decale] of harmoniques) t[i] += force * Math.sin(rang * p + decale);
  }
  return t;
}
const TIMBRE_CORDES = table([[1, 1, 0], [2, 0.45, 0.3], [3, 0.25, 0.7], [4, 0.12, 0], [5, 0.06, 0]]);
const TIMBRE_HARPE = table([[1, 1, 0], [2, 0.3, 0], [3, 0.08, 0]]);
const TIMBRE_FLUTE = table([[1, 1, 0], [2, 0.15, 0]]);
const lire = (t: Float32Array, phase: number) => t[Math.floor((phase - Math.floor(phase)) * TAILLE)];
/** Les modulations lentes (vibrato, trémolo) sont recalculées tous les 64 échantillons. */
const PAS_LENT = 64;

/** Cordes : plusieurs harmoniques, vibrato, et un trémolo (archet qui frémit). */
function cordes(piste: Float32Array, debut: number, duree: number, midi: number, gain: number, tremolo: number) {
  const i0 = Math.max(0, Math.floor(debut * FREQUENCE));
  const n = Math.floor((duree + 0.3) * FREQUENCE);
  const f = hz(midi) / FREQUENCE;
  let phase = 0;
  let vib = 1;
  let trem = 1;
  for (let k = 0; k < n && i0 + k < piste.length; k++) {
    const s = k / FREQUENCE;
    if (k % PAS_LENT === 0) {
      vib = 1 + 0.004 * Math.sin(2 * Math.PI * 5.5 * s);
      trem = tremolo > 0 ? 1 - tremolo * 0.5 * (1 + Math.sin(2 * Math.PI * 11 * s)) : 1;
    }
    const attaque = s < 0.18 ? s / 0.18 : 1;
    const relache = s > duree ? Math.max(0, 1 - (s - duree) / 0.3) : 1;
    phase += f * vib;
    piste[i0 + k] += lire(TIMBRE_CORDES, phase) * gain * attaque * relache * trem;
  }
}

/** Harpe : une corde pincée qui s'éteint doucement. */
function harpe(piste: Float32Array, debut: number, midi: number, gain: number) {
  const i0 = Math.max(0, Math.floor(debut * FREQUENCE));
  const n = Math.floor(1.6 * FREQUENCE);
  const f = hz(midi) / FREQUENCE;
  const amorti = Math.exp(-3 / FREQUENCE);
  let env = gain;
  for (let k = 0; k < n && i0 + k < piste.length; k++) {
    const attaque = k < 176 ? k / 176 : 1;
    piste[i0 + k] += lire(TIMBRE_HARPE, f * k) * env * attaque;
    env *= amorti;
  }
}

/** Flûte : la mélodie, douce et chantante. */
function flute(piste: Float32Array, debut: number, duree: number, midi: number, gain: number) {
  const i0 = Math.max(0, Math.floor(debut * FREQUENCE));
  const n = Math.floor((duree + 0.12) * FREQUENCE);
  const f = hz(midi) / FREQUENCE;
  let phase = 0;
  let vib = 1;
  for (let k = 0; k < n && i0 + k < piste.length; k++) {
    const s = k / FREQUENCE;
    if (k % PAS_LENT === 0) vib = 1 + 0.006 * Math.sin(2 * Math.PI * 5 * s) * Math.min(1, s / 0.3);
    const env = (s < 0.06 ? s / 0.06 : 1) * (s > duree ? Math.max(0, 1 - (s - duree) / 0.12) : 1);
    phase += f * vib;
    piste[i0 + k] += lire(TIMBRE_FLUTE, phase) * gain * env;
  }
}

function sinus(piste: Float32Array, debut: number, duree: number, frequence: (u: number) => number, gain: number, relache = 0.1) {
  const i0 = Math.max(0, Math.floor(debut * FREQUENCE));
  const n = Math.floor((duree + relache) * FREQUENCE);
  let phase = 0;
  for (let k = 0; k < n && i0 + k < piste.length; k++) {
    const s = k / FREQUENCE;
    phase += frequence(Math.min(1, s / duree)) / FREQUENCE;
    const env = Math.min(1, s / 0.005) * (s < duree ? 1 : Math.max(0, 1 - (s - duree) / relache));
    piste[i0 + k] += Math.sin(2 * Math.PI * phase) * gain * env;
  }
}

// --- Les trois ambiances --------------------------------------------------------------

type Accord = { notes: number[]; basse: number };
const ACCORDS: Record<string, Accord> = {
  D: { notes: [62, 66, 69], basse: 38 },
  Bm: { notes: [59, 62, 66], basse: 35 },
  G: { notes: [55, 59, 62], basse: 43 },
  A: { notes: [57, 61, 64], basse: 45 },
  Em: { notes: [52, 55, 59], basse: 40 },
  'F#': { notes: [54, 58, 61], basse: 42 },
};

interface Style {
  grille: string[];
  /** Une mesure de mélodie par accord : [note, durée en temps], 0 = silence. */
  melodie: [number, number][][];
  tremolo: number;
  arpeges: boolean;
  gainCordes: number;
}

const STYLES: Record<Ambiance, Style> = {
  joie: {
    grille: ['D', 'Bm', 'G', 'A'],
    melodie: [
      [[78, 1], [81, 0.5], [86, 1.5], [85, 0.5], [83, 0.5]],
      [[81, 1], [78, 0.5], [81, 0.5], [83, 2]],
      [[79, 1], [83, 0.5], [86, 0.5], [88, 1], [86, 1]],
      [[85, 1.5], [83, 0.5], [81, 2]],
    ],
    tremolo: 0.25,
    arpeges: true,
    gainCordes: 0.05,
  },
  tendre: {
    grille: ['G', 'D', 'Em', 'A'],
    melodie: [
      [[79, 2], [83, 2]],
      [[81, 3], [78, 1]],
      [[79, 2], [76, 2]],
      [[78, 4]],
    ],
    tremolo: 0.15,
    arpeges: true,
    gainCordes: 0.065,
  },
  suspense: {
    grille: ['Bm', 'G', 'Em', 'F#'],
    melodie: [
      [[71, 1], [0, 1], [74, 1], [73, 1]],
      [[71, 3], [0, 1]],
      [[67, 1], [0, 1], [71, 1], [70, 1]],
      [[70, 4]],
    ],
    tremolo: 0.85,
    arpeges: false,
    gainCordes: 0.06,
  },
};

/** Joue la mesure `m` (rang dans la grille) d'une ambiance, à partir de `debut`. */
function mesure(piste: Float32Array, style: Style, m: number, debut: number) {
  const k = ((m % 4) + 4) % 4;
  const accord = ACCORDS[style.grille[k]];
  for (const n of accord.notes) cordes(piste, debut, MESURE * 0.98, n, style.gainCordes, style.tremolo);
  cordes(piste, debut, MESURE * 0.98, accord.basse, style.gainCordes * 1.2, style.tremolo > 0.5 ? style.tremolo : 0);
  if (style.arpeges) {
    const arpege = [...accord.notes, accord.notes[0] + 12, accord.notes[1] + 12, accord.notes[2] + 12];
    for (let i = 0; i < 8; i++) harpe(piste, debut + i * (TEMPS / 2), arpege[[0, 1, 2, 3, 4, 3, 2, 1][i]], 0.07);
  } else {
    // suspense : une note grave pincée sur chaque temps
    for (let i = 0; i < 4; i++) harpe(piste, debut + i * TEMPS, accord.basse + 12, 0.08);
  }
  let t = debut;
  for (const [note, d] of style.melodie[k]) {
    if (note) flute(piste, t, d * TEMPS * 0.92, note, 0.09);
    t += d * TEMPS;
  }
}

interface Segment {
  debut: number;
  fin: number;
  ambiance: Ambiance;
}

/** Les ambiances de l'épisode, du générique à la fin. */
export function ambiances(ep: Episode, langue: Langue): Segment[] {
  const liste: Segment[] = [{ debut: 0, fin: GENERIQUE, ambiance: 'joie' }];
  let debut = GENERIQUE;
  ep.plans.forEach((plan, i) => {
    const fin = debut + dureePlan(plan, langue, clip(ep, langue, cleDuPlan(i)));
    const ambiance = ambianceDuPlan(plan);
    const dernier = liste[liste.length - 1];
    if (dernier.ambiance === ambiance) dernier.fin = fin;
    else liste.push({ debut, fin, ambiance });
    debut = fin;
  });
  const total = dureeEpisode(ep, langue);
  const dernier = liste[liste.length - 1];
  if (dernier.ambiance === 'joie') dernier.fin = total;
  else liste.push({ debut, fin: total, ambiance: 'joie' });
  return liste;
}

/** La musique de fond : chaque ambiance sur ses moments, avec des fondus de 0,6 s. */
function musique(segments: Segment[], duree: number): Float32Array {
  const piste = new Float32Array(Math.ceil(duree * FREQUENCE));
  const FONDU = 0.6;
  for (const ambiance of ['joie', 'tendre', 'suspense'] as const) {
    const siens = segments.filter((s) => s.ambiance === ambiance);
    if (siens.length === 0) continue;
    const calque = new Float32Array(piste.length);
    // les mesures suivent une grille commune : la musique ne « saute » pas d'un plan à l'autre
    for (let m = -1; m * MESURE < duree; m++) {
      const debut = m * MESURE;
      if (siens.some((s) => debut < s.fin + FONDU && debut + MESURE > s.debut - FONDU)) mesure(calque, STYLES[ambiance], m, Math.max(0, debut));
    }
    let poids = 0;
    for (let i = 0; i < piste.length; i++) {
      if (i % PAS_LENT === 0) {
        const t = i / FREQUENCE;
        poids = 0;
        for (const s of siens) poids = Math.max(poids, Math.min(1, (t - s.debut + FONDU / 2) / FONDU, (s.fin + FONDU / 2 - t) / FONDU));
      }
      if (poids > 0) piste[i] += calque[i] * poids;
    }
  }
  return piste;
}

/** Plus fort au générique, aux mots du jour et à la fin ; plus doux pendant les dialogues. */
function volumeMusique(t: number, debutDialogues: number, finDialogues: number, avecVoix: boolean): number {
  const doux = avecVoix ? 0.3 : 0.45;
  const fort = 1;
  const fondu = 0.5;
  if (t < debutDialogues - fondu) return fort;
  if (t < debutDialogues) return fort - ((t - (debutDialogues - fondu)) / fondu) * (fort - doux);
  if (t < finDialogues) return doux;
  if (t < finDialogues + fondu) return doux + ((t - finDialogues) / fondu) * (fort - doux);
  return fort;
}

/**
 * La piste complète de l'épisode (mono, de -1 à 1). Avec `voix`, les répliques
 * enregistrées sont mélangées à la musique, sans les bruitages des bulles.
 */
export function genererSon(ep: Episode, langue: Langue = 'fr', voix: VoixPlacee[] = []): Float32Array {
  const avecVoix = voix.length > 0;
  const duree = dureeEpisode(ep, langue);
  const fond = musique(ambiances(ep, langue), duree);
  const effets = new Float32Array(fond.length);
  const finDialogues = duree - MOTS - FIN;

  // glissando de harpe à l'ouverture
  for (let i = 0; i < 12; i++) harpe(effets, 0.05 + i * 0.05, 62 + [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26][i], 0.09);
  let debut = GENERIQUE;
  ep.plans.forEach((plan, i) => {
    if (i === 0 || ep.plans[i - 1].decor !== plan.decor) sinus(effets, debut - 0.05, 0.35, (u) => 900 - 600 * u, 0.06, 0.15);
    if (!avecVoix) sinus(effets, debut + 0.04, 0.07, (u) => 520 + 600 * u, 0.25, 0.05);
    if (plan.persos.some((q) => q.saut)) sinus(effets, debut + 0.1, 0.45, (u) => 260 + 260 * Math.sin(u * Math.PI) + 30 * Math.sin(u * 40), 0.22);
    if (!avecVoix) {
      // un petit « pling » quand chaque mot de darija finit de s'écrire
      let lettres = 0;
      for (const m of morceaux(plan.texte[langue])) {
        lettres += m.texte.length;
        if (m.fort) sinus(effets, debut + DEBUT_ECRITURE + lettres / LETTRES_PAR_SECONDE, 0.06, () => hz(93), 0.1, 0.12);
      }
    }
    debut += dureePlan(plan, langue, clip(ep, langue, cleDuPlan(i)));
  });
  // une note de harpe pour chaque mot du jour, un accord de fin
  for (let i = 0; i < 3; i++) {
    harpe(effets, finDialogues + i * 3 + 0.5, 86, 0.16);
    harpe(effets, finDialogues + i * 3 + 0.5, 93, 0.08);
  }
  for (const n of [62, 66, 69, 74, 78]) harpe(effets, finDialogues + MOTS + 0.1, n, 0.1);

  for (const { debut: d, donnees } of voix) {
    const i0 = Math.floor(d * FREQUENCE);
    for (let k = 0; k < donnees.length && i0 + k < effets.length; k++) effets[i0 + k] += donnees[k] * 0.9;
  }
  const piste = new Float32Array(fond.length);
  for (let i = 0; i < piste.length; i++) {
    const t = i / FREQUENCE;
    const v = fond[i] * volumeMusique(t, GENERIQUE, finDialogues, avecVoix) + effets[i];
    piste[i] = Math.tanh(v * 1.1) * 0.9;
  }
  return piste;
}

/** La piste en fichier WAV 16 bits, pour la vidéo. */
export function enWav(piste: Float32Array): Uint8Array {
  const octets = new Uint8Array(44 + piste.length * 2);
  const vue = new DataView(octets.buffer);
  const ecrire = (pos: number, texte: string) => [...texte].forEach((c, i) => vue.setUint8(pos + i, c.charCodeAt(0)));
  ecrire(0, 'RIFF');
  vue.setUint32(4, 36 + piste.length * 2, true);
  ecrire(8, 'WAVE');
  ecrire(12, 'fmt ');
  vue.setUint32(16, 16, true);
  vue.setUint16(20, 1, true);
  vue.setUint16(22, 1, true);
  vue.setUint32(24, FREQUENCE, true);
  vue.setUint32(28, FREQUENCE * 2, true);
  vue.setUint16(32, 2, true);
  vue.setUint16(34, 16, true);
  ecrire(36, 'data');
  vue.setUint32(40, piste.length * 2, true);
  for (let i = 0; i < piste.length; i++) vue.setInt16(44 + i * 2, Math.round(Math.max(-1, Math.min(1, piste[i])) * 32767), true);
  return octets;
}
