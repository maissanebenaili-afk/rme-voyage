'use client';

import { ArrowRight, Car, Ship, Wallet } from 'lucide-react';
import { flagFor, journeyOverview, nextStep, shortPlace } from '@/lib/journey';
import { formatDuration } from '@/lib/routePages';
import { useRememberComputedTrip } from '@/lib/travel/useRememberComputedTrip';
import { buildShareUrl } from '@/lib/tripShare';

const km = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n)} km`;

/**
 * « Votre voyage » : ce que l'utilisateur doit voir juste après le calcul —
 * la distance mesurée, les modes réellement présents sur le tracé, et une
 * seule prochaine étape. Avant tout calcul : rien, ou la reprise du dernier
 * trajet enregistré sur cet appareil.
 */
export default function JourneySummary() {
  const { travel, isHydrated, route } = useRememberComputedTrip();

  if (!route) {
    const { depart, arrivee } = travel.villes;
    if (!isHydrated || !depart || !arrivee) return null;
    return (
      <a
        href={buildShareUrl({ from: depart, to: arrivee, date: travel.dateVoyage ?? undefined })}
        className="mt-3 flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-[#0f1f3d] shadow-sm ring-1 ring-black/5 transition hover:bg-[#fffaf0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0369a1]"
      >
        <span className="min-w-0 truncate">Reprendre {shortPlace(depart)} → {shortPlace(arrivee)}</span>
        <ArrowRight size={18} aria-hidden="true" className="shrink-0" />
      </a>
    );
  }

  const overview = journeyOverview(route);
  const step = nextStep(route);
  const StepIcon = step.icon === 'ferry' ? Ship : Wallet;
  const from = flagFor(route.origin);
  const to = flagFor(route.destination);

  return (
    <section aria-labelledby="journey-summary-title" className="mt-3 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="px-5 pb-4 pt-5">
        <h2 id="journey-summary-title" className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-500">Votre voyage</h2>
        <p className="mt-1 text-lg font-extrabold leading-snug text-[#0f1f3d]">
          {from && <span aria-hidden="true">{from} </span>}{shortPlace(route.origin)} → {to && <span aria-hidden="true">{to} </span>}{shortPlace(route.destination)}
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-slate-600">
          <span className="text-2xl font-black tracking-tight text-[#0f1f3d]">{km(overview.distanceKm)}</span>
          <span className="inline-flex items-center gap-1"><Car size={15} aria-hidden="true" /> voiture</span>
          {overview.hasFerry && <span className="inline-flex items-center gap-1"><Ship size={15} aria-hidden="true" /> ferry</span>}
        </p>
        {overview.drivingSeconds !== null && (
          <p className="mt-1 text-sm text-slate-500">{formatDuration(overview.drivingSeconds)} de conduite{overview.hasFerry ? ', hors traversée' : ''}</p>
        )}
      </div>
      <a
        href={step.href}
        className="flex min-h-14 items-center gap-3 border-t border-slate-100 bg-[#fff8e8] px-5 py-3 transition hover:bg-[#fff1cc] focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#0369a1]"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f59e0b] text-[#0f1f3d]">
          <StepIcon size={19} aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-bold uppercase tracking-[.14em] text-[#92400e]">Prochaine étape</span>
          <span className="block font-extrabold text-[#0f1f3d]">{step.label}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-extrabold text-[#0f1f3d]">
          Continuer <ArrowRight size={16} aria-hidden="true" />
        </span>
      </a>
    </section>
  );
}
