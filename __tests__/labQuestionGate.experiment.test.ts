/**
 * Experiment (product code untouched): which of RME's questions deserve to be asked?
 *
 * rankedChoices() scores a question by planDistance(), which compares kind + href + reason text, so a
 * changed sentence counts as a changed plan. Here every answer is classified by what really changes:
 *   UNLOCK   no link before, a link after
 *   ACTION   the actions differ in kind, link, partner or order (reason text ignored)
 *   STATE    the saved journey differs (phase, days, steps)
 *   VALIDITY the recommendation's content differs (car papers, car route versus ferry)
 *   PREFILL  only flight wording differs: it would matter if the flight link were pre-filled (PR #197)
 *   TEXT     only the wording differs
 *   NOTHING  identical
 * Then a gate decides BEFORE the answer, from the answers it could get:
 *   ASK    every possible answer changes something decision-relevant
 *   OFFER  some do, some only confirm the default: show the plan, offer the other answers
 *   DEFER  nothing today, but something once flight links are pre-filled
 *   SKIP   nothing
 * Run: npx jest __tests__/labQuestionGate.experiment.test.ts
 */
import { extractIntent, type IntentFacts } from "../lib/lab/intentFacts";
import { departureDate, planNextActions, rankedChoices, type MagicAction } from "../lib/lab/nextBestAction";
import { journeyState } from "../lib/lab/journeyState";
import { FIELD_OF, options, SCENARIOS, TODAY, type S } from "./fixtures/labScenarios";

type Impact = "UNLOCK" | "ACTION" | "STATE" | "VALIDITY" | "PREFILL" | "TEXT" | "NOTHING";
type Decision = "ASK" | "OFFER" | "DEFER" | "SKIP";
type Cfg = { prefill: boolean; stateCounts: boolean };
const meaningful = (i: Impact, cfg: Cfg) => i === "UNLOCK" || i === "ACTION" || i === "VALIDITY" || (cfg.stateCounts && i === "STATE");
// An impact that exists only if something downstream uses it (a pre-filled link, a saved journey).
const contingent = (i: Impact, cfg: Cfg) => i === "PREFILL" || (!cfg.stateCounts && i === "STATE");

const actions = (f: IntentFacts): MagicAction[] => planNextActions(f, options).actions;
const hrefs = (f: IntentFacts) => actions(f).filter((a) => a.href).length;

// With prefill, a flight link carries the origin and the date: they become part of the action itself.
const planKey = (f: IntentFacts, prefill: boolean) =>
  actions(f).map((a) => `${a.kind}|${a.href ?? ""}|${a.partner?.id ?? ""}${prefill && a.kind === "flight" ? `|${f.origin?.value.label ?? ""}|${departureDate(f, TODAY) ?? ""}` : ""}`).join("||");

function journeyKey(f: IntentFacts): string {
  const j = journeyState({ dateVoyage: departureDate(f, TODAY) ?? "", modeTransport: (f.mode?.value ?? "") as never }, new Set(), TODAY, "fr");
  return `${j.phase}|${j.daysUntilDeparture}|${j.steps.map((s) => s.id).join(",")}`;
}

function validityKey(f: IntentFacts): string {
  return actions(f).map((a) => `${a.kind}${a.kind === "papers" && /voiture/.test(a.reason) ? ":car" : ""}${a.kind === "route" ? (/^En voiture/.test(a.reason) ? ":car" : ":ferry") : ""}`).join(",");
}

const reasons = (f: IntentFacts) => actions(f).map((a) => a.reason).join("|");

function classify(before: IntentFacts, after: IntentFacts, field: string, cfg: Cfg): Impact {
  if (hrefs(before) === 0 && hrefs(after) > 0) return "UNLOCK";
  if (planKey(before, cfg.prefill) !== planKey(after, cfg.prefill)) return "ACTION";
  if (journeyKey(before) !== journeyKey(after)) return "STATE";
  if (validityKey(before) !== validityKey(after)) return "VALIDITY";
  if (reasons(before) !== reasons(after)) return (field === "origin" || field === "when") && actions(after).some((a) => a.kind === "flight") ? "PREFILL" : "TEXT";
  return "NOTHING";
}

const trim = (s: string) => s.replace(/[\s.!?]+$/, "");

type Row = { field: string; label: string; options: Array<{ text: string; append: string }>; gain: number };

