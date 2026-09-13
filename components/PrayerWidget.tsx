"use client";

import { useEffect, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";

type PrayerTimes = Record<string, string>;

export default function PrayerWidget() {
  const [prayers, setPrayers] = useState<PrayerTimes | null>(null);
  const [error, setError] = useState(false);
  const [location, setLocation] = useState("Paris (par défaut)");
  const [coords, setCoords] = useState({ lat: 48.8566, lon: 2.3522 });

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      // Try geolocation first
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            setCoords({ lat: latitude, lon: longitude });
            setLocation(`${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`);
            fetchPrayers(latitude, longitude);
          },
          () => {
            fetchPrayers(48.8566, 2.3522);
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 600000 }
        );
      } else {
        fetchPrayers(48.8566, 2.3522);
      }
    }

    async function fetchPrayers(lat: number, lon: number) {
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=3`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Prayer API error");
        const data = await res.json();
        if (data?.data?.timings) setPrayers(data.data.timings);
        else throw new Error("Invalid response");
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError(true);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  if (error)
    return (
      <div className="rounded-2xl border bg-white p-5 text-sm text-slate-500">
        Horaires indisponibles. Vérifiez votre connexion.
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
        <span className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin size={12} />
          {location}
        </span>
      </div>

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
                isNext ? "bg-emerald-600 text-white" : "bg-slate-50"
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
