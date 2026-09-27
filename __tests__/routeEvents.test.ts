import { createRouteEvent } from '../lib/routeEvents';
import { isPrimaryTruth } from '../lib/trust';

describe('LOT E — Route Events contract', () => {
  const base = { kind: 'ROUTE_UPDATE' as const, level: 'OFFICIAL' as const, title: 'Route updated', summary: 'A route segment changed.' };
  const fixedId = { newId: () => 'evt-1' };

  it('creates a normalized event with a system-assigned id', () => {
    const event = createRouteEvent({ ...base, title: '  Route updated ' }, fixedId);
    expect(event).toMatchObject({ id: 'evt-1', title: 'Route updated' });
    expect(createRouteEvent(base).id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('uses the shared provenance levels', () => {
    expect(isPrimaryTruth(createRouteEvent(base, fixedId).level)).toBe(true);
    expect(isPrimaryTruth(createRouteEvent({ ...base, level: 'COMMUNITY' }, fixedId).level)).toBe(false);
  });

  it('accepts source and location metadata', () => {
    const event = createRouteEvent({ ...base, source: 'Official source', sourceUrl: 'https://example.com/event', location: { country: 'MA', city: 'Rabat', latitude: 34.02, longitude: -6.84 }, occurredAt: '2026-09-27T10:00:00Z', metadata: { verified: true, count: 2 } }, fixedId);
    expect(event.sourceUrl).toBe('https://example.com/event');
    expect(event.location?.city).toBe('Rabat');
  });

  it('rejects empty content, bad dates, bad links and impossible coordinates', () => {
    expect(() => createRouteEvent({ ...base, title: ' ' })).toThrow();
    expect(() => createRouteEvent({ ...base, summary: ' ' })).toThrow();
    expect(() => createRouteEvent({ ...base, occurredAt: 'not-a-date' })).toThrow();
    expect(() => createRouteEvent({ ...base, sourceUrl: 'javascript:bad' })).toThrow();
    expect(() => createRouteEvent({ ...base, location: { latitude: 134 } })).toThrow('out of range');
  });
});
