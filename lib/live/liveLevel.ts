/**
 * RME Live — information level shown to a traveller. FOUNDATION ONLY (pure, not wired).
 *
 * INFO     : good to know, no urgency (roadworks, damaged surface, a vehicle that broke down, anything old).
 * ALERTE   : recent event that can change the trip (accident, slowdown, obstacle, rockfall, flooding, fire).
 * ACTION   : NOT implemented on purpose. A recommended action needs a reliable alternative
 *            (other route, other crossing) and no open source provides one today. Until one does,
 *            RME shows the official source and says nothing more.
 *
 * Severity coming from the feed is deliberately not used: its meaning is not documented in the
 * material read for this project (UNKNOWN), and on real data 75 long-running roadworks carry the
 * highest value.
 */
import type { RouteEvent } from '@/lib/routeEvents';
import { FRESH_ALERT_DAYS } from '@/lib/live/dgt';

export type LiveLevel = 'INFO' | 'ALERTE';

export function liveLevelOf(event: RouteEvent): LiveLevel {
  const meta = event.metadata ?? {};
  if (meta.stale === true) return 'INFO';
  if (event.kind !== 'ALERT') return 'INFO';
  const age = typeof meta.ageDays === 'number' ? meta.ageDays : Infinity;
  return age <= FRESH_ALERT_DAYS ? 'ALERTE' : 'INFO';
}

/** Events fit to display by default: old forgotten ones are kept out of the list, not deleted from the data. */
export function isShowable(event: RouteEvent): boolean {
  return event.metadata?.stale !== true;
}
