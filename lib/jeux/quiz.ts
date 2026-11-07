// Quiz du voyageur : logique pure, hasard injectable. Des faits simples et vérifiables, rien d'inventé.

export type Niveau = 'facile' | 'moyen' | 'difficile';
export type Hasard = () => number;

interface QuestionBrute { q: string; bonne: string; autres: [string, string, string] }

export const BANQUE: Record<Niveau, QuestionBrute[]> = {
  facile: [
    { q: 'Quelle est la capitale du Maroc ?', bonne: 'Rabat', autres: ['Casablanca', 'Marrakech', 'Fès'] },
    { q: 'Quelle est la monnaie du Maroc ?', bonne: 'Le dirham', autres: ['L’euro', 'Le dinar', 'Le franc'] },
    { q: 'Quelle ville est surnommée « la ville bleue » ?', bonne: 'Chefchaouen', autres: ['Agadir', 'Oujda', 'Meknès'] },
    { q: 'Quelle boisson sert-on dans un petit verre, avec de la menthe ?', bonne: 'Le thé', autres: ['Le café au lait', 'Le jus d’orange', 'Le lait chaud'] },
    { q: 'Quel plat est fait de semoule, de légumes et de viande ?', bonne: 'Le couscous', autres: ['Les pâtes', 'La pizza', 'Les crêpes'] },
    { q: 'Quelle mer borde le nord du Maroc ?', bonne: 'La Méditerranée', autres: ['La mer Rouge', 'La mer Noire', 'La mer Baltique'] },
    { q: 'Quel océan borde l’ouest du Maroc ?', bonne: 'L’Atlantique', autres: ['L’océan Indien', 'L’océan Arctique', 'Le Pacifique'] },
    { q: 'Quelle est la capitale de l’Espagne ?', bonne: 'Madrid', autres: ['Barcelone', 'Séville', 'Valence'] },
  ],
  moyen: [
    { q: 'Quel plat mijote dans un récipient en terre à couvercle pointu ?', bonne: 'Le tajine', autres: ['Le gratin', 'La fondue', 'Le pot-au-feu'] },
    { q: 'Quelle chaîne de montagnes sépare la France de l’Espagne ?', bonne: 'Les Pyrénées', autres: ['Les Alpes', 'Les Vosges', 'Le Jura'] },
    { q: 'Quelle ville est appelée « la ville rouge » ?', bonne: 'Marrakech', autres: ['Tanger', 'Rabat', 'Tétouan'] },
    { q: 'Quel est le plus haut sommet du Maroc (le Toubkal) ?', bonne: 'Environ 4 167 m', autres: ['Environ 1 200 m', 'Environ 2 500 m', 'Environ 6 000 m'] },
    { q: 'Quel grand désert touche le sud du Maroc ?', bonne: 'Le Sahara', autres: ['Le Gobi', 'Le Kalahari', 'L’Atacama'] },
    { q: 'Quelle est l’écriture de la langue amazighe ?', bonne: 'Le tifinagh', autres: ['Le cyrillique', 'Le grec', 'Le braille'] },
    { q: 'Quel détroit sépare l’Espagne du Maroc ?', bonne: 'Gibraltar', autres: ['Le Bosphore', 'La Manche', 'Messine'] },
    { q: 'À peu près quelle largeur fait le détroit de Gibraltar, au plus étroit ?', bonne: '14 km', autres: ['4 km', '60 km', '150 km'] },
  ],
  difficile: [
    { q: 'Quelle ville abrite la place Jemaa el-Fna ?', bonne: 'Marrakech', autres: ['Fès', 'Casablanca', 'Essaouira'] },
    { q: 'Quelle université de Fès, fondée en 859, est souvent citée comme la plus ancienne encore en activité ?', bonne: 'Al Quaraouiyine', autres: ['Al Akhawayn', 'La Sorbonne', 'Al Azhar'] },
    { q: 'Quelle forme verte figure au centre du drapeau marocain ?', bonne: 'Une étoile à cinq branches', autres: ['Un croissant', 'Un cèdre', 'Un cercle'] },
    { q: 'Quelle fête marque la fin du ramadan ?', bonne: 'L’Aïd al-Fitr', autres: ['L’Aïd al-Adha', 'Achoura', 'Le Mawlid'] },
    { q: 'Joha (ou Nasreddin) est le héros de quel genre d’histoires ?', bonne: 'Des histoires drôles pleines de malice', autres: ['Des récits de guerre', 'Des contes de fées', 'Des romans policiers'] },
    { q: 'Quelle ville marocaine est classée à l’UNESCO pour sa médina de Fès el-Bali ?', bonne: 'Fès', autres: ['Nador', 'Safi', 'Khouribga'] },
    { q: 'Quel détroit, au plus étroit, se traverse en ferry entre Tanger et l’Europe ?', bonne: 'Gibraltar', autres: ['Ormuz', 'Magellan', 'Béring'] },
    { q: 'Que veut dire « habibi » en arabe ?', bonne: 'Mon chéri / mon cher', autres: ['Bonne route', 'Merci', 'Demain'] },
  ],
};

export interface Question { q: string; options: string[]; bonne: number }

export interface Partie {
  niveau: Niveau;
  questions: Question[];
  index: number;
  /** Choix donné pour chaque question (null tant qu'on n'a pas répondu). */
  choix: (number | null)[];
  score: number;
  serie: number;
  meilleureSerie: number;
}

export const NB_QUESTIONS = 5;

function melanger<T>(items: T[], hasard: Hasard): T[] {
  const copie = [...items];
  for (let i = copie.length - 1; i > 0; i--) {
    const j = Math.floor(hasard() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

export function nouvellePartie(niveau: Niveau, hasard: Hasard = Math.random): Partie {
  const questions = melanger(BANQUE[niveau], hasard).slice(0, NB_QUESTIONS).map((b) => {
    const options = melanger([b.bonne, ...b.autres], hasard);
    return { q: b.q, options, bonne: options.indexOf(b.bonne) };
  });
  return { niveau, questions, index: 0, choix: questions.map(() => null), score: 0, serie: 0, meilleureSerie: 0 };
}

export const aRepondu = (p: Partie) => p.choix[p.index] !== null && p.choix[p.index] !== undefined;
export const termine = (p: Partie) => p.index >= p.questions.length;

export function repondre(p: Partie, choix: number): Partie {
  const question = p.questions[p.index];
  if (!question || aRepondu(p) || choix < 0 || choix >= question.options.length) return p;
  const juste = choix === question.bonne;
  const serie = juste ? p.serie + 1 : 0;
  return { ...p, choix: p.choix.map((c, i) => (i === p.index ? choix : c)), score: p.score + (juste ? 1 : 0), serie, meilleureSerie: Math.max(p.meilleureSerie, serie) };
}

export function suivante(p: Partie): Partie {
  return aRepondu(p) && !termine(p) ? { ...p, index: p.index + 1 } : p;
}

/** De 0 à 3 étoiles : 3 pour un sans-faute, 2 pour au moins 4/5, 1 pour au moins 2/5. */
export function etoiles(p: Partie): 0 | 1 | 2 | 3 {
  const part = p.score / p.questions.length;
  return part === 1 ? 3 : part >= 0.8 ? 2 : part >= 0.4 ? 1 : 0;
}
