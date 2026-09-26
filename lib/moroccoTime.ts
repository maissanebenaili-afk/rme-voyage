// Morocco left UTC+1 for permanent UTC+0 on 2026-09-20 at 02:00 local time
// (decree 2.26.530, tzdata 2026c). Phones and servers with older tzdata still
// apply +1 to Africa/Casablanca, so from that moment the clock is read in UTC.
const MOROCCO_GMT_SINCE = Date.UTC(2026, 8, 20, 1, 0, 0);

export function moroccoTimeZone(now: Date = new Date()): string {
  return now.getTime() >= MOROCCO_GMT_SINCE ? 'UTC' : 'Africa/Casablanca';
}

export function utcOffsetLabel(timeZone: string, now: Date = new Date()): string {
  const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
    .formatToParts(now)
    .find(p => p.type === 'timeZoneName')?.value ?? 'GMT';
  return name === 'GMT' || name === 'UTC' ? 'UTC+0' : name.replace(/^(GMT|UTC)/, 'UTC');
}

export function moroccoUtcOffset(now: Date = new Date()): string {
  return utcOffsetLabel(moroccoTimeZone(now), now);
}
