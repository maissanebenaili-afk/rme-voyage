// Le dessin des épisodes Kalimat sur un canvas 1080 × 1920 (format vertical).
// Tout est calculé à partir du temps `t` : la même image sort toujours au même
// instant, ce qui permet de jouer l'épisode sur le site et d'exporter la vidéo.
// Personnages originaux, style « anime » : grosse tête, grands yeux brillants.

import {
  NOMS,
  lignes,
  momentA,
  type DecorId,
  type Episode,
  type Humeur,
  type ObjetId,
  type PersoId,
  type Placement,
  type Tenu,
} from './episodes';

export const LARGEUR = 1080;
export const HAUTEUR = 1920;
const SOL = 1470;
const ENCRE = '#1d1630';
const DARIJA = '#d9480f';

type Ctx = CanvasRenderingContext2D;

// --- Outils -------------------------------------------------------------------

function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number, couleur: string, trait = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
  ctx.fillStyle = couleur;
  ctx.fill();
  if (trait) {
    ctx.lineWidth = trait;
    ctx.strokeStyle = ENCRE;
    ctx.stroke();
  }
}

function rectRond(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function remplir(ctx: Ctx, couleur: string, trait = 0) {
  ctx.fillStyle = couleur;
  ctx.fill();
  if (trait) {
    ctx.lineWidth = trait;
    ctx.strokeStyle = ENCRE;
    ctx.stroke();
  }
}

function trait(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, couleur: string, epaisseur: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.strokeStyle = couleur;
  ctx.lineWidth = epaisseur;
  ctx.lineCap = 'round';
  ctx.stroke();
}

const borne = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const doux = (v: number) => (v < 0.5 ? 2 * v * v : 1 - (-2 * v + 2) ** 2 / 2);
/** Petit rebond à l'apparition (0 → 1). */
const rebond = (v: number) => {
  const x = borne(v, 0, 1);
  return 1 + 2.2 * (x - 1) ** 3 + 1.2 * (x - 1) ** 2;
};
/** Nombre pseudo-aléatoire stable (0 à 1) : mêmes confettis à chaque lecture. */
const hasard = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// --- Les personnages ------------------------------------------------------------

type Coiffure = 'boucles' | 'court' | 'casquette' | 'tresses' | 'foulard' | 'taguia';

interface Look {
  peau: string;
  cheveux: string;
  coiffure: Coiffure;
  haut: string;
  bas: string;
  chaussures: string;
  taille: number;
  /** Couleur de l'étiquette du nom dans la bulle. */
  accent: string;
  robe?: boolean;
  lunettes?: boolean;
  barbe?: boolean;
  sac?: string;
  yeux?: string;
}

const LOOKS: Record<Exclude<PersoId, 'mchicha'>, Look> = {
  ines: { peau: '#eab38a', cheveux: '#3b2417', coiffure: 'boucles', haut: '#ff7a59', bas: '#3d5a99', chaussures: '#ffffff', taille: 0.95, accent: '#e8590c', sac: '#ffc93c' },
  adam: { peau: '#e2a67b', cheveux: '#4a2c1a', coiffure: 'casquette', haut: '#2a9d8f', bas: '#264653', chaussures: '#e63946', taille: 0.82, accent: '#1a7f74' },
  yassine: { peau: '#c98b5e', cheveux: '#1b1b1b', coiffure: 'court', haut: '#3a86ff', bas: '#c9935f', chaussures: '#f1f1f1', taille: 1, accent: '#2563eb' },
  nour: { peau: '#d9a27a', cheveux: '#2e1a10', coiffure: 'tresses', haut: '#7b2cbf', bas: '#1d3557', chaussures: '#ffffff', taille: 1.04, accent: '#7b2cbf', yeux: '#6b4423' },
  mima: { peau: '#c68e63', cheveux: '#2d6a4f', coiffure: 'foulard', haut: '#b5523b', bas: '#b5523b', chaussures: '#6d3b2a', taille: 1.16, accent: '#2d6a4f', robe: true, lunettes: true },
  marchand: { peau: '#b07850', cheveux: '#5c5c5c', coiffure: 'taguia', haut: '#457b9d', bas: '#457b9d', chaussures: '#4a3426', taille: 1.18, accent: '#1d4e89', robe: true, barbe: true },
};

const DECALAGE: Record<PersoId, number> = { ines: 0.3, adam: 1.7, yassine: 2.4, nour: 0.9, mima: 3.1, mchicha: 1.2, marchand: 2.0 };

interface Etat {
  t: number;
  parle: boolean;
  humeur: Humeur;
  /** -1 regarde à gauche, 1 à droite, 0 en face. */
  regard: number;
  marche: boolean;
  salut: boolean;
  tient?: Tenu;
}

function yeux(ctx: Ctx, look: Look, etat: Etat, id: PersoId) {
  const cycle = (etat.t + DECALAGE[id]) % 3.7;
  const ferme = cycle < 0.13;
  const dx = etat.regard * 7;
  for (const cote of [-1, 1]) {
    const x = cote * 44;
    const y = -440;
    if (ferme) {
      ctx.beginPath();
      ctx.arc(x, y - 4, 22, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.strokeStyle = ENCRE;
      ctx.lineWidth = 6;
      ctx.stroke();
      continue;
    }
    const surpris = etat.humeur === 'surpris' ? 1.12 : 1;
    ellipse(ctx, x, y, 25 * surpris, 33 * surpris, '#ffffff');
    ellipse(ctx, x + dx, y + 3, 19 * surpris, 27 * surpris, look.yeux ?? '#3a2414');
    ellipse(ctx, x + dx, y + 12, 13 * surpris, 13 * surpris, '#7a4b2a');
    ellipse(ctx, x + dx, y + 4, 8, 10, '#120c08');
    ellipse(ctx, x + dx - 7, y - 9, 8, 8, '#ffffff');
    ellipse(ctx, x + dx + 7, y + 14, 4, 4, '#ffffff');
    // cils
    ctx.beginPath();
    ctx.ellipse(x, y, 26 * surpris, 34 * surpris, 0, 1.08 * Math.PI, 1.92 * Math.PI);
    ctx.strokeStyle = ENCRE;
    ctx.lineWidth = 7;
    ctx.stroke();
  }
  // sourcils
  for (const cote of [-1, 1]) {
    const leve = etat.humeur === 'surpris' ? -14 : 0;
    const penche = etat.humeur === 'inquiet' ? 10 : 0;
    ctx.beginPath();
    ctx.moveTo(cote * 64, -488 + leve + penche * 0.2);
    ctx.quadraticCurveTo(cote * 46, -498 + leve, cote * 26, -490 + leve - penche);
    ctx.strokeStyle = look.coiffure === 'foulard' ? '#3b2a20' : look.cheveux;
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
  if (look.lunettes) {
    for (const cote of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cote * 44, -440, 38, 0, Math.PI * 2);
      ctx.strokeStyle = '#7a4a24';
      ctx.lineWidth = 5;
      ctx.stroke();
    }
    trait(ctx, -6, -444, 6, -444, '#7a4a24', 5);
  }
}

function bouche(ctx: Ctx, etat: Etat, decalage: number) {
  const y = -385;
  if (etat.parle) {
    const ouvert = 0.5 + 0.5 * Math.sin(etat.t * 15 + decalage);
    ctx.beginPath();
    ctx.ellipse(0, y, 19, 5 + 15 * ouvert, 0, 0, Math.PI * 2);
    remplir(ctx, '#7a1f2b', 4);
    ellipse(ctx, 0, y + 4 + 6 * ouvert, 10, 3 + 5 * ouvert, '#ff8fa3');
    return;
  }
  ctx.beginPath();
  if (etat.humeur === 'surpris') {
    ctx.ellipse(0, y, 9, 12, 0, 0, Math.PI * 2);
    remplir(ctx, '#7a1f2b', 4);
    return;
  }
  if (etat.humeur === 'inquiet') {
    ctx.moveTo(-16, y + 6);
    ctx.quadraticCurveTo(0, y - 6, 16, y + 6);
  } else {
    ctx.arc(0, y - 12, 22, 0.18 * Math.PI, 0.82 * Math.PI);
  }
  ctx.strokeStyle = ENCRE;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function cheveuxArriere(ctx: Ctx, look: Look) {
  if (look.coiffure === 'boucles') {
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (0.82 + (i / 12) * 1.36);
      ellipse(ctx, Math.cos(a) * 118, -450 + Math.sin(a) * 118, 52, 52, look.cheveux);
    }
    for (const cote of [-1, 1]) {
      ellipse(ctx, cote * 122, -360, 48, 52, look.cheveux);
      ellipse(ctx, cote * 112, -305, 40, 44, look.cheveux);
    }
  } else if (look.coiffure === 'tresses') {
    for (const cote of [-1, 1]) {
      for (let i = 0; i < 6; i++) ellipse(ctx, cote * (108 + i * 3), -400 + i * 34, 21, 25, look.cheveux, 4);
      ellipse(ctx, cote * 126, -192, 16, 12, '#ff9f1c', 4);
    }
  } else if (look.coiffure === 'foulard') {
    ctx.beginPath();
    ctx.moveTo(-150, -300);
    ctx.quadraticCurveTo(-175, -460, -120, -545);
    ctx.quadraticCurveTo(0, -630, 120, -545);
    ctx.quadraticCurveTo(175, -460, 150, -300);
    ctx.quadraticCurveTo(0, -270, -150, -300);
    remplir(ctx, look.cheveux, 6);
  }
}

function cheveuxAvant(ctx: Ctx, look: Look, regard: number) {
  const c = look.cheveux;
  switch (look.coiffure) {
    case 'boucles':
      for (let i = 0; i < 5; i++) ellipse(ctx, -84 + i * 42, -548 + (i % 2) * 8, 36, 34, c);
      break;
    case 'court':
    case 'tresses': {
      ctx.beginPath();
      ctx.arc(0, -452, 126, Math.PI * 1.02, Math.PI * 1.98);
      if (look.coiffure === 'court') {
        for (let i = 0; i <= 6; i++) ctx.lineTo(124 - i * 41, -510 + (i % 2 === 0 ? 0 : 26));
      } else {
        ctx.quadraticCurveTo(60, -540, 0, -560);
        ctx.quadraticCurveTo(-60, -540, -124, -480);
      }
      ctx.closePath();
      remplir(ctx, c, 6);
      break;
    }
    case 'casquette': {
      ellipse(ctx, -110, -430, 22, 34, c);
      ellipse(ctx, 110, -430, 22, 34, c);
      ctx.beginPath();
      ctx.arc(0, -478, 124, Math.PI, Math.PI * 2);
      ctx.closePath();
      remplir(ctx, '#e63946', 6);
      ctx.beginPath();
      ctx.ellipse((regard || 1) * 92, -484, 96, 24, 0, 0, Math.PI * 2);
      remplir(ctx, '#b81d2a', 6);
      ellipse(ctx, 0, -602, 14, 9, '#b81d2a');
      break;
    }
    case 'foulard':
      ctx.beginPath();
      ctx.ellipse(0, -452, 112, 124, 0, Math.PI * 1.05, Math.PI * 1.95);
      ctx.strokeStyle = '#40916c';
      ctx.lineWidth = 26;
      ctx.stroke();
      break;
    case 'taguia':
      ellipse(ctx, -112, -440, 18, 36, c);
      ellipse(ctx, 112, -440, 18, 36, c);
      ctx.beginPath();
      ctx.arc(0, -505, 104, Math.PI, Math.PI * 2);
      ctx.closePath();
      remplir(ctx, '#fdfaf2', 6);
      for (let i = 0; i < 7; i++) ellipse(ctx, -78 + i * 26, -540 + Math.abs(3 - i) * 8, 5, 5, '#c9b99a');
      break;
  }
}

function tete(ctx: Ctx, look: Look, etat: Etat, id: PersoId) {
  cheveuxArriere(ctx, look);
  // cou
  ctx.fillStyle = look.peau;
  ctx.fillRect(-24, -350, 48, 40);
  if (look.coiffure === 'foulard') {
    ctx.beginPath();
    ctx.ellipse(0, -445, 104, 116, 0, 0, Math.PI * 2);
  } else {
    ctx.beginPath();
    ctx.arc(0, -450, 118, 0, Math.PI * 2);
  }
  remplir(ctx, look.peau, 6);
  if (look.barbe) {
    ctx.beginPath();
    ctx.ellipse(0, -390, 92, 62, 0, 0.05 * Math.PI, 0.95 * Math.PI);
    ctx.closePath();
    remplir(ctx, '#8d8d8d');
  }
  ellipse(ctx, -72, -400, 21, 12, 'rgba(255,110,140,0.45)');
  ellipse(ctx, 72, -400, 21, 12, 'rgba(255,110,140,0.45)');
  yeux(ctx, look, etat, id);
  trait(ctx, -3 + etat.regard * 4, -412, 3 + etat.regard * 4, -406, '#a0603a', 5);
  bouche(ctx, etat, DECALAGE[id]);
  cheveuxAvant(ctx, look, etat.regard);
}

/** Où se trouvent les mains (repère du personnage, pieds en 0). */
function mains(etat: Etat): [[number, number], [number, number]] {
  const balance = Math.sin(etat.t * 9) * (etat.marche ? 16 : 0);
  let gauche: [number, number] = [-104 + balance, -172];
  let droite: [number, number] = [104 - balance, -172];
  switch (etat.tient) {
    case 'pancarte':
      gauche = [-112, -262];
      droite = [112, -262];
      break;
    case 'mchicha':
      gauche = [-66, -200];
      droite = [66, -200];
      break;
    case 'valise':
      droite = [128, -168];
      break;
    case 'verre':
    case 'orange':
    case 'khobz':
      droite = [84, -292];
      break;
    case 'theiere':
      droite = [128, -520];
      break;
    default:
      if (etat.parle || etat.salut) droite = [146 + Math.sin(etat.t * 7) * 16, -470 + Math.cos(etat.t * 7) * 10];
  }
  return [gauche, droite];
}

function objetTenu(ctx: Ctx, etat: Etat, droite: [number, number]) {
  const [hx, hy] = droite;
  switch (etat.tient) {
    case 'pancarte':
      rectRond(ctx, -150, -340, 300, 118, 10);
      remplir(ctx, '#fffdf5', 6);
      ctx.fillStyle = ENCRE;
      ctx.font = `900 36px ${policeCourante}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Inès + Adam', 0, -281);
      break;
    case 'valise':
      rectRond(ctx, 110, -168, 96, 158, 16);
      remplir(ctx, '#e76f51', 6);
      trait(ctx, 128, -168, 128, -210, '#555', 6);
      trait(ctx, 128, -210, 188, -210, '#555', 6);
      trait(ctx, 188, -210, 188, -168, '#555', 6);
      ellipse(ctx, 130, -6, 10, 10, ENCRE);
      ellipse(ctx, 186, -6, 10, 10, ENCRE);
      break;
    case 'verre':
      ctx.beginPath();
      ctx.moveTo(hx - 22, hy - 62);
      ctx.lineTo(hx + 22, hy - 62);
      ctx.lineTo(hx + 16, hy);
      ctx.lineTo(hx - 16, hy);
      ctx.closePath();
      remplir(ctx, 'rgba(201,130,43,0.85)', 5);
      ellipse(ctx, hx + 6, hy - 64, 12, 6, '#52b788');
      break;
    case 'orange':
      ellipse(ctx, hx, hy - 20, 30, 30, '#ff9f1c', 5);
      ellipse(ctx, hx + 8, hy - 50, 12, 6, '#2d6a4f');
      break;
    case 'khobz':
      ellipse(ctx, hx, hy - 16, 44, 26, '#d9a066', 5);
      trait(ctx, hx - 18, hy - 22, hx + 18, hy - 10, '#a86b32', 4);
      break;
    case 'theiere': {
      // Mima verse le thé de haut : le filet descend jusqu'au verre sur la table.
      const bec = hx - 70;
      // repère du personnage : le dessus de la table est juste au-dessus des pieds
      trait(ctx, bec, hy + 34, bec + 6, -14, 'rgba(201,130,43,0.9)', 9);
      ellipse(ctx, hx, hy + 30, 58, 46, '#c7ccd4', 5);
      ellipse(ctx, hx, hy - 22, 26, 12, '#aab0ba', 4);
      trait(ctx, hx - 52, hy + 30, bec, hy + 34, '#aab0ba', 10);
      break;
    }
    case 'mchicha':
      break;
  }
}

/** Le chat dessine depuis ses pattes (0) ; `taille` 1 ≈ 220 px de haut. */
function chat(ctx: Ctx, t: number, x: number, y: number, taille: number, avecPain: boolean) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(taille, taille);
  const remue = Math.sin(t * 4) * 30;
  ctx.beginPath();
  ctx.moveTo(56, -40);
  ctx.quadraticCurveTo(150, -60 + remue * 0.2, 128 + remue, -170);
  ctx.strokeStyle = ENCRE;
  ctx.lineWidth = 30;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.strokeStyle = '#f2a04d';
  ctx.lineWidth = 20;
  ctx.stroke();
  ellipse(ctx, 0, -64, 78, 60, '#f2a04d', 6);
  for (let i = 0; i < 3; i++) trait(ctx, -30 + i * 26, -118, -38 + i * 26, -82, '#d9822b', 9);
  ellipse(ctx, -40, -8, 20, 12, '#f2a04d', 5);
  ellipse(ctx, 34, -8, 20, 12, '#f2a04d', 5);
  for (const cote of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cote * 20, -205);
    ctx.lineTo(cote * 50, -258);
    ctx.lineTo(cote * 62, -190);
    ctx.closePath();
    remplir(ctx, '#f2a04d', 6);
    ellipse(ctx, cote * 46, -214, 7, 13, '#ff9fb2');
  }
  ellipse(ctx, 0, -160, 66, 58, '#f2a04d', 6);
  const ferme = (t + 1.2) % 3.1 < 0.12;
  for (const cote of [-1, 1]) {
    if (ferme) {
      trait(ctx, cote * 24 - 10, -165, cote * 24 + 10, -165, ENCRE, 5);
      continue;
    }
    ellipse(ctx, cote * 24, -166, 15, 19, '#3ba55c', 4);
    ellipse(ctx, cote * 24, -164, 6, 13, '#0d1f12');
    ellipse(ctx, cote * 24 - 5, -172, 5, 5, '#ffffff');
  }
  ellipse(ctx, 0, -142, 7, 5, '#ff7f9a');
  for (const cote of [-1, 1]) {
    trait(ctx, cote * 14, -138, cote * 70, -146, ENCRE, 3);
    trait(ctx, cote * 14, -132, cote * 68, -126, ENCRE, 3);
  }
  if (avecPain) ellipse(ctx, 0, -118, 40, 22, '#d9a066', 5);
  ctx.restore();
}

function personnage(ctx: Ctx, id: PersoId, x: number, sol: number, echelle: number, etat: Etat) {
  if (id === 'mchicha') {
    chat(ctx, etat.t, x, sol, echelle * 0.95, etat.tient === 'khobz');
    return;
  }
  const look = LOOKS[id];
  const respire = Math.sin(etat.t * 2.2 + DECALAGE[id]) * 4 + (etat.parle ? Math.abs(Math.sin(etat.t * 8)) * 7 : 0);
  ctx.save();
  ctx.translate(x, sol);
  ctx.scale(echelle * look.taille, echelle * look.taille);
  // sac à dos (derrière)
  if (look.sac) {
    rectRond(ctx, -96, -318, 192, 190, 40);
    remplir(ctx, look.sac, 6);
  }
  // jambes
  const pas = etat.marche ? Math.sin(etat.t * 9) : 0;
  for (const cote of [-1, 1]) {
    const leve = Math.max(0, pas * cote) * 22;
    if (!look.robe) {
      rectRond(ctx, cote * 30 - 18, -150, 36, 140 - leve, 14);
      remplir(ctx, look.bas, 5);
    }
    ellipse(ctx, cote * 34, -10 - leve, 34, 16, look.chaussures, 5);
  }
  ctx.translate(0, -respire);
  // corps
  if (look.robe) {
    ctx.beginPath();
    ctx.moveTo(-80, -330);
    ctx.lineTo(80, -330);
    ctx.lineTo(118, -14 + respire);
    ctx.lineTo(-118, -14 + respire);
    ctx.closePath();
    remplir(ctx, look.haut, 6);
    trait(ctx, 0, -320, 0, -30 + respire, id === 'mima' ? '#e9c46a' : '#a8dadc', 8);
  } else {
    rectRond(ctx, -80, -334, 160, 200, 44);
    remplir(ctx, look.haut, 6);
    if (id === 'yassine') trait(ctx, -74, -250, 74, -250, '#ffffff', 14);
    if (id === 'nour') ellipse(ctx, 0, -220, 34, 22, 'rgba(255,255,255,0.25)');
  }
  if (look.sac) {
    trait(ctx, -52, -330, -58, -200, '#e0a800', 12);
    trait(ctx, 52, -330, 58, -200, '#e0a800', 12);
  }
  // bras et mains
  const [g, d] = mains(etat);
  for (const [[hx, hy], ex] of [
    [g, -70],
    [d, 70],
  ] as const) {
    ctx.beginPath();
    ctx.moveTo(ex, -306);
    ctx.lineTo(hx, hy);
    ctx.strokeStyle = ENCRE;
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.strokeStyle = look.haut;
    ctx.lineWidth = 30;
    ctx.stroke();
    ellipse(ctx, hx, hy, 20, 20, look.peau, 5);
  }
  tete(ctx, look, etat, id);
  if (etat.tient === 'mchicha') chat(ctx, etat.t, 0, -150, 0.62, false);
  objetTenu(ctx, etat, d);
  if (etat.tient === 'pancarte' || etat.tient === 'mchicha') {
    ellipse(ctx, g[0], g[1], 20, 20, look.peau, 5);
    ellipse(ctx, d[0], d[1], 20, 20, look.peau, 5);
  }
  ctx.restore();
}

/** Hauteur de la tête au-dessus du sol, pour viser la bulle. */
function hautTete(id: PersoId, echelle: number): number {
  if (id === 'mchicha') return 250 * echelle;
  return 590 * echelle * LOOKS[id].taille;
}

// --- Les décors -------------------------------------------------------------------

function nuages(ctx: Ctx, t: number, y: number) {
  for (let i = 0; i < 3; i++) {
    const x = ((i * 430 + t * 14) % (LARGEUR + 400)) - 200;
    const yy = y + i * 90;
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (const [dx, dy, r] of [
      [0, 0, 50],
      [55, -20, 60],
      [115, 0, 48],
    ] as const) {
      ctx.beginPath();
      ctx.arc(x + dx, yy + dy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function decorPort(ctx: Ctx, t: number, objets: readonly ObjetId[]) {
  const ciel = ctx.createLinearGradient(0, 0, 0, 1080);
  ciel.addColorStop(0, '#5fb4ee');
  ciel.addColorStop(1, '#d8f1ff');
  ctx.fillStyle = ciel;
  ctx.fillRect(0, 0, LARGEUR, 1080);
  ellipse(ctx, 880, 820, 120, 120, 'rgba(255,209,102,0.35)');
  ellipse(ctx, 880, 820, 80, 80, '#ffd166');
  nuages(ctx, t, 760);
  // grues du port
  for (const gx of [90, 250]) {
    trait(ctx, gx, 1060, gx + 30, 900, '#e76f51', 10);
    trait(ctx, gx + 60, 1060, gx + 30, 900, '#e76f51', 10);
    trait(ctx, gx - 40, 905, gx + 150, 905, '#e76f51', 10);
  }
  const mer = ctx.createLinearGradient(0, 1050, 0, 1290);
  mer.addColorStop(0, '#2b8fd6');
  mer.addColorStop(1, '#1769aa');
  ctx.fillStyle = mer;
  ctx.fillRect(0, 1050, LARGEUR, 240);
  for (let i = 0; i < 9; i++) {
    const vx = ((i * 140 + t * 40) % (LARGEUR + 100)) - 50;
    trait(ctx, vx, 1100 + (i % 3) * 60, vx + 50, 1100 + (i % 3) * 60, 'rgba(255,255,255,0.55)', 5);
  }
  if (objets.includes('ferry')) {
    const fy = Math.sin(t * 1.3) * 5;
    ctx.beginPath();
    ctx.moveTo(470, 1130 + fy);
    ctx.lineTo(1080, 1130 + fy);
    ctx.lineTo(1080, 1230 + fy);
    ctx.lineTo(520, 1230 + fy);
    ctx.closePath();
    remplir(ctx, '#ffffff', 6);
    ctx.fillStyle = '#1d3557';
    ctx.fillRect(510, 1195 + fy, 570, 22);
    rectRond(ctx, 600, 1040 + fy, 480, 92, 10);
    remplir(ctx, '#f8f9fa', 6);
    for (let i = 0; i < 9; i++) ellipse(ctx, 640 + i * 50, 1086 + fy, 12, 12, '#90caf9', 3);
    rectRond(ctx, 820, 960 + fy, 70, 84, 6);
    remplir(ctx, '#e63946', 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(820, 985 + fy, 70, 16);
  }
  // quai
  ctx.fillStyle = '#ddc9a3';
  ctx.fillRect(0, 1290, LARGEUR, HAUTEUR - 1290);
  for (let i = 0; i < 14; i++) ctx.fillRect(0, 1290, LARGEUR, 10);
  ctx.fillStyle = '#c9b48a';
  for (let y = 1360; y < HAUTEUR; y += 90) ctx.fillRect(0, y, LARGEUR, 5);
  ctx.fillStyle = '#ffd60a';
  ctx.fillRect(0, 1290, LARGEUR, 14);
  if (objets.includes('voiture')) {
    rectRond(ctx, 690, SOL - 230, 380, 170, 50);
    remplir(ctx, '#e63946', 7);
    rectRond(ctx, 740, SOL - 330, 230, 120, 40);
    remplir(ctx, '#e63946', 7);
    rectRond(ctx, 765, SOL - 310, 180, 80, 20);
    remplir(ctx, '#bde0fe', 5);
    // coffre ouvert avec les valises
    ctx.save();
    ctx.translate(1060, SOL - 230);
    ctx.rotate(-0.9);
    rectRond(ctx, -10, -24, 150, 30, 10);
    remplir(ctx, '#c1121f', 6);
    ctx.restore();
    rectRond(ctx, 960, SOL - 270, 60, 60, 8);
    remplir(ctx, '#ffc93c', 5);
    for (const rx of [770, 990]) {
      ellipse(ctx, rx, SOL - 60, 48, 48, '#222222', 6);
      ellipse(ctx, rx, SOL - 60, 20, 20, '#adb5bd');
    }
  }
}

function zellige(ctx: Ctx, x0: number, y0: number, largeur: number, hauteur: number, taille: number) {
  const couleurs = ['#1b7f79', '#f4f1e8', '#2b59c3', '#e9b44c'];
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, y0, largeur, hauteur);
  ctx.clip();
  ctx.fillStyle = '#f4f1e8';
  ctx.fillRect(x0, y0, largeur, hauteur);
  for (let j = 0; j * taille < hauteur + taille; j++) {
    for (let i = 0; i * taille < largeur + taille; i++) {
      const cx = x0 + i * taille + (j % 2) * (taille / 2);
      const cy = y0 + j * taille;
      ctx.beginPath();
      ctx.moveTo(cx, cy - taille / 2);
      ctx.lineTo(cx + taille / 2, cy);
      ctx.lineTo(cx, cy + taille / 2);
      ctx.lineTo(cx - taille / 2, cy);
      ctx.closePath();
      ctx.fillStyle = couleurs[(i + j * 3) % couleurs.length];
      ctx.fill();
    }
  }
  ctx.restore();
}

function decorCuisine(ctx: Ctx) {
  ctx.fillStyle = '#fbe8c8';
  ctx.fillRect(0, 0, LARGEUR, 1100);
  // fenêtre en arc
  ctx.beginPath();
  ctx.moveTo(390, 1000);
  ctx.lineTo(390, 760);
  ctx.arc(540, 760, 150, Math.PI, 0);
  ctx.lineTo(690, 1000);
  ctx.closePath();
  const vue = ctx.createLinearGradient(0, 600, 0, 1000);
  vue.addColorStop(0, '#74c0fc');
  vue.addColorStop(1, '#d0ebff');
  ctx.fillStyle = vue;
  ctx.fill();
  ctx.lineWidth = 22;
  ctx.strokeStyle = '#2b59c3';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(420, 900, 70, 100);
  ctx.fillRect(500, 870, 90, 130);
  ctx.fillRect(600, 920, 60, 80);
  // étagère
  ctx.fillStyle = '#8c5a3c';
  ctx.fillRect(60, 860, 260, 18);
  for (const [px, c] of [
    [110, '#e9b44c'],
    [190, '#2b59c3'],
    [265, '#e76f51'],
  ] as const)
    ellipse(ctx, px, 830, 34, 30, c, 5);
  ctx.fillStyle = '#8c5a3c';
  ctx.fillRect(760, 860, 260, 18);
  for (const px of [800, 860, 920, 980]) ellipse(ctx, px, 835, 18, 26, '#c7ccd4', 4);
  zellige(ctx, 0, 1100, LARGEUR, 250, 64);
  ctx.fillStyle = '#2b59c3';
  ctx.fillRect(0, 1092, LARGEUR, 16);
  ctx.fillStyle = '#c8693f';
  ctx.fillRect(0, 1350, LARGEUR, HAUTEUR - 1350);
  ctx.fillStyle = '#b65a33';
  for (let y = 1420; y < HAUTEUR; y += 100) ctx.fillRect(0, y, LARGEUR, 6);
}

function tableCuisine(ctx: Ctx, objets: readonly ObjetId[]) {
  ellipse(ctx, 540, 1560, 420, 70, '#6d4430', 7);
  ctx.fillStyle = '#6d4430';
  ctx.fillRect(130, 1560, 820, 110);
  ellipse(ctx, 540, 1520, 420, 70, '#9c6644', 7);
  ellipse(ctx, 540, 1518, 330, 46, '#f4f1e8');
  if (objets.includes('theiere')) {
    ellipse(ctx, 400, 1465, 58, 48, '#c7ccd4', 6);
    ellipse(ctx, 400, 1414, 26, 12, '#aab0ba', 4);
    trait(ctx, 346, 1462, 300, 1430, '#aab0ba', 12);
  }
  if (objets.includes('verres')) {
    for (const vx of [560, 630, 700]) {
      ctx.beginPath();
      ctx.moveTo(vx - 20, 1440);
      ctx.lineTo(vx + 20, 1440);
      ctx.lineTo(vx + 15, 1500);
      ctx.lineTo(vx - 15, 1500);
      ctx.closePath();
      remplir(ctx, 'rgba(201,130,43,0.85)', 5);
    }
  }
  if (objets.includes('panier-khobz')) {
    ellipse(ctx, 820, 1492, 90, 36, '#b07d48', 6);
    ellipse(ctx, 790, 1466, 56, 28, '#d9a066', 5);
    ellipse(ctx, 850, 1460, 52, 26, '#e0b077', 5);
  }
}

function decorMarche(ctx: Ctx, t: number) {
  const ciel = ctx.createLinearGradient(0, 0, 0, 700);
  ciel.addColorStop(0, '#4dabf7');
  ciel.addColorStop(1, '#a5d8ff');
  ctx.fillStyle = ciel;
  ctx.fillRect(0, 0, LARGEUR, 760);
  const mur = ctx.createLinearGradient(0, 700, 0, 1350);
  mur.addColorStop(0, '#e9b872');
  mur.addColorStop(1, '#d49a52');
  ctx.fillStyle = mur;
  ctx.beginPath();
  ctx.moveTo(0, 700);
  for (let x = 0; x <= LARGEUR; x += 120) ctx.lineTo(x, 700 - (x % 240 === 0 ? 40 : 0));
  ctx.lineTo(LARGEUR, 1350);
  ctx.lineTo(0, 1350);
  ctx.closePath();
  ctx.fill();
  // porte en arc bleue
  ctx.beginPath();
  ctx.moveTo(90, 1350);
  ctx.lineTo(90, 1040);
  ctx.arc(210, 1040, 120, Math.PI, 0);
  ctx.lineTo(330, 1350);
  ctx.closePath();
  remplir(ctx, '#1c5d99', 7);
  ellipse(ctx, 300, 1200, 10, 10, '#e9c46a');
  // lanternes
  for (const [lx, ly] of [
    [470, 820],
    [640, 780],
  ] as const) {
    trait(ctx, lx, 700, lx, ly - 40, '#6c584c', 4);
    ellipse(ctx, lx, ly + 10, 60, 60, `rgba(255,209,102,${0.25 + 0.1 * Math.sin(t * 3 + lx)})`);
    rectRond(ctx, lx - 26, ly - 40, 52, 90, 14);
    remplir(ctx, '#e9c46a', 5);
  }
  // auvent rayé
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(760 + i * 54, 900);
    ctx.lineTo(814 + i * 54, 900);
    ctx.lineTo(814 + i * 54, 980);
    ctx.quadraticCurveTo(787 + i * 54, 1010, 760 + i * 54, 980);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? '#e63946' : '#fffdf5';
    ctx.fill();
  }
  // pavés
  ctx.fillStyle = '#c9a27e';
  ctx.fillRect(0, 1350, LARGEUR, HAUTEUR - 1350);
  for (let j = 0; j < 7; j++)
    for (let i = 0; i < 9; i++) ellipse(ctx, i * 130 + (j % 2) * 65, 1400 + j * 80, 50, 20, '#b8906c');
}

function etalMarche(ctx: Ctx, t: number, objets: readonly ObjetId[]) {
  if (!objets.includes('oranges')) return;
  rectRond(ctx, 790, 1240, 300, 110, 10);
  remplir(ctx, '#8c5a3c', 6);
  for (let rang = 0; rang < 3; rang++) {
    for (let i = 0; i < 5 - rang; i++) ellipse(ctx, 830 + rang * 26 + i * 52, 1220 - rang * 42, 27, 27, '#ff9f1c', 4);
  }
  // panier au sol
  if (objets.includes('queue-mchicha')) {
    const remue = Math.sin(t * 5) * 22;
    ctx.beginPath();
    ctx.moveTo(990, 1470);
    ctx.quadraticCurveTo(1020 + remue, 1400, 1000 + remue * 1.4, 1330);
    ctx.strokeStyle = ENCRE;
    ctx.lineWidth = 30;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.strokeStyle = '#f2a04d';
    ctx.lineWidth = 20;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(840, 1440);
  ctx.lineTo(1070, 1440);
  ctx.lineTo(1040, 1560);
  ctx.lineTo(870, 1560);
  ctx.closePath();
  remplir(ctx, '#c9934f', 6);
  for (let i = 0; i < 4; i++) trait(ctx, 860 + i * 12, 1470 + i * 25, 1055 - i * 12, 1470 + i * 25, '#a87436', 5);
  for (let i = 0; i < 4; i++) ellipse(ctx, 890 + i * 46, 1430, 24, 24, '#ff9f1c', 4);
}

function decor(ctx: Ctx, id: DecorId, t: number, objets: readonly ObjetId[]) {
  if (id === 'port') decorPort(ctx, t, objets);
  else if (id === 'cuisine') decorCuisine(ctx);
  else decorMarche(ctx, t);
}

// --- Le texte ------------------------------------------------------------------

let policeCourante = 'sans-serif';

function texteColore(ctx: Ctx, texte: string, cx: number, y: number, taille: number, largeurMax: number, couleur: string, interligne = 1.25) {
  ctx.font = `800 ${taille}px ${policeCourante}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const rangees = lignes(texte, largeurMax, (s) => ctx.measureText(s).width);
  rangees.forEach((ligne, i) => {
    const largeur = ligne.reduce((s, m) => s + ctx.measureText(m.texte).width, 0);
    let x = cx - largeur / 2;
    for (const m of ligne) {
      ctx.fillStyle = m.fort ? DARIJA : couleur;
      ctx.fillText(m.texte, x, y + i * taille * interligne);
      x += ctx.measureText(m.texte).width;
    }
  });
  return rangees.length;
}

function bulle(ctx: Ctx, texte: string, qui: PersoId | undefined, cibleX: number, cibleY: number, apparition: number) {
  const taille = 60;
  ctx.font = `800 ${taille}px ${policeCourante}`;
  const largeurMax = 820;
  const rangees = lignes(texte, largeurMax, (s) => ctx.measureText(s).width);
  const largeurTexte = Math.max(...rangees.map((l) => l.reduce((s, m) => s + ctx.measureText(m.texte).width, 0)));
  const w = Math.max(360, largeurTexte + 110);
  const h = rangees.length * taille * 1.25 + 90;
  const x = borne(qui ? cibleX - w / 2 : (LARGEUR - w) / 2, 50, LARGEUR - 50 - w);
  const y = 300;
  const echelle = 0.86 + 0.14 * rebond(apparition / 0.25);
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.scale(echelle, echelle);
  ctx.translate(-(x + w / 2), -(y + h / 2));
  if (qui) {
    // queue de la bulle vers la tête de celui qui parle
    const base = borne(cibleX, x + 80, x + w - 80);
    const bout = Math.min(cibleY - 30, y + h + 200);
    ctx.beginPath();
    ctx.moveTo(base - 40, y + h - 10);
    ctx.lineTo(cibleX, bout);
    ctx.lineTo(base + 40, y + h - 10);
    ctx.closePath();
    remplir(ctx, '#ffffff', 7);
  }
  rectRond(ctx, x, y, w, h, qui ? 60 : 24);
  remplir(ctx, qui ? '#ffffff' : '#ffe066', 7);
  if (qui) {
    // recouvre le trait entre la bulle et sa queue
    const base = borne(cibleX, x + 80, x + w - 80);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(base - 34, y + h - 12, 68, 10);
    const nom = NOMS[qui];
    ctx.font = `800 40px ${policeCourante}`;
    const wn = ctx.measureText(nom).width + 50;
    rectRond(ctx, x + 40, y - 34, wn, 64, 32);
    remplir(ctx, qui === 'mchicha' ? DARIJA : LOOKS[qui as Exclude<PersoId, 'mchicha'>].accent, 5);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(nom, x + 65, y - 2);
  }
  texteColore(ctx, texte, x + w / 2, y + 45 + taille * 0.85, taille, largeurMax, ENCRE);
  ctx.restore();
}

function etiquette(ctx: Ctx, ep: Episode) {
  const texte = `KALIMAT · ÉPISODE ${ep.numero}`;
  ctx.font = `800 34px ${policeCourante}`;
  const w = ctx.measureText(texte).width + 48;
  rectRond(ctx, (LARGEUR - w) / 2, 150, w, 58, 29);
  ctx.fillStyle = 'rgba(15,31,61,0.75)';
  ctx.fill();
  ctx.fillStyle = '#ffd166';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(texte, LARGEUR / 2, 180);
}

// --- Les écrans ----------------------------------------------------------------

function etoiles(ctx: Ctx, t: number, couleur: string) {
  ctx.save();
  ctx.strokeStyle = couleur;
  ctx.lineWidth = 5;
  for (let j = 0; j < 12; j++) {
    for (let i = 0; i < 7; i++) {
      const cx = i * 180 + (j % 2) * 90;
      const cy = j * 170;
      for (const angle of [0, Math.PI / 4]) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle + t * 0.15);
        ctx.strokeRect(-40, -40, 80, 80);
        ctx.restore();
      }
    }
  }
  ctx.restore();
}

const BANDE: PersoId[] = ['ines', 'adam', 'yassine', 'nour', 'mima'];

function bandeDesPersos(ctx: Ctx, t: number, sol: number, echelle: number) {
  BANDE.forEach((id, i) => {
    const x = 130 + i * 205;
    const saute = Math.max(0, Math.sin(t * 5 - i * 0.7)) * 26;
    personnage(ctx, id, x, sol - saute, echelle, { t, parle: false, humeur: 'content', regard: 0, marche: false, salut: true });
  });
}

function ecranGenerique(ctx: Ctx, ep: Episode, local: number) {
  ctx.fillStyle = '#0f1f3d';
  ctx.fillRect(0, 0, LARGEUR, HAUTEUR);
  etoiles(ctx, local, 'rgba(233,196,106,0.16)');
  const e = rebond(local / 0.8);
  ctx.save();
  ctx.translate(LARGEUR / 2, 560);
  ctx.scale(e, e);
  ctx.font = `900 190px ${policeCourante}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 18;
  ctx.strokeStyle = ENCRE;
  ctx.strokeText('Kalimat', 0, 0);
  ctx.fillStyle = '#ffd166';
  ctx.fillText('Kalimat', 0, 0);
  ctx.restore();
  ctx.globalAlpha = borne((local - 0.5) / 0.4, 0, 1);
  ctx.font = `700 64px ${policeCourante}`;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('les mots du bled', LARGEUR / 2, 720);
  ctx.globalAlpha = borne((local - 1) / 0.4, 0, 1);
  rectRond(ctx, LARGEUR / 2 - 160, 860, 320, 76, 38);
  remplir(ctx, '#e63946');
  ctx.font = `800 44px ${policeCourante}`;
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Épisode ${ep.numero}`, LARGEUR / 2, 899);
  ctx.textBaseline = 'alphabetic';
  texteColore(ctx, ep.titre, LARGEUR / 2, 1060, 84, 900, '#ffffff');
  ctx.globalAlpha = 1;
  bandeDesPersos(ctx, local, 1640, 0.62);
  chat(ctx, local, 980, 1700, 0.55, false);
}

