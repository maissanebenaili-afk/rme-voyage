"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import BookingCards from "./BookingCards";
import CityAutocomplete from "./CityAutocomplete";
import InteractiveMapWrapper from "./InteractiveMapWrapper";
import { ArrowRight, CalendarDays, Car, ExternalLink, Plane, Share2, Ship } from "lucide-react";
import HeroArt from "./home/HeroArt";
import RouteLine from "./home/RouteLine";
import JourneySummary from "./home/JourneySummary";
import StepHeader from "./home/StepHeader";
import RouteJourney from "./RouteJourney";
import { crossesToMorocco, flagFor } from "@/lib/journey";
import type { CitySuggestion } from "@/lib/geocoding";
import type { RouteInfo, RoutePoint } from "./InteractiveMap";
import {
  buildGoogleMapsDirectionsUrl,
  buildShareUrl,
  parseShareParams,
  shareTripLink,
  validateRoute,
} from "@/lib/tripShare";
import { publishRoute, toComputedRoute, useComputedRoute } from "@/lib/routeContext";
import { parseRouteLegs } from "@/lib/routeLegs";
import { trackFunnelEvent } from "@/lib/partnerTracking";

function ferryLabel(legs: unknown): string | undefined {
  const ferries = (parseRouteLegs(legs) ?? []).filter((leg) => leg.kind === "ferry");
  return ferries.length
    ? ferries.map((leg) => (leg.to ? `${leg.from} → ${leg.to}` : leg.from)).join(", ")
    : undefined;
}

type RouteCalcStatus = "idle" | "loading" | "error" | "ready";

export default function RouteSearch({ header, title, belowHero }: { header?: ReactNode; title?: ReactNode; belowHero?: ReactNode } = {}) {
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
  // Itinéraire publié et encore valable (toute modification de ville le retire).
  const route = useComputedRoute();

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
    // The trip summary opens the result: it must be readable, not just its
    // title peeking at the bottom (measured at 693 px on an 844 px screen).
    if (top >= 0 && top < window.innerHeight / 2) return;
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
  const showsFerry = transportMode === "car-ferry" || (transportMode === "car" && crossesToMorocco(origin, destination));
  const modes = [
    { value: "car", label: "Voiture", Icon: Car },
    { value: "car-ferry", label: "Voiture + ferry", Icon: Ship },
    { value: "flight", label: "Avion", Icon: Plane },
  ] as const;

  return (
    <>
      <section aria-label="Votre trajet" className="rme-hero relative isolate text-white">
        <HeroArt />
        {header && <div className="relative">{header}</div>}
        <div className="relative mx-auto max-w-2xl px-5 pb-10 pt-2 sm:pb-14 sm:pt-8">
          {title}

          <div className="mt-7 grid grid-cols-[minmax(0,1fr)_minmax(3.25rem,7rem)_minmax(0,1fr)] items-end gap-2">
            <div className="min-w-0">
              <span aria-hidden="true" className="mb-1 block h-7 text-2xl leading-7">{originFlag ?? ""}</span>
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
            <div className="pb-4">
              <RouteLine mode={transportMode === "flight" ? "flight" : showsFerry ? "car-ferry" : "car"} />
            </div>
            <div className="min-w-0">
              <span aria-hidden="true" className="mb-1 block h-7 text-right text-2xl leading-7">{destinationFlag ?? ""}</span>
              <CityAutocomplete
                variant="journey"
                align="right"
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

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <label className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 pl-4 pr-2 text-sm font-semibold ring-1 ring-white/15 focus-within:ring-2 focus-within:ring-[#f59e0b]">
              <CalendarDays size={16} aria-hidden="true" className="shrink-0 text-white/70" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-h-11 min-w-0 bg-transparent text-sm font-semibold text-white [color-scheme:dark] focus:outline-none"
                aria-label="Date"
              />
            </label>
            <div role="radiogroup" aria-label="Mode de transport" className="flex rounded-full bg-white/10 p-1 ring-1 ring-white/15">
              {modes.map(({ value, label, Icon }) => {
                const active = transportMode === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    aria-label={label}
                    title={label}
                    onClick={() => setTransportMode(value)}
                    className={`inline-flex min-h-9 min-w-11 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-bold transition ${active ? "bg-white text-[#0f1f3d] shadow" : "text-white/70 hover:text-white"}`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {value === "car-ferry" && <Car size={14} aria-hidden="true" className="-ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {(validation.errors.origin || validation.errors.destination || validation.errors.date) && (
            <ul className="mt-3 space-y-1 text-sm font-semibold text-[#fca5a5]">
              {validation.errors.origin && <li>{validation.errors.origin}</li>}
              {validation.errors.destination && <li>{validation.errors.destination}</li>}
              {validation.errors.date && <li>{validation.errors.date}</li>}
            </ul>
          )}

          {/* Le résumé du voyage ouvre le résultat : c'est lui qu'on ramène à l'écran. */}
          <div ref={resultRef} className="scroll-mt-4">
            {routeStatus === "loading" && (
              <p role="status" className="mt-6 flex items-center gap-2 text-sm font-semibold text-white/80">
                <span aria-hidden="true" className="h-2 w-2 animate-ping rounded-full bg-[#f59e0b]" /> Calcul de votre voyage…
              </p>
            )}
            <JourneySummary />
          </div>

          {/* Une seule action principale. L'API compose route + traversée pour l'Europe ↔ Maroc. */}
          {transportMode === "flight" ? (
            <a href="#ferry" className="mt-6 inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-[#f59e0b] px-5 text-base font-extrabold text-[#0f1f3d] shadow-lg shadow-black/25 transition hover:bg-[#fbbf24]">
              Comparer les vols <ArrowRight size={18} aria-hidden="true" />
            </a>
          ) : (
            validation.valid && !route && (
              <button
                type="button"
                onClick={calculateRoute}
                disabled={routeStatus === "loading"}
                className="mt-6 inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-[#f59e0b] px-5 text-base font-extrabold text-[#0f1f3d] shadow-lg shadow-black/25 transition hover:bg-[#fbbf24] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {routeStatus === "loading" ? "Calcul en cours…" : <>Continuer mon voyage <ArrowRight size={18} aria-hidden="true" /></>}
              </button>
            )
          )}

          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-1 text-sm font-semibold text-white/70">
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

          <p className="mt-1 text-center text-xs text-white/40">
            Le lien contient les villes et, si renseignée, la date. Ne le partagez qu’avec les
            personnes de votre choix.
          </p>
        </div>
      </section>

      {belowHero}

      <div className="mx-auto max-w-2xl px-5">
        <section id="la-route" aria-labelledby="la-route-title" className="mt-12 scroll-mt-20">
          <StepHeader
            id="la-route-title"
            step={1}
            title="La route"
            text={routeStatus === "idle" ? "Appuyez sur « Continuer mon voyage » pour tracer l’itinéraire." : "Le tracé calculé, étape par étape."}
          />
          {routeStatus !== "idle" && (
            <>
              <InteractiveMapWrapper
                status={routeStatus}
                routeGeometry={routeGeometry}
                routeInfo={routeInfo}
                errorMessage={routeError}
              />
              <RouteJourney />
            </>
          )}
        </section>
        <section id="ferry" aria-labelledby="ferry-title" className="mt-12 scroll-mt-20">
          <StepHeader id="ferry-title" step={2} title="Ferry et vols" text="Comparez les traversées et les vols chez les compagnies." />
          <BookingCards
            origin={origin}
            destination={destination}
            date={date || undefined}
            crossing={routeStatus === "ready" ? routeInfo?.ferry : undefined}
          />
        </section>
      </div>
    </>
  );
}
