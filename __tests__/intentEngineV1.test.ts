import { extractIntent } from "../lib/lab/intentFacts";
import { doneActions, journeyState } from "../lib/lab/journeyState";
import { planNextActions, type PlanOptions } from "../lib/lab/nextBestAction";
import type { PartnerCatalogueEntry } from "../lib/partnerCatalogue";

// Tuesday 29 September 2026.
const TODAY = "2026-09-29";

function partner(id: string, active: boolean): PartnerCatalogueEntry {
  return {
    id, name: id, category: "flight", description: "", status: active ? "active" : "pending",
    ...(active ? { affiliateUrl: `https://${id}.tp.st/abc` } : {}),
    publicUrl: `https://example.com/${id}`, envVar: "X", commissionNote: "",
  };
}
const PRODUCTION = [partner("travelpayouts-flights", true), partner("travelpayouts-hotels", false), partner("lgrima", false)];
const ROUTES = [{ slug: "bruxelles-al-hoceima", originCity: "Bruxelles", destinationCity: "Al Hoceïma" }];
const plan = (sentence: string, overrides: Partial<PlanOptions> = {}) =>
  planNextActions(extractIntent(sentence, TODAY), { partners: PRODUCTION, routes: ROUTES, today: TODAY, lang: "fr", ...overrides });

describe("places the V0 missed", () => {
  test.each([
    ["On descend en voiture de Bruxelles à Al Hoceima le 15 juillet", "Al Hoceïma"],
    ["direction Alhoceima cet été", "Al Hoceïma"],
    ["bghit nmshi l Tanja f sif", "Tanger"],
    ["un week-end à Chaouen", "Chefchaouen"],
    ["je vais à Beni Mellal", "Beni Mellal"],
    ["aller à Fez en avril", "Fès"],
  ])("%s → %s", (sentence, label) => {
    expect(extractIntent(sentence, TODAY).destination?.value.label).toBe(label);
  });

  test("Al Hoceïma by car from Brussels opens its /trajet page", () => {
    expect(plan("On descend en voiture de Bruxelles à Al Hoceima le 15 juillet").actions[0])
      .toMatchObject({ kind: "route", href: "/trajet/bruxelles-al-hoceima" });
  });

  test("without a /trajet page, the planner opens pre-filled", () => {
    expect(plan("de Lyon à Chefchaouen en voiture le 12 octobre").actions[0].href)
      .toBe("/?from=Lyon&to=Chefchaouen&date=2026-10-12#planifier");
  });
});

describe("a mode the user does not use is never asserted", () => {
  test("« pas de voiture »: no car, and the trip inside Morocco gets local transport", () => {
    const f = extractIntent("Je n'ai pas de voiture, comment aller de Tanger à Chefchaouen ?", TODAY);
    expect(f.mode).toBeUndefined();
    expect(f.origin?.value.label).toBe("Tanger");
    expect(f.destination?.value.label).toBe("Chefchaouen");
    const { actions } = plan("Je n'ai pas de voiture, comment aller de Tanger à Chefchaouen ?");
    expect(actions.map((a) => a.kind)).toEqual(["local_transfer", "sim", "money"]);
    expect(actions[0].href).toBeUndefined(); // Lgrima is not active: never shown as bookable
  });

  test.each([
    ["sans voiture vers Nador", undefined],
    ["ma 3andich tomobil, bghit nmshi l Nador", undefined],
    ["pas de voiture, on prend l'avion pour Nador", "plane"],
  ])("%s", (sentence, mode) => {
    expect(extractIntent(sentence, TODAY).mode?.value).toBe(mode);
  });
});

describe("misspelt cities are deduced, and only where a destination goes", () => {
  test("« aler a marakech »", () => {
    const f = extractIntent("je veux aler a marakech ce weekend", TODAY);
    expect(f.destinationGuess).toEqual({ value: { key: "marrakech", label: "Marrakech" }, status: "INFERENCE", evidence: "marakech" });
    expect(f.unknown).not.toContain("destination");
  });

  test.each(["il y a un danger sur la route", "je pars avec Martin", "depuis Marakech vers Paris"])("no guess: %s", (sentence) => {
    expect(extractIntent(sentence, TODAY).destinationGuess).toBeUndefined();
  });
});

