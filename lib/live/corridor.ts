/**
 * RME Live — events along a trip, and an honest statement of what is covered. FOUNDATION ONLY
 * (pure, not wired). The caller supplies the trip as [lon, lat] points and, for coverage, a
 * `countryOf` function (the real one, `lib/countryLookup.ts`, is server-side only).
 */
import { haversineMeters, type LonLat } from '@/lib/geo';
import type { RouteEvent } from '@/lib/routeEvents';

const EARTH_RADIUS_M = 6_371_008.8;
const RAD = Math.PI / 180;

/** Distance from a point to a segment, on a local flat projection (fine below a few hundred km). */
function distanceToSegmentMeters(p: LonLat, a: LonLat, b: LonLat): number {
  const cos = Math.cos(p[1] * RAD);
  const toXY = ([lon, lat]: LonLat): [number, number] => [(lon - p[0]) * RAD * cos * EARTH_RADIUS_M, (lat - p[1]) * RAD * EARTH_RADIUS_M];
  const [ax, ay] = toXY(a);
  const [bx, by] = toXY(b);
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2));
  return Math.hypot(ax + t * dx, ay + t * dy);
}

export type CorridorMatch = { event: RouteEvent; distanceMeters: number };

/** Events within `radiusMeters` of the trip line, closest first. Events without a position are ignored. */
export function eventsNearCorridor(events: RouteEvent[], corridor: LonLat[], radiusMeters = 5_000): CorridorMatch[] {
  if (corridor.length === 0) return [];
  const matches: CorridorMatch[] = [];
  for (const event of events) {
    const { latitude, longitude } = event.location ?? {};
    if (latitude === undefined || longitude === undefined) continue;
    const point: LonLat = [longitude, latitude];
    let best = corridor.length === 1 ? haversineMeters(point, corridor[0]) : Infinity;
    for (let i = 0; i + 1 < corridor.length; i++) best = Math.min(best, distanceToSegmentMeters(point, corridor[i], corridor[i + 1]));
    if (best <= radiusMeters) matches.push({ event, distanceMeters: Math.round(best) });
  }
  return matches.sort((x, y) => x.distanceMeters - y.distanceMeters);
}

export type CoverageStatus = 'COUVERT' | 'NON_COUVERT';
export type CoverageRun = { country: string | null; status: CoverageStatus; source?: string; reason: string; lengthMeters: number };
export type CoverageReport = { runs: CoverageRun[]; coveredMeters: number; totalMeters: number };

/**
 * Coarse boxes [minLon, minLat, maxLon, maxLat] for the two Spanish regions the DGT feed leaves out.
 * They are bounding boxes, not borders: they also cover neighbouring land, so the error goes in the
 * safe direction (we may say "not covered" for a covered stretch, never the opposite).
 */
const DGT_EXCLUDED_BOXES: Array<{ name: string; box: [number, number, number, number] }> = [
  { name: 'Catalogne', box: [0.15, 40.5, 3.35, 42.9] },
  { name: 'Pays basque', box: [-3.45, 42.4, -1.7, 43.5] },
];

function coverageAt(point: LonLat, country: string | null): Omit<CoverageRun, 'lengthMeters'> {
  if (country === 'ES') {
    const excluded = DGT_EXCLUDED_BOXES.find(({ box: [x0, y0, x1, y1] }) => point[0] >= x0 && point[0] <= x1 && point[1] >= y0 && point[1] <= y1);
    if (excluded) return { country, status: 'NON_COUVERT', reason: `${excluded.name} : hors du flux DGT (zone approximative)` };
    return { country, status: 'COUVERT', source: 'DGT', reason: 'Incidents routiers : flux officiel DGT' };
  }
  if (country === 'FR') return { country, status: 'NON_COUVERT', reason: 'Autoroutes à péage : aucun flux ouvert d’incidents trouvé' };
  if (country === 'MA') return { country, status: 'NON_COUVERT', reason: 'Maroc : aucune source ouverte trouvée' };
  return { country, status: 'NON_COUVERT', reason: 'Mer ou pays non couvert : aucune source ouverte' };
}

/**
 * What the live layer can and cannot see along a trip, sampled every `stepMeters`.
 * A trip that is mostly "NON_COUVERT" must say so instead of showing an empty feed.
 */
export function describeCoverage(corridor: LonLat[], countryOf: (p: LonLat) => string | null, stepMeters = 25_000): CoverageReport {
  const runs: CoverageRun[] = [];
  let total = 0;
  let covered = 0;
  const add = (point: LonLat, length: number) => {
    const here = coverageAt(point, countryOf(point));
    const last = runs[runs.length - 1];
    if (last && last.country === here.country && last.status === here.status && last.reason === here.reason) last.lengthMeters += length;
    else runs.push({ ...here, lengthMeters: length });
    total += length;
    if (here.status === 'COUVERT') covered += length;
  };
  for (let i = 0; i + 1 < corridor.length; i++) {
    const a = corridor[i];
    const b = corridor[i + 1];
    const length = haversineMeters(a, b);
    const steps = Math.max(1, Math.ceil(length / stepMeters));
    for (let s = 0; s < steps; s++) {
      const f = (s + 0.5) / steps;
      add([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f], length / steps);
    }
  }
  return { runs, coveredMeters: Math.round(covered), totalMeters: Math.round(total) };
}

/** One honest line per stretch, in French, for a future screen. */
export function coverageLines(report: CoverageReport): string[] {
  return report.runs.map((run) => `${Math.round(run.lengthMeters / 1000)} km · ${run.status === 'COUVERT' ? 'couvert' : 'non couvert'} · ${run.reason}`);
}
