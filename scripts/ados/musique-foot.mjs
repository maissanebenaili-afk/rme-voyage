// Musique de match de « Bouba et le grand stade » : un groove joyeux et entraînant
// (grosse caisse, claquement de mains, charleston, basse qui chante, petit
// motif qu'on retient), avec une ovation de foule quand le stade se lève.
// Composée ici, à la main : aucune mélodie reprise d'une œuvre existante.
const SR = 44100;
const TAU = Math.PI * 2;
const BPM = 108;

function bruit(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1; }

const NOTE = { C3: 130.81, G2: 98.0, A2: 110.0, F2: 87.31, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, C4: 261.63, E4: 329.63, G4: 392.0, A4: 440.0, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0 };
// Quatre mesures : do, sol, la mineur, fa.
const BASSE = ['C3', 'G2', 'A2', 'F2'];
const ACCORDS = [['C4', 'E4', 'G4'], ['G3', 'C4', 'E4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']];
// Le motif : [temps (en croches, 0 à 7), note] sur une mesure, répété avec de petites variantes.
const MOTIF = [
  [[0, 'E5'], [1, 'E5'], [2, 'G5'], [3, 'A5'], [4, 'G5'], [6, 'E5']],
  [[0, 'D5'], [1, 'D5'], [2, 'E5'], [3, 'G5'], [4, 'E5'], [6, 'D5']],
  [[0, 'C5'], [1, 'E5'], [2, 'E5'], [3, 'D5'], [4, 'C5'], [6, 'A4']],
  [[0, 'C5'], [2, 'D5'], [3, 'E5'], [4, 'G5'], [5, 'E5'], [6, 'D5']],
];

function intensiteA(points, t) {
  if (!points.length) return 0.5;
  if (t <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) if (t <= points[i][0]) { const [t0, a] = points[i - 1], [t1, b] = points[i]; return a + (b - a) * ((t - t0) / Math.max(0.001, t1 - t0)); }
  return points[points.length - 1][1];
}

