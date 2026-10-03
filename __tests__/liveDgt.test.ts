import { DGT_ATTRIBUTION, DGT_SOURCE_URL, dgtFeedToEvents, dgtRecordToEvent, parseDgtFeed } from '../lib/live/dgt';
import { isShowable, liveLevelOf } from '../lib/live/liveLevel';
import { dgtFeed, DGT_SITUATIONS, type DgtSampleKey } from './fixtures/dgtSample';
import { isHttpUrl } from '../lib/trust';

const NOW = new Date('2026-10-03T19:00:00Z');
const ALL = Object.keys(DGT_SITUATIONS) as DgtSampleKey[];
const ids = { newId: (() => { let n = 0; return () => `evt-${++n}`; })() };
const one = (key: DgtSampleKey, now = NOW) => dgtFeedToEvents(dgtFeed([key]), now, ids)[0];

describe('RME Live — DGT adapter on real records', () => {
  it('reads every record of the sample feed', () => {
    const records = parseDgtFeed(dgtFeed(ALL));
    expect(records).toHaveLength(11);
    expect(records.every((r) => r.id && r.recordType && r.points.length > 0)).toBe(true);
    expect(records.find((r) => r.id === '18811074')).toMatchObject({ roadName: 'N-400', causeType: 'roadMaintenance', detailType: 'roadworks', provider: 'DGT' });
  });

  it('merges the two directions of the same works into one event', () => {
    expect(parseDgtFeed(dgtFeed(['works_with_end']))).toHaveLength(2);
    expect(dgtFeedToEvents(dgtFeed(['works_with_end']), NOW, ids)).toHaveLength(1);
    expect(dgtFeedToEvents(dgtFeed(['slow_fresh']), NOW, ids)).toHaveLength(1);
    expect(dgtFeedToEvents(dgtFeed(ALL), NOW, ids)).toHaveLength(9);
  });

  it('never throws on junk and refuses oversized input', () => {
    for (const bad of [null, undefined, 42, {}, '', '<not-xml', '<sit:situation>']) expect(parseDgtFeed(bad)).toEqual([]);
    expect(parseDgtFeed('x'.repeat(12_000_001))).toEqual([]);
  });

  it('skips situations that are not real and records that are not active', () => {
    const feed = dgtFeed(['slow_fresh']);
    expect(parseDgtFeed(feed.replace('>real<', '>test<'))).toEqual([]);
    expect(parseDgtFeed(feed.replace(/>active</g, '>suspended<'))).toEqual([]);
  });

  it('builds an OFFICIAL RouteEvent with source, link, position and no invented data', () => {
    const event = one('works_old_noend');
    expect(event).toMatchObject({ level: 'OFFICIAL', kind: 'ROUTE_UPDATE', source: 'DGT (Espagne)', title: 'Travaux — N-400' });
    expect(isHttpUrl(event.sourceUrl ?? '')).toBe(true);
    expect(event.sourceUrl).toBe(DGT_SOURCE_URL);
    expect(event.location).toEqual({ country: 'ES', latitude: 39.994446, longitude: -3.6054852 });
    expect(event.summary).toContain('Fin non communiquée');
    expect(event.expiresAt).toBeUndefined();
    expect(Object.keys(event.metadata ?? {}).sort()).toEqual(['ageDays', 'cause', 'hasEnd', 'provider', 'recordId', 'road', 'stale']);
  });

  it('keeps the announced end date and drops events whose end has passed', () => {
    const event = one('works_with_end');
    expect(event.expiresAt).toBe('2026-10-30T13:00:00.000+01:00');
    expect(event.metadata).toMatchObject({ hasEnd: true, stale: false });
    expect(dgtFeedToEvents(dgtFeed(['works_with_end']), new Date('2026-11-15T00:00:00Z'), ids)).toEqual([]);
  });

  it('flags records still "active" after months as stale (real silent-error case)', () => {
    const old = one('works_old_noend');
    expect(old.metadata).toMatchObject({ stale: true });
    expect(old.metadata?.ageDays).toBeGreaterThan(250);
    expect(old.summary).toContain('Information ancienne');
    expect(isShowable(old)).toBe(false);
    expect(isShowable(one('rockfalls'))).toBe(false);
    expect(isShowable(one('near_algeciras'))).toBe(false);
  });

  it('gives ALERTE only to a recent alert-type event, INFO otherwise', () => {
    expect(liveLevelOf(one('slow_fresh'))).toBe('ALERTE');
    expect(one('slow_fresh').kind).toBe('ALERT');
    expect(liveLevelOf(one('accident_fresh'))).toBe('INFO'); // 4 days old: no longer an alert
    expect(liveLevelOf(one('works_with_end'))).toBe('INFO');
    expect(liveLevelOf(one('rockfalls'))).toBe('INFO'); // alert type but 236 days old
    expect(liveLevelOf(one('stuck'))).toBe('INFO');
    expect(isShowable(one('stuck'))).toBe(true);
  });

  it('does not use the feed severity (documented as UNKNOWN)', () => {
    const feed = dgtFeed(['works_old_noend']).replace('<sit:probabilityOfOccurrence>', '<sit:severity>highest</sit:severity><sit:probabilityOfOccurrence>');
    const [event] = dgtFeedToEvents(feed, NOW, ids);
    expect(event.metadata?.severityRaw).toBe('highest');
    expect(liveLevelOf(event)).toBe('INFO');
  });

  it('drops a record without a usable position or start date, and survives a bad record', () => {
    const [record] = parseDgtFeed(dgtFeed(['slow_fresh']));
    expect(dgtRecordToEvent({ ...record, points: [] }, NOW)).toBeNull();
    expect(dgtRecordToEvent({ ...record, start: 'not-a-date' }, NOW)).toBeNull();
    expect(dgtRecordToEvent({ ...record, end: 'garbage' }, NOW)).not.toBeNull();
  });

  it('carries the attribution required by the licence', () => {
    expect(DGT_ATTRIBUTION).toContain('DGT');
    expect(DGT_ATTRIBUTION).toContain('Creative Commons');
  });
});
