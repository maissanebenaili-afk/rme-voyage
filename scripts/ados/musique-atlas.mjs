// Musique de « Les Larmes de l'Atlas » : composée ici, de A à Z. Aucune mélodie reprise d'une
// œuvre existante, aucun échantillon, aucune musique générée par un service tiers : pas de
// question de licence. Instruments synthétisés : piano, harpe, cordes (avec trémolo), flûte,
// petit tambour (bendir) pour la couleur marocaine.
//
// Six thèmes récurrents : nour (l'héroïne), famille, separation, mystere, espoir, retrouvailles.
// Chaque plan de l'histoire en nomme un ; la musique passe de l'un à l'autre en fondu.
const SR = 44100;
const TAU = Math.PI * 2;
const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);

function bruit(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1; }

// Un thème = 4 mesures de 4 temps. `acc` : l'accord de chaque mesure (notes MIDI).
// `mel` : la mélodie, par mesure, en [temps, note MIDI, durée en temps].
export const THEMES = {
  nour: { bpm: 84, acc: [[48, 55, 60, 64], [45, 52, 57, 60], [53, 57, 60, 65], [43, 50, 55, 59]],
    mel: [[[0, 72, 1], [1, 76, 1], [2, 79, 1.5], [3.5, 76, 0.5]], [[0, 72, 1], [1, 76, 1], [2, 81, 2]], [[0, 77, 1], [1, 76, 1], [2, 74, 1], [3, 72, 1]], [[0, 71, 1], [1, 74, 1], [2, 79, 2]]] },
  famille: { bpm: 72, acc: [[43, 55, 59, 62], [48, 55, 60, 64], [50, 57, 62, 66], [43, 55, 59, 62]],
    mel: [[[0, 67, 1.5], [1.5, 71, 0.5], [2, 74, 2]], [[0, 72, 1], [1, 71, 1], [2, 67, 2]], [[0, 69, 1], [1, 74, 1], [2, 78, 2]], [[0, 74, 1.5], [1.5, 71, 0.5], [2, 67, 2]]] },
  separation: { bpm: 60, acc: [[45, 52, 57, 60], [41, 48, 53, 57], [48, 55, 60, 64], [40, 47, 52, 56]],
    mel: [[[0, 69, 2], [2, 72, 1], [3, 71, 1]], [[0, 69, 1.5], [1.5, 65, 0.5], [2, 67, 2]], [[0, 72, 1], [1, 76, 1], [2, 74, 2]], [[0, 71, 2], [2, 68, 2]]] },
  mystere: { bpm: 56, acc: [[50, 57, 62, 65], [46, 53, 58, 62], [45, 52, 57, 61], [50, 57, 62, 65]],
    mel: [[[1, 74, 1], [3, 77, 1]], [[0, 76, 1.5], [2.5, 74, 1.5]], [[1, 72, 1], [3, 69, 1]], [[0, 74, 3]]] },
  espoir: { bpm: 78, acc: [[41, 53, 57, 60], [48, 55, 60, 64], [46, 53, 58, 62], [41, 53, 57, 60]],
    mel: [[[0, 72, 1], [1, 77, 1], [2, 81, 2]], [[0, 79, 1], [1, 76, 1], [2, 72, 2]], [[0, 74, 1], [1, 79, 1], [2, 82, 2]], [[0, 81, 1.5], [1.5, 79, 0.5], [2, 77, 2]]] },
  retrouvailles: { bpm: 80, acc: [[48, 55, 60, 64], [43, 55, 59, 62], [45, 52, 57, 60], [53, 57, 60, 65]],
    mel: [[[0, 79, 1], [1, 84, 1], [2, 83, 1], [3, 79, 1]], [[0, 81, 2], [2, 79, 1], [3, 76, 1]], [[0, 77, 1], [1, 81, 1], [2, 84, 2]], [[0, 83, 1], [1, 81, 1], [2, 84, 2]]] },
};

function entreeA(themes, t) {
  for (const e of themes) if (t >= e[0] && t < e[1]) return e;
  return themes.length ? themes[themes.length - 1] : [0, 1, 'famille', 'neutre'];
}
const themeA = (themes, t) => entreeA(themes, t)[2];

