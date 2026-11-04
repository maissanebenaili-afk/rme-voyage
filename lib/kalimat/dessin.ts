// Le dessin des épisodes Kalimat sur un canvas 1080 × 1920 (format vertical).
// Tout est calculé à partir du temps `t` : la même image sort toujours au même
// instant, ce qui permet de jouer l'épisode sur le site et d'exporter la vidéo.
//
// Ce qui rend l'image vivante :
// - une caméra qui glisse vers celui qui parle, avec un décor en profondeur
//   (le fond bouge moins vite que le devant) ;
// - des personnages originaux style anime : ombres, clignements, lèvres qui
//   suivent les lettres, gestes, tête qui penche, rebonds ;
// - des bulles qui s'écrivent, les mots de darija qui « sautent », et leur
//   traduction qui apparaît dessous la première fois ;
// - des passages en cercle (iris) entre les lieux et les écrans.

import { DEBUT_ECRITURE, DEBUT_VOIX, LETTRES_PAR_SECONDE, ECRAN, NOMS, clip, cleDuPlan, lignes, momentA, suivant, texteBrut, texteFin, traductions } from './episodes';
import type { Clip, DecorId, Episode, Humeur, Langue, Moment, ObjetId, PersoId, Placement, Plan, Tenu } from './episodes';
import type { EntreeLexique } from './lexique';

export const LARGEUR = 1080;
export const HAUTEUR = 1920;
const SOL = 1470;
const CENTRE_Y = 1180;
const X0 = -260;
const X1 = LARGEUR + 260;
const ENCRE = '#1d1630';
const DARIJA = '#d9480f';
const IRIS = 0.45;

type Ctx = CanvasRenderingContext2D;
let police = 'sans-serif';
let langue: Langue = 'fr';
let avecSousTitres = false;

// --- Outils -------------------------------------------------------------------

const borne = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const doux = (v: number) => {
  const x = borne(v, 0, 1);
  return x < 0.5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2;
};
/** Arrivée avec un petit dépassement, comme un ressort (0 → 1). */
const rebond = (v: number) => {
  const x = borne(v, 0, 1);
  return 1 + 2.4 * (x - 1) ** 3 + 1.4 * (x - 1) ** 2;
};
const melange = (a: number, b: number, v: number) => a + (b - a) * v;
/** Nombre pseudo-aléatoire stable (0 à 1). */
const hasard = (n: number) => {
  const x = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

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

/** Remplit le chemin en cours, ajoute une ombre douce à droite (lumière venant de gauche), puis le contour. */
function remplir(ctx: Ctx, couleur: string, trait = 0, ombre?: number) {
  ctx.fillStyle = couleur;
  ctx.fill();
  if (ombre !== undefined) {
    ctx.save();
    ctx.clip();
    ctx.fillStyle = 'rgba(45,20,70,0.14)';
    ctx.fillRect(ombre, -3000, 6000, 6000);
    ctx.restore();
  }
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

/** Membre arrondi avec contour (les bras). */
function membre(ctx: Ctx, x1: number, y1: number, x2: number, y2: number, couleur: string, epaisseur: number) {
  trait(ctx, x1, y1, x2, y2, ENCRE, epaisseur + 10);
  trait(ctx, x1, y1, x2, y2, couleur, epaisseur);
}

// --- Les personnages ------------------------------------------------------------

type Coiffure = 'boucles' | 'court' | 'casquette' | 'tresses' | 'foulard' | 'taguia';
type Geste = 'ouvert' | 'montre' | 'salut' | 'coeur';
const GESTES: Geste[] = ['ouvert', 'montre', 'salut', 'coeur', 'montre', 'ouvert'];

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
  ines: { peau: '#eab38a', cheveux: '#3b2417', coiffure: 'boucles', haut: '#ff7a59', bas: '#3d5a99', chaussures: '#ffffff', taille: 0.95, accent: '#c2410c', sac: '#ffc93c' },
  adam: { peau: '#e2a67b', cheveux: '#4a2c1a', coiffure: 'casquette', haut: '#2a9d8f', bas: '#264653', chaussures: '#e63946', taille: 0.82, accent: '#0f766e' },
  yassine: { peau: '#c98b5e', cheveux: '#1b1b1b', coiffure: 'court', haut: '#3a86ff', bas: '#c9935f', chaussures: '#f1f1f1', taille: 1, accent: '#1d4ed8' },
  nour: { peau: '#d9a27a', cheveux: '#2e1a10', coiffure: 'tresses', haut: '#7b2cbf', bas: '#1d3557', chaussures: '#ffffff', taille: 1.04, accent: '#6b21a8', yeux: '#6b4423' },
  mima: { peau: '#c68e63', cheveux: '#2d6a4f', coiffure: 'foulard', haut: '#b5523b', bas: '#b5523b', chaussures: '#6d3b2a', taille: 1.16, accent: '#166534', robe: true, lunettes: true },
  marchand: { peau: '#b07850', cheveux: '#5c5c5c', coiffure: 'taguia', haut: '#457b9d', bas: '#457b9d', chaussures: '#4a3426', taille: 1.18, accent: '#1e3a8a', robe: true, barbe: true },
};

const DECALAGE: Record<PersoId, number> = { ines: 0.3, adam: 1.7, yassine: 2.4, nour: 0.9, mima: 3.1, mchicha: 1.2, marchand: 2.0 };

interface Etat {
  t: number;
  /** Ouverture de la bouche pendant qu'il parle (0 à 1), -1 quand il ne parle pas. */
  bouche: number;
  /** Force du geste en cours (0 au repos, 1 geste complet). */
  geste: number;
  typeGeste: Geste;
  humeur: Humeur;
  /** -1 regarde à gauche, 1 à droite, 0 en face. */
  regard: number;
  marche: boolean;
  salut: boolean;
  tient?: Tenu;
}

/** Ouverture de la bouche selon la lettre qui s'écrit : grande sur « a », « o », petite sur les consonnes. */
export function ouvertureBouche(texte: string, local: number): number {
  const brut = texteBrut(texte);
  const n = (local - DEBUT_ECRITURE) * LETTRES_PAR_SECONDE;
  if (n < 0 || n >= brut.length) return -1;
  const i = Math.floor(n);
  const f = n - i;
  const o = (c: string | undefined) => {
    if (!c) return 0;
    if (/[aàâoôöAÀÂOÔÖ]/.test(c)) return 1;
    if (/[eéèêëEÉÈÊË]/.test(c)) return 0.7;
    if (/[iîïuùûüyIÎÏUÙÛÜY]/.test(c)) return 0.5;
    if (/[\s!?,.:;…«»¡¿—-]/.test(c)) return 0.05;
    return 0.3;
  };
  return o(brut[i]) * (1 - f) + o(brut[i + 1]) * f;
}

/** Ouverture de la bouche d'après la vraie voix (courbe mesurée, 30 valeurs par seconde). */
export function ouvertureVoix(voix: Clip, local: number): number {
  const n = (local - DEBUT_VOIX) * 30;
  if (n < 0 || n >= voix.bouche.length) return -1;
  const i = Math.floor(n);
  const f = n - i;
  const v = (c: string | undefined) => (c ? Number(c) / 9 : 0);
  return Math.sqrt(v(voix.bouche[i]) * (1 - f) + v(voix.bouche[i + 1]) * f);
}

function yeux(ctx: Ctx, look: Look, etat: Etat, id: PersoId) {
  const cycle = (etat.t + DECALAGE[id]) % 3.7;
  // Clignement en trois temps : se ferme, fermé, se rouvre.
  const ferme = cycle < 0.06 ? cycle / 0.06 : cycle < 0.12 ? 1 : cycle < 0.2 ? 1 - (cycle - 0.12) / 0.08 : 0;
  const dx = etat.regard * 7;
  const rire = etat.humeur === 'rire';
  for (const cote of [-1, 1]) {
    const x = cote * 44;
    const y = -440;
    if (rire || ferme > 0.85) {
      ctx.beginPath();
      if (rire) ctx.arc(x, y + 8, 22, 1.15 * Math.PI, 1.85 * Math.PI);
      else ctx.arc(x, y - 4, 22, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.strokeStyle = ENCRE;
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.stroke();
      continue;
    }
    const grand = etat.humeur === 'surpris' ? 1.12 : 1;
    const h = 1 - ferme;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, h);
    ellipse(ctx, 0, 0, 25 * grand, 33 * grand, '#ffffff');
    ellipse(ctx, dx, 3, 19 * grand, 27 * grand, look.yeux ?? '#3a2414');
    ellipse(ctx, dx, 12, 13 * grand, 13 * grand, '#7a4b2a');
    ellipse(ctx, dx, 4, 8, 10, '#120c08');
    ellipse(ctx, dx - 7, -9, 8, 8, '#ffffff');
    ellipse(ctx, dx + 7, 14, 4, 4, '#ffffff');
    ctx.restore();
    ctx.beginPath();
    ctx.ellipse(x, y, 26 * grand, 34 * grand * h + 0.1, 0, 1.08 * Math.PI, 1.92 * Math.PI);
    ctx.strokeStyle = ENCRE;
    ctx.lineWidth = 7;
    ctx.stroke();
  }
  for (const cote of [-1, 1]) {
    const leve = etat.humeur === 'surpris' ? -14 : etat.bouche >= 0 ? -Math.max(0, etat.bouche - 0.6) * 10 : 0;
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
      ellipse(ctx, cote * 44 - 14, -456, 8, 4, 'rgba(255,255,255,0.5)');
    }
    trait(ctx, -6, -444, 6, -444, '#7a4a24', 5);
  }
}

