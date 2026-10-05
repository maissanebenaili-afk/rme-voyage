'use client';

import { ArrowRight, Car, Clock3, RotateCcw, Ship, Wallet } from 'lucide-react';
import { journeyOverview, nextStep, shortPlace } from '@/lib/journey';
import { formatDuration } from '@/lib/routePages';
import { useRememberComputedTrip } from '@/lib/travel/useRememberComputedTrip';
import { buildShareUrl } from '@/lib/tripShare';

const km = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n)} km`;

/**
 * « Votre voyage », dans le haut de l'accueil : ce que l'utilisateur doit voir
 * juste après le calcul — la distance mesurée, les modes réellement présents
 * sur le tracé, et une seule prochaine étape. Avant tout calcul : rien, ou la
 * reprise du dernier trajet enregistré sur cet appareil.
 */
export default function JourneySummary() {
  const { travel, isHydrated, route } = useRememberComputedTrip();

  if (!route) {
    const { depart, arrivee } = travel.villes;
    if (!isHydrated || !depart || !arrivee) return null;
    return (
      <a
        href={buildShareUrl({ from: depart, to: arrivee, date: travel.dateVoyage ?? undefined })}
        className="mt-5 inline-flex min-h-11 max-w-full items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/20"
      >
        <RotateCcw size={15} aria-hidden="true" className="shrink-0" />
        <span className="truncate">Reprendre {shortPlace(depart)} → {shortPlace(arrivee)}</span>
      </a>
    );
  }

  const overview = journeyOverview(route);
  const step = nextStep(route);
  const StepIcon = step.icon === 'ferry' ? Ship : Wallet;

  return (
    <section aria-labelledby="journey-summary-title" className="rme-rise mt-6">
      <h2 id="journey-summary-title" className="sr-only">Votre voyage</h2>
      <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-white/75">
        <span className="inline-flex items-center gap-1.5 text-3xl font-black tracking-tight text-white">
          <Car size={22} aria-hidden="true" className="text-white/70" /> {km(overview.distanceKm)}
        </span>
        {overview.hasFerry && (
          <span className="inline-flex items-center gap-1.5"><Ship size={16} aria-hidden="true" /> ferry</span>
        )}
        {overview.drivingSeconds !== null && (
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={15} aria-hidden="true" />
            {formatDuration(overview.drivingSeconds)} de conduite{overview.hasFerry ? ', hors traversée' : ''}
          </span>
        )}
      </p>
      <a
        href={step.href}
        className="mt-5 block rounded-3xl bg-white p-4 text-[#0f1f3d] shadow-2xl shadow-black/30 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59e0b] sm:p-5"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff1cc] text-[#b45309]">
            <StepIcon size={22} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-[.16em] text-[#b45309]">Prochaine étape</span>
            <span className="block text-lg font-extrabold leading-snug">{step.label}</span>
          </span>
        </span>
        <span className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#0f1f3d] text-base font-extrabold text-white">
          Continuer <ArrowRight size={18} aria-hidden="true" />
        </span>
      </a>
    </section>
  );
}