function decide(sentence: string, before: IntentFacts, row: Row, cfg: Cfg): { decision: Decision; impacts: Record<string, Impact> } {
  const impacts: Record<string, Impact> = {};
  for (const o of row.options) impacts[o.text] = classify(before, extractIntent(trim(sentence) + o.append, TODAY), row.field, cfg);
  const values = Object.values(impacts);
  const n = values.filter((i) => meaningful(i, cfg)).length;
  const decision: Decision = n === 0 ? (values.some((i) => contingent(i, cfg)) ? "DEFER" : "SKIP") : n === values.length ? "ASK" : "OFFER";
  return { decision, impacts };
}

type Step = { id: string; field: string; answer: string; decision: Decision; actual: Impact };

/** The synthetic user answers every question RME offers (the baseline loop), logging what each answer changes. */
function fullLoop(sc: S, cfg: Cfg): { steps: Step[]; final: IntentFacts; blocked: boolean } {
  let sentence = sc.s;
  let f = extractIntent(sentence, TODAY);
  const steps: Step[] = [];
  let blocked = false;
  for (let i = 0; i < 6; i++) {
    const ranked = rankedChoices(sentence, options, 4);
    if (ranked.length === 0) break;
    const row = ranked[0];
    const want = sc.truth?.[FIELD_OF[row.field]];
    const option = row.options.find((o) => o.text === want);
    if (!want || !option) { blocked = Boolean(want); break; }
    const { decision } = decide(sentence, f, row, cfg);
    const next = extractIntent(trim(sentence) + option.append, TODAY);
    steps.push({ id: sc.id, field: row.field, answer: want, decision, actual: classify(f, next, row.field, cfg) });
    sentence = trim(sentence) + option.append;
    f = next;
  }
  return { steps, final: f, blocked };
}

/**
 * The same user, but the gate decides which questions are asked. A question that is not asked now
 * (DEFER, SKIP) is evaluated again after every answer: its value can depend on the others.
 */
function gatedLoop(sc: S, cfg: Cfg): { final: IntentFacts; asked: number; tapped: number; accepted: number; lost: string[] } {
  let sentence = sc.s;
  let f = extractIntent(sentence, TODAY);
  const settled = new Set<string>(); // fields the user answered, or whose default they accepted
  let asked = 0, tapped = 0, accepted = 0;
  for (let i = 0; i < 10; i++) {
    let moved = false;
    for (const row of rankedChoices(sentence, options, 4).filter((r) => !settled.has(r.field))) {
      const { decision, impacts } = decide(sentence, f, row, cfg);
      if (decision === "SKIP" || decision === "DEFER") continue;
      const want = sc.truth?.[FIELD_OF[row.field]];
      const option = row.options.find((o) => o.text === want);
      if (!want || !option) { settled.add(row.field); continue; }
      settled.add(row.field);
      if (decision === "OFFER" && !meaningful(impacts[want], cfg)) { accepted++; moved = true; break; } // the default was right
      if (decision === "ASK") asked++; else tapped++;
      sentence = trim(sentence) + option.append;
      f = extractIntent(sentence, TODAY);
      moved = true;
      break;
    }
    if (!moved) break;
  }
  // What is still unanswered: would its answer have mattered?
  const lost: string[] = [];
  for (const row of rankedChoices(sentence, options, 4).filter((r) => !settled.has(r.field))) {
    const want = sc.truth?.[FIELD_OF[row.field]];
    const option = row.options.find((o) => o.text === want);
    if (want && option && meaningful(classify(f, extractIntent(trim(sentence) + option.append, TODAY), row.field, cfg), cfg)) lost.push(`${row.field}=${want}`);
  }
  return { final: f, asked, tapped, accepted, lost };
}

const scenarios = SCENARIOS.filter((sc) => !sc.terminal);
const tally = <T extends string>(xs: T[]) => xs.reduce<Record<string, number>>((m, x) => ((m[x] = (m[x] ?? 0) + 1), m), {});

const CONFIGS: Array<[string, Cfg]> = [
  ["today: flight link generic, saved journey counts", { prefill: false, stateCounts: true }],
  ["today, visible plan only (saved journey ignored)", { prefill: false, stateCounts: false }],
  ["with PR #197: flight link pre-filled, saved journey counts", { prefill: true, stateCounts: true }],
  ["with PR #197, visible plan only", { prefill: true, stateCounts: false }],
];

