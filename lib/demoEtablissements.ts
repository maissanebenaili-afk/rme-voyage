import { CATEGORIES, type EtabCategorie } from '@/lib/etablissements';

/**
 * Pages de démonstration à montrer aux commerçants (/pro/demo/[categorie]).
 * Tout y est une maquette avec un établissement fictif, annoncée comme telle :
 * aucun chiffre de fréquentation, aucun prix, aucun accord supposé.
 */

export interface Demo {
  categorie: EtabCategorie;
  titre: string;
  /** Nom d'un établissement qui n'existe pas. */
  exemple: string;
  ville: string;
  details: string[];
  apport: string[];
}

export const DEMOS: Record<EtabCategorie, Demo> = {
  'station-service': {
    categorie: 'station-service',
    titre: 'Votre station-service',
    exemple: 'Station Exemple',
    ville: 'Ville exemple',
    details: ['Carburants disponibles', 'Boutique et café', 'Ouvert tôt le matin et tard le soir'],
    apport: [
      'Les voyageurs qui préparent leur trajet voient où faire le plein sur leur route.',
      'Vos horaires et vos services sont visibles avant le départ.',
      'Un bouton pour vous appeler ou vous écrire sur WhatsApp.',
    ],
  },
  restaurant: {
    categorie: 'restaurant',
    titre: 'Votre restaurant',
    exemple: 'Restaurant Exemple',
    ville: 'Ville exemple',
    details: ['Cuisine du pays', 'Halal sur déclaration', 'Parking à proximité'],
    apport: [
      'Les familles en route trouvent une vraie bonne table pour la pause.',
      'Vos plats, vos horaires et votre menu du jour sont visibles avant l’arrivée.',
      'Un bouton pour réserver par téléphone ou WhatsApp.',
    ],
  },
  hotel: {
    categorie: 'hotel',
    titre: 'Votre hôtel',
    exemple: 'Hôtel Exemple',
    ville: 'Ville exemple',
    details: ['Chambres familiales', 'Arrivée tardive possible', 'Petit-déjeuner'],
    apport: [
      'Les voyageurs qui font une étape de nuit voient votre hôtel sur leur trajet.',
      'Vous précisez l’arrivée tardive et les chambres pour les familles.',
      'Un lien direct vers votre site ou votre téléphone, sans intermédiaire.',
    ],
  },
  garage: {
    categorie: 'garage',
    titre: 'Votre garage',
    exemple: 'Garage Exemple',
    ville: 'Ville exemple',
    details: ['Pneus et freins', 'Contrôle avant la traversée', 'Dépannage'],
    apport: [
      'Avant la traversée, les voyageurs cherchent un garage de confiance près de la route.',
      'Vos services de vérification avant départ sont visibles en un coup d’œil.',
      'Un bouton pour appeler tout de suite en cas de panne.',
    ],
  },
  traiteur: {
    categorie: 'traiteur',
    titre: 'Votre service traiteur',
    exemple: 'Traiteur Exemple',
    ville: 'Ville exemple',
    details: ['Mariages et fêtes de famille', 'Cuisine marocaine', 'Devis sur demande'],
    apport: [
      'Les familles de la diaspora cherchent un traiteur pour leurs fêtes, en France comme au pays.',
      'Votre spécialité et votre zone de livraison sont claires.',
      'Un bouton pour demander un devis par WhatsApp.',
    ],
  },
};

export const DEMO_SLUGS = Object.keys(DEMOS) as EtabCategorie[];

export function demoPour(slug: string): Demo | null {
  return slug in DEMOS ? DEMOS[slug as EtabCategorie] : null;
}

export function libelleCategorie(c: EtabCategorie): string {
  return CATEGORIES[c];
}
