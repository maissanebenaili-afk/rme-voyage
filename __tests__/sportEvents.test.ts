import { canDisplayAsOfficial, createSportEvent } from '../lib/sportEvents';
import { isPrimaryTruth } from '../lib/trust';

describe('LOT E.2 — reliable sports contract', () => {
  const base = { sport: 'football', kind: 'FIXTURE' as const, level: 'MEASURED' as const, status: 'SCHEDULED' as const, home: 'A', away: 'B', source: 'TheSportsDB', updatedAt: '2026-09-27T00:00:00Z' };
  const fixedId = { newId: () => 'evt-1' };

  it('creates a valid fixture with a system-assigned id', () => {
    const event = createSportEvent(base, fixedId);
    expect(event.id).toBe('evt-1');
    expect(canDisplayAsOfficial(event)).toBe(true);
  });

  it('generates an id without any mock when none is supplied', () => {
    expect(createSportEvent(base).id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('requires a score for results', () => {
    expect(() => createSportEvent({ ...base, kind: 'RESULT' }, fixedId)).toThrow('Result requires a score');
    expect(createSportEvent({ ...base, kind: 'RESULT', status: 'FINISHED', score: { home: 2, away: 1 } }, fixedId).score).toEqual({ home: 2, away: 1 });
  });

  it('accepts http(s) source links and rejects the rest', () => {
    expect(createSportEvent({ ...base, sourceUrl: 'https://www.thesportsdb.com/event/1' }, fixedId).sourceUrl).toContain('https://');
    for (const sourceUrl of ['javascript:alert(1)', 'ftp://x.org', 'not a url', 'https//missing-colon']) {
      expect(() => createSportEvent({ ...base, sourceUrl }, fixedId)).toThrow('sourceUrl must be http(s)');
    }
  });

  it('rejects invalid scores and dates', () => {
    expect(() => createSportEvent({ ...base, score: { home: -1, away: 0 } }, fixedId)).toThrow();
    expect(() => createSportEvent({ ...base, score: { home: 1.5, away: 0 } }, fixedId)).toThrow();
    expect(() => createSportEvent({ ...base, startAt: 'demain' }, fixedId)).toThrow('startAt');
  });

  it('shows only official or measured data as official', () => {
    expect(isPrimaryTruth('OFFICIAL')).toBe(true);
    expect(isPrimaryTruth('MEASURED')).toBe(true);
    for (const level of ['COMMUNITY', 'INFERRED', 'UNKNOWN'] as const) {
      expect(canDisplayAsOfficial({ level, source: 'x' })).toBe(false);
    }
  });

  it('accepts live and postponed states', () => {
    expect(createSportEvent({ ...base, kind: 'LIVE_STATUS', status: 'LIVE' }, fixedId).status).toBe('LIVE');
    expect(createSportEvent({ ...base, status: 'POSTPONED' }, fixedId).status).toBe('POSTPONED');
  });
});
