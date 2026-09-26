import {
  TRAVEL_PHASES,
  computeTravelPhase,
  toLocalIsoDate,
} from "../travelPhase";

const TODAY = "2026-09-26";

describe("computeTravelPhase", () => {
  test("no departure date → mon-voyage, no countdown", () => {
    expect(computeTravelPhase({ dateVoyage: null }, TODAY)).toEqual({
      phase: "mon-voyage",
      daysUntilDeparture: null,
    });
  });

  test("distant trip → preparer with the exact countdown", () => {
    expect(computeTravelPhase({ dateVoyage: "2026-12-20" }, TODAY)).toEqual({
      phase: "preparer",
      daysUntilDeparture: 85,
    });
  });

  test("trip tomorrow → still preparer, countdown 1", () => {
    expect(computeTravelPhase({ dateVoyage: "2026-09-27" }, TODAY)).toEqual({
      phase: "preparer",
      daysUntilDeparture: 1,
    });
  });

  test("departure day → route", () => {
    expect(computeTravelPhase({ dateVoyage: TODAY }, TODAY)).toEqual({
      phase: "route",
      daysUntilDeparture: 0,
    });
  });

  test.each([
    ["the day after departure", "2026-09-25", -1],
    ["a month after departure", "2026-08-26", -31],
  ])("past date (%s) → maroc", (_label, date, days) => {
    expect(computeTravelPhase({ dateVoyage: date }, TODAY)).toEqual({
      phase: "maroc",
      daysUntilDeparture: days,
    });
  });

  test("counts calendar days across month, year and DST boundaries", () => {
    expect(computeTravelPhase({ dateVoyage: "2027-01-01" }, "2026-12-31").daysUntilDeparture).toBe(1);
    expect(computeTravelPhase({ dateVoyage: "2026-03-30" }, "2026-03-28").daysUntilDeparture).toBe(2);
    expect(computeTravelPhase({ dateVoyage: "2026-10-26" }, "2026-10-24").daysUntilDeparture).toBe(2);
  });

  test("never returns an always-available section as the active phase", () => {
    const sections = TRAVEL_PHASES.filter((p) => !p.timeline).map((p) => p.id);
    for (const date of [null, "2020-01-01", TODAY, "2030-01-01"]) {
      expect(sections).not.toContain(computeTravelPhase({ dateVoyage: date }, TODAY).phase);
    }
  });
});

describe("TRAVEL_PHASES", () => {
  test("lists the six hub phases in order with unique ids", () => {
    expect(TRAVEL_PHASES.map((p) => p.label)).toEqual([
      "Mon Voyage",
      "Préparer",
      "Route",
      "Maroc",
      "Sport & TV",
      "Services",
    ]);
    expect(new Set(TRAVEL_PHASES.map((p) => p.id)).size).toBe(6);
  });
});

describe("toLocalIsoDate", () => {
  test("uses the local calendar date, zero-padded", () => {
    expect(toLocalIsoDate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
    expect(toLocalIsoDate(new Date(2026, 11, 31, 0, 1))).toBe("2026-12-31");
  });
});
