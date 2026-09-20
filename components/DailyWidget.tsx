'use client';

import { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, ChevronDown } from 'lucide-react';

const CITIES = [
  { key: 'casablanca', name: 'Casablanca', lat: 33.5731, lon: -7.5898 },
  { key: 'rabat', name: 'Rabat', lat: 34.0209, lon: -6.8416 },
  { key: 'marrakech', name: 'Marrakech', lat: 31.6295, lon: -7.9811 },
  { key: 'fes', name: 'Fès', lat: 34.0333, lon: -5.0 },
  { key: 'tanger', name: 'Tanger', lat: 35.7595, lon: -5.834 },
  { key: 'agadir', name: 'Agadir', lat: 30.4278, lon: -9.5981 },
  { key: 'oujda', name: 'Oujda', lat: 34.6867, lon: -1.9114 },
  { key: 'meknes', name: 'Meknès', lat: 33.8935, lon: -5.5473 },
  { key: 'nador', name: 'Nador', lat: 35.174, lon: -2.9287 },
  { key: 'taza', name: 'Taza', lat: 34.21, lon: -3.99 },
  { key: 'safi', name: 'Safi', lat: 32.2994, lon: -9.2372 },
  { key: 'tetouan', name: 'Tétouan', lat: 35.5785, lon: -5.3684 },
  { key: 'al_hoceima', name: 'Al Hoceïma', lat: 35.2517, lon: -3.9372 },
  { key: 'beni_mellal', name: 'Béni Mellal', lat: 32.3373, lon: -6.3498 },
  { key: 'errachidia', name: 'Errachidia', lat: 31.9314, lon: -4.4248 },
  { key: 'essaouira', name: 'Essaouira', lat: 31.5085, lon: -9.7595 },
];

type CityOption = (typeof CITIES)[0];

function wxEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '🌤️';
  if (code <= 9) return '⛅';
  if (code <= 49) return '🌫️';
  if (code <= 69) return '🌧️';
  if (code <= 79) return '🌨️';
  if (code <= 99) return '⛈️';
  return '🌡️';
}

function daysUntilRamadan(month: number, day: number): number {
  const AVG = 29.5;
  if (month === 9) return 0;
  if (month < 9) return Math.round((9 - month - 1) * AVG + (AVG - day));
  return Math.round((12 - month) * AVG + 8 * AVG + (AVG - day));
}

interface HijriInfo {
  day: string;
  monthEn: string;
  monthAr: string;
  monthNum: number;
  year: string;
}

interface WeatherInfo {
  temp: number;
  code: number;
}

export default function DailyWidget() {
  const [city, setCity] = useState<CityOption | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [hijri, setHijri] = useState<HijriInfo | null>(null);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rme_city');
      if (saved) {
        const found = CITIES.find((c) => c.key === saved);
        if (found) setCity(found);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const now = new Date();
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    fetch(`https://api.aladhan.com/v1/gToH/${d}-${m}-${y}`)
      .then((r) => r.json())
      .then((data) => {
        const h = data?.data?.hijri;
        if (h) {
          setHijri({
            day: h.day,
            monthEn: h.month.en,
            monthAr: h.month.ar,
            monthNum: h.month.number,
            year: h.year,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!city) return;
    setWeather(null);
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code`
    )
      .then((r) => r.json())
      .then((data) => {
        if (data?.current) {
          setWeather({
            temp: Math.round(data.current.temperature_2m),
            code: data.current.weather_code,
          });
        }
      })
      .catch(() => {});
  }, [city]);

  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [showPicker]);

  function pickCity(c: CityOption) {
    setCity(c);
    setShowPicker(false);
    try {
      localStorage.setItem('rme_city', c.key);
    } catch {}
  }

  const ramadanDays = hijri ? daysUntilRamadan(hijri.monthNum, parseInt(hijri.day)) : null;

  return (
    <div className="bg-[#0c1a33] border-b border-white/10">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-2.5 sm:px-8">
        {/* Hijri date */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={14} className="text-[#fde68a] shrink-0" />
          {hijri ? (
            <span className="text-white font-semibold">
              {hijri.day} {hijri.monthEn} {hijri.year} AH
              <span className="ml-1.5 text-white/45 text-xs">{hijri.monthAr}</span>
            </span>
          ) : (
            <span className="text-white/35 text-xs animate-pulse">Calendrier hijri…</span>
          )}
        </div>

        {/* Ramadan countdown */}
        {hijri && ramadanDays !== null && ramadanDays > 0 && (
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-base">🌙</span>
            <span className="text-white/65 font-medium">
              Ramadan dans{' '}
              <span className="text-[#fde68a] font-bold">{ramadanDays} j</span>
            </span>
          </div>
        )}
        {hijri && hijri.monthNum === 9 && (
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-base">🌙</span>
            <span className="text-[#fde68a] font-bold">Ramadan Mubarak !</span>
          </div>
        )}

        {/* Weather / city picker */}
        <div className="relative" ref={pickerRef}>
          {city ? (
            <button
              onClick={() => setShowPicker((p) => !p)}
              className="flex items-center gap-1.5 text-sm text-white hover:text-[#fde68a] transition"
            >
              <span className="text-base leading-none">
                {weather ? wxEmoji(weather.code) : '⏳'}
              </span>
              {weather ? (
                <span className="font-bold">{weather.temp}°C</span>
              ) : (
                <span className="text-white/40 text-xs">…</span>
              )}
              <span className="text-white/55 font-medium">{city.name}</span>
              <ChevronDown size={13} className="text-white/35" />
            </button>
          ) : (
            <button
              onClick={() => setShowPicker((p) => !p)}
              className="flex items-center gap-1.5 rounded-full border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-3 py-1 text-xs font-semibold text-[#fde68a] hover:bg-[#f59e0b]/20 transition"
            >
              <MapPin size={12} />
              Ma ville au Maroc
            </button>
          )}

          {showPicker && (
            <div className="absolute right-0 top-9 z-50 w-52 rounded-2xl border border-white/10 bg-[#152848] p-2 shadow-2xl">
              <p className="mb-1 px-2 text-[10px] font-bold uppercase tracking-widest text-white/35">
                Votre ville
              </p>
              <div className="max-h-56 overflow-y-auto">
                {CITIES.map((c) => (
                  <button
                    key={c.key}
                    onClick={() => pickCity(c)}
                    className={`w-full rounded-xl px-3 py-1.5 text-left text-sm font-medium transition hover:bg-white/10 ${
                      city?.key === c.key ? 'text-[#fde68a]' : 'text-white/75'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
