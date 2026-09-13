"use client";

import { MapContainer, Marker, Polyline, TileLayer } from "react-leaflet";
import L from "leaflet";
import { AlertCircle, LoaderCircle, MapPinned } from "lucide-react";

export type RoutePoint = [number, number];

export type RouteInfo = {
  distanceMeters?: number;
  durationSeconds?: number;
};

type InteractiveMapProps = {
  routeGeometry?: RoutePoint[];
  routeInfo?: RouteInfo;
  status?: "idle" | "loading" | "error" | "ready";
  errorMessage?: string;
};

function markerIcon(color: string) {
  return L.divIcon({
    html: `<span style="display:block;background:${color};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></span>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function formatDistance(distanceMeters?: number) {
  return typeof distanceMeters === "number"
    ? `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(distanceMeters / 1000)} km`
    : null;
}

function formatDuration(durationSeconds?: number) {
  if (typeof durationSeconds !== "number") return null;
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.round((durationSeconds % 3600) / 60);
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}

export default function InteractiveMap({
  routeGeometry,
  routeInfo,
  status = "idle",
  errorMessage,
}: InteractiveMapProps) {
  const hasRoute = status === "ready" && Boolean(routeGeometry && routeGeometry.length >= 2);
  const distance = formatDistance(routeInfo?.distanceMeters);
  const duration = formatDuration(routeInfo?.durationSeconds);

  return (
    <section className="rounded-3xl border border-sable-300 bg-white p-6 shadow-sm" aria-labelledby="route-map-title">
      <div className="flex items-center gap-2">
        <MapPinned size={20} className="text-zellige-600" aria-hidden="true" />
        <h2 id="route-map-title" className="font-display text-lg font-semibold text-zellige-800">
          Carte de l’itinéraire
        </h2>
      </div>

      {status === "loading" && (
        <div className="mt-4 flex h-64 items-center justify-center gap-2 rounded-2xl bg-sable-100 text-sm text-sable-700" role="status">
          <LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> Calcul de l’itinéraire…
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 flex min-h-40 items-center gap-3 rounded-2xl bg-terracotta-50 p-5 text-sm text-terracotta-700" role="alert">
          <AlertCircle size={20} className="shrink-0" aria-hidden="true" />
          {errorMessage || "L’itinéraire est indisponible. Réessayez plus tard."}
        </div>
      )}

      {!hasRoute && status !== "loading" && status !== "error" && (
        <div className="mt-4 flex min-h-40 items-center rounded-2xl bg-sable-100 p-5 text-sm text-sable-700">
          Renseignez un départ et une destination pour afficher un itinéraire vérifié.
        </div>
      )}

      {hasRoute && routeGeometry && (
        <>
          <div className="mt-4 h-80 overflow-hidden rounded-xl" aria-label="Carte de l’itinéraire calculé">
            <MapContainer center={routeGeometry[0]} zoom={6} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
              <Polyline positions={routeGeometry} color="#0d6255" weight={4} opacity={0.8} />
              <Marker position={routeGeometry[0]} icon={markerIcon("#0d6255")} />
              <Marker position={routeGeometry[routeGeometry.length - 1]} icon={markerIcon("#d9824b")} />
            </MapContainer>
          </div>
          {(distance || duration) && (
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {distance && <div className="rounded-2xl bg-sable-100 p-3"><dt className="text-xs text-sable-700">Distance</dt><dd className="font-bold text-zellige-800">{distance}</dd></div>}
              {duration && <div className="rounded-2xl bg-sable-100 p-3"><dt className="text-xs text-sable-700">Durée</dt><dd className="font-bold text-zellige-800">{duration}</dd></div>}
            </dl>
          )}
        </>
      )}
    </section>
  );
}
