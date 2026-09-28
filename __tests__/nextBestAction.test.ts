import { extractIntent } from "../lib/lab/intentFacts";
import { describeFacts, missingChoices, planNextActions, type PlanOptions } from "../lib/lab/nextBestAction";
import type { PartnerCatalogueEntry } from "../lib/partnerCatalogue";

const MONDAY = "2026-09-28";

function partner(id: string, active: boolean): PartnerCatalogueEntry {
  return {
    id,
    name: id,
    category: "flight",
    description: "",
    status: active ? "active" : "pending",
    ...(active ? { affiliateUrl: `https://${id}.tp.st/abc` } : {}),
    publicUrl: `https://example.com/${id}`,
    envVar: "X",
    commissionNote: "",
  };
}

// Production on 28/09/2026: only the flight link is active.
const PRODUCTION = [partner("travelpayouts-flights", true), partner("travelpayouts-hotels", false), partner("travelpayouts-car", false), partner("esim-morocco", false)];
const ROUTES = [{ slug: "paris-tanger", originCity: "Paris", destinationCity: "Tanger" }];
const options = (overrides: Partial<PlanOptions> = {}): PlanOptions => ({ partners: PRODUCTION, routes: ROUTES, today: MONDAY, lang: "fr", ...overrides });
const plan = (sentence: string, overrides: Partial<PlanOptions> = {}) => planNextActions(extractIntent(sentence, MONDAY), options(overrides));

describe("Next Best Action", () => {
  test("reference sentence: papers first (departure in 5 days), then the active flight link", () => {
    const { actions } = plan("Je veux aller au Maroc ce week-end.");
    expect(actions.map((a) => a.kind)).toEqual(["papers", "flight", "sim", "money"]);
    expect(actions[0]).toMatchObject({ href: "/#preparer", reason: "Départ dans 5 jours : passeport, CIN." });
    expect(actions[1]).toMatchObject({
      href: "https://travelpayouts-flights.tp.st/abc",
      partner: { id: "travelpayouts-flights" },
      reason: "Vers le Maroc, du samedi 3 au dimanche 4 octobre.",
    });
  });

  test("a need said out loud comes first and quotes the user; a pending partner is not bookable", () => {
    const { actions } = plan("Il faut que je trouve un hôtel à Marrakech.");
    expect(actions.map((a) => a.kind)).toEqual(["hotel", "flight", "papers", "sim", "money"]);
    expect(actions[0].href).toBeUndefined();
    expect(actions[0].partner).toBeUndefined();
    expect(actions[0].reason).toBe("Vous avez dit « hôtel ». Pas encore de partenaire hôtel vérifié dans RME.");
  });

  test("the same need becomes bookable as soon as its link is active", () => {
    const partners = PRODUCTION.map((p) => (p.id === "travelpayouts-hotels" ? partner(p.id, true) : p));
    const hotel = plan("Il faut que je trouve un hôtel à Marrakech.", { partners }).actions[0];
    expect(hotel).toMatchObject({ href: "https://travelpayouts-hotels.tp.st/abc", reason: "Vous avez dit « hôtel ». Pour dormir à Marrakech." });
  });

  test("by car from Paris: the /trajet page replaces the flight", () => {
    const { actions } = plan("Je rentre à Tanger en août avec les enfants, en voiture depuis Paris");
    expect(actions.map((a) => a.kind)).toEqual(["route", "papers", "sim", "money"]);
    expect(actions[0]).toMatchObject({ href: "/trajet/paris-tanger", reason: "En voiture depuis Paris : distance, péages, carburant et ferry." });
    expect(actions[1].reason).toBe("La liste avant le départ : passeport, CIN, papiers de la voiture.");
  });

  test("the order depends on the facts, never on which partners are active", () => {
    const sentences = ["Je veux aller au Maroc ce week-end.", "Il faut que je trouve un hôtel à Marrakech.", "un vol pour Nador, puis louer une voiture"];
    const allActive = PRODUCTION.map((p) => partner(p.id, true));
    for (const s of sentences) {
      expect(plan(s, { partners: allActive }).actions.map((a) => a.kind)).toEqual(plan(s, { partners: [] }).actions.map((a) => a.kind));
    }
  });

  test("an affiliate link only ever comes from an active partner", () => {
    for (const s of ["Maroc ce week-end", "hôtel à Fès", "louer une voiture à Agadir", "Nador demain en ferry"]) {
      for (const a of plan(s).actions) {
        if (a.partner) expect(PRODUCTION.find((p) => p.id === a.partner!.id)?.status).toBe("active");
        expect(plan(s).actions.length).toBeLessThanOrEqual(5);
      }
    }
  });

  test("Omra: the official-source note and a flight, nothing administrative", () => {
    const result = plan("Préparer une omra depuis Lyon en mars");
    expect(result.notes).toEqual(["Omra et Hajj : formalités uniquement auprès de la source officielle."]);
    expect(result.actions.map((a) => a.kind)).toEqual(["flight"]);
  });

  test("nothing understood, nothing proposed", () => {
    expect(plan("bonjour")).toEqual({ actions: [], notes: [] });
  });

  test("Darija", () => {
    const { actions } = plan("bghit nmshi l bled had l weekend", { lang: "da" });
    expect(actions[0].reason).toBe("B9aw 5 ayyam l-safar: passport, CIN.");
    expect(actions[1].reason).toBe("L l-Maghrib, mn sebt 3 l l7ed 4 oktobr.");
  });
});

describe("the « J'ai compris » card", () => {
  test("each fact carries the user's words; the deduced date is flagged", () => {
    const f = extractIntent("Je veux aller au Maroc ce week-end.", MONDAY);
    expect(describeFacts(f, "fr", MONDAY)).toEqual([
      { text: "Maroc", evidence: "Maroc", inferred: false },
      { text: "Du samedi 3 au dimanche 4 octobre", evidence: "ce week-end", inferred: true },
    ]);
  });

  test("a year is shown only when it is not this year", () => {
    const f = extractIntent("Maroc cet été", MONDAY);
    expect(describeFacts(f, "fr", MONDAY)[1].text).toBe("Du jeudi 1 juillet au mardi 31 août 2027");
  });

  test("missing rows: tapping a choice is enough for the parser to read it", () => {
    const sentence = "Je veux aller à Taza";
    const rows = missingChoices(extractIntent(sentence, MONDAY), "fr");
    expect(rows.map((r) => r.field)).toEqual(["origin", "when"]);
    const completed = extractIntent(sentence + rows[0].options[1].append + rows[1].options[0].append, MONDAY);
    expect(completed.origin?.value.label).toBe("Bruxelles");
    expect(completed.horizon?.start).toBe("2026-10-03");
  });

  test("the Darija choices are read too", () => {
    const rows = missingChoices(extractIntent("bghit nmshi l Taza", MONDAY), "da");
    const completed = extractIntent("bghit nmshi l Taza" + rows[0].options[0].append + rows[1].options[2].append, MONDAY);
    expect(completed.origin?.value.label).toBe("Paris");
    expect(completed.when?.value.month).toBe(8);
  });
});
