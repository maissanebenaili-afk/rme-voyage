"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Car, Plane, Ship, WalletCards, ArrowRight, ShieldCheck } from 'lucide-react';
import DistanceProvenanceNote from './DistanceProvenanceNote';
import FuelByCountryPanel from './FuelByCountryPanel';
import { computeFuelByCountry, hasFerry, type FuelType } from '@/lib/fuelByCountry';
import { useRouteDistance } from '@/lib/hooks/useRouteDistance';
import { trackFunnelEvent } from '@/lib/partnerTracking';
import { computeTripEconomics, type TripMode } from '@/lib/tripEconomics';

const MODE_LABELS: Record<TripMode, string> = {
  car: 'la voiture seule',
  mixed: 'voiture + ferry',
  flight: "l'avion",
};

function boundedNumber(raw: string, min: number, max: number, fallback: number) {
  const value = Number(raw);
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function eur(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export default function TripDecisionEngine() {
  const { distanceKm: distance, provenance, setManualDistance: setDistance } = useRouteDistance(1450);
  const [consumption, setConsumption] = useState(6.5);
  const [fuelPrice, setFuelPrice] = useState(1.75);
  const [tolls, setTolls] = useState(120);
  const [ferry, setFerry] = useState(180);
  const [travelers, setTravelers] = useState(4);
  const [flightPerPerson, setFlightPerPerson] = useState(180);
  // Europe ↔ Maroc par défaut : la traversée fait partie du trajet type.
  const [mode, setMode] = useState<TripMode>('mixed');
  const [fuelType, setFuelType] = useState<FuelType>('diesel');
  const trackedUse = useRef(false);

  const route = provenance.kind === 'route' ? provenance.route : null;
  const byCountry = useMemo(
    () =>
      route?.legs
        ? computeFuelByCountry({
            legs: route.legs,
            consumptionPer100Km: consumption,
            fuelType,
            fallbackPricePerLiter: fuelPrice,
            // Fraîcheur des prix jugée à l'heure du calcul de l'itinéraire.
            now: new Date(route.computedAt),
          })
        : null,
    [route, consumption, fuelType, fuelPrice]
  );

  // Le scénario routier suit l'itinéraire calculé : traversée imposée →
  // « voiture + ferry » ; itinéraire sans traversée → « voiture ».
  const routeNeedsFerry = route?.legs ? hasFerry(route.legs) : null;
  useEffect(() => {
    if (routeNeedsFerry === null) return;
    setMode((current) => {
      if (current === 'flight') return current;
      return routeNeedsFerry ? 'mixed' : 'car';
    });
  }, [routeNeedsFerry, route]);

  function markUsed() {
    if (trackedUse.current) return;
    trackedUse.current = true;
    trackFunnelEvent({ event: 'reality_check_used', placement: 'trip_decision_engine' });
  }

  const result = useMemo(
    () =>
      computeTripEconomics({
        distanceKm: distance,
        consumptionPer100Km: consumption,
        fuelPricePerLiter: fuelPrice,
        tollsTotal: tolls,
        ferryTotal: ferry,
        travelers,
        flightPricePerPerson: flightPerPerson,
        mode,
        fuelCostOverride: byCountry?.fuelTotal,
      }),
    [distance, consumption, fuelPrice, tolls, ferry, travelers, flightPerPerson, mode, byCountry]
  );

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#dbe4ef] bg-white shadow-sm" aria-labelledby="reality-check-title">
      <div className="bg-[#0f1f3d] p-6 text-white sm:p-8">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f59e0b] text-[#0f1f3d]">
            <WalletCards size={23} />
          </div>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[.16em] text-[#fde68a]">RME Reality Check</p>
            <h2 id="reality-check-title" className="mt-1 text-2xl font-display font-semibold sm:text-3xl">Le coût réel avant de choisir.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">Pas seulement le prix affiché : carburant, péages, ferry et nombre de voyageurs. Ajustez les hypothèses pour obtenir un ordre de grandeur immédiatement.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {([
            ['car', 'Voiture', Car],
            ['mixed', 'Voiture + ferry', Ship],
            ['flight', 'Avion', Plane],
          ] as const).map(([value, label, Icon]) => (
            <button key={value} type="button" onClick={() => { setMode(value); markUsed(); }} className={`rounded-xl border px-3 py-3 text-left text-sm font-bold transition ${mode === value ? 'border-[#f59e0b] bg-[#f59e0b] text-[#0f1f3d]' : 'border-white/15 bg-white/5 text-white hover:bg-white/10'}`} aria-pressed={mode === value}>
              <Icon size={17} className="mb-2" />{label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
        <div className="grid gap-4">
          {[
            ['Distance (km)', distance, setDistance, 1, 10000, 10],
            ['Conso. (L/100 km)', consumption, setConsumption, 3, 15, 0.1],
            ['Carburant (€/L)', fuelPrice, setFuelPrice, 1, 3, 0.01],
            ['Péages (€)', tolls, setTolls, 0, 1000, 5],
            ['Ferry (€)', ferry, setFerry, 0, 1500, 10],
            ['Voyageurs', travelers, setTravelers, 1, 12, 1],
            ['Avion / personne (€)', flightPerPerson, setFlightPerPerson, 20, 2000, 10],
          ].map(([label, value, setter, min, max, step]) => (
            <label key={label as string} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
              <span className="font-semibold text-[#334155]">{label as string}</span>
              <input type="number" min={min as number} max={max as number} step={step as number} value={value as number} onChange={(e) => { (setter as (v: number) => void)(boundedNumber(e.target.value, min as number, max as number, value as number)); markUsed(); }} className="w-28 rounded-xl border border-[#cbd5e1] px-3 py-2 text-right font-bold text-[#0f1f3d] outline-none focus:ring-2 focus:ring-[#f59e0b]/40" />
            </label>
          ))}
          {byCountry && (
            <label className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
              <span className="font-semibold text-[#334155]">Carburant</span>
              <select value={fuelType} onChange={(e) => { setFuelType(e.target.value as FuelType); markUsed(); }} className="w-28 rounded-xl border border-[#cbd5e1] bg-white px-2 py-2 font-bold text-[#0f1f3d] outline-none focus:ring-2 focus:ring-[#f59e0b]/40">
                <option value="diesel">Gazole</option>
                <option value="petrol95">SP95</option>
              </select>
            </label>
          )}
          <DistanceProvenanceNote provenance={provenance} className="text-[#64748b]" />
        </div>

        <div className="rounded-2xl bg-[#f8fafc] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#0f1f3d]"><ShieldCheck size={17} className="text-[#b45309]" />Votre estimation</div>
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">Budget direct · aller simple</p>
            <p className="mt-1 text-4xl font-black tracking-tight text-[#0f1f3d]">{eur(result.selected)}</p>
            <p className="mt-2 text-sm text-[#64748b]">≈ {eur(result.perPerson)} / personne · marge indicative : jusqu’à {eur(result.high)}</p>
            <p className="mt-3 rounded-xl bg-[#fff7ed] px-3 py-2 text-sm font-semibold text-[#9a3412]">{result.deltaVsCheapest === 0 ? 'Ce scénario est le moins cher selon vos hypothèses.' : `+${eur(result.deltaVsCheapest)} par rapport à ${MODE_LABELS[result.cheapestMode]}.`}</p>
          </div>
          <div className="mt-6 space-y-3 border-t border-[#e2e8f0] pt-5 text-sm">
            <div className="flex justify-between"><span>Carburant</span><strong>{eur(result.fuel)}</strong></div>
            {routeNeedsFerry !== true && <div className="flex justify-between"><span>Voiture (sans ferry)</span><strong>{eur(result.carTrip)}</strong></div>}
            {routeNeedsFerry !== false && <div className="flex justify-between"><span>Voiture + ferry</span><strong>{eur(result.mixedTrip)}</strong></div>}
            <div className="flex justify-between"><span>Avion pour {travelers} pers.</span><strong>{eur(result.flightTrip)}</strong></div>
          </div>
          <p className="mt-5 text-xs leading-5 text-[#64748b]">Les trois scénarios utilisent uniquement vos hypothèses locales. Aucun prix partenaire ni tarif temps réel n’est inventé.</p>
          <a href="#booking-title" onClick={() => trackFunnelEvent({ event: 'reality_check_cta', placement: 'trip_decision_engine' })} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0f1f3d] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#1e3a5f]">Comparer les ferries et les vols <ArrowRight size={16} /></a>
        </div>
      </div>
      {byCountry && <FuelByCountryPanel result={byCountry} fuelType={fuelType} />}
    </section>
  );
}
