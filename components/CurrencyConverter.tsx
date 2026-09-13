"use client";

import { useState, useMemo } from "react";
import { ArrowRightLeft } from "lucide-react";

const rates: Record<string, number> = {
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

export default function CurrencyConverter() {
  const [amount, setAmount] = useState(100);
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("MAD");

  const result = useMemo(() => {
    const eurAmount = amount / rates[from];
    return eurAmount * rates[to];
  }, [amount, from, to]);

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
          <label className="text-xs font-semibold text-slate-500">Montant</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
            className="mt-1 w-full rounded-xl border p-3 text-lg font-bold"
          />
        </div>
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-500">De</label>
          <select
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
          className="mb-1 grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white transition hover:bg-emerald-700"
          aria-label="Inverser"
        >
          <ArrowRightLeft size={18} />
        </button>
        <div className="flex-1">
          <label className="text-xs font-semibold text-slate-500">Vers</label>
          <select
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

      <p className="mt-3 text-xs text-slate-400">
        Taux indicatifs (mise à jour manuelle). Vérifiez auprès de votre banque pour le taux exact.
      </p>
    </section>
  );
}
