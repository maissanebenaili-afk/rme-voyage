// « Kalimat — les mots du bled » : les épisodes, sous forme de données.
//
// Chaque épisode = un générique, une suite de plans (un décor, des
// personnages, une réplique dans une bulle), « Les mots du jour », puis la fin.
// Dans les répliques, les mots entre astérisques (*salam*) sont les mots de
// darija (ou d'une autre langue) : ils s'affichent en couleur et, la première
// fois, avec leur traduction sous la bulle.
//
// Deux versions par épisode, même dessin : en français et en espagnol, la
// darija restant la même. Textes repris de docs/dessins-animes/.

import { LEXIQUE, cleDuMot, type EntreeLexique } from './lexique';
import voix1fr from './voix/1-fr.json';

export type Langue = 'fr' | 'es';
export const LANGUES: readonly Langue[] = ['fr', 'es'];
export type Textes = Record<Langue, string>;

export type PersoId = 'ines' | 'adam' | 'yassine' | 'nour' | 'mima' | 'mchicha' | 'marchand';
export type DecorId = 'port' | 'cuisine' | 'marche';
export type Humeur = 'content' | 'inquiet' | 'surpris' | 'rire';
export type Tenu = 'pancarte' | 'valise' | 'verre' | 'orange' | 'mchicha' | 'khobz' | 'theiere';
export type ObjetId = 'ferry' | 'voiture' | 'theiere' | 'verres' | 'panier-khobz' | 'oranges' | 'queue-mchicha';

export interface Placement {
  id: PersoId;
  /** Position horizontale, de 0 (bord gauche) à 1 (bord droit). */
  x: number;
  /** Si présent, le personnage marche depuis cette position jusqu'à `x`. */
  depuis?: number;
  saut?: boolean;
  /** Hauteur (en pixels) où il se pose : sur le coffre de la voiture, par exemple. */
  perche?: number;
  humeur?: Humeur;
  tient?: Tenu;
}

export interface Plan {
  decor: DecorId;
  persos: Placement[];
  /** Qui parle. Sans `parle`, le texte est une narration (cadre jaune). */
  parle?: PersoId;
  texte: Textes;
  objets?: ObjetId[];
}

export interface MotDuJour {
  mot: string;
  sens: Textes;
}

export interface Episode {
  numero: number;
  titre: Textes;
  mots: [MotDuJour, MotDuJour, MotDuJour];
  plans: Plan[];
  /** Phrase d'au revoir, « Bslama ! » par défaut. */
  fin?: Textes;
}

export const NOMS: Record<PersoId, Textes> = {
  ines: { fr: 'Inès', es: 'Inès' },
  adam: { fr: 'Adam', es: 'Adam' },
  yassine: { fr: 'Yassine', es: 'Yassine' },
  nour: { fr: 'Nour', es: 'Nour' },
  mima: { fr: 'Mima', es: 'Mima' },
  mchicha: { fr: 'Mchicha', es: 'Mchicha' },
  marchand: { fr: 'Le marchand', es: 'El vendedor' },
};

/** Les textes fixes des écrans, dans chaque langue. */
export const ECRAN: Record<Langue, { episode: string; sousTitre: string; motsDuJour: string; aDemain: string; demain: string }> = {
  fr: { episode: 'Épisode', sousTitre: 'les mots du bled', motsDuJour: 'Les mots du jour', aDemain: 'À demain !', demain: 'Demain' },
  es: { episode: 'Episodio', sousTitre: 'las palabras del bled', motsDuJour: 'Las palabras del día', aDemain: '¡Hasta mañana!', demain: 'Mañana' },
};

const t = (fr: string, es: string): Textes => ({ fr, es });
type Extra = Omit<Placement, 'id' | 'x'>;
const p = (id: PersoId, x: number, extra: Extra = {}): Placement => ({ id, x, ...extra });

// Épisode 1 : le port de Tanger Med.
const quai = (extra: Partial<Record<PersoId, Extra>> = {}) => [
  p('ines', 0.16, extra.ines),
  p('adam', 0.36, extra.adam),
  p('yassine', 0.62, { tient: 'pancarte', ...extra.yassine }),
  p('mima', 0.85, extra.mima),
];
const PORT: ObjetId[] = ['ferry'];

