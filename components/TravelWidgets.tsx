"use client";

import { useState, useEffect, useRef } from "react";
import {
  CloudRain,
  Volume2,
  Search,
  Calculator,
  Phone,
  Calendar,
  Star,
  Clock,
  Fuel,
  ChevronDown,
  AlertTriangle,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

/* ──────────────────────────────────────────────
   Theme constants — RME Voyage
   Dark green #0d3f38 · Gold #eead59 · Cream #f8f7f2
   ────────────────────────────────────────────── */
const THEME = {
  green: "#0d3f38",
  gold: "#eead59",
  cream: "#f8f7f2",
} as const;

const cardBase =
  "rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md";
const greenBg = "bg-[#0d3f38] text-[#f8f7f2]";
const goldText = "text-[#eead59]";
const creamBg = "bg-[#f8f7f2]";

/* ============================================================
   1. WeatherMorocco — Open-Meteo forecast for 6 Moroccan cities
   ============================================================ */
type CityWeather = {
  name: string;
  lat: number;
  lon: number;
  temp: number;
  code: number;
  loading: boolean;
  error: boolean;
};

const WMO_CODE_MAP: Record<number, { label: string; emoji: string }> = {
  0: { label: "Ciel dégagé", emoji: "☀️" },
  1: { label: "Plutôt dégagé", emoji: "🌤️" },
  2: { label: "Partiellement nuageux", emoji: "⛅" },
  3: { label: "Couvert", emoji: "☁️" },
  45: { label: "Brouillard", emoji: "🌫️" },
  48: { label: "Brouillard givrant", emoji: "🌫️" },
  51: { label: "Bruine légère", emoji: "🌦️" },
  53: { label: "Bruine modérée", emoji: "🌦️" },
  55: { label: "Bruine dense", emoji: "🌧️" },
  61: { label: "Pluie légère", emoji: "🌧️" },
  63: { label: "Pluie modérée", emoji: "🌧️" },
  65: { label: "Pluie forte", emoji: "🌧️" },
  71: { label: "Neige légère", emoji: "🌨️" },
  73: { label: "Neige modérée", emoji: "🌨️" },
  75: { label: "Neige forte", emoji: "❄️" },
  77: { label: "Grains de neige", emoji: "🌨️" },
  80: { label: "Averses légères", emoji: "🌦️" },
  81: { label: "Averses modérées", emoji: "🌧️" },
  82: { label: "Averses violentes", emoji: "⛈️" },
  85: { label: "Averses de neige", emoji: "🌨️" },
  86: { label: "Averses de neige fortes", emoji: "❄️" },
  95: { label: "Orage", emoji: "⛈️" },
  96: { label: "Orage avec grêle", emoji: "⛈️" },
  99: { label: "Orage violent", emoji: "⛈️" },
};

const WEATHER_CITIES = [
  { name: "Casablanca", lat: 33.57, lon: 7.59 },
  { name: "Rabat", lat: 34.02, lon: 6.83 },
  { name: "Marrakech", lat: 31.63, lon: 7.99 },
  { name: "Fès", lat: 34.03, lon: 5.0 },
  { name: "Tanger", lat: 35.76, lon: 5.83 },
  { name: "Agadir", lat: 30.42, lon: 9.6 },
];

function getWeatherInfo(code: number) {
  return WMO_CODE_MAP[code] || { label: "—", emoji: "🌡️" };
}

export function WeatherMorocco() {
  const [cities, setCities] = useState<CityWeather[]>(
    WEATHER_CITIES.map((c) => ({
      ...c,
      temp: 0,
      code: 0,
      loading: true,
      error: false,
    }))
  );

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCity(city: (typeof WEATHER_CITIES)[number], idx: number) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code&timezone=Africa/Casablanca`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Weather API error");
        const data = await res.json();
        const temp = data?.current?.temperature_2m ?? 0;
        const code = data?.current?.weather_code ?? 0;

        setCities((prev) => {
          const next = [...prev];
          next[idx] = {
            ...next[idx],
            temp: Math.round(temp),
            code,
            loading: false,
            error: false,
          };
          return next;
        });
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setCities((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], loading: false, error: true };
            return next;
          });
        }
      }
    }

    WEATHER_CITIES.forEach((city, idx) => fetchCity(city, idx));
    return () => controller.abort();
  }, []);

  return (
    <section className={`${cardBase} ${creamBg} border-[#0d3f38]/10`}>
      <div className="flex items-center gap-2">
        <CloudRain className="text-[#0d3f38]" size={22} />
        <h2 className="font-display text-lg font-semibold text-[#0d3f38]">
          Météo du Maroc
        </h2>
      </div>
      <p className="mt-1 text-sm text-[#0d3f38]/70">
        Températures actuelles dans 6 villes — données Open-Meteo
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cities.map((city) => {
          const info = getWeatherInfo(city.code);
          return (
            <div
              key={city.name}
              className="flex flex-col items-center rounded-xl border border-[#0d3f38]/10 bg-white p-4 transition-all duration-300 hover:scale-[1.03] hover:shadow-md"
            >
              {city.loading ? (
                <div className="flex w-full animate-pulse flex-col items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-[#0d3f38]/10" />
                  <div className="h-4 w-16 rounded bg-[#0d3f38]/10" />
                  <div className="h-3 w-20 rounded bg-[#0d3f38]/10" />
                </div>
              ) : city.error ? (
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-2xl">⚠️</span>
                  <span className="text-sm font-semibold text-[#0d3f38]">
                    {city.name}
                  </span>
                  <span className="text-xs text-red-500">Indisponible</span>
                </div>
              ) : (
                <>
                  <span className="text-3xl">{info.emoji}</span>
                  <span className="mt-1 text-sm font-bold text-[#0d3f38]">
                    {city.name}
                  </span>
                  <span className="text-2xl font-black text-[#0d3f38]">
                    {city.temp}°C
                  </span>
                  <span className="text-xs text-[#0d3f38]/70">{info.label}</span>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   2. DarijaPhrasebook — Interactive Darija phrasebook with speech
   ============================================================ */
type DarijaPhrase = {
  darija: string;
  arabic: string;
  french: string;
};

type DarijaCategory = {
  name: string;
  emoji: string;
  phrases: DarijaPhrase[];
};

const DARIJA_CATEGORIES: DarijaCategory[] = [
  {
    name: "Salutations",
    emoji: "👋",
    phrases: [
      { darija: "Salam", arabic: "سلام", french: "Bonjour / Salut" },
      { darija: "Salam alaykum", arabic: "السلام عليكم", french: "Que la paix soit sur vous" },
      { darija: "Labas?", arabic: "لا باس؟", french: "Comment ça va?" },
      { darija: "Labas, el hamdulillah", arabic: "لا باس الحمد لله", french: "Ça va, grâce à Dieu" },
      { darija: "Bslama", arabic: "بسلامة", french: "Au revoir" },
      { darija: "Nhar zwin", arabic: "نهار زوين", french: "Bonne journée" },
      { darija: "Marhba", arabic: "مرحبا", french: "Bienvenue" },
    ],
  },
  {
    name: "Nombres",
    emoji: "🔢",
    phrases: [
      { darija: "Wehed", arabic: "وحد", french: "Un" },
      { darija: "Joj", arabic: "جوج", french: "Deux" },
      { darija: "Tlata", arabic: "تلاتة", french: "Trois" },
      { darija: "Arbaa", arabic: "أربعة", french: "Quatre" },
      { darija: "Khamsa", arabic: "خمسة", french: "Cinq" },
      { darija: "Sitta", arabic: "ستة", french: "Six" },
      { darija: "Sebaa", arabic: "سبعة", french: "Sept" },
      { darija: "Tmenya", arabic: "تمنية", french: "Huit" },
    ],
  },
  {
    name: "Nourriture",
    emoji: "🍽️",
    phrases: [
      { darija: "Bghit tajine", arabic: "بغيت طاجين", french: "Je veux un tajine" },
      { darija: "Bghit atay", arabic: "بغيت أتاي", french: "Je veux du thé" },
      { darija: "Ch7al?", arabic: "شحال؟", french: "Combien?" },
      { darija: "Mzyan", arabic: "مزيان", french: "C'est bon / Bien" },
      { darija: "Meskin", arabic: "مسكين", french: "Ce n'est pas bon" },
      { darija: "Bghit ma", arabic: "بغيت ما", french: "Je veux de l'eau" },
      { darija: "Safi", arabic: "صافي", french: "C'est suffisant / OK" },
      { darija: "Barakallahu fik", arabic: "بارك الله فيك", french: "Merci beaucoup" },
    ],
  },
  {
    name: "Voyage",
    emoji: "✈️",
    phrases: [
      { darija: "Fin kayn la gare?", arabic: "فين كاين لا غار؟", french: "Où est la gare?" },
      { darija: "Ch7al taxi l...", arabic: "شحال طاكسي لـ", french: "Combien le taxi pour..." },
      { darija: "Bghit tazir", arabic: "بغيت طازير", french: "Je veux un billet" },
      { darija: "Fin kayn l'hotel?", arabic: "فين كاين لوطيل؟", french: "Où est l'hôtel?" },
      { darija: "Mnin n-goul l'airport?", arabic: "منين نقول ل المطار؟", french: "Comment aller à l'aéroport?" },
      { darija: "Ch7al l'heure?", arabic: "شحال الساعة؟", french: "Quelle heure est-il?" },
    ],
  },
  {
    name: "Urgence",
    emoji: "🚨",
    phrases: [
      { darija: "Aaaawen!", arabic: "عاون!", french: "Aidez-moi!" },
      { darija: "Mrehh el polis", arabic: "مريح البوليس", french: "Appelez la police" },
      { darija: "Mrehh el ambulance", arabic: "مريح الإسعاف", french: "Appelez l'ambulance" },
      { darija: "Ana marid", arabic: "أنا مريض", french: "Je suis malade" },
      { darija: "Fin kayn l'hpital?", arabic: "فين كاين السبيطار؟", french: "Où est l'hôpital?" },
      { darija: "Mrehh el dar", arabic: "مريح الدار", french: "Appelez chez moi" },
    ],
  },
  {
    name: "Shopping",
    emoji: "🛍️",
    phrases: [
      { darija: "Bghit hada", arabic: "بغيت هادا", french: "Je veux celui-ci" },
      { darija: "Ch7al hada?", arabic: "شحال هادا؟", french: "Combien ça coûte?" },
      { darija: "Gali bezaf", arabic: "غالي بزاف", french: "C'est trop cher" },
      { darija: "Wmen?", arabic: "ومن؟", french: "Moins cher?" },
      { darija: "Kayn chi zaid?", arabic: "كاين شي زيادة؟", french: "Il y a autre chose?" },
      { darija: "Safi, gadi", arabic: "صافي غادي", french: "D'accord, je le prends" },
    ],
  },
  {
    name: "Famille",
    emoji: "👨‍👩‍👧",
    phrases: [
      { darija: "Mama", arabic: "ماما", french: "Maman" },
      { darija: "Baba", arabic: "بابا", french: "Papa" },
      { darija: "Khouya", arabic: "خويا", french: "Mon frère" },
      { darija: "Okhti", arabic: "أختي", french: "Ma sœur" },
      { darija: "Jeddi", arabic: "جدي", french: "Mon grand-père" },
      { darija: "Jeddati", arabic: "جدتي", french: "Ma grand-mère" },
      { darija: "Weld l3am", arabic: "ولد لعم", french: "Cousin" },
    ],
  },
];

export function DarijaPhrasebook() {
  const [activeCategory, setActiveCategory] = useState(0);
  const [search, setSearch] = useState("");
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);

  function speak(phrase: DarijaPhrase, idx: number) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phrase.arabic);
    utterance.lang = "ar-MA";
    utterance.rate = 0.8;
    setSpeakingIdx(idx);
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    window.speechSynthesis.speak(utterance);
  }

  const filteredPhrases = DARIJA_CATEGORIES[activeCategory].phrases.filter(
    (p) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        p.darija.toLowerCase().includes(q) ||
        p.french.toLowerCase().includes(q) ||
        p.arabic.includes(q)
      );
    }
  );

  return (
    <section className={`${cardBase} ${creamBg} border-[#0d3f38]/10`}>
      <div className="flex items-center gap-2">
        <span className="text-xl">📚</span>
        <h2 className="font-display text-lg font-semibold text-[#0d3f38]">Darija — Guide de conversation</h2>
      </div>
      <p className="mt-1 text-sm text-[#0d3f38]/70">
        Apprenez le darija marocain. Cliquez pour écouter la prononciation.
      </p>

      {/* Search */}
      <div className="mt-4 relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0d3f38]/70"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une phrase..."
          className="w-full rounded-xl border border-[#0d3f38]/15 bg-white py-2.5 pl-10 pr-4 text-sm text-[#0d3f38] outline-none transition focus:border-[#eead59] focus:ring-2 focus:ring-[#eead59]/20"
        />
      </div>

      {/* Category tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {DARIJA_CATEGORIES.map((cat, idx) => (
          <button
            key={cat.name}
            onClick={() => {
              setActiveCategory(idx);
              setSearch("");
            }}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
              activeCategory === idx
                ? greenBg + " shadow-sm"
                : "bg-white text-[#0d3f38]/70 hover:bg-[#0d3f38]/5"
            }`}
          >
            {cat.emoji} {cat.name}
          </button>
        ))}
      </div>

      {/* Phrases */}
      <div className="mt-4 space-y-2">
        {filteredPhrases.length === 0 ? (
          <p className="py-6 text-center text-sm text-[#0d3f38]/70">
            Aucune phrase trouvée
          </p>
        ) : (
          filteredPhrases.map((phrase, idx) => (
            <div
              key={`${activeCategory}-${idx}`}
              className="flex items-center gap-3 rounded-xl border border-[#0d3f38]/10 bg-white p-3 transition-all duration-200 hover:border-[#eead59] hover:shadow-sm"
            >
              <button
                onClick={() => speak(phrase, idx)}
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg transition-all duration-200 ${
                  speakingIdx === idx
                    ? goldText + " bg-[#0d3f38] animate-pulse"
                    : "bg-[#0d3f38]/5 text-[#0d3f38] hover:bg-[#eead59] hover:text-[#0d3f38]"
                }`}
                aria-label="Écouter"
              >
                <Volume2 size={18} />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-bold text-[#0d3f38]">
                    {phrase.darija}
                  </span>
                  <span className="text-lg text-[#0d3f38]/70" dir="rtl">
                    {phrase.arabic}
                  </span>
                </div>
                <p className="text-sm text-[#0d3f38]/70">{phrase.french}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* ============================================================
   3. CustomsCalculator — Moroccan douane calculator
   ============================================================ */
const RESTRICTED_ITEMS = [
  { name: "Alcool (au-delà des quotas)", level: "warning" },
  { name: "Produits du porc", level: "warning" },
  { name: "Drones", level: "warning" },
  { name: "Armes et munitions", level: "danger" },
  { name: "Médicaments (sans ordonnance)", level: "warning" },
  { name: "Antiquités et objets d'art", level: "warning" },
  { name: "Devises > 10 000 EUR", level: "danger" },
  { name: "Matériel de reproduction", level: "warning" },
];

export function CustomsCalculator() {
  const [electronics, setElectronics] = useState(0);
  const [gifts, setGifts] = useState(0);
  const [personal, setPersonal] = useState(0);

  const DUTY_FREE_PERSONAL = 2000;
  const DUTY_FREE_GIFTS = 1000;
  const DUTY_RATE = 0.2;

  const personalExcess = Math.max(0, personal - DUTY_FREE_PERSONAL);
  const giftsExcess = Math.max(0, gifts - DUTY_FREE_GIFTS);
  const electronicsDuty = electronics * DUTY_RATE;
  const totalDuty = electronicsDuty + personalExcess * DUTY_RATE + giftsExcess * DUTY_RATE;

  const currency = (n: number) => `${n.toLocaleString("fr-FR")} MAD`;

  return (
    <section className={`${cardBase} ${creamBg} border-[#0d3f38]/10`}>
      <div className="flex items-center gap-2">
        <Calculator className="text-[#0d3f38]" size={22} />
        <h2 className="font-display text-lg font-semibold text-[#0d3f38]">Calculateur douane</h2>
      </div>
      <p className="mt-1 text-sm text-[#0d3f38]/70">
        Estimez les droits de douane à l'entrée au Maroc.
      </p>

      {/* Inputs */}
      <div className="mt-4 space-y-3">
        <div>
          <label className="text-xs font-semibold text-[#0d3f38]/70">
            Électronique (valeur en MAD)
          </label>
          <input
            type="number"
            value={electronics || ""}
            onChange={(e) => setElectronics(Math.max(0, Number(e.target.value)))}
            placeholder="0"
            className="mt-1 w-full rounded-xl border border-[#0d3f38]/15 bg-white p-3 text-sm font-bold text-[#0d3f38] outline-none transition focus:border-[#eead59]"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-[#0d3f38]/70">
            Cadeaux (valeur en MAD)
          </label>
          <input
            type="number"
            value={gifts || ""}
            onChange={(e) => setGifts(Math.max(0, Number(e.target.value)))}
            placeholder="0"
            className="mt-1 w-full rounded-xl border border-[#0d3f38]/15 bg-white p-3 text-sm font-bold text-[#0d3f38] outline-none transition focus:border-[#eead59]"
          />
          <p className="mt-1 text-xs text-[#0d3f38]/70">
            Franchise: {currency(DUTY_FREE_GIFTS)}
          </p>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#0d3f38]/70">
            Effets personnels (valeur en MAD)
          </label>
          <input
            type="number"
            value={personal || ""}
            onChange={(e) => setPersonal(Math.max(0, Number(e.target.value)))}
            placeholder="0"
            className="mt-1 w-full rounded-xl border border-[#0d3f38]/15 bg-white p-3 text-sm font-bold text-[#0d3f38] outline-none transition focus:border-[#eead59]"
          />
          <p className="mt-1 text-xs text-[#0d3f38]/70">
            Franchise: {currency(DUTY_FREE_PERSONAL)}
          </p>
        </div>
      </div>

      {/* Results */}
      <div className="mt-4 rounded-xl bg-gradient-to-br from-[#0d3f38] to-[#0d3f38]/90 p-4 text-[#f8f7f2]">
        <p className="text-xs uppercase tracking-wide text-[#eead59]">Droits estimés</p>
        <p className="mt-1 text-3xl font-black text-[#eead59]">
          {currency(Math.round(totalDuty))}
        </p>
        <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-xs">
          {electronics > 0 && (
            <div className="flex justify-between">
              <span className="text-[#f8f7f2]/70">Électronique (20%)</span>
              <span>{currency(Math.round(electronicsDuty))}</span>
            </div>
          )}
          {personalExcess > 0 && (
            <div className="flex justify-between">
              <span className="text-[#f8f7f2]/70">Personnel (excédent 20%)</span>
              <span>{currency(Math.round(personalExcess * DUTY_RATE))}</span>
            </div>
          )}
          {giftsExcess > 0 && (
            <div className="flex justify-between">
              <span className="text-[#f8f7f2]/70">Cadeaux (excédent 20%)</span>
              <span>{currency(Math.round(giftsExcess * DUTY_RATE))}</span>
            </div>
          )}
          {totalDuty === 0 && (
            <p className="text-center text-[#eead59]">✓ Aucun droit à payer</p>
          )}
        </div>
      </div>

      {/* Restricted items */}
      <div className="mt-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          <h3 className="text-sm font-bold text-[#0d3f38]">Articles restreints</h3>
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {RESTRICTED_ITEMS.map((item) => (
            <span
              key={item.name}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                item.level === "danger"
                  ? "bg-red-100 text-red-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {item.level === "danger" ? "🚫" : "⚠️"} {item.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   4. EmergencyContacts — SOS embassy & emergency widget
   ============================================================ */
const EMERGENCY_NUMBERS = [
  { label: "Police", number: "190", emoji: "🚓" },
  { label: "Ambulance", number: "150", emoji: "🚑" },
  { label: "Pompiers", number: "150", emoji: "🚒" },
  { label: "Autoroute (assistance)", number: "177", emoji: "🛣️" },
  { label: "Garde Royale", number: "177", emoji: "👑" },
  { label: "SOS Maroc", number: "112", emoji: "📱" },
];

const EMBASSIES = [
  {
    name: "Ambassade de France",
    city: "Rabat",
    address: "3 Rue Général Beaudot, Rabat",
    phone: "+212537683200",
    hours: "Lun–Ven 8h30–12h30",
  },
  {
    name: "Consulat Général de France",
    city: "Casablanca",
    address: "31 Rue d'Ankara, Casablanca",
    phone: "+212522489500",
    hours: "Lun–Ven 8h–12h",
  },
  {
    name: "Ambassade de France",
    city: "Tanger",
    address: "Rue du Général Khenoussi, Tanger",
    phone: "+212539321000",
    hours: "Lun–Ven 9h–12h",
  },
  {
    name: "Ambassade de Belgique",
    city: "Rabat",
    address: "16 Rue du Mérou, Rabat",
    phone: "+212537654800",
    hours: "Lun–Ven 9h–13h",
  },
];

const CONSULATES = [
  {
    name: "Consulat de France — Casablanca",
    phone: "+212522489500",
    address: "31 Rue d'Ankara, Casablanca",
  },
  {
    name: "Consulat de France — Fès",
    phone: "+212535932300",
    address: "7 Rue de Belgique, Fès",
  },
  {
    name: "Consulat de France — Marrakech",
    phone: "+212524434700",
    address: "Quartier Gueliz, Marrakech",
  },
  {
    name: "Consulat de France — Tanger",
    phone: "+212539321000",
    address: "Rue du Général Khenoussi, Tanger",
  },
];

export function EmergencyContacts() {
  const [tab, setTab] = useState<"emergency" | "embassies" | "consulates">(
    "emergency"
  );

  return (
    <section className={`${cardBase} ${creamBg} border-[#0d3f38]/10`}>
      <div className="flex items-center gap-2">
        <Phone className="text-red-500" size={22} />
        <h2 className="font-display text-lg font-semibold text-[#0d3f38]">Contacts d'urgence</h2>
      </div>
      <p className="mt-1 text-sm text-[#0d3f38]/70">
        Numéros utiles au Maroc — appelez en un tap.
      </p>

      {/* Tabs */}
      <div className="mt-4 flex gap-2">
        {[
          { key: "emergency", label: "🚨 Urgence", color: "bg-red-600 text-white" },
          { key: "embassies", label: "🏛️ Ambassades", color: greenBg },
          { key: "consulates", label: "📋 Consulates", color: greenBg },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all duration-200 ${
              tab === t.key
                ? t.color
                : "bg-white text-[#0d3f38]/70 hover:bg-[#0d3f38]/5"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Emergency numbers */}
      {tab === "emergency" && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {EMERGENCY_NUMBERS.map((item) => (
            <a
              key={`${item.label}-${item.number}`}
              href={`tel:${item.number}`}
              className="flex flex-col items-center rounded-xl border-2 border-red-200 bg-white p-3 transition-all duration-200 hover:border-red-500 hover:shadow-md"
            >
              <span className="text-2xl">{item.emoji}</span>
              <span className="mt-1 text-xs font-semibold text-[#0d3f38]">
                {item.label}
              </span>
              <span className="text-lg font-black text-red-500">{item.number}</span>
            </a>
          ))}
        </div>
      )}

      {/* Embassies */}
      {tab === "embassies" && (
        <div className="mt-4 space-y-2">
          {EMBASSIES.map((emb) => (
            <div
              key={emb.name}
              className="rounded-xl border border-[#eead59]/30 bg-white p-3 transition-all duration-200 hover:border-[#eead59] hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#0d3f38]">{emb.name}</h3>
                  <p className="text-xs text-[#0d3f38]/70">{emb.city}</p>
                  <p className="mt-1 text-xs text-[#0d3f38]/70">{emb.address}</p>
                  <p className="text-xs text-[#0d3f38]/70">🕒 {emb.hours}</p>
                </div>
                <a
                  href={`tel:${emb.phone}`}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#eead59] text-[#0d3f38] transition hover:bg-[#0d3f38] hover:text-[#eead59]"
                  aria-label="Appeler"
                >
                  <Phone size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consulates */}
      {tab === "consulates" && (
        <div className="mt-4 space-y-2">
          {CONSULATES.map((con) => (
            <div
              key={con.name}
              className="rounded-xl border border-[#0d3f38]/10 bg-white p-3 transition-all duration-200 hover:border-[#eead59] hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#0d3f38]">{con.name}</h3>
                  <p className="mt-1 text-xs text-[#0d3f38]/70">{con.address}</p>
                </div>
                <a
                  href={`tel:${con.phone}`}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[#eead59] text-[#0d3f38] transition hover:bg-[#0d3f38] hover:text-[#eead59]"
                  aria-label="Appeler"
                >
                  <Phone size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ============================================================
   5. MoroccanCalendar — Islamic & Moroccan holidays with countdown
   ============================================================ */
type HolidayEvent = {
  name: string;
  emoji: string;
  date: string; // ISO date
  type: "islamic" | "national";
};

const HOLIDAYS_2026: HolidayEvent[] = [
  { name: "Jour de l'An Hégirien", emoji: "🌙", date: "2026-06-17", type: "islamic" },
  { name: "Al Mawlid Annabaoui", emoji: "🕌", date: "2026-08-25", type: "islamic" },
  { name: "Fête du Trône", emoji: "👑", date: "2026-07-30", type: "national" },
  { name: "Fête de la Jeunesse", emoji: "🎉", date: "2026-08-21", type: "national" },
  { name: "Fête de la Révolution du Roi et du Peuple", emoji: "✊", date: "2026-08-20", type: "national" },
  { name: "Green March Day", emoji: "🟢", date: "2026-11-06", type: "national" },
  { name: "Fête de l'Indépendance", emoji: "🇲🇦", date: "2026-11-18", type: "national" },
  { name: "Aïd al-Fitr", emoji: "🎉", date: "2026-03-20", type: "islamic" },
  { name: "Aïd al-Adha", emoji: "🐑", date: "2026-05-28", type: "islamic" },
  { name: "Début du Ramadan", emoji: "🌙", date: "2026-02-19", type: "islamic" },
];

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + "T00:00:00");
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function MoroccanCalendar() {
  const [, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const sortedHolidays = [...HOLIDAYS_2026].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const nextEvent = sortedHolidays.find((h) => daysUntil(h.date) >= 0);
  const upcoming = sortedHolidays.filter((h) => daysUntil(h.date) >= -1);

  return (
    <section className={`${cardBase} ${creamBg} border-[#0d3f38]/10`}>
      <div className="flex items-center gap-2">
        <Calendar className="text-[#0d3f38]" size={22} />
        <h2 className="font-display text-lg font-semibold text-[#0d3f38]">Calendrier marocain</h2>
      </div>
      <p className="mt-1 text-sm text-[#0d3f38]/70">
        Fêtes religieuses et nationales du Maroc
      </p>

      {/* Next event countdown */}
      {nextEvent && (
        <div className="mt-4 rounded-xl bg-gradient-to-br from-[#0d3f38] to-[#0d3f38]/90 p-4 text-center">
          <p className="text-xs uppercase tracking-wide text-[#eead59]">
            Prochain événement
          </p>
          <p className="mt-1 text-2xl">{nextEvent.emoji}</p>
          <p className="text-lg font-bold text-[#f8f7f2]">{nextEvent.name}</p>
          <p className="mt-2 text-4xl font-black text-[#eead59]">
            {daysUntil(nextEvent.date)}
          </p>
          <p className="text-xs text-[#f8f7f2]/70">
            {daysUntil(nextEvent.date) === 0
              ? "C'est aujourd'hui!"
              : `jour${daysUntil(nextEvent.date) > 1 ? "s" : ""} restant${
                  daysUntil(nextEvent.date) > 1 ? "s" : ""
                }`}
          </p>
        </div>
      )}

      {/* Holiday list */}
      <div className="mt-4 space-y-2">
        {upcoming.map((holiday) => {
          const days = daysUntil(holiday.date);
          const isNext = nextEvent && nextEvent.date === holiday.date;
          const eventDate = new Date(holiday.date + "T00:00:00");
          return (
            <div
              key={holiday.name}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all duration-200 ${
                isNext
                  ? "border-[#eead59] bg-[#eead59]/10"
                  : "border-[#0d3f38]/10 bg-white hover:shadow-sm"
              }`}
            >
              <span className="text-2xl">{holiday.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-[#0d3f38]">{holiday.name}</p>
                <p className="text-xs text-[#0d3f38]/70">
                  {eventDate.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-bold ${
                  holiday.type === "islamic"
                    ? "bg-[#0d3f38]/10 text-[#0d3f38]"
                    : "bg-[#eead59]/20 text-[#0d3f38]"
                }`}
              >
                {days >= 0 ? `J-${days}` : "Passé"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================
   6. ZakaatCalculator — Travel zakaat calculator
   ============================================================ */
const EUR_TO_MAD = 10.8;
const NISAB_USD = 5000;
const USD_TO_MAD = 10.0;

export function ZakaatCalculator() {
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState<"EUR" | "MAD">("EUR");

  const amountMAD =
    currency === "EUR" ? amount * EUR_TO_MAD : amount;
  const nisabMAD = NISAB_USD * USD_TO_MAD;
  const zakaat = amountMAD * 0.025;
  const aboveNisab = amountMAD >= nisabMAD;

  const fmt = (n: number) =>
    n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });

  return (
    <section className={`${cardBase} ${creamBg} border-[#0d3f38]/10`}>
      <div className="flex items-center gap-2">
        <Star className="text-[#eead59]" size={22} />
        <h2 className="font-display text-lg font-semibold text-[#0d3f38]">Calculateur de Zakat</h2>
      </div>
      <p className="mt-1 text-sm text-[#0d3f38]/70">
        Calculez votre zakat — 2.5% du capital / زكاة
      </p>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <div className="flex-1">
          <label className="text-xs font-semibold text-[#0d3f38]/70">
            Épargne / Capital
          </label>
          <input
            type="number"
            value={amount || ""}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            placeholder="0"
            className="mt-1 w-full rounded-xl border border-[#0d3f38]/15 bg-white p-3 text-sm font-bold text-[#0d3f38] outline-none transition focus:border-[#eead59]"
          />
        </div>
        <div className="w-24">
          <label className="text-xs font-semibold text-[#0d3f38]/70">
            Devise
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as "EUR" | "MAD")}
            className="mt-1 w-full rounded-xl border border-[#0d3f38]/15 bg-white p-3 text-sm font-bold text-[#0d3f38] outline-none"
          >
            <option value="EUR">EUR</option>
            <option value="MAD">MAD</option>
          </select>
        </div>
      </div>

      {/* Nisab status */}
      <div
        className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-sm font-semibold ${
          aboveNisab
            ? "bg-[#eead59]/10 text-[#0d3f38]"
            : "bg-[#0d3f38]/5 text-[#0d3f38]/70"
        }`}
      >
        {aboveNisab ? (
          <Check size={18} className="text-[#eead59]" />
        ) : (
          <X size={18} className="text-[#0d3f38]/70" />
        )}
        {aboveNisab
          ? `Au-dessus du nisab (${fmt(nisabMAD)} MAD)`
          : `Sous le nisab (${fmt(nisabMAD)} MAD) — Zakat non obligatoire`}
      </div>

      {/* Result */}
      <div className="mt-3 rounded-xl bg-gradient-to-br from-[#eead59] to-[#eead59]/90 p-5 text-center">
        <p className="text-xs uppercase tracking-wide text-[#0d3f38]/70">
          Zakat à payer (2.5%)
        </p>
        <p className="mt-1 text-3xl font-black text-[#0d3f38]">
          {fmt(Math.round(zakaat * 100) / 100)}
        </p>
        <p className="text-sm font-bold text-[#0d3f38]/70">MAD</p>
        {currency === "EUR" && amount > 0 && (
          <p className="mt-2 text-xs text-[#0d3f38]/70">
            ≈ {fmt(Math.round((zakaat / EUR_TO_MAD) * 100) / 100)} EUR
          </p>
        )}
      </div>

      <p className="mt-3 text-xs text-[#0d3f38]/70">
        Le nisab correspond à l'équivalent de 85g d'or (≈ {fmt(nisabMAD)} MAD).
        La zakat est obligatoire si votre capital dépasse ce seuil pendant une
        année lunaire.
      </p>
    </section>
  );
}

/* ============================================================
   7. TimeZoneSIM — Time zone + SIM comparator
   ============================================================ */
const SIM_CARDS = [
  {
    name: "Maroc Telecom",
    emoji: "📞",
    color: "bg-blue-500",
    price: "50 MAD",
    priceEur: "≈ 4.60€",
    data: "10 Go",
    voice: "1h",
    valid: "30 jours",
    pros: ["Meilleure couverture rurale", "Réseau le plus étendu"],
    cons: ["Plus cher en data"],
  },
  {
    name: "Orange Maroc",
    emoji: "🟠",
    color: "bg-orange-500",
    price: "30 MAD",
    priceEur: "≈ 2.80€",
    data: "5 Go",
    voice: "30 min",
    valid: "30 jours",
    pros: ["Bon rapport qualité-prix", "Bonne couverture villes"],
    cons: ["Couverture rurale limitée"],
  },
  {
    name: "INWI",
    emoji: "🟣",
    color: "bg-purple-500",
    price: "20 MAD",
    priceEur: "≈ 1.85€",
    data: "3 Go",
    voice: "Illimitées INWI",
    valid: "7 jours",
    pros: ["Le moins cher", "Appels illimités INWI→INWI"],
    cons: ["Data limitée", "Couverture moyenne"],
  },
];

const ROAMING_COSTS = {
  dataPerMb: 0.012, // EUR per MB
  callPerMin: 1.5, // EUR per min
  sms: 0.3, // EUR per SMS
};

export function TimeZoneSIM() {
  const [frTime, setFrTime] = useState("");
  const [maTime, setMaTime] = useState("");

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      const fr = now.toLocaleTimeString("fr-FR", {
        timeZone: "Europe/Paris",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      const ma = now.toLocaleTimeString("fr-FR", {
        timeZone: "Africa/Casablanca",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setFrTime(fr);
      setMaTime(ma);
    }
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={`${cardBase} ${creamBg} border-[#0d3f38]/10`}>
      <div className="flex items-center gap-2">
        <Clock className="text-[#0d3f38]" size={22} />
        <h2 className="font-display text-lg font-semibold text-[#0d3f38]">Fuseau horaire & SIM</h2>
      </div>
      <p className="mt-1 text-sm text-[#0d3f38]/70">
        Comparez les horaires et les cartes SIM marocaines
      </p>

      {/* Time zones */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[#0d3f38]/10 bg-white p-4 text-center">
          <p className="text-2xl">🇫🇷</p>
          <p className="mt-1 text-xs font-semibold text-[#0d3f38]/70">
            France (UTC+1)
          </p>
          <p className="mt-1 text-xl font-black text-[#0d3f38]">{frTime}</p>
        </div>
        <div className="rounded-xl border border-[#0d3f38]/10 bg-white p-4 text-center">
          <p className="text-2xl">🇲🇦</p>
          <p className="mt-1 text-xs font-semibold text-[#0d3f38]/70">
            Maroc (UTC+1)
          </p>
          <p className="mt-1 text-xl font-black text-[#0d3f38]">{maTime}</p>
        </div>
      </div>

      {/* SIM cards */}
      <h3 className="mt-5 text-sm font-bold text-[#0d3f38]">
        Cartes SIM locales
      </h3>
      <div className="mt-2 space-y-2">
        {SIM_CARDS.map((sim) => (
          <div
            key={sim.name}
            className="rounded-xl border border-[#0d3f38]/10 bg-white p-3 transition-all duration-200 hover:border-[#eead59] hover:shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{sim.emoji}</span>
                <span className="text-sm font-bold text-[#0d3f38]">
                  {sim.name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-[#0d3f38]">
                  {sim.price}
                </span>
                <span className="ml-1 text-xs text-[#0d3f38]/70">
                  {sim.priceEur}
                </span>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-lg bg-[#0d3f38]/5 px-2 py-1 text-xs font-semibold text-[#0d3f38]">
                📶 {sim.data}
              </span>
              <span className="rounded-lg bg-[#0d3f38]/5 px-2 py-1 text-xs font-semibold text-[#0d3f38]">
                📞 {sim.voice}
              </span>
              <span className="rounded-lg bg-[#0d3f38]/5 px-2 py-1 text-xs font-semibold text-[#0d3f38]">
                ⏳ {sim.valid}
              </span>
            </div>
            <div className="mt-2 flex gap-3 text-xs">
              <div className="flex-1">
                <p className="text-[#0d3f38]/70">Avantages:</p>
                {sim.pros.map((p) => (
                  <p key={p} className="flex items-center gap-1 text-emerald-700">
                    <Check size={12} /> {p}
                  </p>
                ))}
              </div>
              <div className="flex-1">
                <p className="text-[#0d3f38]/70">Inconvénients:</p>
                {sim.cons.map((c) => (
                  <p key={c} className="flex items-center gap-1 text-red-700">
                    <X size={12} /> {c}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Roaming comparison */}
      <div className="mt-4 rounded-xl bg-red-50 p-4">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          <h3 className="text-sm font-bold text-red-700">
            Coût du roaming (opérateur FR)
          </h3>
        </div>
        <div className="mt-2 space-y-1 text-xs text-red-700/80">
          <p>📱 Data: {ROAMING_COSTS.dataPerMb}€/Mo (100 Mo = {ROAMING_COSTS.dataPerMb * 100}€)</p>
          <p>📞 Appels: {ROAMING_COSTS.callPerMin}€/min</p>
          <p>💬 SMS: {ROAMING_COSTS.sms}€/SMS</p>
        </div>
        <div className="mt-2 rounded-lg bg-red-100 p-2 text-center text-xs font-bold text-red-700">
          Une SIM locale (20 MAD ≈ 1.85€) équivaut à seulement ~150 Mo en roaming!
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   8. FuelPriceComparator — Fuel prices FR/ES/MA
   ============================================================ */
type FuelData = {
  country: string;
  flag: string;
  currency: string;
  fuels: { name: string; price: number; unit: string }[];
};

const FUEL_DATA: FuelData[] = [
  {
    country: "France",
    flag: "🇫🇷",
    currency: "€",
    fuels: [
      { name: "Diesel (Gasoil)", price: 1.89, unit: "€/L" },
      { name: "SP95", price: 1.78, unit: "€/L" },
      { name: "SP98", price: 1.85, unit: "€/L" },
    ],
  },
  {
    country: "Espagne",
    flag: "🇪🇸",
    currency: "€",
    fuels: [
      { name: "Diesel (Gasoil)", price: 1.52, unit: "€/L" },
      { name: "SP95", price: 1.65, unit: "€/L" },
    ],
  },
  {
    country: "Maroc",
    flag: "🇲🇦",
    currency: "MAD",
    fuels: [
      { name: "Diesel (Gasoil)", price: 14.95, unit: "MAD/L" },
      { name: "SP95", price: 15.3, unit: "MAD/L" },
    ],
  },
];

const EUR_TO_MAD_RATE = 10.8;

export function FuelPriceComparator() {
  const tankSize = 50; // liters
  const franceDieselEUR = 1.89;
  const moroccoDieselMAD = 14.95;
  const moroccoDieselEUR = moroccoDieselMAD / EUR_TO_MAD_RATE;
  const franceTotal = franceDieselEUR * tankSize;
  const moroccoTotal = moroccoDieselEUR * tankSize;
  const savings = franceTotal - moroccoTotal;
  const savingsPct = ((savings / franceTotal) * 100).toFixed(0);

  return (
    <section className={`${cardBase} ${creamBg} border-[#0d3f38]/10`}>
      <div className="flex items-center gap-2">
        <Fuel className="text-[#0d3f38]" size={22} />
        <h2 className="font-display text-lg font-semibold text-[#0d3f38]">Prix du carburant</h2>
      </div>
      <p className="mt-1 text-sm text-[#0d3f38]/70">
        Comparaison FR / ES / MA — prix approximatifs 2026
      </p>

      {/* Comparison table */}
      <div className="mt-4 space-y-2">
        {FUEL_DATA.map((country) => (
          <div
            key={country.country}
            className="rounded-xl border border-[#0d3f38]/10 bg-white p-3 transition-all duration-200 hover:border-[#eead59]"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{country.flag}</span>
              <h3 className="text-sm font-bold text-[#0d3f38]">{country.country}</h3>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {country.fuels.map((fuel) => (
                <div
                  key={fuel.name}
                  className="rounded-lg bg-[#0d3f38]/5 p-2 text-center"
                >
                  <p className="text-xs text-[#0d3f38]/70">{fuel.name}</p>
                  <p className="text-base font-black text-[#0d3f38]">
                    {fuel.price}
                    <span className="text-xs"> {fuel.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Savings calculator */}
      <div className="mt-4 rounded-xl bg-gradient-to-br from-[#0d3f38] to-[#0d3f38]/90 p-4 text-center text-[#f8f7f2]">
        <p className="text-xs uppercase tracking-wide text-[#eead59]">
          Économie réservoir plein (50L Diesel)
        </p>
        <div className="mt-2 flex items-center justify-center gap-4">
          <div>
            <p className="text-xs text-[#f8f7f2]/60">🇫🇷 France</p>
            <p className="text-lg font-bold">{franceTotal.toFixed(2)}€</p>
          </div>
          <span className="text-2xl text-[#eead59]">→</span>
          <div>
            <p className="text-xs text-[#f8f7f2]/60">🇲🇦 Maroc</p>
            <p className="text-lg font-bold">{moroccoTotal.toFixed(2)}€</p>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-[#eead59] p-3">
          <p className="text-2xl font-black text-[#0d3f38]">
            Économie: {savings.toFixed(2)}€
          </p>
          <p className="text-sm font-bold text-[#0d3f38]/70">
            Soit {savingsPct}% moins cher au Maroc!
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs text-[#0d3f38]/70">
        Prix indicatifs 2026 — susceptibles de varier. Le carburant marocain
        reste subventionné par l'État.
      </p>
    </section>
  );
}

/* ============================================================
   Default export — renders all 8 widgets in a responsive grid
   ============================================================ */
export default function TravelWidgets() {
  const widgets = [
    { component: <WeatherMorocco />, key: "weather" },
    { component: <DarijaPhrasebook />, key: "darija" },
    { component: <CustomsCalculator />, key: "customs" },
    { component: <EmergencyContacts />, key: "emergency" },
    { component: <MoroccanCalendar />, key: "calendar" },
    { component: <ZakaatCalculator />, key: "zakaat" },
    { component: <TimeZoneSIM />, key: "timezone" },
    { component: <FuelPriceComparator />, key: "fuel" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {widgets.map(({ component, key }) => (
        <div key={key} className="transition-all duration-300 hover:scale-[1.01]">
          {component}
        </div>
      ))}
    </div>
  );
}