function ecranMots(ctx: Ctx, ep: Episode, local: number) {
  ctx.fillStyle = '#fff4d6';
  ctx.fillRect(0, 0, LARGEUR, HAUTEUR);
  etoiles(ctx, local, 'rgba(233,180,76,0.18)');
  ctx.font = `900 84px ${policeCourante}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#0f1f3d';
  ctx.fillText('Les mots du jour', LARGEUR / 2, 330);
  trait(ctx, 280, 365, 800, 365, '#e9b44c', 12);
  const pas = 3;
  ep.mots.forEach((m, i) => {
    const debut = i * pas;
    if (local < debut) return;
    const e = rebond((local - debut) / 0.35);
    const actif = local < debut + pas;
    const y = 470 + i * 330;
    ctx.save();
    ctx.translate(LARGEUR / 2, y + 130);
    ctx.scale(e * (actif ? 1.04 : 1), e * (actif ? 1.04 : 1));
    rectRond(ctx, -440, -130, 880, 260, 40);
    remplir(ctx, '#ffffff', actif ? 9 : 5);
    ctx.fillStyle = ['#e63946', '#2a9d8f', '#3a86ff'][i];
    rectRond(ctx, -440, -130, 40, 260, 20);
    ctx.fill();
    ctx.font = `900 104px ${policeCourante}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = DARIJA;
    ctx.fillText(m.mot, 20, -10);
    ctx.font = `700 64px ${policeCourante}`;
    ctx.fillStyle = ENCRE;
    ctx.fillText(`= ${m.sens}`, 20, 82);
    ctx.restore();
  });
  personnage(ctx, 'yassine', 860, 1900, 0.72, { t: local, parle: true, humeur: 'content', regard: -1, marche: false, salut: false });
}