// Chaque émotion a sa couleur sonore (le principe des grandes bandes originales de feuilletons :
// une même mélodie ne sonne pas pareil quand on rit, qu'on pleure ou qu'on a peur).
export const PROFILS = {
  neutre: { tempo: 1, cordes: 1, trem: 1, harpe: 0, flute: 1, perc: 1, violon: 0, guitare: 0, drone: 0, coeur: 0, ostinato: 0 },
  joie: { tempo: 1.1, cordes: 0.5, trem: 0, harpe: 1, flute: 1, perc: 1.3, violon: 0, guitare: 1, drone: 0, coeur: 0, ostinato: 0 },
  tendre: { tempo: 0.94, cordes: 0.8, trem: 0.2, harpe: 0.4, flute: 1, perc: 0, violon: 0.6, guitare: 0.6, drone: 0, coeur: 0, ostinato: 0 },
  triste: { tempo: 0.85, cordes: 1.2, trem: 1.1, harpe: 0, flute: 0, perc: 0, violon: 1, guitare: 0, drone: 0, coeur: 0, ostinato: 0 },
  pleure: { tempo: 0.8, cordes: 1.3, trem: 1.4, harpe: 0, flute: 0, perc: 0, violon: 1.2, guitare: 0, drone: 0, coeur: 0, ostinato: 0 },
  peur: { tempo: 0.92, cordes: 0.6, trem: 1.2, harpe: 0, flute: 0, perc: 0, violon: 0, guitare: 0, drone: 1, coeur: 1, ostinato: 0 },
  surprise: { tempo: 1, cordes: 0.7, trem: 0.8, harpe: 0.6, flute: 0, perc: 0, violon: 0, guitare: 0, drone: 0.5, coeur: 0.5, ostinato: 0 },
  colere: { tempo: 1.06, cordes: 1.2, trem: 0.6, harpe: 0, flute: 0, perc: 1.8, violon: 0, guitare: 0, drone: 0.6, coeur: 0, ostinato: 1 },
  froid: { tempo: 0.95, cordes: 0.7, trem: 0.3, harpe: 0.3, flute: 0.6, perc: 0, violon: 0, guitare: 0, drone: 0.4, coeur: 0, ostinato: 0 },
  malade: { tempo: 0.82, cordes: 0.9, trem: 0.9, harpe: 0, flute: 0, perc: 0, violon: 0.8, guitare: 0, drone: 0.2, coeur: 0.4, ostinato: 0 },
};

function intensiteA(points, t) {
  if (!points.length) return 0.5;
  if (t <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) if (t <= points[i][0]) { const [t0, a] = points[i - 1], [t1, b] = points[i]; return a + (b - a) * ((t - t0) / Math.max(0.001, t1 - t0)); }
  return points[points.length - 1][1];
}

