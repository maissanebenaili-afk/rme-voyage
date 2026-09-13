const serviceCategories = [
  {
    title: "Stations et ravitaillement",
    body: "Identifier les arrêts carburant, restauration simple, eau et besoins essentiels avant une longue portion de route.",
  },
  {
    title: "Prière et halte calme",
    body: "Préparer les pauses autour des mosquées, salles de prière ou lieux calmes utiles pendant le trajet.",
  },
  {
    title: "Famille et repos",
    body: "Prioriser sanitaires, ombre, espace enfant, nuit de repos et étape rassurante lorsque le trajet se prolonge.",
  },
  {
    title: "Assistance et relais",
    body: "Repérer consulat, dépannage, pharmacie, hôpital ou contacts d'arrivée à garder à portée de main.",
  },
];
"use client";

import { useState } from "react";
import { Fuel, Moon, Utensils, Building, Bed, Wrench } from "lucide-react";

const services = [
  { icon: Fuel, label: "Stations-service", color: "text-orange-600 bg-orange-50" },
  { icon: Moon, label: "Mosquées", color: "text-emerald-600 bg-emerald-50" },
  { icon: Utensils, label: "Restaurants halal", color: "text-red-600 bg-red-50" },
  { icon: Building, label: "Consulats", color: "text-blue-600 bg-blue-50" },
  { icon: Bed, label: "Aires de repos", color: "text-purple-600 bg-purple-50" },
  { icon: Wrench, label: "Garages", color: "text-slate-600 bg-slate-100" },
];

export default function ServicesMap() {
  const [active, setActive] = useState<string | null>(null);

export default function ServicesMap() {
  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold">Arrêts utiles sur votre parcours</h2>
          <p className="mt-1 text-sm text-slate-600">
            Cette zone prépare la future couche carte et POI du produit. Pour le
            moment, elle sert de structure honnête pour les types d'arrêts que
            les familles RME veulent retrouver rapidement.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          Carte interactive à connecter ensuite
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {serviceCategories.map((service) => (
          <div key={service.title} className="rounded-2xl border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-900">{service.title}</div>
            <p className="mt-1 text-sm text-slate-600">{service.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
        Future intégration MapLibre / OpenStreetMap / données POI validées
    <section className="rounded-2xl bg-white p-5 shadow-sm border">
      <h2 className="text-lg font-bold">📍 Services sur votre route</h2>
      <p className="mt-1 text-sm text-slate-500">
        Filtrez les services essentiels sur votre trajet Europe ↔ Maroc.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {services.map((service) => {
          const Icon = service.icon;
          const isActive = active === service.label;
          return (
            <button
              key={service.label}
              onClick={() => setActive(isActive ? null : service.label)}
              className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? `${service.color} border-transparent ring-2 ring-emerald-500`
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Icon size={16} />
              {service.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {/* Sample service cards */}
        <ServiceCard
          icon={Fuel}
          name="TotalEnergies — Lyon Sud"
          distance="À 2 km de l'autoroute A7"
          info="Ouvert 24/7 · Prix indicatif 1.68€/L"
          color="bg-orange-50"
        />
        <ServiceCard
          icon={Moon}
          name="Grande Mosquée — Barcelone"
          distance="Centre-ville"
          info="Prières quotidiennes · Capacité 2000"
          color="bg-emerald-50"
        />
        <ServiceCard
          icon={Utensils}
          name="Restaurant Al Andalus"
          distance="N-340, Espagne"
          info="Halal certifié · Cuisine marocaine"
          color="bg-red-50"
        />
        <ServiceCard
          icon={Building}
          name="Consulat du Maroc — Tanger"
          distance="Centre-ville"
          info="Passeport · Carte nationale · Urgences"
          color="bg-blue-50"
        />
        <ServiceCard
          icon={Bed}
          name="Aire de repos — Andalousie"
          distance="A-4, km 120"
          info="Parking · Toilettes · Café"
          color="bg-purple-50"
        />
        <ServiceCard
          icon={Wrench}
          name="Garage Atlas — Tanger"
          distance="Route de Rabat"
          info="Réparation · Pneus · Dépannage 24/7"
          color="bg-slate-50"
        />
      </div>

      <div className="mt-4 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50 text-sm text-slate-500">
        <span className="text-center">
          🗺️ Carte interactive avec géolocalisation des services à venir prochainement.
          <br />
          <span className="text-xs">Sources : OpenStreetMap, Google Places, données communautaires.</span>
        </span>
      </div>
    </section>
  );
}

function ServiceCard({
  icon: Icon,
  name,
  distance,
  info,
  color,
}: {
  icon: typeof Fuel;
  name: string;
  distance: string;
  info: string;
  color: string;
}) {
  return (
    <div className={`rounded-xl border border-slate-100 p-4 ${color} card-hover`}>
      <Icon size={20} className="text-slate-600" />
      <h3 className="mt-2 text-sm font-bold text-slate-800">{name}</h3>
      <p className="text-xs text-slate-500">{distance}</p>
      <p className="mt-1 text-xs text-slate-400">{info}</p>
    </div>
  );
}
