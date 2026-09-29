import { extractIntent } from "../lib/lab/intentFacts";
import { evidenceIsSaid } from "../lib/lab/intentBench";
import { missingChoices, planNextActions, type PlanOptions } from "../lib/lab/nextBestAction";
import type { PartnerCatalogueEntry } from "../lib/partnerCatalogue";
import { ROUTE_PAGES } from "../lib/routePages";

const TODAY = "2026-09-29";
const partners: PartnerCatalogueEntry[] = [{
  id: "travelpayouts-flights", name: "Travelpayouts · Vols", category: "flight", description: "", status: "active",
  affiliateUrl: "https://aviasales.tp.st/test", publicUrl: "https://www.travelpayouts.com/", envVar: "X", commissionNote: "",
}];
const routes = ROUTE_PAGES.routes.map(({ slug, originCity, destinationCity }) => ({ slug, originCity, destinationCity }));
const options: PlanOptions = { partners, routes, today: TODAY, lang: "fr" };
const plan = (sentence: string) => planNextActions(extractIntent(sentence, TODAY), options);
const kinds = (sentence: string) => plan(sentence).actions.map((a) => a.kind);

describe("return trips (Morocco → Europe) are never planned as an outbound trip", () => {
  test.each([
    ["Je rentre du Maroc à Bruxelles dimanche", undefined, "Bruxelles"],
    ["je dois rentrer de Nador vers Amsterdam en août", "Nador", "Amsterdam"],
    ["retour Casablanca Paris le 30 août", "Casablanca", "Paris"],
    ["kanrje3 men Tanja l Lyon ghedda", "Tanger", "Lyon"],
    ["I'm flying back from Marrakech to London tomorrow", "Marrakech", undefined],
  ])("%s", (sentence, origin, to) => {
    const facts = extractIntent(sentence, TODAY);
    expect(facts.direction?.value).toBe("return");
    expect(facts.direction?.to).toBe(to);
    expect(facts.origin?.value.label).toBe(origin);
    expect(facts.destination).toBeUndefined();
    const p = plan(sentence);
    expect(p.notes).toHaveLength(1);
    expect(p.actions.map((a) => a.kind)).toEqual(["flight"]);
    expect(p.actions[0].reason).toMatch(/^Retour/);
    expect(p.actions.some((a) => ["papers", "sim", "money"].includes(a.kind))).toBe(false);
    expect(evidenceIsSaid(sentence, facts)).toBe(true);
    expect(missingChoices(facts, "fr")).toEqual([]);
  });

  test("a car return offers the route planner, not a flight", () => {
    expect(kinds("retour Casablanca Paris en voiture")).toEqual(["route"]);
  });

  test("going home to Morocco is still an outbound trip", () => {
    for (const s of ["je rentre au bled en août", "nrje3 l Nador ghedda", "je rentre à Nador depuis Paris", "ana f Paris w bghit nrje3 l Nador"]) {
      expect(extractIntent(s, TODAY).direction).toBeUndefined();
    }
    expect(kinds("je rentre à Nador depuis Paris")).toContain("papers");
  });

  test("a trip inside Morocco is not a return", () => {
    expect(extractIntent("comment aller de Casablanca à Marrakech demain", TODAY).direction).toBeUndefined();
    expect(extractIntent("bghit nmshi men Fes l Chefchaouen", TODAY).direction).toBeUndefined();
  });
});

describe("a memory is not a plan", () => {
  test.each(["hier je suis allé à Nador", "l'année dernière à Marrakech c'était génial", "last summer we went to Tangier"])("%s", (sentence) => {
    const p = plan(sentence);
    expect(extractIntent(sentence, TODAY).past).toBeDefined();
    expect(p.actions).toEqual([]);
    expect(p.notes).toHaveLength(1);
  });

  test.each([
    "hier j'ai vu un vol pas cher, je veux aller à Tanger",
    "l'année dernière on est allés à Nador, cette année on repart à Nador en août",
    "hier je suis allé à Nador et je repars demain",
  ])("a wish or a future date wins: %s", (sentence) => {
    expect(extractIntent(sentence, TODAY).past).toBeUndefined();
    expect(kinds(sentence).length).toBeGreaterThan(0);
  });
});

describe("cities and modes the user rules out", () => {
  test("« pas à Marrakech » is not the destination", () => {
    expect(extractIntent("finalement je pars à Casablanca pas à Marrakech", TODAY).destination?.value.label).toBe("Casablanca");
    expect(extractIntent("Tanger non plutôt Nador", TODAY).destination?.value.label).toBe("Nador");
    expect(extractIntent("pas cher marrakech week end", TODAY).destination?.value.label).toBe("Marrakech");
  });

  test("a car that is broken down is not the mode", () => {
    expect(extractIntent("ma voiture est en panne, comment aller à Fès demain", TODAY).mode).toBeUndefined();
    expect(extractIntent("je vais à Fès en voiture", TODAY).mode?.value).toBe("car");
  });

  test("two modes offered are no mode chosen, and RME asks", () => {
    for (const s of ["en avion ou en voiture vers Oujda, je sais pas", "ferry ou avion pour Al Hoceima"]) {
      const facts = extractIntent(s, TODAY);
      expect(facts.mode).toBeUndefined();
      expect(missingChoices(facts, "fr").some((row) => row.field === "mode")).toBe(true);
    }
    expect(extractIntent("avion jusqu'à Nador puis louer une voiture", TODAY).mode?.value).toBe("plane");
  });
});

