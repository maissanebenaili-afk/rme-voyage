/**
 * RME Lab — « Quand partir ? » : moteur de fenêtre de passage. Fonctions pures, sans réseau.
 *
 * L'idée : les conseils officiels sont publiés pays par pays. Bison Futé dit quand la route française
 * est chargée ; l'Espagne publie après coup les pointes au détroit. Personne ne relie les deux pour UNE
 * famille : si je pars de Paris tel jour à telle heure, quel jour suis-je sur la route française, et quel
 * jour j'arrive au port ? Un jour « vert » en France peut faire arriver au port le jour de la pointe.
 * Ce moteur calcule ce trajet dans le temps et signale ce piège.
 *
 * Tout ce qui n'est pas mesuré est marqué : le choix d'itinéraire en France, la durée réelle de conduite
 * avec pauses, et la pression au port hors des jours documentés sont des INFÉRENCES.
 */
import { BISON_DEPARTURES_2026, BISON_SOURCE, BISON_URL, OPE_2026, PORT_EVIDENCE_2026, PORT_PEAK_PATTERN, type RoadLevel } from '@/lib/lab/crossingWindow/data2026';

export type Status = 'CONFIRMÉ' | 'À VÉRIFIER' | 'INFÉRENCE' | 'INCONNU';
export type Reason = { text: string; status: Status; source?: string };
export type Profile = 'relais' | 'nuit';

/** Zones Bison Futé traversées pour rejoindre la frontière espagnole (choix d'autoroute supposé : INFÉRENCE). */
const ZONES_BY_ORIGIN: Record<string, number[]> = {
  Paris: [1, 5], Lille: [2, 1, 5], Nantes: [2, 5], Bordeaux: [5], Toulouse: [5],
  Lyon: [4, 6], Marseille: [6], Montpellier: [6], Nice: [6], Strasbourg: [3, 4, 6], Genève: [4, 6],
  Bruxelles: [2, 1, 5], Anvers: [2, 1, 5], Liège: [2, 1, 5], Amsterdam: [2, 1, 5], Rotterdam: [2, 1, 5], 'La Haye': [2, 1, 5], Utrecht: [2, 1, 5],
  Cologne: [3, 4, 6], 'Düsseldorf': [3, 4, 6], 'Francfort-sur-le-Main': [3, 4, 6],
  Milan: [6], Turin: [6], Bologne: [6],
  Madrid: [], Barcelone: [], Valence: [],
};

export const LEVEL_LABEL = ['Fluide', 'Chargé', 'Très chargé', 'Extrême'] as const;
const BISON_WORD = ['habituelle', 'difficile', 'très difficile', 'extrêmement difficile'] as const;

export type Trip = {
  origin: string;
  /** Conduite pure jusqu'au port, en secondes (données /trajet, OSRM). */
  drivingSeconds: number;
  /** Part de cette conduite en France (0 à 1, données /trajet). */
  franceShare: number;
  port: string;
};

const HOUR = 3_600_000;
const day = (t: number) => new Date(t).toISOString().slice(0, 10);
const weekday = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay(); // 0 dimanche … 6 samedi

/** Durée réelle supposée : 10 % de pauses ; « nuit » ajoute 9 h d'arrêt par tranche de 10 h de conduite. INFÉRENCE. */
export function travelHours(drivingSeconds: number, profile: Profile): number {
  const driving = drivingSeconds / 3600;
  const withBreaks = driving * 1.1;
  return profile === 'relais' ? withBreaks : withBreaks + 9 * Math.floor(driving / 10);
}

function firstAugustWeekend(year: number): string[] {
  const t = Date.UTC(year, 7, 1);
  let sat = t;
  while (new Date(sat).getUTCDay() !== 6) sat += 24 * HOUR;
  return [day(sat - 24 * HOUR), day(sat), day(sat + 24 * HOUR)];
}

/** Pression au port le jour d'arrivée, dans le sens Europe → Maroc. */
export function portLevel(iso: string): { level: RoadLevel; reasons: Reason[] } {
  const evidence = PORT_EVIDENCE_2026[iso];
  if (evidence) return { level: evidence.level, reasons: [{ text: evidence.text, status: evidence.status, source: 'EFE / presse espagnole' }] };
  if (iso < OPE_2026.start || iso > OPE_2026.end) {
    return { level: 0, reasons: [{ text: 'Hors Opération Paso del Estrecho : pas de pointe connue', status: 'INFÉRENCE' }] };
  }
  if (firstAugustWeekend(Number(iso.slice(0, 4))).includes(iso)) {
    return { level: 3, reasons: [{ text: `${PORT_PEAK_PATTERN.text} ; appliqué à cette année`, status: 'INFÉRENCE', source: 'Ministère de l’Intérieur espagnol (bilan OPE 2025)' }] };
  }
  if (iso > OPE_2026.exitPhaseEnd) {
    return { level: 1, reasons: [{ text: 'Après le 15 août, la phase de sortie est terminée', status: 'INFÉRENCE' }] };
  }
  const wd = weekday(iso);
  const weekend = wd === 5 || wd === 6 || wd === 0;
  return {
    level: weekend ? 2 : 1,
    reasons: [{ text: weekend ? 'Week-end pendant la phase de sortie de l’OPE' : 'Jour de semaine pendant la phase de sortie de l’OPE', status: 'INFÉRENCE' }],
  };
}

