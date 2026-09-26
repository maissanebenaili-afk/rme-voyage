import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import TravelHub, { HUB_ANCHORS } from "../components/TravelHub";
import { publishRoute, toComputedRoute } from "@/lib/routeContext";
import {
  TRAVEL_STORAGE_KEY,
  resetTravelStoreForTests,
} from "@/lib/travel/useTravelStorage";

const stored = (overrides: Record<string, unknown>) =>
  JSON.stringify({
    version: 1,
    villes: { depart: "Paris", arrivee: "Tanger" },
    dateVoyage: null,
    modeTransport: null,
    checklistProgress: [],
    preferences: {},
    derniereConsultation: null,
    ...overrides,
  });

const steps = () => within(screen.getByRole("navigation", { name: "Étapes du voyage" }));
const current = () => steps().queryByRole("link", { current: "step" });

beforeEach(() => {
  localStorage.clear();
  resetTravelStoreForTests();
  act(() => publishRoute(null));
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

describe("TravelHub", () => {
  test("lists the four trip steps and the two always-available sections, all as links", async () => {
    render(<TravelHub />);
    await waitFor(() => expect(screen.queryByText(/Chargement/)).not.toBeInTheDocument());

    expect(steps().getAllByRole("link").map((l) => l.getAttribute("href"))).toEqual([
      "#planifier", "#preparer", "#route", "#maroc",
    ]);
    for (const name of [/^Mon Voyage/, /^Préparer$/, /^Route$/, /^Maroc$/]) {
      expect(steps().getByRole("link", { name })).toBeInTheDocument();
    }
    const always = within(screen.getByRole("navigation", { name: "Toujours disponibles" }));
    expect(always.getByRole("link", { name: "Sport & TV" })).toHaveAttribute("href", "#sport-tv");
    expect(always.getByRole("link", { name: "Services" })).toHaveAttribute("href", "#services");
  });

  test("without a trip: Mon Voyage is current and invites to use the planner", async () => {
    render(<TravelHub />);
    await waitFor(() => expect(screen.getByText(/Calculez votre itinéraire/)).toBeInTheDocument());
    expect(current()).toHaveTextContent("Mon Voyage");
    expect(screen.queryByRole("button", { name: /Effacer/ })).not.toBeInTheDocument();
  });

  test("a stored trip with a future date → Préparer, cities and countdown", async () => {
    localStorage.setItem(TRAVEL_STORAGE_KEY, stored({ dateVoyage: "2026-10-06" }));
    render(<TravelHub />);
    await waitFor(() => expect(current()).toHaveTextContent("Préparer"));
    expect(screen.getByText("Paris → Tanger")).toBeInTheDocument();
    expect(screen.getByText("Départ le 6 octobre 2026 · dans 10 jours")).toBeInTheDocument();
  });

  test("departure day → Route; past date → Maroc", async () => {
    localStorage.setItem(TRAVEL_STORAGE_KEY, stored({ dateVoyage: "2026-09-26" }));
    const { unmount } = render(<TravelHub />);
    await waitFor(() => expect(current()).toHaveTextContent("Route"));
    expect(screen.getByText(/Départ aujourd’hui/)).toBeInTheDocument();
    unmount();

    resetTravelStoreForTests();
    localStorage.setItem(TRAVEL_STORAGE_KEY, stored({ dateVoyage: "2026-09-20" }));
    render(<TravelHub />);
    await waitFor(() => expect(current()).toHaveTextContent("Maroc"));
    expect(screen.getByText("Voyage commencé le 20 septembre 2026")).toBeInTheDocument();
  });

  test("Sport & TV and Services are never marked as the current step", async () => {
    localStorage.setItem(TRAVEL_STORAGE_KEY, stored({ dateVoyage: "2026-09-20" }));
    render(<TravelHub />);
    await waitFor(() => expect(current()).not.toBeNull());
    const always = within(screen.getByRole("navigation", { name: "Toujours disponibles" }));
    always.getAllByRole("link").forEach((link) => expect(link).not.toHaveAttribute("aria-current"));
  });

  test("a trip computed by the planner is recorded in the shared store and persisted", async () => {
    render(<TravelHub />);
    await waitFor(() => expect(screen.getByText(/Calculez votre itinéraire/)).toBeInTheDocument());

    act(() => publishRoute(toComputedRoute("Paris", "Nador", 2_100_000, 80_000, Date.now(), undefined, "2026-10-01")));

    expect(await screen.findByText("Paris → Nador")).toBeInTheDocument();
    expect(current()).toHaveTextContent("Préparer");
    expect(JSON.parse(localStorage.getItem(TRAVEL_STORAGE_KEY)!)).toMatchObject({
      villes: { depart: "Paris", arrivee: "Nador" },
      dateVoyage: "2026-10-01",
    });
  });

  test("a new trip without a date does not inherit the previous trip's date", async () => {
    localStorage.setItem(TRAVEL_STORAGE_KEY, stored({ dateVoyage: "2026-10-06" }));
    render(<TravelHub />);
    await waitFor(() => expect(current()).toHaveTextContent("Préparer"));

    act(() => publishRoute(toComputedRoute("Lyon", "Agadir", 2_900_000, 100_000)));
    expect(await screen.findByText("Lyon → Agadir")).toBeInTheDocument();
    expect(current()).toHaveTextContent("Mon Voyage");
  });

  test("recomputing the same trip without a date keeps the saved date", async () => {
    localStorage.setItem(TRAVEL_STORAGE_KEY, stored({ dateVoyage: "2026-10-06" }));
    render(<TravelHub />);
    await waitFor(() => expect(current()).toHaveTextContent("Préparer"));

    act(() => publishRoute(toComputedRoute("Paris", "Tanger", 1_968_871, 70_000)));
    await waitFor(() => expect(screen.getByText(/dans 10 jours/)).toBeInTheDocument());
  });

  test("Effacer removes the trip from the device", async () => {
    localStorage.setItem(TRAVEL_STORAGE_KEY, stored({ dateVoyage: "2026-10-06" }));
    render(<TravelHub />);
    fireEvent.click(await screen.findByRole("button", { name: /Effacer/ }));

    expect(localStorage.getItem(TRAVEL_STORAGE_KEY)).toBeNull();
    expect(screen.getByText(/Calculez votre itinéraire/)).toBeInTheDocument();
    expect(current()).toHaveTextContent("Mon Voyage");
  });

  test("collapsible: closed by default, the current step stays visible, opens on click", async () => {
    localStorage.setItem(TRAVEL_STORAGE_KEY, stored({ dateVoyage: "2026-10-06" }));
    const { container } = render(<TravelHub />);
    const details = container.querySelector("details")!;
    expect(details.open).toBe(false);

    expect(await screen.findByText("Étape : Préparer")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Voir les rubriques"));
    expect(details.open).toBe(true);
  });

  test("every hub entry points to its own anchor", () => {
    expect(new Set(Object.values(HUB_ANCHORS)).size).toBe(6);
  });
});
