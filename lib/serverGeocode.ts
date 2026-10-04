import { siteUrl } from "@/lib/siteUrl";

export interface LatLon {
  lat: number;
  lon: number;
}

type NominatimResult = {
  lat: string;
  lon: string;
  display_name?: string;
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
export async function geocodePlace(place: string): Promise<LatLon | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", place);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "3");

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": `RME-Voyage/1.0 (${siteUrl})`,
    },
    next: { revalidate: 86_400 },
  });
  if (!response.ok) return null;

  const results = (await response.json()) as NominatimResult[];
  const queryTokens = normalizedTokens(place);

  // Nominatim can return a nearby/fuzzy match for a typo or nonsense query.
  // Never silently turn that into a route: when the user supplied meaningful
  // tokens, require every one of them to appear in the returned place name.
  const first = results.find((result) => {
    if (!result.display_name || queryTokens.length === 0) return true;
    const displayTokens = new Set(normalizedTokens(result.display_name));
    return queryTokens.every((token) => displayTokens.has(token));
  });
  if (!first) return null;

  const lat = Number.parseFloat(first.lat);
  const lon = Number.parseFloat(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}
