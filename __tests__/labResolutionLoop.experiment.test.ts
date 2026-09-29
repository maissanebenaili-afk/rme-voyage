/**
 * Experiment (report only, product code untouched): does RME already run a resolution loop?
 * sentence -> facts -> unknown -> question -> answer -> facts -> action -> saved state.
 * Each scenario carries a hidden truth; a synthetic user taps the option that matches it.
 */
import { extractIntent, type IntentFacts } from "../lib/lab/intentFacts";
import { describeFacts, departureDate, missingChoices, planNextActions, rankedChoices, type PlanOptions } from "../lib/lab/nextBestAction";
import { journeyState } from "../lib/lab/journeyState";
import type { PartnerCatalogueEntry } from "../lib/partnerCatalogue";
import { ROUTE_PAGES } from "../lib/routePages";

const TODAY = "2026-09-29";
const partners: PartnerCatalogueEntry[] = [{
  id: "travelpayouts-flights", name: "TP", category: "flight", description: "", status: "active",
  affiliateUrl: "https://aviasales.tp.st/test", publicUrl: "https://www.travelpayouts.com/", envVar: "X", commissionNote: "",
}];
const routes = ROUTE_PAGES.routes.map(({ slug, originCity, destinationCity }) => ({ slug, originCity, destinationCity }));
const options: PlanOptions = { partners, routes, today: TODAY, lang: "fr" };

type Truth = { dest?: string; origin?: string; when?: string; mode?: "Avion" | "Voiture" | "Ferry" };
type S = { id: string; group: string; s: string; truth?: Truth; terminal?: "cancel" | "past" | "return" };
const SCENARIOS: S[] = [
  { id: "01", group: "destination inconnue", s: "Je pars demain", truth: { dest: "Tanger", origin: "Paris", mode: "Avion" } },
  { id: "02", group: "destination inconnue", s: "Je veux partir en août", truth: { dest: "Nador", origin: "Bruxelles", mode: "Voiture" } },
  { id: "03", group: "deux destinations", s: "Tanger ou Nador ?", truth: { dest: "Nador", origin: "Paris", when: "En août", mode: "Avion" } },
  { id: "04", group: "origine inconnue", s: "Nador en août", truth: { origin: "Paris", mode: "Avion" } },
  { id: "05", group: "origine hors choix", s: "Je vais à Tanger samedi", truth: { origin: "Lyon", mode: "Avion" } },
  { id: "06", group: "date inconnue", s: "Paris Nador en avion", truth: { when: "En août" } },
  { id: "07", group: "date inconnue", s: "de Bruxelles à Al Hoceima en voiture", truth: { when: "En juillet" } },
  { id: "08", group: "mode inconnu", s: "Bruxelles Tanger en août", truth: { mode: "Ferry" } },
  { id: "09", group: "mode ambigu", s: "en avion ou en voiture vers Oujda", truth: { origin: "Paris", when: "En août", mode: "Voiture" } },
  { id: "10", group: "annulation", s: "Je ne pars plus à Tanger", terminal: "cancel" },
  { id: "11", group: "changement d'avis", s: "Tanger non plutôt Nador en août depuis Paris", truth: { mode: "Avion" } },
  { id: "12", group: "retour", s: "Je rentre du Maroc à Bruxelles dimanche", terminal: "return" },
  { id: "13", group: "retour", s: "Je dois rentrer en France demain", terminal: "return" },
  { id: "14", group: "hôtel + voiture", s: "hôtel et voiture à Marrakech en août", truth: { origin: "Paris", mode: "Avion" } },
  { id: "15", group: "famille", s: "On part à Tanger avec les enfants en juillet", truth: { origin: "Bruxelles", mode: "Voiture" } },
  { id: "16", group: "Darija", s: "bghit nmshi l Nador ghedda", truth: { origin: "Paris", mode: "Avion" } },
  { id: "17", group: "Darija sans lieu", s: "bghit nmshi ghedda", truth: { dest: "Nador", origin: "Paris", mode: "Avion" } },
  { id: "18", group: "arabe", s: "بغيت نمشي لطنجة نهار السبت", truth: { origin: "Paris", mode: "Avion" } },
  { id: "19", group: "translittération", s: "bghit nmshi l Tanja b l-babor", truth: { origin: "Paris", when: "En août" } },
  { id: "20", group: "transfert d'argent", s: "envoyer de l'argent à ma mère au Maroc", truth: { origin: "Paris", when: "En août", mode: "Avion" } },
  { id: "21", group: "SIM seule", s: "carte SIM pour le Maroc", truth: { origin: "Paris", when: "En août", mode: "Avion" } },
  { id: "22", group: "phrase complète", s: "Paris Tanger en avion samedi" },
  { id: "23", group: "souvenir", s: "hier je suis allé à Nador", terminal: "past" },
  { id: "24", group: "ville seule", s: "Marrakech", truth: { origin: "Paris", when: "En août", mode: "Avion" } },
  { id: "25", group: "pays seul", s: "je veux aller au bled", truth: { origin: "Bruxelles", when: "En juillet", mode: "Voiture" } },
  { id: "26", group: "interne Maroc", s: "comment aller de Casablanca à Marrakech demain", truth: {} },
];

