export interface TravelCostInput {
  distanceKm: number;
  fuelPricePerLiter: number;
  consumptionPer100Km: number;
  tollFeesEstimate: number;
  ferryTicketCost: number;
}

export interface TravelCostBreakdown {
  fuelTotal: number;
  tollTotal: number;
  ferryTotal: number;
  grandTotal: number;
}

// Valeur négative ou non finie (champ vidé, NaN) → 0, pour qu'un total ne
// devienne jamais négatif ni « NaN € ».
function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function calculateTravelCost(input: TravelCostInput): TravelCostBreakdown {
  const fuelTotal =
    (nonNegative(input.distanceKm) / 100) *
    nonNegative(input.consumptionPer100Km) *
    nonNegative(input.fuelPricePerLiter);

  const tollTotal = nonNegative(input.tollFeesEstimate);
  const ferryTotal = nonNegative(input.ferryTicketCost);

  return {
    fuelTotal: Math.round(fuelTotal * 100) / 100,
    tollTotal: Math.round(tollTotal * 100) / 100,
    ferryTotal: Math.round(ferryTotal * 100) / 100,
    grandTotal: Math.round((fuelTotal + tollTotal + ferryTotal) * 100) / 100
  };
}
