/** @jest-environment node */
import { countryAt, countryNear, splitByCountry } from '@/lib/countryLookup'
import { parseRouteLegs } from '@/lib/routeLegs'

describe('countryAt', () => {
  it.each([
    [[2.3522, 48.8566], 'FR'], // Paris
    [[-3.7038, 40.4168], 'ES'], // Madrid
    [[4.3517, 50.8503], 'BE'], // Bruxelles
    [[4.9041, 52.3676], 'NL'], // Amsterdam
    [[13.405, 52.52], 'DE'], // Berlin
    [[9.19, 45.4642], 'IT'], // Milan
    [[6.1432, 46.2044], 'CH'], // Genève
    [[-7.9811, 31.6295], 'MA'], // Marrakech
    [[-2.9335, 35.1681], 'MA'], // Nador
  ])('%j → %s', (point, code) => {
    expect(countryAt(point as [number, number])).toBe(code)
  })

  it('classifies estuary/peninsula cities via the neighbourhood search', () => {
    expect(countryAt([-9.1393, 38.7223])).toBeNull() // Lisbonne : estuaire à l'échelle 1:50m
    expect(countryNear([-9.1393, 38.7223])).toBe('PT')
    expect(countryNear([-15.9582, 23.6848])).toBe('MA') // Dakhla
    expect(countryNear([-20, 40])).toBeNull() // plein Atlantique
  })

  it('returns null at sea', () => {
    expect(countryAt([-5.6, 35.95])).toBeNull() // détroit de Gibraltar
  })
})

describe('splitByCountry', () => {
  it('splits a Paris → Madrid line across FR and ES and preserves the total', () => {
    const parts = splitByCountry([[2.3522, 48.8566], [-1.0, 44.0], [-3.7038, 40.4168]], 1_270_000)
    expect(parts.map((p) => p.country)).toEqual(['FR', 'ES'])
    expect(Math.abs(parts.reduce((s, p) => s + p.meters, 0) - 1_270_000)).toBeLessThanOrEqual(1)
  })

  it('attributes a short leading off-coast stretch to the next country, not to "null"', () => {
    // Le terminal de Tarifa est « en mer » sur le trait de côte 1:50m.
    const parts = splitByCountry([[-5.6026, 36.0109], [-5.58, 36.03], [-3.7038, 40.4168]], 600_000)
    expect(parts.map((p) => p.country)).toEqual(['ES'])
  })

  it('keeps a long stretch through an uncovered country as "null" instead of the previous country', () => {
    // Oujda (MA) → Oran (Algérie, hors couverture) : ~200 km hors contours.
    const parts = splitByCountry([[-1.908, 34.681], [-1.7, 34.75], [-1.3, 34.88], [-0.64, 35.7]], 230_000)
    expect(parts.map((p) => p.country)).toEqual(['MA', null])
    expect(parts[1].meters).toBeGreaterThan(100_000)
  })

  it('returns nothing for a degenerate line', () => {
    expect(splitByCountry([[1, 1], [1, 1]], 10)).toEqual([])
  })
})

describe('parseRouteLegs', () => {
  it('accepts well-formed legs and rejects malformed payloads', () => {
    const road = { kind: 'road', from: 'A', to: 'B', distanceMeters: 1, durationSeconds: 1, countries: [{ country: 'FR', meters: 1 }] }
    const ferry = { kind: 'ferry', from: 'B', to: 'C', distanceMeters: 1, measured: 'route' }
    expect(parseRouteLegs([road, ferry])).toHaveLength(2)
    expect(parseRouteLegs([])).toBeNull()
    expect(parseRouteLegs('x')).toBeNull()
    expect(parseRouteLegs([{ ...road, countries: [{ country: 'france', meters: 1 }] }])).toBeNull()
    expect(parseRouteLegs([{ ...ferry, distanceMeters: -1 }])).toBeNull()
    expect(parseRouteLegs([{ ...road, kind: 'plane' }])).toBeNull()
  })
})
