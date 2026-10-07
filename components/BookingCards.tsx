"use client";

import { useEffect, useRef, useState } from "react";
import { Ship, Plane, ExternalLink } from "lucide-react";
import { comparisonFallbacks, verifiedPartnerUrl, type BookingType } from "@/lib/bookingLinks";
import { trackPartnerClick } from "@/lib/partnerTracking";

type Props = {
  origin: string;
  destination: string;
  date?: string;
  /** « Tarifa → Tanger Ville » lorsque l'itinéraire calculé impose une traversée. */
  crossing?: string;
  /** Titre gardé pour les lecteurs d'écran seulement (l'accueil l'annonce déjà par « Ferry et vols »). */
  hideTitle?: boolean;
};

type ConfiguredPartner = { url: string; provider: string; prefilled?: boolean };
type Trip = { origin: string; destination: string; date?: string };

const LOOKUP_TIMEOUT_MS = 5000;
// The flight link can open pre-filled on the trip: look it up again when the
// trip changes, but not on every keystroke.
const FLIGHT_LOOKUP_DELAY_MS = 400;

async function lookupPartner(type: BookingType, trip: Trip, signal: AbortSignal): Promise<ConfiguredPartner | null> {
  const params = new URLSearchParams({
    type,
    origin: trip.origin || 'Europe',
    destination: trip.destination || 'Maroc',
  });
  if (trip.date) params.set('date', trip.date);
  const response = await fetch(`/api/affiliates?${params.toString()}`, { signal, cache: 'no-store' });
  if (!response.ok) return null;
  const data = await response.json();
  const url = data.configured && verifiedPartnerUrl(data.affiliateUrl, type);
  if (!url) return null;
  const provider = typeof data.provider === 'string' && data.provider ? data.provider : 'unknown';
  return { url, provider, ...(data.prefilled === true ? { prefilled: true } : {}) };
}

export default function BookingCards({ origin, destination, date, crossing, hideTitle = false }: Props) {
  const [partners, setPartners] = useState<Partial<Record<BookingType, ConfiguredPartner>>>({});
  // The ferry link comes from the dashboard and does not depend on the trip.
  const tripAtMount = useRef<Trip>({ origin, destination, date });
  const firstFlightLookup = useRef(true);

  // Public comparison links are already usable while these optional lookups run;
  // an unavailable partner service must never block an ordinary link.
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
    lookupPartner('ferry', tripAtMount.current, controller.signal)
      .then((partner) => {
        if (partner && !controller.signal.aborted) setPartners((current) => ({ ...current, ferry: partner }));
      })
      .catch(() => {});
    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const delay = firstFlightLookup.current ? 0 : FLIGHT_LOOKUP_DELAY_MS;
    firstFlightLookup.current = false;
    // A link pre-filled for another trip is never kept.
    const dropPrefilled = () => setPartners((current) => {
      if (!current.flight?.prefilled) return current;
      const rest = { ...current };
      delete rest.flight;
      return rest;
    });
    const debounce = setTimeout(() => {
      timeout = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);
      lookupPartner('flight', { origin, destination, date }, controller.signal)
        .then((partner) => {
          if (controller.signal.aborted) return;
          if (partner) setPartners((current) => ({ ...current, flight: partner }));
          else dropPrefilled();
        })
        .catch(() => { if (!controller.signal.aborted) dropPrefilled(); });
    }, delay);
    return () => { clearTimeout(debounce); clearTimeout(timeout); controller.abort(); };
  }, [origin, destination, date]);

  const flightPrefilled = Boolean(partners.flight?.prefilled);

  return (
    <section className="depth-card rounded-3xl border border-sable-300 bg-white p-6" aria-labelledby="booking-title">
      <h2 id="booking-title" className={hideTitle ? "sr-only" : "font-display text-xl font-semibold text-zellige-800"}>Comparer les traversées et les vols</h2>
      <p className="mt-2 break-words text-sm text-sable-700">
        {origin || 'Votre départ'} → {destination || 'Votre destination'}{date ? ` · ${date}` : ''}
      </p>
      {crossing && (
        <p className="mt-3 rounded-xl bg-zellige-50 px-4 py-3 text-sm text-zellige-800">
          D’après l’itinéraire calculé, la traversée la plus courte est <strong>{crossing}</strong>. Cherchez
          cette liaison chez les compagnies, et comparez-la aux autres ports : le prix et les horaires du jour
          peuvent rendre une traversée plus longue préférable.
        </p>
      )}
      <p className="mt-2 text-sm leading-6 text-sable-700">
        {flightPrefilled ? (
          <>
            Les comparateurs s’ouvrent dans un nouvel onglet. Le comparateur de vols s’ouvre sur ce trajet
            déjà rempli : vérifiez-y la date et le nombre de voyageurs. Pour la traversée, renseignez votre
            trajet, vos dates et vos voyageurs.
          </>
        ) : (
          <>
            Les comparateurs s’ouvrent dans un nouvel onglet. Renseignez-y votre trajet, vos dates
            et vos voyageurs pour obtenir les disponibilités et les prix : nous ne pré-remplissons pas ces
            formulaires, faute de format de lien documenté par les partenaires.
          </>
        )}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {(['ferry', 'flight'] as const).map((type) => {
          const Icon = type === 'ferry' ? Ship : Plane;
          const partner = partners[type];
          return (
            <a key={type} href={partner?.url || comparisonFallbacks[type]} target="_blank"
              rel={partner ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
              onClick={() => trackPartnerClick({
                partner: partner ? partner.provider : (type === 'ferry' ? 'direct_ferries_public' : 'skyscanner_public'),
                product: type,
                placement: 'booking_cards',
                page: window.location.pathname,
                context: { has_crossing: Boolean(crossing), prefilled: Boolean(partner?.prefilled) },
              })}
              data-testid={`compare-${type}`}
              className={`gloss-dark flex min-h-24 items-start gap-3 rounded-2xl p-4 font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zellige-700 ${type === 'ferry' ? 'bg-zellige-700 hover:bg-zellige-800' : 'bg-terracotta-600 hover:bg-terracotta-700'}`}>
              <Icon size={22} className="mt-1 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1">
                {type === 'ferry' ? 'Comparer les ferries' : 'Comparer les vols'}
                <span className="mt-2 block text-xs font-normal">
                  {partner
                    ? (partner.prefilled ? 'Lien affilié · trajet pré-rempli' : 'Lien affilié configuré')
                    : `${type === 'ferry' ? 'Direct Ferries' : 'Skyscanner'} · lien non affilié`}
                </span>
              </span>
              <ExternalLink size={16} className="mt-1 shrink-0" aria-hidden />
            </a>
          );
        })}
      </div>
      <p className="mt-4 text-xs leading-5 text-sable-700">
        Un lien affilié peut rémunérer RME Voyage si les conditions du partenaire sont remplies.
        Aucun tarif ni aucune réservation n’est garanti par l’application.
      </p>
    </section>
  );
}
