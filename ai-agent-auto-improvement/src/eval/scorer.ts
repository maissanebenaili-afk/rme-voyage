import type { TestCase } from '../types.js';

export const PASS_THRESHOLD = 0.6;

export interface Scorer {
  score(testCase: TestCase, response: string, matchedEntryId: string | null): number;
}

/**
 * Keyword-coverage scorer. No API key required, deterministic, good enough
 * to gate accept/reject decisions. Swap in an LLM-as-judge Scorer for
 * higher-fidelity grading once you have a proposer configured.
 */
export class HeuristicScorer implements Scorer {
  score(testCase: TestCase, response: string, _matchedEntryId: string | null): number {
    if (testCase.mustInclude.length === 0) {
      return response.trim().length > 0 ? 1 : 0;
    }
    const lower = response.toLowerCase();
    const hits = testCase.mustInclude.filter((k) => lower.includes(k.toLowerCase())).length;
    return hits / testCase.mustInclude.length;
  }
}
