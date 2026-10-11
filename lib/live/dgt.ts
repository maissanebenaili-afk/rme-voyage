/**
 * RME Live — DGT (Spain) adapter. FOUNDATION ONLY: pure functions, no network, no UI, not
 * wired to any screen. It turns the open DATEX II v3.7 situation feed into the existing
 * `RouteEvent` contract so that a future live layer reuses `lib/routeEvents.ts` and the
 * shared provenance levels of `lib/trust.ts`.
 *
 * Source: https://nap.dgt.es/en/dataset/incidencias-dgt-datex2-v3-7 — Creative Commons
 * licence with attribution (shown on 2026-10-03); the legal notice is https://www.dgt.es/contenido/aviso-legal/.
 * Coverage: Spanish national network except the Basque Country and Catalonia.
 *
 * Measured on the real feed (2026-10-03): 731 records, 645 without any severity, 74 still
 * "active" after 180 days or more. A record flagged active is therefore NOT proof that the
 * event is current: `stale` below exists for that reason.
 */
import type { IdGenerator } from '@/lib/ids';
import { createRouteEvent, type RouteEvent, type RouteEventKind } from '@/lib/routeEvents';
import type { LonLat } from '@/lib/geo';

export const DGT_SOURCE_NAME = 'DGT (Espagne)';
export const DGT_SOURCE_URL = 'https://nap.dgt.es/en/dataset/incidencias-dgt-datex2-v3-7';
export const DGT_ATTRIBUTION = 'Données : DGT (Espagne), licence Creative Commons avec attribution — nap.dgt.es';

/** The feed weighs about 3 MB; anything far above that is not the feed we know. */
const MAX_FEED_CHARS = 12_000_000;
/** An event without an end date and older than this is treated as possibly forgotten. */
export const STALE_AFTER_DAYS = 30;
/** An accident or a slowdown is only an alert while it is this recent. */
export const FRESH_ALERT_DAYS = 3;

export type DgtRecord = {
  id: string;
  recordType: string;
  provider?: string;
  causeType?: string;
  detailType?: string;
  severity?: string;
  start?: string;
  end?: string;
  roadName?: string;
  /** [lon, lat] points, in document order. */
  points: LonLat[];
};

const ATTR_ID = /\bid="([^"]*)"/;
const ATTR_TYPE = /xsi:type="(?:\w+:)?(\w+)"/;
const POINT = /<(?:\w+:)?latitude>\s*(-?\d+(?:\.\d+)?)\s*<\/(?:\w+:)?latitude>\s*<(?:\w+:)?longitude>\s*(-?\d+(?:\.\d+)?)\s*</g;

function firstTag(block: string, name: string): string | undefined {
  const match = new RegExp(`<(?:\\w+:)?${name}>\\s*([^<]*?)\\s*<`).exec(block);
  return match?.[1] || undefined;
}

/**
 * Reads the situation records of a DGT DATEX II feed. Records of a situation whose
 * `informationStatus` is not "real" (tests, exercises) and records that are not "active"
 * are skipped. Never throws: malformed or oversized input gives an empty list.
 */
export function parseDgtFeed(xml: unknown): DgtRecord[] {
  if (typeof xml !== 'string' || xml.length === 0 || xml.length > MAX_FEED_CHARS) return [];
  const records: DgtRecord[] = [];
  const situations = xml.matchAll(/<(?:\w+:)?situation\b[^>]*>([\s\S]*?)<\/(?:\w+:)?situation>/g);
  for (const situation of situations) {
    const body = situation[1];
    const status = firstTag(body, 'informationStatus');
    if (status !== undefined && status !== 'real') continue;
    for (const record of body.matchAll(/<(?:\w+:)?situationRecord\b([^>]*)>([\s\S]*?)<\/(?:\w+:)?situationRecord>/g)) {
      const attrs = record[1];
      const block = record[2];
      const id = ATTR_ID.exec(attrs)?.[1];
      const recordType = ATTR_TYPE.exec(attrs)?.[1];
      if (!id || !recordType) continue;
      const validity = firstTag(block, 'validityStatus');
      if (validity !== undefined && validity !== 'active') continue;
      const detail = /<(?:\w+:)?detailedCauseType>\s*<(?:\w+:)?\w+>\s*([^<]*?)\s*</.exec(block);
      const points: LonLat[] = [];
      for (const p of block.matchAll(POINT)) {
        const lat = Number(p[1]);
        const lon = Number(p[2]);
        if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) points.push([lon, lat]);
      }
      records.push({
        id,
        recordType,
        provider: firstTag(block, 'sourceIdentification'),
        causeType: firstTag(block, 'causeType'),
        detailType: detail?.[1] || undefined,
        severity: firstTag(block, 'severity'),
        start: firstTag(block, 'overallStartTime'),
        end: firstTag(block, 'overallEndTime'),
        roadName: firstTag(block, 'roadName'),
        points,
      });
    }
  }
  return records;
}

