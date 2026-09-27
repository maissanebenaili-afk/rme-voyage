/** RME Route Events — Lot E foundation. No UI, feed, persistence, partner integration, or network calls. */
import { newId, type IdGenerator } from '@/lib/ids';
import { isHttpUrl, type TruthLevel } from '@/lib/trust';

export type RouteEventKind = 'ROUTE_UPDATE' | 'TRANSPORT' | 'WEATHER' | 'SPORT' | 'CULTURE' | 'ALERT' | 'LOCAL_INFO';

export type RouteEvent = {
  id: string;
  kind: RouteEventKind;
  level: TruthLevel;
  title: string;
  summary: string;
  source?: string;
  sourceUrl?: string;
  /** When it happened or will happen. */
  occurredAt?: string;
  /** After this, the event should no longer be shown. */
  expiresAt?: string;
  location?: { country?: string; city?: string; latitude?: number; longitude?: number };
  metadata?: Record<string, string | number | boolean>;
};

function isDate(value: string | undefined): boolean {
  return value === undefined || !Number.isNaN(Date.parse(value));
}

export function createRouteEvent(input: Omit<RouteEvent, 'id'>, options: { newId?: IdGenerator } = {}): RouteEvent {
  if (!input.title.trim()) throw new Error('Route event title is required');
  if (!input.summary.trim()) throw new Error('Route event summary is required');
  if (!isDate(input.occurredAt) || !isDate(input.expiresAt)) throw new Error('Route event dates must be valid ISO dates');
  if (input.sourceUrl !== undefined && !isHttpUrl(input.sourceUrl)) throw new Error('Route event sourceUrl must be http(s)');
  const loc = input.location;
  if (loc && ((loc.latitude !== undefined && Math.abs(loc.latitude) > 90) || (loc.longitude !== undefined && Math.abs(loc.longitude) > 180))) {
    throw new Error('Route event coordinates are out of range');
  }
  return { ...input, id: (options.newId ?? newId)(), title: input.title.trim(), summary: input.summary.trim() };
}
