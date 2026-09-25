import { Ship } from 'lucide-react';
import { countryName } from '@/lib/countries';
import type { FuelByCountryResult, FuelType } from '@/lib/fuelByCountry';

const FUEL_LABELS: Record<FuelType, string> = { diesel: 'gazole', petrol95: 'SP95' };

function eur(value: number, digits = 0) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function km(value: number) {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)} km`;
}

function frenchDate(isoDate: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' }).format(
    new Date(`${isoDate}T00:00:00Z`),
  );
}

export default function FuelByCountryPanel({
  result,
  fuelType,
}: {
  result: FuelByCountryResult;
  fuelType: FuelType;
}) {
  const usesUserPrice = result.countries.some((line) => line.priceSource === 'user');
  return (
    <div className="border-t border-[#e2e8f0] p-6 sm:p-8" aria-labelledby="fuel-by-country-title">
      <h3 id="fuel-by-country-title" className="text-sm font-extrabold text-[#0f1f3d]">
        Carburant par tronçon et par pays ({FUEL_LABELS[fuelType]})
      </h3>
      <ol className="mt-4 space-y-3 text-sm">
        {result.legs.map((leg, index) =>
          leg.kind === 'ferry' ? (
            <li key={index} className="flex items-center gap-2 rounded-xl bg-[#eff6ff] px-4 py-3 text-[#1e3a5f]">
              <Ship size={16} aria-hidden="true" />
              <span>
                Traversée {leg.from} → {leg.to} · ≈ {km(leg.km)} à vol d'oiseau · prix du billet : votre
                hypothèse « Ferry »
              </span>
            </li>
          ) : (
            <li key={index} className="rounded-xl bg-[#f8fafc] px-4 py-3">
              <div className="flex justify-between gap-3 font-semibold text-[#0f1f3d]">
                <span>
                  {leg.from} → {leg.to} · {km(leg.km)}
                </span>
                <strong>{eur(leg.fuel)}</strong>
              </div>
              <table className="mt-2 w-full text-xs text-[#475569]">
                <tbody>
                  {leg.countries.map((line) => (
                    <tr key={line.country ?? 'none'} data-country={line.country ?? ''}>
                      <td className="py-0.5">{countryName(line.country)}</td>
                      <td className="py-0.5 text-right">{km(line.km)}</td>
                      <td className="py-0.5 text-right">
                        {eur(line.pricePerLiter, 3)}/L{line.priceSource === 'user' ? ' (votre prix)' : ''}
                      </td>
                      <td className="py-0.5 text-right font-semibold">{eur(line.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </li>
          ),
        )}
      </ol>
      <p className="mt-4 text-xs leading-5 text-[#64748b]" data-fuel-dataset={result.dataset.fresh ? 'fresh' : 'expired'}>
        {result.dataset.fresh ? (
          <>
            Prix UE : moyennes nationales TTC du{' '}
            <a href={result.dataset.sourceUrl} className="underline" rel="noopener noreferrer" target="_blank">
              Weekly Oil Bulletin
            </a>{' '}
            de la Commission européenne du {frenchDate(result.dataset.observedAt)}, valables jusqu'au{' '}
            {frenchDate(result.dataset.expiresAt)}. Les stations d'autoroute sont souvent plus chères.
          </>
        ) : (
          <>
            Le bulletin de prix UE du {frenchDate(result.dataset.observedAt)} a expiré le{' '}
            {frenchDate(result.dataset.expiresAt)} : votre prix est utilisé partout.
          </>
        )}
        {usesUserPrice && result.dataset.fresh && ' Hors UE (Maroc, Suisse…), votre prix « Carburant (€/L) » est utilisé.'}{' '}
        Péages : votre hypothèse globale, non ventilée par pays.
      </p>
    </div>
  );
}