/** @param themes [[début s, fin s, nom du thème, émotion]], points [[temps, intensité 0..1]] */
export function composerFondAtlas(total, points, impacts = [], themes = []) {
  const len = Math.ceil(total * SR), buf = [new Float32Array(len), new Float32Array(len)], r = bruit(11);
  const add = (i, v, pan = 0) => { if (i >= 0 && i < len) { buf[0][i] += v * (1 - pan * 0.3); buf[1][i] += v * (1 + pan * 0.3); } };

  // piano : harmoniques qui s'éteignent à des vitesses différentes + petit toc du marteau
  const piano = (t0, f, d, a) => {
    const i0 = Math.floor(t0 * SR), n = Math.floor((d + 1.2) * SR);
    for (let j = 0; j < n; j++) {
      const t = j / SR; let s = 0;
      for (let h = 1; h <= 5; h++) s += Math.sin(t * f * h * TAU * (1 + 0.0004 * h * h)) * Math.exp(-t * (1.6 + h * 1.5) / Math.max(0.6, d)) / (h * 0.9);
      s += t < 0.012 ? r() * 0.25 : 0;
      add(i0 + j, s * Math.min(1, j / 90) * a, -0.15);
    }
  };
  // harpe : plus brillante, plus brève
  const harpe = (t0, f, a) => { const i0 = Math.floor(t0 * SR), n = Math.floor(1.6 * SR); for (let j = 0; j < n; j++) { const t = j / SR; add(i0 + j, (Math.sin(t * f * TAU) + 0.5 * Math.sin(t * f * 2 * TAU) * Math.exp(-t * 6)) * Math.exp(-t * 3.2) * Math.min(1, j / 40) * a, 0.35); } };
  // cordes : accord tenu, scie adoucie, trémolo qui s'accélère avec l'intensité
  const cordes = (t0, notes, d, a, trem) => {
    const i0 = Math.floor(t0 * SR), n = Math.floor((d + 0.5) * SR); let lp = 0;
    for (let j = 0; j < n; j++) {
      const t = j / SR; let s = 0;
      for (const m of notes) { const f = hz(m); s += (((t * f) % 1) * 2 - 1) * 0.5 + (((t * f * 1.004) % 1) * 2 - 1) * 0.5; }
      lp += (s / notes.length - lp) * 0.07;
      const env = Math.min(1, t / 0.5) * Math.min(1, (d + 0.5 - t) / 0.6), tr = 1 - trem * (0.5 + 0.5 * Math.sin(t * (9 + 7 * trem) * TAU));
      add(i0 + j, lp * env * tr * a, 0);
    }
  };
  // flûte : sinus + souffle + vibrato qui s'installe
  const flute = (t0, f, d, a) => {
    const i0 = Math.floor(t0 * SR), n = Math.floor((d + 0.15) * SR);
    for (let j = 0; j < n; j++) {
      const t = j / SR, vib = Math.sin(t * 5.2 * TAU) * Math.min(1, t / 0.5) * 0.004, ph = t * f * (1 + vib) * TAU;
      const env = Math.min(1, t / 0.07) * Math.min(1, (d + 0.15 - t) / 0.12);
      add(i0 + j, (Math.sin(ph) + 0.18 * Math.sin(2 * ph) + r() * 0.025) * env * a, 0.25);
    }
  };
  // bendir : tambour sur cadre, grave et doux
  const bendir = (t0, a, aigu = false) => { const i0 = Math.floor(t0 * SR), n = Math.floor(0.22 * SR); for (let j = 0; j < n; j++) { const t = j / SR, f = aigu ? 190 : 86 - 24 * Math.min(1, t / 0.1); add(i0 + j, (Math.sin(t * f * TAU) + 0.35 * r() * Math.exp(-t * 30)) * Math.exp(-t * (aigu ? 28 : 16)) * a, -0.2); } };

  // violon : archet qui prend son temps, vibrato qui s'installe (la voix de la tristesse et de la nostalgie)
  const violon = (t0, f, d, a) => {
    const i0 = Math.floor(t0 * SR), n = Math.floor((d + 0.25) * SR); let lp = 0;
    for (let j = 0; j < n; j++) {
      const t = j / SR, vib = Math.sin(t * 5.6 * TAU) * Math.min(1, t / 0.6) * 0.006, ph = (t * f * (1 + vib)) % 1;
      lp += ((ph * 2 - 1) * 0.8 + Math.sin(ph * TAU * 2) * 0.2 - lp) * 0.09;
      add(i0 + j, lp * Math.min(1, t / 0.12) * Math.min(1, (d + 0.25 - t) / 0.25) * a, -0.1);
    }
  };
  // guitare : corde pincée (Karplus-Strong), la chaleur d'un feuilleton de campagne et de famille
  const guitare = (t0, f, a) => {
    const N = Math.max(2, Math.round(SR / f)), ligne = new Float32Array(N), i0 = Math.floor(t0 * SR), n = Math.floor(1.4 * SR);
    for (let i = 0; i < N; i++) ligne[i] = r();
    for (let j = 0; j < n; j++) { const k = j % N, x = ligne[k]; ligne[k] = 0.5 * (x + ligne[(k + 1) % N]) * 0.997; add(i0 + j, x * Math.exp(-j / SR / 1.1) * Math.min(1, j / 30) * a, 0.2); }
  };
  // bourdon grave (la peur) : deux notes qui se frottent
  const drone = (t0, d, a) => { const i0 = Math.floor(t0 * SR), n = Math.floor((d + 0.6) * SR); let lp = 0; for (let j = 0; j < n; j++) { const t = j / SR, s = (((t * 55) % 1) * 2 - 1) + (((t * 77.8) % 1) * 2 - 1); lp += (s - lp) * 0.02; add(i0 + j, lp * Math.min(1, t / 0.9) * Math.min(1, (d + 0.6 - t) / 0.6) * a, 0); } };
  // cœur qui bat : deux coups sourds
  const coeur = (t0, a) => { for (const dt of [0, 0.22]) { const i0 = Math.floor((t0 + dt) * SR); for (let j = 0; j < 0.18 * SR; j++) add(i0 + j, Math.sin((j / SR) * (62 - 18 * (j / (0.18 * SR))) * TAU) * Math.exp(-j / SR / 0.06) * a * (dt ? 0.7 : 1)); } };
  // petit éclat aigu (la surprise, l'indice)
  const eclat = (t0, f, a) => { const i0 = Math.floor(t0 * SR); for (let j = 0; j < 1.2 * SR; j++) { const t = j / SR; add(i0 + j, (Math.sin(t * f * TAU) + 0.4 * Math.sin(t * f * 2.76 * TAU)) * Math.exp(-t * 4.5) * a, 0.3); } };

  let courant = null, dernierePlage = -1;
  for (let tm = 0; tm < total; ) {
    const entree = entreeA(themes, tm + 0.01), nom = entree[2], emo = entree[3] || 'neutre', P = PROFILS[emo] || PROFILS.neutre;
    const th = THEMES[nom] || THEMES.famille, beat = 60 / (th.bpm * P.tempo), mesure = beat * 4;
    const inten = intensiteA(points, tm + mesure / 2), reprise = courant !== nom; courant = nom;
    // un éclat quand une nouvelle plage commence sur la surprise ou la peur
    if (entree[0] !== dernierePlage) { dernierePlage = entree[0]; if (emo === 'surprise') { eclat(entree[0] + 0.05, 1568, 0.16); eclat(entree[0] + 0.18, 2093, 0.1); } }
    for (let m = 0; m < 4 && tm < total; m++, tm += mesure) {
      if (entreeA(themes, tm + 0.01)[0] !== entree[0] && m > 0) break; // la plage change : on repart sur la nouvelle
      const acc = th.acc[m];
      // main gauche : piano, ou harpe quand la joie ou l'élan monte
      acc.forEach((n, k) => { const t0 = tm + k * beat, enHarpe = P.harpe > 0.5 || (inten > 0.6 && k % 2) || (P.harpe > 0 && k % 2); (enHarpe ? harpe : piano)(t0, hz(n - (k === 0 ? 12 : 0)), beat * 1.6, 0.16 + 0.05 * inten); });
      // guitare qui accompagne (joie, tendresse) : arpège doux
      if (P.guitare > 0) acc.forEach((n, k) => guitare(tm + (k + 0.5) * beat, hz(n + 12), 0.1 * P.guitare));
      // mélodie : au violon quand on pleure, à la flûte quand on est tendre, au piano sinon
      for (const [b, n, d] of th.mel[m]) {
        piano(tm + b * beat, hz(n), d * beat, (0.22 + 0.1 * inten) * (P.violon > 0.9 ? 0.55 : 1));
        if (P.violon > 0 && inten > 0.3) violon(tm + b * beat, hz(n), d * beat, 0.12 * P.violon);
      }
      // cordes sous la mélodie, trémolo selon l'émotion
      if (inten > 0.4 || P.cordes > 1) cordes(tm, acc.map((n) => n + 12), mesure, (0.1 + 0.12 * inten) * P.cordes, Math.min(1, Math.max(0, inten - 0.35) * P.trem));
      // flûte qui double la mélodie : espoir, retrouvailles, mystère, tendresse
      if (P.flute > 0 && inten > 0.4 && (nom === 'espoir' || nom === 'retrouvailles' || nom === 'mystere' || emo === 'tendre' || emo === 'joie') && m % 2 === 1) for (const [b, n, d] of th.mel[m]) flute(tm + b * beat, hz(n + (nom === 'mystere' ? -12 : emo === 'joie' ? 12 : 0)), d * beat, 0.11 * P.flute);
      // petit tambour : joie, colère ; très doux sinon
      if (P.perc > 0 && inten > 0.3) { bendir(tm, 0.18 * P.perc); bendir(tm + beat * 2, 0.14 * P.perc); bendir(tm + beat * 3.5, 0.08 * P.perc, true); }
      // peur : bourdon et cœur qui bat ; colère : cordes graves qui martèlent
      if (P.drone > 0) drone(tm, mesure, 0.07 * P.drone);
      if (P.coeur > 0) coeur(tm + beat * 0.5, 0.2 * P.coeur), coeur(tm + beat * 2.5, 0.2 * P.coeur);
      if (P.ostinato > 0) for (let k = 0; k < 8; k++) piano(tm + k * beat / 2, hz(acc[0] - 12), beat * 0.5, 0.2);
      if (reprise && m === 0) cordes(tm, [acc[0] + 12, acc[2] + 12], mesure, 0.06, 0);
    }
  }
  for (const at of impacts) { const i0 = Math.floor(at * SR); for (let j = 0; j < 0.7 * SR; j++) add(i0 + j, Math.sin((j / SR) * (55 - 20 * (j / (0.7 * SR))) * TAU) * Math.exp(-j / SR / 0.2) * 0.5); }
  // un peu de salle, puis fondu d'entrée et de sortie
  const retard = Math.floor(0.073 * SR);
  for (let c = 0; c < 2; c++) for (let i = len - 1; i >= retard; i--) buf[c][i] += buf[c][i - retard] * 0.22;
  // on ramène la crête à un niveau où la saturation douce ne déforme pas la musique
  let crete = 0; for (let c = 0; c < 2; c++) for (let i = 0; i < len; i++) crete = Math.max(crete, Math.abs(buf[c][i]));
  const echelle = crete > 0 ? 1.0 / crete : 1;
  const fi = Math.floor(0.8 * SR), fo = Math.floor(2.5 * SR);
  for (let c = 0; c < 2; c++) for (let i = 0; i < len; i++) { let g = 1; if (i < fi) g = i / fi; if (len - i < fo) g = Math.min(g, (len - i) / fo); buf[c][i] = Math.tanh(buf[c][i] * echelle * 1.2 * g) * 0.6; } // 0,6 : la musique accompagne, elle ne couvre pas les voix
  return buf;
}
