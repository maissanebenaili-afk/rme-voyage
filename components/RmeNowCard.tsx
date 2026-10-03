'use client';

import { ArrowRight, CalendarDays, CheckCircle2, MapPin, Ship, Sparkles } from 'lucide-react';
import { useComputedRoute } from '@/lib/routeContext';
import { useTravelPhase } from '@/lib/travel/useTravelPhase';
import { useTravelStorage } from '@/lib/travel/useTravelStorage';
import { parseRouteLegs } from '@/lib/routeLegs';

type Action = { label: string; href: string };

function buildState(
  hasTrip: boolean,
  phase: string,
  days: number | null,
  routeHasFerry: boolean,
  depart: string,
  arrivee: string,
): { eyebrow: string; title: string; body: string; actions: Action[] } {
  if (!hasTrip) {
    return {
      eyebrow: 'Pour commencer',
      title: 'On prépare quoi, maintenant ?',
      body: 'Donnez-nous votre départ et votre destination. RME construira le trajet à partir des données réellement disponibles.',
      actions: [{ label: 'Planifier mon voyage', href: '#planifier' }],
    };
  }

  if (phase === 'preparer') {
    const timing = days === 1 ? 'demain' : days ? \`dans \${days} jours\` : 'bientôt';
    return {
      eyebrow: 'Avant le départ',
      title: \`\${depart} → \${arrivee}\`,
      body: \`Votre départ est prévu \${timing}. Le plus utile maintenant : vérifier les étapes essentielles avant de partir.\`,
      actions: [
        { label: 'Voir mon voyage', href: '#planifier' },
        { label: 'Préparer mes affaires', href: '#preparer' },
      ],
    };
  }

  if (phase === 'route') {
    return {
      eyebrow: 'Aujourd’hui',
      title: routeHasFerry ? 'Votre passage vers le Maroc' : 'Votre route est en cours',
      body: routeHasFerry
        ? 'Votre trajet comporte une traversée. Gardez votre billet et les informations utiles à portée de main.'
        : 'RME garde votre trajet sous la main. Concentrez-vous sur la route ; revenez ici quand vous avez besoin d’un repère.',
      actions: [
        { label: 'Voir mon trajet', href: '#route' },
        ...(routeHasFerry ? [{ label: 'Voir les ferries', href: '#booking-title' }] : []),
      ],
    };
  }

  return {
    eyebrow: 'Après le passage',
    title: 'Bienvenue dans la suite du voyage',
    body: \`Votre trajet \${depart} → \${arrivee} est enregistré sur cet appareil. Retrouvez vos repères et services quand vous en avez besoin.\`,
    actions: [
      { label: 'Voir les repères', href: '#maroc' },
      { label: 'Revenir au trajet', href: '#planifier' },
    ],
  };
}

export const __test__ = { buildState };

export default function RmeNowCard() {
  const { travel, isHydrated } = useTravelStorage();
  const { phase, daysUntilDeparture } = useTravelPhase();
  const route = useComputedRoute();

  const hasTrip = isHydrated && Boolean(travel.villes.depart && travel.villes.arrivee);
  const depart = travel.villes.depart || route?.origin || 'Votre départ';
  const arrivee = travel.villes.arrivee || route?.destination || 'le Maroc';
  const routeHasFerry = Boolean(route?.legs && parseRouteLegs(route.legs).some((leg) => leg.kind === 'ferry'));
  const state = buildState(hasTrip, phase, daysUntilDeparture, routeHasFerry, depart, arrivee);

  return (
    <section aria-labelledby="rme-now-title" className="mx-auto max-w-5xl px-4 py-3 sm:px-8 sm:py-4">
      <div className="overflow-hidden rounded-[1.75rem] border border-[#d8e3dd] bg-[#f7fbf8] shadow-[0_12px_40px_-24px_rgba(15,31,61,.35)]">
        <div className="grid gap-0 sm:grid-cols-[1fr_auto]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[.16em] text-[#237a54]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 ring-1 ring-[#d8e3dd]">
                <Sparkles size={13} aria-hidden="true" />
                {state.eyebrow}
              </span>
              {hasTrip && phase === 'route' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e0f2fe] px-2.5 py-1 text-[#075985]">
                  <CheckCircle2 size={13} aria-hidden="true" />
                  En cours
                </span>
              )}
            </div>

            <h2 id="rme-now-title" className="mt-3 max-w-2xl text-2xl font-display font-semibold tracking-tight text-[#0f1f3d] sm:text-3xl">
              {state.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#475569] sm:text-base">
              {state.body}
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-[#475569]">
              {hasTrip && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 ring-1 ring-[#d8e3dd]">
                  <MapPin size={13} className="text-[#237a54]" aria-hidden="true" />
                  {depart} → {arrivee}
                </span>
              )}
              {travel.dateVoyage && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 ring-1 ring-[#d8e3dd]">
                  <CalendarDays size={13} className="text-[#b45309]" aria-hidden="true" />
                  {travel.dateVoyage}
                </span>
              )}
              {routeHasFerry && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 ring-1 ring-[#d8e3dd]">
                  <Ship size={13} className="text-[#b45309]" aria-hidden="true" />
                  Traversée détectée dans le trajet
                </span>
              )}
            </div>
          </div>

          <div className="flex min-w-[17rem] flex-col justify-center gap-2 border-t border-[#d8e3dd] bg-white/70 p-5 sm:border-l sm:border-t-0 sm:p-6">
            {state.actions.map((action, index) => (
              <a
                key={action.href + action.label}
                href={action.href}
                className={index === 0
                  ? 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0f1f3d] px-5 text-sm font-extrabold text-white transition hover:bg-[#1e3a5f]'
                  : 'inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#cbd5e1] bg-white px-5 text-sm font-extrabold text-[#0f1f3d] transition hover:bg-slate-50'}
              >
                {action.label}
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            ))}
            {!hasTrip && (
              <p className="mt-1 text-center text-[11px] font-semibold text-[#64748b]">
                Sans inscription · vos choix restent sur cet appareil
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
