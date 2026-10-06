"use client";

import { useState, useMemo, useEffect } from "react";
import { ArrowRightLeft } from "lucide-react";

// Fixed rates, used only when the live source cannot be reached (and then said so).
// They were 3 to 9 % off the market on 3 Oct 2026 (MAD 10.8 vs 11.18, CAD 1.47 vs 1.60).
const FIXED_RATES: Record<string, number> = {
  EUR: 1,
  MAD: 10.8,
  USD: 1.08,
  GBP: 0.85,
  CHF: 0.95,
  CAD: 1.47,
  SEK: 11.5,
  DKK: 7.5,
  NOK: 11.8,
};

const currencies = [
  { code: "EUR", flag: "🇪🇺", name: "Euro" },
  { code: "MAD", flag: "🇲🇦", name: "Dirham marocain" },
  { code: "USD", flag: "🇺🇸", name: "Dollar américain" },
  { code: "GBP", flag: "🇬🇧", name: "Livre sterling" },
  { code: "CHF", flag: "🇨🇭", name: "Franc suisse" },
  { code: "CAD", flag: "🇨🇦", name: "Dollar canadien" },
  { code: "SEK", flag: "🇸🇪", name: "Couronne suédoise" },
  { code: "DKK", flag: "🇩🇰", name: "Couronne danoise" },
  { code: "NOK", flag: "🇳🇴", name: "Couronne norvégienne" },
];

const quickAmounts = [50, 100, 200, 500, 1000];

// Same free, keyless source as the remittance comparator (app/api/remittance), so one
// page never shows two different EUR→MAD rates.
export const RATES_URL = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/eur.json";

type LiveRates = { date: string; rates: Record<string, number> };

/** Live rates for every listed currency, or null if one is missing: never a partial mix. */
export function parseLiveRates(data: unknown): LiveRates | null {
  const body = data as { date?: unknown; eur?: Record<string, unknown> };
  if (typeof body?.date !== "string" || !body.eur) return null;
  const rates: Record<string, number> = { EUR: 1 };
  for (const { code } of currencies) {
    if (code === "EUR") continue;
    const value = body.eur[code.toLowerCase()];
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
    rates[code] = value;
  }
  return { date: body.date, rates };
}

function frenchDate(isoDate: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${isoDate}T00:00:00Z`));
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("MAD");
  const [live, setLive] = useState<LiveRates | null>(null);
  const [liveFailed, setLiveFailed] = useState(false);

  useEffect(() => {
    if (typeof fetch !== "function") {
      setLiveFailed(true);
      return;
    }
    const controller = new AbortController();
    fetch(RATES_URL, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("rates"))))
      .then((data) => {
        const parsed = parseLiveRates(data);
        if (parsed) setLive(parsed);
        else setLiveFailed(true);
      })
      .catch((error: Error) => {
        if (error.name !== "AbortError") setLiveFailed(true);
      });
    return () => controller.abort();
  }, []);

  const rates = live?.rates ?? FIXED_RATES;

  const result = useMemo(() => {
    const eurAmount = amount / rates[from];
    return eurAmount * rates[to];
  }, [amount, from, to, rates]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  return (
    <section className="rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">💱 Convertisseur de devises</h2>
      <p className="mt-1 text-sm text-slate-500">
        Calculez votre budget en dirhams et dans votre monnaie locale.
      </p>

      <div className="mt-4 flex items-end gap-2">
        <div className="flex-1">
          <label htmlFor="cc-1" className="text-xs font-semibold text-slate-500">Montant</label>
          <input
            id="cc-1"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            className="mt-1 w-full rounded-xl border p-3 text-lg font-bold"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="cc-2" className="text-xs font-semibold text-slate-500">De</label>
          <select
            id="cc-2"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 w-full rounded-xl border bg-white p-3 text-sm font-bold"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={swap}
          className="mb-1 grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-700 text-white transition hover:bg-emerald-800"
          aria-label="Inverser"
        >
          <ArrowRightLeft size={18} />
        </button>
        <div className="flex-1">
          <label htmlFor="cc-3" className="text-xs font-semibold text-slate-500">Vers</label>
          <select
            id="cc-3"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 w-full rounded-xl border bg-white p-3 text-sm font-bold"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.code}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quick amounts */}
      <div className="mt-3 flex flex-wrap gap-2">
        {quickAmounts.map((a) => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              amount === a
                ? "bg-emerald-700 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {a} {from}
          </button>
        ))}
      </div>

      {/* Result */}
      <div className="mt-4 rounded-xl bg-gradient-to-br from-emerald-50 to-amber-50 p-5 text-center">
        <div className="text-3xl font-black text-emerald-700">
          {result.toLocaleString("fr-FR", { maximumFractionDigits: 2 })}{" "}
          <span className="text-lg">{to}</span>
        </div>
        <div className="mt-1 text-sm text-slate-500">
          {amount} {from} = {result.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} {to}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500" data-rates={live ? "live" : liveFailed ? "fixed" : "loading"}>
        {live
          ? `Taux de marché du ${frenchDate(live.date)} (source publique fawazahmed0/currency-api), hors frais : votre banque ou votre service de transfert appliquera sa propre marge.`
          : liveFailed
            ? "Taux fixes, non à jour : la source en ligne ne répond pas. Ne vous en servez pas pour décider d'un envoi."
            : "Chargement du taux du jour…"}
      </p>
    </section>
  );
}
