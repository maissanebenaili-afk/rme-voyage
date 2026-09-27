"use client";

import { useEffect, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

import { DEFAULT_POSITION, formatPosition, requestUserPosition, type UserPosition } from "@/lib/userPosition";

type PrayerTimes = Record<string, string>;

export default function PrayerWidget() {
  const [prayers, setPrayers] = useState<PrayerTimes | null>(null);
  const [error, setError] = useState(false);
  const [location, setLocation] = useState("Paris (par défaut)");
  const [locating, setLocating] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [position, setPosition] = useState<UserPosition>(DEFAULT_POSITION);

  // Paris answers at once; the user's own position is only asked on tap.
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    setError(false);
    fetch(`/api/prayer?latitude=${position.lat}&longitude=${position.lon}&method=3`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Prayer API error"))))
      .then((data) => {
        if (data?.data?.timings) setPrayers(data.data.timings);
        else throw new Error("Invalid response");
      })
      .catch(() => setError(true))
      .finally(() => clearTimeout(timer));
    return () => { clearTimeout(timer); controller.abort(); };
  }, [position, attempt]);

  async function locateMe() {
    setLocating(true);
    const found = await requestUserPosition();
    setLocating(false);
    if (!found) {
      setLocation("Position refusée · Paris");
      return;
    }
    setLocation(formatPosition(found));
    setPosition(found);
  }

  const locateButton = (
    <button
      type="button"
      onClick={locateMe}
      disabled={locating}
      className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 disabled:opacity-60"
    >
      <MapPin size={12} />
      {locating ? "Localisation…" : "Ma position"}
    </button>
  );

  if (error)
    return (
      <div className="flex items-center justify-between gap-3 rounded-2xl border bg-white p-5 text-sm text-slate-500">
        Horaires indisponibles. Vérifiez votre connexion.
        <button type="button" onClick={() => setAttempt((n) => n + 1)} className="font-semibold text-emerald-700">
          Réessayer
        </button>
      </div>
    );

  if (!prayers)
    return (
      <div className="flex items-center gap-3 rounded-2xl border bg-white p-5 text-sm text-slate-500">
        <Loader2 size={20} className="animate-spin text-emerald-600" />
        Chargement des horaires de prière...
      </div>
    );

  const items: [string, string][] = [
    ["Fajr", prayers.Fajr],
    ["Dhuhr", prayers.Dhuhr],
    ["Asr", prayers.Asr],
    ["Maghrib", prayers.Maghrib],
    ["Isha", prayers.Isha],
  ];

  // Determine next prayer
  const now = new Date();
  const nextPrayer = items.find(([, time]) => {
    const [h, m] = time.split(":").map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(h, m, 0, 0);
    return prayerTime > now;
  });

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">🕌 Horaires de prière</h2>
        {locateButton}
      </div>
      <p className="mt-1 text-xs text-slate-500">{location}</p>

      {nextPrayer && (
        <div className="mt-3 rounded-xl bg-gradient-to-r from-emerald-50 to-amber-50 p-3 text-center">
          <p className="text-xs text-slate-500">Prochaine prière</p>
          <p className="text-lg font-black text-emerald-700">
            {nextPrayer[0]} — {nextPrayer[1]}
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-5 gap-2 text-center">
        {items.map(([name, time]) => {
          const isNext = nextPrayer && nextPrayer[0] === name;
          return (
            <div
              key={name}
              className={`rounded-xl p-2 transition-colors ${
                isNext ? "bg-emerald-700 text-white" : "bg-slate-50"
              }`}
            >
              <div className={`text-xs ${isNext ? "text-white/80" : "text-slate-500"}`}>
                {name}
              </div>
              <div className="mt-1 font-black">
                {time.split(":").slice(0, 2).join(":")}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
