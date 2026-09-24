'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('Une erreur est survenue. Réessaie.');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setErrorMessage(body.error ?? 'Une erreur est survenue. Réessaie.');
        setStatus('error');
        return;
      }
      setStatus('success');
      setEmail('');
    } catch {
      setErrorMessage('Une erreur est survenue. Réessaie.');
      setStatus('error');
    }
  }

  return (
    <section className="bg-[#0f1f3d] py-16">
      <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
        <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#f5cd93]">Newsletter hebdo</p>
        <h2 className="mt-3 text-3xl font-display font-semibold text-white">
          Taux EUR→MAD + bons plans chaque lundi.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-base text-white/65">
          Meilleur taux de la semaine, offres ferry, nouvelles MRE. Zéro spam. Désabonnement en un clic.
        </p>

        {status === 'success' ? (
          <div className="mt-8 flex items-center justify-center gap-2 text-[#f5cd93]">
            <CheckCircle2 size={20} />
            <span className="font-bold">Inscrit ! À lundi 👋</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <input
              type="email"
              required
              placeholder="ton@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-full border border-white/20 bg-white/10 px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 sm:w-72"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="flex items-center justify-center gap-2 rounded-full bg-[#f59e0b] px-6 py-3 font-extrabold text-[#0f1f3d] transition hover:bg-[#f5cd93] disabled:opacity-60"
            >
              {status === 'loading' ? 'Inscription…' : <>S'inscrire <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="mt-3 text-sm text-red-300">{errorMessage}</p>
        )}
      </div>
    </section>
  );
}
