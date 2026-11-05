import type { ListingStatus } from '@/lib/listings';

/**
 * Annuaire des établissements de la route France ↔ Maroc (stations, restaurants,
 * hôtels, garages, traiteurs). Mêmes règles que lib/listings.ts : une fiche
 * n'est jamais affichée sans preuve.
 * - CANDIDATE : établissement réel repéré dans une source publique, jamais
 *   contacté. Jamais affiché sur le site.
 * - REFERENCED : affiché gratuitement, avec l'accord écrit de l'établissement.
 * - PARTNER : accord commercial écrit.
 * Les numéros de téléphone ne sont pas dans le dépôt : ils restent dans la
 * liste d'appel (voir docs/PROSPECTION.md).
 */

export type EtabCategorie = 'station-service' | 'restaurant' | 'hotel' | 'garage' | 'traiteur';
export type EtabStatut = Exclude<ListingStatus, 'AFFILIATE'>;

export const CATEGORIES: Record<EtabCategorie, string> = {
  'station-service': 'Station-service',
  restaurant: 'Restaurant',
  hotel: 'Hôtel',
  garage: 'Garage et mécanique',
  traiteur: 'Traiteur',
};

export interface Etablissement {
  id: string;
  nom: string;
  categorie: EtabCategorie;
  ville: string;
  pays: 'FR' | 'ES' | 'MA';
  adresse?: string;
  statut: EtabStatut;
  /** Où les faits ci-dessus ont été lus. */
  source: string;
  sourceUrl: string;
  /** Date (AAAA-MM-JJ) où la source a été relue. */
  verifiedAt: string;
  /** Preuve écrite de l'accord, obligatoire pour REFERENCED et PARTNER. */
  accord?: string;
}

const DATE = '2026-11-05';
const ANNUAIRE = 'Annuaire public ; horaires et détails à confirmer par téléphone.';

