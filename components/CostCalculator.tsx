"use client";

import { useMemo, useState } from "react";
import { calculateTravelCost } from "@/lib/costCalculator";
import { Car, Fuel, Ship, Waypoints, Wallet } from "lucide-react";

export default function CostCalculator() {
  const [distance, setDistance] = useState(2100);
  const [consumption, setConsumption] = useState(6.5);
  const [fuelPrice, setFuelPrice] = useState(1.65);
  const [tolls, setTolls] = useState(120);
  const [ferry, setFerry] = useState(220);

  const total = useMemo(
    () =>
      calculateTravelCost({
        distanceKm: distance,
        consumptionPer100Km: consumption,
        fuelPricePerLiter: fuelPrice,
        tollFeesEstimate: tolls,
        ferryTicketCost: ferry,
      }),
    [distance, consumption, fuelPrice, tolls, ferry]
  );

  // Cost per person for different group sizes
  const costPerPerson = (n: number) => Math.round(total.grandTotal / n);

  const inputs = [
    { label: "Distance (km)", value: distance, setter: setDistance, icon: Waypoints, suffix: "km" },
    { label: "Consommation", value: consumption, setter: setConsumption, icon: Car, suffix: "L/100km" },
    { label: "Prix carburant", value: fuelPrice, setter: setFuelPrice, icon: Fuel, suffix: "€/L" },
    { label: "Péages (€)", value: tolls, setter: setTolls, icon: Waypoints, suffix: "€" },
    { label: "Ferry (€)", value: ferry, setter: setFerry, icon: Ship, suffix: "€" },
  ];

  return (
    <section className="rounded-3xl border border-sable-300 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Wallet size={20} className="text-zellige-600" />
        <h2 className="font-display text-xl font-semibold text-zellige-800">Budget voyage</h2>
      </div>
      <p className="mt-1.5 text-sm leading-6 text-sable-700">
        Estimez le coût total de votre trajet Europe ↔ Maroc.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {inputs.map(({ label, value, setter, icon: Icon, suffix }) => (
          <label key={label} className="text-sm font-medium text-zellige-800">
            {label}
            <div className="mt-1 flex items-center gap-2">
              <Icon size={16} className="text-sable-700" />
              <input
                type="number"
                value={value}
                onChange={(e) => setter(Number(e.target.value))}
                className="w-full rounded-xl border border-sable-300 p-3 outline-none transition focus:border-zellige-500 focus:ring-2 focus:ring-zellige-500/40"
              />
              <span className="text-xs text-sable-700">{suffix}</span>
            </div>
          </label>
        ))}
      </div>

      {/* Results */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric label="Carburant" value={`${total.fuelTotal.toFixed(0)} €`} icon={Fuel} color="text-terracotta-600 bg-terracotta-50" />
        <Metric label="Péages" value={`${total.tollTotal.toFixed(0)} €`} icon={Waypoints} color="text-zellige-600 bg-zellige-50" />
        <Metric label="Ferry" value={`${total.ferryTotal.toFixed(0)} €`} icon={Ship} color="text-safran-700 bg-safran-50" />
        <Metric label="Total" value={`${total.grandTotal.toFixed(0)} €`} icon={Wallet} color="text-zellige-700 bg-zellige-50" highlight />
      </div>

      {/* Cost per person */}
      <div className="mt-4 flex items-center justify-center gap-4 rounded-xl bg-sable-100 p-4">
        <span className="text-sm text-sable-700">Coût par personne :</span>
        {[2, 3, 4].map((n) => (
          <div key={n} className="text-center">
            <div className="text-xs text-sable-700">{n} pers.</div>
            <div className="font-bold text-zellige-700">{costPerPerson(n)} €</div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-4 rounded-xl bg-safran-50 p-4 text-sm text-safran-900">
        💡 <strong>Astuce :</strong> Le trajet Paris-Tanger en voiture coûte en moyenne 350-450€
        (carburant + péages + ferry), contre 150-300€ par personne en avion.
        À 3+ voyageurs, la route devient plus économique.
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  color,
  highlight,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 text-center ${
        highlight ? "ring-2 ring-zellige-500 " : ""
      }${color}`}
    >
      <Icon size={18} className="mx-auto mb-1" />
      <div className="text-xs opacity-70">{label}</div>
      <div className={`mt-1 text-lg font-black ${highlight ? "text-zellige-700" : ""}`}>
        {value}
      </div>
    </div>
  );
}
