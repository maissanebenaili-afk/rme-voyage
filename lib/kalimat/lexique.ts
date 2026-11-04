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
}

/** La clé d'un mot : minuscules, sans ponctuation autour. */
export function cleDuMot(mot: string): string {
  return mot
    .toLowerCase()
    .replace(/[’']/g, '’')
    .replace(/^[\s¡¿!?,.:;«»…]+|[\s¡¿!?,.:;«»…]+$/g, '');
}

const d = (mot: string, fr: string, es: string, origine: Origine = 'darija'): [string, EntreeLexique] => [cleDuMot(mot), { mot, fr, es, origine }];

export const LEXIQUE: Record<string, EntreeLexique> = Object.fromEntries([
  // Saison 1 — épisodes 1 à 3
  d('chouf', 'regarde', 'mira'),
  d('salam', 'bonjour', 'hola'),
  d('wakha', 'd’accord', 'vale'),
  d('labas', 'ça va', 'qué tal'),
  d('hamdoullah', 'Dieu merci', 'gracias a Dios'),
  d('hchouma', 'la honte', 'qué vergüenza'),
  d('3afak', 's’il te plaît', 'por favor'),
  d('zwin', 'beau', 'bonito'),
  d('vale', 'd’accord (espagnol)', 'vale', 'es'),
  d('d’accord', 'd’accord', 'vale (francés)', 'fr'),
  d('safi', 'c’est bon', 'ya está'),
  d('atay', 'thé', 'té'),
  d('bzzaf', 'beaucoup', 'mucho'),
  d('chwiya', 'doucement', 'despacito'),
  d('khobz', 'pain', 'pan'),
  d('kouli', 'mange', 'come'),
  d('lekker', 'bon (néerlandais)', 'rico (neerlandés)', 'nl'),
  d('mzyan', 'bien', 'bien'),
  d('bsaha', 'bon appétit', 'buen provecho'),
  d('wili', 'oh là là', 'ay, ay'),
  d('fin', 'où', 'dónde'),
  d('yallah', 'allez', 'vamos'),
  d('zid', 'vas-y', 'sigue'),
  d('daba', 'maintenant', 'ahora'),
  d('shukran', 'merci', 'gracias'),
  d('wa3er', 'trop fort', 'genial'),
  d('bla jmil', 'de rien', 'de nada'),
  d('bslama', 'au revoir', 'adiós'),
  d('doei', 'salut (néerlandais)', 'adiós (neerlandés)', 'nl'),
]);
