"use client";

import { computeTravelPhase, toLocalIsoDate, type TravelPhaseResult } from "./travelPhase";
import { useTravelStorage } from "./useTravelStorage";

export type UseTravelPhaseResult = TravelPhaseResult & { isHydrated: boolean };

/**
 * Current trip phase, derived from the shared travel store. Before hydration
 * (server render, first client render) it reports mon-voyage with
 * isHydrated=false, so callers can avoid flashing the wrong phase.
 */
export function useTravelPhase(): UseTravelPhaseResult {
  const { travel, isHydrated } = useTravelStorage();

  if (!isHydrated) {
    return { phase: "mon-voyage", daysUntilDeparture: null, isHydrated: false };
  }

  return { ...computeTravelPhase(travel, toLocalIsoDate(new Date())), isHydrated: true };
}
