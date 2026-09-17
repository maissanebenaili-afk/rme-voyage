import { describe, expect, it } from 'vitest';
import { HeuristicScorer } from '../src/eval/scorer.js';

describe('HeuristicScorer', () => {
  const scorer = new HeuristicScorer();

  it('scores 1 when all required keywords are present', () => {
    const score = scorer.score(
      { id: 't1', query: 'q', mustInclude: ['eur', 'mad'] },
      'The rate is 1 EUR ≈ 10 MAD',
      null,
    );
    expect(score).toBe(1);
  });

  it('scores partial credit when some keywords are missing', () => {
    const score = scorer.score(
      { id: 't2', query: 'q', mustInclude: ['eur', 'mad'] },
      'The rate is 1 EUR ≈ 10 dollars',
      null,
    );
    expect(score).toBeCloseTo(0.5);
  });

  it('scores 0 for an empty response even with no requirements', () => {
    const score = scorer.score({ id: 't3', query: 'q', mustInclude: [] }, '', null);
    expect(score).toBe(0);
  });

  it('scores 1 for a non-empty response with no requirements', () => {
    const score = scorer.score({ id: 't4', query: 'q', mustInclude: [] }, 'anything', null);
    expect(score).toBe(1);
  });
});
