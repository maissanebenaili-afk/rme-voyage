import { describe, expect, it } from 'vitest';
import { findStaleFacts } from '../src/improve/analyzer.js';
import { SEED_VERSION } from '../src/seed/sample.js';
import type { GlobalDataFact } from '../src/types.js';

function fact(overrides: Partial<GlobalDataFact>): GlobalDataFact {
  return {
    id: 'f1',
    topic: 'eur_mad_rate',
    statement: '',
    value: 0,
    unit: 'MAD',
    fetchedAt: new Date().toISOString(),
    sourceUrl: 'https://example.com',
    sourceName: 'test',
    ...overrides,
  };
}

describe('findStaleFacts', () => {
  it('proposes an update when the live rate drifts from the stored one', () => {
    const patches = findStaleFacts(SEED_VERSION, [fact({ topic: 'eur_mad_rate', value: 10.8 })]);
    expect(patches).toHaveLength(1);
    expect(patches[0]).toMatchObject({ kind: 'update_entry', entryId: 'currency' });
    if (patches[0].kind === 'update_entry') {
      expect(patches[0].newContent).toContain('10.80 MAD');
    }
  });

  it('does not propose an update when the value is already fresh', () => {
    const patches = findStaleFacts(SEED_VERSION, [fact({ topic: 'eur_mad_rate', value: 9.5 })]);
    expect(patches).toHaveLength(0);
  });

  it('ignores facts with no matching binding or entry', () => {
    const patches = findStaleFacts(SEED_VERSION, [fact({ topic: 'unknown_topic', value: 42 })]);
    expect(patches).toHaveLength(0);
  });

  it('handles multiple drifting facts independently', () => {
    const patches = findStaleFacts(SEED_VERSION, [
      fact({ id: 'f1', topic: 'eur_mad_rate', value: 10.8 }),
      fact({ id: 'f2', topic: 'fuel_diesel_price_mad_per_l', value: 13.2 }),
    ]);
    expect(patches).toHaveLength(2);
    expect(patches.map((p) => (p.kind === 'update_entry' ? p.entryId : null)).sort()).toEqual([
      'currency',
      'fuel',
    ]);
  });
});