export function composerFondFoot(total, points, impacts = [], ovations = []) {
  const len = Math.ceil(total * SR), buf = [new Float32Array(len), new Float32Array(len)], r = bruit(9), rb = bruit(31);
  const croche = 60 / BPM / 2, mesure = croche * 8;
  const add = (i, v, pan = 0) => { if (i >= 0 && i < len) { buf[0][i] += v * (1 - pan * 0.3); buf[1][i] += v * (1 + pan * 0.3); } };
  const kick = (t0, a) => { const i0 = Math.floor(t0 * SR), n = Math.floor(0.28 * SR); for (let j = 0; j < n; j++) { const f = 48 + 90 * Math.exp(-j / SR / 0.03); add(i0 + j, Math.sin((j / SR) * f * TAU) * Math.exp(-j / SR / 0.11) * a); } };
  const clap = (t0, a) => { const i0 = Math.floor(t0 * SR), n = Math.floor(0.16 * SR); let l = 0; for (let j = 0; j < n; j++) { const x = r(); l += (x - l) * 0.35; add(i0 + j, (x - l) * Math.exp(-j / SR / 0.05) * a, 0.2); } };
  const hat = (t0, a) => { const i0 = Math.floor(t0 * SR), n = Math.floor(0.05 * SR); let l = 0; for (let j = 0; j < n; j++) { const x = r(); l += (x - l) * 0.8; add(i0 + j, (x - l) * Math.exp(-j / SR / 0.012) * a, -0.3); } };
  const basse = (t0, f, d, a) => { const i0 = Math.floor(t0 * SR), n = Math.floor(d * SR); let lp = 0; for (let j = 0; j < n; j++) { const t = j / SR; const s = Math.sin(t * f * TAU) + 0.35 * (((t * f) % 1) * 2 - 1); lp += (s - lp) * 0.12; add(i0 + j, lp * Math.min(1, j / 200) * Math.exp(-t / (d * 0.9)) * a); } };
  const stab = (t0, f, a) => { const i0 = Math.floor(t0 * SR), n = Math.floor(0.14 * SR); let lp = 0; for (let j = 0; j < n; j++) { const t = j / SR; const s = Math.sign(Math.sin(t * f * TAU)) * 0.6 + (((t * f * 1.005) % 1) * 2 - 1) * 0.4; lp += (s - lp) * 0.2; add(i0 + j, lp * Math.exp(-t / 0.07) * a, 0.35); } };
  const lead = (t0, f, a) => { const i0 = Math.floor(t0 * SR), n = Math.floor(0.3 * SR); let lp = 0; for (let j = 0; j < n; j++) { const t = j / SR; const s = (((t * f) % 1) * 2 - 1) * 0.7 + Math.sin(t * f * 2 * TAU) * 0.3; lp += (s - lp) * 0.16; add(i0 + j, lp * Math.min(1, j / 150) * Math.exp(-t / 0.13) * a, -0.15); } };

  const mesures = Math.ceil(total / mesure);
  for (let m = 0; m < mesures; m++) {
    const t0 = m * mesure, inten = intensiteA(points, t0 + mesure / 2), acc = m % 4;
    const batterie = inten > 0.45 ? 1 : 0.0, plein = inten > 0.65 ? 1 : 0;
    for (let k = 0; k < 8; k++) {
      const t = t0 + k * croche;
      if (batterie) { if (k === 0 || k === 4 || (plein && k === 7)) kick(t, 0.7); if (k === 2 || k === 6) clap(t, 0.28 + 0.2 * plein); hat(t, 0.1 + 0.06 * inten); }
      else if (k % 2 === 0) hat(t, 0.08);
      if (k === 0 || k === 3 || k === 6) basse(t, NOTE[BASSE[acc]] * (k === 3 ? 2 : 1), croche * (k === 3 ? 1.5 : 2), 0.34);
      if (plein && (k === 2 || k === 5)) for (const n of ACCORDS[acc]) stab(t, NOTE[n], 0.07);
    }
    if (inten > 0.5) for (const [k, n] of MOTIF[acc]) lead(t0 + k * croche, NOTE[n], (0.13 + 0.12 * inten) * (m % 8 >= 4 ? 1.2 : 1));
  }
  // la foule : un souffle qui monte et descend
  let l1 = 0, l2 = 0;
  for (let i = 0; i < len; i++) { const x = rb(); l1 += (x - l1) * 0.05; l2 += (l1 - l2) * 0.1; const sw = 0.6 + 0.4 * Math.sin((i / SR) * 0.7); add(i, l2 * 0.35 * sw); }
  for (const at of ovations) { // ovation : un rugissement de 3 secondes
    const i0 = Math.floor(at * SR), n = Math.floor(3.2 * SR); let a = 0, b = 0;
    for (let j = 0; j < n && i0 + j < len; j++) { const x = rb(); a += (x - a) * 0.25; b += (a - b) * 0.4; const t = j / SR; add(i0 + j, b * 1.6 * Math.min(1, t / 0.25) * Math.exp(-Math.max(0, t - 1.2) / 0.9)); }
  }
  for (const at of impacts) { const i0 = Math.floor(at * SR); for (let j = 0; j < 0.5 * SR; j++) add(i0 + j, Math.sin((j / SR) * (60 - 25 * (j / (0.5 * SR))) * TAU) * Math.exp(-j / SR / 0.15) * 0.6); }
  const fi = Math.floor(0.5 * SR), fo = Math.floor(2 * SR);
  for (let c = 0; c < 2; c++) for (let i = 0; i < len; i++) { let g = 1; if (i < fi) g = i / fi; if (len - i < fo) g = Math.min(g, (len - i) / fo); buf[c][i] = Math.tanh(buf[c][i] * 1.3 * g); }
  return buf;
}
