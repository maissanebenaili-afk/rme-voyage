import { PromptKnowledgeAgent } from '../target/agent.js';
import type { AgentVersion, EvaluationSummary, EvalResult, TestCase } from '../types.js';
import { PASS_THRESHOLD, type Scorer } from './scorer.js';

export function runEvaluation(
  version: AgentVersion,
  testCases: TestCase[],
  scorer: Scorer,
): EvaluationSummary {
  const agent = new PromptKnowledgeAgent(version);

  const results: EvalResult[] = testCases.map((tc) => {
    const { content, matchedEntryId } = agent.respond(tc.query);
    const score = scorer.score(tc, content, matchedEntryId);
    return {
      testCaseId: tc.id,
      query: tc.query,
      response: content,
      matchedEntryId,
      score,
      passed: score >= PASS_THRESHOLD,
    };
  });

  const averageScore = results.reduce((sum, r) => sum + r.score, 0) / (results.length || 1);
  const passRate = results.filter((r) => r.passed).length / (results.length || 1);

  return { versionId: version.id, results, averageScore, passRate };
}
