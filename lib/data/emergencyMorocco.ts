/**
 * Numéros d'urgence au Maroc — source unique pour l'interface et les agents.
 *
 * Source : France Diplomatie, « Conseils aux voyageurs – Maroc – Contacts
 * utiles », consultée le 2026-09-25. Les anciens numéros du widget
 * (190, 150, « Garde Royale » 177, 112) ne figurent pas dans cette source.
 */
export const MOROCCO_EMERGENCY_SOURCE = {
  name: 'France Diplomatie — Conseils aux voyageurs, Maroc, contacts utiles',
  url: 'https://www.diplomatie.gouv.fr/fr/information-par-pays/maroc/conseils-aux-voyageurs-contacts-utiles',
  checkedAt: '2026-09-25',
} as const;

export const MOROCCO_EMERGENCY_NUMBERS = [
  { key: 'police', label: 'Police Secours (en ville)', number: '19', emoji: '🚓' },
  { key: 'gendarmerie', label: 'Gendarmerie royale (hors agglomérations)', number: '177', emoji: '🛣️' },
  { key: 'fire', label: 'Pompiers', number: '15', emoji: '🚒' },
] as const;
