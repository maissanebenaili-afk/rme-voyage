import type { CurrentTravelData } from "./travelStorage.types";

export type TravelPhaseId =
  | "mon-voyage"
  | "preparer"
  | "route"
  | "maroc"
  | "sport-tv"
  | "services";

/** Phases that can be derived from the trip data; the others are always-available sections. */
export type TimelinePhaseId = Extract<
  TravelPhaseId,
  "mon-voyage" | "preparer" | "route" | "maroc"
>;

export const TRAVEL_PHASES: ReadonlyArray<{
  id: TravelPhaseId;
  label: string;
  timeline: boolean;
}> = [
  { id: "mon-voyage", label: "Mon Voyage", timeline: true },
  { id: "preparer", label: "Préparer", timeline: true },
  { id: "route", label: "Route", timeline: true },
  { id: "maroc", label: "Maroc", timeline: true },
  { id: "sport-tv", label: "Sport & TV", timeline: false },
  { id: "services", label: "Services", timeline: false },
];

export type TravelPhaseResult = {
  phase: TimelinePhaseId;
  /** Calendar days from today to dateVoyage (0 = departure day, negative = after), null without a date. */
  daysUntilDeparture: number | null;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function civilDayNumber(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

/** The user's local calendar date as YYYY-MM-DD (not the UTC date). */
export function toLocalIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * Timeline rule, based only on TravelDataV1.dateVoyage (the departure date):
 * - no date            → mon-voyage (the trip is not defined yet)
 * - departure ahead    → preparer
 * - departure day (J0) → route
 * - after departure    → maroc
 * Dates are compared as calendar days, so DST and the time of day never
 * shift the result. `today` must be a valid YYYY-MM-DD local date.
 */
export function computeTravelPhase(
  travel: Pick<CurrentTravelData, "dateVoyage">,
  today: string,
): TravelPhaseResult {
  if (!travel.dateVoyage) {
    return { phase: "mon-voyage", daysUntilDeparture: null };
  }

  const days = civilDayNumber(travel.dateVoyage) - civilDayNumber(today);

  if (days > 0) return { phase: "preparer", daysUntilDeparture: days };
  if (days === 0) return { phase: "route", daysUntilDeparture: 0 };
  return { phase: "maroc", daysUntilDeparture: days };
}
