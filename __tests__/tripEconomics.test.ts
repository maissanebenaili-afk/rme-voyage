import { computeTripEconomics, type TripEconomicsInput } from '@/lib/tripEconomics'

const base: TripEconomicsInput = {
  distanceKm: 1000,
  consumptionPer100Km: 6,
  fuelPricePerLiter: 1.5,
  tollsTotal: 100,
  ferryTotal: 200,
  travelers: 4,
  flightPricePerPerson: 150,
  mode: 'car',
}

describe('computeTripEconomics', () => {
  it('computes each scenario deterministically', () => {
    const r = computeTripEconomics(base)
    expect(r.fuel).toBe(90) // 10 × 6 × 1.5
    expect(r.carTrip).toBe(190)
    expect(r.mixedTrip).toBe(390)
    expect(r.flightTrip).toBe(600)
    expect(r.selected).toBe(190)
    expect(r.perPerson).toBe(47.5)
    expect(r.high).toBe(209)
    expect(computeTripEconomics(base)).toEqual(r)
  })

  it('never calls car-only "cheaper" than the car+ferry trip the user chose', () => {
    // Régression : "Voiture + ferry" était toujours signalée +ferry € plus chère
    // que "Voiture seule", un scénario qui n'atteint pas le Maroc.
    const r = computeTripEconomics({ ...base, mode: 'mixed' })
    expect(r.roadMode).toBe('mixed')
    expect(r.cheapestMode).toBe('mixed')
    expect(r.deltaVsCheapest).toBe(0)
  })

  it('compares the selected road scenario against the flight', () => {
    const r = computeTripEconomics({ ...base, mode: 'mixed', travelers: 1 })
    // voiture + ferry 390 € vs avion 150 € pour 1 personne
    expect(r.cheapestMode).toBe('flight')
    expect(r.deltaVsCheapest).toBe(240)
  })

  it('in flight mode compares against car+ferry when a crossing is priced', () => {
    const r = computeTripEconomics({ ...base, mode: 'flight' })
    expect(r.roadMode).toBe('mixed')
    expect(r.cheapestMode).toBe('mixed')
    expect(r.deltaVsCheapest).toBe(210) // 600 − 390
  })

  it('in flight mode compares against car-only when no ferry is priced', () => {
    const r = computeTripEconomics({ ...base, mode: 'flight', ferryTotal: 0 })
    expect(r.roadMode).toBe('car')
    expect(r.deltaVsCheapest).toBe(410) // 600 − 190
  })

  it('clamps negative and non-finite inputs to zero and travelers to at least 1', () => {
    const r = computeTripEconomics({
      ...base,
      distanceKm: -500,
      tollsTotal: Number.NaN,
      ferryTotal: Number.POSITIVE_INFINITY,
      travelers: 0,
    })
    expect(r.fuel).toBe(0)
    expect(r.carTrip).toBe(0)
    expect(r.mixedTrip).toBe(0)
    expect(r.flightTrip).toBe(150)
    expect(r.perPerson).toBe(0)
  })

  it('rounds every output to cents', () => {
    const r = computeTripEconomics({ ...base, distanceKm: 1234.567, fuelPricePerLiter: 1.789 })
    for (const v of [r.fuel, r.carTrip, r.mixedTrip, r.selected, r.perPerson, r.high]) {
      expect(Math.round(v * 100) / 100).toBe(v)
    }
  })
})
