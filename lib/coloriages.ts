// Livres de coloriage : informations des livres et boutiques où l'acheter.
// Les liens restent vides tant que le livre n'est pas publié : la page affiche alors « Bientôt disponible »
// et n'invente jamais de lien. Pour publier un lien, remplir `url` ci-dessous (https, boutique autorisée).

export interface Boutique { id: string; nom: string; url: string; note: string }

export interface Livre {
  id: string;
  titre: string;
  sousTitre: string;
  dessins: number;
  pages: number;
  format: string;
  echantillon: string;
  couverture: string;
  /** Début du nom des fichiers d'aperçu : `/coloriages/<prefixe><id>.png`. */
  prefixe: string;
  contenu: string;
  apercus: readonly { id: string; alt: string }[];
}

const FORMAT = '8,5 × 11 pouces (21,6 × 27,9 cm), noir et blanc';

export const LIVRE: Livre = {
  id: 'maroc',
  titre: 'Coloriages du Maroc',
  sousTitre: 'Zellige, rosaces, lanternes et thé à la menthe',
  dessins: 25,
  pages: 28,
  format: FORMAT,
  echantillon: '/coloriages/echantillon-coloriages-du-maroc.pdf',
  couverture: '/coloriages/couverture.png',
  prefixe: 'apercu-',
  contenu: 'Zellige, rosaces, portes, lanternes, thé à la menthe',
  apercus: [
    { id: 'rosace-4', alt: 'Rosace de Chefchaouen à colorier' },
    { id: 'zellige-1', alt: 'Pavage de zellige à colorier' },
    { id: 'porte-1', alt: 'Porte de la médina à colorier' },
    { id: 'fanous-1', alt: 'Lanterne marocaine à colorier' },
    { id: 'theiere-1', alt: 'Théière marocaine à colorier' },
    { id: 'verres-1', alt: 'Verres de thé à la menthe à colorier' },
    { id: 'khamsa-1', alt: 'Khamsa porte-bonheur à colorier' },
    { id: 'rosace-2', alt: 'Rosace de Marrakech à colorier' },
  ],
};

export const LIVRE_NOUR: Livre = {
  id: 'nour',
  titre: 'Coloriages de Nour, Joha et la fée',
  sousTitre: 'Les héros des histoires RME Voyage à colorier',
  dessins: 25,
  pages: 28,
  format: FORMAT,
  echantillon: '/coloriages/echantillon-nour-joha-et-la-fee.pdf',
  couverture: '/coloriages/couverture-nour.png',
  prefixe: 'apercu-nour-',
  contenu: 'Nour, Yacine, Joha, Lalla Zahra, la fée Nejma, des scènes de voyage et 12 mandalas',
  apercus: [
    { id: 'nour', alt: 'Portrait de Nour à colorier' },
    { id: 'joha', alt: 'Portrait de Joha le malicieux à colorier' },
    { id: 'nejma', alt: 'Lalla Nejma, la bonne fée, à colorier' },
    { id: 'lettre', alt: 'Nour qui tient une lettre, à colorier' },
    { id: 'lune', alt: 'Joha et la lune dans le puits, à colorier' },
    { id: 'voiture', alt: 'Une voiture en route vers le Maroc, à colorier' },
    { id: 'medina', alt: 'La médina au soleil, à colorier' },
    { id: 'mandala-5', alt: 'Mandala des étoiles à colorier' },
  ],
};

export const LIVRES: Livre[] = [LIVRE, LIVRE_NOUR];

/** Boutiques à remplir au moment de la publication. Vide = pas encore en vente. */
const modeleBoutiques = (): Boutique[] => [
  { id: 'amazon', nom: 'Amazon (livre broché)', url: '', note: 'Livre papier, livré chez vous.' },
  { id: 'pdf', nom: 'Version PDF à imprimer', url: '', note: 'À imprimer chez vous, tout de suite.' },
];
export const BOUTIQUES: Boutique[] = modeleBoutiques();
export const BOUTIQUES_PAR_LIVRE: Record<string, Boutique[]> = { maroc: BOUTIQUES, nour: modeleBoutiques() };

const HOTES_AUTORISES = ['amazon.fr', 'www.amazon.fr', 'amazon.com', 'www.amazon.com', 'amzn.to', 'a.co', 'etsy.com', 'www.etsy.com', 'gumroad.com', 'www.lulu.com', 'lulu.com'];

/** Un lien n'est affiché que s'il est en https vers une boutique connue (ou un sous-domaine gumroad.com). */
export function lienValide(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && (HOTES_AUTORISES.includes(u.hostname) || u.hostname.endsWith('.gumroad.com'));
  } catch {
    // Texte qui n'est pas une adresse : on ne l'affiche pas.
    return false;
  }
}

export const boutiquesActives = (liste: Boutique[] = BOUTIQUES): Boutique[] => liste.filter((b) => lienValide(b.url));
