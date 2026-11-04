import { doitRecacher, gagnee, nouvellePartie, recacher, retourner, visible } from '@/lib/jeux/memoire';
import { HAUTEUR, LARGEUR, droite, gauche, image, lacher, libre, nouveauJeu, tomber, tourner, vitesse, type Jeu } from '@/lib/jeux/zellige';
import { CHAMEAU, auSol, avancer, nouvelleCourse, points, sauter } from '@/lib/jeux/chameau';

// Hasard reproductible pour les tests.
function suite(...valeurs: number[]) {
  let i = 0;
  return () => valeurs[i++ % valeurs.length];
}

describe('Mémoire des souks', () => {
  it('pose chaque symbole deux fois', () => {
    const partie = nouvellePartie(4, suite(0.1, 0.7, 0.3, 0.9));
    expect(partie.cartes).toHaveLength(8);
    const compte = new Map<string, number>();
    for (const c of partie.cartes) compte.set(c.symbole, (compte.get(c.symbole) ?? 0) + 1);
    expect([...compte.values()]).toEqual([2, 2, 2, 2]);
  });

  it('garde une paire trouvée, recache deux cartes différentes', () => {
    let partie = nouvellePartie(3, suite(0.5));
    const sym = partie.cartes[0].symbole;
    const jumelle = partie.cartes.findIndex((c, i) => i > 0 && c.symbole === sym);
    const autre = partie.cartes.findIndex((c) => c.symbole !== sym);

    partie = retourner(partie, 0);
    partie = retourner(partie, autre);
    expect(doitRecacher(partie)).toBe(true);
    expect(retourner(partie, jumelle)).toBe(partie); // on attend que les cartes se recachent
    partie = recacher(partie);
    expect(visible(partie, 0)).toBe(false);

    partie = retourner(partie, 0);
    partie = retourner(partie, jumelle);
    expect(partie.cartes[0].trouvee && partie.cartes[jumelle].trouvee).toBe(true);
    expect(partie.coups).toBe(2);
    expect(retourner(partie, 0)).toBe(partie); // une carte trouvée ne se retourne plus
  });

  it('est gagnée quand toutes les paires sont trouvées', () => {
    let partie = nouvellePartie(2, suite(0.2, 0.8));
    const faites = new Set<number>();
    for (let i = 0; i < partie.cartes.length; i++) {
      if (faites.has(i)) continue;
      const j = partie.cartes.findIndex((c, k) => k !== i && c.symbole === partie.cartes[i].symbole);
      partie = retourner(retourner(partie, i), j);
      faites.add(i).add(j);
    }
    expect(gagnee(partie)).toBe(true);
  });
});

describe('Zellige', () => {
  const vide = () => nouveauJeu(suite(0)); // première pièce : la barre de 3

  it('fait tomber la pièce puis la pose au fond', () => {
    let jeu = vide();
    const depart = jeu.piece.ligne;
    jeu = tomber(jeu, suite(0));
    expect(jeu.piece.ligne).toBe(depart + 1);
    jeu = lacher(jeu, suite(0));
    expect(jeu.plateau[HAUTEUR - 1].filter((c) => c !== 0)).toHaveLength(3);
  });

  it('ne sort jamais du plateau', () => {
    let jeu = vide();
    for (let i = 0; i < 20; i++) jeu = gauche(jeu);
    expect(Math.min(...jeu.piece.carreaux.map(([, c]) => jeu.piece.colonne + c))).toBe(0);
    for (let i = 0; i < 20; i++) jeu = droite(jeu);
    expect(Math.max(...jeu.piece.carreaux.map(([, c]) => jeu.piece.colonne + c))).toBe(LARGEUR - 1);
    jeu = tourner(jeu);
    expect(libre(jeu.plateau, jeu.piece)).toBe(true);
  });

  it('efface une ligne complète et compte les points', () => {
    const jeu: Jeu = vide();
    const plateau = jeu.plateau.map((l) => [...l]);
    plateau[HAUTEUR - 1] = [1, 1, 1, 0, 0, 0, 1, 1, 1];
    const avant = { ...jeu, plateau };
    const apres = lacher(avant, suite(0)); // la barre de 3 comble le trou du milieu
    expect(apres.lignes).toBe(1);
    expect(apres.score).toBe(10);
    expect(apres.plateau[HAUTEUR - 1].every((c) => c === 0)).toBe(true);
  });

  it('s’arrête quand le plateau est plein', () => {
    const jeu = vide();
    const plein = jeu.plateau.map((_, l) => (l === 0 ? Array(LARGEUR).fill(0) : Array(LARGEUR).fill(1).map((v, c) => (c === 0 ? 0 : v))));
    const fini = lacher({ ...jeu, plateau: plein }, suite(0));
    expect(fini.fini).toBe(true);
    expect(tomber(fini)).toBe(fini);
  });

  it('accélère avec les lignes, sans descendre sous 180 ms', () => {
    expect(vitesse(0)).toBe(700);
    expect(vitesse(5)).toBe(620);
    expect(vitesse(500)).toBe(180);
  });

  it('dessine la pièce en cours sur le plateau', () => {
    const jeu = vide();
    expect(image(jeu).flat().filter((c) => c !== 0)).toHaveLength(3);
    expect(jeu.plateau.flat().every((c) => c === 0)).toBe(true);
  });
});

describe('Le chameau sauteur', () => {
  it('saute seulement depuis le sol, puis retombe', () => {
    let course = sauter(nouvelleCourse());
    expect(course.vy).toBeGreaterThan(0);
    course = avancer(course, 0.05, suite(0.9));
    expect(course.y).toBeGreaterThan(0);
    expect(sauter(course)).toBe(course); // pas de double saut
    for (let i = 0; i < 40; i++) course = avancer(course, 0.05, suite(0.9));
    expect(auSol(course)).toBe(true);
  });

  it('perd en touchant un cactus, gagne des points en avançant', () => {
    const cactus = { x: CHAMEAU.x + 10, largeur: 18, hauteur: 34 };
    expect(avancer({ ...nouvelleCourse(), cactus: [cactus] }, 0.01).fini).toBe(true);
    let course = nouvelleCourse();
    for (let i = 0; i < 20; i++) course = avancer(course, 0.05, suite(0.9));
    expect(points(course)).toBeGreaterThan(0);
  });

  it('passe au-dessus d’un cactus en sautant à temps', () => {
    let course = sauter({ ...nouvelleCourse(), cactus: [{ x: CHAMEAU.x + 90, largeur: 18, hauteur: 34 }], prochain: 10_000 });
    for (let i = 0; i < 30 && !course.fini; i++) course = avancer(course, 0.02);
    expect(course.fini).toBe(false);
  });
});
