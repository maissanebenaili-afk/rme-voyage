import { coverageLines, describeCoverage, eventsNearCorridor } from '../lib/live/corridor';
import { dgtFeedToEvents } from '../lib/live/dgt';
import { isShowable } from '../lib/live/liveLevel';
import { createRouteEvent } from '../lib/routeEvents';
import type { LonLat } from '../lib/geo';
import { dgtFeed } from './fixtures/dgtSample';

const NOW = new Date('2026-10-03T19:00:00Z');
const events = dgtFeedToEvents(dgtFeed(['slow_fresh', 'works_with_end', 'near_algeciras']), NOW);
const slow = events.find((e) => e.metadata?.road === 'EX-101')!;

describe('RME Live — events along a trip', () => {
  it('keeps events within the radius, closest first, and drops the others', () => {
    // EX-101 event is at 38.4246 N, 6.4113 W: a line one kilometre away and a line far away.
    const near: LonLat[] = [[-6.4113, 38.4146], [-6.4113, 38.4346]];
    const far: LonLat[] = [[-3.0, 40.0], [-3.0, 41.0]];
    const matches = eventsNearCorridor(events, near, 5_000);
    expect(matches.map((m) => m.event.metadata?.road)).toEqual(['EX-101']);
    expect(matches[0].distanceMeters).toBeLessThan(1_000);
    expect(eventsNearCorridor(events, far, 5_000)).toEqual([]);
    expect(eventsNearCorridor(events, [], 5_000)).toEqual([]);
  });

  it('uses the distance to the segment, not only to its end points', () => {
    const longLine: LonLat[] = [[-6.9, 38.4246], [-5.9, 38.4246]]; // passes right over the event, 50 km long
    expect(eventsNearCorridor([slow], longLine, 500)[0].distanceMeters).toBeLessThan(100);
  });

  it('ignores events without a position', () => {
    const noPosition = createRouteEvent({ kind: 'ALERT', level: 'OFFICIAL', title: 'x', summary: 'y' });
    expect(eventsNearCorridor([noPosition], [[0, 0], [1, 1]], 10_000_000)).toEqual([]);
  });

  it('a stale event can match the line yet stays out of the displayed list', () => {
    const seville: LonLat = [-5.99, 37.39];
    const algeciras: LonLat = [-5.45, 36.13];
    const matches = eventsNearCorridor(events, [seville, [-5.27, 36.45], algeciras], 3_000);
    expect(matches.some((m) => m.event.metadata?.road === 'A-7150')).toBe(true);
    expect(matches.filter((m) => isShowable(m.event))).toEqual([]);
  });
});

describe('RME Live — what is covered along a trip', () => {
  // Stand-in for lib/countryLookup.ts, which needs the 200 KB shapes file.
  const countryOf = ([, lat]: LonLat) => (lat >= 42.5 ? 'FR' : lat >= 36.0 ? 'ES' : lat >= 35.0 ? 'MA' : null);
  const trip: LonLat[] = [[2.35, 48.86], [-3.7, 40.4], [-5.45, 36.13], [-5.8, 35.77]];

  it('says covered for Spain only, and not covered for France, the strait and Morocco', () => {
    const report = describeCoverage(trip, countryOf);
    const by = (country: string | null) => report.runs.filter((r) => r.country === country);
    expect(by('FR').every((r) => r.status === 'NON_COUVERT')).toBe(true);
    expect(by('ES').some((r) => r.status === 'COUVERT' && r.source === 'DGT')).toBe(true);
    expect(by('MA').every((r) => r.status === 'NON_COUVERT')).toBe(true);
    expect(report.coveredMeters).toBeGreaterThan(0);
    expect(report.coveredMeters).toBeLessThan(report.totalMeters);
  });

  it('run lengths add up to the total and every run has a reason', () => {
    const report = describeCoverage(trip, countryOf);
    expect(Math.round(report.runs.reduce((sum, r) => sum + r.lengthMeters, 0))).toBe(report.totalMeters);
    expect(report.runs.every((r) => r.lengthMeters > 0 && r.reason.length > 0)).toBe(true);
  });

  it('treats Catalonia and the Basque Country as not covered (boxes err on the safe side)', () => {
    const inCatalonia: LonLat[] = [[1.0, 41.5], [1.5, 41.6]];
    const inBasque: LonLat[] = [[-2.8, 43.0], [-2.6, 43.1]];
    const spain = () => 'ES';
    expect(describeCoverage(inCatalonia, spain).runs[0]).toMatchObject({ status: 'NON_COUVERT' });
    expect(describeCoverage(inCatalonia, spain).runs[0].reason).toContain('Catalogne');
    expect(describeCoverage(inBasque, spain).runs[0].reason).toContain('Pays basque');
    expect(describeCoverage([[-4.0, 37.0], [-4.2, 37.2]], spain).runs[0]).toMatchObject({ status: 'COUVERT' });
  });

  it('never claims coverage when the country is unknown', () => {
    const report = describeCoverage([[-6.0, 35.9], [-5.9, 35.8]], () => null);
    expect(report.runs.every((r) => r.status === 'NON_COUVERT')).toBe(true);
    expect(report.coveredMeters).toBe(0);
  });

  it('writes plain French lines for a future screen', () => {
    const lines = coverageLines(describeCoverage(trip, countryOf));
    expect(lines.some((l) => l.includes('non couvert'))).toBe(true);
    expect(lines.some((l) => /^\d+ km · couvert/.test(l))).toBe(true);
  });
});