const FIELD_OF: Record<string, keyof Truth> = { destination: "dest", origin: "origin", when: "when", mode: "mode" };
const uncertainty = (f: IntentFacts) => f.unknown.length + (f.alternatives ? 1 : 0);
const hrefCount = (f: IntentFacts) => planNextActions(f, options).actions.filter((a) => a.href).length;

function stateOf(f: IntentFacts) {
  const city = f.destination?.value.label ?? f.destinationGuess?.value.label;
  const trip = { dateVoyage: departureDate(f, TODAY) ?? "", modeTransport: f.mode?.value ?? ("" as never) };
  const saved = Boolean(city || f.country || trip.dateVoyage);
  return { saved, steps: saved ? journeyState(trip, new Set(), TODAY, "fr").steps.length : 0 };
}

const topAction = (f: IntentFacts) => { const a = planNextActions(f, options).actions[0]; return a ? `${a.kind}${a.href ? "" : "(nolink)"}` : "-"; };\n/** Semantic action identity for the Question Value Gate: reason text is deliberately ignored. */\nconst semanticActionKey = (a: { kind: string; href?: string; partner?: { id: string } }) => `${a.kind}|${a.href ?? ""}|${a.partner?.id ?? ""}`;\nconst semanticPlanKey = (f: IntentFacts) => planNextActions(f, options).actions.map(semanticActionKey).join("||");
type Row = { id: string; group: string; understood: number; known: number; unknown: string; q1: string; qCount: number; status: string; note: string; gain1: number; naturalGain1: number; uselessQ: number };

