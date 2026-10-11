"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Car, ChevronDown, Plane, Ship, WalletCards, ArrowRight, ShieldCheck } from 'lucide-react';
import DistanceProvenanceNote from './DistanceProvenanceNote';
import FuelByCountryPanel from './FuelByCountryPanel';
import { computeFuelByCountry, hasFerry, type FuelType } from '@/lib/fuelByCountry';
import { useRouteDistance } from '@/lib/hooks/useRouteDistance';
import { trackFunnelEvent } from '@/lib/partnerTracking';
import { computeTripEconomics, type TripMode } from '@/lib/tripEconomics';
import { formatDuration } from '@/lib/routePages';
import { useCountUp } from '@/lib/hooks/useCountUp';
import { useHomeText } from '@/lib/LanguageContext';

function boundedNumber(raw: string, min: number, max: number, fallback: number) {
  const value = Number(raw);
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

function eur(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export default function TripDecisionEngine() {
  const h = useHomeText();
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
  const animatedSelected = useCountUp(result.selected);

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#dbe4ef] bg-white shadow-sm" aria-labelledby="reality-check-title">
      <div className="bg-[#0f1f3d] p-6 text-white sm:p-8">
        {/* L'accueil annonce déjà l'étape « Le coût » : le titre reste pour les lecteurs d'écran. */}
        <h2 id="reality-check-title" className="sr-only">{h.costSr}</h2>
        <p className="flex items-center gap-2 text-sm font-semibold leading-6 text-white/75">
          <WalletCards size={18} aria-hidden="true" className="shrink-0 text-[#fcd34d]" />
          {h.threeWays}
        </p>

        {/* Reality Check : chaque mode montre son prix (et sa durée mesurée, si
            un itinéraire réel a été calculé) au lieu d'un simple sélecteur —
            comparer doit se voir, pas se déduire. Aucune durée n'est affichée
            pour l'avion : aucune source réelle de temps de vol n'existe ici. */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {([
            ['car', h.car, Car, result.carTrip],
            ['mixed', h.carFerry, Ship, result.mixedTrip],
            ['flight', h.flight, Plane, result.flightTrip],
          ] as const).map(([value, label, Icon, price]) => (
            <button key={value} type="button" onClick={() => { setMode(value); markUsed(); }} className={`rounded-xl border px-3 py-3 text-left text-sm font-bold transition ${mode === value ? 'border-[#f59e0b] bg-[#f59e0b] text-[#0f1f3d]' : 'border-white/15 bg-white/5 text-white hover:bg-white/10'}`} aria-pressed={mode === value}>
              <Icon size={17} className="mb-2" />
              <span className="block">{label}</span>
              <span className={`mt-1 block text-base font-black ${mode === value ? 'text-[#0f1f3d]' : 'text-[#fde68a]'}`}>{eur(price)}</span>
              {value === result.roadMode && route && (
                <span className={`block text-xs font-semibold ${mode === value ? 'text-[#0f1f3d]/70' : 'text-white/60'}`}>≈ {formatDuration(route.durationSeconds)}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:p-8">
        <div className="rounded-2xl bg-[#f8fafc] p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#0f1f3d]"><ShieldCheck size={17} className="text-[#b45309]" />{h.yourEstimate}</div>
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">{h.directBudget}</p>
            <p className="mt-1 text-4xl font-black tracking-tight text-[#0f1f3d] tabular-nums">{eur(animatedSelected)}</p>
            <p className="mt-2 text-sm text-[#64748b]">{h.perPerson(eur(result.perPerson), eur(result.high))}</p>
            <p className="mt-3 rounded-xl bg-[#fff7ed] px-3 py-2 text-sm font-semibold text-[#9a3412]">{result.deltaVsCheapest === 0 ? h.cheapest : h.moreThan(eur(result.deltaVsCheapest), result.cheapestMode)}</p>
          </div>
          <div data-testid="scenario-breakdown" className="mt-6 space-y-3 border-t border-[#e2e8f0] pt-5 text-sm">
            <div className="flex justify-between"><span>{h.fuel}</span><strong>{eur(result.fuel)}</strong></div>
            {routeNeedsFerry !== true && <div className="flex justify-between"><span>{h.carNoFerry}</span><strong>{eur(result.carTrip)}</strong></div>}
            {routeNeedsFerry !== false && <div className="flex justify-between"><span>{h.carFerry}</span><strong>{eur(result.mixedTrip)}</strong></div>}
            <div className="flex justify-between"><span>{h.flightFor(travelers)}</span><strong>{eur(result.flightTrip)}</strong></div>
          </div>
          <p className="mt-5 text-xs leading-5 text-[#64748b]">{h.assumptionsNote}</p>
          <a href="#ferry" onClick={() => trackFunnelEvent({ event: 'reality_check_cta', placement: 'trip_decision_engine' })} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0f1f3d] px-4 py-2.5 text-sm font-extrabold text-white hover:bg-[#1e3a5f]">{h.compareFerriesFlights} <ArrowRight size={16} /></a>
        </div>
        {/* Les hypothèses restent modifiables, repliées : un visiteur voit d'abord le résultat, pas 7 cases à remplir. */}
        <details className="group rounded-2xl ring-1 ring-[#e2e8f0]">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 text-sm font-extrabold text-[#0f1f3d] [&::-webkit-details-marker]:hidden">
            {h.adjust}
            <ChevronDown size={18} aria-hidden="true" className="shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-[#e2e8f0] p-4">
        <div className="grid gap-4">
          {[
            [h.fieldDistance, distance, setDistance, 1, 10000, 10],
            [h.fieldConsumption, consumption, setConsumption, 3, 15, 0.1],
            [h.fieldFuelPrice, fuelPrice, setFuelPrice, 1, 3, 0.01],
            [h.fieldTolls, tolls, setTolls, 0, 1000, 5],
            [h.fieldFerry, ferry, setFerry, 0, 1500, 10],
            [h.fieldTravelers, travelers, setTravelers, 1, 12, 1],
            [h.fieldFlight, flightPerPerson, setFlightPerPerson, 20, 2000, 10],
          ].map(([label, value, setter, min, max, step]) => (
            <label key={label as string} className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
              <span className="font-semibold text-[#334155]">{label as string}</span>
              <input type="number" min={min as number} max={max as number} step={step as number} value={value as number} onChange={(e) => { (setter as (v: number) => void)(boundedNumber(e.target.value, min as number, max as number, value as number)); markUsed(); }} className="w-28 rounded-xl border border-[#cbd5e1] px-3 py-2 text-right font-bold text-[#0f1f3d] outline-none focus:ring-2 focus:ring-[#f59e0b]/40" />
            </label>
          ))}
          {byCountry && (
            <label className="grid grid-cols-[1fr_auto] items-center gap-3 text-sm">
              <span className="font-semibold text-[#334155]">{h.fuel}</span>
              <select value={fuelType} onChange={(e) => { setFuelType(e.target.value as FuelType); markUsed(); }} className="w-28 rounded-xl border border-[#cbd5e1] bg-white px-2 py-2 font-bold text-[#0f1f3d] outline-none focus:ring-2 focus:ring-[#f59e0b]/40">
                <option value="diesel">{h.diesel}</option>
                <option value="petrol95">{h.petrol}</option>
              </select>
            </label>
          )}
          <DistanceProvenanceNote provenance={provenance} className="text-[#64748b]" />
        </div>
          </div>
        </details>
      </div>
      {byCountry && <FuelByCountryPanel result={byCountry} fuelType={fuelType} />}
    </section>
  );
}
