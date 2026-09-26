import { createRouteEvent, isPrimaryTruth } from '../lib/routeEvents';
describe('LOT E — Route Events contract', () => {
  const base = { kind: 'ROUTE_UPDATE' as const, level: 'OFFICIAL_MEASURED' as const, title: 'Route updated', summary: 'A route segment changed.' };
  it('creates a normalized event with an id', () => { const event = createRouteEvent(base); expect(event.id).toMatch(/^rme-event-/); expect(event.title).toBe('Route updated'); });
  it('preserves explicit source truth level', () => { expect(isPrimaryTruth('OFFICIAL_MEASURED')).toBe(true); expect(isPrimaryTruth('COMMUNITY')).toBe(false); expect(isPrimaryTruth('INFERRED')).toBe(false); });
  it('accepts source and location metadata', () => { const event = createRouteEvent({ ...base, source: 'Official source', sourceUrl: 'https://example.com/event', location: { country: 'MA', city: 'Rabat', latitude: 34.02, longitude: -6.84 }, occurredAt: '2026-09-27T10:00:00Z', metadata: { verified: true, count: 2 } }); expect(event.sourceUrl).toBe('https://example.com/event'); expect(event.location?.city).toBe('Rabat'); });
  it('rejects empty content', () => { expect(() => createRouteEvent({ ...base, title: ' ' })).toThrow(); expect(() => createRouteEvent({ ...base, summary: ' ' })).toThrow(); });
  it('rejects invalid dates and source URLs', () => { expect(() => createRouteEvent({ ...base, occurredAt: 'not-a-date' })).toThrow(); expect(() => createRouteEvent({ ...base, sourceUrl: 'javascript:bad' })).toThrow(); });
});