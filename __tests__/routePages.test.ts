/** @jest-environment node */
import { computeFuelByCountry } from '@/lib/fuelByCountry'
import {
  ferryOf,
  formatDuration,
  formatKm,
  getRoutePage,
  NON_EU_FALLBACK_PRICE,
  REFERENCE_CONSUMPTION_L_PER_100KM,
  ROUTE_PAGES,
} from '@/lib/routePages'
import { parseRouteLegs } from '@/lib/routeLegs'

describe('routePages dataset', () => {
  it('is dated and states where the itineraries come from', () => {
    expect(ROUTE_PAGES.generatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(ROUTE_PAGES.source).toMatch(/OSRM/)
    expect(ROUTE_PAGES.routes.length).toBeGreaterThan(5)
  })

  it('has unique slugs and well-formed legs everywhere', () => {
    const slugs = ROUTE_PAGES.routes.map((r) => r.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    for (const route of ROUTE_PAGES.routes) {
      expect(route.slug).toMatch(/^[a-z0-9-]+$/)
      expect(parseRouteLegs(route.legs)).not.toBeNull()
      expect(route.distanceMeters).toBeGreaterThan(0)
      expect(route.durationSeconds).toBeGreaterThan(0)
    }
  })

  it('states a road distance that matches the sum of its road legs (crossing excluded)', () => {
    for (const route of ROUTE_PAGES.routes) {
      const road = route.legs
        .filter((leg) => leg.kind === 'road')
        .reduce((sum, leg) => sum + leg.distanceMeters, 0)
      expect(Math.abs(road - route.distanceMeters)).toBeLessThanOrEqual(1)
    }
  })

  it('routes every Morocco-bound trip through a crossing, and lists its alternatives', () => {
    for (const route of ROUTE_PAGES.routes) {
      const ferry = ferryOf(route)
      expect(ferry).toBeDefined()
      expect(route.crossings.length).toBeGreaterThan(1)
      // La traversée retenue est bien la première du classement.
      expect(route.crossings[0].from).toBe(ferry!.from)
      const totals = route.crossings.map((c) => c.roadMeters + c.seaMeters)
      expect([...totals].sort((a, b) => a - b)).toEqual(totals)
    }
  })

  it('ends every route in Morocco and starts none there', () => {
    for (const route of ROUTE_PAGES.routes) {
      const roads = route.legs.filter((leg) => leg.kind === 'road')
      expect(roads.at(-1)!.countries.at(-1)!.country).toBe('MA')
      expect(roads[0].countries[0].country).not.toBe('MA')
    }
  })

  it('prices fuel per country without burning any on the sea, for every published route', () => {
    for (const route of ROUTE_PAGES.routes) {
      const fuel = computeFuelByCountry({
        legs: route.legs,
        consumptionPer100Km: REFERENCE_CONSUMPTION_L_PER_100KM,
        fuelType: 'diesel',
        fallbackPricePerLiter: NON_EU_FALLBACK_PRICE,
        now: new Date(`${ROUTE_PAGES.generatedAt}T12:00:00Z`),
      })
      expect(fuel.seaKm).toBeGreaterThan(0)
      expect(fuel.roadKm).toBeCloseTo(route.distanceMeters / 1000, 0)
      // Un plein de gazole ne coûte ni 0 € ni le prix d'un billet d'avion long-courrier.
      expect(fuel.fuelTotal).toBeGreaterThan(20)
      expect(fuel.fuelTotal).toBeLessThan(600)
      // Le Maroc n'est pas dans le bulletin UE : prix d'hypothèse, signalé.
      const morocco = fuel.countries.find((line) => line.country === 'MA')
      expect(morocco?.priceSource).toBe('user')
    }
  })

  it('looks a route up by slug and formats its figures in French', () => {
    const route = getRoutePage('paris-tanger')
    expect(route?.originCity).toBe('Paris')
    expect(route?.destinationCity).toBe('Tanger')
    expect(getRoutePage('nope')).toBeUndefined()
    expect(formatKm(1_940_000)).toMatch(/^1\s?940 km$/)
    expect(formatDuration(74_520)).toBe('20 h 42')
    expect(formatDuration(7_200)).toBe('2 h')
  })
})
