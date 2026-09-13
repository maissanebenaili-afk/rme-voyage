"use client";

import { useEffect, useRef, useState } from "react";
import BookingCards from "./BookingCards";
import CityAutocomplete from "./CityAutocomplete";
import { Navigation, Calendar, ExternalLink, Share2 } from "lucide-react";
import type { CitySuggestion } from "@/lib/geocoding";
import {
  buildGoogleMapsDirectionsUrl,
  buildShareUrl,
  parseShareParams,
  shareTripLink,
  validateRoute,
} from "@/lib/tripShare";

export default function RouteSearch() {
  const [origin, setOrigin] = useState("Paris, France");
  const [destination, setDestination] = useState("Tanger, Maroc");
  const [date, setDate] = useState("");
  const [transportMode, setTransportMode] = useState("car");
  // Conservées pour un usage futur (ex. affichage du pays sélectionné) ;
  // aucune distance/estimation n'est calculée à partir de ces valeurs.
  const [, setOriginCity] = useState<CitySuggestion | null>(null);
  const [, setDestinationCity] = useState<CitySuggestion | null>(null);
  const [shareState, setShareState] = useState<
    | { status: "idle" }
    | { status: "shared" }
    | { status: "copied" }
    | { status: "cancelled" }
    | { status: "manual"; url: string }
  >({ status: "idle" });
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Réhydratation depuis un lien partagé (/?from=...&to=...&date=...#planifier).
  // Paramètres invalides ou absents sont simplement ignorés.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const shared = parseShareParams(window.location.href);
    if (shared.from) setOrigin(shared.from);
    if (shared.to) setDestination(shared.to);
    if (shared.date) setDate(shared.date);
  }, []);

  // Nettoyage du timeout de réinitialisation du message de partage au
  // démontage, pour éviter un setState sur composant démonté.
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  const validation = validateRoute(origin, destination, date);
  const directionsUrl = validation.valid
    ? buildGoogleMapsDirectionsUrl(origin, destination)
    : null;

  function scheduleReset() {
    if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = setTimeout(() => setShareState({ status: "idle" }), 3000);
  }

  async function handleShare() {
    const url = buildShareUrl({ from: origin, to: destination, date: date || undefined });
    const result = await shareTripLink(url, {
      title: "Mon trajet RME Voyage",
      text: `${origin} → ${destination}`,
    });
    if (result.method === "manual") {
      setShareState({ status: "manual", url });
      return;
    }
    if (result.method === "cancelled") {
      // Annulation explicite de la feuille de partage native : pas de
      // message de confirmation, pas de copie clipboard en silence.
      setShareState({ status: "cancelled" });
      scheduleReset();
      return;
    }
    setShareState({ status: result.method === "web-share" ? "shared" : "copied" });
    scheduleReset();
  }

  return (
    <>
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Navigation size={20} className="text-emerald-600" />
          <h1 className="text-xl font-bold">Votre voyage Europe → Maroc</h1>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          RME Voyage centralise les informations essentielles pour préparer un départ serein.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CityAutocomplete
            label="Départ"
            value={origin}
            placeholder="Ville de départ"
            onChange={(v) => {
              setOrigin(v);
              setOriginCity(null);
            }}
            onSelect={(result) => setOriginCity(result)}
          />
          <CityAutocomplete
            label="Destination"
            value={destination}
            placeholder="Ville d'arrivée"
            onChange={(v) => {
              setDestination(v);
              setDestinationCity(null);
            }}
            onSelect={(result) => setDestinationCity(result)}
          />
          <label className="text-sm font-medium">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar size={12} /> Date
            </span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full min-h-[44px] rounded-xl border p-3"
              aria-label="Date"
            />
          </label>
          <label className="text-sm font-medium">
            <span className="text-xs text-slate-500">Mode de transport</span>
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
              className="mt-1 w-full min-h-[44px] rounded-xl border bg-white p-3"
              aria-label="Mode de transport"
            >
              <option value="car">Voiture</option>
              <option value="flight">Avion</option>
              <option value="car-ferry">Voiture + ferry</option>
            </select>
          </label>
        </div>

        {(validation.errors.origin || validation.errors.destination || validation.errors.date) && (
          <ul className="mt-3 space-y-1 text-xs text-terracotta-600">
            {validation.errors.origin && <li>{validation.errors.origin}</li>}
            {validation.errors.destination && <li>{validation.errors.destination}</li>}
            {validation.errors.date && <li>{validation.errors.date}</li>}
          </ul>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-zellige-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zellige-600"
            >
              <ExternalLink size={16} />
              Ouvrir l&apos;itinéraire
            </a>
          )}
          <button
            type="button"
            onClick={handleShare}
            disabled={!validation.valid}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-sable-300 bg-sable-50 px-4 py-2.5 text-sm font-semibold text-zellige-800 transition hover:bg-sable-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Share2 size={16} />
            Partager mon trajet
          </button>
          {shareState.status === "shared" && (
            <span className="inline-flex min-h-[44px] items-center text-sm text-zellige-700">
              Partage effectué !
            </span>
          )}
          {shareState.status === "copied" && (
            <span className="inline-flex min-h-[44px] items-center text-sm text-zellige-700">
              Lien copié !
            </span>
          )}
          {shareState.status === "cancelled" && (
            <span className="inline-flex min-h-[44px] items-center text-sm text-slate-500">
              Partage annulé.
            </span>
          )}
        </div>

        {shareState.status === "manual" && (
          <div className="mt-3">
            <label className="text-xs font-medium text-slate-500" htmlFor="rme-share-link-fallback">
              Copie automatique indisponible — copiez ce lien manuellement :
            </label>
            <input
              id="rme-share-link-fallback"
              type="text"
              readOnly
              value={shareState.url}
              onFocus={(e) => e.currentTarget.select()}
              className="mt-1 w-full min-h-[44px] rounded-xl border p-3 text-sm text-slate-600"
            />
          </div>
        )}

        <p className="mt-3 text-xs text-slate-400">
          Le lien contient les villes et, si renseignée, la date. Ne le partagez qu’avec les
          personnes de votre choix.
        </p>
      </section>
      <BookingCards origin={origin} destination={destination} date={date || undefined} />
    </>
  );
}
