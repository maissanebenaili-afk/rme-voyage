// Mémoire des souks : retrouver les paires. Logique pure, hasard injectable.

export const SYMBOLES = ['🐪', '🫖', '🌴', '🕌', '⛴️', '🍊', '🌙', '🧆', '🐐', '🥁'] as const;

export interface Carte {
  id: number;
  symbole: string;
  trouvee: boolean;
}

export interface Partie {
  cartes: Carte[];
  /** Cartes retournées en attente (0, 1 ou 2 indices). */
  retournees: number[];
  coups: number;
}

export type Hasard = () => number;

function melanger<T>(items: T[], hasard: Hasard): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(hasard() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

export function nouvellePartie(paires: number, hasard: Hasard = Math.random): Partie {
  const n = Math.max(2, Math.min(paires, SYMBOLES.length));
  const choisis = melanger([...SYMBOLES], hasard).slice(0, n);
  const cartes = melanger([...choisis, ...choisis], hasard).map((symbole, id) => ({ id, symbole, trouvee: false }));
  return { cartes, retournees: [], coups: 0 };
}

/** Deux cartes différentes sont visibles : il faut les recacher avant de jouer. */
export function doitRecacher(partie: Partie): boolean {
  return partie.retournees.length === 2;
}

export function retourner(partie: Partie, index: number): Partie {
  const carte = partie.cartes[index];
  if (!carte || carte.trouvee || partie.retournees.includes(index) || doitRecacher(partie)) return partie;
  const retournees = [...partie.retournees, index];
  if (retournees.length < 2) return { ...partie, retournees };

  const [a, b] = retournees;
  const coups = partie.coups + 1;
  if (partie.cartes[a].symbole === partie.cartes[b].symbole) {
    const cartes = partie.cartes.map((c, i) => (i === a || i === b ? { ...c, trouvee: true } : c));
    return { cartes, retournees: [], coups };
  }
  return { ...partie, retournees, coups };
}

export function recacher(partie: Partie): Partie {
  return doitRecacher(partie) ? { ...partie, retournees: [] } : partie;
}

export function gagnee(partie: Partie): boolean {
  return partie.cartes.every((c) => c.trouvee);
}

export function visible(partie: Partie, index: number): boolean {
  return partie.cartes[index].trouvee || partie.retournees.includes(index);
}
