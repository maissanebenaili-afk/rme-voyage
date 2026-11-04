// La musique et les bruitages de Kalimat, fabriqués par le calcul : une petite
// mélodie originale avec une darbouka, et des bruitages (pop des bulles, petit
// « pling » quand un mot de darija s'écrit, boing, ding, fanfare de fin).
// Le son est calé sur le temps de l'épisode : le même sur le site et dans la vidéo.

import { DEBUT_ECRITURE, FIN, GENERIQUE, LETTRES_PAR_SECONDE, MOTS, dureeEpisode, dureePlan, morceaux, type Episode, type Langue } from './episodes';

export const FREQUENCE = 44100;

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12);

// Mélodie originale en ré majeur, 16 temps qui tournent en boucle : [note, durée en temps].
const TEMPS = 60 / 116;
const MELODIE: [number, number][] = [
  [74, 0.5], [76, 0.5], [78, 1], [81, 0.5], [78, 0.5], [76, 1],
  [74, 0.5], [76, 0.5], [78, 0.5], [81, 0.5], [83, 1], [81, 1],
  [79, 0.5], [78, 0.5], [76, 0.5], [74, 0.5], [76, 1], [78, 0.5], [76, 0.5],
  [74, 1], [69, 0.5], [71, 0.5], [74, 2],
];
const BASSES = [50, 55, 57, 50];

/** Un générateur pseudo-aléatoire stable, pour le bruit des percussions. */
function bruit(graine: number) {
  let x = graine >>> 0 || 1;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 2 ** 31 - 1;
  };
}

type Forme = 'sinus' | 'triangle' | 'carre';

function onde(forme: Forme, phase: number): number {
  const p = phase - Math.floor(phase);
  if (forme === 'sinus') return Math.sin(2 * Math.PI * p);
  if (forme === 'triangle') return 1 - 4 * Math.abs(p - 0.5);
  return p < 0.5 ? 0.6 : -0.6;
}

/** Ajoute une note dans la piste ; `frequence` peut varier avec le temps (glissando). */
function note(piste: Float32Array, debut: number, duree: number, frequence: (u: number) => number, forme: Forme, gain: number, attaque = 0.01, relache = 0.08) {
  const i0 = Math.max(0, Math.floor(debut * FREQUENCE));
  const n = Math.floor((duree + relache) * FREQUENCE);
  let phase = 0;
  for (let k = 0; k < n && i0 + k < piste.length; k++) {
    const s = k / FREQUENCE;
    const u = Math.min(1, s / duree);
    phase += frequence(u) / FREQUENCE;
    const enveloppe = s < attaque ? s / attaque : s < duree ? 1 - 0.3 * ((s - attaque) / Math.max(0.001, duree - attaque)) : 0.7 * Math.max(0, 1 - (s - duree) / relache);
    piste[i0 + k] += onde(forme, phase) * enveloppe * gain;
  }
}

function percussion(piste: Float32Array, debut: number, grave: boolean, alea: () => number) {
  const i0 = Math.floor(debut * FREQUENCE);
  if (grave) {
    // « dum » : un sinus grave qui descend
    note(piste, debut, 0.22, (u) => 130 - 70 * u, 'sinus', 0.45, 0.002, 0.05);
    return;
  }
  // « tek » : un petit bruit sec et aigu
  let avant = 0;
  const n = Math.floor(0.06 * FREQUENCE);
  for (let k = 0; k < n && i0 + k < piste.length; k++) {
    const b = alea();
    const aigu = b - avant;
    avant = b;
    piste[i0 + k] += aigu * 0.16 * (1 - k / n) ** 2;
  }
}

