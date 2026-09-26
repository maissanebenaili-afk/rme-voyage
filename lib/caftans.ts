export type CaftanView = 'face' | 'dos' | 'detail';

export type Silhouette = 'droit' | 'evase' | 'sirene' | 'takchita' | 'cape';

export type Motif = 'zellige' | 'floral' | 'sfifa';

export type Mode = 'location' | 'vente';

export type CaftanImage = {
  src: string;
  alt: string;
  view: CaftanView;
  /** Crédit affiché sous la galerie. Obligatoire pour toute photo non fournie par Marwa. */
  credit?: string;
};

export type Caftan = {
  id: string;
  name: string;
  style: string;
  color: string;
  /** Doré, argenté… utilisé pour la broderie de l'illustration. */
  accent: string;
  gradient: string;
  silhouette: Silhouette;
  motif: Motif;
  matiere: string;
  prixLocation: number;
  prixVente: number;
  caution: number;
  tailles: string[];
  occasion: string[];
  /** Sélection de la boutique (choix éditorial, pas une note de clientes). */
  coupDeCoeur?: boolean;
  dispo: boolean;
  description: string;
  /** Vraies photos. Dès qu'elles existent, elles priment sur l'illustration. */
  images?: CaftanImage[];
};

export const CAFTANS: Caftan[] = [
  {
    id: 'c1', name: 'Zahia', style: 'Broderie dorée', color: '#6b1a2e', accent: '#d4af37',
    gradient: 'from-[#6b1a2e] to-[#a0344a]', silhouette: 'evase', motif: 'zellige',
    matiere: 'Velours de soie', prixLocation: 150, prixVente: 850, caution: 200,
    tailles: ['S', 'M', 'L'], occasion: ['Mariage', 'Fiançailles'], coupDeCoeur: true, dispo: true,
    description: 'Un grenat profond rehaussé d\'une broderie zellige à l\'empiècement et à l\'ourlet. La coupe évasée tombe sans marquer, portée avec la mdamma assortie.',
  },
  {
    id: 'c2', name: 'Nour', style: 'Perles & soie', color: '#bfa882', accent: '#f0e6d2',
    gradient: 'from-[#bfa882] to-[#e8dcc8]', silhouette: 'takchita', motif: 'floral',
    matiere: 'Soie sauvage', prixLocation: 200, prixVente: 1200, caution: 300,
    tailles: ['XS', 'S', 'M'], occasion: ['Mariage'], coupDeCoeur: true, dispo: true,
    description: 'Une takchita deux pièces en soie champagne, dfina perlée à la main. La pièce de cérémonie par excellence, pensée pour la mariée.',
  },
  {
    id: 'c3', name: 'Malika', style: 'Velours vert émeraude', color: '#1a5c3a', accent: '#d4af37',
    gradient: 'from-[#1a5c3a] to-[#2d9d62]', silhouette: 'evase', motif: 'sfifa',
    matiere: 'Velours frappé', prixLocation: 180, prixVente: 950, caution: 250,
    tailles: ['M', 'L', 'XL'], occasion: ['Mariage', 'Soirée'], coupDeCoeur: true, dispo: true,
    description: 'Émeraude et sfifa dorée le long du plastron. Un velours dense qui tient la lumière toute la soirée.',
  },
  {
    id: 'c4', name: 'Amira', style: 'Rose poudré brodé', color: '#c4607a', accent: '#e8c4a0',
    gradient: 'from-[#c4607a] to-[#e8a8ba]', silhouette: 'droit', motif: 'floral',
    matiere: 'Mousseline doublée', prixLocation: 130, prixVente: 720, caution: 180,
    tailles: ['XS', 'S', 'M', 'L'], occasion: ['Fiançailles', 'Baptême'], dispo: true,
    description: 'Rose poudré et broderie florale ton sur ton. Léger, facile à porter une journée entière.',
  },
  {
    id: 'c5', name: 'Yasmine', style: 'Doré palace', color: '#8a5c10', accent: '#f5d98a',
    gradient: 'from-[#8a5c10] to-[#c9903a]', silhouette: 'sirene', motif: 'zellige',
    matiere: 'Brocart', prixLocation: 220, prixVente: 1500, caution: 350,
    tailles: ['S', 'M'], occasion: ['Mariage'], coupDeCoeur: true, dispo: false,
    description: 'Brocart doré, coupe sirène ajustée jusqu\'au genou. La pièce la plus demandée de la collection.',
  },
  {
    id: 'c6', name: 'Fatima Zahra', style: 'Bleu roi & argent', color: '#1e3a8a', accent: '#d8dee9',
    gradient: 'from-[#1e3a8a] to-[#3b82f6]', silhouette: 'droit', motif: 'sfifa',
    matiere: 'Satin duchesse', prixLocation: 120, prixVente: 650, caution: 160,
    tailles: ['S', 'M', 'L', 'XL'], occasion: ['Soirée', 'Mariage'], dispo: true,
    description: 'Bleu roi franc, sfifa argentée au col et aux poignets. La coupe droite la plus polyvalente du catalogue.',
  },
  {
    id: 'c7', name: 'Siham', style: 'Noir & broderie argent', color: '#1a1a2e', accent: '#c0c6d4',
    gradient: 'from-[#1a1a2e] to-[#4a4a6a]', silhouette: 'sirene', motif: 'zellige',
    matiere: 'Crêpe lourd', prixLocation: 160, prixVente: 900, caution: 220,
    tailles: ['XS', 'S', 'M'], occasion: ['Soirée', 'Gala'], coupDeCoeur: true, dispo: true,
    description: 'Noir profond et zellige argenté. Une silhouette sirène qui fonctionne aussi bien en gala qu\'en soirée.',
  },
  {
    id: 'c8', name: 'Houda', style: 'Turquoise & or', color: '#0d6e6e', accent: '#d4af37',
    gradient: 'from-[#0d6e6e] to-[#2ab5b5]', silhouette: 'evase', motif: 'floral',
    matiere: 'Soie lavée', prixLocation: 140, prixVente: 780, caution: 200,
    tailles: ['M', 'L'], occasion: ['Baptême', 'Fiançailles'], dispo: true,
    description: 'Turquoise lumineux et broderie florale dorée. Une soie lavée souple, très agréable en journée.',
  },
  {
    id: 'c9', name: 'Karima', style: 'Prune & dentelle', color: '#5b1e6e', accent: '#e0c3f0',
    gradient: 'from-[#5b1e6e] to-[#9c4dc4]', silhouette: 'cape', motif: 'floral',
    matiere: 'Dentelle sur satin', prixLocation: 170, prixVente: 920, caution: 230,
    tailles: ['S', 'M', 'L'], occasion: ['Mariage', 'Soirée'], coupDeCoeur: true, dispo: true,
    description: 'Prune et dentelle, avec une cape fluide qui se détache aux épaules. Beaucoup d\'allure pour peu de contrainte.',
  },
  {
    id: 'c10', name: 'Zainab', style: 'Ivoire & corail', color: '#c97a5a', accent: '#f5e6d8',
    gradient: 'from-[#c97a5a] to-[#e8b898]', silhouette: 'droit', motif: 'sfifa',
    matiere: 'Lin de soie', prixLocation: 135, prixVente: 750, caution: 180,
    tailles: ['XS', 'S', 'M', 'L'], occasion: ['Fiançailles', 'Baptême'], dispo: true,
    description: 'Ivoire réchauffé de corail, sfifa ton sur ton. Le lin de soie respire, idéal pour les cérémonies d\'été.',
  },
  {
    id: 'c11', name: 'Samira', style: 'Rouge grenat luxe', color: '#7c1d1d', accent: '#f5d98a',
    gradient: 'from-[#7c1d1d] to-[#c44040]', silhouette: 'takchita', motif: 'zellige',
    matiere: 'Velours et brocart', prixLocation: 195, prixVente: 1100, caution: 270,
    tailles: ['S', 'M'], occasion: ['Mariage'], coupDeCoeur: true, dispo: true,
    description: 'Takchita grenat, dfina en brocart doré sur velours. Une pièce de mariage classique, exécutée au détail près.',
  },
  {
    id: 'c12', name: 'Layla', style: 'Lavande & cristaux', color: '#4a3a7e', accent: '#e8e0f5',
    gradient: 'from-[#4a3a7e] to-[#9e8ec4]', silhouette: 'cape', motif: 'floral',
    matiere: 'Crêpe georgette', prixLocation: 145, prixVente: 800, caution: 200,
    tailles: ['XS', 'S', 'M'], occasion: ['Soirée', 'Fiançailles'], dispo: true,
    description: 'Lavande et cristaux cousus à l\'encolure, cape en georgette. Léger, mouvant, pensé pour danser.',
  },
];