const EPISODE_1: Episode = {
  numero: 1,
  titre: t('Salam, Yassine !', '¡Salam, Yassine!'),
  mots: [
    { mot: 'salam', sens: t('bonjour', 'hola') },
    { mot: 'labas ?', sens: t('ça va ?', '¿qué tal?') },
    { mot: 'zwin', sens: t('beau', 'bonito') },
  ],
  plans: [
    {
      decor: 'port',
      objets: PORT,
      persos: [p('ines', 0.3, { depuis: 0.04 }), p('adam', 0.55, { depuis: 0.2 })],
      parle: 'ines',
      texte: t('*Chouf*, Adam, la mer elle brille !', '*Chouf*, Adam, ¡el mar brilla!'),
    },
    {
      decor: 'port',
      objets: PORT,
      persos: [p('ines', 0.16), p('adam', 0.36), p('yassine', 0.62, { depuis: 1.15, tient: 'pancarte' }), p('mima', 0.85, { depuis: 1.3 })],
      parle: 'yassine',
      texte: t('*Salam* !', '¡*Salam*!'),
    },
    { decor: 'port', objets: PORT, persos: quai({ ines: { humeur: 'surpris' } }), parle: 'ines', texte: t('*Salam*… ça veut dire bonjour, c’est ça ?', '*Salam*… ¿eso quiere decir hola?') },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'yassine', texte: t('*Wakha*, t’as tout compris ! *Salam* !', '¡*Wakha*, lo has pillado! ¡*Salam*!') },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'mima', texte: t('*Labas*, mes chéris ? Ça va, le voyage ?', '¿*Labas*, mis niños? ¿Qué tal el viaje?') },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'yassine', texte: t('Tu réponds : *labas, hamdoullah* !', 'Tú contestas: ¡*labas, hamdoullah*!') },
    { decor: 'port', objets: PORT, persos: quai({ ines: { humeur: 'rire' } }), parle: 'ines', texte: t('*Labas, hamdoullah* !', '¡*Labas, hamdoullah*!') },
    {
      decor: 'port',
      objets: PORT,
      persos: [p('ines', 0.16), p('adam', 0.5, { depuis: 0.36 }), p('yassine', 0.7, { tient: 'pancarte' }), p('mima', 0.88)],
      parle: 'adam',
      texte: t('*Labas* la mer !', '¡*Labas* el mar!'),
    },
    {
      decor: 'port',
      objets: PORT,
      persos: [p('ines', 0.16, { humeur: 'rire' }), p('adam', 0.36, { depuis: 0.5 }), p('yassine', 0.62, { tient: 'pancarte', humeur: 'rire' }), p('mima', 0.85, { humeur: 'surpris' })],
      parle: 'mima',
      texte: t('*Hchouma*, Adam, reviens, *3afak* !', '¡*Hchouma*, Adam, vuelve, *3afak*!'),
    },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'mima', texte: t('Qu’il est *zwin*, mon petit-fils !', '¡Qué *zwin* es mi nieto!') },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'yassine', texte: t('*Zwin*, c’est beau.', '*Zwin* quiere decir bonito.') },
    { decor: 'port', objets: PORT, persos: quai({ adam: { humeur: 'rire' } }), parle: 'adam', texte: t('Moi *zwin* ! Trop *zwin* !', '¡Yo *zwin*! ¡Súper *zwin*!') },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'yassine', texte: t('On rentre à la maison ?', '¿Nos vamos a casa?') },
    // Le petit jeu des langues : un mot espagnol en version française, un mot français en version espagnole.
    { decor: 'port', objets: PORT, persos: quai(), parle: 'ines', texte: t('*Vale* !', '¡*D’accord*!') },
    { decor: 'port', objets: PORT, persos: quai({ yassine: { humeur: 'surpris' } }), parle: 'yassine', texte: t('Tu parles espagnol, toi ?', '¿Tú hablas francés?') },
    { decor: 'port', objets: PORT, persos: quai({ ines: { humeur: 'rire' } }), parle: 'ines', texte: t('C’est toi qui dis ça tout le temps !', '¡Claro, vivo en Lyon!') },
    {
      decor: 'port',
      objets: ['ferry', 'voiture'],
      persos: [p('ines', 0.14, { humeur: 'rire' }), p('adam', 0.32, { humeur: 'surpris' }), p('mchicha', 0.9, { depuis: 0.5, saut: true, perche: 250 })],
      texte: t('Et hop ! Mchicha saute dans le coffre, entre les valises.', '¡Y hop! Mchicha salta al maletero, entre las maletas.'),
    },
  ],
};

