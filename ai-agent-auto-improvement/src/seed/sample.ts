import type { AgentVersion, TestCase } from '../types.js';

/**
 * Seed agent modeled on a Morocco-travel assistant. The currency and fuel
 * figures are deliberately stale so the first `npm run improve` run has
 * something real to fix, demonstrating the fact-freshness path end to end.
 * The "visa" test case has no matching knowledge entry, demonstrating the
 * coverage-gap path (requires ANTHROPIC_API_KEY to auto-resolve).
 */
export const SEED_VERSION: AgentVersion = {
  id: 'v-seed',
  parentId: null,
  createdAt: new Date(0).toISOString(),
  systemPrompt: 'You are a concise Morocco travel assistant. Answer factually using the knowledge base.',
  fallbackResponse: "I don't have a verified answer for that yet — this has been logged as a coverage gap.",
  knowledge: [
    {
      id: 'currency',
      keywords: ['euro', 'dirham', 'eur', 'mad', 'exchange', 'currency', 'rate'],
      content: 'Indicative rate: 1 EUR ≈ 9.50 MAD.',
      lastVerified: '2023-01-01T00:00:00.000Z',
    },
    {
      id: 'fuel',
      keywords: ['diesel', 'fuel', 'gasoil', 'petrol', 'gas price'],
      content: 'Diesel price in Morocco: approx. 12.50 MAD/L.',
      lastVerified: '2023-01-01T00:00:00.000Z',
    },
    {
      id: 'ferry',
      keywords: ['ferry', 'algeciras', 'tanger', 'tangier', 'boat', 'crossing'],
      content: 'Ferries from Algeciras to Tanger Med cost roughly 80-200 EUR per vehicle depending on season.',
      lastVerified: '2023-01-01T00:00:00.000Z',
    },
  ],
};

export const SEED_TEST_CASES: TestCase[] = [
  { id: 'tc-currency', query: 'What is the euro to dirham exchange rate?', mustInclude: ['eur', 'mad'] },
  { id: 'tc-fuel', query: 'How much does diesel cost in Morocco?', mustInclude: ['diesel'] },
  { id: 'tc-ferry', query: 'How much is the ferry from Algeciras to Tangier?', mustInclude: ['algeciras', 'tanger'] },
  { id: 'tc-visa', query: 'Do I need a visa to enter Morocco from the EU?', mustInclude: ['visa'] },
];
