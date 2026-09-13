"use client";

import { useEffect, useState } from "react";
import { Ship, Plane, ExternalLink } from "lucide-react";
import { comparisonFallbacks, verifiedPartnerUrl, type BookingType } from "@/lib/bookingLinks";

type Props = { origin: string; destination: string; date?: string };

export default function BookingCards({ origin, destination, date }: Props) {
  const [partners, setPartners] = useState<Partial<Record<BookingType, string>>>({});

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    // Links are dashboard-generated, not constructed from each keystroke.
    // Public comparison links are already usable while this optional lookup runs.
    (['ferry', 'flight'] as const).forEach(async (type) => {
      try {
        const response = await fetch(`/api/affiliates?type=${type}&origin=Europe&destination=Maroc`, {
          signal: controller.signal, cache: 'no-store',
        });
        if (!response.ok) return;
        const data = await response.json();
        const url = data.configured && verifiedPartnerUrl(data.affiliateUrl, type);
        if (url && !controller.signal.aborted) {
          setPartners((current) => ({ ...current, [type]: url }));
        }
      } catch {
        // An unavailable partner service must never block an ordinary link.
      }
    });
    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);

  return (
    <section className="rounded-3xl border border-sable-300 bg-white p-6 shadow-sm" aria-labelledby="booking-title">
      <h2 id="booking-title" className="font-display text-xl font-semibold text-zellige-800">Comparer les traversées et les vols</h2>
      <p className="mt-2 break-words text-sm text-sable-700">
        {origin || 'Votre départ'} → {destination || 'Votre destination'}{date ? ` · ${date}` : ''}
      </p>
      <p className="mt-2 text-sm leading-6 text-sable-700">
        Les comparateurs s’ouvrent dans un nouvel onglet. Renseignez-y votre trajet, vos dates
        et vos voyageurs pour obtenir les disponibilités et les prix.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {(['ferry', 'flight'] as const).map((type) => {
          const Icon = type === 'ferry' ? Ship : Plane;
          const partner = partners[type];
          return (
            <a key={type} href={partner || comparisonFallbacks[type]} target="_blank"
              rel={partner ? 'sponsored noopener noreferrer' : 'noopener noreferrer'}
              data-testid={`compare-${type}`}
              className={`flex min-h-24 items-start gap-3 rounded-2xl p-4 font-semibold text-white transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zellige-700 ${type === 'ferry' ? 'bg-zellige-700 hover:bg-zellige-800' : 'bg-terracotta-600 hover:bg-terracotta-700'}`}>
              <Icon size={22} className="mt-1 shrink-0" aria-hidden />
              <span className="min-w-0 flex-1">
                {type === 'ferry' ? 'Comparer les ferries' : 'Comparer les vols'}
                <span className="mt-2 block text-xs font-normal">
                  {partner ? 'Lien affilié configuré' : `${type === 'ferry' ? 'Direct Ferries' : 'Skyscanner'} · lien non affilié`}
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
