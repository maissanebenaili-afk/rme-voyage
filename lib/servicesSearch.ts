import { geocodePlace } from "@/lib/serverGeocode";
import { siteUrl } from "@/lib/siteUrl";

/**
 * Server-side services-along-the-route endpoint: geocodes a free-text place
 * (Nominatim, same policy-compliant helper as app/api/route), then queries
 * real points of interest around it via the Overpass API (OpenStreetMap).
 *
 * Fires only on an explicit "Rechercher" click, cached a day per
 * (place, category) pair, and sends an identifying User-Agent. This is not
 * optional: verified directly that overpass-api.de rejects anonymous
 * requests (406/connection reset) and serves real data once identified —
 * consistent with Nominatim's policy, which this app already follows for
 * geocoding. Overpass's public instance has no uptime guarantee; treated
 * the same way as OSRM's public demo router in app/api/route: acceptable
 * today, not a production SLA.
 *
 * Distances are straight-line (haversine) from the searched point, not
 * road distance — OSRM per-POI routing for a whole result list would be
 * too many upstream calls. Labelled "à vol d'oiseau" in the UI so it's
 * never mistaken for a driving distance.
 */

export type ServiceCategory = "fuel" | "mosque" | "halal" | "consulate" | "rest_area" | "garage";

export const SEARCH_RADIUS_METERS = 15_000;
const MAX_RESULTS = 15;

export const OVERPASS_FILTERS: Record<ServiceCategory, string> = {
  fuel: '["amenity"="fuel"]',
  mosque: '["amenity"="place_of_worship"]["religion"="muslim"]',
  halal: '["amenity"~"^(restaurant|fast_food)$"]["diet:halal"~"yes|only"]',
  consulate: '["diplomatic"~"^(consulate|consulate_general|embassy)$"]',
  rest_area: '["highway"~"^(rest_area|services)$"]',
  garage: '["shop"="car_repair"]',
};

export function isServiceCategory(value: string | null): value is ServiceCategory {
  return !!value && value in OVERPASS_FILTERS;
}

function haversineMeters(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLon * sinLon;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

export interface ServicePoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceMeters: number;
  address?: string;
}

function formatAddress(tags: Record<string, string> | undefined): string | undefined {
  if (!tags) return undefined;
  const parts = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean);
  const street = parts.join(" ");
  const city = tags["addr:city"];
  const full = [street, city].filter(Boolean).join(", ");
  return full.length > 0 ? full : undefined;
}

// overpass-api.de is a free public instance with no uptime guarantee. On
// 2026-10-04 every production search failed with « Service de recherche
// indisponible » (3/3: garage Taza, consulat Paris, station Nador). A second
// public instance is tried before giving up; both get the identifying UA.
// Each instance gets 10 s: Netlify stops the function at about 30 s, and on
// the deploy preview an instance that never answered used it all up before
// the second one was tried.
const OVERPASS_TIMEOUT_MS = 10_000;

export const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

export type ServicesSearch =
  | { ok: true; center: { lat: number; lon: number }; results: ServicePoint[] }
  | { ok: false; reason: "not_found" | "unavailable" };

export async function searchServices(place: string, category: ServiceCategory): Promise<ServicesSearch> {
  const center = await geocodePlace(place);
  if (!center) return { ok: false, reason: "not_found" };

  const filter = OVERPASS_FILTERS[category];
  const query = `[out:json][timeout:20];(
    node${filter}(around:${SEARCH_RADIUS_METERS},${center.lat},${center.lon});
    way${filter}(around:${SEARCH_RADIUS_METERS},${center.lat},${center.lon});
  );out center ${MAX_RESULTS * 3};`;

  let data: { elements?: OverpassElement[] } | null = null;
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "text/plain",
          accept: "application/json",
          "user-agent": `RME-Voyage/1.0 (${siteUrl})`,
        },
        body: query,
        next: { revalidate: 86_400 },
        signal: AbortSignal.timeout(OVERPASS_TIMEOUT_MS),
      });
      if (!response.ok) {
        console.warn(`[services] ${new URL(endpoint).hostname} answered ${response.status}`);
        continue;
      }
      const body = (await response.json()) as { elements?: OverpassElement[]; remark?: string };
      // Overpass answers 200 with a "remark" when it gave up (timeout, load):
      // that is a failure, not "nothing around here".
      if (body.remark && !body.elements?.length) {
        console.warn(`[services] ${new URL(endpoint).hostname} remark: ${body.remark.slice(0, 80)}`);
        continue;
      }
      data = body;
      break;
    } catch {
      console.warn(`[services] ${new URL(endpoint).hostname} unreachable`);
    }
  }
  if (!data) return { ok: false, reason: "unavailable" };

  const results: ServicePoint[] = (data.elements ?? [])
    .map((el): ServicePoint | null => {
      const lat = el.type === "node" ? el.lat : el.center?.lat;
      const lon = el.type === "node" ? el.lon : el.center?.lon;
      if (typeof lat !== "number" || typeof lon !== "number") return null;
      return {
        id: `${el.type}/${el.id}`,
        name: el.tags?.name || el.tags?.["name:fr"] || categoryFallbackName(category),
        lat,
        lon,
        distanceMeters: haversineMeters(center, { lat, lon }),
        address: formatAddress(el.tags),
      };
    })
    .filter((p): p is ServicePoint => p !== null)
    .sort((a, b) => a.distanceMeters - b.distanceMeters)
    .slice(0, MAX_RESULTS);

  return { ok: true, center, results };
}

export function categoryFallbackName(category: ServiceCategory): string {
  const labels: Record<ServiceCategory, string> = {
    fuel: "Station-service",
    mosque: "Mosquée",
    halal: "Restaurant halal",
    consulate: "Consulat",
    rest_area: "Aire de repos",
    garage: "Garage",
  };
  return labels[category];
}