// Épisode 2 : la cuisine de Mima.
const cuisine = (extra: Partial<Record<PersoId, Extra>> = {}) => [
  p('ines', 0.14, extra.ines),
  p('adam', 0.33, extra.adam),
  p('mima', 0.52, extra.mima),
  p('yassine', 0.71, extra.yassine),
  p('nour', 0.88, extra.nour),
];
const TABLE: ObjetId[] = ['theiere', 'verres'];
const TABLE_PAIN: ObjetId[] = ['theiere', 'verres', 'panier-khobz'];

const EPISODE_2: Episode = {
  numero: 2,
  titre: t('Atay chez Mima', 'Atay en casa de Mima'),
  mots: [
    { mot: 'atay', sens: t('thé', 'té') },
    { mot: 'khobz', sens: t('pain', 'pan') },
    { mot: 'bzzaf', sens: t('beaucoup', 'mucho') },
  ],
  plans: [
    {
      decor: 'cuisine',
      objets: TABLE,
      persos: cuisine({ nour: { depuis: 1.25, tient: 'valise' } }),
      parle: 'nour',
      texte: t('*Salam* tout le monde ! *Safi*, j’suis là, la fête peut commencer !', '¡*Salam* a todos! *Safi*, ya estoy aquí, ¡que empiece la fiesta!'),
    },
    { decor: 'cuisine', objets: ['verres'], persos: cuisine({ mima: { tient: 'theiere' } }), parle: 'mima', texte: t('Qui veut de l’*atay* ?', '¿Quién quiere *atay*?') },
    { decor: 'cuisine', objets: TABLE, persos: cuisine(), parle: 'yassine', texte: t('*Atay*, c’est le thé !', '¡*Atay* es el té!') },
    { decor: 'cuisine', objets: TABLE, persos: cuisine({ adam: { tient: 'verre', humeur: 'rire' } }), parle: 'adam', texte: t('*Atay*, *bzzaf* !', '¡*Atay*, *bzzaf*!') },
    {
      decor: 'cuisine',
      objets: TABLE,
      persos: cuisine({ adam: { tient: 'verre' } }),
      parle: 'yassine',
      texte: t('*Bzzaf*, ça veut dire beaucoup… mais c’est chaud, *chwiya chwiya* !', '*Bzzaf* quiere decir mucho… pero está caliente, ¡*chwiya chwiya*!'),
    },
    { decor: 'cuisine', objets: TABLE_PAIN, persos: cuisine({ ines: { humeur: 'surpris' } }), parle: 'ines', texte: t('C’est quoi, *khobz* ?', '¿Qué es *khobz*?') },
    { decor: 'cuisine', objets: TABLE_PAIN, persos: cuisine(), parle: 'mima', texte: t('*Khobz*, c’est le pain. *Kouli*, mange !', '*Khobz* es el pan. ¡*Kouli*, come!') },
    { decor: 'cuisine', objets: TABLE_PAIN, persos: cuisine({ nour: { tient: 'khobz', humeur: 'rire' } }), parle: 'nour', texte: t('Mmm, *lekker* !', 'Mmm, ¡*lekker*!') },
    { decor: 'cuisine', objets: TABLE_PAIN, persos: cuisine({ adam: { humeur: 'surpris' } }), parle: 'adam', texte: t('*Lekker* ? C’est quoi ?', '¿*Lekker*? ¿Qué es eso?') },
    { decor: 'cuisine', objets: TABLE_PAIN, persos: cuisine(), parle: 'nour', texte: t('Ça veut dire « c’est bon », en néerlandais !', '¡Quiere decir «está rico», en neerlandés!') },
    { decor: 'cuisine', objets: TABLE_PAIN, persos: cuisine({ mima: { humeur: 'rire' } }), parle: 'mima', texte: t('*Lekker*, *mzyan*… tant que tu manges, *bsaha* !', '*Lekker*, *mzyan*… mientras comas, ¡*bsaha*!') },
    {
      decor: 'cuisine',
      objets: TABLE_PAIN,
      persos: [...cuisine({ adam: { humeur: 'surpris' }, nour: { humeur: 'rire' } }), p('mchicha', 1.1, { depuis: 0.42, tient: 'khobz' })],
      texte: t('Mchicha vole un bout de *khobz* et part en courant !', '¡Mchicha roba un trozo de *khobz* y sale corriendo!'),
    },
    { decor: 'cuisine', objets: TABLE_PAIN, persos: cuisine({ ines: { humeur: 'rire' } }), parle: 'adam', texte: t('Mchicha, elle aime le *khobz* *bzzaf* ! *Hchouma*, Mchicha !', '¡A Mchicha le gusta el *khobz* *bzzaf*! ¡*Hchouma*, Mchicha!') },
  ],
  fin: t('*Bslama* ! *Doei* !', '¡*Bslama*! ¡*Doei*!'),
};