function bouche(ctx: Ctx, etat: Etat) {
  const y = -385;
  if (etat.bouche >= 0) {
    const o = etat.bouche;
    ctx.beginPath();
    ctx.ellipse(0, y, 15 + 6 * o, 4 + 17 * o, 0, 0, Math.PI * 2);
    remplir(ctx, '#7a1f2b', 4);
    if (o > 0.3) ellipse(ctx, 0, y + 5 + 8 * o, 10, 2 + 5 * o, '#ff8fa3');
    return;
  }
  ctx.beginPath();
  if (etat.humeur === 'surpris') {
    ctx.ellipse(0, y, 9, 12, 0, 0, Math.PI * 2);
    remplir(ctx, '#7a1f2b', 4);
    return;
  }
  if (etat.humeur === 'rire') {
    ctx.moveTo(-26, y - 8);
    ctx.quadraticCurveTo(0, y + 34, 26, y - 8);
    ctx.closePath();
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

function brillance(ctx: Ctx, x: number, y: number) {
  ctx.beginPath();
  ctx.arc(x, y, 70, 1.15 * Math.PI, 1.45 * Math.PI);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function cheveuxArriere(ctx: Ctx, look: Look, etat: Etat) {
  const balance = Math.sin(etat.t * (etat.marche ? 9 : 2)) * (etat.marche ? 8 : 3);
  if (look.coiffure === 'boucles') {
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (0.82 + (i / 12) * 1.36);
      ellipse(ctx, Math.cos(a) * 118, -450 + Math.sin(a) * 118, 52, 52, look.cheveux);
    }
    for (const cote of [-1, 1]) {
      ellipse(ctx, cote * 122 + balance * 0.5, -360, 48, 52, look.cheveux);
      ellipse(ctx, cote * 112 + balance, -305, 40, 44, look.cheveux);
    }
  } else if (look.coiffure === 'tresses') {
    for (const cote of [-1, 1]) {
      for (let i = 0; i < 6; i++) ellipse(ctx, cote * (108 + i * 3) + balance * (i / 6), -400 + i * 34, 21, 25, look.cheveux, 4);
      ellipse(ctx, cote * 126 + balance, -192, 16, 12, '#ff9f1c', 4);
    }
  } else if (look.coiffure === 'foulard') {
    ctx.beginPath();
    ctx.moveTo(-150, -300);
    ctx.quadraticCurveTo(-175, -460, -120, -545);
    ctx.quadraticCurveTo(0, -630, 120, -545);
    ctx.quadraticCurveTo(175, -460, 150, -300);
    ctx.quadraticCurveTo(0, -270, -150, -300);
    remplir(ctx, look.cheveux, 6, 60);
  }
}

function cheveuxAvant(ctx: Ctx, look: Look, regard: number) {
  const c = look.cheveux;
  switch (look.coiffure) {
    case 'boucles':
      for (let i = 0; i < 5; i++) ellipse(ctx, -84 + i * 42, -548 + (i % 2) * 8, 36, 34, c);
      brillance(ctx, -10, -470);
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
      brillance(ctx, 0, -470);
      break;
    }
    case 'casquette': {
      ellipse(ctx, -110, -430, 22, 34, c);
      ellipse(ctx, 110, -430, 22, 34, c);
      ctx.beginPath();
      ctx.arc(0, -478, 124, Math.PI, Math.PI * 2);
      ctx.closePath();
      remplir(ctx, '#e63946', 6, 50);
      ctx.beginPath();
      ctx.ellipse((regard || 1) * 92, -484, 96, 24, 0, 0, Math.PI * 2);
      remplir(ctx, '#b81d2a', 6);
      ellipse(ctx, 0, -602, 14, 9, '#b81d2a');
      brillance(ctx, -20, -500);
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
      remplir(ctx, '#fdfaf2', 6, 50);
      for (let i = 0; i < 7; i++) ellipse(ctx, -78 + i * 26, -540 + Math.abs(3 - i) * 8, 5, 5, '#c9b99a');
      break;
  }
}

function tete(ctx: Ctx, look: Look, etat: Etat, id: PersoId) {
  cheveuxArriere(ctx, look, etat);
  ctx.fillStyle = look.peau;
  ctx.fillRect(-24, -350, 48, 40);
  ctx.beginPath();
  if (look.coiffure === 'foulard') ctx.ellipse(0, -445, 104, 116, 0, 0, Math.PI * 2);
  else ctx.arc(0, -450, 118, 0, Math.PI * 2);
  remplir(ctx, look.peau, 6, 62);
  if (look.barbe) {
    ctx.beginPath();
    ctx.ellipse(0, -390, 92, 62, 0, 0.05 * Math.PI, 0.95 * Math.PI);
    ctx.closePath();
    remplir(ctx, '#8d8d8d');
  }
  const joues = etat.humeur === 'rire' ? 0.65 : 0.45;
  ellipse(ctx, -72, -400, 21, 12, `rgba(255,110,140,${joues})`);
  ellipse(ctx, 72, -400, 21, 12, `rgba(255,110,140,${joues})`);
  yeux(ctx, look, etat, id);
  trait(ctx, -3 + etat.regard * 4, -412, 3 + etat.regard * 4, -406, '#a0603a', 5);
  bouche(ctx, etat);
  cheveuxAvant(ctx, look, etat.regard);
}

type Main = [number, number];

/** Où se trouvent les mains (repère du personnage, pieds en 0). */
function mains(etat: Etat): [Main, Main] {
  const balance = Math.sin(etat.t * 9) * (etat.marche ? 18 : 0);
  const repos: [Main, Main] = [
    [-104 + balance, -172 + Math.sin(etat.t * 2) * 3],
    [104 - balance, -172 + Math.cos(etat.t * 2) * 3],
  ];
  switch (etat.tient) {
    case 'pancarte':
      return [
        [-112, -262],
        [112, -262],
      ];
    case 'mchicha':
      return [
        [-66, -200],
        [66, -200],
      ];
    case 'valise':
      return [repos[0], [128, -168]];
    case 'verre':
    case 'orange':
    case 'khobz':
      return [repos[0], [84, -292 + Math.sin(etat.t * 3) * 6]];
    case 'theiere':
      return [repos[0], [128, -520 + Math.sin(etat.t * 2) * 8]];
  }
  if (etat.salut) return [repos[0], [146 + Math.sin(etat.t * 7) * 16, -470 + Math.cos(etat.t * 7) * 10]];
  const g = etat.geste;
  if (g <= 0) return repos;
  const vague = Math.sin(etat.t * 6);
  const dir = etat.regard || 1;
  let cible: [Main, Main];
  switch (etat.typeGeste) {
    case 'ouvert':
      cible = [
        [-160, -330 + vague * 12],
        [160, -330 - vague * 12],
      ];
      break;
    case 'montre':
      cible = [repos[0], [170 * dir, -390 + vague * 6]];
      break;
    case 'salut':
      cible = [repos[0], [146 + vague * 18, -470 + Math.cos(etat.t * 6) * 10]];
      break;
    case 'coeur':
      cible = [
        [-34, -262 + vague * 4],
        [34, -262 - vague * 4],
      ];
      break;
  }
  return [
    [melange(repos[0][0], cible[0][0], g), melange(repos[0][1], cible[0][1], g)],
    [melange(repos[1][0], cible[1][0], g), melange(repos[1][1], cible[1][1], g)],
  ];
}

function vapeur(ctx: Ctx, t: number, x: number, y: number, echelle: number) {
  for (let i = 0; i < 3; i++) {
    const phase = (t * 0.8 + i / 3) % 1;
    ctx.beginPath();
    ctx.moveTo(x + (i - 1) * 14 * echelle, y);
    ctx.bezierCurveTo(x + 18 * echelle, y - 40 * echelle, x - 18 * echelle, y - 70 * echelle, x + (i - 1) * 10 * echelle, y - 110 * echelle * (0.5 + phase));
    ctx.strokeStyle = `rgba(255,255,255,${0.55 * (1 - phase)})`;
    ctx.lineWidth = 6 * echelle;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

function objetTenu(ctx: Ctx, etat: Etat, droite: Main) {
  const [hx, hy] = droite;
  switch (etat.tient) {
    case 'pancarte':
      rectRond(ctx, -150, -340, 300, 118, 10);
      remplir(ctx, '#fffdf5', 6);
      ctx.fillStyle = ENCRE;
      ctx.font = `900 36px ${police}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Inès + Adam', 0, -281);
      break;
    case 'valise':
      rectRond(ctx, 110, -168, 96, 158, 16);
      remplir(ctx, '#e76f51', 6, 170);
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
      vapeur(ctx, etat.t, hx, hy - 70, 0.7);
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
      // Mima verse le thé de haut : le filet descend jusqu'au verre sur la table
      // (repère du personnage : le dessus de la table est juste au-dessus des pieds).
      const bec = hx - 70;
      const ondule = Math.sin(etat.t * 20) * 2;
      trait(ctx, bec, hy + 34, bec + 6 + ondule, -14, 'rgba(201,130,43,0.9)', 9);
      ellipse(ctx, hx, hy + 30, 58, 46, '#c7ccd4', 5);
      ellipse(ctx, hx - 16, hy + 14, 16, 10, 'rgba(255,255,255,0.6)');
      ellipse(ctx, hx, hy - 22, 26, 12, '#aab0ba', 4);
      trait(ctx, hx - 52, hy + 30, bec, hy + 34, '#aab0ba', 10);
      break;
    }
    case 'mchicha':
      break;
  }
}

/** Le chat dessiné depuis ses pattes (0) ; `taille` 1 ≈ 220 px de haut. */
function chat(ctx: Ctx, t: number, x: number, y: number, taille: number, avecPain: boolean, etire = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(taille / Math.sqrt(etire), taille * etire);
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
  ctx.beginPath();
  ctx.ellipse(0, -64, 78, 60, 0, 0, Math.PI * 2);
  remplir(ctx, '#f2a04d', 6, 30);
  for (let i = 0; i < 3; i++) trait(ctx, -30 + i * 26, -118, -38 + i * 26, -82, '#d9822b', 9);
  ellipse(ctx, -40, -8, 20, 12, '#f2a04d', 5);
  ellipse(ctx, 34, -8, 20, 12, '#f2a04d', 5);
  for (const cote of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(cote * 20, -205);
    ctx.lineTo(cote * 50, -258 + Math.sin(t * 3 + cote) * 3);
    ctx.lineTo(cote * 62, -190);
    ctx.closePath();
    remplir(ctx, '#f2a04d', 6);
    ellipse(ctx, cote * 46, -214, 7, 13, '#ff9fb2');
  }
  ctx.beginPath();
  ctx.ellipse(0, -160, 66, 58, 0, 0, Math.PI * 2);
  remplir(ctx, '#f2a04d', 6, 30);
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

function personnage(ctx: Ctx, id: PersoId, x: number, sol: number, echelle: number, etat: Etat, etire = 1) {
  if (id === 'mchicha') {
    chat(ctx, etat.t, x, sol, echelle * 0.95, etat.tient === 'khobz', etire);
    return;
  }
  const look = LOOKS[id];
  const parle = etat.bouche >= 0;
  const respire = Math.sin(etat.t * 2.2 + DECALAGE[id]) * 4 + (parle ? etat.bouche * 6 : 0) + (etat.marche ? Math.abs(Math.sin(etat.t * 9)) * 10 : 0);
  ctx.save();
  ctx.translate(x, sol);
  ctx.scale((echelle * look.taille) / Math.sqrt(etire), echelle * look.taille * etire);
  if (look.sac) {
    rectRond(ctx, -96, -318, 192, 190, 40);
    remplir(ctx, look.sac, 6);
  }
  const pas = etat.marche ? Math.sin(etat.t * 9) : 0;
  for (const cote of [-1, 1]) {
    const leve = Math.max(0, pas * cote) * 22;
    if (!look.robe) {
      rectRond(ctx, cote * 30 - 18, -150, 36, 140 - leve, 14);
      remplir(ctx, look.bas, 5, cote > 0 ? 20 : 999);
    }
    ellipse(ctx, cote * 34, -10 - leve, 34, 16, look.chaussures, 5);
  }
  ctx.translate(0, -respire);
  if (look.robe) {
    ctx.beginPath();
    ctx.moveTo(-80, -330);
    ctx.lineTo(80, -330);
    ctx.lineTo(118, -14 + respire);
    ctx.lineTo(-118, -14 + respire);
    ctx.closePath();
    remplir(ctx, look.haut, 6, 34);
    trait(ctx, 0, -320, 0, -30 + respire, id === 'mima' ? '#e9c46a' : '#a8dadc', 8);
  } else {
    rectRond(ctx, -80, -334, 160, 200, 44);
    remplir(ctx, look.haut, 6, 34);
    if (id === 'yassine') trait(ctx, -74, -250, 74, -250, '#ffffff', 14);
    if (id === 'nour') ellipse(ctx, 0, -220, 34, 22, 'rgba(255,255,255,0.25)');
  }
  if (look.sac) {
    trait(ctx, -52, -330, -58, -200, '#e0a800', 12);
    trait(ctx, 52, -330, 58, -200, '#e0a800', 12);
  }
  const [g, d] = mains(etat);
  membre(ctx, -70, -306, g[0], g[1], look.haut, 30);
  ellipse(ctx, g[0], g[1], 20, 20, look.peau, 5);
  membre(ctx, 70, -306, d[0], d[1], look.haut, 30);
  ellipse(ctx, d[0], d[1], 20, 20, look.peau, 5);
  // La tête penche un peu : vers celui qui parle, ou en rythme quand il parle.
  const penche = parle ? Math.sin(etat.t * 2.6) * 0.05 : etat.regard * 0.05;
  ctx.save();
  ctx.translate(0, -340);
  ctx.rotate(penche);
  ctx.translate(0, 340);
  tete(ctx, look, etat, id);
  ctx.restore();
  if (etat.tient === 'mchicha') chat(ctx, etat.t, 0, -150, 0.62, false);
  objetTenu(ctx, etat, d);
  if (etat.tient === 'pancarte' || etat.tient === 'mchicha') {
    ellipse(ctx, g[0], g[1], 20, 20, look.peau, 5);
    ellipse(ctx, d[0], d[1], 20, 20, look.peau, 5);
  }
  ctx.restore();
}

function hautTete(id: PersoId, echelle: number): number {
  if (id === 'mchicha') return 250 * echelle;
  return 590 * echelle * LOOKS[id].taille;
}

// --- La caméra ----------------------------------------------------------------

interface Camera {
  x: number;
  zoom: number;
}

const ECHELLE_PERSO = 0.8;

function cameraDuPlan(plan: Plan): Camera {
  const xs = plan.persos.map((q) => q.x * LARGEUR);
  const centre = xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : LARGEUR / 2;
  const bouge = plan.persos.some((q) => q.depuis !== undefined || q.saut);
  let cam: Camera;
  if (bouge) cam = { x: LARGEUR / 2, zoom: 1 };
  else if (!plan.parle) cam = { x: centre, zoom: 1.06 };
  else {
    const parleur = plan.persos.find((q) => q.id === plan.parle);
    cam = { x: 0.65 * (parleur ? parleur.x * LARGEUR : centre) + 0.35 * centre, zoom: 1.25 };
  }
  const demi = LARGEUR / (2 * cam.zoom);
  return { x: borne(cam.x, demi - 120, LARGEUR - demi + 120), zoom: cam.zoom };
}

/** La caméra glisse d'un plan à l'autre quand on reste dans le même lieu. */
function cameraA(ep: Episode, index: number, local: number): Camera {
  const cible = cameraDuPlan(ep.plans[index]);
  const avant = index > 0 ? ep.plans[index - 1] : undefined;
  if (!avant || avant.decor !== ep.plans[index].decor) return cible;
  const depart = cameraDuPlan(avant);
  const v = doux(local / 0.7);
  return { x: melange(depart.x, cible.x, v), zoom: melange(depart.zoom, cible.zoom, v) };
}

/** Place un calque : `k` < 1 pour le fond (bouge moins), > 1 pour le devant. */
function calque(ctx: Ctx, cam: Camera, k: number) {
  const z = 1 + (cam.zoom - 1) * k;
  const fx = LARGEUR / 2 + (cam.x - LARGEUR / 2) * k;
  ctx.translate(LARGEUR / 2, CENTRE_Y);
  ctx.scale(z, z);
  ctx.translate(-fx, -CENTRE_Y);
}

function versEcran(cam: Camera, x: number, y: number): [number, number] {
  return [LARGEUR / 2 + (x - cam.x) * cam.zoom, CENTRE_Y + (y - CENTRE_Y) * cam.zoom];
}

// --- Les décors -------------------------------------------------------------------

function nuages(ctx: Ctx, t: number, y: number) {
  for (let i = 0; i < 4; i++) {
    const x = ((i * 430 + t * 14) % (X1 - X0 + 300)) + X0 - 150;
    const yy = y + (i % 3) * 90;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
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

function oiseaux(ctx: Ctx, t: number) {
  for (let i = 0; i < 3; i++) {
    const x = ((t * 60 + i * 260) % (X1 - X0)) + X0;
    const y = 700 + i * 50 + Math.sin(t * 2 + i) * 20;
    const aile = Math.sin(t * 10 + i) * 12;
    ctx.beginPath();
    ctx.moveTo(x - 22, y - aile);
    ctx.quadraticCurveTo(x - 10, y - 10, x, y);
    ctx.quadraticCurveTo(x + 10, y - 10, x + 22, y - aile);
    ctx.strokeStyle = '#33415c';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.stroke();
  }
}

function portFond(ctx: Ctx, t: number) {
  const ciel = ctx.createLinearGradient(0, 0, 0, 1080);
  ciel.addColorStop(0, '#5fb4ee');
  ciel.addColorStop(1, '#d8f1ff');
  ctx.fillStyle = ciel;
  ctx.fillRect(X0, 0, X1 - X0, 1100);
  const halo = 130 + Math.sin(t * 2) * 6;
  ellipse(ctx, 880, 820, halo, halo, 'rgba(255,209,102,0.3)');
  ellipse(ctx, 880, 820, 80, 80, '#ffd166');
  nuages(ctx, t, 760);
  oiseaux(ctx, t);
  for (const gx of [40, 200, -160]) {
    trait(ctx, gx, 1060, gx + 30, 900, '#e76f51', 10);
    trait(ctx, gx + 60, 1060, gx + 30, 900, '#e76f51', 10);
    trait(ctx, gx - 40, 905, gx + 150, 905, '#e76f51', 10);
  }
}

function portMer(ctx: Ctx, t: number, objets: readonly ObjetId[]) {
  const mer = ctx.createLinearGradient(0, 1050, 0, 1290);
  mer.addColorStop(0, '#2b8fd6');
  mer.addColorStop(1, '#1769aa');
  ctx.fillStyle = mer;
  ctx.fillRect(X0, 1050, X1 - X0, 250);
  for (let i = 0; i < 12; i++) {
    const vx = ((i * 140 + t * 40) % (X1 - X0)) + X0;
    trait(ctx, vx, 1100 + (i % 3) * 60, vx + 50, 1100 + (i % 3) * 60, 'rgba(255,255,255,0.55)', 5);
  }
  for (let i = 0; i < 8; i++) {
    const brille = Math.max(0, Math.sin(t * 3 + i * 1.7));
    ellipse(ctx, 120 + i * 130, 1080 + (i % 2) * 70, 6 * brille, 6 * brille, 'rgba(255,255,255,0.9)');
  }
  if (!objets.includes('ferry')) return;
  const fy = Math.sin(t * 1.3) * 5;
  ctx.beginPath();
  ctx.moveTo(470, 1130 + fy);
  ctx.lineTo(1240, 1130 + fy);
  ctx.lineTo(1240, 1230 + fy);
  ctx.lineTo(520, 1230 + fy);
  ctx.closePath();
  remplir(ctx, '#ffffff', 6);
  ctx.fillStyle = '#1d3557';
  ctx.fillRect(510, 1195 + fy, 730, 22);
  rectRond(ctx, 600, 1040 + fy, 600, 92, 10);
  remplir(ctx, '#f8f9fa', 6);
  for (let i = 0; i < 11; i++) ellipse(ctx, 640 + i * 50, 1086 + fy, 12, 12, '#90caf9', 3);
  rectRond(ctx, 820, 960 + fy, 70, 84, 6);
  remplir(ctx, '#e63946', 6);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(820, 985 + fy, 70, 16);
  for (let i = 0; i < 4; i++) {
    const ph = (t * 0.5 + i / 4) % 1;
    ellipse(ctx, 855 - ph * 120, 940 - ph * 160, 20 + ph * 30, 18 + ph * 26, `rgba(255,255,255,${0.6 * (1 - ph)})`);
  }
}

function portQuai(ctx: Ctx, objets: readonly ObjetId[]) {
  ctx.fillStyle = '#ddc9a3';
  ctx.fillRect(X0, 1290, X1 - X0, HAUTEUR - 1290 + 400);
  ctx.fillStyle = '#c9b48a';
  for (let y = 1360; y < HAUTEUR + 300; y += 90) ctx.fillRect(X0, y, X1 - X0, 5);
  ctx.fillStyle = '#ffd60a';
  ctx.fillRect(X0, 1290, X1 - X0, 14);
  for (const bx of [-120, 1180]) {
    rectRond(ctx, bx, 1300, 40, 50, 10);
    remplir(ctx, '#33415c', 4);
  }
  if (!objets.includes('voiture')) return;
  rectRond(ctx, 690, SOL - 230, 380, 170, 50);
  remplir(ctx, '#e63946', 7, 900);
  rectRond(ctx, 740, SOL - 330, 230, 120, 40);
  remplir(ctx, '#e63946', 7);
  rectRond(ctx, 765, SOL - 310, 180, 80, 20);
  remplir(ctx, '#bde0fe', 5);
  ellipse(ctx, 800, SOL - 290, 30, 10, 'rgba(255,255,255,0.7)');
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

function cuisineMur(ctx: Ctx, t: number) {
  ctx.fillStyle = '#fbe8c8';
  ctx.fillRect(X0, 0, X1 - X0, 1100);
  const lumiere = ctx.createRadialGradient(540, 800, 40, 540, 800, 520);
  lumiere.addColorStop(0, 'rgba(255,240,200,0.7)');
  lumiere.addColorStop(1, 'rgba(255,240,200,0)');
  ctx.fillStyle = lumiere;
  ctx.fillRect(X0, 200, X1 - X0, 900);
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
  ctx.save();
  ctx.clip();
  nuages(ctx, t * 0.5, 680);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(420, 900, 70, 100);
  ctx.fillRect(500, 870, 90, 130);
  ctx.fillRect(600, 920, 60, 80);
  ctx.restore();
  ctx.lineWidth = 22;
  ctx.strokeStyle = '#2b59c3';
  ctx.stroke();
  ctx.fillStyle = '#8c5a3c';
  ctx.fillRect(40, 860, 280, 18);
  for (const [px, c] of [
    [90, '#e9b44c'],
    [180, '#2b59c3'],
    [265, '#e76f51'],
  ] as const)
    ellipse(ctx, px, 830, 34, 30, c, 5);
  ctx.fillStyle = '#8c5a3c';
  ctx.fillRect(760, 860, 280, 18);
  for (const px of [800, 860, 920, 980]) ellipse(ctx, px, 835, 18, 26, '#c7ccd4', 4);
  zellige(ctx, X0, 1100, X1 - X0, 250, 64);
  ctx.fillStyle = '#2b59c3';
  ctx.fillRect(X0, 1092, X1 - X0, 16);
}

function cuisineSol(ctx: Ctx) {
  ctx.fillStyle = '#c8693f';
  ctx.fillRect(X0, 1350, X1 - X0, HAUTEUR - 1350 + 400);
  ctx.fillStyle = '#b65a33';
  for (let y = 1420; y < HAUTEUR + 300; y += 100) ctx.fillRect(X0, y, X1 - X0, 6);
}

function tableCuisine(ctx: Ctx, t: number, objets: readonly ObjetId[]) {
  ellipse(ctx, 540, 1560, 420, 70, '#6d4430', 7);
  ctx.fillStyle = '#6d4430';
  ctx.fillRect(130, 1560, 820, 110);
  ctx.beginPath();
  ctx.ellipse(540, 1520, 420, 70, 0, 0, Math.PI * 2);
  remplir(ctx, '#9c6644', 7);
  ellipse(ctx, 540, 1518, 330, 46, '#f4f1e8');
  if (objets.includes('theiere')) {
    ctx.beginPath();
    ctx.ellipse(400, 1465, 58, 48, 0, 0, Math.PI * 2);
    remplir(ctx, '#c7ccd4', 6, 420);
    ellipse(ctx, 384, 1448, 16, 10, 'rgba(255,255,255,0.6)');
    ellipse(ctx, 400, 1414, 26, 12, '#aab0ba', 4);
    trait(ctx, 346, 1462, 300, 1430, '#aab0ba', 12);
    vapeur(ctx, t, 300, 1420, 0.8);
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
      ellipse(ctx, vx + 6, 1442, 9, 5, '#52b788');
    }
    vapeur(ctx, t + 0.4, 630, 1430, 0.6);
  }
  if (objets.includes('panier-khobz')) {
    ellipse(ctx, 820, 1492, 90, 36, '#b07d48', 6);
    ellipse(ctx, 790, 1466, 56, 28, '#d9a066', 5);
    ellipse(ctx, 850, 1460, 52, 26, '#e0b077', 5);
  }
}

function marcheFond(ctx: Ctx, t: number) {
  const ciel = ctx.createLinearGradient(0, 0, 0, 700);
  ciel.addColorStop(0, '#4dabf7');
  ciel.addColorStop(1, '#a5d8ff');
  ctx.fillStyle = ciel;
  ctx.fillRect(X0, 0, X1 - X0, 800);
  nuages(ctx, t, 420);
  oiseaux(ctx, t * 0.8);
}

function marcheMur(ctx: Ctx, t: number) {
  const mur = ctx.createLinearGradient(0, 700, 0, 1350);
  mur.addColorStop(0, '#e9b872');
  mur.addColorStop(1, '#d49a52');
  ctx.fillStyle = mur;
  ctx.beginPath();
  ctx.moveTo(X0, 700);
  for (let x = X0; x <= X1; x += 120) ctx.lineTo(x, 700 - (Math.round((x - X0) / 120) % 2 === 0 ? 40 : 0));
  ctx.lineTo(X1, 1350);
  ctx.lineTo(X0, 1350);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(90, 1350);
  ctx.lineTo(90, 1040);
  ctx.arc(210, 1040, 120, Math.PI, 0);
  ctx.lineTo(330, 1350);
  ctx.closePath();
  remplir(ctx, '#1c5d99', 7, 250);
  ellipse(ctx, 300, 1200, 10, 10, '#e9c46a');
  for (const [lx, ly] of [
    [470, 820],
    [640, 780],
    [-60, 800],
  ] as const) {
    ctx.save();
    ctx.translate(lx, 700);
    ctx.rotate(Math.sin(t * 1.6 + lx) * 0.08);
    trait(ctx, 0, 0, 0, ly - 740, '#6c584c', 4);
    ellipse(ctx, 0, ly - 690, 64, 64, `rgba(255,209,102,${0.25 + 0.12 * Math.sin(t * 3 + lx)})`);
    rectRond(ctx, -26, ly - 740, 52, 90, 14);
    remplir(ctx, '#e9c46a', 5, 8);
    ctx.restore();
  }
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(760 + i * 54, 900);
    ctx.lineTo(814 + i * 54, 900);
    ctx.lineTo(814 + i * 54, 980);
    ctx.quadraticCurveTo(787 + i * 54, 1010 + Math.sin(t * 2 + i) * 4, 760 + i * 54, 980);
    ctx.closePath();
    ctx.fillStyle = i % 2 === 0 ? '#e63946' : '#fffdf5';
    ctx.fill();
  }
}

function marcheSol(ctx: Ctx) {
  ctx.fillStyle = '#c9a27e';
  ctx.fillRect(X0, 1350, X1 - X0, HAUTEUR - 1350 + 400);
  for (let j = 0; j < 8; j++) for (let i = -2; i < 11; i++) ellipse(ctx, i * 130 + (j % 2) * 65, 1400 + j * 80, 50, 20, '#b8906c');
}

function etalMarche(ctx: Ctx, t: number, objets: readonly ObjetId[]) {
  if (!objets.includes('oranges')) return;
  rectRond(ctx, 790, 1240, 400, 110, 10);
  remplir(ctx, '#8c5a3c', 6, 1000);
  for (let rang = 0; rang < 3; rang++) {
    for (let i = 0; i < 5 - rang; i++) {
      ellipse(ctx, 830 + rang * 26 + i * 52, 1220 - rang * 42, 27, 27, '#ff9f1c', 4);
      ellipse(ctx, 822 + rang * 26 + i * 52, 1210 - rang * 42, 7, 5, 'rgba(255,255,255,0.6)');
    }
  }
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
  remplir(ctx, '#c9934f', 6, 1000);
  for (let i = 0; i < 4; i++) trait(ctx, 860 + i * 12, 1470 + i * 25, 1055 - i * 12, 1470 + i * 25, '#a87436', 5);
  for (let i = 0; i < 4; i++) ellipse(ctx, 890 + i * 46, 1430, 24, 24, '#ff9f1c', 4);
}

type Calque = (ctx: Ctx, t: number, objets: readonly ObjetId[]) => void;
const rien: Calque = () => undefined;

/** Chaque décor en quatre calques, du plus lointain au plus proche. */
const DECORS: Record<DecorId, { fond: Calque; milieu: Calque; sol: Calque; devant: Calque }> = {
  port: { fond: portFond, milieu: portMer, sol: (ctx, _t, o) => portQuai(ctx, o), devant: rien },
  cuisine: { fond: rien, milieu: cuisineMur, sol: (ctx) => cuisineSol(ctx), devant: tableCuisine },
  marche: { fond: marcheFond, milieu: marcheMur, sol: (ctx) => marcheSol(ctx), devant: etalMarche },
};

// --- Le texte ------------------------------------------------------------------

/**
 * Écrit un texte coloré centré sur `cx`, ligne par ligne. Seules les
 * `visibles` premières lettres sont montrées ; un mot de darija qui vient
 * d'apparaître grossit un instant.
 */
function texteColore(ctx: Ctx, texte: string, cx: number, y: number, taille: number, largeurMax: number, couleur: string, visibles = Infinity, couleurFort = DARIJA) {
  ctx.font = `800 ${taille}px ${police}`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';
  const rangees = lignes(texte, largeurMax, (s) => ctx.measureText(s).width);
  let compte = 0;
  rangees.forEach((ligne, i) => {
    const largeur = ligne.reduce((s, m) => s + ctx.measureText(m.texte).width, 0);
    let x = cx - largeur / 2;
    const yy = y + i * taille * 1.25;
    for (const m of ligne) {
      const w = ctx.measureText(m.texte).width;
      const reste = visibles - compte;
      if (reste > 0) {
        ctx.fillStyle = m.fort ? couleurFort : couleur;
        if (m.fort && reste >= m.texte.length && visibles !== Infinity) {
          const depuis = (reste - m.texte.length) / LETTRES_PAR_SECONDE;
          const s = 1 + 0.28 * Math.sin(Math.min(1, depuis / 0.25) * Math.PI);
          ctx.save();
          ctx.translate(x + w / 2, yy - taille * 0.35);
          ctx.scale(s, s);
          ctx.fillText(m.texte, -w / 2, taille * 0.35);
          ctx.restore();
        } else {
          ctx.fillText(m.texte.slice(0, Math.floor(reste)), x, yy);
        }
      }
      compte += m.texte.length;
      x += w;
    }
  });
  return rangees.length;
}

interface Boite {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Où part la queue de la bulle, pour ne pas poser l'étiquette dessus. */
  queue?: number;
}

function bulle(ctx: Ctx, texte: string, qui: PersoId | undefined, cible: [number, number] | undefined, local: number, duree: number): Boite {
  const taille = 60;
  ctx.font = `800 ${taille}px ${police}`;
  const largeurMax = 820;
  const rangees = lignes(texte, largeurMax, (s) => ctx.measureText(s).width);
  const largeurTexte = Math.max(...rangees.map((l) => l.reduce((s, m) => s + ctx.measureText(m.texte).width, 0)));
  const w = Math.max(360, largeurTexte + 110);
  const h = rangees.length * taille * 1.25 + 90;
  const vise = cible ? cible[0] : LARGEUR / 2;
  const x = borne(vise - w / 2, 50, LARGEUR - 50 - w);
  const y = 290;
  const sortie = borne((duree - local) / 0.14, 0, 1);
  const echelle = (0.7 + 0.3 * rebond(local / 0.28)) * (0.92 + 0.08 * sortie);
  ctx.save();
  ctx.globalAlpha = sortie;
  ctx.translate(x + w / 2, y + h);
  ctx.scale(echelle, echelle);
  ctx.translate(-(x + w / 2), -(y + h));
  rectRond(ctx, x + 10, y + 14, w, h, qui ? 60 : 24);
  ctx.fillStyle = 'rgba(29,22,48,0.18)';
  ctx.fill();
  const base = cible ? borne(cible[0], x + 80, x + w - 80) : 0;
  if (qui && cible) {
    const bout = Math.min(cible[1] - 30, y + h + 220);
    ctx.beginPath();
    ctx.moveTo(base - 40, y + h - 10);
    ctx.quadraticCurveTo(base, y + h + 40, cible[0], bout);
    ctx.quadraticCurveTo(base + 10, y + h + 30, base + 40, y + h - 10);
    ctx.closePath();
    remplir(ctx, '#ffffff', 7);
  }
  rectRond(ctx, x, y, w, h, qui ? 60 : 24);
  remplir(ctx, qui ? '#ffffff' : '#ffe066', 7);
  if (qui && cible) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(base - 34, y + h - 12, 68, 10);
  }
  if (qui) {
    const nom = NOMS[qui][langue];
    ctx.font = `800 40px ${police}`;
    const wn = ctx.measureText(nom).width + 50;
    rectRond(ctx, x + 40, y - 34, wn, 64, 32);
    remplir(ctx, qui === 'mchicha' ? DARIJA : LOOKS[qui as Exclude<PersoId, 'mchicha'>].accent, 5);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(nom, x + 65, y - 2);
  }
  const visibles = Math.max(0, (local - DEBUT_ECRITURE) * LETTRES_PAR_SECONDE);
  texteColore(ctx, texte, x + w / 2, y + 45 + taille * 0.85, taille, largeurMax, ENCRE, visibles);
  ctx.restore();
  return { x, y, w, h, queue: qui && cible ? base : undefined };
}

/** Les petites étiquettes « chouf = regarde » sous la bulle. */
function etiquettesTraduction(
  ctx: Ctx,
  mots: EntreeLexique[],
  texte: string,
  boite: Boite,
  local: number,
  duree: number,
  quand: (finDuMot: number, longueur: number) => number = (finDuMot) => DEBUT_ECRITURE + finDuMot / LETTRES_PAR_SECONDE + 0.1,
) {
  const brut = texteBrut(texte).toLowerCase();
  const sortie = borne((duree - local) / 0.14, 0, 1);
  let y = boite.y + boite.h + 40;
  for (const m of mots) {
    const position = brut.indexOf(m.mot.toLowerCase());
    const apparition = quand(position < 0 ? 4 : position + m.mot.length, brut.length);
    const v = (local - apparition) / 0.3;
    if (v <= 0) continue;
    const sens = langue === 'es' ? m.es : m.fr;
    ctx.font = `800 48px ${police}`;
    const w1 = ctx.measureText(m.mot).width;
    const w2 = ctx.measureText(` = ${sens}`).width;
    const w = w1 + w2 + 60;
    // à côté de la queue de la bulle, du côté où il y a de la place
    let x = boite.x + boite.w / 2 - w / 2;
    if (boite.queue !== undefined) x = boite.queue + 70 + w < LARGEUR - 40 ? boite.queue + 70 : boite.queue - 70 - w;
    x = borne(x, 40, LARGEUR - 40 - w);
    ctx.save();
    ctx.globalAlpha = borne(v, 0, 1) * sortie;
    ctx.translate(0, (1 - rebond(v)) * 40);
    rectRond(ctx, x, y, w, 76, 38);
    remplir(ctx, '#0f1f3d');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffb37a';
    ctx.fillText(m.mot, x + 30, y + 40);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(` = ${sens}`, x + 30 + w1, y + 40);
    ctx.restore();
    y += 96;
  }
}

/** Le sous-titre en bas de l'image, pendant que le personnage parle (au choix, sur le site). */
function sousTitre(ctx: Ctx, texte: string, qui: PersoId | undefined, local: number, duree: number) {
  const v = borne(local / 0.15, 0, 1) * borne((duree - local) / 0.15, 0, 1);
  if (v <= 0) return;
  const taille = 50;
  ctx.font = `800 ${taille}px ${police}`;
  const prefixe = qui ? `${NOMS[qui][langue]} : ` : '';
  const rangees = lignes(prefixe + texte, 940, (s2) => ctx.measureText(s2).width);
  const h = rangees.length * taille * 1.25 + 40;
  ctx.save();
  ctx.globalAlpha = v;
  rectRond(ctx, 40, 1560, LARGEUR - 80, h, 28);
  ctx.fillStyle = 'rgba(15,31,61,0.82)';
  ctx.fill();
  texteColore(ctx, prefixe + texte, LARGEUR / 2, 1560 + 20 + taille * 0.9, taille, 940, '#ffffff', Infinity, '#ffb37a');
  ctx.restore();
}

function etiquette(ctx: Ctx, ep: Episode) {
  const texte = `KALIMAT · ${ECRAN[langue].episode.toUpperCase()} ${ep.numero}`;
  ctx.font = `800 34px ${police}`;
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

function scintillements(ctx: Ctx, t: number, n: number) {
  for (let i = 0; i < n; i++) {
    const s = Math.max(0, Math.sin(t * 4 + i * 2.1)) * 14;
    if (s < 1) continue;
    ctx.save();
    ctx.translate(hasard(i + 300) * LARGEUR, hasard(i + 400) * 1300 + 100);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = 'rgba(255,230,150,0.9)';
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.restore();
  }
}

const BANDE: PersoId[] = ['ines', 'adam', 'yassine', 'nour', 'mima'];

function repos(t: number, extra: Partial<Etat> = {}): Etat {
  return { t, bouche: -1, geste: 0, typeGeste: 'salut', humeur: 'content', regard: 0, marche: false, salut: false, ...extra };
}

/** Les personnages arrivent en sautant, l'un après l'autre, puis sautillent en saluant. */
function bandeDesPersos(ctx: Ctx, t: number, sol: number, echelle: number, decalage = 0.35, bouches: Partial<Record<PersoId, number>> = {}) {
  BANDE.forEach((id, i) => {
    const arrivee = borne((t - i * decalage) / 0.45, 0, 1);
    if (arrivee <= 0) return;
    const monte = (1 - rebond(arrivee)) * 500;
    const saute = arrivee >= 1 ? Math.max(0, Math.sin(t * 5 - i * 0.7)) * 26 : 0;
    personnage(ctx, id, 130 + i * 205, sol - saute + monte, echelle, repos(t + i, { salut: true, humeur: i % 2 ? 'rire' : 'content', bouche: bouches[id] ?? -1 }));
  });
}

function ecranGenerique(ctx: Ctx, ep: Episode, local: number) {
  const fond = ctx.createLinearGradient(0, 0, 0, HAUTEUR);
  fond.addColorStop(0, '#0f1f3d');
  fond.addColorStop(1, '#1c3a6e');
  ctx.fillStyle = fond;
  ctx.fillRect(0, 0, LARGEUR, HAUTEUR);
  etoiles(ctx, local, 'rgba(233,196,106,0.16)');
  scintillements(ctx, local, 14);
  const e = rebond(local / 0.8);
  ctx.save();
  ctx.translate(LARGEUR / 2, 560);
  ctx.scale(e, e);
  ctx.rotate(Math.sin(local * 2.2) * 0.025);
  ctx.font = `900 190px ${police}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 18;
  ctx.strokeStyle = ENCRE;
  ctx.strokeText('Kalimat', 0, 0);
  ctx.fillStyle = '#ffd166';
  ctx.fillText('Kalimat', 0, 0);
  ctx.restore();
  ctx.globalAlpha = borne((local - 0.5) / 0.4, 0, 1);
  ctx.font = `700 64px ${police}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(ECRAN[langue].sousTitre, LARGEUR / 2, 720);
  ctx.globalAlpha = borne((local - 0.9) / 0.2, 0, 1);
  const badge = rebond((local - 0.9) / 0.4);
  ctx.save();
  ctx.translate(LARGEUR / 2, 899);
  ctx.scale(badge, badge);
  rectRond(ctx, -170, -38, 340, 76, 38);
  remplir(ctx, '#e63946');
  ctx.font = `800 44px ${police}`;
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${ECRAN[langue].episode} ${ep.numero}`, 0, 0);
  ctx.restore();
  ctx.globalAlpha = 1;
  texteColore(ctx, ep.titre[langue], LARGEUR / 2, 1060, 84, 900, '#ffffff', Math.max(0, (local - 1.2) * 30));
  bandeDesPersos(ctx, local - 1.4, 1640, 0.62, 0.18);
  if (local > 2.6) chat(ctx, local, 980, 1700 - Math.max(0, Math.sin((local - 2.6) * 6)) * 60 * Math.max(0, 1 - (local - 2.6)), 0.55, false);
}

function ecranMots(ctx: Ctx, ep: Episode, local: number) {
  ctx.fillStyle = '#fff4d6';
  ctx.fillRect(0, 0, LARGEUR, HAUTEUR);
  etoiles(ctx, local, 'rgba(233,180,76,0.18)');
  const titre = rebond(local / 0.4);
  ctx.save();
  ctx.translate(LARGEUR / 2, 300);
  ctx.scale(titre, titre);
  ctx.font = `900 84px ${police}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#0f1f3d';
  ctx.fillText(ECRAN[langue].motsDuJour, 0, 0);
  ctx.restore();
  trait(ctx, 280, 365, 280 + 520 * doux(local / 0.6), 365, '#e9b44c', 12);
  const pas = 3;
  ep.mots.forEach((m, i) => {
    const debut = i * pas + 0.2;
    if (local < debut) return;
    const glisse = (1 - doux((local - debut) / 0.45)) * 900;
    const actif = local < debut + pas;
    ctx.save();
    ctx.translate(LARGEUR / 2 + glisse, 600 + i * 330);
    const s = actif ? 1 + 0.04 * Math.sin((local - debut) * 4) : 1;
    ctx.scale(s, s);
    rectRond(ctx, -430, -116, 880, 260, 40);
    ctx.fillStyle = 'rgba(29,22,48,0.15)';
    ctx.fill();
    rectRond(ctx, -440, -130, 880, 260, 40);
    remplir(ctx, '#ffffff', actif ? 9 : 5);
    ctx.fillStyle = ['#e63946', '#2a9d8f', '#3a86ff'][i];
    rectRond(ctx, -440, -130, 40, 260, 20);
    ctx.fill();
    const mot = rebond((local - debut - 0.3) / 0.35);
    ctx.save();
    ctx.translate(20, -40);
    ctx.scale(mot, mot);
    ctx.font = `900 104px ${police}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = DARIJA;
    ctx.fillText(m.mot, 0, 0);
    ctx.restore();
    ctx.globalAlpha = borne((local - debut - 0.7) / 0.3, 0, 1);
    ctx.font = `700 64px ${police}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = ENCRE;
    ctx.fillText(`= ${m.sens[langue]}`, 20, 82);
    ctx.restore();
  });
  const dansLePas = local % pas;
  const enCours = Math.min(2, Math.floor(local / pas));
  const voix = clip(ep, langue, `m${enCours}`);
  const bouche = voix ? ouvertureVoix(voix, dansLePas - 0.45 + DEBUT_VOIX) : dansLePas > 0.4 && dansLePas < 1.6 && local < 3 * pas ? 0.5 + 0.5 * Math.sin(local * 18) : -1;
  personnage(ctx, 'yassine', 860, 1900, 0.72, repos(local, { bouche, geste: 1, typeGeste: 'montre', regard: -1 }));
}

function ecranFin(ctx: Ctx, ep: Episode, local: number) {
  const fond = ctx.createLinearGradient(0, 0, 0, HAUTEUR);
  fond.addColorStop(0, '#ff9f1c');
  fond.addColorStop(1, '#ff6b6b');
  ctx.fillStyle = fond;
  ctx.fillRect(0, 0, LARGEUR, HAUTEUR);
  for (let i = 0; i < 70; i++) {
    const x = hasard(i) * LARGEUR + Math.sin(local * 2 + i) * 20;
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
  ctx.translate(LARGEUR / 2, 520);
  ctx.scale(e, e);
  ctx.rotate(Math.sin(local * 3) * 0.03);
  ctx.font = `900 130px ${police}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineWidth = 16;
  ctx.strokeStyle = ENCRE;
  ctx.strokeText(ECRAN[langue].aDemain, 0, 0, 1000);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(ECRAN[langue].aDemain, 0, 0, 1000);
  ctx.restore();
  const reste = texteFin(ep, langue);
  ctx.font = `800 100px ${police}`;
  const nb = lignes(reste, 820, (s) => ctx.measureText(s).width).length;
  const boite = rebond((local - 0.3) / 0.4);
  ctx.save();
  ctx.translate(LARGEUR / 2, 700);
  ctx.scale(boite, boite);
  ctx.translate(-LARGEUR / 2, -700);
  rectRond(ctx, 90, 700, 900, 100 + nb * 125, 50);
  remplir(ctx, '#ffffff', 7);
  texteColore(ctx, reste, LARGEUR / 2, 835, 100, 820, ENCRE);
  ctx.restore();
  const prochain = suivant(ep);
  if (prochain && local > 1) {
    const v = rebond((local - 1) / 0.4);
    ctx.save();
    ctx.translate(LARGEUR / 2, 1130);
    ctx.scale(v, v);
    const texte = `${ECRAN[langue].demain} : ${prochain.titre[langue]}`;
    ctx.font = `800 52px ${police}`;
    const w = Math.min(980, ctx.measureText(texte).width + 80);
    rectRond(ctx, -w / 2, -48, w, 96, 48);
    remplir(ctx, '#0f1f3d');
    ctx.fillStyle = '#ffd166';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(texte, 0, 2, 940);
    ctx.restore();
  }
  const voixFin = clip(ep, langue, 'f');
  bandeDesPersos(ctx, local + 2, 1640, 0.62, 0.35, voixFin ? { ines: ouvertureVoix(voixFin, local - 0.35 + DEBUT_VOIX) } : {});
  chat(ctx, local, 980, 1700 - Math.max(0, Math.sin(local * 5)) * 40, 0.55, false);
}

// --- Un plan --------------------------------------------------------------------

interface Position {
  placement: Placement;
  x: number;
  sol: number;
  hauteur: number;
  marche: boolean;
  etire: number;
}

function positions(persos: readonly Placement[], local: number, duree: number): Position[] {
  const trajet = Math.min(1.3, duree * 0.7);
  return persos.map((placement) => {
    const m = borne(local / trajet, 0, 1);
    const depart = placement.depuis ?? placement.x;
    const x = (depart + (placement.x - depart) * doux(m)) * LARGEUR;
    const saut = placement.saut && m < 1 ? Math.sin(m * Math.PI) * 300 : 0;
    const perche = (placement.perche ?? 0) * (placement.saut ? doux(m) : 1);
    // étiré pendant le saut, écrasé à l'atterrissage
    let etire = 1;
    if (placement.saut) etire = m < 1 ? 1 + 0.18 * Math.cos(m * Math.PI) : 1 - 0.16 * Math.max(0, 1 - (local - trajet) / 0.2);
    return { placement, x, sol: SOL - saut - perche, hauteur: saut + perche, marche: placement.depuis !== undefined && m < 1, etire };
  });
}

function ecranPlan(ctx: Ctx, ep: Episode, index: number, local: number, duree: number, t: number) {
  const plan = ep.plans[index];
  const objets = plan.objets ?? [];
  const texte = plan.texte[langue];
  const pos = positions(plan.persos, local, duree);
  const parleur = pos.find((q) => q.placement.id === plan.parle);
  const cam = cameraA(ep, index, local);
  const calques = DECORS[plan.decor];
  const voix = clip(ep, langue, cleDuPlan(index));
  const dessinerCalque = (k: number, fn: () => void) => {
    ctx.save();
    calque(ctx, cam, k);
    fn();
    ctx.restore();
  };
  dessinerCalque(0.3, () => calques.fond(ctx, t, objets));
  dessinerCalque(0.65, () => calques.milieu(ctx, t, objets));
  dessinerCalque(1, () => {
    calques.sol(ctx, t, objets);
    for (const q of pos) {
      const reduit = 1 / (1 + q.hauteur / 300);
      ellipse(ctx, q.x, SOL + 6, (q.placement.id === 'mchicha' ? 60 : 78) * reduit, 14 * reduit, 'rgba(29,22,48,0.18)');
    }
    const ordre = [...pos].sort((a, b) => Number(a.placement.id === 'mchicha') - Number(b.placement.id === 'mchicha'));
    const finParole = voix ? DEBUT_VOIX + voix.duree : DEBUT_ECRITURE + texteBrut(texte).length / LETTRES_PAR_SECONDE;
    for (const q of ordre) {
      const id = q.placement.id;
      const parle = plan.parle === id;
      const regard = parleur && parleur !== q ? Math.sign(parleur.x - q.x) : parle ? Math.sign(cam.x - q.x) * 0.5 : 0;
      const geste = parle ? doux((local - 0.1) / 0.3) * (1 - doux((local - finParole - 0.2) / 0.4)) : 0;
      const etat: Etat = {
        t: t + DECALAGE[id],
        bouche: parle ? (voix ? ouvertureVoix(voix, local) : ouvertureBouche(texte, local)) : -1,
        geste,
        typeGeste: GESTES[(index + texte.length) % GESTES.length],
        humeur: q.placement.humeur ?? 'content',
        regard,
        marche: q.marche,
        salut: false,
        tient: q.placement.tient,
      };
      personnage(ctx, id, q.x, q.sol, ECHELLE_PERSO, etat, q.etire);
    }
  });
  dessinerCalque(1.12, () => calques.devant(ctx, t, objets));
  // vignette douce sur les bords
  const vignette = ctx.createRadialGradient(LARGEUR / 2, HAUTEUR * 0.55, 500, LARGEUR / 2, HAUTEUR * 0.55, 1250);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(20,10,40,0.28)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, LARGEUR, HAUTEUR);
  etiquette(ctx, ep);
  if (voix) {
    // Doublé : ils parlent, sans bulle. Les mots nouveaux s'affichent quand ils sont dits.
    const haut: Boite = { x: 0, y: 200, w: LARGEUR, h: 0 };
    etiquettesTraduction(ctx, traductions(ep, index, langue), texte, haut, local, duree, (finDuMot, longueur) => DEBUT_VOIX + (finDuMot / Math.max(1, longueur)) * voix.duree);
    if (avecSousTitres) sousTitre(ctx, texte, plan.parle, local, duree);
    return;
  }
  const cible = parleur ? versEcran(cam, parleur.x, parleur.sol - hautTete(parleur.placement.id, ECHELLE_PERSO)) : undefined;
  const boite = bulle(ctx, texte, plan.parle, cible, local, duree);
  etiquettesTraduction(ctx, traductions(ep, index, langue), texte, boite, local, duree);
}

function dessinerMoment(ctx: Ctx, ep: Episode, moment: Moment, t: number) {
  if (moment.partie === 'generique') ecranGenerique(ctx, ep, moment.local);
  else if (moment.partie === 'plan') ecranPlan(ctx, ep, moment.index, moment.local, moment.duree, t);
  else if (moment.partie === 'mots') ecranMots(ctx, ep, moment.local);
  else ecranFin(ctx, ep, moment.local);
}

/** Vrai quand on change de lieu ou d'écran : on passe alors par un cercle. */
export function avecIris(ep: Episode, moment: Moment): boolean {
  if (moment.partie === 'generique') return false;
  if (moment.partie !== 'plan') return true;
  return moment.index === 0 || ep.plans[moment.index - 1].decor !== moment.plan.decor;
}

/**
 * Dessine l'image de l'épisode à l'instant `t` (secondes), dans un repère de
 * 1080 × 1920, dans la langue choisie. L'appelant règle l'échelle du canvas.
 */
export function dessinerEpisode(ctx: Ctx, ep: Episode, t: number, policeTexte = 'sans-serif', langueTexte: Langue = 'fr', options: { sousTitres?: boolean } = {}) {
  police = policeTexte;
  langue = langueTexte;
  avecSousTitres = options.sousTitres ?? false;
  ctx.save();
  ctx.lineJoin = 'round';
  const moment = momentA(ep, t, langue);
  if (avecIris(ep, moment) && moment.local < IRIS) {
    const avant = momentA(ep, moment.debut - 0.001, langue);
    dessinerMoment(ctx, ep, avant, moment.debut - 0.001);
    const r = Math.max(1, doux(moment.local / IRIS) * 1250);
    ctx.save();
    ctx.beginPath();
    ctx.arc(LARGEUR / 2, HAUTEUR * 0.45, r, 0, Math.PI * 2);
    ctx.clip();
    dessinerMoment(ctx, ep, moment, t);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(LARGEUR / 2, HAUTEUR * 0.45, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffd166';
    ctx.lineWidth = 18;
    ctx.stroke();
  } else {
    dessinerMoment(ctx, ep, moment, t);
  }
  ctx.restore();
}
