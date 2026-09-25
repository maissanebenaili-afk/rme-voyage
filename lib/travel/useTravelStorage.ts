"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

export function useTravelStorage() {
  const [travel, setTravelState] = useState<CurrentTravelData>(
    createDefaultTravelState,
  );
  const [isHydrated, setIsHydrated] = useState(false);
  const skipNextPersistRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const rawData = window.localStorage.getItem(TRAVEL_STORAGE_KEY);

      if (!rawData) {
        return;
      }

      const parsed: unknown = JSON.parse(rawData);
      const validatedData = migrateAndValidateTravelData(parsed);
      setTravelState(validatedData);
    } catch (error) {
      console.error("RME Storage Error: reset par defaut.", error);

      try {
        const corruptedData =
          window.localStorage.getItem(TRAVEL_STORAGE_KEY);
        if (corruptedData !== null) {
          window.localStorage.setItem(
            TRAVEL_STORAGE_BACKUP_KEY,
            corruptedData,
          );
        }
      } catch {
        // Storage may be unavailable or quota-limited. Memory state remains valid.
      }
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") {
      return;
    }

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    try {
      window.localStorage.setItem(
        TRAVEL_STORAGE_KEY,
        JSON.stringify(travel),
      );
    } catch (error) {
      console.error("RME Storage Write Error:", error);
    }
  }, [isHydrated, travel]);

  const setTravel = useCallback(
    (
      nextData:
        | CurrentTravelData
        | ((prev: CurrentTravelData) => CurrentTravelData),
    ) => {
      setTravelState(nextData);
    },
    [],
  );

  const updateTravel = useCallback(
    (fields: TravelUpdate | TravelUpdater) => {
      setTravelState((prev) => {
        const computedFields =
          typeof fields === "function" ? fields(prev) : fields;

        const updated: CurrentTravelData = { ...prev };

        if (computedFields.villes) {
          updated.villes = { ...prev.villes, ...computedFields.villes };
        }

        if (computedFields.preferences) {
          const cleanedPrefs = Object.fromEntries(
            Object.entries(computedFields.preferences).filter(
              ([, val]) => val !== undefined,
            ),
          ) as Record<string, string | number | boolean | null>;
          updated.preferences = { ...prev.preferences, ...cleanedPrefs };
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

        return updated;
      });
    },
    [],
  );

  const markConsulted = useCallback(() => {
    setTravelState((prev) => ({
      ...prev,
      derniereConsultation: new Date().toISOString(),
    }));
  }, []);

  const resetTravel = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(TRAVEL_STORAGE_KEY);
      } catch (error) {
        console.error("RME Storage Reset Error:", error);
      }
    }

    skipNextPersistRef.current = true;
    setTravelState(createDefaultTravelState());
  }, []);

  return {
    travel,
    setTravel,
    updateTravel,
    markConsulted,
    resetTravel,
    isHydrated,
  };
}
