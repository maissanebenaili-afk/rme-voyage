import {
  OVERPASS_FILTERS,
  SEARCH_RADIUS_METERS,
  isServiceCategory,
  searchServices,
} from "@/lib/servicesSearch";
import { MAX_PLACE_CHARS } from "@/lib/serverGeocode";

export type { ServiceCategory, ServicePoint } from "@/lib/servicesSearch";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const place = searchParams.get("place")?.trim();
  const category = searchParams.get("category");

  if (!place) {
    return Response.json({ error: "Missing place" }, { status: 400 });
  }
  if (place.length > MAX_PLACE_CHARS) {
    return Response.json({ error: "Place too long" }, { status: 400 });
  }
  if (!isServiceCategory(category)) {
    return Response.json(
      { error: `Invalid category. Expected one of: ${Object.keys(OVERPASS_FILTERS).join(", ")}` },
      { status: 400 },
    );
  }

  const found = await searchServices(place, category);
  if (!found.ok && found.reason === "not_found") {
    return Response.json({ error: "Lieu introuvable. Vérifiez l’orthographe ou ajoutez le pays." }, { status: 404 });
  }
  if (!found.ok) {
    return Response.json({ error: "Service de recherche indisponible." }, { status: 502 });
  }
  return Response.json({ center: found.center, results: found.results, searchRadiusMeters: SEARCH_RADIUS_METERS });
}
