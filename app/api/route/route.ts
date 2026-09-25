import { geocodePlace, type LatLon } from "@/lib/serverGeocode";
import { countryNear, splitByCountry } from "@/lib/countryLookup";
import { haversineMeters, type LonLat } from "@/lib/geo";
import {
  CROSSINGS,
  EUROPE_PORTS,
  EUROPE_SIDE,
  MOROCCO_PORTS,
  MOROCCO_SIDE,
  type Port,
} from "@/lib/ferryCrossings";
import type { FerryLeg, RoadLeg, RouteLeg } from "@/lib/routeLegs";

/**
 * Server-side directions endpoint: geocodes two free-text places (Nominatim)
 * then requests a driving route between them (OSRM's public demo router).
 *
 * This is NOT the per-keystroke autocomplete that lib/geocoding.ts
 * deliberately removed (see its docstring) — that was banned by Nominatim's
 * usage policy because it fires on every keystroke, for every visitor.
 * This route fires at most twice (origin + destination) per explicit
 * "calculate route" click, is cached for a day per city pair, and sends an
 * identifying User-Agent as the policy asks:
 * https://operations.osmfoundation.org/policies/nominatim/
 *
 * OSRM's router.project-osrm.org is a public demo server with no uptime or
 * rate guarantee — acceptable for this app's traffic today, not a
 * production SLA. Swap for a self-hosted OSRM or a paid provider if that
 * changes.
 *
 * Europe ↔ Maroc : le routeur de démonstration n'emprunte pas les ferries.
 * Interrogé tel quel, il « accroche » une destination marocaine au réseau
 * européen (Paris → Marrakech s'arrêtait à Tarifa, à 533 km de Marrakech).
 * Quand un bout est en Europe et l'autre au Maroc, l'itinéraire est donc
 * composé : route jusqu'au port, traversée (lib/ferryCrossings.ts), route
 * depuis le port — en retenant la traversée qui minimise la distance totale.
 */

const OSRM = "https://router.project-osrm.org";

/** Au-delà, le point demandé n'est pas desservi par le réseau routier trouvé. */
const MAX_SNAP_METERS = 10_000;

const NO_ROAD_ERROR = "Aucun itinéraire routier trouvé entre ces deux lieux.";

class UpstreamError extends Error {}

interface OsrmRoad {
  coordinates: LonLat[];
  distance: number;
  duration: number;
  snapMeters: number;
}