describe("Arabic script", () => {
  test("« بغيت نمشي لطنجة نهار السبت »", () => {
    const f = extractIntent("بغيت نمشي لطنجة نهار السبت", TODAY);
    expect(f.destination).toMatchObject({ value: { key: "tanger", label: "Tanger" }, status: "FACT_USER", evidence: "لطنجة" });
    expect(f.horizon).toMatchObject({ start: "2026-10-03", end: "2026-10-03", status: "INFERENCE" });
  });

  test("country, origin, mode, family and needs", () => {
    const f = extractIntent("بغيت نمشي للمغرب من باريس بالطوموبيل مع العائلة غدا ونلقى فندق", TODAY);
    expect(f.country).toMatchObject({ value: "MA", status: "FACT_USER" });
    expect(f.origin?.value).toEqual({ label: "Paris", countryCode: "fr" });
    expect(f.mode?.value).toBe("car");
    expect(f.travellers?.value.family).toBe(true);
    expect(f.horizon?.start).toBe("2026-09-30");
    expect(f.needs.map((n) => n.value)).toEqual(["hotel"]);
  });

  test("« البلاد » is RME's reading of home, so INFERENCE", () => {
    expect(extractIntent("نمشي للبلاد الويكاند", TODAY).country).toMatchObject({ status: "INFERENCE" });
    expect(extractIntent("نمشي للبلاد الويكاند", TODAY).horizon?.start).toBe("2026-10-03");
  });

  test("renting a car is a need, not the travel mode; no car is no car", () => {
    const rental = extractIntent("بغيت كراء طوموبيل فمراكش", TODAY);
    expect(rental.mode).toBeUndefined();
    expect(rental.needs.map((n) => n.value)).toEqual(["car_rental"]);
    expect(extractIntent("ما عنديش طوموبيل بغيت نمشي لفاس", TODAY).mode).toBeUndefined();
  });

  test("money only when a transfer is meant", () => {
    expect(extractIntent("بغيت نصيفط الفلوس لماما فوجدة", TODAY).needs.map((n) => n.value)).toEqual(["money"]);
  });

  test.each(["وقت صلاة المغرب", "من المغرب لباريس", "عندي تلات ولاد"])("nothing invented: %s", (sentence) => {
    const f = extractIntent(sentence, TODAY);
    expect(f.country).toBeUndefined();
    expect(f.horizon).toBeUndefined();
  });
});

describe("the traveller's state", () => {
  test("phase, the steps that fit the mode, and the next one", () => {
    const state = journeyState({ dateVoyage: "2026-10-03", modeTransport: "car" }, new Set(["passport", "cnr"]), TODAY, "fr");
    expect(state.phase).toBe("preparer");
    expect(state.daysUntilDeparture).toBe(4);
    expect(state.steps.map((s) => s.id)).toEqual(["passport", "insurance", "medicines", "cnr", "driver-license", "cte", "ferry-ticket"]);
    expect(state.done).toBe(2);
    expect(state.next?.id).toBe("insurance");
  });

  test("no date yet: the trip is still being defined", () => {
    expect(journeyState({ dateVoyage: null, modeTransport: "plane" }, new Set(), TODAY, "fr").phase).toBe("mon-voyage");
  });

  test("what the user ticked goes last in the Magic Button, marked as done", () => {
    const done = doneActions(new Set(["flight-ticket"]), "plane");
    expect(done).toEqual(["flight"]);
    const { actions } = plan("Je veux aller au Maroc ce week-end", { done });
    expect(actions.map((a) => a.kind)).toEqual(["papers", "sim", "money", "flight"]);
    expect(actions[3]).toMatchObject({ done: true, reason: expect.stringMatching(/^Déjà coché dans votre checklist\./) });
  });

  test("papers are done only when every document for the mode is ticked", () => {
    expect(doneActions(new Set(["passport", "insurance"]), "plane")).toEqual(["papers"]);
    expect(doneActions(new Set(["passport", "insurance"]), "car")).toEqual([]);
  });
});
