// Le match mis en avant (SportsHub, RME TV) est écrit en dur. Sans garde de
// date, Maroc–Gabon du 25 septembre 2026 restait affiché après coup comme
// « Direct officiel », avec des badges LIVE (constaté le 6 octobre 2026).
export const FEATURED_MATCH_DAY = '2026-09-25';

/** Date du jour à Paris, au format AAAA-MM-JJ. */
export function parisDay(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export type MatchTiming = 'upcoming' | 'today' | 'played';

export function featuredMatchTiming(day: string): MatchTiming {
  if (day === FEATURED_MATCH_DAY) return 'today';
  return day < FEATURED_MATCH_DAY ? 'upcoming' : 'played';
}
