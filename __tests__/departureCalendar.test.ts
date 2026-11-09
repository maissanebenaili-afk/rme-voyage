import { countByLevel, eidAnnounced, monthDays, shiftMonth } from '@/lib/departureCalendar'

describe('monthDays', () => {
  it('lists every day of the month with a Monday-first weekday', () => {
    const days = monthDays({ year: 2026, month: 2 })
    expect(days).toHaveLength(28)
    expect(days[0]).toMatchObject({ iso: '2026-02-01', day: 1, weekday: 6, level: 'calme' }) // dimanche
    expect(monthDays({ year: 2028, month: 2 })).toHaveLength(29) // année bissextile
  })

  it('carries the crossing pressure of each day', () => {
    const july = monthDays({ year: 2027, month: 7 })
    expect(july[13]).toMatchObject({ iso: '2027-07-14', level: 'charge' })
    expect(july[14]).toMatchObject({ iso: '2027-07-15', level: 'tres-charge' })
    expect(countByLevel(july)).toEqual({ calme: 0, charge: 14, 'tres-charge': 17 })
  })

  it('rejects an impossible month', () => {
    expect(() => monthDays({ year: 2027, month: 13 })).toThrow('Mois invalide')
    expect(() => monthDays({ year: 2027, month: 0 })).toThrow('Mois invalide')
  })
})

describe('shiftMonth', () => {
  it('crosses year boundaries both ways', () => {
    expect(shiftMonth({ year: 2026, month: 12 }, 1)).toEqual({ year: 2027, month: 1 })
    expect(shiftMonth({ year: 2027, month: 1 }, -1)).toEqual({ year: 2026, month: 12 })
    expect(shiftMonth({ year: 2026, month: 11 }, 8)).toEqual({ year: 2027, month: 7 })
  })
})

describe('eidAnnounced', () => {
  it('is true only for years whose Aïd dates are in the announced list', () => {
    expect(eidAnnounced(2026)).toBe(true)
    expect(eidAnnounced(2031)).toBe(false)
  })
})
