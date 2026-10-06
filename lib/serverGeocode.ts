import { siteUrl } from "@/lib/siteUrl";

export interface LatLon {
  lat: number;
  lon: number;
}

type NominatimResult = {
  lat: string;
  lon: string;
  display_name?: string;
  /** Noms de la ville dans toutes les langues (name, name:fr, name:nl…). */
  namedetails?: Record<string, string>;
};

function normalizedTokens(value: string): string[] {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter((token) => token.length >= 3) ?? [];
}

/**
 * Server-side geocoding via Nominatim, shared by app/api/route and
 * app/api/services. Fires only on an explicit user action (never per
 * keystroke — see lib/geocoding.ts for why), cached for a day per query,
 * and sends an identifying User-Agent as Nominatim's usage policy asks:
 * https://operations.osmfoundation.org/policies/nominatim/
 */
/**
 * Nominatim n'a pas répondu (limite de débit 429, panne 5xx, réseau). Distinct
 * de « lieu introuvable » : jusqu'au 2026-10-06, une surcharge passagère
 * affichait « Ville de départ introuvable » pour Paris ou Madrid.
 */
export class GeocodeUnavailable extends Error {}

export async function geocodePlace(place: string): Promise<LatLon | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", place);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "3");
  url.searchParams.set("namedetails", "1");

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": `RME-Voyage/1.0 (${siteUrl})`,
    },
    next: { revalidate: 86_400 },
  }).catch(() => {
    throw new GeocodeUnavailable();
  });
  if (!response.ok) throw new GeocodeUnavailable();

  const results = (await response.json()) as NominatimResult[];
  // « Ville, Pays » : seul le nom de la ville est contrôlé. Le pays a déjà servi
  // à la recherche, mais Nominatim l'écrit dans la langue locale : « Madrid,
  // Espagne » revenait « Madrid, …, España » et était refusé (constaté en
  // production le 2026-10-06 pour Madrid, Milan, Anvers, Düsseldorf).
  const cityPart = place.includes(",") ? place.slice(0, place.indexOf(",")) : place;
  const queryTokens = normalizedTokens(cityPart);

  // Nominatim can return a nearby/fuzzy match for a typo or nonsense query.
  // Never silently turn that into a route: every token of the city name must
  // appear in the returned place name or one of its names in other languages
  // (Anvers = Antwerpen, Milan = Milano).
  const first = results.find((result) => {
    if (!result.display_name || queryTokens.length === 0) return true;
    const names = [result.display_name, ...Object.values(result.namedetails ?? {})].join(" ");
    const displayTokens = new Set(normalizedTokens(names));
    return queryTokens.every((token) => displayTokens.has(token));
  });
  if (!first) return null;

  const lat = Number.parseFloat(first.lat);
  const lon = Number.parseFloat(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}
