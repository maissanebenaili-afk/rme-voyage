import routePages from '@/lib/data/routePages.json';
import type { RouteLeg } from '@/lib/routeLegs';

/**
 * Trajets pré-calculés des pages /trajet/… (lib/data/routePages.json,
 * généré par scripts/build-route-data.mjs depuis /api/route).
 *
 * Données statiques : aucune requête OSRM ni Nominatim au build ni à
 * l'exécution. Le fichier porte sa date de génération, affichée sur chaque page.
 */

export interface RoutePageCrossing {
  from: string;
  to: string;
  roadMeters: number;
  seaMeters: number;
}

export interface RoutePage {
  slug: string;
  origin: string;
  destination: string;
  originCity: string;
  destinationCity: string;
  /** Distance routière, hors traversée maritime. */
  distanceMeters: number;
  /** Durée de conduite, hors traversée et hors pauses. */
  durationSeconds: number;
  legs: RouteLeg[];
  crossings: RoutePageCrossing[];
}

export interface RoutePagesDataset {
  source: string;
  generatedAt: string;
  routes: RoutePage[];
}

export const ROUTE_PAGES = routePages as RoutePagesDataset;

/** Consommation retenue pour l'estimation affichée ; l'utilisateur ajuste la sienne dans le Reality Check. */
export const REFERENCE_CONSUMPTION_L_PER_100KM = 6.5;

/** Prix au litre appliqué hors Union européenne (Maroc, Suisse), faute de source officielle intégrée. */
export const NON_EU_FALLBACK_PRICE = 1.4;

export function getRoutePage(slug: string): RoutePage | undefined {
  return ROUTE_PAGES.routes.find((route) => route.slug === slug);
}

export function ferryOf(route: RoutePage) {
  return route.legs.find((leg) => leg.kind === 'ferry');
}

/** « 1 940 km » */
export function formatKm(meters: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(meters / 1000)} km`;
}

/** « 20 h 42 » */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return minutes ? `${hours} h ${String(minutes).padStart(2, '0')}` : `${hours} h`;
}

export function frenchDate(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}
