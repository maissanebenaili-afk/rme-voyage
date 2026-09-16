import 'dotenv/config';
import { HeuristicScorer } from './eval/scorer.js';
import { LiveCurrencyRateSource } from './data/sources/liveCurrencyRate.js';
import { StaticFactsSource } from './data/sources/staticFacts.js';
import { AnthropicProposer, NullProposer } from './improve/proposer.js';
import { runImprovementCycle } from './orchestrator/loop.js';
import { SEED_TEST_CASES } from './seed/sample.js';
import { loadHistory } from './store/versionStore.js';

async function runImprove() {
  const proposer = process.env.ANTHROPIC_API_KEY
    ? new AnthropicProposer(process.env.ANTHROPIC_API_KEY)
    : new NullProposer();

  const result = await runImprovementCycle({
    sources: [new StaticFactsSource(), new LiveCurrencyRateSource()],
    scorer: new HeuristicScorer(),
    proposer,
    testCases: SEED_TEST_CASES,
  });

  console.log(`\n=== Improvement cycle: ${result.accepted ? 'ACCEPTED' : 'no change'} ===`);
  console.log(`Baseline score:  ${result.baseline.averageScore.toFixed(3)} (pass rate ${(result.baseline.passRate * 100).toFixed(0)}%)`);
  if (result.candidate) {
    console.log(`Candidate score: ${result.candidate.averageScore.toFixed(3)} (pass rate ${(result.candidate.passRate * 100).toFixed(0)}%)`);
  }
  console.log(`\nPatches (${result.patches.length}):`);
  for (const p of result.patches) {
    console.log(`  - [${p.kind}] ${p.reason}`);
  }
  console.log('\nNotes:');
  for (const n of result.notes) console.log(`  - ${n}`);
}

async function runReport() {
  const history = await loadHistory();
  if (history.length === 0) {
    console.log('No cycles recorded yet. Run `npm run improve` first.');
    return;
  }
  for (const entry of history) {
    console.log(
      `${entry.timestamp} [${entry.cycleId}] ${entry.accepted ? 'ACCEPTED ' : 'rejected '}` +
        `${entry.baselineScore.toFixed(3)} -> ${entry.candidateScore.toFixed(3)} ` +
        `(${entry.patches.length} patch(es))`,
    );
  }
}

async function main() {
  const command = process.argv[2] ?? 'improve';
  if (command === 'improve') return runImprove();
  if (command === 'report') return runReport();
  console.error(`Unknown command "${command}". Use "improve" or "report".`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