function ecranFin(ctx: Ctx, ep: Episode, local: number) {
  const fond = ctx.createLinearGradient(0, 0, 0, HAUTEUR);
  fond.addColorStop(0, '#ff9f1c');
  fond.addColorStop(1, '#ff6b6b');
  ctx.fillStyle = fond;
  ctx.fillRect(0, 0, LARGEUR, HAUTEUR);
  for (let i = 0; i < 60; i++) {
    const x = hasard(i) * LARGEUR;
    const y = ((hasard(i + 100) * HAUTEUR + local * (200 + hasard(i + 7) * 200)) % (HAUTEUR + 40)) - 20;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(local * 3 + i);
    ctx.fillStyle = ['#ffd166', '#ffffff', '#3a86ff', '#2a9d8f'][i % 4];
    ctx.fillRect(-10, -6, 20, 12);
    ctx.restore();
  }
  const e = rebond(local / 0.6);
  ctx.save();
  ctx.translate(LARGEUR / 2, 620);
  ctx.scale(e, e);
  ctx.font = `900 150px ${policeCourante}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 16;
  ctx.strokeStyle = ENCRE;
  ctx.strokeText('À demain !', 0, 0);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('À demain !', 0, 0);
  ctx.restore();
  const reste = (ep.fin ?? 'À demain ! *Bslama* !').replace(/^À demain ! /, '');
  ctx.font = `800 100px ${policeCourante}`;
  const nb = lignes(reste, 820, (s) => ctx.measureText(s).width).length;
  rectRond(ctx, 90, 800, 900, 100 + nb * 125, 50);
  remplir(ctx, '#ffffff', 7);
  texteColore(ctx, reste, LARGEUR / 2, 935, 100, 820, ENCRE);
  bandeDesPersos(ctx, local, 1640, 0.62);
  chat(ctx, local, 980, 1700, 0.55, false);
}

// --- Un plan --------------------------------------------------------------------

interface Position {
  placement: Placement;
  x: number;
  sol: number;
  marche: boolean;
}

function positions(persos: readonly Placement[], local: number, duree: number): Position[] {
  const trajet = Math.min(1.4, duree * 0.7);
  return persos.map((placement) => {
    const m = borne(local / trajet, 0, 1);
    const depart = placement.depuis ?? placement.x;
    const x = (depart + (placement.x - depart) * doux(m)) * LARGEUR;
    const saut = placement.saut && m < 1 ? Math.sin(m * Math.PI) * 280 : 0;
    const perche = (placement.perche ?? 0) * (placement.saut ? doux(m) : 1);
    return { placement, x, sol: SOL - saut - perche, marche: placement.depuis !== undefined && m < 1 };
  });
}

const ECHELLE_PERSO = 0.8;

function ecranPlan(ctx: Ctx, ep: Episode, index: number, local: number, duree: number, t: number) {
  const plan = ep.plans[index];
  const objets = plan.objets ?? [];
  const pos = positions(plan.persos, local, duree);
  const parleur = pos.find((q) => q.placement.id === plan.parle);
  ctx.save();
  // léger zoom pendant le plan, pour la vie
  const zoom = 1 + 0.03 * (local / duree);
  ctx.translate(LARGEUR / 2, SOL);
  ctx.scale(zoom, zoom);
  ctx.translate(-LARGEUR / 2, -SOL);
  decor(ctx, plan.decor, t, objets);
  const ordre = [...pos].sort((a, b) => Number(a.placement.id === 'mchicha') - Number(b.placement.id === 'mchicha'));
  for (const q of ordre) {
    const id = q.placement.id;
    const regard = parleur && parleur !== q ? Math.sign(parleur.x - q.x) : 0;
    personnage(ctx, id, q.x, q.sol, ECHELLE_PERSO, {
      t: t + DECALAGE[id],
      parle: plan.parle === id,
      humeur: q.placement.humeur ?? 'content',
      regard,
      marche: q.marche,
      salut: false,
      tient: q.placement.tient,
    });
  }
  if (plan.decor === 'cuisine') tableCuisine(ctx, objets);
  if (plan.decor === 'marche') etalMarche(ctx, t, objets);
  ctx.restore();
  etiquette(ctx, ep);
  const cibleY = parleur ? parleur.sol - hautTete(parleur.placement.id, ECHELLE_PERSO) : 0;
  bulle(ctx, plan.texte, plan.parle, parleur?.x ?? LARGEUR / 2, cibleY, local);
  const nouveau = index === 0 || ep.plans[index - 1].decor !== plan.decor;
  if (nouveau && local < 0.35) {
    ctx.fillStyle = `rgba(255,255,255,${1 - local / 0.35})`;
    ctx.fillRect(0, 0, LARGEUR, HAUTEUR);
  }
}

/**
 * Dessine l'image de l'épisode à l'instant `t` (secondes), dans un repère de
 * 1080 × 1920. L'appelant règle l'échelle du canvas.
 */
export function dessinerEpisode(ctx: Ctx, ep: Episode, t: number, police = 'sans-serif') {
  policeCourante = police;
  ctx.save();
  ctx.lineJoin = 'round';
  const moment = momentA(ep, t);
  if (moment.partie === 'generique') ecranGenerique(ctx, ep, moment.local);
  else if (moment.partie === 'plan') ecranPlan(ctx, ep, moment.index, moment.local, moment.duree, t);
  else if (moment.partie === 'mots') ecranMots(ctx, ep, moment.local);
  else ecranFin(ctx, ep, moment.local);
  ctx.restore();
}