function osrmFetch(path: string, params: Record<string, string>) {
  const url = new URL(`${OSRM}${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return fetch(url, { headers: { accept: "application/json" }, next: { revalidate: 86_400 } });
}

function lonLat(point: LatLon): LonLat {
  return [point.lon, point.lat];
}

function coordinatePath(points: LonLat[]) {
  return points.map(([lon, lat]) => `${lon},${lat}`).join(";");
}

/** Itinéraire routier A → B, ou null si OSRM n'en trouve pas. */
async function osrmRoute(from: LonLat, to: LonLat): Promise<OsrmRoad | null> {
  const response = await osrmFetch(`/route/v1/driving/${coordinatePath([from, to])}`, {
    overview: "full",
    geometries: "geojson",
  });
  if (!response.ok) throw new UpstreamError();
  const data = (await response.json()) as {
    code: string;
    routes?: { geometry: { coordinates: LonLat[] }; distance: number; duration: number }[];
    waypoints?: { distance?: number }[];
  };
  const route = data.routes?.[0];
  if (data.code !== "Ok" || !route) return null;
  return {
    coordinates: route.geometry.coordinates,
    distance: route.distance,
    duration: route.duration,
    snapMeters: Math.max(0, ...(data.waypoints ?? []).map((w) => w.distance ?? 0)),
  };
}

/** Distances routières (m) d'une liste de sources vers une liste de destinations. */
async function osrmTable(sources: LonLat[], destinations: LonLat[]): Promise<(number | null)[][]> {
  const points = [...sources, ...destinations];
  const response = await osrmFetch(`/table/v1/driving/${coordinatePath(points)}`, {
    sources: sources.map((_, i) => i).join(";"),
    destinations: destinations.map((_, i) => sources.length + i).join(";"),
    annotations: "distance",
  });
  if (!response.ok) throw new UpstreamError();
  const data = (await response.json()) as { code: string; distances?: (number | null)[][] };
  if (data.code !== "Ok" || !data.distances) throw new UpstreamError();
  return data.distances;
}

function roadLeg(from: string, to: string, road: OsrmRoad): RoadLeg {
  return {
    kind: "road",
    from,
    to,
    distanceMeters: road.distance,
    durationSeconds: road.duration,
    countries: splitByCountry(road.coordinates, road.distance),
  };
}

function toLeaflet(coordinates: LonLat[]) {
  // OSRM/GeoJSON coordinates are [lon, lat]; Leaflet wants [lat, lon].
  return coordinates.map(([lon, lat]) => [lat, lon]);
}

async function directRoute(origin: string, destination: string, from: LonLat, to: LonLat) {
  const road = await osrmRoute(from, to);
  if (!road || road.snapMeters > MAX_SNAP_METERS) {
    return Response.json({ error: NO_ROAD_ERROR }, { status: 404 });
  }
  const legs: RouteLeg[] = [roadLeg(origin, destination, road)];
  return Response.json({
    geometry: toLeaflet(road.coordinates),
    distanceMeters: road.distance,
    durationSeconds: road.duration,
    legs,
  });
}

async function crossingRoute(
  origin: string,
  destination: string,
  from: LonLat,
  to: LonLat,
  toMorocco: boolean,
) {
  const departurePorts = toMorocco ? EUROPE_PORTS : MOROCCO_PORTS;
  const arrivalPorts = toMorocco ? MOROCCO_PORTS : EUROPE_PORTS;
  const [[toDeparture], fromArrival] = await Promise.all([
    osrmTable([from], departurePorts.map((p) => p.location)),
    osrmTable(arrivalPorts.map((p) => p.location), [to]),
  ]);

  const candidates = CROSSINGS.map((crossing) => {
    const departure: Port = toMorocco ? crossing.europe : crossing.morocco;
    const arrival: Port = toMorocco ? crossing.morocco : crossing.europe;
    const before = toDeparture[departurePorts.indexOf(departure)];
    const after = fromArrival[arrivalPorts.indexOf(arrival)]?.[0];
    const sea = haversineMeters(departure.location, arrival.location);
    return { departure, arrival, before, after, sea };
  })
    .filter(
      (c): c is typeof c & { before: number; after: number } =>
        typeof c.before === "number" && typeof c.after === "number",
    )
    .map((c) => ({ ...c, total: c.before + c.sea + c.after }))
    .sort((a, b) => a.total - b.total);

  const best = candidates[0];
  if (!best) return Response.json({ error: NO_ROAD_ERROR }, { status: 404 });

  const [first, last] = await Promise.all([
    osrmRoute(from, best.departure.location),
    osrmRoute(best.arrival.location, to),
  ]);
  if (!first || !last || first.snapMeters > MAX_SNAP_METERS || last.snapMeters > MAX_SNAP_METERS) {
    return Response.json({ error: NO_ROAD_ERROR }, { status: 404 });
  }

  const ferry: FerryLeg = {
    kind: "ferry",
    from: best.departure.name,
    to: best.arrival.name,
    distanceMeters: Math.round(best.sea),
  };
  const legs: RouteLeg[] = [
    roadLeg(origin, best.departure.name, first),
    ferry,
    roadLeg(best.arrival.name, destination, last),
  ];

  return Response.json({
    // Le segment port → port est tracé en ligne droite entre les deux tronçons.
    geometry: toLeaflet([...first.coordinates, ...last.coordinates]),
    // Distance et durée routières (ce que parcourt la voiture), hors traversée.
    distanceMeters: first.distance + last.distance,
    durationSeconds: first.duration + last.duration,
    legs,
    crossings: candidates.map((c) => ({
      from: c.departure.name,
      to: c.arrival.name,
      roadMeters: Math.round(c.before + c.after),
      seaMeters: Math.round(c.sea),
    })),
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get("origin")?.trim();
  const destination = searchParams.get("destination")?.trim();

  if (!origin || !destination) {
    return Response.json({ error: "Missing origin or destination" }, { status: 400 });
  }

  const [originPoint, destinationPoint] = await Promise.all([
    geocodePlace(origin),
    geocodePlace(destination),
  ]);

  if (!originPoint) {
    return Response.json({ error: 'Origin location not found' }, { status: 404 });
  }
  if (!destinationPoint) {
    return Response.json({ error: 'Destination location not found' }, { status: 404 });
  }

  const from = lonLat(originPoint);
  const to = lonLat(destinationPoint);
  const originCountry = countryNear(from);
  const destinationCountry = countryNear(to);
  const toMorocco = EUROPE_SIDE.has(originCountry ?? "") && MOROCCO_SIDE.has(destinationCountry ?? "");
  const toEurope = MOROCCO_SIDE.has(originCountry ?? "") && EUROPE_SIDE.has(destinationCountry ?? "");

  try {
    return toMorocco || toEurope
      ? await crossingRoute(origin, destination, from, to, toMorocco)
      : await directRoute(origin, destination, from, to);
  } catch (error) {
    if (error instanceof UpstreamError) {
      return Response.json({ error: "Service d'itinéraire indisponible." }, { status: 502 });
    }
    throw error;
  }
}
