import { ANNOUNCED_RELIGIOUS, civilHolidays, upcomingHolidays } from '@/lib/moroccanHolidays'

const at = (iso: string) => new Date(iso + 'T12:00:00').getTime()
const names = (now: number) => upcomingHolidays(now).holidays.map((h) => `${h.date} ${h.name}`)

describe('Moroccan holidays', () => {
  it('lists the Fête de l’Unité on 31 October from 2026 (royal decision of 2025-11-04), not before', () => {
    expect(civilHolidays(2026).map((h) => h.date)).toContain('2026-10-31')
    expect(civilHolidays(2025).map((h) => h.date)).not.toContain('2025-10-31')
    expect(names(at('2026-10-04'))[0]).toBe("2026-10-31 Fête de l'Unité")
  })

  it('names the Green March in French', () => {
    const all = civilHolidays(2026).map((h) => h.name).join(' | ')
    expect(all).toContain('Anniversaire de la Marche Verte')
    expect(all).not.toMatch(/Green March/)
  })

  it('has the official 2026 Aïd al-Adha date (27 May, not 28)', () => {
    expect(ANNOUNCED_RELIGIOUS.find((h) => h.name === 'Aïd al-Adha')?.date).toBe('2026-05-27')
  })

  it('never runs empty: after the last 2026 holiday it shows next year', () => {
    const list = names(at('2026-12-20'))
    expect(list.length).toBeGreaterThan(0)
    expect(list[0]).toBe("2027-01-01 Jour de l'An")
    expect(names(at('2031-06-01')).length).toBeGreaterThan(0)
  })

  it('says next year’s religious dates are not announced yet, instead of inventing them', () => {
    const { holidays, religiousPendingYears } = upcomingHolidays(at('2026-12-20'))
    expect(holidays.some((h) => h.type === 'islamic')).toBe(false)
    expect(religiousPendingYears).toEqual([2027])
    // 2026 has announced dates: no note for it.
    expect(upcomingHolidays(at('2026-10-04')).religiousPendingYears).not.toContain(2026)
  })

  it('includes the civil holidays that were missing (11 and 14 January, 1 May, 14 August)', () => {
    const dates = civilHolidays(2027).map((h) => h.date)
    for (const d of ['2027-01-11', '2027-01-14', '2027-05-01', '2027-08-14']) expect(dates).toContain(d)
  })
})
