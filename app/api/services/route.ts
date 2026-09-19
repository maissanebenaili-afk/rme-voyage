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

const SEARCH_RADIUS_METERS = 15_000;
const MAX_RESULTS = 15;

const OVERPASS_FILTERS: Record<ServiceCategory, string> = {
  fuel: '["amenity"="fuel"]',
  mosque: '["amenity"="place_of_worship"]["religion"="muslim"]',
  halal: '["amenity"~"^(restaurant|fast_food)$"]["diet:halal"~"yes|only"]',
  consulate: '["diplomatic"~"^(consulate|consulate_general|embassy)$"]',
  rest_area: '["highway"~"^(rest_area|services)$"]',
  garage: '["shop"="car_repair"]',
};

function isServiceCategory(value: string | null): value is ServiceCategory {
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const place = searchParams.get("place")?.trim();
  const category = searchParams.get("category");

  if (!place) {
    return Response.json({ error: "Missing place" }, { status: 400 });
  }
  if (!isServiceCategory(category)) {
    return Response.json(
      { error: `Invalid category. Expected one of: ${Object.keys(OVERPASS_FILTERS).join(", ")}` },
      { status: 400 },
    );
  }

  const center = await geocodePlace(place);
  if (!center) {
    return Response.json({ error: 'Location not found' }, { status: 404 });
  }

  const filter = OVERPASS_FILTERS[category];
  const query = `[out:json][timeout:20];(
    node${filter}(around:${SEARCH_RADIUS_METERS},${center.lat},${center.lon});
    way${filter}(around:${SEARCH_RADIUS_METERS},${center.lat},${center.lon});
  );out center ${MAX_RESULTS * 3};`;

  const overpassResponse = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "content-type": "text/plain",
      accept: "application/json",
      "user-agent": `RME-Voyage/1.0 (${siteUrl})`,
    },
    body: query,
    next: { revalidate: 86_400 },
  });

  if (!overpassResponse.ok) {
    return Response.json({ error: "Service de recherche indisponible." }, { status: 502 });
  }

  const data = (await overpassResponse.json()) as { elements?: OverpassElement[] };

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

  return Response.json({
    center,
    results,
    searchRadiusMeters: SEARCH_RADIUS_METERS,
  });
}

function categoryFallbackName(category: ServiceCategory): string {
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
