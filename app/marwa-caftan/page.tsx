'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, ShoppingBag, Package, Shield, Truck, MessageCircle,
  Star, ChevronRight, ArrowLeft, Heart, Tag, Calendar,
} from 'lucide-react';
import { MARWA_WHATSAPP, whatsappLink } from '@/lib/partners';
import { CAFTANS, OCCASIONS, CONDITIONS, type Caftan, type Mode } from '@/lib/caftans';
import CaftanVisual, { isIllustration } from '@/components/caftan/CaftanVisual';
import CaftanMarketplace from '@/components/caftan/CaftanMarketplace';

type AgentStep = 'occasion' | 'budget' | 'taille' | 'result';

function AgentChat({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<AgentStep>('occasion');
  const [occasion, setOccasion] = useState('');
  const [budget, setBudget] = useState('');
  const [taille, setTaille] = useState('');

  const recommend = CAFTANS.filter(c => {
    const okOcc  = !occasion || c.occasion.includes(occasion);
    const okBudg = !budget   || c.prixLocation <= parseInt(budget);
    const okTail = !taille   || c.tailles.includes(taille);
    return okOcc && okBudg && okTail && c.dispo;
  }).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-[#0f1f3d] border border-[#c9903a]/30 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between bg-[#c9903a] px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#0f1f3d]" />
            <span className="font-black text-[#0f1f3d] text-sm">Marwa vous conseille</span>
          </div>
          <button onClick={onClose} className="text-[#0f1f3d]/60 hover:text-[#0f1f3d] text-xl font-black">×</button>
        </div>

        <div className="p-5 space-y-4">
          {step === 'occasion' && (
            <>
              <p className="text-white text-sm">Pour quelle occasion cherchez-vous votre caftan ?</p>
              <div className="flex flex-wrap gap-2">
                {['Mariage', 'Fiançailles', 'Soirée', 'Baptême', 'Autre'].map(o => (
                  <button key={o} onClick={() => { setOccasion(o === 'Autre' ? '' : o); setStep('budget'); }}
                    className="rounded-full border border-[#c9903a]/40 bg-[#c9903a]/10 px-4 py-2 text-sm font-semibold text-[#fde68a] hover:bg-[#c9903a]/20 transition">
                    {o}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 'budget' && (
            <>
              <p className="text-white text-sm">Quel est votre budget location (par semaine) ?</p>
              <div className="flex flex-wrap gap-2">
                {[120, 150, 180, 220].map(b => (
                  <button key={b} onClick={() => { setBudget(String(b)); setStep('taille'); }}
                    className="rounded-full border border-[#c9903a]/40 bg-[#c9903a]/10 px-4 py-2 text-sm font-semibold text-[#fde68a] hover:bg-[#c9903a]/20 transition">
                    jusqu'à {b}€
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 'taille' && (
            <>
              <p className="text-white text-sm">Quelle taille ?</p>
              <div className="flex flex-wrap gap-2">
                {['XS','S','M','L','XL'].map(t => (
                  <button key={t} onClick={() => { setTaille(t); setStep('result'); }}
                    className="rounded-full border border-[#c9903a]/40 bg-[#c9903a]/10 px-4 py-2 text-sm font-bold text-[#fde68a] hover:bg-[#c9903a]/20 transition">
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 'result' && (
            <>
              <p className="text-white text-sm font-semibold">
                {recommend.length ? `✨ ${recommend.length} caftan${recommend.length > 1 ? 's' : ''} parfait${recommend.length > 1 ? 's' : ''} pour vous :` : 'Aucun caftan disponible pour ces critères — élargissez votre recherche.'}
              </p>
              <div className="space-y-2">
                {recommend.map(c => (
                  <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                      <CaftanVisual caftan={c} view="face" variant="thumb" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm">Caftan {c.name}</p>
                      <p className="text-xs text-white/60">{c.style} · {c.prixLocation}€/sem</p>
                    </div>
                    <a href={whatsappLink(MARWA_WHATSAPP, `Bonjour Marwa, je suis intéressée par le Caftan ${c.name}`)}
                      target="_blank" rel="noopener noreferrer"
                      className="shrink-0 rounded-full bg-[#25d366] px-3 py-1.5 text-[11px] font-black text-white">
                      Réserver
                    </a>
                  </div>
                ))}
              </div>
              <button onClick={() => { setStep('occasion'); setOccasion(''); setBudget(''); setTaille(''); }}
                className="w-full rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-white/60 hover:text-white transition">
                Recommencer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CaftanCard({ c, mode }: { c: Caftan; mode: Mode }) {
  const [liked, setLiked] = useState(false);
  const whatsapp = whatsappLink(
    MARWA_WHATSAPP,
    `Bonjour Marwa, je suis intéressée par le Caftan ${c.name} (${mode === 'location' ? 'location' : 'achat'})`,
  );
  const prix = mode === 'location' ? c.prixLocation : c.prixVente;
  const label = mode === 'location' ? '/sem' : '';

  return (
    <div className={`group relative rounded-3xl border overflow-hidden transition hover:-translate-y-1 hover:shadow-xl ${!c.dispo ? 'opacity-60' : 'border-[#e2d5c0]'}`}>
      {/* Visuel du modèle */}
      <div className="relative h-72 overflow-hidden bg-[#f4ece0]">
        <CaftanVisual caftan={c} view="face" variant="card" />

        <Link
          href={`/marwa-caftan/${c.id}`}
          aria-label={`Voir le caftan ${c.name}`}
          className="absolute inset-0"
        />

        {!c.dispo && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded-full bg-black/60 px-4 py-2 text-xs font-black text-white">Indisponible</span>
          </div>
        )}

        <button onClick={() => setLiked(v => !v)}
          aria-label={liked ? `Retirer ${c.name} des favoris` : `Ajouter ${c.name} aux favoris`}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm transition hover:bg-black/45">
          <Heart size={14} fill={liked ? 'white' : 'none'} />
        </button>

        <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5">
          {c.stars === 5 && (
            <span className="rounded-full bg-[#c9903a] px-2.5 py-1 text-[10px] font-black text-[#0f1f3d]">⭐ Coup de cœur</span>
          )}
          {isIllustration(c) && (
            <span className="rounded-full bg-black/45 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/85 backdrop-blur-sm">
              Illustration
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-black text-[#0f1f3d]">Caftan {c.name}</h3>
            <p className="text-xs text-[#64748b] mt-0.5">{c.style}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-black text-[#c9903a] text-lg">{prix}€<span className="text-xs font-semibold text-[#94a3b8]">{label}</span></p>
            {mode === 'location' && <p className="text-[10px] text-[#94a3b8]">Caution {c.caution}€</p>}
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {c.occasion.map(o => (
            <span key={o} className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-semibold text-[#b45309]">{o}</span>
          ))}
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={10} fill={i < c.stars ? '#c9903a' : 'none'} className={i < c.stars ? 'text-[#c9903a]' : 'text-[#e2e8f0]'} />
            ))}
          </div>
          <span className="text-[10px] text-[#94a3b8]">({c.avis} avis)</span>
          <span className="ml-auto text-[10px] text-[#64748b]">{c.tailles.join(' · ')}</span>
        </div>

        {c.dispo && (
          <a href={whatsapp} target="_blank" rel="noopener noreferrer"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c9903a] py-2.5 text-sm font-extrabold text-white transition hover:bg-[#a8741e]">
            <MessageCircle size={14} />
            {mode === 'location' ? 'Louer ce caftan' : 'Acheter'}
          </a>
        )}
      </div>
    </div>
  );
}

export default function MarwaCaftan() {
  const [mode, setMode] = useState<Mode>('location');
  const [filter, setFilter] = useState('Toutes');
  const [agent, setAgent] = useState(false);

  const filtered = CAFTANS.filter(c =>
    filter === 'Toutes' || c.occasion.includes(filter)
  );

  return (
    <main className="min-h-screen bg-[#fdf8f2]">
      {agent && <AgentChat onClose={() => setAgent(false)} />}

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f1f3d]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M30 5 L55 30 L30 55 L5 30Z%22 fill=%22none%22 stroke=%22%23c9903a%22 stroke-width=%220.5%22 opacity=%220.15%22/%3E%3C/svg%3E')] opacity-40" />
        <div className="relative mx-auto max-w-5xl px-5 py-12 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white mb-6 transition">
            <ArrowLeft size={14} /> RME Voyage
          </Link>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="grid h-14 w-14 place-items-center rounded-3xl bg-[#c9903a] shadow-lg shadow-[#c9903a]/30">
                  <span className="text-2xl">👗</span>
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">Marwa Caftan</h1>
                  <p className="text-[#c9903a] font-semibold text-sm">Location · Vente · Livraison</p>
                </div>
              </div>
              <p className="text-white/70 max-w-md text-sm leading-6">
                La plus belle collection de caftans marocains authentiques — pour votre mariage, fiançailles ou soirée.
                Livraison partout en Europe, caution sécurisée, retour simple.
              </p>
            </div>
            <button onClick={() => setAgent(true)}
              className="flex shrink-0 items-center gap-2 rounded-2xl bg-[#c9903a] px-5 py-3.5 font-extrabold text-[#0f1f3d] shadow-lg transition hover:bg-[#fde68a]">
              <Sparkles size={16} />
              Me faire conseiller
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {[
              { v: '12', l: 'Modèles exclusifs' },
              { v: '48h', l: 'Livraison express' },
              { v: '100%', l: 'Authenticité garantie' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="text-2xl font-black text-[#c9903a]">{s.v}</div>
                <div className="text-xs text-white/50 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white border-b border-[#e2d5c0] py-8">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { icon: ShoppingBag, t: '1. Choisissez', d: 'Parcourez la collection, filtrez par occasion et taille' },
              { icon: Calendar,    t: '2. Réservez', d: 'Contactez Marwa via WhatsApp pour fixer vos dates' },
              { icon: Truck,       t: '3. Livraison', d: 'Votre caftan arrive chez vous en 48h · Caution sécurisée' },
              { icon: Package,     t: '4. Retour', d: 'Renvoyez après votre événement · Caution restituée' },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex flex-col items-center text-center gap-2">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#fef3c7]">
                  <Icon size={20} className="text-[#c9903a]" />
                </div>
                <p className="font-extrabold text-sm text-[#0f1f3d]">{t}</p>
                <p className="text-xs text-[#64748b] leading-5">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          {/* Mode toggle */}
          <div className="flex rounded-2xl border border-[#e2d5c0] overflow-hidden bg-white">
            {(['location', 'vente'] as Mode[]).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-5 py-2.5 text-sm font-bold transition ${mode === m ? 'bg-[#c9903a] text-white' : 'text-[#64748b] hover:text-[#0f1f3d]'}`}>
                {m === 'location' ? '📦 Location' : '🛍️ Achat'}
              </button>
            ))}
          </div>

          {/* Occasion filter */}
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map(o => (
              <button key={o} onClick={() => setFilter(o)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${filter === o ? 'bg-[#c9903a] text-white' : 'border border-[#e2d5c0] bg-white text-[#64748b] hover:border-[#c9903a]/50'}`}>
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(c => <CaftanCard key={c.id} c={c} mode={mode} />)}
        </div>
      </section>

      {/* Info caution */}
      <section className="mx-auto max-w-5xl px-5 pb-12 sm:px-8">
        <div className="rounded-3xl bg-[#0f1f3d] border border-[#c9903a]/20 p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#c9903a]">
              <Shield size={20} className="text-[#0f1f3d]" />
            </div>
            <div>
              <h2 className="font-black text-white mb-2">Caution & paiement sécurisés</h2>
              <ul className="space-y-1 text-sm text-white/70">
                {CONDITIONS.map(cond => (
                  <li key={cond} className="flex items-center gap-2">
                    <ChevronRight size={14} className="shrink-0 text-[#c9903a]" /> {cond}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <CaftanMarketplace />

      {/* Footer strip */}
      <div className="bg-[#0f1f3d] px-5 py-6 text-center text-xs text-white/40">
        Marwa Caftan — Partenaire exclusif <Link href="/" className="text-[#c9903a] hover:underline">RME Voyage</Link> · Contact WhatsApp disponible 7j/7
        <div className="mt-2 flex items-center justify-center gap-2">
          <Tag size={11} /> Collection mise à jour chaque saison
        </div>
      </div>
    </main>
  );
}
