import { useSyncExternalStore } from 'react';
import { parseRouteLegs, type RouteLeg } from '@/lib/routeLegs';

/**
 * Contexte de trajet partagé côté client : RouteSearch publie l'itinéraire
 * calculé (OSRM), les calculateurs de coût s'y abonnent pour ne plus exiger
 * une distance ressaisie à la main.
 *
 * Store en mémoire, sans persistance ni réseau : rien ne quitte le navigateur.
 */

export interface ComputedRoute {
  origin: string;
  destination: string;
  distanceKm: number;
  durationSeconds: number;
  /** Provenance de la mesure — seule source de distance « calculée ». */
  source: 'osrm';
  /** Horodatage (ms epoch) du calcul, pour juger de la fraîcheur. */
  computedAt: number;
  /** Tronçons (route / traversée) avec ventilation par pays, si fournis. */
  legs?: RouteLeg[];
  /** Date de départ saisie (AAAA-MM-JJ), si renseignée. */
  date?: string;
}

type Listener = () => void;

let current: ComputedRoute | null = null;
const listeners = new Set<Listener>();

export function publishRoute(route: ComputedRoute | null): void {
  current = route;
  listeners.forEach((listener) => listener());
}

export function getComputedRoute(): ComputedRoute | null {
  return current;
}

export function subscribeRoute(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Convertit la réponse de /api/route en contexte publiable, ou null si invalide. */
export function toComputedRoute(
  origin: string,
  destination: string,
  distanceMeters: unknown,
  durationSeconds: unknown,
  now: number = Date.now(),
  legs?: unknown,
  date?: string,
): ComputedRoute | null {
  if (typeof distanceMeters !== 'number' || !Number.isFinite(distanceMeters) || distanceMeters <= 0) {
    return null;
  }
  const duration =
    typeof durationSeconds === 'number' && Number.isFinite(durationSeconds) && durationSeconds > 0
      ? durationSeconds
      : 0;
  return {
    origin,
    destination,
    distanceKm: Math.round(distanceMeters / 1000),
    durationSeconds: duration,
    source: 'osrm',
    computedAt: now,
    ...(parseRouteLegs(legs) ? { legs: parseRouteLegs(legs)! } : {}),
    ...(typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date) ? { date } : {}),
  };
}

export function useComputedRoute(): ComputedRoute | null {
  return useSyncExternalStore(subscribeRoute, getComputedRoute, () => null);
}
