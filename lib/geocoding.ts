/**
 * RME Voyage — Suggestions de villes (Europe / Maroc)
 *
 * ⚠️ Ce module N'APPELLE PLUS Nominatim/OpenStreetMap.
 *
 * L'autocomplétion "à chaque frappe" contre l'API publique Nominatim viole
 * la politique d'usage officielle du projet (autocomplete-style queries
 * interdites côté client, limite agrégée d'1 requête/seconde **par
 * application**, pas par visiteur) :
 * https://operations.osmfoundation.org/policies/nominatim/
 *
 * À trafic réel (plusieurs visiteurs simultanés), un débounce/throttle par
 * onglet ne suffit pas à respecter cette limite globale — il faudrait un
 * serveur de géocodage dédié (self-hosted Nominatim, ou fournisseur payant
 * avec clé API) pour ré-introduire une recherche de ville arbitraire.
 *
 * Solution sobre retenue ici : une liste statique d'une vingtaine de
 * grandes villes Europe ↔ Maroc, filtrée localement (aucun réseau, aucune
 * latence, zéro risque de dépassement de quota). Ce ne sont que des
 * libellés texte — aucune coordonnée GPS n'est inventée ni utilisée.
 * La saisie libre reste toujours possible pour toute autre ville : ces
 * suggestions n'imposent aucune sélection.
 */

export interface CitySuggestion {
  /** Libellé affiché et utilisé tel quel comme valeur du champ. */
  displayName: string;
  /** Code pays ISO 3166-1 alpha-2 en minuscules, à titre indicatif seulement. */
  countryCode: string;
}

/**
 * ~25 grandes villes couvrant les trajets Europe ↔ Maroc les plus courants.
 * Texte uniquement (nom + pays) : aucune coordonnée, aucune distance.
 */
export const CITY_SUGGESTIONS: CitySuggestion[] = [
  { displayName: "Paris, France", countryCode: "fr" },
  { displayName: "Lyon, France", countryCode: "fr" },
  { displayName: "Marseille, France", countryCode: "fr" },
  { displayName: "Toulouse, France", countryCode: "fr" },
  { displayName: "Lille, France", countryCode: "fr" },
  { displayName: "Strasbourg, France", countryCode: "fr" },
  { displayName: "Bordeaux, France", countryCode: "fr" },
  { displayName: "Nice, France", countryCode: "fr" },
  { displayName: "Bruxelles, Belgique", countryCode: "be" },
  { displayName: "Amsterdam, Pays-Bas", countryCode: "nl" },
  { displayName: "Francfort, Allemagne", countryCode: "de" },
  { displayName: "Cologne, Allemagne", countryCode: "de" },
  { displayName: "Milan, Italie", countryCode: "it" },
  { displayName: "Madrid, Espagne", countryCode: "es" },
  { displayName: "Barcelone, Espagne", countryCode: "es" },
  { displayName: "Séville, Espagne", countryCode: "es" },
  { displayName: "Algésiras, Espagne", countryCode: "es" },
  { displayName: "Londres, Royaume-Uni", countryCode: "gb" },
  { displayName: "Tanger, Maroc", countryCode: "ma" },
  { displayName: "Tétouan, Maroc", countryCode: "ma" },
  { displayName: "Rabat, Maroc", countryCode: "ma" },
  { displayName: "Casablanca, Maroc", countryCode: "ma" },
  { displayName: "Fès, Maroc", countryCode: "ma" },
  { displayName: "Marrakech, Maroc", countryCode: "ma" },
  { displayName: "Agadir, Maroc", countryCode: "ma" },
];

function normalize(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Filtre local (aucun réseau) des suggestions dont le libellé contient la
 * requête. Retourne un tableau vide sous 2 caractères, comme avant.
 */
export function searchCitySuggestions(query: string, limit = 6): CitySuggestion[] {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const needle = normalize(trimmed);
  return CITY_SUGGESTIONS.filter((city) => normalize(city.displayName).includes(needle)).slice(
    0,
    limit
  );
}
