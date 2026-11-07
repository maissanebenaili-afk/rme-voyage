// Coloriages du Maroc : informations du livre et boutiques où l'acheter.
// Les liens restent vides tant que le livre n'est pas publié : la page affiche alors « Bientôt disponible »
// et n'invente jamais de lien. Pour publier un lien, remplir `url` ci-dessous (https, boutique autorisée).

export interface Boutique { id: string; nom: string; url: string; note: string }

export const LIVRE = {
  titre: 'Coloriages du Maroc',
  sousTitre: 'Zellige, rosaces, lanternes et thé à la menthe',
  dessins: 25,
  pages: 28,
  format: '8,5 × 11 pouces (21,6 × 27,9 cm), noir et blanc',
  echantillon: '/coloriages/echantillon-coloriages-du-maroc.pdf',
  couverture: '/coloriages/couverture.png',
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
} as const;

/** Boutiques à remplir au moment de la publication. Vide = pas encore en vente. */
export const BOUTIQUES: Boutique[] = [
  { id: 'amazon', nom: 'Amazon (livre broché)', url: '', note: 'Livre papier, livré chez vous.' },
  { id: 'pdf', nom: 'Version PDF à imprimer', url: '', note: 'À imprimer chez vous, tout de suite.' },
];

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