export const OCCASIONS = ['Toutes', 'Mariage', 'Fiançailles', 'Soirée', 'Baptême', 'Gala'];

export const CONDITIONS = [
  'Caution versée par virement au moment de la réservation',
  'Restituée sous 48h après retour du caftan en bon état',
  'Livraison Colissimo suivi · Frais de port 12€ aller–retour',
  'Retouches incluses si commande 10j à l\'avance',
];

/**
 * Commission prélevée sur les caftans déposés par les membres.
 * `couvre` ne liste que ce qui est réellement assuré aujourd'hui : pas d'assurance,
 * pas de séquestre, tant qu'aucun contrat ne les garantit.
 */
export const COMMISSION = {
  pct: 10,
  couvre: [
    'Mise en relation avec les locataires',
    'Vérification de votre annonce avant publication',
    'Suivi de la caution entre les deux parties',
    'Médiation en cas de litige ou de dommage',
  ],
};

export function getCaftan(id: string): Caftan | undefined {
  return CAFTANS.find(c => c.id === id);
}

/** Modèles proches : occasion en commun d'abord, puis prix le plus voisin. */
export function similarCaftans(caftan: Caftan, count = 3): Caftan[] {
  return CAFTANS
    .filter(c => c.id !== caftan.id)
    .map(c => ({
      c,
      overlap: c.occasion.filter(o => caftan.occasion.includes(o)).length,
      gap: Math.abs(c.prixLocation - caftan.prixLocation),
    }))
    .sort((a, b) => b.overlap - a.overlap || a.gap - b.gap)
    .slice(0, count)
    .map(x => x.c);
}