/** La musique de fond, sur toute la durée. */
function musique(duree: number): Float32Array {
  const piste = new Float32Array(Math.ceil(duree * FREQUENCE));
  const alea = bruit(7);
  const boucle = 16 * TEMPS;
  for (let debut = 0; debut < duree; debut += boucle) {
    let t = debut;
    for (const [n, d] of MELODIE) {
      if (t >= duree) break;
      note(piste, t, d * TEMPS * 0.9, () => hz(n) * (1 + 0.004 * Math.sin(t * 30)), 'triangle', 0.13);
      t += d * TEMPS;
    }
    BASSES.forEach((b, mesure) => {
      for (let temps = 0; temps < 4; temps++) {
        const tt = debut + (mesure * 4 + temps) * TEMPS;
        if (tt < duree) note(piste, tt, TEMPS * 0.8, () => hz(temps % 2 ? b + 7 : b), 'sinus', 0.16);
      }
      for (const [temps, grave] of [
        [0, true],
        [1, false],
        [1.5, false],
        [2, true],
        [3, false],
        [3.5, false],
      ] as const) {
        const tt = debut + (mesure * 4 + temps) * TEMPS;
        if (tt < duree) percussion(piste, tt, grave, alea);
      }
    });
  }
  return piste;
}

/** Les moments où la musique est plus forte (générique, mots du jour, fin) ou plus douce (dialogues). */
function volumeMusique(t: number, debutDialogues: number, finDialogues: number): number {
  const doux = 0.32;
  const fort = 0.85;
  const fondu = 0.4;
  if (t < debutDialogues - fondu) return fort;
  if (t < debutDialogues) return fort - ((t - (debutDialogues - fondu)) / fondu) * (fort - doux);
  if (t < finDialogues) return doux;
  if (t < finDialogues + fondu) return doux + ((t - finDialogues) / fondu) * (fort - doux);
  return fort;
}

/** La piste complète de l'épisode (mono, de -1 à 1). */
export function genererSon(ep: Episode, langue: Langue = 'fr'): Float32Array {
  const duree = dureeEpisode(ep, langue);
  const fond = musique(duree);
  const effets = new Float32Array(fond.length);
  const finDialogues = duree - MOTS - FIN;

  // whoosh d'ouverture et pop à chaque bulle
  note(effets, 0.05, 0.5, (u) => 300 + 900 * u, 'sinus', 0.12, 0.2, 0.2);
  let debut = GENERIQUE;
  ep.plans.forEach((plan, i) => {
    if (i === 0 || ep.plans[i - 1].decor !== plan.decor) note(effets, debut - 0.05, 0.35, (u) => 900 - 600 * u, 'sinus', 0.1, 0.1, 0.15);
    note(effets, debut + 0.04, 0.07, (u) => 520 + 600 * u, 'sinus', 0.32, 0.005, 0.05);
    if (plan.persos.some((q) => q.saut)) note(effets, debut + 0.1, 0.45, (u) => 260 + 260 * Math.sin(u * Math.PI) + 30 * Math.sin(u * 40), 'sinus', 0.3, 0.01, 0.1);
    // un petit « pling » quand chaque mot de darija finit de s'écrire
    let lettres = 0;
    for (const m of morceaux(plan.texte[langue])) {
      lettres += m.texte.length;
      if (m.fort) note(effets, debut + DEBUT_ECRITURE + lettres / LETTRES_PAR_SECONDE, 0.06, () => hz(93), 'sinus', 0.12, 0.003, 0.12);
    }
    debut += dureePlan(plan, langue);
  });
  // ding pour chaque mot du jour, fanfare de fin
  for (let i = 0; i < 3; i++) {
    const t = finDialogues + i * 3 + 0.55;
    note(effets, t, 0.5, () => hz(88), 'sinus', 0.22, 0.003, 0.6);
    note(effets, t, 0.5, () => hz(95), 'sinus', 0.1, 0.003, 0.6);
  }
  [74, 78, 81, 86].forEach((n, i) => note(effets, finDialogues + MOTS + 0.1 + i * 0.12, i === 3 ? 0.5 : 0.12, () => hz(n), 'carre', 0.12, 0.005, 0.15));

  const piste = new Float32Array(fond.length);
  for (let i = 0; i < piste.length; i++) {
    const t = i / FREQUENCE;
    const v = fond[i] * volumeMusique(t, GENERIQUE, finDialogues) + effets[i];
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
