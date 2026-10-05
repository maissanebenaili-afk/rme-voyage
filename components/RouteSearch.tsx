"use client";

import { useEffect, useRef, useState } from "react";
import BookingCards from "./BookingCards";
import CityAutocomplete from "./CityAutocomplete";
import InteractiveMapWrapper from "./InteractiveMapWrapper";
import { ArrowRight, Car, ExternalLink, MapPin, Plane, Share2, Ship } from "lucide-react";
import JourneySummary from "./home/JourneySummary";
import StepHeader from "./home/StepHeader";
import RouteJourney from "./RouteJourney";
import { flagFor } from "@/lib/journey";
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
  const resultRef = useRef<HTMLDivElement | null>(null);

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

  // On a phone the result starts below the button (measured: 912 px on an
  // 844 px screen), so a click looked like nothing happened. Bring the
  // loading state, then the map or the error, into view (also for a shared
  // link, whose visitor came for that result). Nothing moves when it is
  // already visible, as on a desktop screen.
  //
  // Checked again when the result arrives: the map grows from 348 to 645 px
  // and the browser's scroll anchoring then moved the page 699 px further,
  // leaving the map above the screen (Forge B02 on the deploy preview).
  useEffect(() => {
    if (routeStatus === "idle") return;
    const el = resultRef.current;
    if (!el || typeof el.scrollIntoView !== "function") return;
    const { top } = el.getBoundingClientRect();
    if (top >= 0 && top < window.innerHeight - 80) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [routeStatus]);

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

  const originFlag = flagFor(origin);
  const destinationFlag = flagFor(destination);
  const fieldClass =
    "mt-1 w-full min-h-[44px] rounded-xl border border-white/15 bg-white/10 px-3 text-sm font-semibold text-white [color-scheme:dark] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]";

  return (
    <>
      <section aria-label="Votre trajet" className="rounded-[28px] bg-[#0f1f3d] p-5 text-white shadow-xl shadow-[#0f1f3d]/25 sm:p-7">
        <div className="relative pl-10">
          <span aria-hidden="true" className="absolute bottom-7 left-[15px] top-7 border-l-2 border-dashed border-white/25" />
          <div className="relative">
            <span aria-hidden="true" className="absolute -left-10 top-4 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-base ring-1 ring-white/15">
              {originFlag ?? <span className="h-2 w-2 rounded-full bg-white/70" />}
            </span>
            <CityAutocomplete
              variant="journey"
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
          </div>
          <div aria-hidden="true" className="my-3 flex items-center gap-2 text-white/45">
            {transportMode === "flight" ? <Plane size={16} /> : <Car size={16} />}
            {transportMode !== "flight" && <Ship size={16} />}
          </div>
          <div className="relative">
            <span aria-hidden="true" className="absolute -left-10 top-4 grid h-8 w-8 place-items-center rounded-full bg-[#f59e0b] text-base text-[#0f1f3d]">
              {destinationFlag ?? <MapPin size={15} />}
            </span>
            <CityAutocomplete
              variant="journey"
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
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <label className="text-[11px] font-bold uppercase tracking-[.14em] text-white/55">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={fieldClass}
              aria-label="Date"
            />
          </label>
          <label className="text-[11px] font-bold uppercase tracking-[.14em] text-white/55">
            Mode
            <select
              value={transportMode}
              onChange={(e) => setTransportMode(e.target.value)}
              className={fieldClass}
              aria-label="Mode de transport"
            >
              <option value="car">Voiture</option>
              <option value="flight">Avion</option>
              <option value="car-ferry">Voiture + ferry</option>
            </select>
          </label>
        </div>

        {(validation.errors.origin || validation.errors.destination || validation.errors.date) && (
          <ul className="mt-3 space-y-1 text-sm font-semibold text-[#fca5a5]">
            {validation.errors.origin && <li>{validation.errors.origin}</li>}
            {validation.errors.destination && <li>{validation.errors.destination}</li>}
            {validation.errors.date && <li>{validation.errors.date}</li>}
          </ul>
        )}

        {transportMode === "flight" && (
          <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/85">
            ✈️ Comparez les vols juste en dessous, à l’étape « Ferry et vols ».
          </p>
        )}

        {/* L'API compose route + traversée pour l'Europe ↔ Maroc : même calcul en « voiture + ferry ». */}
        {validation.valid && transportMode !== "flight" && (
          <button
            type="button"
            onClick={calculateRoute}
            disabled={routeStatus === "loading"}
            className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#f59e0b] px-5 text-base font-extrabold text-[#0f1f3d] shadow-lg shadow-black/20 transition hover:bg-[#fbbf24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {routeStatus === "loading" ? "Calcul en cours…" : <>Voir mon voyage <ArrowRight size={18} aria-hidden="true" /></>}
          </button>
        )}

        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-1 gap-y-1 text-sm font-semibold text-white/75">
          {directionsUrl && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 transition hover:bg-white/10 hover:text-white"
            >
              <ExternalLink size={15} aria-hidden="true" />
              Ouvrir dans Google Maps
            </a>
          )}
          <button
            type="button"
            onClick={handleShare}
            disabled={!validation.valid}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full px-3 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Share2 size={15} aria-hidden="true" />
            Partager mon trajet
          </button>
        </div>
        <div role="status" className="text-center text-sm font-semibold text-[#fcd34d]">
          {shareState.status === "shared" && "Partage effectué !"}
          {shareState.status === "copied" && "Lien copié !"}
          {shareState.status === "cancelled" && <span className="text-white/60">Partage annulé.</span>}
        </div>

        {shareState.status === "manual" && (
          <div className="mt-3">
            <label className="text-xs font-medium text-white/70" htmlFor="rme-share-link-fallback">
              Copie automatique indisponible — copiez ce lien manuellement :
            </label>
            <input
              id="rme-share-link-fallback"
              type="text"
              readOnly
              value={shareState.url}
              onFocus={(e) => e.currentTarget.select()}
              className="mt-1 w-full min-h-[44px] rounded-xl bg-white p-3 text-sm text-slate-700"
            />
          </div>
        )}

        <p className="mt-2 text-center text-xs text-white/45">
          Le lien contient les villes et, si renseignée, la date. Ne le partagez qu’avec les
          personnes de votre choix.
        </p>
      </section>
      {/* Le résumé du voyage ouvre le résultat : c'est lui qu'on ramène à l'écran. */}
      <div ref={resultRef} className="scroll-mt-4">
        <JourneySummary />
        <div className="mt-10">
        <StepHeader
          step={1}
          title="La route"
          text={routeStatus === "idle" ? "Appuyez sur « Voir mon voyage » pour tracer l’itinéraire." : "Le tracé calculé, étape par étape."}
        />
        {routeStatus !== "idle" && (
          <div>
          <InteractiveMapWrapper
            status={routeStatus}
            routeGeometry={routeGeometry}
            routeInfo={routeInfo}
            errorMessage={routeError}
          />
          <RouteJourney />
          </div>
        )}
        </div>
      </div>
      <section id="ferry" aria-labelledby="ferry-title" className="mt-10 scroll-mt-4">
      <StepHeader id="ferry-title" step={2} title="Ferry et vols" text="Comparez les traversées et les vols chez les compagnies." />
      <BookingCards
        origin={origin}
        destination={destination}
        date={date || undefined}
        crossing={routeStatus === "ready" ? routeInfo?.ferry : undefined}
      />
      </section>
    </>
  );
}
