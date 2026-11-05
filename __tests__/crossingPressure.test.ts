import { crossingPressure, nearestCalmerDay, PRESSURE_RULES } from '@/lib/crossingPressure'

describe('crossingPressure', () => {
  it('is calm outside summer and Aïd', () => {
    expect(crossingPressure('2026-11-10').level).toBe('calme')
    expect(crossingPressure('2027-02-03').level).toBe('calme')
  })

  it('is busy in the summer window and very busy at its core', () => {
    expect(crossingPressure('2026-06-20').level).toBe('charge')
    expect(crossingPressure('2026-09-10').level).toBe('charge')
    expect(crossingPressure('2026-08-01').level).toBe('tres-charge')
  })

  it('is very busy within 3 days of an announced Aïd, not 4', () => {
    expect(crossingPressure('2026-05-24').level).toBe('tres-charge')
    expect(crossingPressure('2026-05-30').level).toBe('tres-charge')
    expect(crossingPressure('2026-05-23').level).toBe('calme')
    expect(crossingPressure('2026-03-20').reason).toContain('Aïd al-Fitr')
  })

  it('does not invent an Aïd that is not announced', () => {
    expect(crossingPressure('2027-05-16').level).toBe('calme')
  })

  it('rejects an invalid date', () => {
    expect(() => crossingPressure('pas-une-date')).toThrow()
  })
})

describe('nearestCalmerDay', () => {
  it('returns null for a calm day', () => {
    expect(nearestCalmerDay('2026-11-10')).toBeNull()
  })

  it('suggests a calmer day, earlier first on a tie', () => {
    const found = nearestCalmerDay('2026-06-06')
    expect(found).toEqual({ date: '2026-06-04', level: 'calme' })
  })

  it('gives up when nothing calmer is close', () => {
    expect(nearestCalmerDay('2026-08-01', 5)).toBeNull()
  })
})

describe('PRESSURE_RULES', () => {
  it('describes the three levels', () => {
    expect(PRESSURE_RULES.map((r) => r.level)).toEqual(['tres-charge', 'charge', 'calme'])
  })
})
