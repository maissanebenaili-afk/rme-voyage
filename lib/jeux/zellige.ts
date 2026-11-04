// Zellige : des pièces de mosaïque tombent, on les range pour compléter des
// lignes. Jeu original de pièces qui tombent : plateau de 9 × 14, pièces de
// 3 et 4 carreaux. Logique pure, hasard injectable.

export const LARGEUR = 9;
export const HAUTEUR = 14;

type Cellule = readonly [ligne: number, colonne: number];

// Chaque pièce : ses carreaux autour d'un pivot, et sa couleur (1 à 6).
export const PIECES = {
  barre: { couleur: 1, carreaux: [[0, -1], [0, 0], [0, 1]] },
  coin: { couleur: 2, carreaux: [[0, 0], [0, 1], [1, 0]] },
  carre: { couleur: 3, carreaux: [[0, 0], [0, 1], [1, 0], [1, 1]] },
  te: { couleur: 4, carreaux: [[0, -1], [0, 0], [0, 1], [1, 0]] },
  marche: { couleur: 5, carreaux: [[0, 0], [0, 1], [1, -1], [1, 0]] },
  equerre: { couleur: 6, carreaux: [[0, -1], [0, 0], [0, 1], [1, -1]] },
} as const satisfies Record<string, { couleur: number; carreaux: readonly Cellule[] }>;

export type NomPiece = keyof typeof PIECES;
const NOMS = Object.keys(PIECES) as NomPiece[];

export interface Piece {
  nom: NomPiece;
  carreaux: Cellule[];
  ligne: number;
  colonne: number;
}

export interface Jeu {
  /** plateau[ligne][colonne] : 0 vide, sinon la couleur du carreau posé. */
  plateau: number[][];
  piece: Piece;
  suivante: NomPiece;
  lignes: number;
  score: number;
  fini: boolean;
}

export type Hasard = () => number;

function tirer(hasard: Hasard): NomPiece {
  return NOMS[Math.min(NOMS.length - 1, Math.floor(hasard() * NOMS.length))];
}

function placer(nom: NomPiece): Piece {
  return { nom, carreaux: PIECES[nom].carreaux.map(([l, c]) => [l, c] as const), ligne: 0, colonne: Math.floor(LARGEUR / 2) };
}

function positions(piece: Piece): Cellule[] {
  return piece.carreaux.map(([l, c]) => [piece.ligne + l, piece.colonne + c] as const);
}

export function libre(plateau: number[][], piece: Piece): boolean {
  return positions(piece).every(([l, c]) => c >= 0 && c < LARGEUR && l < HAUTEUR && (l < 0 || plateau[l][c] === 0));
}

export function nouveauJeu(hasard: Hasard = Math.random): Jeu {
  const plateau = Array.from({ length: HAUTEUR }, () => Array<number>(LARGEUR).fill(0));
  return { plateau, piece: placer(tirer(hasard)), suivante: tirer(hasard), lignes: 0, score: 0, fini: false };
}

function essayer(jeu: Jeu, piece: Piece): Jeu {
  return libre(jeu.plateau, piece) ? { ...jeu, piece } : jeu;
}

export function gauche(jeu: Jeu): Jeu {
  return jeu.fini ? jeu : essayer(jeu, { ...jeu.piece, colonne: jeu.piece.colonne - 1 });
}

export function droite(jeu: Jeu): Jeu {
  return jeu.fini ? jeu : essayer(jeu, { ...jeu.piece, colonne: jeu.piece.colonne + 1 });
}

/** Quart de tour ; décale d'une case si un bord gêne. */
export function tourner(jeu: Jeu): Jeu {
  if (jeu.fini || jeu.piece.nom === 'carre') return jeu;
  const carreaux = jeu.piece.carreaux.map(([l, c]) => [c, -l] as const);
  for (const decalage of [0, -1, 1]) {
    const essai = { ...jeu.piece, carreaux, colonne: jeu.piece.colonne + decalage };
    if (libre(jeu.plateau, essai)) return { ...jeu, piece: essai };
  }
  return jeu;
}

const POINTS = [0, 10, 30, 60, 100];

function poser(jeu: Jeu, hasard: Hasard): Jeu {
  const plateau = jeu.plateau.map((ligne) => [...ligne]);
  const couleur = PIECES[jeu.piece.nom].couleur;
  for (const [l, c] of positions(jeu.piece)) {
    if (l < 0) return { ...jeu, plateau, fini: true };
    plateau[l][c] = couleur;
  }
  const restantes = plateau.filter((ligne) => ligne.some((cell) => cell === 0));
  const faites = HAUTEUR - restantes.length;
  const neuf = [...Array.from({ length: faites }, () => Array<number>(LARGEUR).fill(0)), ...restantes];
  const piece = placer(jeu.suivante);
  return {
    plateau: neuf,
    piece,
    suivante: tirer(hasard),
    lignes: jeu.lignes + faites,
    score: jeu.score + POINTS[Math.min(faites, POINTS.length - 1)],
    fini: !libre(neuf, piece),
  };
}

/** Un pas de chute : la pièce descend, ou se pose si elle touche. */
export function tomber(jeu: Jeu, hasard: Hasard = Math.random): Jeu {
  if (jeu.fini) return jeu;
  const bas = { ...jeu.piece, ligne: jeu.piece.ligne + 1 };
  return libre(jeu.plateau, bas) ? { ...jeu, piece: bas } : poser(jeu, hasard);
}

/** Pose la pièce tout en bas d'un coup. */
export function lacher(jeu: Jeu, hasard: Hasard = Math.random): Jeu {
  if (jeu.fini) return jeu;
  let piece = jeu.piece;
  while (libre(jeu.plateau, { ...piece, ligne: piece.ligne + 1 })) piece = { ...piece, ligne: piece.ligne + 1 };
  return poser({ ...jeu, piece }, hasard);
}

/** Millisecondes entre deux pas de chute : plus vite toutes les 5 lignes. */
export function vitesse(lignes: number): number {
  return Math.max(180, 700 - Math.floor(lignes / 5) * 80);
}

/** Le plateau avec la pièce en cours dessinée dessus, pour l'affichage. */
export function image(jeu: Jeu): number[][] {
  const copie = jeu.plateau.map((ligne) => [...ligne]);
  for (const [l, c] of positions(jeu.piece)) if (l >= 0 && l < HAUTEUR) copie[l][c] = PIECES[jeu.piece.nom].couleur;
  return copie;
}
