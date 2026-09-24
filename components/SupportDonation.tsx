'use client';

import { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';

const PRESETS = [5, 10, 20, 50];

export default function SupportDonation() {
  const [selected, setSelected] = useState<number>(10);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = custom ? Number(custom) : selected;

  async function handleDonate() {
    setError(null);
    if (!Number.isFinite(amount) || amount < 1) {
      setError('Choisissez un montant d’au moins 1€.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/support/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountEur: amount }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.configured === false
          ? 'Le don en ligne n’est pas encore activé. Revenez bientôt.'
          : (data.error || 'Une erreur est survenue.'));
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Impossible de contacter le serveur. Réessayez.');
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-lg rounded-[2rem] border border-[#dbe4ef] bg-white p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f59e0b] text-[#0f1f3d]">
          <Heart size={20} />
        </span>
        <h1 className="text-2xl font-display font-semibold text-[#0f1f3d]">Soutenir RME Voyage</h1>
      </div>
      <p className="mt-4 text-sm leading-6 text-[#5a716c]">
        RME Voyage reste gratuit. Un don ponctuel, libre et sans contrepartie, nous aide à
        couvrir les frais d'hébergement et à continuer d'améliorer l'outil. Paiement sécurisé via Stripe.
      </p>

      <div className="mt-6 grid grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => { setSelected(p); setCustom(''); }}
            className={`rounded-xl border py-3 text-sm font-bold transition ${
              !custom && selected === p
                ? 'border-[#f59e0b] bg-[#f59e0b] text-[#0f1f3d]'
                : 'border-[#cbd5e1] text-[#0f1f3d] hover:bg-[#f8fafc]'
            }`}
          >
            {p}€
          </button>
        ))}
      </div>

      <label className="mt-4 block text-sm font-semibold text-[#334155]">
        Ou montant libre (€)
        <input
          type="number"
          min={1}
          max={1000}
          step={1}
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder="Ex. 15"
          className="mt-1 w-full rounded-xl border border-[#cbd5e1] px-3 py-2 text-[#0f1f3d] outline-none focus:ring-2 focus:ring-[#f59e0b]/40"
        />
      </label>

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

      <button
        type="button"
        onClick={handleDonate}
        disabled={loading}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#0f1f3d] py-3.5 font-extrabold text-white transition hover:bg-[#0f1f3d]/85 disabled:opacity-60"
      >
        {loading ? <Loader2 size={17} className="animate-spin" /> : <Heart size={17} />}
        {loading ? 'Redirection vers Stripe…' : `Donner ${amount || 0}€`}
      </button>
    </section>
  );
}
