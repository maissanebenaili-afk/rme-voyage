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

  it('attributes a leading off-coast segment to the next country, not to "null"', () => {
    const parts = splitByCountry([[-5.81, 35.79], [-6.5, 35.2], [-7.98, 31.63]], 500_000)
    expect(parts.map((p) => p.country)).toEqual(['MA'])
  })

  it('returns nothing for a degenerate line', () => {
    expect(splitByCountry([[1, 1], [1, 1]], 10)).toEqual([])
  })
})

describe('parseRouteLegs', () => {
  it('accepts well-formed legs and rejects malformed payloads', () => {
    const road = { kind: 'road', from: 'A', to: 'B', distanceMeters: 1, durationSeconds: 1, countries: [{ country: 'FR', meters: 1 }] }
    const ferry = { kind: 'ferry', from: 'B', to: 'C', distanceMeters: 1 }
    expect(parseRouteLegs([road, ferry])).toHaveLength(2)
    expect(parseRouteLegs([])).toBeNull()
    expect(parseRouteLegs('x')).toBeNull()
    expect(parseRouteLegs([{ ...road, countries: [{ country: 'france', meters: 1 }] }])).toBeNull()
    expect(parseRouteLegs([{ ...ferry, distanceMeters: -1 }])).toBeNull()
    expect(parseRouteLegs([{ ...road, kind: 'plane' }])).toBeNull()
  })
})
