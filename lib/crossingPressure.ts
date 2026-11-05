// Crossing pressure: how busy a day is likely to be for a trip to or from
// Morocco, computed from the calendar only. It is an indication of affluence
// (queues at the port, full ferries), never a price and never live data.
// Religious dates come from the announced list only, never guessed.

import { ANNOUNCED_RELIGIOUS } from "@/lib/moroccanHolidays";

export type PressureLevel = "calme" | "charge" | "tres-charge";

export type Pressure = { level: PressureLevel; reason: string };

const RANK: Record<PressureLevel, number> = { calme: 0, charge: 1, "tres-charge": 2 };

// Summer return operation window (indicative: the official dates move a little each year).
const SUMMER_START = "06-05";
const SUMMER_END = "09-15";
// Core of the summer rush.
const PEAK_START = "07-15";
const PEAK_END = "08-25";
// Days around an announced Aïd that fill the ferries.
const EID_MARGIN_DAYS = 3;

export const PRESSURE_RULES = [
  { level: "tres-charge" as const, label: "Très chargé", when: "du 15 juillet au 25 août, et autour des Aïd annoncés (3 jours avant et après)" },
  { level: "charge" as const, label: "Chargé", when: "du 5 juin au 15 septembre (période estivale)" },
  { level: "calme" as const, label: "Calme", when: "le reste de l'année" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtc(date: string): number {
  return Date.parse(`${date}T00:00:00Z`);
}

function isoOf(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

export function crossingPressure(date: string): Pressure {
  const day = toUtc(date);
  if (Number.isNaN(day)) throw new Error(`Date invalide : ${date}`);
  const monthDay = date.slice(5);

  const eid = ANNOUNCED_RELIGIOUS.find(
    (h) => h.name.startsWith("Aïd al-") && Math.abs(toUtc(h.date) - day) <= EID_MARGIN_DAYS * DAY_MS,
  );
  if (eid) return { level: "tres-charge", reason: `Autour de ${eid.name}` };

  if (monthDay >= PEAK_START && monthDay <= PEAK_END) {
    return { level: "tres-charge", reason: "Cœur de la saison estivale" };
  }
  if (monthDay >= SUMMER_START && monthDay <= SUMMER_END) {
    return { level: "charge", reason: "Période estivale (Opération Marhaba)" };
  }
  return { level: "calme", reason: "Hors vacances d'été et hors Aïd" };
}

/**
 * Nearest day (up to `maxDays` before or after) that is strictly calmer than
 * `date`. Ties go to the earlier day. Null when the day is already calm or
 * nothing calmer is close.
 */
export function nearestCalmerDay(date: string, maxDays = 14): { date: string; level: PressureLevel } | null {
  const base = crossingPressure(date).level;
  if (base === "calme") return null;
  const day = toUtc(date);
  for (let offset = 1; offset <= maxDays; offset++) {
    for (const sign of [-1, 1]) {
      const candidate = isoOf(day + sign * offset * DAY_MS);
      const level = crossingPressure(candidate).level;
      if (RANK[level] < RANK[base]) return { date: candidate, level };
    }
  }
  return null;
}
