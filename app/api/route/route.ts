import { geocodePlace } from "@/lib/serverGeocode";

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
 */

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
    return Response.json({ error: `Lieu de départ introuvable : ${origin}` }, { status: 404 });
  }
  if (!destinationPoint) {
    return Response.json({ error: `Destination introuvable : ${destination}` }, { status: 404 });
  }

  const osrmUrl = new URL(
    `https://router.project-osrm.org/route/v1/driving/${originPoint.lon},${originPoint.lat};${destinationPoint.lon},${destinationPoint.lat}`
  );
  osrmUrl.searchParams.set("overview", "full");
  osrmUrl.searchParams.set("geometries", "geojson");

  const routeResponse = await fetch(osrmUrl, {
    headers: { accept: "application/json" },
    next: { revalidate: 86_400 },
  });

  if (!routeResponse.ok) {
    return Response.json({ error: "Service d'itinéraire indisponible." }, { status: 502 });
  }

  const routeData = (await routeResponse.json()) as {
    code: string;
    routes?: { geometry: { coordinates: [number, number][] }; distance: number; duration: number }[];
  };

  const route = routeData.routes?.[0];
  if (routeData.code !== "Ok" || !route) {
    return Response.json({ error: "Aucun itinéraire routier trouvé entre ces deux lieux." }, { status: 404 });
  }

  return Response.json({
    // OSRM/GeoJSON coordinates are [lon, lat]; Leaflet wants [lat, lon].
    geometry: route.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
    distanceMeters: route.distance,
    durationSeconds: route.duration,
  });
}
