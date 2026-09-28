import { completeness } from "../lib/tripFacts";
import { extractIntent } from "../lib/lab/intentFacts";

// Monday 28 September 2026.
const MONDAY = "2026-09-28";
const SATURDAY = "2026-10-03";

describe("Magic Button — the reference sentences", () => {
  test("« Je veux aller au Maroc ce week-end. »: country said, weekend deduced", () => {
    const f = extractIntent("Je veux aller au Maroc ce week-end.", MONDAY);
    expect(f.country).toEqual({ value: "MA", status: "FACT_USER", evidence: "Maroc" });
    expect(f.horizon).toEqual({ said: "ce week-end", start: "2026-10-03", end: "2026-10-04", status: "INFERENCE" });
    expect([...f.unknown].sort()).toEqual(["mode", "origin", "travellers"]);
    expect(completeness(f)).toBe(0.4);
  });

  test("« le week-end prochain » said on a Monday is the coming weekend", () => {
    const f = extractIntent("On pourrait aller au Maroc le week-end prochain.", MONDAY);
    expect(f.country?.evidence).toBe("Maroc");
    expect(f.horizon).toMatchObject({ said: "week-end prochain", start: "2026-10-03", end: "2026-10-04" });
  });

  test("« samedi » is the next Saturday, and the children are kept", () => {
    const f = extractIntent("Hadak, je rentre au Maroc samedi avec les enfants", MONDAY);
    expect(f.horizon).toMatchObject({ said: "samedi", start: "2026-10-03", end: "2026-10-03" });
    expect(f.travellers?.value.children).toBe(true);
  });

  test("a named city wins over the country", () => {
    const f = extractIntent("Je veux aller à Taza.", MONDAY);
    expect(f.destination?.value.key).toBe("taza");
    expect(f.country).toBeUndefined();
    expect(f.needs).toEqual([]);
  });

  test("« hôtel » becomes a need, quoted with the user's own accent", () => {
    const f = extractIntent("Il faut que je trouve un hôtel à Marrakech.", MONDAY);
    expect(f.destination?.value.key).toBe("marrakech");
    expect(f.needs).toEqual([{ value: "hotel", status: "FACT_USER", evidence: "hôtel" }]);
  });

  test("a complete sentence is left as extractTripFacts reads it", () => {
    const f = extractIntent("Je rentre à Tanger en août avec les enfants, en voiture depuis Paris", MONDAY);
    expect(f.unknown).toEqual([]);
    expect(f.horizon).toBeUndefined();
    expect(f.needs).toEqual([]);
  });

  test("Darija « l bled had l weekend »: bled is RME's reading, so INFERENCE", () => {
    const f = extractIntent("bghit nmshi l bled had l weekend", MONDAY);
    expect(f.country).toEqual({ value: "MA", status: "INFERENCE", evidence: "bled" });
    expect(f.horizon).toMatchObject({ said: "had l weekend", start: "2026-10-03" });
  });
});

describe("relative dates", () => {
  test.each([
    ["demain", MONDAY, "2026-09-29", "2026-09-29"],
    ["après-demain", MONDAY, "2026-09-30", "2026-09-30"],
    ["ghedda", MONDAY, "2026-09-29", "2026-09-29"],
    ["dans 3 jours", MONDAY, "2026-10-01", "2026-10-01"],
    ["la semaine prochaine", MONDAY, "2026-10-05", "2026-10-11"],
    ["cette semaine", MONDAY, "2026-09-28", "2026-10-04"],
    ["ce week end", SATURDAY, "2026-10-03", "2026-10-04"],
    ["le week-end prochain", SATURDAY, "2026-10-10", "2026-10-11"],
    ["samedi", SATURDAY, "2026-10-10", "2026-10-10"],
    ["sebt", MONDAY, "2026-10-03", "2026-10-03"],
    ["cet été", MONDAY, "2027-07-01", "2027-08-31"],
    ["cet été", "2027-07-15", "2027-07-15", "2027-08-31"],
  ])("« %s » on %s → %s … %s", (phrase, today, start, end) => {
    const f = extractIntent(`Maroc ${phrase}`, today);
    expect(f.horizon).toMatchObject({ start, end, status: "INFERENCE" });
  });

  test("no date is invented when none is said, or when today is not a date", () => {
    expect(extractIntent("Je veux aller au Maroc", MONDAY).horizon).toBeUndefined();
    expect(extractIntent("Maroc demain", "not-a-date").horizon).toBeUndefined();
  });
});

describe("the country is not read where it is not a destination", () => {
  test.each([
    "Je reviens du Maroc demain",
    "depuis le Maroc vers Paris",
    "wa9t salat l-maghrib",
    "un vol Royal Air Maroc",
    "ma carte Maroc Telecom",
  ])("%s", (sentence) => {
    expect(extractIntent(sentence, MONDAY).country).toBeUndefined();
  });
});

describe("needs", () => {
  test("a transfer is a need; money mentioned in passing is not", () => {
    expect(extractIntent("je dois envoyer de l'argent à ma mère", MONDAY).needs.map((n) => n.value)).toEqual(["money"]);
    expect(extractIntent("comparer Wise et Western Union", MONDAY).needs.map((n) => n.value)).toEqual(["money"]);
    expect(extractIntent("je n'ai pas beaucoup d'argent", MONDAY).needs).toEqual([]);
  });

  test("several needs come out in the order they were said", () => {
    const f = extractIntent("un vol pour Nador, puis louer une voiture et une carte SIM", MONDAY);
    expect(f.needs.map((n) => n.value)).toEqual(["flight", "car_rental", "sim"]);
    expect(f.needs.every((n) => n.status === "FACT_USER")).toBe(true);
  });
});
