"use client";

import { useEffect, useState } from "react";
import { Ship, Plane, ExternalLink } from "lucide-react";
import { comparisonFallbacks, verifiedPartnerUrl, type BookingType } from "@/lib/bookingLinks";

type Props = { origin: string; destination: string; date?: string };

export default function BookingCards({ origin, destination, date }: Props) {
  const [loading, setLoading] = useState<"flight"|"ferry"|null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function go(type: "flight"|"ferry") {
    setLoading(type);
    setStatusMessage(null);
    try {
      const q = new URLSearchParams({
        type, origin, destination,
        ...(date ? { date } : {})
      });
      const res = await fetch(`/api/affiliates?${q.toString()}`);
      if (!res.ok) {
        throw new Error("Affiliate service error");
      }
      const data = await res.json();

      if (data.configured && data.affiliateUrl) {
        window.location.assign(data.affiliateUrl);
      } else {
        setStatusMessage(
          type === "ferry"
            ? "Le partenaire ferry n'est pas encore configuré. Vérifiez les traversées directement auprès d'un opérateur officiel en attendant."
            : "Le partenaire vols n'est pas encore configuré. Vérifiez les billets directement auprès d'une compagnie ou d'un comparateur officiel en attendant."
        );
      }
    } catch {
      setStatusMessage("Le service de réservation est momentanément indisponible. Réessayez dans quelques instants.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-bold">Réserver au meilleur prix</h2>
      <p className="mt-1 text-sm text-slate-500">
        Comparez puis réservez auprès de nos partenaires. Les liens affiliés
        sont utilisés uniquement lorsqu&apos;un compte partenaire est configuré.
      </p>
      {statusMessage ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900" role="status">
          {statusMessage}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => go("ferry")}
          disabled={loading !== null}
          className="rounded-xl bg-emerald-700 p-4 text-left font-bold text-white disabled:opacity-60"
        >
          ⛴️ {loading === "ferry" ? "Recherche…" : "Comparer les ferries"}
          <span className="mt-1 block text-xs font-normal opacity-90">
            Espagne / France ↔ Maroc
          </span>
        </button>

        <button
          onClick={() => go("flight")}
          disabled={loading !== null}
          className="rounded-xl bg-slate-900 p-4 text-left font-bold text-white disabled:opacity-60"
        >
          ✈️ {loading === "flight" ? "Recherche…" : "Comparer les vols"}
          <span className="mt-1 block text-xs font-normal opacity-90">
            Europe ↔ Maroc
          </span>
        </button>
      </div>
      <p className="mt-4 text-xs leading-5 text-sable-700">
        Un lien affilié peut rémunérer RME Voyage si les conditions du partenaire sont remplies.
        Aucun tarif ni aucune réservation n’est garanti par l’application.
      </p>
    </section>
  );
}
