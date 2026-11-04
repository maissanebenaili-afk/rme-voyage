// « Kalimat — les mots du bled » : les épisodes, sous forme de données.
//
// Chaque épisode = un générique, une suite de plans (un décor, des
// personnages, une réplique dans une bulle), « Les mots du jour », puis la fin.
// Dans les répliques, les mots entre astérisques (*salam*) sont les mots de
// darija ou d'ailleurs : ils s'affichent en couleur.
// Textes repris de docs/dessins-animes/episodes-01-03.md.

export type PersoId = 'ines' | 'adam' | 'yassine' | 'nour' | 'mima' | 'mchicha' | 'marchand';
export type DecorId = 'port' | 'cuisine' | 'marche';
export type Humeur = 'content' | 'inquiet' | 'surpris';
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
  texte: string;
  objets?: ObjetId[];
  /** Durée imposée en secondes ; sinon calculée selon la longueur du texte. */
  duree?: number;
}

export interface MotDuJour {
  mot: string;
  sens: string;
}

export interface Episode {
  numero: number;
  titre: string;
  mots: [MotDuJour, MotDuJour, MotDuJour];
  plans: Plan[];
  /** Phrase de fin, « À demain ! Bslama ! » par défaut. */
  fin?: string;
}

export const NOMS: Record<PersoId, string> = {
  ines: 'Inès',
  adam: 'Adam',
  yassine: 'Yassine',
  nour: 'Nour',
  mima: 'Mima',
  mchicha: 'Mchicha',
  marchand: 'Le marchand',
};

const p = (id: PersoId, x: number, extra: Omit<Placement, 'id' | 'x'> = {}): Placement => ({ id, x, ...extra });

// Épisode 1 : le port de Tanger Med.
const quai = (extra: Partial<Record<PersoId, Omit<Placement, 'id' | 'x'>>> = {}) => [
  p('ines', 0.16, extra.ines),
  p('adam', 0.36, extra.adam),
  p('yassine', 0.62, { tient: 'pancarte', ...extra.yassine }),
  p('mima', 0.85, extra.mima),
];
const PORT: ObjetId[] = ['ferry'];

const EPISODE_1: Episode = {
  numero: 1,
  titre: 'Salam, Yassine !',
  mots: [
    { mot: 'salam', sens: 'bonjour' },
    { mot: 'labas ?', sens: 'ça va ?' },
    { mot: 'zwin', sens: 'beau' },
  ],
  plans: [
    {
      decor: 'port',
      objets: PORT,
      persos: [p('ines', 0.3, { depuis: 0.04 }), p('adam', 0.55, { depuis: 0.2 })],
      parle: 'ines',
      texte: '*Chouf*, Adam, la mer elle brille !',
    },
    {
      decor: 'port',
      objets: PORT,
      persos: [p('ines', 0.16), p('adam', 0.36), p('yassine', 0.62, { depuis: 1.15, tient: 'pancarte' }), p('mima', 0.85, { depuis: 1.3 })],
      parle: 'yassine',
      texte: '*Salam* !',
      duree: 2.6,
    },
    { decor: 'port', objets: PORT, persos: quai({ ines: { humeur: 'surpris' } }), parle: 'ines', texte: '*Salam*… ça veut dire bonjour, c’est ça ?' },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'yassine', texte: '*Wakha*, t’as tout compris ! *Salam* !' },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'mima', texte: '*Labas*, mes chéris ? Ça va, le voyage ?' },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'yassine', texte: 'Tu réponds : *labas, hamdoullah* !' },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'ines', texte: '*Labas, hamdoullah* !' },
    {
      decor: 'port',
      objets: PORT,
      persos: [p('ines', 0.16), p('adam', 0.5, { depuis: 0.36 }), p('yassine', 0.7, { tient: 'pancarte' }), p('mima', 0.88)],
      parle: 'adam',
      texte: '*Labas* la mer !',
    },
    {
      decor: 'port',
      objets: PORT,
      persos: [p('ines', 0.16), p('adam', 0.36, { depuis: 0.5 }), p('yassine', 0.62, { tient: 'pancarte' }), p('mima', 0.85, { humeur: 'surpris' })],
      parle: 'mima',
      texte: '*Hchouma*, Adam, reviens, *3afak* !',
    },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'mima', texte: 'Qu’il est *zwin*, mon petit-fils !' },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'yassine', texte: '*Zwin*, c’est beau.' },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'adam', texte: 'Moi *zwin* ! Trop *zwin* !' },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'yassine', texte: 'On rentre à la maison ?' },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'ines', texte: '*Vale* !', duree: 2.2 },
    { decor: 'port', objets: PORT, persos: quai({ yassine: { humeur: 'surpris' } }), parle: 'yassine', texte: 'Tu parles espagnol, toi ?' },
    { decor: 'port', objets: PORT, persos: quai(), parle: 'ines', texte: 'C’est toi qui dis ça tout le temps !' },
    {
      decor: 'port',
      objets: ['ferry', 'voiture'],
      persos: [p('ines', 0.14), p('adam', 0.32), p('mchicha', 0.9, { depuis: 0.5, saut: true, perche: 250 })],
      texte: 'Et hop ! Mchicha saute dans le coffre, entre les valises.',
    },
  ],
};

