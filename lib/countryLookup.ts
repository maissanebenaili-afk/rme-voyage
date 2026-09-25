import shapes from '@/lib/data/countryShapes.json';
import { haversineMeters, pointInPolygon, type LonLat } from '@/lib/geo';
import type { CountryDistance } from '@/lib/routeLegs';

/**
 * Ventilation d'un tracé par pays, côté serveur uniquement (les contours
 * pèsent ~200 Ko : ils ne doivent pas partir dans le bundle client).
 */

interface CountryShape {
  code: string;
  bbox: [number, number, number, number];
  polygons: LonLat[][][];
}

const COUNTRIES: CountryShape[] = Object.entries(
  (shapes as unknown as { countries: Record<string, LonLat[][][]> }).countries,
).map(([code, polygons]) => {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [lon, lat] of polygons.flatMap((polygon) => polygon[0])) {
    minX = Math.min(minX, lon);
    minY = Math.min(minY, lat);
    maxX = Math.max(maxX, lon);
    maxY = Math.max(maxY, lat);
  }
  return { code, bbox: [minX, minY, maxX, maxY], polygons };
});

export function countryAt(point: LonLat): string | null {
  const [lon, lat] = point;
  for (const country of COUNTRIES) {
    const [minX, minY, maxX, maxY] = country.bbox;
    if (lon < minX || lon > maxX || lat < minY || lat > maxY) continue;
    if (country.polygons.some((polygon) => pointInPolygon(point, polygon))) return country.code;
  }
  return null;
}

/** Lacune maximale comblée par le pays voisin (côte simplifiée, pont, tunnel). */
export const MAX_GAP_METERS = 25_000;

/**
 * Répartit `totalMeters` (distance officielle OSRM du tronçon) entre les pays
 * traversés, au prorata des segments du tracé classés par leur milieu.
 * Une courte portion hors contour (≤ MAX_GAP_METERS : côte simplifiée, pont,
 * tunnel) est rattachée au pays précédent, ou au suivant en début de tracé.
 * Une longue portion hors contour est un pays non couvert (Algérie,
 * Mauritanie…) : elle reste « null » plutôt que d'être attribuée à tort.
 */
export function splitByCountry(coordinates: LonLat[], totalMeters: number): CountryDistance[] {
  const segments: { country: string | null; length: number }[] = [];
  for (let i = 1; i < coordinates.length; i++) {
    const a = coordinates[i - 1];
    const b = coordinates[i];
    const length = haversineMeters(a, b);
    if (length > 0) segments.push({ country: countryAt([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]), length });
  }

  // Regroupe les segments consécutifs de même classement, puis comble les courtes lacunes.
  const runs: { country: string | null; length: number }[] = [];
  for (const segment of segments) {
    const last = runs[runs.length - 1];
    if (last && last.country === segment.country) last.length += segment.length;
    else runs.push({ ...segment });
  }
  runs.forEach((run, index) => {
    if (run.country !== null || run.length > MAX_GAP_METERS) return;
    const neighbour =
      runs.slice(0, index).reverse().find((r) => r.country !== null) ??
      runs.slice(index + 1).find((r) => r.country !== null);
    if (neighbour) run.country = neighbour.country;
  });

  const order: (string | null)[] = [];
  const meters = new Map<string | null, number>();
  let measured = 0;
  for (const run of runs) {
    if (!meters.has(run.country)) order.push(run.country);
    meters.set(run.country, (meters.get(run.country) ?? 0) + run.length);
    measured += run.length;
  }

  if (measured === 0) return [];
  const ratio = totalMeters / measured;
  return order.map((country) => ({ country, meters: Math.round((meters.get(country) ?? 0) * ratio) }));
}

/**
 * Pays d'un point de départ/arrivée. Le trait de côte 1:50m place parfois en
 * mer des villes d'estuaire ou de presqu'île (Lisbonne, Dakhla) : on cherche
 * alors le pays le plus proche sur des cercles de 5, 10 puis 20 km.
 */
export function countryNear(point: LonLat): string | null {
  const direct = countryAt(point);
  if (direct) return direct;
  const [lon, lat] = point;
  const kmPerDegreeLat = 111.32;
  const kmPerDegreeLon = kmPerDegreeLat * Math.cos((lat * Math.PI) / 180);
  for (const radiusKm of [5, 10, 20]) {
    for (let step = 0; step < 16; step++) {
      const angle = (step * Math.PI) / 8;
      const found = countryAt([
        lon + (radiusKm * Math.cos(angle)) / kmPerDegreeLon,
        lat + (radiusKm * Math.sin(angle)) / kmPerDegreeLat,
      ]);
      if (found) return found;
    }
  }
  return null;
}
