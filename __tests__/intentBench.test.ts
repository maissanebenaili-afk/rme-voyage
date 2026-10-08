import { extractIntent } from "../lib/lab/intentFacts";
import { benchCases, evidenceIsSaid, runBench } from "../lib/lab/intentBench";
import { departureDate, missingChoices, planNextActions, rankedChoices, type PlanOptions } from "../lib/lab/nextBestAction";
import type { PartnerCatalogueEntry } from "../lib/partnerCatalogue";
import { ROUTE_PAGES } from "../lib/routePages";

const TODAY = "2026-09-29";
const partners: PartnerCatalogueEntry[] = [{
  id: "travelpayouts-flights", name: "Travelpayouts · Vols", category: "flight", description: "", status: "active",
  affiliateUrl: "https://aviasales.tp.st/test", publicUrl: "https://www.travelpayouts.com/", envVar: "TRAVELPAYOUTS_FLIGHT_URL", commissionNote: "",
}];
const routes = ROUTE_PAGES.routes.map(({ slug, originCity, destinationCity }) => ({ slug, originCity, destinationCity }));
const options: PlanOptions = { partners, routes, today: TODAY, lang: "fr" };

describe("intent benchmark (210 generated sentences, 6 languages)", () => {
  const report = runBench(benchCases(), { today: TODAY, partners, routes });

  test("every « vous avez dit » is really in the sentence", () => {
    expect(report.evidenceViolations).toEqual([]);
  });

  test("coverage does not regress", () => {
    expect(report.cases).toBe(210);
    expect(report.exact / report.cases).toBeGreaterThanOrEqual(0.98);
    expect(report.actionable / report.cases).toBeGreaterThanOrEqual(0.98);
    for (const lang of ["fr", "da", "ar", "en", "nl"]) {
      expect(report.byLang[lang].exact).toBe(report.byLang[lang].cases);
    }
  });

  test("the known gap stays known: Spanish « mañana » is not read (it also means « morning »)", () => {
    expect(report.failures.map((f) => f.misses.join("+"))).toEqual(["when", "when"]);
    expect(report.failures.every((f) => f.sentence.includes("mañana"))).toBe(true);
  });

  test("evidence is the user's spelling, not RME's label", () => {
    const f = extractIntent("bghit nmshi l Tanja f ghusht", TODAY);
    expect(f.destination).toMatchObject({ value: { label: "Tanger" }, evidence: "Tanja" });
    expect(extractIntent("Je rentre à Tanger en août depuis Paris", TODAY).when?.evidence).toBe("août");
  });
});

describe("accident lab: odd inputs degrade gracefully", () => {
  test.each([
    "", "   ", "aide-moi", "???", "12345678901234567890", "Paris", "300 € pas cher", "je suis salé",
    "<script>alert(1)</script> Tanger", "✈️ Tanger 🔥 ghedda", "x".repeat(5000) + " Tanger",
    "Tanger non plutôt Nador", "en avion en voiture vers Nador", "l'Aïd au bled", "ما عنديش طوموبيل",
    "je veux aller à 2026-13-45", "bghit nmshi l Tanja ghedda b tomobil mn Paris w nkri tomobil",
  ])("%s", (sentence) => {
    const facts = extractIntent(sentence, TODAY);
    const plan = planNextActions(facts, options);
    expect(evidenceIsSaid(sentence, facts)).toBe(true);
    expect(plan.actions.length).toBeLessThanOrEqual(5);
    expect(plan.actions.every((a) => !a.partner || a.partner.id === "travelpayouts-flights")).toBe(true);
  });

  test("« le 31 février » is not rolled over to March: no date, and a note", () => {
    const facts = extractIntent("je pars le 31 février à Tanger", TODAY);
    expect(departureDate(facts, TODAY)).toBeUndefined();
    expect(planNextActions(facts, options).notes).toEqual(["Cette date n’existe pas dans le calendrier : vérifiez-la."]);
  });

  test("a date already gone is flagged", () => {
    expect(planNextActions(extractIntent("Tanger le 1er janvier 2020", TODAY), options).notes).toEqual(["La date indiquée est déjà passée : vérifiez-la."]);
  });

  test("the last city said wins: « Tanger non plutôt Nador »", () => {
    expect(extractIntent("Tanger non plutôt Nador", TODAY).destination?.value.label).toBe("Nador");
  });

  test("the Aïd gets no invented date", () => {
    const facts = extractIntent("l'Aïd au bled", TODAY);
    expect(facts.when).toBeUndefined();
    expect(facts.horizon).toBeUndefined();
  });
});

describe("the question that unlocks the most", () => {
  test("« je pars demain » with no place: where, first and alone", () => {
    expect(rankedChoices("je pars demain", options).map((r) => r.field)).toEqual(["destination"]);
  });

  test("« Vol pour Agadir »: how you travel changes the plan the most", () => {
    expect(rankedChoices("Vol pour Agadir", options)[0].field).toBe("mode");
  });

  test("ranking never asks less useful questions first than the fixed order", () => {
    const sentences = ["Je veux aller à Tanger", "Il me faut un hôtel à Marrakech", "Vol pour Agadir", "Je rentre au bled", "Ferry pour Tanger"];
    for (const s of sentences) {
      const ranked = rankedChoices(s, options, 4);
      const fixedFirst = missingChoices(extractIntent(s, TODAY), "fr")[0].field;
      expect(ranked[0].gain).toBeGreaterThanOrEqual(ranked.find((r) => r.field === fixedFirst)!.gain);
    }
  });

  test("at most two questions are shown", () => {
    expect(rankedChoices("Je veux aller à Tanger", options).length).toBe(2);
  });
});