// Épisode 3 : le marché de la médina.
const marche = (extra: Partial<Record<PersoId, Extra>> = {}) => [
  p('ines', 0.14, { humeur: 'inquiet', ...extra.ines }),
  p('adam', 0.32, extra.adam),
  p('yassine', 0.5, extra.yassine),
  p('nour', 0.68, extra.nour),
];
const ETAL: ObjetId[] = ['oranges'];
const ETAL_CHAT: ObjetId[] = ['oranges', 'queue-mchicha'];
const marchand = p('marchand', 0.87);
const retrouvee = (extra: Partial<Record<PersoId, Extra>> = {}) => [
  ...marche({ ines: { humeur: 'content', tient: 'mchicha' }, adam: { tient: 'orange' }, ...extra }),
  marchand,
];

const EPISODE_3: Episode = {
  numero: 3,
  titre: t('Où est Mchicha ?', '¿Dónde está Mchicha?'),
  mots: [
    { mot: 'fin ?', sens: t('où ?', '¿dónde?') },
    { mot: 'daba', sens: t('maintenant', 'ahora') },
    { mot: 'shukran', sens: t('merci', 'gracias') },
  ],
  plans: [
    { decor: 'marche', objets: ETAL, persos: [...marche(), marchand], parle: 'ines', texte: t('Mchicha a disparu ! Elle est où ? *Wili wili*…', '¡Mchicha ha desaparecido! ¿Dónde está? *Wili wili*…') },
    { decor: 'marche', objets: ETAL, persos: [...marche(), marchand], parle: 'yassine', texte: t('On dit *fin* ? *Fin* Mchicha ?', 'Se dice *fin*. ¿*Fin* Mchicha?') },
    { decor: 'marche', objets: ETAL, persos: [...marche({ adam: { depuis: 0.2 } }), marchand], parle: 'adam', texte: t('*Fin* Mchicha ? *Fin* ? *Fin* ?', '¿*Fin* Mchicha? ¿*Fin*? ¿*Fin*?') },
    { decor: 'marche', objets: ETAL_CHAT, persos: [...marche({ nour: { humeur: 'surpris' } }), marchand], parle: 'nour', texte: t('*Chouf*, là-bas !', '¡*Chouf*, allí!') },
    {
      decor: 'marche',
      objets: ETAL_CHAT,
      persos: [...marche({ adam: { humeur: 'surpris' } }), marchand],
      texte: t('Le marchand d’oranges montre son panier : une petite queue dépasse…', 'El vendedor de naranjas señala su cesta: asoma una colita…'),
    },
    { decor: 'marche', objets: ETAL_CHAT, persos: [...marche(), marchand], parle: 'yassine', texte: t('Il faut l’attraper *daba*, maintenant ! *Yallah*, *zid* !', '¡Hay que atraparla *daba*, ahora! ¡*Yallah*, *zid*!') },
    { decor: 'marche', objets: ETAL_CHAT, persos: [...marche(), marchand], parle: 'adam', texte: t('*Daba* ! *Daba* !', '¡*Daba*! ¡*Daba*!') },
    { decor: 'marche', objets: ETAL, persos: retrouvee({ nour: { humeur: 'rire' } }), texte: t('Inès attrape Mchicha. Le marchand donne une orange à Adam.', 'Inès atrapa a Mchicha. El vendedor le da una naranja a Adam.') },
    { decor: 'marche', objets: ETAL, persos: retrouvee(), parle: 'ines', texte: t('*Shukran* !', '¡*Shukran*!') },
    { decor: 'marche', objets: ETAL, persos: retrouvee({ adam: { tient: 'orange', humeur: 'rire' } }), parle: 'yassine', texte: t('*Wa3er*, Inès ! *Shukran*, c’est merci !', '¡*Wa3er*, Inès! *Shukran* es gracias.') },
    { decor: 'marche', objets: ETAL, persos: retrouvee(), parle: 'marchand', texte: t('*Bla jmil*, de rien, ma fille !', '¡*Bla jmil*, de nada, hija!') },
  ],
};

