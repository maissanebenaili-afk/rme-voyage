/**
 * Moteur économique déterministe du Reality Check.
 *
 * Fonctions pures, sans I/O : mêmes entrées → mêmes sorties. Aucun prix n'est
 * inventé ici ; toutes les valeurs monétaires viennent de l'appelant
 * (hypothèses saisies par l'utilisateur) et seule la distance peut provenir
 * d'un itinéraire calculé (voir lib/routeContext.ts).
 */

export type TripMode = 'car' | 'mixed' | 'flight';

export interface TripEconomicsInput {
  distanceKm: number;
  consumptionPer100Km: number;
  fuelPricePerLiter: number;
  tollsTotal: number;
  ferryTotal: number;
  travelers: number;
  flightPricePerPerson: number;
  mode: TripMode;
}

export interface TripEconomicsResult {
  fuel: number;
  carTrip: number;
  mixedTrip: number;
  flightTrip: number;
  selected: number;
  perPerson: number;
  high: number;
  /** Scénario routier comparé à l'avion (voiture seule ou voiture + ferry). */
  roadMode: Exclude<TripMode, 'flight'>;
  cheapestMode: TripMode;
  /** ≥ 0 : surcoût du scénario choisi par rapport au moins cher comparable. */
  deltaVsCheapest: number;
}

/** Marge indicative affichée au-dessus du budget direct. */
export const BUFFER_RATE = 0.1;

function nonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function cents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computeTripEconomics(input: TripEconomicsInput): TripEconomicsResult {
  const distance = nonNegative(input.distanceKm);
  const consumption = nonNegative(input.consumptionPer100Km);
  const fuelPrice = nonNegative(input.fuelPricePerLiter);
  const tolls = nonNegative(input.tollsTotal);
  const ferry = nonNegative(input.ferryTotal);
  const travelers = Math.max(1, Math.floor(nonNegative(input.travelers)));
  const flightPerPerson = nonNegative(input.flightPricePerPerson);

  const fuel = (distance / 100) * consumption * fuelPrice;
  const carTrip = fuel + tolls;
  const mixedTrip = carTrip + ferry;
  const flightTrip = flightPerPerson * travelers;

  // « Voiture seule » et « voiture + ferry » ne sont pas deux alternatives
  // pour un même trajet : la traversée est imposée par la géographie (Europe
  // → Maroc), pas choisie. On ne compare donc qu'UN scénario routier à l'avion,
  // sinon « voiture seule » serait toujours désignée « moins chère » alors
  // qu'elle n'atteint pas la destination.
  const roadMode: TripEconomicsResult['roadMode'] =
    input.mode === 'car' ? 'car' : input.mode === 'mixed' ? 'mixed' : ferry > 0 ? 'mixed' : 'car';
  const roadTrip = roadMode === 'car' ? carTrip : mixedTrip;

  const selected = input.mode === 'flight' ? flightTrip : roadTrip;
  const cheapestMode: TripMode = flightTrip < roadTrip ? 'flight' : roadMode;
  const cheapest = Math.min(roadTrip, flightTrip);

  return {
    fuel: cents(fuel),
    carTrip: cents(carTrip),
    mixedTrip: cents(mixedTrip),
    flightTrip: cents(flightTrip),
    selected: cents(selected),
    perPerson: cents(selected / travelers),
    high: cents(selected * (1 + BUFFER_RATE)),
    roadMode,
    cheapestMode,
    deltaVsCheapest: cents(selected - cheapest),
  };
}
