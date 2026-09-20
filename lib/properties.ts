export type PropertyMode = 'location' | 'vente' | 'location-meuble';
export type PropertyType = 'appartement' | 'maison' | 'villa' | 'riad';
export type FurnishStatus = 'meuble' | 'non-meuble';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  location: string;
  district: string;
  modes: PropertyMode[];
  furnish: FurnishStatus;
  bedrooms: number;
  bathrooms: number;
  area: number; // m²
  price_month?: number; // for location
  price_sale?: number; // for vente
  description: string;
  features: string[];
  images?: Array<{ src: string; alt: string }>;
  dispo: boolean;
  contact_whatsapp: string;
}

export const IDOUR_WHATSAPP = '33769200297'; // HiDOUR Immobilier — WhatsApp

export const PROPERTIES: Property[] = [
  {
    id: 'p1',
    title: 'Appartement 2 chambres, Taza Centre',
    type: 'appartement',
    location: 'Taza Centre',
    district: 'Medina',
    modes: ['location', 'location-meuble'],
    furnish: 'meuble',
    bedrooms: 2,
    bathrooms: 1,
    area: 65,
    price_month: 4500,
    description: 'Appartement moderne à proximité des commerces et services. Cuisine équipée, séjour lumineux, accès à terrasse.',
    features: ['Ascenseur', 'Terrasse', 'Cuisine équipée', 'Vue sur rue', 'Garage'],
    dispo: true,
    contact_whatsapp: IDOUR_WHATSAPP,
  },
  {
    id: 'p2',
    title: 'Appartement 3 chambres, Hay Dakchi',
    type: 'appartement',
    location: 'Hay Dakchi',
    district: 'Nouvelle Ville',
    modes: ['location', 'vente', 'location-meuble'],
    furnish: 'non-meuble',
    bedrooms: 3,
    bathrooms: 2,
    area: 95,
    price_month: 5500,
    price_sale: 1200000,
    description: 'Bel appartement dans résidence sécurisée. Proche écoles et hôpitaux. Balcons spacieux.',
    features: ['Piscine', 'Gardien', 'Balcon', 'Parking', 'Accès WiFi'],
    dispo: true,
    contact_whatsapp: IDOUR_WHATSAPP,
  },
  {
    id: 'p3',
    title: 'Villa 4 chambres, Quartier Résidentiel',
    type: 'villa',
    location: 'Quartier Résidentiel',
    district: 'Nouvelle Ville',
    modes: ['location', 'vente'],
    furnish: 'non-meuble',
    bedrooms: 4,
    bathrooms: 2,
    area: 180,
    price_month: 8000,
    price_sale: 2500000,
    description: 'Villa spacieuse avec jardin privatif. Construction récente, finitions de qualité. Idéale pour famille.',
    features: ['Jardin', 'Portail électrique', 'Chauffage', 'Piscine optionnelle', 'Garage 2 places'],
    dispo: true,
    contact_whatsapp: IDOUR_WHATSAPP,
  },
  {
    id: 'p4',
    title: 'Studio meublé, Centre-Ville',
    type: 'appartement',
    location: 'Centre-Ville',
    district: 'Medina',
    modes: ['location-meuble'],
    furnish: 'meuble',
    bedrooms: 1,
    bathrooms: 1,
    area: 35,
    price_month: 2800,
    description: 'Studio confortable, entièrement meublé. Idéal pour cadre ou étudiant. Proximité commerces.',
    features: ['Meublé', 'Internet', 'Électricité incluse', 'Eau chaude', 'Climatisation'],
    dispo: true,
    contact_whatsapp: IDOUR_WHATSAPP,
  },
  {
    id: 'p5',
    title: 'Appartement 2 chambres, Nouvelles Constructions',
    type: 'appartement',
    location: 'Nouvelles Constructions',
    district: 'Nouvelle Ville',
    modes: ['vente', 'location'],
    furnish: 'non-meuble',
    bedrooms: 2,
    bathrooms: 1,
    area: 72,
    price_month: 4000,
    price_sale: 900000,
    description: 'Appartement neuf dans petit immeuble moderne. Cuisine séparée, chambres spacieuses.',
    features: ['Neuf', 'Cuisine séparée', 'Ascenseur', 'Parking', 'Balcon'],
    dispo: true,
    contact_whatsapp: IDOUR_WHATSAPP,
  },
  {
    id: 'p6',
    title: 'Riad traditionnel rénové, Medina',
    type: 'riad',
    location: 'Medina',
    district: 'Medina',
    modes: ['location-meuble'],
    furnish: 'meuble',
    bedrooms: 3,
    bathrooms: 2,
    area: 110,
    price_month: 6500,
    description: 'Riad traditionnel magnifiquement restauré. Patio central, terrasse sur toit avec vue panoramique.',
    features: ['Terrasse', 'Patio', 'Cuisine marocaine', 'Décoration traditionnelle', 'Accès rooftop'],
    dispo: true,
    contact_whatsapp: IDOUR_WHATSAPP,
  },
];

export function getProperty(id: string): Property | undefined {
  return PROPERTIES.find(p => p.id === id);
}

export function similarProperties(property: Property): Property[] {
  return PROPERTIES
    .filter(p =>
      p.id !== property.id &&
      (p.district === property.district || p.type === property.type)
    )
    .slice(0, 3);
}

export const PROPERTY_TYPES: Record<PropertyType, string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  villa: 'Villa',
  riad: 'Riad',
};

export const FURNISH_OPTIONS = ['Meublé', 'Non-meublé'];
export const MODES = ['Location', 'Vente', 'Location meublée'];

export const IDOUR_INFO = {
  name: 'Aziz HiDOUR Immobilier',
  description: 'Constructeur et promoteur immobilier à Taza. Développement de résidences modernes et traditionnelles.',
  phone: IDOUR_WHATSAPP,
};
