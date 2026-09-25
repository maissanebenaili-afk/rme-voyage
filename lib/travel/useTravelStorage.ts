"use client";

import { useCallback, useEffect, useState } from "react";
import type { CurrentTravelData } from "./travelStorage.types";
import {
  createDefaultTravelState,
  migrateAndValidateTravelData,
} from "./travelStorage.migrations";

export const TRAVEL_STORAGE_KEY = "rme_personal_travel_data";
export const TRAVEL_STORAGE_BACKUP_KEY =
  "rme_personal_travel_data_corrupted";

type TravelUpdate = Partial<
  Omit<CurrentTravelData, "version" | "derniereConsultation">
> & {
  villes?: Partial<CurrentTravelData["villes"]>;
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
      const validatedData = migrateAndValidateTravelData(parsed as Record<string, unknown>);
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

        return {
          ...prev,
          ...computedFields,
          villes: computedFields.villes
            ? { ...prev.villes, ...computedFields.villes }
            : prev.villes,
          preferences: computedFields.preferences
            ? { ...prev.preferences, ...computedFields.preferences }
            : prev.preferences,
        };
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
