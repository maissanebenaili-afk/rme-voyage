/** RME Route Events — Lot E foundation. No UI, feed, persistence, partner integration, or network calls. */

export type RouteEventLevel = 'OFFICIAL_MEASURED' | 'COMMUNITY' | 'INFERRED';
export type RouteEventKind = 'ROUTE_UPDATE' | 'TRANSPORT' | 'WEATHER' | 'SPORT' | 'CULTURE' | 'ALERT' | 'LOCAL_INFO';
export type RouteEvent = {
  id: string; kind: RouteEventKind; level: RouteEventLevel; title: string; summary: string;
  source?: string; sourceUrl?: string; occurredAt?: string; expiresAt?: string;
  location?: { country?: string; city?: string; latitude?: number; longitude?: number };
  metadata?: Record<string, string | number | boolean>;
};
export type CreateRouteEventInput = Omit<RouteEvent, 'id'> & { id?: string };
function eventId(): string { return 'rme-event-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10); }
function validIsoDate(value: string | undefined): boolean { return value === undefined || !Number.isNaN(Date.parse(value)); }
export function createRouteEvent(input: CreateRouteEventInput): RouteEvent {
  if (!input.title.trim()) throw new Error('Route event title is required');
  if (!input.summary.trim()) throw new Error('Route event summary is required');
  if (!validIsoDate(input.occurredAt) || !validIsoDate(input.expiresAt)) throw new Error('Route event dates must be valid ISO dates');
  if (input.sourceUrl && !/^https?:\/\//.test(input.sourceUrl)) throw new Error('Route event sourceUrl must be http(s)');
  return { ...input, id: input.id ?? eventId(), title: input.title.trim(), summary: input.summary.trim() };
}
export function isPrimaryTruth(level: RouteEventLevel): boolean { return level === 'OFFICIAL_MEASURED'; }