const LABELS_FR: Record<string, string> = {
  roadworks: 'Travaux',
  accident: 'Accident',
  vehicleStuck: 'Véhicule immobilisé',
  vehicleOnFire: 'Véhicule en feu',
  objectOnTheRoad: 'Objet sur la chaussée',
  rockfalls: 'Chute de pierres',
  flooding: 'Inondation',
  slowTraffic: 'Circulation ralentie',
  damagedRoadSurface: 'Chaussée dégradée',
};

/** Causes that matter to a traveller while they are recent. Everything else stays informational. */
const ALERT_DETAILS = new Set(['accident', 'vehicleOnFire', 'objectOnTheRoad', 'rockfalls', 'flooding', 'slowTraffic']);

function labelOf(record: DgtRecord): string {
  return (record.detailType && LABELS_FR[record.detailType]) || 'Perturbation signalée';
}

function kindOf(record: DgtRecord): RouteEventKind {
  return record.detailType && ALERT_DETAILS.has(record.detailType) ? 'ALERT' : 'ROUTE_UPDATE';
}

function dayOf(iso: string | undefined): string | undefined {
  return iso && !Number.isNaN(Date.parse(iso)) ? iso.slice(0, 10) : undefined;
}

export function ageInDays(start: string | undefined, now: Date): number | undefined {
  if (!start || Number.isNaN(Date.parse(start))) return undefined;
  return Math.max(0, Math.floor((now.getTime() - Date.parse(start)) / 86_400_000));
}

/**
 * One record as a `RouteEvent`, or null when it must not be shown: no usable position, an end
 * date already past, or an unreadable start date. Position is the first point of the record.
 * Nothing is invented: no estimated delay, no alternative route, no severity from the feed
 * (its meaning is not documented here, so it is kept only as raw metadata).
 */
export function dgtRecordToEvent(record: DgtRecord, now: Date, options: { newId?: IdGenerator } = {}): RouteEvent | null {
  const [lon, lat] = record.points[0] ?? [];
  if (lon === undefined || lat === undefined) return null;
  if (record.end && !Number.isNaN(Date.parse(record.end)) && Date.parse(record.end) < now.getTime()) return null;
  const age = ageInDays(record.start, now);
  if (age === undefined) return null;
  const end = record.end && !Number.isNaN(Date.parse(record.end)) ? record.end : undefined; // an unreadable end counts as "not communicated"
  const hasEnd = end !== undefined;
  const stale = !hasEnd && age >= STALE_AFTER_DAYS;
  const road = record.roadName ? ` — ${record.roadName}` : '';
  const startDay = dayOf(record.start);
  const endDay = dayOf(end);
  const summary = [
    `Signalé par la DGT depuis le ${startDay}.`,
    endDay ? `Fin annoncée : ${endDay}.` : 'Fin non communiquée.',
    stale ? `Information ancienne (${age} jours) : à vérifier auprès de la source.` : '',
  ].filter(Boolean).join(' ');
  const metadata: Record<string, string | number | boolean> = { provider: record.provider ?? 'DGT', recordId: record.id, ageDays: age, hasEnd, stale };
  if (record.detailType) metadata.cause = record.detailType;
  if (record.roadName) metadata.road = record.roadName;
  if (record.severity) metadata.severityRaw = record.severity;
  return createRouteEvent({
    kind: kindOf(record),
    level: 'OFFICIAL',
    title: `${labelOf(record)}${road}`,
    summary,
    source: DGT_SOURCE_NAME,
    sourceUrl: DGT_SOURCE_URL,
    occurredAt: record.start,
    expiresAt: end,
    location: { country: 'ES', latitude: lat, longitude: lon },
    metadata,
  }, options);
}

/**
 * The feed publishes one record per direction of the same works or incident (same road, cause, dates,
 * same two end points, reversed). A traveller must see it once, so those records are merged here.
 */
function duplicateKey(record: DgtRecord): string {
  const ends = record.points.map(([lon, lat]) => `${lon.toFixed(4)},${lat.toFixed(4)}`).sort().join(';');
  return [record.roadName, record.detailType, record.start, record.end, ends].join('|');
}

/** Whole feed to events: expired, position-less and duplicate (opposite direction) records dropped. */
export function dgtFeedToEvents(xml: unknown, now: Date, options: { newId?: IdGenerator } = {}): RouteEvent[] {
  const events: RouteEvent[] = [];
  const seen = new Set<string>();
  for (const record of parseDgtFeed(xml)) {
    const key = duplicateKey(record);
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      const event = dgtRecordToEvent(record, now, options);
      if (event) events.push(event);
    } catch {
      // one malformed record never hides the others
    }
  }
  return events;
}