describe("resolution loop (report only)", () => {
  test("print", () => {
    const rows: Row[] = [];
    const qLog = { total: 0, unlocked: 0, changedTop: 0, refinedOnly: 0, nothing: 0, semanticChanged: 0, semanticNothing: 0 };
    for (const sc of SCENARIOS) {
      let sentence = sc.s;
      let f = extractIntent(sentence, TODAY);
      const understood = describeFacts(f, "fr", TODAY).length;
      const known = 5 - f.unknown.length;
      const unknown0 = f.unknown.join("+") || "-";
      const first = rankedChoices(sentence, options, 4);
      const natural = missingChoices(f, "fr");
      const naturalGain = natural.length ? first.find((r) => r.field === natural[0].field)?.gain ?? 0 : 0;
      const q1 = first[0]?.field ?? "-";
      const start = { hrefs: hrefCount(f), top: topAction(f) };
      const notes: string[] = [];
      let status = "";
      let qCount = 0;
      let uselessQ = 0;

      if (sc.terminal) {
        const p = planNextActions(f, options);
        const ok = sc.terminal === "cancel" ? f.cancelled && p.actions.length === 0 && p.notes.length === 1
          : sc.terminal === "past" ? f.past && p.actions.length === 0 && p.notes.length === 1
          : f.direction && p.actions.length === 1 && p.notes.length === 1 && missingChoices(f, "fr").length === 0;
        status = ok ? "TERMINAL_OK" : "RUPTURE:TERMINAL";
        rows.push({ id: sc.id, group: sc.group, understood, known, unknown: unknown0, q1, qCount, status, note: `state:${stateOf(f).saved ? "saved" : "no"}`, gain1: 0, naturalGain1: 0, uselessQ });
        continue;
      }

      for (let step = 0; step < 5; step++) {
        const ranked = rankedChoices(sentence, options, 4);
        if (ranked.length === 0) break;
        const top = ranked[0];
        const key = FIELD_OF[top.field];
        const want = sc.truth?.[key];
        if (top.gain === 0) uselessQ++;
        const option = top.options.find((o) => o.text === want);
        if (!want) { notes.push(`asks ${top.field} but truth silent`); status ||= "RUPTURE:QUESTION_NOT_NEEDED"; break; }
        if (!option) { notes.push(`tap impossible: ${want} not in [${top.options.map((o) => o.text).join("/")}]`); status ||= "RUPTURE:TAP_IMPOSSIBLE"; break; }
        const before = f;
        const topBefore = topAction(before);
        const hadAction = hrefCount(before) > 0;
        sentence = sentence.replace(/[\s.!?]+$/, "") + option.append;
        f = extractIntent(sentence, TODAY);
        qCount++;
        qLog.total++;
        if (!hadAction && hrefCount(f) > 0) qLog.unlocked++;
        else if (topAction(f) !== topBefore) qLog.changedTop++;
        else if (planNextActions(f, options).actions.map((a) => a.reason).join() !== planNextActions(before, options).actions.map((a) => a.reason).join()) qLog.refinedOnly++;
        else qLog.nothing++;
        if (uncertainty(f) >= uncertainty(before)) { notes.push(`no reduction after ${top.field}`); status ||= "RUPTURE:NO_REDUCTION"; }
        const ok = top.field === "destination" ? f.destination?.value.label === want
          : top.field === "origin" ? f.origin?.value.label === want
          : top.field === "when" ? Boolean(f.when || f.horizon)
          : f.mode?.value === ({ Avion: "plane", Voiture: "car", Ferry: "ferry" } as const)[want as "Avion"];
        if (!ok) { notes.push(`recompute wrong after ${top.field}`); status ||= "RUPTURE:WRONG_RECOMPUTE"; }
        for (const k of ["destination", "origin", "when", "mode"] as const) {
          if (before[k] && JSON.stringify(before[k]!.value) !== JSON.stringify(f[k]?.value) && k !== top.field) { notes.push(`lost ${k}`); status ||= "RUPTURE:CONTEXT_LOST"; }
        }
      }
      if (!status) {
        const p = planNextActions(f, options);
        const st = stateOf(f);
        if (p.actions.length === 0) status = "RUPTURE:NO_ACTION";
        else if (hrefCount(f) === 0) status = "RUPTURE:NO_LINK";
        else if (!st.saved) status = "RUPTURE:NO_STATE";
        else status = "CLOSED";
        notes.push(`start:${start.hrefs > 0 ? "action" : "NO-ACTION"}/${start.top} -> end:${topAction(f)} steps=${st.steps}`);
      }
      rows.push({ id: sc.id, group: sc.group, understood, known, unknown: unknown0, q1, qCount, status, note: notes.join(" | "), gain1: first[0]?.gain ?? 0, naturalGain1: naturalGain, uselessQ });
    }
    const line = (r: Row) => `${r.id} ${r.group.padEnd(20)} und=${r.understood} known=${r.known}/5 unk=${r.unknown.padEnd(24)} q1=${r.q1.padEnd(11)} nQ=${r.qCount} ${r.status.padEnd(28)} ${r.note}`;
    const withQ = rows.filter((r) => r.q1 !== "-");
    const tally: Record<string, number> = {};
    for (const r of rows) tally[r.status] = (tally[r.status] ?? 0) + 1;
    console.log(rows.map(line).join("\n") + "\n\nSTATUS " + JSON.stringify(tally) +
      `\nRANKED first-question gain avg=${(withQ.reduce((a, r) => a + r.gain1, 0) / withQ.length).toFixed(2)} vs NATURAL-order first gain avg=${(withQ.reduce((a, r) => a + r.naturalGain1, 0) / withQ.length).toFixed(2)} (n=${withQ.length})` +
      `\nQUESTIONS ${JSON.stringify(qLog)}` +\n      `\nSEMANTIC_NOTE: semanticChanged/semanticNothing ignore action reason text and compare kind|href|partner only` +
      `\nUSELESS questions (gain 0 asked first): ${rows.reduce((a, r) => a + r.uselessQ, 0)}`);
    // Floors of what was measured (2026-09-29). One rupture is known and kept visible: an origin outside the three one-tap cities.
    expect(tally.CLOSED).toBeGreaterThanOrEqual(21);
    expect(Object.keys(tally).filter((k) => k.startsWith("RUPTURE"))).toEqual(["RUPTURE:TAP_IMPOSSIBLE"]);
    expect(qLog.nothing).toBeLessThanOrEqual(13); // answers that change nothing visible: to bring down, never up
    expect(qLog.unlocked + qLog.changedTop).toBeGreaterThanOrEqual(9);
    expect(withQ.reduce((a, r) => a + r.gain1, 0)).toBeGreaterThanOrEqual(withQ.reduce((a, r) => a + r.naturalGain1, 0));
  });
});
