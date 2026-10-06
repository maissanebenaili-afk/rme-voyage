/**
 * Étapes de nuit sur un long trajet en voiture.
 *
 * Un Paris → Tanger affiche « 20 h 44 de conduite » : personne ne le fait d'une
 * traite, mais l'accueil ne disait ni où ni quand couper. On découpe le temps de
 * conduite en journées d'au plus MAX_DRIVING_DAY et on situe chaque nuit dans une
 * ville étape proche du tracé OSRM réel (durées des étapes de l'itinéraire).
 */

/** Au-delà, une journée de conduite est découpée (choix RME, pas une norme). */
export const MAX_DRIVING_DAY_SECONDS = 11 * 3600;

export type LonLat = [number, number];

export interface TimedStep {
  duration: number;
  coordinates: LonLat[];
}

export interface OvernightStop {
  name: string;
  afterSeconds: number;
}

/** 0 nuit jusqu'à 11 h de conduite, 1 nuit jusqu'à 22 h, etc. */
export function nightsFor(drivingSeconds: number): number {
  if (!Number.isFinite(drivingSeconds) || drivingSeconds <= MAX_DRIVING_DAY_SECONDS) return 0;
  return Math.ceil(drivingSeconds / MAX_DRIVING_DAY_SECONDS) - 1;
}

export interface Hub {
  name: string;
  lat: number;
  lon: number;
}

/** Une ville étape compte si elle est à moins de 40 km du tracé… */
const HUB_MAX_DISTANCE_METERS = 40_000;
/** … et atteinte à moins de 2 h 30 du moment idéal pour s'arrêter. */
const HUB_MAX_SHIFT_SECONDS = 2.5 * 3600;

function haversineMeters([lon1, lat1]: LonLat, [lon2, lat2]: LonLat): number {
  const rad = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(a));
}

/** Chaque coordonnée du tracé avec son temps de conduite depuis le départ. */
function timedCoordinates(steps: TimedStep[]): { location: LonLat; t: number }[] {
  const out: { location: LonLat; t: number }[] = [];
  let elapsed = 0;
  for (const step of steps) {
    const duration = Math.max(0, step.duration);
    const n = step.coordinates.length;
    step.coordinates.forEach((location, i) => out.push({ location, t: elapsed + (n > 1 ? (duration * i) / (n - 1) : 0) }));
    elapsed += duration;
  }
  return out;
}

/**
 * Où dormir : pour chaque nuit, la ville étape (liste fixe de grandes villes)
 * la plus proche du moment idéal, à condition qu'elle soit près du tracé.
 * Sans ville étape plausible, la nuit n'est pas proposée : un village sans
 * hôtel (« Quintanavides ») n'aide personne, et on n'invente pas de lieu.
 */
export function overnightStops(steps: TimedStep[], hubs: Hub[]): OvernightStop[] {
  const total = steps.reduce((sum, step) => sum + Math.max(0, step.duration), 0);
  const nights = nightsFor(total);
  if (nights === 0) return [];
  const timed = timedCoordinates(steps);
  // Moment où le tracé passe au plus près de chaque ville étape.
  const reach = hubs.flatMap((hub) => {
    let best: { d: number; t: number } | null = null;
    for (const point of timed) {
      const d = haversineMeters(point.location, [hub.lon, hub.lat]);
      if (!best || d < best.d) best = { d, t: point.t };
    }
    return best && best.d <= HUB_MAX_DISTANCE_METERS ? [{ name: hub.name, t: best.t }] : [];
  });
  const stops: OvernightStop[] = [];
  for (let night = 1; night <= nights; night += 1) {
    const target = (total * night) / (nights + 1);
    const pick = reach
      .filter((h) => Math.abs(h.t - target) <= HUB_MAX_SHIFT_SECONDS && !stops.some((s) => s.name === h.name))
      .sort((a, b) => Math.abs(a.t - target) - Math.abs(b.t - target))[0];
    if (pick) stops.push({ name: pick.name, afterSeconds: Math.round(pick.t) });
  }
  return stops;
}

/** Valide les étapes reçues de /api/route (données externes au composant). */
export function parseOvernightStops(value: unknown): OvernightStop[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const stops = value.filter(
    (s): s is OvernightStop =>
      !!s &&
      typeof (s as OvernightStop).name === 'string' &&
      (s as OvernightStop).name.trim().length > 0 &&
      typeof (s as OvernightStop).afterSeconds === 'number' &&
      Number.isFinite((s as OvernightStop).afterSeconds) &&
      (s as OvernightStop).afterSeconds > 0,
  );
  return stops.length ? stops.map((s) => ({ name: s.name.trim(), afterSeconds: s.afterSeconds })) : null;
}

/** Recherche d'hôtels près de la ville d'étape (lien neutre, non affilié). */
export function hotelSearchUrl(stopName: string): string {
  return `https://www.booking.com/searchresults.fr.html?ss=${encodeURIComponent(stopName)}`;
}
