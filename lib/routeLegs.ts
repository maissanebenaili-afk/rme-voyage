/**
 * Tronçons d'un itinéraire, partagés entre /api/route (producteur) et les
 * calculateurs côté client (consommateurs).
 */

/** Kilomètres parcourus dans un pays (code ISO alpha-2, null = hors couverture). */
export interface CountryDistance {
  country: string | null;
  meters: number;
}

export interface RoadLeg {
  kind: 'road';
  from: string;
  to: string;
  distanceMeters: number;
  durationSeconds: number;
  countries: CountryDistance[];
}

export interface FerryLeg {
  kind: 'ferry';
  from: string;
  to: string;
  /** Distance port à port à vol d'oiseau : la route maritime réelle est plus longue. */
  distanceMeters: number;
}

export type RouteLeg = RoadLeg | FerryLeg;

function isCountryDistance(value: unknown): value is CountryDistance {
  const v = value as CountryDistance;
  return (
    !!v &&
    (v.country === null || (typeof v.country === 'string' && /^[A-Z]{2}$/.test(v.country))) &&
    typeof v.meters === 'number' &&
    Number.isFinite(v.meters) &&
    v.meters >= 0
  );
}

function isRouteLeg(value: unknown): value is RouteLeg {
  const v = value as RouteLeg;
  if (!v || typeof v.from !== 'string' || typeof v.to !== 'string') return false;
  if (typeof v.distanceMeters !== 'number' || !Number.isFinite(v.distanceMeters) || v.distanceMeters < 0) {
    return false;
  }
  if (v.kind === 'ferry') return true;
  return (
    v.kind === 'road' &&
    typeof v.durationSeconds === 'number' &&
    Array.isArray(v.countries) &&
    v.countries.every(isCountryDistance)
  );
}

/** Valide la liste de tronçons reçue du réseau ; null si absente ou malformée. */
export function parseRouteLegs(value: unknown): RouteLeg[] | null {
  return Array.isArray(value) && value.length > 0 && value.every(isRouteLeg) ? value : null;
}
