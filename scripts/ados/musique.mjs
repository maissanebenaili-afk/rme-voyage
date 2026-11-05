// Musique originale du « Fil d'or » : un thème en ré hijaz (la seconde augmentée
// mi♭ → fa♯ donne la couleur orientale), joué à l'oud (corde pincée) puis doublé
// par des cordes en trémolo quand l'émotion monte. Composé ici, à la main :
// aucune mélodie reprise d'une œuvre existante.
import { writeFile } from 'node:fs/promises';

const SR = 44100;

const N = { D4: 293.66, Eb4: 311.13, Fs4: 369.99, G4: 392.0, A4: 440.0, Bb4: 466.16, C5: 523.25, D5: 587.33, Eb5: 622.25, Fs5: 739.99 };

// [note, durée en temps] : 8 mesures de 4 temps, puis 8 de réponse.
const THEME = [
  ['A4', 2], ['Bb4', 1], ['A4', 1], ['G4', 1.5], ['Fs4', 0.5], ['Eb4', 1], ['D4', 1], ['Eb4', 1], ['Fs4', 1], ['G4', 1], ['A4', 1], ['Bb4', 2], ['A4', 2],
  ['D5', 2], ['C5', 1], ['Bb4', 1], ['A4', 1.5], ['Bb4', 0.5], ['A4', 1], ['G4', 1], ['Fs4', 1], ['G4', 1], ['Eb4', 1], ['Fs4', 1], ['D4', 4],
];
// Accords de chaque mesure (fondamentale, tierce, quinte).
const ACCORDS = [
  [146.83, 174.61, 220.0], [155.56, 196.0, 233.08], [196.0, 233.08, 293.66], [110.0, 138.59, 164.81],
  [146.83, 174.61, 220.0], [196.0, 233.08, 293.66], [155.56, 196.0, 233.08], [110.0, 138.59, 164.81],
];

function bruit(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1; }

function pincer(buf, debut, freq, duree, amp, graine) {
  const n = Math.max(2, Math.round(SR / freq)), ligne = new Float32Array(n), r = bruit(graine);
  for (let i = 0; i < n; i++) ligne[i] = r() * (0.6 + 0.4 * Math.sin((i / n) * Math.PI));
  const fin = Math.min(buf[0].length, debut + Math.floor(duree * SR));
  let p = 0, prev = 0;
  for (let i = debut; i < fin; i++) {
    const v = ligne[p]; const suiv = (v + ligne[(p + 1) % n]) * 0.5 * 0.9965; ligne[p] = suiv; p = (p + 1) % n;
    prev += (v - prev) * 0.55; // adoucit : son d'oud, pas de guitare métallique
    const env = Math.min(1, (i - debut) / 120) * Math.exp(-(i - debut) / SR / (duree * 0.75));
    const o = prev * amp * env; buf[0][i] += o * 0.9; buf[1][i] += o * 1.0;
  }
}

function cordes(buf, debut, freq, duree, amp, tremolo, vibrato, pan = 0) {
  const fin = Math.min(buf[0].length, debut + Math.floor(duree * SR)); let lp = 0, lp2 = 0;
  const att = Math.min(1.1, duree * 0.4), rel = Math.min(1.4, duree * 0.5);
  for (let i = debut; i < fin; i++) {
    const t = (i - debut) / SR, vib = 1 + Math.sin(t * 5.4) * 0.0035 * vibrato;
    let s = 0; for (const d of [-0.004, 0, 0.0045]) { const ph = (t * freq * vib * (1 + d)) % 1; s += ph * 2 - 1; }
    lp += (s - lp) * 0.07; lp2 += (lp - lp2) * 0.12;
    const env = Math.min(1, t / att) * Math.min(1, (duree - t) / rel);
    const trem = 1 - tremolo * (0.5 + 0.5 * Math.sin(t * 6.8 * TAU_));
    const o = lp2 * amp * env * trem; buf[0][i] += o * (1 - pan * 0.4); buf[1][i] += o * (1 + pan * 0.4);
  }
}
const TAU_ = Math.PI * 2;

