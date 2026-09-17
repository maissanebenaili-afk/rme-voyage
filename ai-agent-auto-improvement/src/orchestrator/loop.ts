import { runEvaluation } from '../eval/runner.js';
import type { Scorer } from '../eval/scorer.js';
import type { GlobalDataSource } from '../data/globalData.js';
import { findCoverageGaps, findStaleFacts } from '../improve/analyzer.js';
import { applyPatches } from '../improve/applier.js';
import type { Proposer } from '../improve/proposer.js';
import { SEED_VERSION } from '../seed/sample.js';
import { appendHistory, getHeadId, loadVersion, saveVersion, setHead } from '../store/versionStore.js';
import type { AgentVersion, EvaluationSummary, GlobalDataFact, Patch, TestCase } from '../types.js';

export interface LoopOptions {
  sources: GlobalDataSource[];
  scorer: Scorer;
  proposer: Proposer;
  testCases: TestCase[];
}

export interface LoopResult {
  accepted: boolean;
  baseline: EvaluationSummary;
  candidate?: EvaluationSummary;
  candidateVersion?: AgentVersion;
  patches: Patch[];
  notes: string[];
  newVersionId?: string;
}

/**
 * One full self-improvement cycle:
 *   load current version -> evaluate -> pull global data -> diagnose
 *   (stale facts + coverage gaps) -> patch a candidate -> re-evaluate ->
 *   accept iff no regression, else keep the current version and log why.
 */
export async function runImprovementCycle(opts: LoopOptions): Promise<LoopResult> {
  const notes: string[] = [];

  const headId = await getHeadId();
  let version: AgentVersion;
  if (!headId) {
    version = { ...SEED_VERSION, knowledge: SEED_VERSION.knowledge.map((e) => ({ ...e, keywords: [...e.keywords] })) };
    await saveVersion(version);
    await setHead(version.id);
    notes.push('No existing version found — seeded initial agent version.');
  } else {
    version = await loadVersion(headId);
  }

  const baseline = runEvaluation(version, opts.testCases, opts.scorer);

  const facts: GlobalDataFact[] = [];
  for (const source of opts.sources) {
    try {
      facts.push(...(await source.fetch()));
    } catch (err) {
      notes.push(`Data source "${source.name}" failed: ${(err as Error).message}`);
    }
  }

  const stalePatches = findStaleFacts(version, facts);

  let gapPatches: Patch[] = [];
  if (opts.proposer.enabled) {
    gapPatches = await findCoverageGaps(baseline, opts.testCases, version, opts.proposer, notes);
  } else {
    const gapCount = baseline.results.filter((r) => !r.passed).length;
    if (gapCount > 0) {
      notes.push(`${gapCount} coverage gap(s) detected but LLM proposer disabled (set ANTHROPIC_API_KEY).`);
    }
  }

  const patches = [...stalePatches, ...gapPatches];

  if (patches.length === 0) {
    notes.push('No improvement patches generated this cycle.');
    return { accepted: false, baseline, patches, notes };
  }

  const candidateVersion = applyPatches(version, patches);
  const candidate = runEvaluation(candidateVersion, opts.testCases, opts.scorer);

  const regressed = candidate.averageScore < baseline.averageScore || candidate.passRate < baseline.passRate;
  const accepted = !regressed;

  if (accepted) {
    await saveVersion(candidateVersion);
    await setHead(candidateVersion.id);
    notes.push(
      `Accepted new version ${candidateVersion.id} ` +
        `(score ${baseline.averageScore.toFixed(2)} -> ${candidate.averageScore.toFixed(2)}, ${patches.length} patch(es)).`,
    );
  } else {
    notes.push(
      `Rejected candidate — regression detected ` +
        `(score ${baseline.averageScore.toFixed(2)} -> ${candidate.averageScore.toFixed(2)}); kept ${version.id}.`,
    );
  }

  await appendHistory({
    cycleId: `cycle-${Date.now()}`,
    timestamp: new Date().toISOString(),
    baselineVersionId: version.id,
    candidateVersionId: candidateVersion.id,
    accepted,
    baselineScore: baseline.averageScore,
    candidateScore: candidate.averageScore,
    patches,
    notes,
  });

  return {
    accepted,
    baseline,
    candidate,
    candidateVersion,
    patches,
    notes,
    newVersionId: accepted ? candidateVersion.id : undefined,
  };
}
