"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import type { ServicePoint } from "@/app/api/services/route";

type ServicesMapViewProps = {
  center: { lat: number; lon: number };
  results: ServicePoint[];
};

function markerIcon(color: string) {
  return L.divIcon({
    html: `<span style="display:block;background:${color};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)"></span>`,
    className: "",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

function formatDistance(distanceMeters: number) {
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 }).format(distanceMeters / 1000)} km`;
}

export default function ServicesMapView({ center, results }: ServicesMapViewProps) {
  return (
    <div className="h-72 overflow-hidden rounded-xl" aria-label="Carte des services trouvés">
      <MapContainer center={[center.lat, center.lon]} zoom={11} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
        <Marker position={[center.lat, center.lon]} icon={markerIcon("#0369a1")}>
          <Popup>Point de recherche</Popup>
        </Marker>
        {results.map((point) => (
          <Marker key={point.id} position={[point.lat, point.lon]} icon={markerIcon("#d9824b")}>
            <Popup>
              <strong>{point.name}</strong>
              <br />
              {formatDistance(point.distanceMeters)} à vol d&apos;oiseau
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
