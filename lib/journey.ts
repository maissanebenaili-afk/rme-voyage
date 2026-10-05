import { COUNTRY_NAMES_FR } from '@/lib/countries';
import { CITY_SUGGESTIONS } from '@/lib/geocoding';
import type { ComputedRoute } from '@/lib/routeContext';

/**
 * Présentation « voyage » de l'accueil : drapeau d'une ville saisie, résumé du
 * trajet calculé et prochaine étape. Uniquement dérivé de ce que l'utilisateur
 * a saisi ou de l'itinéraire réellement calculé : rien n'est supposé.
 */

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

const CODE_BY_NAME = new Map(
  Object.entries(COUNTRY_NAMES_FR).map(([code, name]) => [normalize(name), code]),
);

function flagEmoji(code: string): string {
  return String.fromCodePoint(...code.toUpperCase().split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** Code pays (« FR ») écrit après la virgule ou d'une ville connue ; sinon null. */
export function countryOf(place: string): string | null {
  const known = CITY_SUGGESTIONS.find((c) => normalize(c.displayName) === normalize(place));
  if (known) return known.countryCode.toUpperCase();
  const parts = place.split(',');
  if (parts.length < 2) return null;
  return CODE_BY_NAME.get(normalize(parts[parts.length - 1])) ?? null;
}

/** Drapeau du pays écrit après la virgule (« Paris, France ») ou d'une ville connue ; sinon null. */
export function flagFor(place: string): string | null {
  const code = countryOf(place);
  return code ? flagEmoji(code) : null;
}

/** Vrai seulement si l'on sait qu'un seul des deux bouts est au Maroc (traversée du détroit). */
export function crossesToMorocco(origin: string, destination: string): boolean {
  const a = countryOf(origin);
  const b = countryOf(destination);
  return a !== null && b !== null && (a === 'MA') !== (b === 'MA');
}

/** Nom court d'une ville saisie : « Paris, France » → « Paris ». */
export function shortPlace(place: string): string {
  return place.split(',')[0].trim() || place.trim();
}

export interface JourneyOverview {
  distanceKm: number;
  /** Somme des tronçons routiers calculés (hors traversée), en secondes ; null si inconnue. */
  drivingSeconds: number | null;
  hasFerry: boolean;
  /** Ports de la traversée (« Algésiras → Tanger Med »), si calculée. */
  crossing: string | null;
}

export function journeyOverview(route: ComputedRoute): JourneyOverview {
  const legs = route.legs ?? [];
  const roads = legs.filter((l) => l.kind === 'road');
  const ferry = legs.find((l) => l.kind === 'ferry');
  const drivingSeconds = roads.length
    ? roads.reduce((sum, l) => sum + (l.kind === 'road' ? l.durationSeconds : 0), 0)
    : route.durationSeconds > 0 && !ferry
      ? route.durationSeconds
      : null;
  return {
    distanceKm: route.distanceKm,
    drivingSeconds,
    hasFerry: Boolean(ferry),
    crossing: ferry ? (ferry.to ? `${ferry.from} → ${ferry.to}` : ferry.from) : null,
  };
}

export interface NextStep {
  icon: 'ferry' | 'cost';
  label: string;
  href: string;
}

/** Une seule action recommandée après le calcul : la traversée s'il y en a une, sinon le coût. */
export function nextStep(route: ComputedRoute): NextStep {
  return journeyOverview(route).hasFerry
    ? { icon: 'ferry', label: 'Vérifier votre traversée', href: '#ferry' }
    : { icon: 'cost', label: 'Estimer le coût du trajet', href: '#route' };
}
