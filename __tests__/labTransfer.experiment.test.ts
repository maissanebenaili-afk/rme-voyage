/**
 * Experiment, outside the product: is "state -> unknowns -> best question -> new state -> action"
 * more than a travel trick? Two tests.
 *
 * 1. KERNEL. A generic ranking of questions (10 lines) is run on RME, through its own parser and
 *    planner without changing them, and must reproduce rankedChoices() exactly. If it does, the
 *    mechanism is separable from travel.
 * 2. SECOND DOMAIN. Eligibility to business aids, on a synthetic model (only aid 1 paraphrases real
 *    rules, the French Tech Nova rules read on 2026-09-29; the other 7 are invented). All 2592
 *    applicant profiles are enumerated. Three ways to help are compared: a long list of everything,
 *    questions in a fixed order, questions ranked by the kernel. Nothing here touches RME or a real file.
 */
import { extractIntent } from "../lib/lab/intentFacts";
import { missingChoices, planNextActions, rankedChoices, type MagicAction, type PlanOptions } from "../lib/lab/nextBestAction";
import type { PartnerCatalogueEntry } from "../lib/partnerCatalogue";
import { ROUTE_PAGES } from "../lib/routePages";

// ---------------------------------------------------------------- the generic kernel
type Question<A> = { id: string; answers: A[] };

/** Rank questions by how much the plan changes, on average, over their possible answers. Stable on ties. */
function rankQuestions<S, P, A>(
  state: S, questions: Question<A>[], apply: (s: S, id: string, a: A) => S, plan: (s: S) => P, distance: (a: P, b: P) => number,
): Array<{ id: string; gain: number }> {
  const base = plan(state);
  return questions
    .map((q, i) => ({ id: q.id, i, gain: q.answers.reduce((sum, a) => sum + distance(base, plan(apply(state, q.id, a))), 0) / q.answers.length }))
    .sort((x, y) => y.gain - x.gain || x.i - y.i)
    .map(({ id, gain }) => ({ id, gain }));
}

// ---------------------------------------------------------------- test 1: the kernel on RME
const TODAY = "2026-09-29";
const partners: PartnerCatalogueEntry[] = [{
  id: "travelpayouts-flights", name: "TP", category: "flight", description: "", status: "active",
  affiliateUrl: "https://aviasales.tp.st/test", publicUrl: "https://www.travelpayouts.com/", envVar: "X", commissionNote: "",
}];
const routes = ROUTE_PAGES.routes.map(({ slug, originCity, destinationCity }) => ({ slug, originCity, destinationCity }));
const options: PlanOptions = { partners, routes, today: TODAY, lang: "fr" };
const actionKey = (a: MagicAction) => `${a.kind}|${a.href ?? ""}|${a.reason}`;
const actionsDistance = (a: MagicAction[], b: MagicAction[]) => {
  let changed = Math.abs(a.length - b.length);
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (actionKey(a[i]) !== actionKey(b[i])) changed++;
  return changed;
};

const SENTENCES = [
  "Je pars demain", "Je veux partir en août", "Tanger ou Nador ?", "Nador en août", "Je vais à Tanger samedi", "Paris Nador en avion",
  "de Bruxelles à Al Hoceima en voiture", "Bruxelles Tanger en août", "en avion ou en voiture vers Oujda", "hôtel et voiture à Marrakech en août",
  "On part à Tanger avec les enfants en juillet", "bghit nmshi l Nador ghedda", "bghit nmshi ghedda", "بغيت نمشي لطنجة نهار السبت",
  "bghit nmshi l Tanja b l-babor", "envoyer de l'argent à ma mère au Maroc", "carte SIM pour le Maroc", "Marrakech", "je veux aller au bled",
  "Paris Tanger en avion samedi", "Tanger non plutôt Nador en août depuis Paris",
];

