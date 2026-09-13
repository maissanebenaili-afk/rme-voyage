import { searchCitySuggestions, CITY_SUGGESTIONS } from '@/lib/geocoding'

describe('searchCitySuggestions (local, no network)', () => {
  it('returns an empty array for queries shorter than 2 characters', () => {
    expect(searchCitySuggestions('')).toEqual([])
    expect(searchCitySuggestions('P')).toEqual([])
  })

  it('matches case- and accent-insensitively', () => {
    const results = searchCitySuggestions('tanger')
    expect(results.some((r) => r.displayName === 'Tanger, Maroc')).toBe(true)

    const accented = searchCitySuggestions('fes')
    expect(accented.some((r) => r.displayName === 'Fès, Maroc')).toBe(true)
  })

  it('respects the limit parameter', () => {
    const results = searchCitySuggestions('a', 3)
    expect(results.length).toBeLessThanOrEqual(3)
  })

  it('contains around 25 curated Europe/Morocco cities as plain text (no coordinates)', () => {
    expect(CITY_SUGGESTIONS.length).toBeGreaterThanOrEqual(20)
    expect(CITY_SUGGESTIONS.length).toBeLessThanOrEqual(30)
    for (const city of CITY_SUGGESTIONS) {
      expect(typeof city.displayName).toBe('string')
      expect(city).not.toHaveProperty('lat')
      expect(city).not.toHaveProperty('lon')
    }
  })

  it('returns no results for a city not in the curated list (free text still allowed by callers)', () => {
    const results = searchCitySuggestions('Nouakchott')
    expect(results).toEqual([])
  })
})