export const EPISODES: readonly Episode[] = [EPISODE_1, EPISODE_2, EPISODE_3];

// --- Le temps ---------------------------------------------------------------

export const GENERIQUE = 4;
export const MOTS = 9;
export const FIN = 4;
/** Lettres écrites par seconde dans les bulles. */
export const LETTRES_PAR_SECONDE = 22;
/** La bulle apparaît, puis le texte commence à s'écrire (secondes). */
export const DEBUT_ECRITURE = 0.25;

/** Le texte sans les astérisques. */
export function texteBrut(texte: string): string {
  return texte.replace(/\*/g, '');
}

// --- Les voix ---------------------------------------------------------------

/** Une réplique enregistrée : le fichier, sa durée, et l'ouverture de la bouche (30 valeurs par seconde, 0 à 9). */
export interface Clip {
  fichier: string;
  duree: number;
  bouche: string;
}

/** Les voix déjà prêtes, par épisode et par langue (scripts/kalimat-preparer-voix.mjs). */
const VOIX: Record<string, Record<string, Clip>> = { '1-fr': voix1fr };
/** Le personnage commence à parler un peu après le début du plan. */
export const DEBUT_VOIX = 0.2;

export const cleDuPlan = (index: number) => `p${String(index).padStart(2, '0')}`;

export function clip(ep: Episode, langue: Langue, cle: string): Clip | undefined {
  return VOIX[`${ep.numero}-${langue}`]?.[cle];
}

/** Vrai quand l'épisode est doublé dans cette langue : les personnages parlent, sans bulles. */
export function aDesVoix(ep: Episode, langue: Langue): boolean {
  return Boolean(VOIX[`${ep.numero}-${langue}`]);
}

/**
 * La durée d'un plan : le temps de la voix et une petite respiration quand
 * l'épisode est doublé ; sinon le temps d'écrire la bulle puis de la lire.
 */
export function dureePlan(plan: Plan, langue: Langue = 'fr', voix?: Clip): number {
  if (voix) return Math.max(1.4, Math.round((DEBUT_VOIX + voix.duree + 0.5) * 10) / 10);
  const lettres = texteBrut(plan.texte[langue]).length;
  return Math.max(2.4, Math.round((0.5 + lettres / LETTRES_PAR_SECONDE + 1.3) * 10) / 10);
}

const dureeDuPlan = (ep: Episode, index: number, langue: Langue) => dureePlan(ep.plans[index], langue, clip(ep, langue, cleDuPlan(index)));

export function dureeEpisode(ep: Episode, langue: Langue = 'fr'): number {
  return GENERIQUE + ep.plans.reduce((s, _plan, i) => s + dureeDuPlan(ep, i, langue), 0) + MOTS + FIN;
}

