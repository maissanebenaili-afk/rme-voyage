/** Géométrie sphérique minimale, points [lon, lat] (ordre GeoJSON/OSRM). */

export type LonLat = [number, number];

const EARTH_RADIUS_M = 6_371_008.8;

export function haversineMeters([lon1, lat1]: LonLat, [lon2, lat2]: LonLat): number {
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLon = (lon2 - lon1) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** Test pair-impair (ray casting) ; suffisant à l'échelle 1:50m. */
export function pointInRing([x, y]: LonLat, ring: LonLat[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Polygone = [anneau extérieur, trous…]. */
export function pointInPolygon(point: LonLat, polygon: LonLat[][]): boolean {
  const [outer, ...holes] = polygon;
  return pointInRing(point, outer) && !holes.some((hole) => pointInRing(point, hole));
}