describe("kernel", () => {
  test("the generic kernel reproduces RME's own question ranking on every sentence", () => {
    for (const sentence of SENTENCES) {
      const trimmed = sentence.replace(/[\s.!?]+$/, "");
      const parse = (s: string) => extractIntent(s, TODAY);
      const rows = missingChoices(parse(trimmed), "fr");
      const ranked = rankQuestions(
        trimmed,
        rows.map((r) => ({ id: r.field, answers: r.options.map((o) => o.append) })),
        (s, _id, append) => s + append,
        (s) => planNextActions(parse(s), options).actions,
        actionsDistance,
      );
      const expected = rankedChoices(sentence, options, 99).map((r) => ({ id: r.field, gain: r.gain }));
      expect(ranked).toEqual(expected);
    }
  });
});

// ---------------------------------------------------------------- test 2: a second domain
type Attr = "age" | "form" | "rev" | "emp" | "sector" | "funded" | "recognized" | "region" | "diversity";
const DOMAIN: Record<Attr, string[]> = {
  age: ["<1an", "1-3ans", ">3ans"], form: ["societe", "micro/EI"], rev: ["<50k", ">=50k"], emp: ["<10", "10-49", ">=50"],
  sector: ["tech", "conseil", "autre"], funded: ["oui", "non"], recognized: ["oui", "non"], region: ["IDF", "PdL", "autre"], diversity: ["oui", "non"],
};
const ATTRS = Object.keys(DOMAIN) as Attr[];
type Known = Partial<Record<Attr, string>>;
type Tri = true | false | undefined; // undefined = unknown (Kleene logic)

const is = (a: Attr, ...values: string[]) => (k: Known): Tri => (k[a] === undefined ? undefined : values.includes(k[a]!));
const all = (...ps: Array<(k: Known) => Tri>) => (k: Known): Tri => {
  const r = ps.map((p) => p(k));
  return r.includes(false) ? false : r.every((x) => x === true) ? true : undefined;
};
const atLeast = (n: number, ...ps: Array<(k: Known) => Tri>) => (k: Known): Tri => {
  const r = ps.map((p) => p(k));
  const yes = r.filter((x) => x === true).length;
  const no = r.filter((x) => x === false).length;
  return yes >= n ? true : no > ps.length - n ? false : undefined;
};

// Aid 1 paraphrases the real French Tech Nova rules (seniority, legal form, size, tech, 2 of 3, diversity).
const AIDS: Array<{ name: string; rule: (k: Known) => Tri; atoms: number }> = [
  { name: "A1 accompagnement national (règles réelles paraphrasées)", atoms: 8, rule: all(is("age", "1-3ans", ">3ans"), is("form", "societe"), is("emp", "<10", "10-49"), is("sector", "tech"), is("diversity", "oui"), atLeast(2, is("rev", ">=50k"), is("funded", "oui"), is("recognized", "oui"))) },
  { name: "A2 prêt d'honneur création (inventée)", atoms: 2, rule: all(is("age", "<1an", "1-3ans"), is("emp", "<10")) },
  { name: "A3 aide régionale IDF (inventée)", atoms: 3, rule: all(is("region", "IDF"), is("emp", "<10", "10-49"), is("sector", "tech", "autre")) },
  { name: "A4 aide régionale PdL (inventée)", atoms: 2, rule: all(is("region", "PdL"), is("form", "societe")) },
  { name: "A5 bourse innovation (inventée)", atoms: 3, rule: all(is("sector", "tech"), is("age", "<1an"), is("funded", "non")) },
  { name: "A6 accompagnement diversité (inventée)", atoms: 2, rule: all(is("diversity", "oui"), is("age", "<1an", "1-3ans")) },
  { name: "A7 prêt croissance (inventée)", atoms: 3, rule: all(is("rev", ">=50k"), is("emp", "10-49"), is("funded", "non")) },
  { name: "A8 concours innovation (inventée)", atoms: 2, rule: all(is("sector", "tech"), is("recognized", "oui")) },
];
const statuses = (k: Known) => AIDS.map((a) => a.rule(k));
const decided = (k: Known) => statuses(k).every((s) => s !== undefined);

