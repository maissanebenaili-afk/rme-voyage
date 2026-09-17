import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { GlobalDataSource } from '../src/data/globalData.js';
import { HeuristicScorer } from '../src/eval/scorer.js';
import { NullProposer } from '../src/improve/proposer.js';
import { runImprovementCycle } from '../src/orchestrator/loop.js';
import { SEED_TEST_CASES } from '../src/seed/sample.js';
import type { GlobalDataFact } from '../src/types.js';

let tempDir: string;

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ai-agent-test-'));
  process.env.AI_AGENT_DATA_DIR = tempDir;
});

afterEach(async () => {
  delete process.env.AI_AGENT_DATA_DIR;
  await fs.rm(tempDir, { recursive: true, force: true });
});

function fakeRateSource(value: number): GlobalDataSource {
  return {
    name: 'fake-rate',
    async fetch(): Promise<GlobalDataFact[]> {
      return [
        {
          id: 'f1',
          topic: 'eur_mad_rate',
          statement: `1 EUR ≈ ${value} MAD`,
          value,
          unit: 'MAD',
          fetchedAt: new Date().toISOString(),
          sourceUrl: 'https://example.com',
          sourceName: 'fake',
        },
      ];
    },
  };
}

describe('runImprovementCycle', () => {
  it('seeds an initial version and accepts a fact-freshness patch', async () => {
    const result = await runImprovementCycle({
      sources: [fakeRateSource(10.8)],
      scorer: new HeuristicScorer(),
      proposer: new NullProposer(),
      testCases: SEED_TEST_CASES,
    });

    expect(result.patches).toHaveLength(1);
    expect(result.accepted).toBe(true);
    expect(result.candidateVersion?.knowledge.find((e) => e.id === 'currency')?.content).toContain(
      '10.80 MAD',
    );
  });

  it('is a no-op on the next run once facts are fresh', async () => {
    await runImprovementCycle({
      sources: [fakeRateSource(10.8)],
      scorer: new HeuristicScorer(),
      proposer: new NullProposer(),
      testCases: SEED_TEST_CASES,
    });

    const second = await runImprovementCycle({
      sources: [fakeRateSource(10.8)],
      scorer: new HeuristicScorer(),
      proposer: new NullProposer(),
      testCases: SEED_TEST_CASES,
    });

    expect(second.patches).toHaveLength(0);
    expect(second.accepted).toBe(false);
  });

  it('logs a note about the visa coverage gap when the proposer is disabled', async () => {
    const result = await runImprovementCycle({
      sources: [],
      scorer: new HeuristicScorer(),
      proposer: new NullProposer(),
      testCases: SEED_TEST_CASES,
    });

    expect(result.notes.some((n) => n.includes('coverage gap'))).toBe(true);
  });

  it('records a history entry after an accepted cycle', async () => {
    await runImprovementCycle({
      sources: [fakeRateSource(10.8)],
      scorer: new HeuristicScorer(),
      proposer: new NullProposer(),
      testCases: SEED_TEST_CASES,
    });

    const { loadHistory } = await import('../src/store/versionStore.js');
    const history = await loadHistory();
    expect(history).toHaveLength(1);
    expect(history[0].accepted).toBe(true);
  });
});