/** Où placer chaque voix dans l'épisode (en secondes). */
export function voixAuxTemps(ep: Episode, langue: Langue): { debut: number; clip: Clip }[] {
  if (!aDesVoix(ep, langue)) return [];
  const liste: { debut: number; clip: Clip }[] = [];
  const ajouter = (debut: number, c: Clip | undefined) => c && liste.push({ debut, clip: c });
  ajouter(0.2, clip(ep, langue, 'g'));
  let debut = GENERIQUE;
  ep.plans.forEach((_plan, i) => {
    ajouter(debut + DEBUT_VOIX, clip(ep, langue, cleDuPlan(i)));
    debut += dureeDuPlan(ep, i, langue);
  });
  for (let i = 0; i < 3; i++) ajouter(debut + i * (MOTS / 3) + 0.45, clip(ep, langue, `m${i}`));
  ajouter(debut + MOTS + 0.35, clip(ep, langue, 'f'));
  return liste;
}

export type Moment =
  | { partie: 'generique'; local: number; duree: number; debut: number }
  | { partie: 'plan'; index: number; plan: Plan; local: number; duree: number; debut: number }
  | { partie: 'mots'; local: number; duree: number; debut: number }
  | { partie: 'fin'; local: number; duree: number; debut: number };

/** Ce qui est à l'écran à l'instant `t` (en secondes depuis le début). */
export function momentA(ep: Episode, t: number, langue: Langue = 'fr'): Moment {
  let reste = Math.min(Math.max(0, t), dureeEpisode(ep, langue));
  if (reste < GENERIQUE) return { partie: 'generique', local: reste, duree: GENERIQUE, debut: 0 };
  reste -= GENERIQUE;
  let debut = GENERIQUE;
  for (let index = 0; index < ep.plans.length; index++) {
    const plan = ep.plans[index];
    const duree = dureeDuPlan(ep, index, langue);
    if (reste < duree) return { partie: 'plan', index, plan, local: reste, duree, debut };
    reste -= duree;
    debut += duree;
  }
  if (reste < MOTS) return { partie: 'mots', local: reste, duree: MOTS, debut };
  return { partie: 'fin', local: Math.min(reste - MOTS, FIN), duree: FIN, debut: debut + MOTS };
}

// --- Les mots à traduire sous la bulle --------------------------------------

/** Les mots déjà appris : ceux des « mots du jour » des épisodes d'avant. */
export function motsConnus(numero: number): Set<string> {
  const connus = new Set<string>();
  for (const ep of EPISODES) if (ep.numero < numero) for (const m of ep.mots) connus.add(cleDuMot(m.mot));
  return connus;
}

/**
 * Les mots à traduire sous la bulle de ce plan : les mots colorés pas encore
 * appris, la première fois qu'ils sortent dans l'épisode. Deux au plus.
 */
export function traductions(ep: Episode, index: number, langue: Langue): EntreeLexique[] {
  const connus = motsConnus(ep.numero);
  const dejaVus = new Set<string>();
  let resultat: EntreeLexique[] = [];
  for (let i = 0; i <= index; i++) {
    const nouveaux: EntreeLexique[] = [];
    for (const m of morceaux(ep.plans[i].texte[langue])) {
      if (!m.fort) continue;
      const entiere = LEXIQUE[cleDuMot(m.texte)];
      const cles = entiere ? [cleDuMot(m.texte)] : m.texte.split(/[\s,]+/).map(cleDuMot);
      for (const cle of cles) {
        const entree = LEXIQUE[cle];
        if (!entree || connus.has(cle) || dejaVus.has(cle)) continue;
        // Un mot de la langue de la version n'a pas besoin de traduction.
        if (entree.origine === langue) continue;
        dejaVus.add(cle);
        nouveaux.push(entree);
      }
    }
    resultat = nouveaux;
  }
  return resultat.slice(0, 2);
}

// --- Le texte ---------------------------------------------------------------

export interface Morceau {
  texte: string;
  /** Mot de darija (ou d'ailleurs) : affiché en couleur. */
  fort: boolean;
}

/** Découpe « *Salam*, Inès » en morceaux colorés ou non. */
export function morceaux(texte: string): Morceau[] {
  return texte
    .split('*')
    .map((bout, i) => ({ texte: bout, fort: i % 2 === 1 }))
    .filter((m) => m.texte !== '');
}

const dernier = (u: Morceau[]) => (u.length > 0 ? u[u.length - 1].texte : ' ');