// Épisode 2 : la cuisine de Mima.
const cuisine = (extra: Partial<Record<PersoId, Omit<Placement, 'id' | 'x'>>> = {}) => [
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
  titre: 'Atay chez Mima',
  mots: [
    { mot: 'atay', sens: 'thé' },
    { mot: 'khobz', sens: 'pain' },
    { mot: 'bzzaf', sens: 'beaucoup' },
  ],
  plans: [
    {
      decor: 'cuisine',
      objets: TABLE,
      persos: cuisine({ nour: { depuis: 1.25, tient: 'valise' } }),
      parle: 'nour',
      texte: '*Salam* tout le monde ! *Safi*, j’suis là, la fête peut commencer !',
    },
    { decor: 'cuisine', objets: ['verres'], persos: cuisine({ mima: { tient: 'theiere' } }), parle: 'mima', texte: 'Qui veut de l’*atay* ?' },
    { decor: 'cuisine', objets: TABLE, persos: cuisine(), parle: 'yassine', texte: '*Atay*, c’est le thé !' },
    { decor: 'cuisine', objets: TABLE, persos: cuisine({ adam: { tient: 'verre' } }), parle: 'adam', texte: '*Atay*, *bzzaf* !' },
    {
      decor: 'cuisine',
      objets: TABLE,
      persos: cuisine({ adam: { tient: 'verre' } }),
      parle: 'yassine',
      texte: '*Bzzaf*, ça veut dire beaucoup… mais c’est chaud, *chwiya chwiya* !',
    },
    { decor: 'cuisine', objets: TABLE_PAIN, persos: cuisine({ ines: { humeur: 'surpris' } }), parle: 'ines', texte: 'C’est quoi, *khobz* ?' },
    { decor: 'cuisine', objets: TABLE_PAIN, persos: cuisine(), parle: 'mima', texte: '*Khobz*, c’est le pain. *Kouli*, mange !' },
    { decor: 'cuisine', objets: TABLE_PAIN, persos: cuisine({ nour: { tient: 'khobz' } }), parle: 'nour', texte: 'Mmm, *lekker* !' },
    { decor: 'cuisine', objets: TABLE_PAIN, persos: cuisine({ adam: { humeur: 'surpris' } }), parle: 'adam', texte: '*Lekker* ? C’est quoi ?' },
    { decor: 'cuisine', objets: TABLE_PAIN, persos: cuisine(), parle: 'nour', texte: 'Ça veut dire « c’est bon », en néerlandais !' },
    { decor: 'cuisine', objets: TABLE_PAIN, persos: cuisine(), parle: 'mima', texte: '*Lekker*, *mzyan*… tant que tu manges, *bsaha* !' },
    {
      decor: 'cuisine',
      objets: TABLE_PAIN,
      persos: [...cuisine({ adam: { humeur: 'surpris' } }), p('mchicha', 1.1, { depuis: 0.42, tient: 'khobz' })],
      texte: 'Mchicha vole un bout de *khobz* et part en courant !',
    },
    { decor: 'cuisine', objets: TABLE_PAIN, persos: cuisine(), parle: 'adam', texte: 'Mchicha, elle aime le *khobz* *bzzaf* ! *Hchouma*, Mchicha !' },
  ],
  fin: 'À demain ! *Bslama* ! *Doei* !',
};