export const ETABLISSEMENTS: Etablissement[] = [
  {
    id: 'le-classiq-sete',
    nom: 'Le Classiq',
    categorie: 'restaurant',
    ville: 'Sète',
    pays: 'FR',
    adresse: '36 Grande Rue Mario Roustan',
    statut: 'CANDIDATE',
    source: ANNUAIRE,
    sourceUrl: 'https://www.sluurpy.fr/s%C3%A8te/restaurant/2011390/restaurant-le-classiq',
    verifiedAt: DATE,
  },
  {
    id: 'l-oriental-express-sete',
    nom: 'L’Oriental Express',
    categorie: 'restaurant',
    ville: 'Sète',
    pays: 'FR',
    adresse: '16 Grande Rue Mario Roustan',
    statut: 'CANDIDATE',
    source: ANNUAIRE,
    sourceUrl: 'https://mon-resto-halal.com/en/restaurant/loriental-express-sete',
    verifiedAt: DATE,
  },
  {
    id: 'les-delices-du-maroc-marseille',
    nom: 'Les Délices du Maroc',
    categorie: 'restaurant',
    ville: 'Marseille',
    pays: 'FR',
    adresse: '87 rue de la Palud, 13006',
    statut: 'CANDIDATE',
    source: 'Fiche du site régional de tourisme.',
    sourceUrl: 'https://provence-alpes-cotedazur.com/en/plan-your-stay/restaurants/all-restaurants/les-delices-du-maroc-marseille-6eme-en-5039220',
    verifiedAt: DATE,
  },
  {
    id: 'new-day-evenements-marseille',
    nom: 'New Day Évènements',
    categorie: 'traiteur',
    ville: 'Marseille',
    pays: 'FR',
    statut: 'CANDIDATE',
    source: 'Annuaire de traiteurs marocains ; coordonnées à trouver.',
    sourceUrl: 'https://www.evenementielpourtous.com/traiteur/traiteur-marocain/provence-alpes-cote-d-azur/bouches-du-rhone/marseille-13055',
    verifiedAt: DATE,
  },
  {
    id: 'mina-kouk-marseille',
    nom: 'Mina Kouk',
    categorie: 'traiteur',
    ville: 'Marseille',
    pays: 'FR',
    statut: 'CANDIDATE',
    source: 'Annuaire de traiteurs marocains ; coordonnées à trouver.',
    sourceUrl: 'https://www.evenementielpourtous.com/traiteur/traiteur-marocain/provence-alpes-cote-d-azur/bouches-du-rhone/marseille-13055',
    verifiedAt: DATE,
  },
  {
    id: 'garage-auto-best-services-le-boulou',
    nom: 'Garage Auto Best Services',
    categorie: 'garage',
    ville: 'Le Boulou',
    pays: 'FR',
    adresse: '18 rue des Vignes, 66160',
    statut: 'CANDIDATE',
    source: ANNUAIRE,
    sourceUrl: 'https://www.idgarages.com/fr-fr/garage/le-boulou/GB32536_garage-auto-best-services',
    verifiedAt: DATE,
  },
  {
    id: 'boulou-auto-bilan',
    nom: 'Boulou Auto-bilan (contrôle technique)',
    categorie: 'garage',
    ville: 'Le Boulou',
    pays: 'FR',
    adresse: '23 carrer d’en Cavailles, 66160',
    statut: 'CANDIDATE',
    source: ANNUAIRE,
    sourceUrl: 'https://www.idgarages.com/fr-fr/ville/controle-technique/66160-le-boulou',
    verifiedAt: DATE,
  },
  {
    id: 'garage-martinez-perpignan',
    nom: 'Garage Martinez',
    categorie: 'garage',
    ville: 'Perpignan',
    pays: 'FR',
    adresse: '13 rue Lucien Deslinières, 66000',
    statut: 'CANDIDATE',
    source: ANNUAIRE,
    sourceUrl: 'https://fr.mappy.com/poi/4d6c52effc6925079ff50ed7',
    verifiedAt: DATE,
  },
  {
    id: 'sercotel-aura-algeciras',
    nom: 'Sercotel Aura Algeciras',
    categorie: 'hotel',
    ville: 'Algeciras',
    pays: 'ES',
    adresse: 'Avenida Virgen del Carmen 64, 11204',
    statut: 'CANDIDATE',
    source: 'Fiche Halalbooking : repas halal sur demande. À confirmer avec l’hôtel.',
    sourceUrl: 'https://halalbooking.com/en-us/sercotel-aura-algeciras/p/450377',
    verifiedAt: DATE,
  },
  {
    id: 'onomo-hotel-tanger-med',
    nom: 'Onomo Hotel Tanger Med',
    categorie: 'hotel',
    ville: 'Tanger Med',
    pays: 'MA',
    adresse: 'Tanger Med Port Center, Secteur 9, Ksar El Majaz, Fahs-Anjra',
    statut: 'CANDIDATE',
    source: 'Fiche de réservation en ligne ; site officiel non retrouvé.',
    sourceUrl: 'https://en.hoteles.com/en/ho1212949056/onomo-hotel-tanger-med-melloussa-morocco',
    verifiedAt: DATE,
  },
];

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Les problèmes d'une fiche. Liste vide = fiche valide. */
export function problemes(e: Etablissement): string[] {
  const erreurs: string[] = [];
  if (!/^[a-z0-9-]+$/.test(e.id)) erreurs.push('identifiant invalide');
  if (!e.nom.trim()) erreurs.push('nom manquant');
  if (!(e.categorie in CATEGORIES)) erreurs.push('catégorie inconnue');
  if (!e.sourceUrl.startsWith('https://')) erreurs.push('source : lien https obligatoire');
  if (!e.source.trim()) erreurs.push('source manquante');
  if (!ISO.test(e.verifiedAt)) erreurs.push('date de vérification invalide');
  if (e.statut !== 'CANDIDATE' && !e.accord?.trim()) erreurs.push('accord écrit obligatoire pour être affiché');
  return erreurs;
}

/** Seules les fiches avec accord s'affichent : jamais un simple candidat. */
export function visibles(liste: readonly Etablissement[] = ETABLISSEMENTS): Etablissement[] {
  return liste.filter((e) => e.statut !== 'CANDIDATE' && problemes(e).length === 0);
}
