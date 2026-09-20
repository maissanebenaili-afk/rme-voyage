import type { Silhouette } from './caftans';

export const CANVAS = { w: 400, h: 600, cx: 200 };

type Node = [half: number, y: number];

type SilhouetteSpec = {
  neck: Node;
  shoulder: Node;
  cuff: { outerY: number; innerY: number; half: number };
  underarm: Node;
  /** Taille → hanche → (genou) → ourlet, de haut en bas. */
  nodes: Node[];
  /** Profondeur du « sourire » de l'ourlet. */
  hemDrop: number;
  overlay?: 'dfina' | 'cape';
};

const BASE = {
  neck: [23, 86] as Node,
  shoulder: [60, 104] as Node,
  cuff: { outerY: 168, innerY: 226, half: 116 },
  underarm: [64, 256] as Node,
};

export const SILHOUETTES: Record<Silhouette, SilhouetteSpec> = {
  droit: {
    ...BASE,
    nodes: [[74, 320], [76, 400], [82, 556]],
    hemDrop: 8,
  },
  evase: {
    ...BASE,
    nodes: [[56, 320], [74, 400], [122, 556]],
    hemDrop: 16,
  },
  sirene: {
    ...BASE,
    nodes: [[50, 320], [56, 400], [58, 470], [118, 556]],
    hemDrop: 14,
  },
  takchita: {
    ...BASE,
    nodes: [[58, 320], [72, 400], [110, 556]],
    hemDrop: 14,
    overlay: 'dfina',
  },
  cape: {
    ...BASE,
    nodes: [[70, 320], [74, 400], [96, 556]],
    hemDrop: 10,
    overlay: 'cape',
  },
};

/**
 * Trace la moitié droite de haut en bas, puis remonte la moitié gauche en miroir.
 * Ajouter une silhouette revient à ajouter un enregistrement, jamais un path écrit à la main.
 */
export function bodyPath(spec: SilhouetteSpec, grow = 0): string {
  const { cx } = CANVAS;
  const half = (h: number) => h + grow;
  const [neckHalf, neckY] = spec.neck;
  const [shHalf, shY] = spec.shoulder;
  const [uaHalf, uaY] = spec.underarm;
  const { outerY, innerY, half: cuffHalf } = spec.cuff;
  const hem = spec.nodes[spec.nodes.length - 1];
  const [hemHalf, hemY] = hem;

  const p: string[] = [];
  p.push(`M ${cx - half(neckHalf)} ${neckY}`);
  // Épaule droite puis manche qui s'évase vers le poignet.
  p.push(`L ${cx + half(neckHalf)} ${neckY}`);
  p.push(`C ${cx + half(shHalf) * 0.7} ${neckY + 4} ${cx + half(shHalf)} ${shY - 6} ${cx + half(shHalf)} ${shY}`);
  p.push(`L ${cx + half(cuffHalf)} ${outerY}`);
  p.push(`L ${cx + half(cuffHalf)} ${innerY}`);
  p.push(`L ${cx + half(uaHalf)} ${uaY}`);
  // Corps : taille, hanche, éventuel genou, ourlet.
  for (const [h, y] of spec.nodes) {
    p.push(`S ${cx + half(h)} ${y - 20} ${cx + half(h)} ${y}`);
  }
  // Ourlet bombé.
  p.push(`Q ${cx} ${hemY + spec.hemDrop} ${cx - half(hemHalf)} ${hemY}`);
  // Remontée en miroir.
  const up = [...spec.nodes].reverse().slice(1);
  for (const [h, y] of up) {
    p.push(`S ${cx - half(h)} ${y + 20} ${cx - half(h)} ${y}`);
  }
  p.push(`L ${cx - half(uaHalf)} ${uaY}`);
  p.push(`L ${cx - half(cuffHalf)} ${innerY}`);
  p.push(`L ${cx - half(cuffHalf)} ${outerY}`);
  p.push(`L ${cx - half(shHalf)} ${shY}`);
  p.push(`C ${cx - half(shHalf)} ${shY - 6} ${cx - half(shHalf) * 0.7} ${neckY + 4} ${cx - half(neckHalf)} ${neckY}`);
  p.push('Z');
  return p.join(' ');
}

export function capePath(): string {
  const { cx } = CANVAS;
  return [
    `M ${cx - 60} 92`,
    `C ${cx - 130} 110 ${cx - 148} 150 ${cx - 152} 190`,
    `C ${cx - 156} 260 ${cx - 140} 310 ${cx - 128} 342`,
    `Q ${cx} 372 ${cx + 128} 342`,
    `C ${cx + 140} 310 ${cx + 156} 260 ${cx + 152} 190`,
    `C ${cx + 148} 150 ${cx + 130} 110 ${cx + 60} 92`,
    'Z',
  ].join(' ');
}

/* ---------- Couleurs ---------- */

function hexToHsl(hex: string): [number, number, number] {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Quatre tons dérivés d'une seule couleur : les données ne portent qu'un hex par modèle. */
export function deriveTones(hex: string) {
  const [h, s, l] = hexToHsl(hex);
  const at = (dl: number, ds = 0) =>
    `hsl(${h.toFixed(1)} ${clamp(s + ds, 0, 100).toFixed(1)}% ${clamp(l + dl, 4, 96).toFixed(1)}%)`;
  return {
    deep: at(-16, 4),
    base: at(0),
    light: at(13, -4),
    sheen: at(26, -12),
  };
}

/* ---------- Aléa déterministe ---------- */

/** Hash stable : jamais Math.random(), qui casserait l'hydratation et les tests. */
export function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Suite de nombres dans [0,1) reproductible à partir d'une graine texte. */
export function seededSeries(seed: string, count: number): number[] {
  let state = hash(seed);
  return Array.from({ length: count }, () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  });
}

/** Plis de drapé : x normalisé (-1 → 1), départ et arrivée en y. */
export function folds(seed: string, count: number) {
  const r = seededSeries(seed, count * 2);
  return Array.from({ length: count }, (_, i) => ({
    t: (i + 0.5) / count * 2 - 1 + (r[i] - 0.5) * 0.12,
    from: 300 + r[i] * 30,
    sway: (r[count + i] - 0.5) * 0.5,
  }));
}
