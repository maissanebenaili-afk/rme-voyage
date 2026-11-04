// Le chameau sauteur : un seul bouton pour sauter par-dessus les cactus.
// Monde en unités de jeu (largeur 600, sol à y = 0, vers le haut positif).
// Logique pure, pas de temps fixe : `avancer` reçoit le temps écoulé.

export const LARGEUR_MONDE = 600;
export const CHAMEAU = { x: 60, largeur: 44, hauteur: 40 } as const;
const GRAVITE = -2200;
const ELAN = 820;
const VITESSE_DEPART = 260;
const VITESSE_MAX = 560;

export interface Cactus {
  x: number;
  largeur: number;
  hauteur: number;
}

export interface Course {
  y: number;
  vy: number;
  cactus: Cactus[];
  vitesse: number;
  /** Distance parcourue, sert de score. */
  distance: number;
  /** Distance avant le prochain cactus. */
  prochain: number;
  fini: boolean;
}

export type Hasard = () => number;

export function nouvelleCourse(): Course {
  return { y: 0, vy: 0, cactus: [], vitesse: VITESSE_DEPART, distance: 0, prochain: 300, fini: false };
}

export function auSol(course: Course): boolean {
  return course.y <= 0 && course.vy <= 0;
}

export function sauter(course: Course): Course {
  return course.fini || !auSol(course) ? course : { ...course, vy: ELAN };
}

function touche(course: Course, c: Cactus): boolean {
  const marge = 6; // un peu d'indulgence pour les petits
  const chevauche = CHAMEAU.x + CHAMEAU.largeur - marge > c.x && CHAMEAU.x + marge < c.x + c.largeur;
  return chevauche && course.y + marge < c.hauteur;
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
  let cactus = course.cactus.map((c) => ({ ...c, x: c.x - pas })).filter((c) => c.x + c.largeur > 0);
  let prochain = course.prochain - pas;
  if (prochain <= 0) {
    const grand = hasard() < 0.35;
    cactus = [...cactus, { x: LARGEUR_MONDE, largeur: grand ? 26 : 18, hauteur: grand ? 48 : 34 }];
    prochain = 260 + hasard() * 260;
  }
  const suivante: Course = {
    y,
    vy,
    cactus,
    vitesse: Math.min(VITESSE_MAX, course.vitesse + 6 * dt),
    distance: course.distance + pas,
    prochain,
    fini: false,
  };
  return cactus.some((c) => touche(suivante, c)) ? { ...suivante, fini: true } : suivante;
}

/** Score affiché : un point tous les 10 pas. */
export function points(course: Course): number {
  return Math.floor(course.distance / 10);
}
