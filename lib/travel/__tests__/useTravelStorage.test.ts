"use client";

import { act, renderHook, waitFor } from "@testing-library/react";
import {
  createDefaultTravelState,
  isValidIsoTimestamp,
  isValidTravelDate,
} from "../travelStorage.migrations";
import {
  TRAVEL_STORAGE_BACKUP_KEY,
  TRAVEL_STORAGE_KEY,
  useTravelStorage,
} from "../useTravelStorage";

const validPayload = {
  version: 1,
  villes: { depart: "Paris", arrivee: "Tanger" },
  dateVoyage: "2026-09-26",
  modeTransport: "car",
  checklistProgress: ["passport"],
  preferences: { scale: 1, notifications: true, theme: null },
  derniereConsultation: "2026-09-25T12:00:00.000Z",
};

describe("travel storage validation", () => {
  test("accepts a real calendar date and rejects impossible dates", () => {
    expect(isValidTravelDate("2026-09-26")).toBe(true);
    expect(isValidTravelDate("2026-02-31")).toBe(false);
    expect(isValidTravelDate("26-09-2026")).toBe(false);
    expect(isValidTravelDate("2026-9-26")).toBe(false);
  });

  test("accepts canonical ISO timestamps and rejects non-ISO timestamps", () => {
    expect(isValidIsoTimestamp("2026-09-25T12:00:00.000Z")).toBe(true);
    expect(isValidIsoTimestamp("2026-09-25T12:00:00Z")).toBe(true);
    expect(isValidIsoTimestamp("2026-09-25T12:00:00+02:00")).toBe(true);
    expect(isValidIsoTimestamp("2026-02-31T12:00:00.000Z")).toBe(false);
    expect(isValidIsoTimestamp("2026-09-25 12:00:00")).toBe(false);
  });
});

describe("useTravelStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test("starts from an isolated default state and hydrates", async () => {
    const { result } = renderHook(() => useTravelStorage());

    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    expect(result.current.travel).toEqual(createDefaultTravelState());
  });

  test("restores a valid persisted payload", async () => {
    localStorage.setItem(TRAVEL_STORAGE_KEY, JSON.stringify(validPayload));

    const { result } = renderHook(() => useTravelStorage());

    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    expect(result.current.travel).toEqual(validPayload);
  });

  test.each([
    ["invalid JSON", "### CORRUPT ###"],
    [
      "impossible date",
      JSON.stringify({ ...validPayload, dateVoyage: "2026-02-31" }),
    ],
    [
      "missing version",
      JSON.stringify({ ...validPayload, version: undefined }),
    ],
    [
      "unknown version",
      JSON.stringify({ ...validPayload, version: 2 }),
    ],
    [
      "invalid checklist item",
      JSON.stringify({ ...validPayload, checklistProgress: ["passport", 500] }),
    ],
    [
      "nested preference",
      JSON.stringify({ ...validPayload, preferences: { theme: { main: "dark" } } }),
    ],
  ])("rejects corrupted persisted data: %s", async (_label, raw) => {
    localStorage.setItem(TRAVEL_STORAGE_KEY, raw);

    const { result } = renderHook(() => useTravelStorage());

    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    expect(result.current.travel).toEqual(createDefaultTravelState());
    expect(localStorage.getItem(TRAVEL_STORAGE_BACKUP_KEY)).toBe(raw);
  });

  test("setTravel accepts a functional updater", async () => {
    const { result } = renderHook(() => useTravelStorage());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.setTravel((prev) => ({
        ...prev,
        modeTransport: "plane",
      }));
    });

    expect(result.current.travel.modeTransport).toBe("plane");
  });

  test("filters undefined values from nested villes", async () => {
    const { result } = renderHook(() => useTravelStorage());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.updateTravel({
        villes: { depart: "Paris", arrivee: "Tanger" },
      });
    });

    act(() => {
      result.current.updateTravel({
        villes: { depart: undefined },
      });
    });

    expect(result.current.travel.villes).toEqual({
      depart: "Paris",
      arrivee: "Tanger",
    });
  });

  test("updateTravel merges nested villes and preferences", async () => {
    const { result } = renderHook(() => useTravelStorage());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.updateTravel({
        villes: { depart: "Paris" },
        preferences: { notifications: true },
      });
    });

    expect(result.current.travel.villes).toEqual({
      depart: "Paris",
      arrivee: "",
    });
    expect(result.current.travel.preferences).toEqual({
      notifications: true,
    });
  });

  test("does not update derniereConsultation during an ordinary update", async () => {
    const { result } = renderHook(() => useTravelStorage());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.updateTravel({
        villes: { depart: "A", arrivee: "B" },
      });
    });

    expect(result.current.travel.villes).toEqual({ depart: "A", arrivee: "B" });
    expect(result.current.travel.derniereConsultation).toBeNull();
  });

  test("markConsulted explicitly records the consultation timestamp", async () => {
    const now = jest.spyOn(Date.prototype, "toISOString").mockReturnValue("2026-09-26T19:00:00.000Z");
    const { result } = renderHook(() => useTravelStorage());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.markConsulted();
    });

    expect(result.current.travel.derniereConsultation).toBe("2026-09-26T19:00:00.000Z");
    now.mockRestore();
  });

  test("persists updates without crashing when storage writes fail", async () => {
    const { result } = renderHook(() => useTravelStorage());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    const setItem = jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    expect(() => {
      act(() => {
        result.current.updateTravel({ modeTransport: "mixed" });
      });
    }).not.toThrow();

    expect(result.current.travel.modeTransport).toBe("mixed");
    setItem.mockRestore();
  });

  test("reset clears persisted state and restores defaults", async () => {
    const { result } = renderHook(() => useTravelStorage());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));

    act(() => {
      result.current.updateTravel({ modeTransport: "car" });
    });
    expect(localStorage.getItem(TRAVEL_STORAGE_KEY)).not.toBeNull();

    act(() => {
      result.current.resetTravel();
    });

    expect(localStorage.getItem(TRAVEL_STORAGE_KEY)).toBeNull();
    expect(result.current.travel).toEqual(createDefaultTravelState());
  });
});
