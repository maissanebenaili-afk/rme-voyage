"use client";

import { useEffect, useRef, useState } from "react";
import BookingCards from "./BookingCards";
import CityAutocomplete from "./CityAutocomplete";
import InteractiveMapWrapper from "./InteractiveMapWrapper";
import { Navigation, Calendar, ExternalLink, Share2, Route as RouteIcon } from "lucide-react";
import type { CitySuggestion } from "@/lib/geocoding";
import type { RouteInfo, RoutePoint } from "./InteractiveMap";
import {
  buildGoogleMapsDirectionsUrl,
  buildShareUrl,
  parseShareParams,
  shareTripLink,
  validateRoute,
} from "@/lib/tripShare";
import { publishRoute, toComputedRoute } from "@/lib/routeContext";
import { parseRouteLegs } from "@/lib/routeLegs";
import { trackFunnelEvent } from "@/lib/partnerTracking";

function ferryLabel(legs: unknown): string | undefined {
  const ferries = (parseRouteLegs(legs) ?? []).filter((leg) => leg.kind === "ferry");
  return ferries.length
    ? ferries.map((leg) => (leg.to ? `${leg.from} → ${leg.to}` : leg.from)).join(", ")
    : undefined;
}

type RouteCalcStatus = "idle" | "loading" | "error" | "ready";

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
  const routeRequestRef = useRef<AbortController | null>(null);
  const pendingSharedRoute = useRef<{ origin: string; destination: string } | null>(null);

  const [routeStatus, setRouteStatus] = useState<RouteCalcStatus>("idle");
  const [routeGeometry, setRouteGeometry] = useState<RoutePoint[] | undefined>(undefined);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | undefined>(undefined);
  const [routeError, setRouteError] = useState<string | undefined>(undefined);

  // Réhydratation depuis un lien partagé (/?from=...&to=...&date=...#planifier)
  // et depuis les pages /trajet/…. Paramètres invalides ou absents ignorés.
  // Le trajet reçu est calculé aussitôt : remplir les champs sans rien calculer
  // laissait les estimations sur la distance d'exemple.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const shared = parseShareParams(window.location.href);
    if (shared.from) setOrigin(shared.from);
    if (shared.to) setDestination(shared.to);
    if (shared.date) setDate(shared.date);
    if (shared.from && shared.to) {
      pendingSharedRoute.current = { origin: shared.from, destination: shared.to };
    }
  }, []);

  // Un seul calcul, une fois les champs remplis par l'effet ci-dessus.
  useEffect(() => {
    const pending = pendingSharedRoute.current;
    if (!pending || pending.origin !== origin || pending.destination !== destination) return;
    pendingSharedRoute.current = null;
    void calculateRoute();
    // calculateRoute lit l'état courant ; l'effet ne doit se déclencher que
    // lorsque les champs partagés sont en place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination]);

  // Nettoyage du timeout de réinitialisation du message de partage au
  // démontage, pour éviter un setState sur composant démonté.
  useEffect(() => {
    return () => {
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
      routeRequestRef.current?.abort();
    };
  }, []);

  const validation = validateRoute(origin, destination, date);
  const directionsUrl = validation.valid
    ? buildGoogleMapsDirectionsUrl(origin, destination)
    : null;

  async function calculateRoute() {
    if (!validation.valid) return;
    routeRequestRef.current?.abort();
    const controller = new AbortController();
    routeRequestRef.current = controller;

    setRouteStatus("loading");
    setRouteError(undefined);

    try {
      const params = new URLSearchParams({ origin, destination });
      const response = await fetch(`/api/route?${params.toString()}`, {
        signal: controller.signal,
      });
      const data = await response.json();

      if (!response.ok) {
        setRouteError(data.error || "Itinéraire indisponible.");
        setRouteStatus("error");
        return;
      }

      setRouteGeometry(data.geometry);
      setRouteInfo({
        distanceMeters: data.distanceMeters,
        durationSeconds: data.durationSeconds,
        ferry: ferryLabel(data.legs),
      });
      setRouteStatus("ready");
      // Alimente le Reality Check et le budget avec la distance mesurée.
      publishRoute(
        toComputedRoute(origin, destination, data.distanceMeters, data.durationSeconds, Date.now(), data.legs, date || undefined),
      );
      trackFunnelEvent({
        event: "route_computed",
        placement: "route_search",
        data: { has_ferry: Boolean(ferryLabel(data.legs)) },
      });
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      setRouteError("Itinéraire indisponible. Vérifiez votre connexion et réessayez.");
      setRouteStatus("error");
    }
  }

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
      <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
          <Navigation size={16} className="text-emerald-600" />
          Départ et destination
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CityAutocomplete
            label="Départ"
            value={origin}
            placeholder="Ville de départ"
            onChange={(v) => {
              setOrigin(v);
              setOriginCity(null);
              publishRoute(null);
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
              publishRoute(null);
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

        {transportMode === "flight" && (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            ✈️ La recherche de vols arrive bientôt. En attendant, consultez Google Flights ou Skyscanner.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {/* L'API compose route + traversée pour l'Europe ↔ Maroc : même calcul en « voiture + ferry ». */}
          {validation.valid && transportMode !== "flight" && (
            <button
              type="button"
              onClick={calculateRoute}
              disabled={routeStatus === "loading"}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RouteIcon size={16} />
              {routeStatus === "loading" ? "Calcul en cours…" : "Calculer l'itinéraire"}
            </button>
          )}
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-sable-300 bg-sable-50 px-4 py-2.5 text-sm font-semibold text-zellige-800 transition hover:bg-sable-100"
            >
              <ExternalLink size={16} />
              Ouvrir dans Google Maps
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
      {routeStatus !== "idle" && (
        <InteractiveMapWrapper
          status={routeStatus}
          routeGeometry={routeGeometry}
          routeInfo={routeInfo}
          errorMessage={routeError}
        />
      )}
      <BookingCards
        origin={origin}
        destination={destination}
        date={date || undefined}
        crossing={routeStatus === "ready" ? routeInfo?.ferry : undefined}
      />
    </>
  );
}
