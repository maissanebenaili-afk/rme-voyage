import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import { useTravelPhase } from "../useTravelPhase";
import {
  TRAVEL_STORAGE_BACKUP_KEY,
  TRAVEL_STORAGE_KEY,
  resetTravelStoreForTests,
  useTravelStorage,
} from "../useTravelStorage";

const payload = (dateVoyage: string | null) => ({
  version: 1,
  villes: { depart: "Paris", arrivee: "Tanger" },
  dateVoyage,
  modeTransport: "car",
  checklistProgress: [],
  preferences: {},
  derniereConsultation: null,
});

beforeEach(() => {
  localStorage.clear();
  jest.restoreAllMocks();
  resetTravelStoreForTests();
  // Only Date is faked: RTL's waitFor keeps its real timers.
  jest.useFakeTimers({
    doNotFake: [
      "setTimeout", "clearTimeout", "setInterval", "clearInterval",
      "setImmediate", "clearImmediate", "nextTick", "queueMicrotask",
      "requestAnimationFrame", "cancelAnimationFrame", "performance", "hrtime",
    ],
  });
  jest.setSystemTime(new Date(2026, 8, 26, 10, 0));
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useTravelPhase", () => {
  test("reports mon-voyage and not hydrated before storage is read", () => {
    localStorage.setItem(TRAVEL_STORAGE_KEY, JSON.stringify(payload("2026-12-01")));
    let firstRender: ReturnType<typeof useTravelPhase> | undefined;
    renderHook(() => {
      const value = useTravelPhase();
      firstRender ??= value;
      return value;
    });
    expect(firstRender).toEqual({ phase: "mon-voyage", daysUntilDeparture: null, isHydrated: false });
  });

  test("derives the phase from the persisted trip (survives a reload)", async () => {
    localStorage.setItem(TRAVEL_STORAGE_KEY, JSON.stringify(payload("2026-10-06")));
    const { result } = renderHook(() => useTravelPhase());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(result.current).toEqual({ phase: "preparer", daysUntilDeparture: 10, isHydrated: true });
  });

  test("empty storage → mon-voyage", async () => {
    const { result } = renderHook(() => useTravelPhase());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(result.current.phase).toBe("mon-voyage");
  });

  test("corrupted storage → mon-voyage without crashing, payload backed up", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    localStorage.setItem(TRAVEL_STORAGE_KEY, "### CORRUPT ###");
    const { result } = renderHook(() => useTravelPhase());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(result.current.phase).toBe("mon-voyage");
    expect(localStorage.getItem(TRAVEL_STORAGE_BACKUP_KEY)).toBe("### CORRUPT ###");
  });

  test("unavailable storage → mon-voyage without crashing", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    const { result } = renderHook(() => useTravelPhase());
    await waitFor(() => expect(result.current.isHydrated).toBe(true));
    expect(result.current.phase).toBe("mon-voyage");
  });

  test("reacts to trip changes: no date → far → today → past", async () => {
    const { result } = renderHook(() => ({ phase: useTravelPhase(), storage: useTravelStorage() }));
    await waitFor(() => expect(result.current.phase.isHydrated).toBe(true));
    expect(result.current.phase.phase).toBe("mon-voyage");

    act(() => result.current.storage.updateTravel({ dateVoyage: "2027-06-01" }));
    expect(result.current.phase.phase).toBe("preparer");

    act(() => result.current.storage.updateTravel({ dateVoyage: "2026-09-26" }));
    expect(result.current.phase).toMatchObject({ phase: "route", daysUntilDeparture: 0 });

    act(() => result.current.storage.updateTravel({ dateVoyage: "2026-09-20" }));
    expect(result.current.phase).toMatchObject({ phase: "maroc", daysUntilDeparture: -6 });

    act(() => result.current.storage.resetTravel());
    expect(result.current.phase.phase).toBe("mon-voyage");
  });
});

describe("shared travel state across components", () => {
  function PhaseBadge({ name }: { name: string }) {
    const { phase } = useTravelPhase();
    return <span data-testid={name}>{phase}</span>;
  }

  function DateEditor() {
    const { updateTravel, travel } = useTravelStorage();
    return (
      <button type="button" onClick={() => updateTravel({ dateVoyage: "2026-09-26" })}>
        {travel.dateVoyage ?? "aucune date"}
      </button>
    );
  }

  test("an update in one component is seen by every other consumer", async () => {
    render(
      <>
        <DateEditor />
        <PhaseBadge name="a" />
        <PhaseBadge name="b" />
      </>,
    );
    await waitFor(() => expect(screen.getByTestId("a")).toHaveTextContent("mon-voyage"));

    act(() => screen.getByRole("button").click());

    expect(screen.getByRole("button")).toHaveTextContent("2026-09-26");
    expect(screen.getByTestId("a")).toHaveTextContent("route");
    expect(screen.getByTestId("b")).toHaveTextContent("route");
  });

  test("a component mounted later starts from the current shared state", async () => {
    const first = renderHook(() => useTravelStorage());
    await waitFor(() => expect(first.result.current.isHydrated).toBe(true));
    act(() => first.result.current.updateTravel({ dateVoyage: "2026-09-30" }));

    const later = renderHook(() => useTravelPhase());
    expect(later.result.current).toEqual({ phase: "preparer", daysUntilDeparture: 4, isHydrated: true });
  });
});
