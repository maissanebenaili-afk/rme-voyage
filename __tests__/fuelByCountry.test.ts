import { computeFuelByCountry, datasetExpiry, FUEL_PRICES, type FuelPriceDataset } from '@/lib/fuelByCountry'
import type { RoadLeg, RouteLeg } from '@/lib/routeLegs'

const dataset: FuelPriceDataset = {
  source: 'test',
  sourceUrl: 'https://example.test/wob.xlsx',
  observedAt: '2026-09-21',
  prices: { FR: { diesel: 2.0, petrol95: 1.9 }, ES: { diesel: 1.5, petrol95: 1.6 } },
}

const europeLeg: RoadLeg = {
  kind: 'road', from: 'Paris', to: 'Tarifa', distanceMeters: 1_900_000, durationSeconds: 1,
  countries: [{ country: 'FR', meters: 1_000_000 }, { country: 'ES', meters: 900_000 }],
}

const legs: RouteLeg[] = [
  europeLeg,
  { kind: 'ferry', from: 'Tarifa', to: 'Tanger Ville', distanceMeters: 30_000 },
  {
    kind: 'road', from: 'Tanger Ville', to: 'Marrakech', distanceMeters: 600_000, durationSeconds: 1,
    countries: [{ country: 'MA', meters: 600_000 }],
  },
]

const base = {
  legs,
  consumptionPer100Km: 5,
  fuelType: 'diesel' as const,
  fallbackPricePerLiter: 1.2,
  now: new Date('2026-09-25T12:00:00Z'),
  dataset,
}

describe('computeFuelByCountry', () => {
  it('prices each country with the bulletin, falls back to the user price outside the EU', () => {
    const r = computeFuelByCountry(base)
    // FR 1000 km × 0,05 L/km × 2,0 = 100 ; ES 900 × 0,05 × 1,5 = 67,5 ; MA 600 × 0,05 × 1,2 = 36
    expect(r.countries).toEqual([
      { country: 'FR', km: 1000, pricePerLiter: 2.0, priceSource: 'bulletin', cost: 100 },
      { country: 'ES', km: 900, pricePerLiter: 1.5, priceSource: 'bulletin', cost: 67.5 },
      { country: 'MA', km: 600, pricePerLiter: 1.2, priceSource: 'user', cost: 36 },
    ])
    expect(r.fuelTotal).toBe(203.5)
    expect(r.legs[0]).toMatchObject({ kind: 'road', km: 1900, fuel: 167.5 })
    expect(r.legs[1]).toEqual({ kind: 'ferry', from: 'Tarifa', to: 'Tanger Ville', km: 30 })
  })

  it('never burns fuel on the sea crossing', () => {
    const r = computeFuelByCountry(base)
    expect(r.roadKm).toBe(2500)
    expect(r.seaKm).toBe(30)
  })

  it('uses the selected fuel type', () => {
    expect(computeFuelByCountry({ ...base, fuelType: 'petrol95' }).countries[0].pricePerLiter).toBe(1.9)
  })

  it('switches every country to the user price once the bulletin is older than 14 days', () => {
    expect(datasetExpiry('2026-09-21').toISOString().slice(0, 10)).toBe('2026-10-05')
    const fresh = computeFuelByCountry({ ...base, now: new Date('2026-10-04T23:59:00Z') })
    const expired = computeFuelByCountry({ ...base, now: new Date('2026-10-05T00:00:00Z') })
    expect(fresh.dataset.fresh).toBe(true)
    expect(expired.dataset.fresh).toBe(false)
    expect(expired.countries.every((line) => line.priceSource === 'user' && line.pricePerLiter === 1.2)).toBe(true)
    expect(expired.fuelTotal).toBe(150) // 2500 km × 0,05 × 1,2
  })

  it('aggregates a country crossed by several legs', () => {
    const r = computeFuelByCountry({
      ...base,
      legs: [europeLeg, { ...europeLeg, countries: [{ country: 'FR', meters: 500_000 }] }],
    })
    expect(r.countries[0]).toMatchObject({ country: 'FR', km: 1500, cost: 150 })
  })

  it('ships a sourced, complete EU bulletin', () => {
    expect(FUEL_PRICES.sourceUrl).toMatch(/^https:\/\/energy\.ec\.europa\.eu\//)
    expect(FUEL_PRICES.observedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    for (const code of ['FR', 'ES', 'PT', 'BE', 'NL', 'DE', 'IT', 'LU', 'AT']) {
      expect(FUEL_PRICES.prices[code]?.diesel).toBeGreaterThan(0.5)
      expect(FUEL_PRICES.prices[code]?.diesel).toBeLessThan(5)
    }
    expect(FUEL_PRICES.prices.MA).toBeUndefined()
  })
})
