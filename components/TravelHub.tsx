'use client';

import { useEffect } from 'react';
import { MapPin, Trash2 } from 'lucide-react';
import { useComputedRoute } from '@/lib/routeContext';
import { TRAVEL_PHASES, type TravelPhaseId } from '@/lib/travel/travelPhase';
import { isValidTravelDate } from '@/lib/travel/travelStorage.migrations';
import { useTravelPhase } from '@/lib/travel/useTravelPhase';
import { useTravelStorage } from '@/lib/travel/useTravelStorage';

/** Where each hub entry points on the home page: existing sections, not new content. */
export const HUB_ANCHORS: Record<TravelPhaseId, string> = {
  'mon-voyage': 'planifier',
  preparer: 'preparer',
  route: 'route',
  maroc: 'maroc',
  'sport-tv': 'sport-tv',
  services: 'services',
};

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${isoDate}T00:00:00Z`));
}

function statusText(phase: TravelPhaseId, days: number | null, date: string | null): string {
  if (phase === 'preparer' && days !== null && date) {
    return `Départ le ${formatDate(date)} · dans ${days} jour${days > 1 ? 's' : ''}`;
  }
  if (phase === 'route') return 'Départ aujourd’hui · bonne route';
  if (phase === 'maroc' && date) return `Voyage commencé le ${formatDate(date)}`;
  return 'Ajoutez une date de départ dans le planificateur pour suivre votre voyage.';
}

export default function TravelHub() {
  const { travel, updateTravel, resetTravel, isHydrated } = useTravelStorage();
  const { phase, daysUntilDeparture } = useTravelPhase();
  const route = useComputedRoute();

  // The planner already publishes the computed trip: record it as "my trip".
  // A date left over from a different trip must not stick to new cities.
  useEffect(() => {
    if (!route || !isHydrated) return;
    updateTravel((prev) => {
      const sameTrip = prev.villes.depart === route.origin && prev.villes.arrivee === route.destination;
      const plannerDate = route.date && isValidTravelDate(route.date) ? route.date : null;
      return {
        villes: { depart: route.origin, arrivee: route.destination },
        dateVoyage: plannerDate ?? (sameTrip ? prev.dateVoyage : null),
      };
    });
  }, [route, isHydrated, updateTravel]);

  const { depart, arrivee } = travel.villes;
  const hasTrip = isHydrated && (Boolean(depart && arrivee) || travel.dateVoyage !== null);
  const timeline = TRAVEL_PHASES.filter((p) => p.timeline);
  const sections = TRAVEL_PHASES.filter((p) => !p.timeline);

  return (
    <section aria-labelledby="travel-hub-title" className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="travel-hub-title" className="text-lg font-extrabold text-[#0f1f3d]">Mon voyage</h2>
            {hasTrip ? (
              <>
                {depart && arrivee && (
                  <p className="mt-1 flex items-center gap-1.5 text-base font-bold text-[#0f1f3d]">
                    <MapPin size={16} aria-hidden="true" className="shrink-0 text-[#b45309]" />
                    {depart} → {arrivee}
                  </p>
                )}
                <p className="mt-1 text-sm text-[#334155]">
                  {statusText(phase, daysUntilDeparture, travel.dateVoyage)}
                </p>
              </>
            ) : (
              <p className="mt-1 text-sm text-[#334155]">
                {isHydrated
                  ? 'Calculez votre itinéraire : il s’affichera ici et restera sur cet appareil.'
                  : 'Chargement de votre voyage…'}
              </p>
            )}
          </div>
          {hasTrip && (
            <button
              type="button"
              onClick={resetTravel}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-slate-300 px-4 text-sm font-bold text-[#334155] transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0369a1]"
            >
              <Trash2 size={15} aria-hidden="true" /> Effacer
            </button>
          )}
        </div>

        <nav aria-label="Étapes du voyage" className="mt-4">
          <ol className="flex flex-wrap gap-2">
            {timeline.map(({ id, label }) => {
              const active = isHydrated && id === phase;
              return (
                <li key={id}>
                  <a
                    href={`#${HUB_ANCHORS[id]}`}
                    aria-current={active ? 'step' : undefined}
                    className={`inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0369a1] ${
                      active
                        ? 'border-[#0f1f3d] bg-[#0f1f3d] text-white'
                        : 'border-slate-300 bg-white text-[#0f1f3d] hover:bg-slate-50'
                    }`}
                  >
                    {label}
                    {active && <span className="sr-only"> (étape actuelle)</span>}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        <nav aria-label="Toujours disponibles" className="mt-2">
          <ul className="flex flex-wrap gap-2">
            {sections.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${HUB_ANCHORS[id]}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-amber-300 bg-amber-50 px-4 text-sm font-bold text-[#92400e] transition hover:bg-amber-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0369a1]"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