describe("question value gate (report only)", () => {
  test.each(CONFIGS)("%s", (name, cfg) => {
    const loops = scenarios.map((sc) => ({ sc, ...fullLoop(sc, cfg) }));
    const steps = loops.flatMap((l) => l.steps);
    const byImpact = tally(steps.map((s) => s.actual));
    const byDecision = tally(steps.map((s) => s.decision));
    const byField: Record<string, Record<string, number>> = {};
    for (const s of steps) (byField[s.field] ??= {})[s.decision] = (byField[s.field][s.decision] ?? 0) + 1;

    // Replay on the answers already given: what would the gate have done to each one, judged question by question?
    let saved = 0, kept = 0, lostAnswers = 0;
    for (const s of steps) {
      const m = meaningful(s.actual, cfg);
      if (s.decision === "ASK") kept++;
      else if (s.decision === "OFFER") (m ? kept++ : saved++);
      else (m ? lostAnswers++ : saved++);
    }

    // Whole loop with the gate: same final plan, saved journey and recommendation validity with fewer questions?
    let same = 0, factsLost = 0, questionsGate = 0, comparable = 0, blockedBaselines = 0, comparableQuestions = 0;
    const different: string[] = [];
    for (const l of loops) {
      const g = gatedLoop(l.sc, cfg);
      if (l.blocked) { blockedBaselines++; continue; } // the baseline user could not tap an answer: not comparable
      questionsGate += g.asked + g.tapped;
      comparable++;
      comparableQuestions += l.steps.length;
      const equal = planKey(l.final, cfg.prefill) === planKey(g.final, cfg.prefill)
        && validityKey(l.final) === validityKey(g.final)
        && (!cfg.stateCounts || journeyKey(l.final) === journeyKey(g.final));
      if (equal) same++; else different.push(`${l.sc.id} "${l.sc.s}" lost ${g.lost.join(",") || "nothing it could see"}`);
      const known = (f: IntentFacts) => ["destination", "origin", "when", "mode"].filter((k) => (f as never)[k]).join(",");
      if (known(l.final) !== known(g.final)) factsLost++;
    }

    console.log(`QVG ${name}\n` +
      `  answers=${steps.length} real impact=${JSON.stringify(byImpact)}\n` +
      `  gate decisions=${JSON.stringify(byDecision)} by field=${JSON.stringify(byField)}\n` +
      `  replay answer by answer: saved=${saved} kept=${kept} useful answers lost=${lostAnswers}\n` +
      `  whole loop: questions asked by the gate ${questionsGate} (baseline ${comparableQuestions}); same decision-relevant result in ${same}/${comparable} comparable scenarios (${blockedBaselines} baseline blocked on an untappable answer); facts not captured in ${factsLost}/${comparable}\n` +
      `  different: ${different.join(" ; ") || "none"}`);
    // Floors of what was measured (2026-10-03). The gate must never lose a decision-relevant answer.
    expect(lostAnswers).toBe(0);
    expect(same).toBe(comparable);
    expect(questionsGate).toBeLessThan(comparableQuestions);
  });

  test.each([
    ["today, saved journey counts", { prefill: false, stateCounts: true }],
    ["today, visible plan only", { prefill: false, stateCounts: false }],
    ["with PR #197, visible plan only", { prefill: true, stateCounts: false }],
  ] as Array<[string, Cfg]>)("the current ranking is steered by wording: how often does it disagree with a semantic ranking? (%s)", (name, cfg) => {
    let n = 0, agree = 0;
    const disagree: string[] = [];
    for (const sc of scenarios) {
      const before = extractIntent(sc.s, TODAY);
      const rows = rankedChoices(sc.s, options, 4);
      if (rows.length < 2) continue;
      n++;
      const semantic = rows
        .map((r, i) => ({ r, i, gain: r.options.filter((o) => meaningful(classify(before, extractIntent(trim(sc.s) + o.append, TODAY), r.field, cfg), cfg)).length / r.options.length }))
        .sort((x, y) => y.gain - x.gain || x.i - y.i);
      if (semantic[0].r.field === rows[0].field) agree++; else disagree.push(`${sc.id} "${sc.s}": current asks ${rows[0].field}, semantic asks ${semantic[0].r.field}`);
    }
    console.log(`QVG ranking (${name}): top question agrees in ${agree}/${n} scenarios with several questions.${agree === n ? "" : " Disagreements: " + disagree.length}`);
    expect(n).toBeGreaterThan(0);
  });
});