// Épisode 3 : le marché de la médina.
const marche = (extra: Partial<Record<PersoId, Omit<Placement, 'id' | 'x'>>> = {}) => [
  p('ines', 0.14, { humeur: 'inquiet', ...extra.ines }),
  p('adam', 0.32, extra.adam),
  p('yassine', 0.5, extra.yassine),
  p('nour', 0.68, extra.nour),
];
const ETAL: ObjetId[] = ['oranges'];
const ETAL_CHAT: ObjetId[] = ['oranges', 'queue-mchicha'];
const marchand = p('marchand', 0.87);

const EPISODE_3: Episode = {
  numero: 3,
  titre: 'Où est Mchicha ?',
  mots: [
    { mot: 'fin ?', sens: 'où ?' },
    { mot: 'daba', sens: 'maintenant' },
    { mot: 'shukran', sens: 'merci' },
  ],
  plans: [
    { decor: 'marche', objets: ETAL, persos: [...marche(), marchand], parle: 'ines', texte: 'Mchicha a disparu ! Elle est où ? *Wili wili*…' },
    { decor: 'marche', objets: ETAL, persos: [...marche(), marchand], parle: 'yassine', texte: 'On dit *fin* ? *Fin* Mchicha ?' },
    {
      decor: 'marche',
      objets: ETAL,
      persos: [...marche({ adam: { depuis: 0.2 } }), marchand],
      parle: 'adam',
      texte: '*Fin* Mchicha ? *Fin* ? *Fin* ?',
    },
    { decor: 'marche', objets: ETAL_CHAT, persos: [...marche({ nour: { humeur: 'surpris' } }), marchand], parle: 'nour', texte: '*Chouf*, là-bas !' },
    {
      decor: 'marche',
      objets: ETAL_CHAT,
      persos: [...marche(), marchand],
      texte: 'Le marchand d’oranges montre son panier : une petite queue dépasse…',
    },
    {
      decor: 'marche',
      objets: ETAL_CHAT,
      persos: [...marche(), marchand],
      parle: 'yassine',
      texte: 'Il faut l’attraper *daba*, maintenant ! *Yallah*, *zid* !',
    },
    { decor: 'marche', objets: ETAL_CHAT, persos: [...marche(), marchand], parle: 'adam', texte: '*Daba* ! *Daba* !', duree: 2.2 },
    {
      decor: 'marche',
      objets: ETAL,
      persos: [...marche({ ines: { humeur: 'content', tient: 'mchicha' }, adam: { tient: 'orange' } }), marchand],
      texte: 'Inès attrape Mchicha. Le marchand donne une orange à Adam.',
    },
    {
      decor: 'marche',
      objets: ETAL,
      persos: [...marche({ ines: { humeur: 'content', tient: 'mchicha' }, adam: { tient: 'orange' } }), marchand],
      parle: 'ines',
      texte: '*Shukran* !',
      duree: 2.2,
    },
    {
      decor: 'marche',
      objets: ETAL,
      persos: [...marche({ ines: { humeur: 'content', tient: 'mchicha' }, adam: { tient: 'orange' } }), marchand],
      parle: 'yassine',
      texte: '*Wa3er*, Inès ! *Shukran*, c’est merci !',
    },
    {
      decor: 'marche',
      objets: ETAL,
      persos: [...marche({ ines: { humeur: 'content', tient: 'mchicha' }, adam: { tient: 'orange' } }), marchand],
      parle: 'marchand',
      texte: '*Bla jmil*, de rien, ma fille !',
    },
  ],
};

