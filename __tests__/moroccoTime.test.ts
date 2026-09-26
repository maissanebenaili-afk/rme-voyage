import { moroccoTimeZone, moroccoUtcOffset, utcOffsetLabel } from '../lib/moroccoTime'

describe('Morocco time after the return to GMT on 2026-09-20', () => {
  it('reads Morocco in UTC from 2026-09-20 01:00 UTC, whatever the tzdata says', () => {
    expect(moroccoTimeZone(new Date('2026-09-20T00:59:00Z'))).toBe('Africa/Casablanca')
    expect(moroccoTimeZone(new Date('2026-09-20T01:00:00Z'))).toBe('UTC')
    expect(moroccoUtcOffset(new Date('2026-09-26T17:00:00Z'))).toBe('UTC+0')
    expect(new Date('2026-09-26T17:09:00Z').toLocaleTimeString('fr-FR', { timeZone: moroccoTimeZone(new Date('2026-09-26T17:09:00Z')), hour: '2-digit', minute: '2-digit' })).toBe('17:09')
  })

  it('labels offsets as UTC±N', () => {
    expect(utcOffsetLabel('UTC')).toBe('UTC+0')
    expect(utcOffsetLabel('Europe/Paris', new Date('2026-07-01T12:00:00Z'))).toBe('UTC+2')
    expect(utcOffsetLabel('Europe/Paris', new Date('2026-12-01T12:00:00Z'))).toBe('UTC+1')
  })
})
