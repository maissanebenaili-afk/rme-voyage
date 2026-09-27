/** RME Sports — Lot E.2 neutral data contract. No provider calls or UI. */

export type SportTruthLevel = 'OFFICIAL_MEASURED' | 'COMMUNITY' | 'INFERRED';
export type SportEventKind = 'FIXTURE' | 'RESULT' | 'STANDING' | 'LIVE_STATUS' | 'PLAYER_EVENT';
export type SportStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED' | 'UNKNOWN';

export type SportEvent = {
  id: string;
  sport: string;
  competition?: string;
  kind: SportEventKind;
  level: SportTruthLevel;
  status: SportStatus;
  home?: string;
  away?: string;
  score?: { home: number; away: number };
  startAt?: string;
  source: string;
  sourceUrl?: string;
  updatedAt: string;
};

export function createSportEvent(input: Omit<SportEvent, 'id'>): SportEvent {
  if (!input.sport.trim()) throw new Error('Sport is required');
  if (!input.source.trim()) throw new Error('Sport source is required');
  if (!input.updatedAt || Number.isNaN(Date.parse(input.updatedAt))) throw new Error('Valid updatedAt is required');
  if (input.sourceUrl && !/^https?:\\/\\//.test(input.sourceUrl)) throw new Error('sourceUrl must be http(s)');
  if (input.kind === 'RESULT' && !input.score) throw new Error('Result requires a score');
  if (input.score && (input.score.home < 0 || input.score.away < 0 || !Number.isInteger(input.score.home) || !Number.isInteger(input.score.away))) {
    throw new Error('Score must contain non-negative integers');
  }
  return { ...input, id: crypto.randomUUID() };
}

export function isPrimarySportTruth(level: SportTruthLevel): boolean {
  return level === 'OFFICIAL_MEASURED';
}

export function canDisplayAsOfficial(event: SportEvent): boolean {
  return event.level === 'OFFICIAL_MEASURED' && Boolean(event.source.trim());
}
