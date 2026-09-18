import { siteUrl } from "@/lib/siteUrl";

/**
 * Server-side geocoding via Nominatim, shared by app/api/route and
 * app/api/services. Fires only on an explicit user action (never per
 * keystroke — see lib/geocoding.ts for why), cached for a day per query,
 * and sends an identifying User-Agent as Nominatim's usage policy asks:
 * https://operations.osmfoundation.org/policies/nominatim/
 */

export interface LatLon {
  lat: number;
  lon: number;
}

export async function geocodePlace(place: string): Promise<LatLon | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", place);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      "user-agent": `RME-Voyage/1.0 (${siteUrl})`,
    },
    next: { revalidate: 86_400 },
  });
  if (!response.ok) return null;

  const results = (await response.json()) as { lat: string; lon: string }[];
  const first = results[0];
  if (!first) return null;

  const lat = Number.parseFloat(first.lat);
  const lon = Number.parseFloat(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return { lat, lon };
}