/** Niveau de la route française un jour donné, pour les zones traversées. null = pas de donnée (jamais « fluide » par défaut). */
export function frenchLevel(iso: string, zones: number[]): { level: RoadLevel | null; reason: Reason } {
  const b = BISON_DEPARTURES_2026[iso];
  if (!b) return { level: null, reason: { text: `Pas de prévision Bison Futé disponible pour le ${iso}`, status: 'INCONNU' } };
  const zoneHit = b.zones && b.zones.zones.some((z) => zones.includes(z)) ? b.zones.level : 0;
  const level = Math.max(b.national, zoneHit) as RoadLevel;
  const where = zoneHit > b.national ? ` (zone${b.zones!.zones.length > 1 ? 's' : ''} ${b.zones!.zones.join(', ')})` : ' (niveau national)';
  return { level, reason: { text: `Route française le ${iso} : circulation ${BISON_WORD[level]}${where}`, status: 'À VÉRIFIER', source: `${BISON_SOURCE} — ${BISON_URL}` } };
}

export type Assessment = {
  departure: string; // ISO date-heure locale supposée UTC+2 ignorée : l'heure sert seulement au calcul des jours
  frenchDays: string[];
  arrivalAtPort: string;
  roadLevel: RoadLevel | null;
  portLevel: RoadLevel;
  combined: RoadLevel | null;
  label: string;
  /** Route française calme mais arrivée au port un jour chargé : ce que les conseils pays par pays ne montrent pas. */
  crossBorderTrap: boolean;
  reasons: Reason[];
};

export function assessDeparture(trip: Trip, departureDate: string, departureHour: number, profile: Profile): Assessment {
  const zones = ZONES_BY_ORIGIN[trip.origin];
  const start = Date.parse(`${departureDate}T00:00:00Z`) + departureHour * HOUR;
  const total = travelHours(trip.drivingSeconds, profile);
  const franceHours = travelHours(trip.drivingSeconds * trip.franceShare, 'relais');
  const reasons: Reason[] = [];
  if (!zones) reasons.push({ text: `Itinéraire en France inconnu pour ${trip.origin}`, status: 'INCONNU' });

  const frenchDays: string[] = [];
  if (zones && zones.length > 0 && trip.franceShare > 0) {
    for (let t = start; t <= start + franceHours * HOUR; t += HOUR) if (!frenchDays.includes(day(t))) frenchDays.push(day(t));
  }
  let roadLevel: RoadLevel | null = zones ? 0 : null;
  for (const iso of frenchDays) {
    const f = frenchLevel(iso, zones!);
    reasons.push(f.reason);
    roadLevel = f.level === null || roadLevel === null ? null : (Math.max(roadLevel, f.level) as RoadLevel);
  }
  const arrivalAtPort = day(start + total * HOUR);
  const port = portLevel(arrivalAtPort);
  reasons.push(...port.reasons.map((r) => ({ ...r, text: `Arrivée à ${trip.port} le ${arrivalAtPort} : ${r.text}` })));
  reasons.push({ text: `Trajet supposé : ${Math.round(total)} h jusqu'au port (${profile === 'relais' ? 'conduite en relais' : 'avec nuit en route'})`, status: 'INFÉRENCE' });

  const combined = roadLevel === null ? null : (Math.max(roadLevel, port.level) as RoadLevel);
  return {
    departure: `${departureDate} ${String(departureHour).padStart(2, '0')}h`,
    frenchDays,
    arrivalAtPort,
    roadLevel,
    portLevel: port.level,
    combined,
    label: combined === null ? 'Inconnu' : LEVEL_LABEL[combined],
    crossBorderTrap: roadLevel === 0 && port.level >= 2,
    reasons,
  };
}

/** Les jours d'une fenêtre, du plus calme au plus chargé. Les jours inconnus passent en dernier, jamais en premier. */
export function rankWindow(trip: Trip, from: string, to: string, departureHour: number, profile: Profile): Assessment[] {
  const out: Assessment[] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += 24 * HOUR) out.push(assessDeparture(trip, day(t), departureHour, profile));
  const key = (a: Assessment) => (a.combined === null ? 99 : a.combined * 10 + (a.roadLevel ?? 0) + a.portLevel);
  return out.sort((a, b) => key(a) - key(b) || a.departure.localeCompare(b.departure));
}

export const KNOWN_ORIGINS = Object.keys(ZONES_BY_ORIGIN);