function grave(buf, debut, freq, duree, amp) {
  const fin = Math.min(buf[0].length, debut + Math.floor(duree * SR));
  for (let i = debut; i < fin; i++) { const t = (i - debut) / SR, env = Math.min(1, t / 0.3) * Math.min(1, (duree - t) / 0.6); const o = Math.sin(t * freq * TAU_) * amp * env; buf[0][i] += o; buf[1][i] += o; }
}

/** intensité 0..1 à l'instant t, interpolée entre les plans. */
function intensiteA(points, t) {
  if (!points.length) return 0.5;
  if (t <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) if (t <= points[i][0]) { const [t0, a] = points[i - 1], [t1, b] = points[i]; return a + (b - a) * ((t - t0) / Math.max(0.001, t1 - t0)); }
  return points[points.length - 1][1];
}

export function composerFond(total, points, pluie = []) {
  const len = Math.ceil(total * SR), buf = [new Float32Array(len), new Float32Array(len)];
  const temps = 60 / 66; let t = 0, tour = 0, graine = 11;
  // oud : le thème, en boucle
  while (t < total) {
    let pos = 0;
    for (const [nom, d] of THEME) {
      const deb = t + pos * temps; if (deb >= total) break;
      const inten = intensiteA(points, deb);
      pincer(buf, Math.floor(deb * SR), N[nom] * (tour % 2 && inten > 0.65 ? 2 : 1), d * temps * 1.5, 0.34, graine++);
      if (inten > 0.55) cordes(buf, Math.floor(deb * SR), N[nom] * (tour % 2 ? 1 : 2), d * temps * 1.05, 0.12 * (inten - 0.4), 0.35 + 0.5 * inten, 1, 0.5);
      pos += d;
    }
    // accords : une mesure = 4 temps
    for (let m = 0; m < 8; m++) {
      const deb = t + m * 4 * temps; if (deb >= total) break;
      const inten = intensiteA(points, deb);
      const [a, b, c] = ACCORDS[m];
      for (const [f, g] of [[a, 1], [b, 0.8], [c, 0.8]]) cordes(buf, Math.floor(deb * SR), f, 4.4 * temps, 0.1 * g * (0.5 + inten), 0.15 + 0.7 * inten, 0.6, -0.4);
      grave(buf, Math.floor(deb * SR), a / 2, 3.6 * temps, 0.11 * (0.4 + inten));
    }
    t += 32 * temps; tour++;
  }
  // souffle de la pièce + pluie
  const r = bruit(5); let lp = 0, lp2 = 0, plu = 0;
  for (let i = 0; i < len; i++) {
    const x = r(); lp += (x - lp) * 0.02; lp2 += (lp - lp2) * 0.05;
    const sec = i / SR; const p = pluie.some(([a, b]) => sec >= a - 0.4 && sec <= b + 0.4) ? 1 : 0; plu += (p - plu) * 0.0004;
    const pluieBruit = (x - lp) * 0.022 * plu;
    buf[0][i] += lp2 * 0.16 + pluieBruit; buf[1][i] += lp2 * 0.16 + pluieBruit * 0.9;
  }
  // fondu d'entrée et de sortie, limite douce
  const fi = Math.floor(0.8 * SR), fo = Math.floor(2.2 * SR);
  for (let c = 0; c < 2; c++) for (let i = 0; i < len; i++) {
    let g = 1; if (i < fi) g = i / fi; if (len - i < fo) g = Math.min(g, (len - i) / fo);
    buf[c][i] = Math.tanh(buf[c][i] * 1.4 * g);
  }
  return buf;
}

export async function ecrireWav(chemin, buf) {
  const len = buf[0].length, data = Buffer.alloc(44 + len * 4);
  data.write('RIFF', 0); data.writeUInt32LE(36 + len * 4, 4); data.write('WAVEfmt ', 8); data.writeUInt32LE(16, 16); data.writeUInt16LE(1, 20); data.writeUInt16LE(2, 22);
  data.writeUInt32LE(SR, 24); data.writeUInt32LE(SR * 4, 28); data.writeUInt16LE(4, 32); data.writeUInt16LE(16, 34); data.write('data', 36); data.writeUInt32LE(len * 4, 40);
  for (let i = 0; i < len; i++) { data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[0][i])) * 32000), 44 + i * 4); data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[1][i])) * 32000), 46 + i * 4); }
  await writeFile(chemin, data);
}
