import { calculateTravelCost, TravelCostInput } from '@/lib/costCalculator'

describe('calculateTravelCost', () => {
  describe('Basic calculations', () => {
    it('should calculate fuel cost correctly', () => {
      const input: TravelCostInput = {
        distanceKm: 1000,
        fuelPricePerLiter: 1.5,
        consumptionPer100Km: 6,
        tollFeesEstimate: 0,
        ferryTicketCost: 0,
      }
      const result = calculateTravelCost(input)
      // (1000 / 100) * 6 * 1.5 = 90
      expect(result.fuelTotal).toBe(90)
    })

    it('should include tolls and ferry in grand total', () => {
      const input: TravelCostInput = {
        distanceKm: 1850,
        fuelPricePerLiter: 1.65,
        consumptionPer100Km: 6.5,
        tollFeesEstimate: 120,
        ferryTicketCost: 220,
      }
      const result = calculateTravelCost(input)
      expect(result.grandTotal).toBe(
        result.fuelTotal + result.tollTotal + result.ferryTotal
      )
    })
  })

  describe('Edge cases', () => {
    it('should handle zero distance', () => {
      const input: TravelCostInput = {
        distanceKm: 0,
        fuelPricePerLiter: 1.5,
        consumptionPer100Km: 6,
        tollFeesEstimate: 50,
        ferryTicketCost: 100,
      }
      const result = calculateTravelCost(input)
      expect(result.fuelTotal).toBe(0)
      expect(result.tollTotal).toBe(50)
      expect(result.ferryTotal).toBe(100)
      expect(result.grandTotal).toBe(150)
    })

    it('should handle negative values gracefully (convert to zero)', () => {
      const input: TravelCostInput = {
        distanceKm: 1000,
        fuelPricePerLiter: 1.5,
        consumptionPer100Km: 6,
        tollFeesEstimate: -50, // negative
        ferryTicketCost: -100, // negative
      }
      const result = calculateTravelCost(input)
      expect(result.tollTotal).toBe(0) // Math.max(0, -50) = 0
      expect(result.ferryTotal).toBe(0) // Math.max(0, -100) = 0
    })

    it('should round to 2 decimal places', () => {
      const input: TravelCostInput = {
        distanceKm: 1234.56,
        fuelPricePerLiter: 1.111,
        consumptionPer100Km: 5.555,
        tollFeesEstimate: 99.999,
        ferryTicketCost: 50.505,
      }
      const result = calculateTravelCost(input)
      // All values should have max 2 decimal places
      expect(result.fuelTotal).toBe(Math.round(result.fuelTotal * 100) / 100)
      expect(result.tollTotal).toBe(Math.round(result.tollTotal * 100) / 100)
      expect(result.ferryTotal).toBe(Math.round(result.ferryTotal * 100) / 100)
      expect(result.grandTotal).toBe(Math.round(result.grandTotal * 100) / 100)
    })
  })

  describe('Realistic scenarios', () => {
    it('Paris to Tanger route', () => {
      const input: TravelCostInput = {
        distanceKm: 1850, // Paris -> Spanish border -> Ferry -> Tangier
        fuelPricePerLiter: 1.65,
        consumptionPer100Km: 6.5,
        tollFeesEstimate: 120, // French tolls
        ferryTicketCost: 220, // Ferry ticket
      }
      const result = calculateTravelCost(input)
      expect(result.fuelTotal).toBeGreaterThan(0)
      expect(result.tollTotal).toBe(120)
      expect(result.ferryTotal).toBe(220)
      expect(result.grandTotal).toBeGreaterThan(500) // Should be reasonably high
    })

    it('Should scale proportionally with distance', () => {
      const baseInput: TravelCostInput = {
        distanceKm: 1000,
        fuelPricePerLiter: 1.5,
        consumptionPer100Km: 6,
        tollFeesEstimate: 0,
        ferryTicketCost: 0,
      }
      const doubleInput: TravelCostInput = {
        ...baseInput,
        distanceKm: 2000,
      }
      const baseResult = calculateTravelCost(baseInput)
      const doubleResult = calculateTravelCost(doubleInput)
      // Fuel cost should be approximately double (accounting for rounding)
      expect(doubleResult.fuelTotal).toBeCloseTo(baseResult.fuelTotal * 2, 1)
    })
  })
})

describe('calculateTravelCost — input guards', () => {
  it('never returns a negative or NaN fuel total', () => {
    const result = calculateTravelCost({
      distanceKm: -1000,
      fuelPricePerLiter: Number.NaN,
      consumptionPer100Km: 6,
      tollFeesEstimate: 10,
      ferryTicketCost: 20,
    })
    expect(result.fuelTotal).toBe(0)
    expect(result.grandTotal).toBe(30)
  })
})
