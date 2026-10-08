"use client";

import { useMemo, useState } from "react";
import { rankWindow, type Assessment, type Profile, type Trip } from "@/lib/lab/crossingWindow/engine";

const COLORS = ["bg-emerald-100 text-emerald-900", "bg-amber-100 text-amber-900", "bg-red-100 text-red-900", "bg-gray-900 text-white"];

export default function CrossingWindow({ trips }: { trips: Trip[] }) {
  const [origin, setOrigin] = useState(trips.find((t) => t.origin === "Paris")?.origin ?? trips[0]?.origin ?? "");
  const [from, setFrom] = useState("2026-07-27");
  const [to, setTo] = useState("2026-08-08");
  const [hour, setHour] = useState(6);
  const [profile, setProfile] = useState<Profile>("relais");
  const trip = trips.find((t) => t.origin === origin);
  const ranked: Assessment[] = useMemo(() => (trip && from <= to ? rankWindow(trip, from, to, hour, profile) : []), [trip, from, to, hour, profile]);
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-black">Quand partir ?</h1>
      <p className="text-sm text-slate-600">
        La route française et le port, pour le même voyage. Données de l&apos;été 2026 uniquement (prototype). Chaque ligne dit d&apos;où vient l&apos;information.
      </p>
      <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <label className="text-sm font-bold">Départ de
          <select className="mt-1 w-full rounded-lg border p-2 font-normal" value={origin} onChange={(e) => setOrigin(e.target.value)}>
            {trips.map((t) => <option key={t.origin} value={t.origin}>{t.origin} → {t.port}</option>)}
          </select>
        </label>
        <label className="text-sm font-bold">Heure de départ
          <select className="mt-1 w-full rounded-lg border p-2 font-normal" value={hour} onChange={(e) => setHour(Number(e.target.value))}>
            {[4, 6, 8, 12, 14, 18, 20, 22].map((h) => <option key={h} value={h}>{h} h</option>)}
          </select>
        </label>
        <label className="text-sm font-bold">Entre le
          <input type="date" className="mt-1 w-full rounded-lg border p-2 font-normal" value={from} min="2026-07-01" max="2026-08-31" onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label className="text-sm font-bold">et le
          <input type="date" className="mt-1 w-full rounded-lg border p-2 font-normal" value={to} min="2026-07-01" max="2026-08-31" onChange={(e) => setTo(e.target.value)} />
        </label>
        <label className="col-span-2 text-sm font-bold">Façon de rouler
          <select className="mt-1 w-full rounded-lg border p-2 font-normal" value={profile} onChange={(e) => setProfile(e.target.value as Profile)}>
            <option value="relais">D&apos;une traite, en se relayant</option>
            <option value="nuit">Avec une nuit en route</option>
          </select>
        </label>
      </div>
      <ol className="space-y-2">
        {ranked.map((a) => (
          <li key={a.departure} className="rounded-2xl bg-white p-3 shadow-sm">
            <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setOpen(open === a.departure ? null : a.departure)} aria-expanded={open === a.departure}>
              <span className="font-bold">{a.departure}</span>
              <span className="text-xs text-slate-500">au port le {a.arrivalAtPort}</span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${a.combined === null ? "bg-slate-200" : COLORS[a.combined]}`}>{a.label}</span>
            </button>
            {a.crossBorderTrap && <p className="mt-2 text-sm font-bold text-red-700">Route française calme, mais arrivée au port un jour chargé.</p>}
            {open === a.departure && (
              <ul className="mt-2 space-y-1 text-xs text-slate-700">
                {a.reasons.map((r, i) => <li key={i}><span className="font-bold">[{r.status}]</span> {r.text}{r.source ? ` — ${r.source}` : ""}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