function profiles(): Known[] {
  let out: Known[] = [{}];
  for (const a of ATTRS) out = out.flatMap((p) => DOMAIN[a].map((v) => ({ ...p, [a]: v })));
  return out;
}

/** Minimum number of facts that settle every aid for this profile, knowing everything in hindsight. */
function oracleMin(p: Known): number {
  for (let size = 0; size <= ATTRS.length; size++) {
    const subsets = (function* pick(from: number, left: number, chosen: Attr[]): Generator<Attr[]> {
      if (left === 0) { yield chosen; return; }
      for (let i = from; i < ATTRS.length; i++) yield* pick(i + 1, left - 1, [...chosen, ATTRS[i]]);
    })(0, size, []);
    for (const s of subsets) {
      const known: Known = {};
      for (const a of s) known[a] = p[a];
      if (decided(known)) return size;
    }
  }
  return ATTRS.length;
}

type Policy = "fixed" | "kernel";
function ask(p: Known, policy: Policy): { questions: number; final: Tri[] } {
  const known: Known = {};
  while (!decided(known)) {
    const unknown = ATTRS.filter((a) => known[a] === undefined);
    let next: Attr;
    if (policy === "fixed") next = unknown[0];
    else {
      const ranked = rankQuestions<Known, Tri[], string>(
        known, unknown.map((a) => ({ id: a, answers: DOMAIN[a] })), (s, id, v) => ({ ...s, [id]: v }), statuses,
        (x, y) => x.filter((v, i) => v !== y[i]).length,
      );
      next = ranked[0].id as Attr;
    }
    known[next] = p[next];
  }
  return { questions: ATTRS.length - ATTRS.filter((a) => known[a] === undefined).length, final: statuses(known) };
}

describe("second domain: eligibility to business aids (synthetic)", () => {
  const all2592 = profiles();
  const oracle = all2592.map(oracleMin);
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

  test("measure", () => {
    const fixed = all2592.map((p) => ask(p, "fixed"));
    const kernel = all2592.map((p) => ask(p, "kernel"));
    const truth = all2592.map((p) => statuses(p));
    // Every way to help must give the same, correct answer.
    fixed.forEach((r, i) => expect(r.final).toEqual(truth[i]));
    kernel.forEach((r, i) => expect(r.final).toEqual(truth[i]));

    const listAtoms = AIDS.reduce((s, a) => s + a.atoms, 0);
    const result = {
      profiles: all2592.length,
      listItemsRead: listAtoms,
      listFactsToEstablish: ATTRS.length,
      fixedQuestions: mean(fixed.map((r) => r.questions)),
      kernelQuestions: mean(kernel.map((r) => r.questions)),
      oracleQuestions: mean(oracle),
      kernelBeatsFixed: kernel.filter((r, i) => r.questions < fixed[i].questions).length,
      fixedBeatsKernel: fixed.filter((r, i) => r.questions < kernel[i].questions).length,
      kernelWithinOracle: kernel.filter((r, i) => r.questions === oracle[i]).length,
      kernelWorstCase: Math.max(...kernel.map((r) => r.questions)),
      fixedWorstCase: Math.max(...fixed.map((r) => r.questions)),
      aidsEligibleOnAverage: mean(truth.map((t) => t.filter(Boolean).length)),
    };
    console.log("TRANSFER " + JSON.stringify(result, null, 1));

    // The advantage that was measured, kept as a floor.
    expect(result.kernelQuestions).toBeLessThan(result.fixedQuestions);
    expect(result.fixedQuestions).toBeLessThan(result.listFactsToEstablish);
    expect(result.fixedBeatsKernel).toBeLessThan(result.kernelBeatsFixed);
  });
});
