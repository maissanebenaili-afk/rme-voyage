/** RME Sports — Lot E.2 neutral data contract. No provider calls or UI. */
import { newId, type IdGenerator } from '@/lib/ids';
import { isHttpUrl, isPrimaryTruth, type TruthLevel } from '@/lib/trust';

export type SportEventKind = 'FIXTURE' | 'RESULT' | 'STANDING' | 'LIVE_STATUS' | 'PLAYER_EVENT';
export type SportStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED' | 'POSTPONED' | 'CANCELLED' | 'UNKNOWN';

export type SportEvent = {
  id: string;
  sport: string;
  competition?: string;
  kind: SportEventKind;
  level: TruthLevel;
  status: SportStatus;
  home?: string;
  away?: string;
  score?: { home: number; away: number };
  /** When the match starts. */
  startAt?: string;
  source: string;
  sourceUrl?: string;
  /** When the source last changed this data. */
  updatedAt: string;
};

export function createSportEvent(input: Omit<SportEvent, 'id'>, options: { newId?: IdGenerator } = {}): SportEvent {
  if (!input.sport.trim()) throw new Error('Sport is required');
  if (!input.source.trim()) throw new Error('Sport source is required');
  if (!input.updatedAt || Number.isNaN(Date.parse(input.updatedAt))) throw new Error('Valid updatedAt is required');
  if (input.startAt !== undefined && Number.isNaN(Date.parse(input.startAt))) throw new Error('startAt must be a valid date');
  if (input.sourceUrl !== undefined && !isHttpUrl(input.sourceUrl)) throw new Error('sourceUrl must be http(s)');
  if (input.kind === 'RESULT' && !input.score) throw new Error('Result requires a score');
  if (input.score && (input.score.home < 0 || input.score.away < 0 || !Number.isInteger(input.score.home) || !Number.isInteger(input.score.away))) {
    throw new Error('Score must contain non-negative integers');
  }
  return { ...input, id: (options.newId ?? newId)() };
}

export function canDisplayAsOfficial(event: Pick<SportEvent, 'level' | 'source'>): boolean {
  return isPrimaryTruth(event.level) && Boolean(event.source.trim());
}
