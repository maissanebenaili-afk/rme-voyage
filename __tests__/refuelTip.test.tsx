import { readFileSync } from 'fs'
import { join } from 'path'
import { render, screen } from '@testing-library/react'
import FuelByCountryPanel from '@/components/FuelByCountryPanel'
import { computeFuelByCountry, refuelTip, type FuelPriceDataset } from '@/lib/fuelByCountry'
import { getRoutePage } from '@/lib/routePages'
import { inCountry } from '@/lib/countries'
import { HOME_TEXT } from '@/lib/homeI18n'
import type { RouteLeg } from '@/lib/routeLegs'

const dataset: FuelPriceDataset = {
  source: 'test',
  sourceUrl: 'https://example.test/wob.xlsx',
  observedAt: '2026-09-21',
  prices: { FR: { diesel: 2.0 }, ES: { diesel: 1.5 }, PT: { diesel: 1.95 } },
}

const road = (countries: [string, number][]): RouteLeg => ({
  kind: 'road', from: 'A', to: 'B', distanceMeters: countries.reduce((s, [, km]) => s + km * 1000, 0), durationSeconds: 1,
  countries: countries.map(([country, km]) => ({ country, meters: km * 1000 })),
})

const run = (legs: RouteLeg[], now = '2026-09-25T12:00:00Z', ds = dataset) =>
  computeFuelByCountry({ legs, consumptionPer100Km: 6, fuelType: 'diesel', fallbackPricePerLiter: 1.1, now: new Date(now), dataset: ds })

describe('refuelTip — where to fill up, from official prices only', () => {
  it('names the cheapest and dearest crossed countries with the gap for 50 litres', () => {
    expect(refuelTip(run([road([['FR', 800], ['ES', 1100]])]))).toEqual({ cheap: 'ES', dear: 'FR', percentCheaper: 25, gapFor50Liters: 25 })
  })

  it('never compares a price typed by the user (Morocco is cheaper here, but it is a guess)', () => {
    const tip = refuelTip(run([road([['FR', 800], ['ES', 1100]]), road([['MA', 300]])]))
    expect(tip?.cheap).toBe('ES')
  })

  it('stays silent with one priced country, below 5 %, or once the bulletin has expired', () => {
    expect(refuelTip(run([road([['ES', 700]])]))).toBeNull()
    expect(refuelTip(run([road([['FR', 300], ['PT', 300]])]))).toBeNull() // 2,5 %
    expect(refuelTip(run([road([['FR', 800], ['ES', 1100]])], '2026-10-20T12:00:00Z'))).toBeNull()
  })

  it('real Paris → Tanger route with the bulletin of 21 Sept 2026: Spain is 20 % cheaper than France', () => {
    const legs = getRoutePage('paris-tanger')!.legs
    // Prices of that bulletin, pinned so the automatic weekly update cannot break this test.
    const bulletin: FuelPriceDataset = { ...dataset, prices: { FR: { diesel: 2.383 }, ES: { diesel: 1.918 } } }
    const result = computeFuelByCountry({ legs, consumptionPer100Km: 6.5, fuelType: 'diesel', fallbackPricePerLiter: 1.25, now: new Date('2026-10-04T12:00:00Z'), dataset: bulletin })
    expect(refuelTip(result)).toEqual({ cheap: 'ES', dear: 'FR', percentCheaper: 20, gapFor50Liters: 23 })
  })

  it('uses the right French preposition for each country', () => {
    expect(inCountry('ES')).toBe('en Espagne')
    expect(inCountry('PT')).toBe('au Portugal')
    expect(inCountry('NL')).toBe('aux Pays-Bas')
    expect(inCountry('MC')).toBe('à Monaco')
    render(<FuelByCountryPanel result={run([road([['PT', 800], ['ES', 300]])], '2026-09-25T12:00:00Z', { ...dataset, prices: { ES: { diesel: 1.5 }, PT: { diesel: 2.0 } } })} fuelType="diesel" />)
    expect(screen.getByText(/de moins en Espagne qu'au Portugal/)).toBeTruthy()
  })

  it('the panel turns it into one sentence', () => {
    render(<FuelByCountryPanel result={run([road([['FR', 800], ['ES', 1100]])])} fuelType="diesel" />)
    expect(screen.getByText(/coûte 25 % de moins en Espagne qu'en\s+France/)).toBeTruthy()
  })
})

describe('flight price input asks for the price with bags', () => {
  it('labels the field and warns that the lowest fares usually exclude checked bags, in every language', () => {
    // Measured 4 Oct 2026 (Kiwi, family of 4, Paris → Tanger, Aug 2027): 1 349 € without bags, 1 885 € with one bag each.
    const source = readFileSync(join(process.cwd(), 'components/TripDecisionEngine.tsx'), 'utf8')
    expect(source).toContain('h.flightBagsNote')
    expect(HOME_TEXT.fr.fieldFlight).toContain('valises incluses')
    expect(HOME_TEXT.fr.flightBagsNote).toContain('exclut souvent la valise en soute')
    for (const texts of Object.values(HOME_TEXT)) expect(texts.flightBagsNote.trim()).not.toBe('')
  })
})