export const EPISODES: readonly Episode[] = [EPISODE_1, EPISODE_2, EPISODE_3];

// --- Le temps ---------------------------------------------------------------

export const GENERIQUE = 4;
export const MOTS = 9;
export const FIN = 3;

/** Le texte sans les astérisques. */
export function texteBrut(texte: string): string {
  return texte.replace(/\*/g, '');
}

/** Assez de temps pour lire la bulle à voix haute : au moins 2,2 secondes. */
export function dureePlan(plan: Plan): number {
  if (plan.duree) return plan.duree;
  return Math.max(2.2, Math.round((1 + texteBrut(plan.texte).length * 0.05) * 10) / 10);
}

export function dureeEpisode(ep: Episode): number {
  return GENERIQUE + ep.plans.reduce((s, plan) => s + dureePlan(plan), 0) + MOTS + FIN;
}

export type Moment =
  | { partie: 'generique'; local: number; duree: number }
  | { partie: 'plan'; index: number; plan: Plan; local: number; duree: number; debut: number }
  | { partie: 'mots'; local: number; duree: number }
  | { partie: 'fin'; local: number; duree: number };

/** Ce qui est à l'écran à l'instant `t` (en secondes depuis le début). */
export function momentA(ep: Episode, t: number): Moment {
  let reste = Math.min(Math.max(0, t), dureeEpisode(ep));
  if (reste < GENERIQUE) return { partie: 'generique', local: reste, duree: GENERIQUE };
  reste -= GENERIQUE;
  let debut = GENERIQUE;
  for (let index = 0; index < ep.plans.length; index++) {
    const plan = ep.plans[index];
    const duree = dureePlan(plan);
    if (reste < duree) return { partie: 'plan', index, plan, local: reste, duree, debut };
    reste -= duree;
    debut += duree;
  }
  if (reste < MOTS) return { partie: 'mots', local: reste, duree: MOTS };
  return { partie: 'fin', local: Math.min(reste - MOTS, FIN), duree: FIN };
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

/**
 * Range les mots en lignes qui tiennent dans `largeur`, sans perdre les
 * couleurs. `mesurer` donne la largeur d'un texte (celle du canvas en vrai).
 * La ponctuation (« ! », « ? »…) reste collée au mot d'avant.
 */
const dernier = (u: Morceau[]) => (u.length > 0 ? u[u.length - 1].texte : ' ');

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
}

export function repliques(ep: Episode): Replique[] {
  const liste: Replique[] = [{ debut: 0, fin: GENERIQUE, qui: 'Narration', texte: `Kalimat, les mots du bled. Épisode ${ep.numero} : ${ep.titre}` }];
  let debut = GENERIQUE;
  for (const plan of ep.plans) {
    const duree = dureePlan(plan);
    liste.push({ debut, fin: debut + duree, qui: plan.parle ? NOMS[plan.parle] : 'Narration', texte: texteBrut(plan.texte) });
    debut += duree;
  }
  const pas = MOTS / 3;
  ep.mots.forEach((m, i) => {
    liste.push({ debut: debut + i * pas, fin: debut + (i + 1) * pas, qui: 'Les mots du jour', texte: `${m.mot} = ${m.sens}` });
  });
  debut += MOTS;
  liste.push({ debut, fin: debut + FIN, qui: 'Tous', texte: texteBrut(ep.fin ?? 'À demain ! *Bslama* !') });
  return liste;
}

/** Fichier de sous-titres .srt, accepté par YouTube. */
export function sousTitresSrt(ep: Episode): string {
  return repliques(ep)
    .map((r, i) => `${i + 1}\n${horodatage(r.debut)} --> ${horodatage(r.fin)}\n${r.qui === 'Narration' || r.qui === 'Les mots du jour' ? '' : `${r.qui.toUpperCase()} : `}${r.texte}\n`)
    .join('\n');
}