describe("the departure city is read where it is said without « depuis »", () => {
  test.each([
    ["mon vol est annulé, je suis à Paris et je dois aller à Marrakech", "Paris"],
    ["salam bghit vol Paris Casablanca next week", "Paris"],
    ["Paris Tanger vendredi", "Paris"],
    ["ana f Paris w bghit nrje3 l Nador", "Paris"],
  ])("%s", (sentence, origin) => {
    const facts = extractIntent(sentence, TODAY);
    expect(facts.origin?.value.label).toBe(origin);
    expect(evidenceIsSaid(sentence, facts)).toBe(true);
  });

  test("no departure is invented", () => {
    expect(extractIntent("Tanger cet été", TODAY).origin).toBeUndefined();
    expect(extractIntent("je vais voir Martin à Lille", TODAY).origin).toBeUndefined();
  });
});

describe("a cancelled trip is not planned", () => {
  test.each([
    "je voulais aller à Nador mais finalement je reste à Paris",
    "je ne pars plus à Tanger",
    "voyage à Marrakech annulé",
    "ma nbghich nmshi l Tanja",
    "on n'y va pas au Maroc cette année",
  ])("%s", (sentence) => {
    const facts = extractIntent(sentence, TODAY);
    expect(facts.cancelled).toBeDefined();
    expect(plan(sentence).actions).toEqual([]);
    expect(plan(sentence).notes).toHaveLength(1);
    expect(evidenceIsSaid(sentence, facts)).toBe(true);
    expect(missingChoices(facts, "fr")).toEqual([]);
  });

  test.each([
    "mon vol est annulé, je suis à Paris et je dois aller à Marrakech",
    "hôtel à Marrakech avec annulation gratuite",
    "je ne vais plus en voiture, je prends l'avion pour Nador",
    "je ne pars pas en voiture, je prends l'avion pour Nador",
    "je veux aller à Tanger, le voyage de l'an dernier a été annulé",
  ])("a real plan is kept: %s", (sentence) => {
    expect(extractIntent(sentence, TODAY).cancelled).toBeUndefined();
    expect(kinds(sentence).length).toBeGreaterThan(0);
  });
});

describe("dates written with digits", () => {
  test.each([
    ["on part à Nador le 15/08", { month: 8, day: 15 }],
    ["je pars le 15/08/2027 à Tanger", { month: 8, day: 15, year: 2027 }],
    ["départ le 15.08.2027 pour Oujda", { month: 8, day: 15, year: 2027 }],
    ["départ le 15-08-27 pour Oujda", { month: 8, day: 15, year: 2027 }],
  ])("%s", (sentence, when) => {
    const facts = extractIntent(sentence, TODAY);
    expect(facts.when?.value).toEqual(when);
    expect(evidenceIsSaid(sentence, facts)).toBe(true);
  });

  test("an impossible date is flagged, not planned as a real one", () => {
    expect(plan("je pars le 31/09 à Tanger").notes).toEqual(["Cette date n’existe pas dans le calendrier : vérifiez-la."]);
  });

  test.each([
    "valise de 1.5 kg pour Tanger", "on part 3-4 jours à Nador", "2 sur 3/4 places pour Tanger", "je veux aller à 2026-13-45",
    "10/12 personnes à Tanger", "le 15/13 à Nador", "le 32/01 à Nador", "Nador le 12/25",
  ])("not a date: %s", (sentence) => {
    expect(extractIntent(sentence, TODAY).when).toBeUndefined();
  });
});

describe("two cities offered are no destination chosen", () => {
  test("« Tanger ou Nador » picks neither", () => {
    for (const s of ["Tanger ou Nador ?", "je vais à Tanger ou à Nador", "Tanja wla Nador"]) {
      expect(extractIntent(s, TODAY).destination).toBeUndefined();
    }
  });

  test("only two cities are an alternative", () => {
    expect(extractIntent("Paris ou Lyon puis Tanger", TODAY).destination?.value.label).toBe("Tanger");
    expect(extractIntent("Tanger en juillet ou en août", TODAY).destination?.value.label).toBe("Tanger");
    expect(extractIntent("de Nador à Tanger ou en voiture", TODAY).destination?.value.label).toBe("Tanger");
  });
});

describe("« Casa » is Casablanca, but only as a place", () => {
  test("after a place word", () => {
    expect(extractIntent("on part à Casa en août", TODAY).destination?.value.label).toBe("Casablanca");
    expect(extractIntent("vol pour Casa demain", TODAY).destination?.value.label).toBe("Casablanca");
  });
  test("not the Spanish word for house", () => {
    expect(extractIntent("quiero una casa grande en agosto", TODAY).destination).toBeUndefined();
    expect(extractIntent("la casa de mi madre", TODAY).destination).toBeUndefined();
  });
});

describe("known limits, kept visible", () => {
  test("a bare « Tanger Paris » is ambiguous and stays read as a trip to Tanger", () => {
    const facts = extractIntent("Tanger Paris", TODAY);
    expect(facts.destination?.value.label).toBe("Tanger");
    expect(facts.direction).toBeUndefined();
  });

  test("a multi-stop trip keeps only its last Moroccan city", () => {
    expect(extractIntent("Paris Tanger puis Chefchaouen puis Fès", TODAY).destination?.value.label).toBe("Fès");
  });
});
