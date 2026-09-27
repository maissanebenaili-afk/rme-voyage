import { canDisplayAsOfficial, createSportEvent, isPrimarySportTruth } from '../lib/sportEvents';

describe('LOT E.2 — reliable sports contract', () => {
  const base = { sport:'football', kind:'FIXTURE' as const, level:'OFFICIAL_MEASURED' as const, status:'SCHEDULED' as const, home:'A', away:'B', source:'measured', updatedAt:'2026-09-27T00:00:00Z' };

  it('creates a valid fixture and marks official truth correctly', () => {
    const event = createSportEvent(base);
    expect(event.id).toBeTruthy();
    expect(isPrimarySportTruth(event.level)).toBe(true);
    expect(canDisplayAsOfficial(event)).toBe(true);
  });

  it('requires a score for results', () => {
    expect(() => createSportEvent({...base, kind:'RESULT'})).toThrow('Result requires a score');
    const event = createSportEvent({...base, kind:'RESULT', status:'FINISHED', score:{home:2,away:1}});
    expect(event.score).toEqual({home:2,away:1});
  });

  it('rejects invalid scores and source URLs', () => {
    expect(() => createSportEvent({...base, score:{home:-1,away:0}})).toThrow();
    expect(() => createSportEvent({...base, sourceUrl:'javascript:bad'})).toThrow();
  });

  it('does not treat community or inferred data as official', () => {
    expect(isPrimarySportTruth('COMMUNITY')).toBe(false);
    expect(isPrimarySportTruth('INFERRED')).toBe(false);
    expect(canDisplayAsOfficial({...base, level:'COMMUNITY'})).toBe(false);
  });

  it('accepts live and postponed states', () => {
    expect(createSportEvent({...base, kind:'LIVE_STATUS', status:'LIVE'}).status).toBe('LIVE');
    expect(createSportEvent({...base, status:'POSTPONED'}).status).toBe('POSTPONED');
  });
});
