/** Trajets réels jusqu'au port, tirés des pages /trajet (OSRM, OpenStreetMap). */
import { ROUTE_PAGES } from '@/lib/routePages';
import type { Trip } from '@/lib/lab/crossingWindow/engine';

export function tripFromRoutePage(slug: string): Trip | null {
  const page = ROUTE_PAGES.routes.find((r) => r.slug === slug);
  const road = page?.legs.find((l) => l.kind === 'road');
  if (!page || !road || road.kind !== 'road' || !road.durationSeconds) return null;
  const fr = road.countries?.find((c) => c.country === 'FR')?.meters ?? 0;
  return { origin: page.originCity, drivingSeconds: road.durationSeconds, franceShare: road.distanceMeters ? fr / road.distanceMeters : 0, port: road.to };
}
