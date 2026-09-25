import fuelPrices from '@/lib/data/fuelPrices.json';
import type { RouteLeg } from '@/lib/routeLegs';

/**
 * Coût carburant par tronçon et par pays — déterministe, sans I/O.
 *
 * Prix par pays : Weekly Oil Bulletin de la Commission européenne (moyennes
 * nationales TTC, lib/data/fuelPrices.json, mis à jour par
 * scripts/update-fuel-prices.py). Un pays absent du bulletin (Maroc, Suisse…)
 * ou un bulletin périmé → prix saisi par l'utilisateur, signalé comme tel.
 */

export type FuelType = 'diesel' | 'petrol95';

export interface FuelPriceDataset {
  source: string;
  sourceUrl: string;
  /** Date du bulletin, AAAA-MM-JJ. */
  observedAt: string;
  prices: Record<string, Partial<Record<FuelType, number>>>;
}

/** Bulletin hebdomadaire : une semaine manquée est tolérée, pas deux. */
export const FUEL_PRICE_MAX_AGE_DAYS = 14;

export const FUEL_PRICES = fuelPrices as FuelPriceDataset;

export type PriceSource = 'bulletin' | 'user';

export interface CountryFuelLine {
  country: string | null;
  km: number;
  pricePerLiter: number;
  priceSource: PriceSource;
  cost: number;
}

export type LegCost =
  | { kind: 'road'; from: string; to: string; km: number; fuel: number; countries: CountryFuelLine[] }
  | { kind: 'ferry'; from: string; to: string; km: number; measured: 'route' | 'straight-line' };

export interface FuelByCountryResult {
  legs: LegCost[];
  /** Agrégat par pays sur l'ensemble des tronçons routiers, dans l'ordre de passage. */
  countries: CountryFuelLine[];
  roadKm: number;
  seaKm: number;
  fuelTotal: number;
  dataset: { fresh: boolean; observedAt: string; expiresAt: string; source: string; sourceUrl: string };
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function nonNegative(value: number) {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function datasetExpiry(observedAt: string): Date {
  const date = new Date(`${observedAt}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + FUEL_PRICE_MAX_AGE_DAYS);
  return date;
}

export function computeFuelByCountry(input: {
  legs: RouteLeg[];
  consumptionPer100Km: number;
  fuelType: FuelType;
  fallbackPricePerLiter: number;
  now: Date;
  dataset?: FuelPriceDataset;
}): FuelByCountryResult {
  const dataset = input.dataset ?? FUEL_PRICES;
  const expiresAt = datasetExpiry(dataset.observedAt);
  const fresh = input.now.getTime() < expiresAt.getTime();
  const litersPerKm = nonNegative(input.consumptionPer100Km) / 100;
  const fallback = nonNegative(input.fallbackPricePerLiter);

  function priceFor(country: string | null): { pricePerLiter: number; priceSource: PriceSource } {
    const price = fresh && country ? dataset.prices[country]?.[input.fuelType] : undefined;
    return typeof price === 'number' && price > 0
      ? { pricePerLiter: price, priceSource: 'bulletin' }
      : { pricePerLiter: fallback, priceSource: 'user' };
  }

  const totals = new Map<string | null, CountryFuelLine>();
  let roadKm = 0;
  let seaKm = 0;

  const legs: LegCost[] = input.legs.map((leg) => {
    const km = nonNegative(leg.distanceMeters) / 1000;
    if (leg.kind === 'ferry') {
      seaKm += km;
      return { kind: 'ferry', from: leg.from, to: leg.to, km: round(km, 1), measured: leg.measured };
    }
    roadKm += km;
    const countries = leg.countries.map(({ country, meters }) => {
      const countryKm = nonNegative(meters) / 1000;
      const { pricePerLiter, priceSource } = priceFor(country);
      const cost = countryKm * litersPerKm * pricePerLiter;
      const total = totals.get(country);
      if (total) {
        total.km += countryKm;
        total.cost += cost;
      } else {
        totals.set(country, { country, km: countryKm, pricePerLiter, priceSource, cost });
      }
      return { country, km: round(countryKm, 1), pricePerLiter, priceSource, cost: round(cost, 2) };
    });
    const fuel = countries.reduce((sum, line) => sum + line.cost, 0);
    return { kind: 'road', from: leg.from, to: leg.to, km: round(km, 1), fuel: round(fuel, 2), countries };
  });

  const countries = [...totals.values()].map((line) => ({
    ...line,
    km: round(line.km, 1),
    cost: round(line.cost, 2),
  }));

  return {
    legs,
    countries,
    roadKm: round(roadKm, 1),
    seaKm: round(seaKm, 1),
    fuelTotal: round(countries.reduce((sum, line) => sum + line.cost, 0), 2),
    dataset: {
      fresh,
      observedAt: dataset.observedAt,
      expiresAt: expiresAt.toISOString().slice(0, 10),
      source: dataset.source,
      sourceUrl: dataset.sourceUrl,
    },
  };
}

export function hasFerry(legs: RouteLeg[] | undefined): boolean {
  return !!legs?.some((leg) => leg.kind === 'ferry');
}
