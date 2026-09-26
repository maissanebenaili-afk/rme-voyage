import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import TravelChecklist from "../components/TravelChecklist";
import {
  TRAVEL_STORAGE_KEY,
  resetTravelStoreForTests,
} from "@/lib/travel/useTravelStorage";

const PASSPORT = "Passeport (validité > 6 mois)";

const stored = (checklistProgress: string[]) =>
  JSON.stringify({
    version: 1,
    villes: { depart: "", arrivee: "" },
    dateVoyage: null,
    modeTransport: null,
    checklistProgress,
    preferences: {},
    derniereConsultation: null,
  });

const savedProgress = () =>
  JSON.parse(localStorage.getItem(TRAVEL_STORAGE_KEY)!).checklistProgress as string[];

beforeEach(() => {
  localStorage.clear();
  resetTravelStoreForTests();
});

describe("TravelChecklist", () => {
  test("keeps every default item, with an accessible name and checked state", () => {
    render(<TravelChecklist />);
    const box = screen.getByRole("button", { name: PASSPORT });
    expect(box).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("0/10 (0%)")).toBeInTheDocument();
  });

  test("a checked item is saved and still checked after a reload", async () => {
    const { unmount } = render(<TravelChecklist />);
    await waitFor(() => expect(localStorage.getItem(TRAVEL_STORAGE_KEY)).toBeNull());
    fireEvent.click(screen.getByRole("button", { name: PASSPORT }));

    expect(screen.getByRole("button", { name: PASSPORT })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("1/10 (10%)")).toBeInTheDocument();
    expect(savedProgress()).toEqual(["chk:passport"]);

    unmount();
    resetTravelStoreForTests();
    render(<TravelChecklist />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: PASSPORT })).toHaveAttribute("aria-pressed", "true"),
    );
  });

  test("unchecking only removes its own entry; other lists' entries are kept", async () => {
    localStorage.setItem(TRAVEL_STORAGE_KEY, stored(["pck:tshirt", "chk:passport"]));
    render(<TravelChecklist />);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: PASSPORT })).toHaveAttribute("aria-pressed", "true"),
    );

    fireEvent.click(screen.getByRole("button", { name: PASSPORT }));
    expect(savedProgress()).toEqual(["pck:tshirt"]);
  });

  test("ignores saved ids that are not checklist items", async () => {
    localStorage.setItem(TRAVEL_STORAGE_KEY, stored(["chk:removed-item", "pck:passport", "passport"]));
    render(<TravelChecklist />);
    await waitFor(() => expect(screen.getByText("0/10 (0%)")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: PASSPORT })).toHaveAttribute("aria-pressed", "false");
  });

  test("custom items can still be added and checked, without being saved", async () => {
    render(<TravelChecklist />);
    fireEvent.change(screen.getByPlaceholderText("Ajouter un élément..."), { target: { value: "Chargeur" } });
    fireEvent.click(screen.getByRole("button", { name: "Ajouter l'élément" }));

    fireEvent.click(screen.getByRole("button", { name: "Chargeur" }));
    expect(screen.getByRole("button", { name: "Chargeur" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("1/11 (9%)")).toBeInTheDocument();
    expect(localStorage.getItem(TRAVEL_STORAGE_KEY)).toBeNull();
  });
});
