"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { CurrentTravelData } from "./travelStorage.types";
import {
  createDefaultTravelState,
  migrateAndValidateTravelData,
} from "./travelStorage.migrations";

export const TRAVEL_STORAGE_KEY = "rme_personal_travel_data";
export const TRAVEL_STORAGE_BACKUP_KEY =
  "rme_personal_travel_data_corrupted";

type TravelUpdate = {
  villes?: Partial<CurrentTravelData["villes"]>;
  dateVoyage?: CurrentTravelData["dateVoyage"];
  modeTransport?: CurrentTravelData["modeTransport"];
  checklistProgress?: CurrentTravelData["checklistProgress"];
  preferences?: Partial<CurrentTravelData["preferences"]>;
};

type TravelUpdater = (
  prev: CurrentTravelData,
) => TravelUpdate;

type TravelStoreState = {
  travel: CurrentTravelData;
  isHydrated: boolean;
};

/*
 * Store partagé au niveau du module (même modèle que lib/routeContext.ts) :
 * tous les composants qui appellent useTravelStorage lisent le même état,
 * au lieu d'avoir chacun leur copie React qui divergerait.
 */
const SERVER_STATE: TravelStoreState = {
  travel: createDefaultTravelState(),
  isHydrated: false,
};

let state: TravelStoreState = SERVER_STATE;
let hydrationStarted = false;
const listeners = new Set<() => void>();

function emit(next: TravelStoreState): void {
  state = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): TravelStoreState {
  return state;
}

function getServerSnapshot(): TravelStoreState {
  return SERVER_STATE;
}

function persist(travel: CurrentTravelData): void {
  try {
    window.localStorage.setItem(TRAVEL_STORAGE_KEY, JSON.stringify(travel));
  } catch (error) {
    console.error("RME Storage Write Error:", error);
  }
}

function readPersistedTravel(): CurrentTravelData {
  let rawData: string | null = null;

  try {
    rawData = window.localStorage.getItem(TRAVEL_STORAGE_KEY);
    if (!rawData) {
      return createDefaultTravelState();
    }
    return migrateAndValidateTravelData(JSON.parse(rawData));
  } catch (error) {
    console.error("RME Storage Error: reset par defaut.", error);

    if (rawData !== null) {
      try {
        window.localStorage.setItem(TRAVEL_STORAGE_BACKUP_KEY, rawData);
        // Only drop the corrupted payload once a copy is safely stored.
        window.localStorage.removeItem(TRAVEL_STORAGE_KEY);
      } catch {
        // Storage may be unavailable or quota-limited. Memory state remains valid.
      }
    }
    return createDefaultTravelState();
  }
}

function hydrateTravelStore(): void {
  if (hydrationStarted || typeof window === "undefined") {
    return;
  }
  hydrationStarted = true;
  emit({ travel: readPersistedTravel(), isHydrated: true });
}

function commit(travel: CurrentTravelData): void {
  emit({ travel, isHydrated: state.isHydrated });
  // Before hydration, writing would overwrite the stored trip with defaults.
  if (state.isHydrated) {
    persist(travel);
  }
}

function setTravel(
  nextData:
    | CurrentTravelData
    | ((prev: CurrentTravelData) => CurrentTravelData),
): void {
  commit(typeof nextData === "function" ? nextData(state.travel) : nextData);
}

function withoutUndefined(fields: object) {
  return Object.fromEntries(
    Object.entries(fields).filter(([, val]) => val !== undefined),
  );
}

function updateTravel(fields: TravelUpdate | TravelUpdater): void {
  const prev = state.travel;
  const computedFields = typeof fields === "function" ? fields(prev) : fields;
  const updated: CurrentTravelData = { ...prev };

  if (computedFields.villes) {
    updated.villes = {
      ...prev.villes,
      ...(withoutUndefined(computedFields.villes) as Partial<CurrentTravelData["villes"]>),
    };
  }

  if (computedFields.preferences) {
    updated.preferences = {
      ...prev.preferences,
      ...(withoutUndefined(computedFields.preferences) as CurrentTravelData["preferences"]),
    };
  }

  if (computedFields.dateVoyage !== undefined) {
    updated.dateVoyage = computedFields.dateVoyage;
  }
  if (computedFields.modeTransport !== undefined) {
    updated.modeTransport = computedFields.modeTransport;
  }
  if (computedFields.checklistProgress !== undefined) {
    updated.checklistProgress = computedFields.checklistProgress;
  }

  commit(updated);
}

function markConsulted(): void {
  commit({ ...state.travel, derniereConsultation: new Date().toISOString() });
}

function resetTravel(): void {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(TRAVEL_STORAGE_KEY);
    } catch (error) {
      console.error("RME Storage Reset Error:", error);
    }
  }
  emit({ travel: createDefaultTravelState(), isHydrated: state.isHydrated });
}

/** Test-only: simulates a fresh page load (memory state dropped, storage kept). */
export function resetTravelStoreForTests(): void {
  state = SERVER_STATE;
  hydrationStarted = false;
  listeners.clear();
}

export function useTravelStorage() {
  const { travel, isHydrated } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  // Hydrate after mount so the first client render matches the server one.
  useEffect(hydrateTravelStore, []);

  return {
    travel,
    setTravel,
    updateTravel,
    markConsulted,
    resetTravel,
    isHydrated,
  };
}
