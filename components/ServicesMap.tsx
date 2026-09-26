"use client";

import { useEffect, useRef, useState } from "react";
import { Fuel, Moon, Utensils, Building, Bed, Wrench, LoaderCircle, AlertCircle, Search } from "lucide-react";
import CityAutocomplete from "./CityAutocomplete";
import ServicesMapViewWrapper from "./ServicesMapViewWrapper";
import type { ServiceCategory, ServicePoint } from "@/app/api/services/route";

type SearchStatus = "idle" | "loading" | "error" | "ready";

const CATEGORIES: { key: ServiceCategory; icon: typeof Fuel; label: string; color: string }[] = [
  { key: "fuel", icon: Fuel, label: "Stations-service", color: "text-orange-800 bg-orange-50" },
  { key: "mosque", icon: Moon, label: "Mosquées", color: "text-emerald-600 bg-emerald-50" },
  { key: "halal", icon: Utensils, label: "Restaurants halal", color: "text-red-600 bg-red-50" },
  { key: "consulate", icon: Building, label: "Consulats", color: "text-blue-600 bg-blue-50" },
  { key: "rest_area", icon: Bed, label: "Aires de repos", color: "text-purple-600 bg-purple-50" },
  { key: "garage", icon: Wrench, label: "Garages", color: "text-slate-600 bg-slate-100" },
];

function formatDistance(distanceMeters: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(distanceMeters / 1000)} km`;
}

export default function ServicesMap() {
  const [place, setPlace] = useState("Tanger, Maroc");
  const [category, setCategory] = useState<ServiceCategory>("fuel");
  const [status, setStatus] = useState<SearchStatus>("idle");
  const [center, setCenter] = useState<{ lat: number; lon: number } | null>(null);
  const [results, setResults] = useState<ServicePoint[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => requestRef.current?.abort();
  }, []);

  async function search() {
    const trimmedPlace = place.trim();
    if (!trimmedPlace) return;

    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;

    setStatus("loading");
    setErrorMessage(undefined);

    try {
      const params = new URLSearchParams({ place: trimmedPlace, category });
      const response = await fetch(`/api/services?${params.toString()}`, { signal: controller.signal });
      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Recherche indisponible.");
        setStatus("error");
        return;
      }

      setCenter(data.center);
      setResults(data.results);
      setStatus("ready");
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      setErrorMessage("Recherche indisponible. Vérifiez votre connexion et réessayez.");
      setStatus("error");
    }
  }

  const activeCategory = CATEGORIES.find((c) => c.key === category)!;

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm border">
      <h2 className="text-lg font-bold">📍 Services sur votre route</h2>
      <p className="mt-1 text-sm text-slate-500">
        Recherchez de vrais services autour d&apos;une ville, dans un rayon de 15 km.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = category === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setCategory(cat.key)}
              className={`flex min-h-[44px] items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? `${cat.color} border-transparent ring-2 ring-emerald-500`
                  : "border-slate-200 hover:bg-slate-50"
              }`}
              aria-pressed={isActive}
            >
              <Icon size={16} />
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <CityAutocomplete
            label="Ville de recherche"
            value={place}
            placeholder="Ville proche de votre trajet"
            onChange={setPlace}
            onSelect={(result) => setPlace(result.displayName)}
          />
        </div>
        <button
          type="button"
          onClick={search}
          disabled={status === "loading" || !place.trim()}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "loading" ? <LoaderCircle size={16} className="animate-spin" /> : <Search size={16} />}
          {status === "loading" ? "Recherche…" : "Rechercher"}
        </button>
      </div>

      {status === "error" && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700" role="alert">
          <AlertCircle size={20} className="shrink-0" />
          {errorMessage}
        </div>
      )}

      {status === "ready" && results.length === 0 && (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
          Aucun résultat pour « {activeCategory.label.toLowerCase()} » autour de {place} dans un rayon de 15 km.
          Essayez une autre ville ou une autre catégorie.
        </div>
      )}

      {status === "ready" && results.length > 0 && center && (
        <>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((point) => {
              const Icon = activeCategory.icon;
              return (
                <div key={point.id} className={`rounded-xl border border-slate-100 p-4 ${activeCategory.color} card-hover`}>
                  <Icon size={20} className="text-slate-600" />
                  <h3 className="mt-2 text-sm font-bold text-slate-800">{point.name}</h3>
                  <p className="text-xs text-slate-500">{formatDistance(point.distanceMeters)} à vol d&apos;oiseau</p>
                  {point.address && <p className="mt-1 text-xs text-slate-400">{point.address}</p>}
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <ServicesMapViewWrapper center={center} results={results} />
          </div>
        </>
      )}

      {status === "idle" && (
        <div className="mt-4 flex min-h-[80px] items-center rounded-2xl bg-sable-100 p-5 text-sm text-sable-700">
          Choisissez une catégorie et une ville, puis lancez la recherche pour voir de vrais services à proximité.
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">Données OpenStreetMap (Overpass API).</p>
    </section>
  );
}