/**
 * Range les mots en lignes qui tiennent dans `largeur`, sans perdre les
 * couleurs. `mesurer` donne la largeur d'un texte (celle du canvas en vrai).
 * La ponctuation (« ! », « ? »…) reste collée au mot d'avant.
 */
export function lignes(texte: string, largeur: number, mesurer: (s: string) => number): Morceau[][] {
  const unites: Morceau[][] = [];
  for (const m of morceaux(texte)) {
    for (const bout of m.texte.split(/(?<= )/)) {
      if (!bout) continue;
      const colle = /^[!?:;»…]+ ?$/.test(bout) || (unites.length > 0 && !/ $/.test(dernier(unites[unites.length - 1])));
      if (colle && unites.length > 0) unites[unites.length - 1].push({ texte: bout, fort: m.fort });
      else unites.push([{ texte: bout, fort: m.fort }]);
    }
  }
  const largeurDe = (u: Morceau[]) => u.reduce((s, m) => s + mesurer(m.texte), 0);
  const resultat: Morceau[][] = [];
  let ligne: Morceau[] = [];
  let pris = 0;
  for (const unite of unites) {
    const fin = unite.map((m) => m.texte).join('').trimEnd();
    if (ligne.length > 0 && pris + mesurer(fin) > largeur) {
      resultat.push(ligne);
      ligne = [];
      pris = 0;
    }
    ligne.push(...unite);
    pris += largeurDe(unite);
  }
  if (ligne.length > 0) resultat.push(ligne);
  return resultat;
}

// --- Sous-titres ------------------------------------------------------------

function horodatage(s: number): string {
  const ms = Math.round(s * 1000);
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const sec = Math.floor((ms % 60_000) / 1000);
  const reste = ms % 1000;
  const deux = (n: number) => String(n).padStart(2, '0');
  return `${deux(h)}:${deux(m)}:${deux(sec)},${String(reste).padStart(3, '0')}`;
}

/** Une réplique avec son temps, pour enregistrer les voix et sous-titrer. */
export interface Replique {
  debut: number;
  fin: number;
  qui: string;
  texte: string;
  narration: boolean;
}

export function texteFin(ep: Episode, langue: Langue): string {
  return ep.fin?.[langue] ?? (langue === 'es' ? '¡*Bslama*!' : '*Bslama* !');
}

export function repliques(ep: Episode, langue: Langue = 'fr'): Replique[] {
  const e = ECRAN[langue];
  const liste: Replique[] = [
    { debut: 0, fin: GENERIQUE, qui: 'Narration', narration: true, texte: `Kalimat, ${e.sousTitre}. ${e.episode} ${ep.numero} : ${ep.titre[langue]}` },
  ];
  let debut = GENERIQUE;
  for (const [i, plan] of ep.plans.entries()) {
    const duree = dureeDuPlan(ep, i, langue);
    liste.push({ debut, fin: debut + duree, qui: plan.parle ? NOMS[plan.parle][langue] : 'Narration', narration: !plan.parle, texte: texteBrut(plan.texte[langue]) });
    debut += duree;
  }
  const pas = MOTS / 3;
  ep.mots.forEach((m, i) => {
    liste.push({ debut: debut + i * pas, fin: debut + (i + 1) * pas, qui: e.motsDuJour, narration: true, texte: `${m.mot} = ${m.sens[langue]}` });
  });
  debut += MOTS;
  liste.push({ debut, fin: debut + FIN, qui: 'Narration', narration: true, texte: `${e.aDemain} ${texteBrut(texteFin(ep, langue))}` });
  return liste;
}

/** Fichier de sous-titres .srt, accepté par YouTube. */
export function sousTitresSrt(ep: Episode, langue: Langue = 'fr'): string {
  return repliques(ep, langue)
    .map((r, i) => `${i + 1}\n${horodatage(r.debut)} --> ${horodatage(r.fin)}\n${r.narration ? '' : `${r.qui.toUpperCase()} : `}${r.texte}\n`)
    .join('\n');
}

/** L'épisode suivant, pour l'annoncer à la fin (« Demain : … »). */
export function suivant(ep: Episode): Episode | undefined {
  return EPISODES.find((e) => e.numero === ep.numero + 1);
}
