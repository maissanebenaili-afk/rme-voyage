// Skate à la corniche : un enfant en skate saute par-dessus les plots et
// ramasse des pièces. Monde en unités de jeu (largeur 600, sol à y = 0, vers
// le haut positif). Logique pure : `avancer` reçoit le temps écoulé.

export const LARGEUR_MONDE = 600;
export const SKATEUR = { x: 60, largeur: 34, hauteur: 46 } as const;
const GRAVITE = -2300;
// Saut assez haut pour passer les plots et les pièces, sans sortir de l’écran.
const ELAN = 700;
const VITESSE_DEPART = 270;
const VITESSE_MAX = 600;
export const POINTS_PIECE = 5;

export interface Obstacle {
  x: number;
  largeur: number;
  hauteur: number;
}

export interface PieceOr {
  x: number;
  /** Hauteur du centre de la pièce au-dessus du sol. */
  y: number;
}

export interface Course {
  y: number;
  vy: number;
  obstacles: Obstacle[];
  pieces: PieceOr[];
  vitesse: number;
  distance: number;
  ramassees: number;
  /** Distance avant le prochain obstacle. */
  prochain: number;
  fini: boolean;
}

export type Hasard = () => number;

export function nouvelleCourse(): Course {
  return { y: 0, vy: 0, obstacles: [], pieces: [], vitesse: VITESSE_DEPART, distance: 0, ramassees: 0, prochain: 320, fini: false };
}

export function auSol(course: Course): boolean {
  return course.y <= 0 && course.vy <= 0;
}

export function sauter(course: Course): Course {
  return course.fini || !auSol(course) ? course : { ...course, vy: ELAN };
}

function touche(course: Course, o: Obstacle): boolean {
  const marge = 6; // un peu d'indulgence pour les petits
  const chevauche = SKATEUR.x + SKATEUR.largeur - marge > o.x && SKATEUR.x + marge < o.x + o.largeur;
  return chevauche && course.y + marge < o.hauteur;
}

function attrape(course: Course, p: PieceOr): boolean {
  const rayon = 10;
  const dansX = p.x + rayon > SKATEUR.x && p.x - rayon < SKATEUR.x + SKATEUR.largeur;
  const dansY = p.y + rayon > course.y && p.y - rayon < course.y + SKATEUR.hauteur;
  return dansX && dansY;
}

export function avancer(course: Course, secondes: number, hasard: Hasard = Math.random): Course {
  if (course.fini) return course;
  const dt = Math.min(Math.max(secondes, 0), 0.05);
  let vy = course.vy + GRAVITE * dt;
  let y = course.y + vy * dt;
  if (y <= 0) {
    y = 0;
    vy = 0;
  }
  const pas = course.vitesse * dt;
  let obstacles = course.obstacles.map((o) => ({ ...o, x: o.x - pas })).filter((o) => o.x + o.largeur > 0);
  let pieces = course.pieces.map((p) => ({ ...p, x: p.x - pas })).filter((p) => p.x > -10);
  let prochain = course.prochain - pas;
  if (prochain <= 0) {
    const grand = hasard() < 0.35;
    const obstacle = { x: LARGEUR_MONDE, largeur: grand ? 26 : 20, hauteur: grand ? 46 : 32 };
    obstacles = [...obstacles, obstacle];
    // Une rangée de pièces : au-dessus de l'obstacle (il faut sauter) ou au sol, plus loin.
    const enHaut = hasard() < 0.6;
    const depart = enHaut ? obstacle.x - 20 : obstacle.x + 120;
    pieces = [...pieces, ...[0, 1, 2].map((i) => ({ x: depart + i * 26, y: enHaut ? 95 : 16 }))];
    prochain = 280 + hasard() * 260;
  }
  const avant: Course = {
    y,
    vy,
    obstacles,
    pieces,
    vitesse: Math.min(VITESSE_MAX, course.vitesse + 7 * dt),
    distance: course.distance + pas,
    ramassees: course.ramassees,
    prochain,
    fini: false,
  };
  const prises = pieces.filter((p) => attrape(avant, p)).length;
  const suivante = prises ? { ...avant, pieces: pieces.filter((p) => !attrape(avant, p)), ramassees: avant.ramassees + prises } : avant;
  return obstacles.some((o) => touche(suivante, o)) ? { ...suivante, fini: true } : suivante;
}

/** Score : un point tous les 10 pas, plus 5 par pièce ramassée. */
export function points(course: Course): number {
  return Math.floor(course.distance / 10) + course.ramassees * POINTS_PIECE;
}
