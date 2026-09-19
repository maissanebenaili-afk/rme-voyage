'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, TrendingDown, Clock, Banknote } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface Provider {
  id: string;
  name: string;
  fee: number;
  appliedRate: number;
  received: number;
  time: string;
  affiliateUrl: string | null;
}

interface RemittanceData {
  from: string;
  to: string;
  amount: number;
  midRate: number;
  providers: Provider[];
}

export default function RemittanceComparator() {
  const { t } = useLanguage();
  const [amount, setAmount] = useState(500);
  const [currency, setCurrency] = useState<'EUR' | 'GBP' | 'CHF'>('EUR');
  const [data, setData] = useState<RemittanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      setError(false);
      fetch(`/api/remittance?amount=${amount}&from=${currency}`)
        .then((r) => {
          if (!r.ok) throw new Error('fetch failed');
          return r.json() as Promise<RemittanceData>;
        })
        .then((d) => { setData(d); setLoading(false); })
        .catch(() => { setError(true); setLoading(false); });
    }, 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [amount, currency]);

  return (
    <section id="transfert" className="w-full max-w-3xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-[#0f1f3d] mb-1">{t('remittanceTitle')}</h2>

      {data && !loading && (
        <p className="text-sm text-[#0f1f3d]/60 mb-6">
          {t('remittanceMidRate')}: <span className="font-semibold">1 {currency} = {data.midRate.toFixed(4)} MAD</span>
        </p>
      )}

      {/* Amount input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#0f1f3d]/70 mb-1">
          {t('remittanceAmount')}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={100000}
            value={amount}
            onChange={(e) => setAmount(Math.max(1, Math.min(100000, Number(e.target.value))))}
            className="w-36 rounded-xl border border-[#0f1f3d]/20 bg-white px-4 py-2 text-lg font-semibold text-[#0f1f3d] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
          />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as 'EUR' | 'GBP' | 'CHF')}
            className="rounded-xl border border-[#0f1f3d]/20 bg-white px-3 py-2 text-sm font-semibold text-[#0f1f3d] focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50"
            aria-label="Devise d'envoi"
          >
            <option value="EUR">EUR 🇪🇺</option>
            <option value="GBP">GBP 🇬🇧</option>
            <option value="CHF">CHF 🇨🇭</option>
          </select>
          <span className="text-[#0f1f3d]/50 text-sm">→ MAD</span>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <p className="text-red-600 text-sm py-4">{t('remittanceError')}</p>
      )}

      {/* Loading skeleton */}
      {loading && !error && (
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-[#0f1f3d]/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Results table */}
      {!loading && !error && data && (
        <div className="space-y-3">
          {data.providers.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-4 rounded-xl border px-4 py-3 ${
                i === 0
                  ? 'border-[#d4af37] bg-[#d4af37]/8'
                  : 'border-[#0f1f3d]/10 bg-white'
              }`}
            >
              {/* Rank */}
              <span className="text-lg font-bold text-[#0f1f3d]/40 w-6 shrink-0">
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}
              </span>

              {/* Provider name + best badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#0f1f3d]">{p.name}</span>
                  {i === 0 && (
                    <span className="text-xs font-medium bg-[#d4af37] text-white rounded-full px-2 py-0.5">
                      {t('remittanceBest')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#0f1f3d]/50 mt-0.5">
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    {t('remittanceRate')}: {p.appliedRate.toFixed(4)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Banknote className="w-3 h-3" />
                    {t('remittanceFee')}: {p.fee.toFixed(2)}€
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {p.time}
                  </span>
                </div>
              </div>

              {/* MAD received */}
              <div className="text-right shrink-0">
                <div className="font-bold text-[#0f1f3d]">
                  {p.received.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} MAD
                </div>
                <div className="text-xs text-[#0f1f3d]/40">{t('remittanceReceived')}</div>
              </div>

              {/* CTA */}
              <a
                href={p.affiliateUrl || `https://www.google.com/search?q=${encodeURIComponent(p.name + ' transfert argent Maroc')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1 rounded-lg bg-[#0f1f3d] text-white text-sm font-medium px-3 py-2 hover:bg-[#0f1f3d]/80 transition-colors"
              >
                {t('remittanceSend')}
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
