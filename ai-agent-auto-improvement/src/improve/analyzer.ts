import type { AgentVersion, EvaluationSummary, GlobalDataFact, Patch, TestCase } from '../types.js';
import type { Proposer } from './proposer.js';

interface FactBinding {
  entryId: string;
  pattern: RegExp;
  format: (value: number) => string;
  label: string;
}

/**
 * Declarative map from a global-data topic to the knowledge entry (and the
 * exact substring pattern) it keeps fresh. Add one line here for every new
 * fact your data sources can supply.
 */
const FACT_BINDINGS: Record<string, FactBinding> = {
  eur_mad_rate: {
    entryId: 'currency',
    pattern: /≈\s*(?<num>[\d.]+)\s*MAD/,
    format: (v) => `≈ ${v.toFixed(2)} MAD`,
    label: 'EUR→MAD exchange rate',
  },
  fuel_diesel_price_mad_per_l: {
    entryId: 'fuel',
    pattern: /approx\.\s*(?<num>[\d.]+)\s*MAD\/L/,
    format: (v) => `approx. ${v.toFixed(2)} MAD/L`,
    label: 'Diesel price',
  },
};

const DRIFT_TOLERANCE = 0.02; // ignore drift smaller than 2%

/** Find knowledge entries whose embedded numbers have drifted from live facts. */
export function findStaleFacts(version: AgentVersion, facts: GlobalDataFact[]): Patch[] {
  const patches: Patch[] = [];

  for (const fact of facts) {
    const binding = FACT_BINDINGS[fact.topic];
    if (!binding || fact.value === undefined) continue;

    const entry = version.knowledge.find((e) => e.id === binding.entryId);
    if (!entry) continue;

    const match = entry.content.match(binding.pattern);
    const numStr = match?.groups?.num;
    if (!numStr) continue;

    const currentValue = parseFloat(numStr);
    if (Number.isNaN(currentValue)) continue;

    // fact.value === 0 would make a ratio meaningless (divide by zero); fall back to
    // an absolute-difference check so a genuine 0 -> 0 fact never looks "stale".
    const isFresh =
      fact.value === 0 ? currentValue === 0 : Math.abs(currentValue - fact.value) / fact.value < DRIFT_TOLERANCE;
    if (isFresh) continue;

    patches.push({
      kind: 'update_entry',
      entryId: entry.id,
      newContent: entry.content.replace(binding.pattern, binding.format(fact.value)),
      reason: `${binding.label} drifted from ${currentValue} to ${fact.value} (source: ${fact.sourceName})`,
      evidence: fact,
    });
  }

  return patches;
}

/**
 * Turn failing test cases into drafted knowledge entries via an LLM
 * proposer. Skipped entirely (with a note) when no proposer is configured —
 * the loop never fabricates facts without an explicit generation step.
 */
export async function findCoverageGaps(
  evalSummary: EvaluationSummary,
  testCases: TestCase[],
  version: AgentVersion,
  proposer: Proposer,
  notes: string[],
): Promise<Patch[]> {
  const patches: Patch[] = [];
  const failing = evalSummary.results.filter((r) => !r.passed);
  const existingTopics = version.knowledge.map((e) => e.id);

  for (const result of failing) {
    const testCase = testCases.find((tc) => tc.id === result.testCaseId);
    if (!testCase) continue;

    try {
      const entry = await proposer.proposeEntry(testCase.query, existingTopics);
      patches.push({
        kind: 'add_entry',
        entry,
        reason: `Coverage gap for test case "${testCase.id}" (score ${result.score.toFixed(2)})`,
      });
    } catch {
      notes.push(`Proposer failed for "${testCase.id}"`);
    }
  }

  return patches;
}
