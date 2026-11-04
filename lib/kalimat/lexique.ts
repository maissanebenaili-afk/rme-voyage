// Le dictionnaire de la série : chaque mot coloré des bulles, avec son sens
// dans les langues des versions. Il grandit avec les épisodes : c'est la
// liste des mots que les enfants apprennent, petit à petit.
//
// `origine` : la langue du mot. Darija par défaut ; « es » pour un mot
// espagnol (pas traduit dans la version espagnole), « fr » pour un mot
// français (pas traduit dans la version française), « nl » pour le néerlandais.

export type Origine = 'darija' | 'fr' | 'es' | 'nl';

export interface EntreeLexique {
  mot: string;
  fr: string;
  es: string;
  origine: Origine;
  /** Comment l'écrire pour que la voix de synthèse le prononce bien, dans chaque version. */
  dire?: { fr?: string; es?: string };
}

/** La clé d'un mot : minuscules, sans ponctuation autour. */
export function cleDuMot(mot: string): string {
  return mot
    .toLowerCase()
    .replace(/[’']/g, '’')
    .replace(/^[\s¡¿!?,.:;«»…]+|[\s¡¿!?,.:;«»…]+$/g, '');
}

const d = (mot: string, fr: string, es: string, origine: Origine = 'darija', dire?: EntreeLexique['dire']): [string, EntreeLexique] => [
  cleDuMot(mot),
  { mot, fr, es, origine, ...(dire ? { dire } : {}) },
];

export const LEXIQUE: Record<string, EntreeLexique> = Object.fromEntries([
  // Saison 1 — épisodes 1 à 3
  d('chouf', 'regarde', 'mira', 'darija', { es: 'chuf' }),
  d('salam', 'bonjour', 'hola'),
  d('wakha', 'd’accord', 'vale', 'darija', { fr: 'ouakha', es: 'uaja' }),
  d('labas', 'ça va', 'qué tal', 'darija', { fr: 'labasse' }),
  d('hamdoullah', 'Dieu merci', 'gracias a Dios'),
  d('hchouma', 'la honte', 'qué vergüenza', 'darija', { es: 'jchuma' }),
  d('3afak', 's’il te plaît', 'por favor', 'darija', { fr: 'âafak', es: 'áafak' }),
  d('zwin', 'beau', 'bonito', 'darija', { fr: 'zouine', es: 'zuín' }),
  d('vale', 'd’accord (espagnol)', 'vale', 'es', { fr: 'balé' }),
  d('d’accord', 'd’accord', 'vale (francés)', 'fr', { es: 'dacor' }),
  d('safi', 'c’est bon', 'ya está'),
  d('atay', 'thé', 'té'),
  d('bzzaf', 'beaucoup', 'mucho', 'darija', { fr: 'bezzaf', es: 'bezzaf' }),
  d('chwiya', 'doucement', 'despacito', 'darija', { fr: 'chouiya', es: 'chuiya' }),
  d('khobz', 'pain', 'pan', 'darija', { es: 'jobz' }),
  d('kouli', 'mange', 'come', 'darija', { es: 'kuli' }),
  d('lekker', 'bon (néerlandais)', 'rico (neerlandés)', 'nl', { fr: 'lékeur', es: 'léker' }),
  d('mzyan', 'bien', 'bien', 'darija', { fr: 'mezziane', es: 'mezián' }),
  d('bsaha', 'bon appétit', 'buen provecho'),
  d('wili', 'oh là là', 'ay, ay', 'darija', { fr: 'ouili' }),
  d('fin', 'où', 'dónde', 'darija', { fr: 'fine' }),
  d('yallah', 'allez', 'vamos'),
  d('zid', 'vas-y', 'sigue'),
  d('daba', 'maintenant', 'ahora'),
  d('shukran', 'merci', 'gracias', 'darija', { fr: 'choukrane', es: 'shukrán' }),
  d('wa3er', 'trop fort', 'genial', 'darija', { fr: 'ouaâr', es: 'uaár' }),
  d('bla jmil', 'de rien', 'de nada', 'darija', { fr: 'bla jmil', es: 'bla yemil' }),
  d('bslama', 'au revoir', 'adiós', 'darija', { fr: 'bsselama', es: 'bselama' }),
  d('doei', 'salut (néerlandais)', 'adiós (neerlandés)', 'nl', { fr: 'doui', es: 'dui' }),
]);
