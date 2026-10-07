'use client';

import { ArrowRight, BedDouble, Car, Clock3, ExternalLink, RotateCcw, Ship, Wallet } from 'lucide-react';
import { hotelSearchUrl } from '@/lib/overnight';
import { trackPartnerClick } from '@/lib/partnerTracking';
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
        <span className="text-3xl font-black tracking-tight text-white">{km(overview.distanceKm)}</span>
        {/* Seulement les modes présents dans les tronçons calculés : rien par défaut. */}
        {overview.modes.map((mode) => {
          const ModeIcon = mode === 'ferry' ? Ship : Car;
          return (
            <span key={mode} className="inline-flex items-center gap-1.5">
              <ModeIcon size={16} aria-hidden="true" /> {mode === 'ferry' ? 'ferry' : 'voiture'}
            </span>
          );
        })}
        {overview.drivingSeconds !== null && (
          <span className="inline-flex items-center gap-1.5">
            <Clock3 size={15} aria-hidden="true" />
            {formatDuration(overview.drivingSeconds)} de conduite{overview.hasFerry ? ', hors traversée' : ''}
          </span>
        )}
      </p>
      {route.overnight && route.overnight.length > 0 && (
        // Un trajet de 20 h ne se fait pas d'une traite : où couper, sur le tracé réel.
        <div className="mt-4 rounded-2xl bg-white/10 p-4 text-white ring-1 ring-white/15" data-testid="overnight">
          <p className="flex items-center gap-2 text-sm font-extrabold">
            <BedDouble size={17} aria-hidden="true" className="shrink-0 text-[#fde68a]" />
            En {route.overnight.length + 1} jours : {route.overnight.length === 1 ? 'une nuit' : `${route.overnight.length} nuits`} en route
          </p>
          <ul className="mt-2 space-y-2">
            {route.overnight.map((stop) => (
              <li key={stop.name + stop.afterSeconds} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-white/85">
                  Étape recommandée : <strong className="text-white">{stop.name.split(',')[0]}</strong>, après ≈ {formatDuration(stop.afterSeconds)} de route
                </span>
                <a
                  href={hotelSearchUrl(stop.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackPartnerClick({
                    partner: 'Booking (recherche)',
                    product: 'hotel',
                    placement: 'overnight_stop',
                    page: window.location.pathname,
                    context: { affiliate_active: false },
                  })}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#fde68a] px-3 text-xs font-extrabold text-[#0f1f3d]"
                >
                  Chercher un hôtel <ExternalLink size={13} aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[11px] leading-4 text-white/60">
            Découpage RME en journées d&apos;au plus 11 h de conduite. Disponibilités non vérifiées par RME : recherche Booking, lien non affilié.
          </p>
        </div>
      )}
      <a
        href={step.href}
        className="mt-5 block rounded-3xl bg-white p-4 text-[#0f1f3d] shadow-2xl shadow-black/30 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59e0b] sm:p-5"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#fff1cc] text-[#92400e]">
            <StepIcon size={22} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-bold uppercase tracking-[.16em] text-[#b45309]">Prochaine étape</span>
            <span className="block text-lg font-extrabold leading-snug">{step.label}</span>
          </span>
        </span>
        <span className="gloss-dark mt-4 flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#0f1f3d] text-base font-extrabold text-white">
          Continuer <ArrowRight size={18} aria-hidden="true" />
        </span>
      </a>
    </section>
  );
}
