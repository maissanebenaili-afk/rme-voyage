'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShoppingBag,
  Package,
  Shield,
  Truck,
  MessageCircle,
  Star,
  ChevronRight,
  ArrowLeft,
  Heart,
  Tag,
  Calendar,
} from 'lucide-react';
import { MARWA_WHATSAPP, whatsappLink } from '@/lib/partners';
import { CAFTANS, OCCASIONS, CONDITIONS, type Caftan, type Mode } from '@/lib/caftans';
import CaftanVisual, { isIllustration } from '@/components/caftan/CaftanVisual';
import CaftanMarketplace from '@/components/caftan/CaftanMarketplace';

type AgentStep = 'occasion' | 'budget' | 'taille' | 'result';

function AgentChat({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<AgentStep>('occasion');
  const [occasion, setOccasion] = useState('');
  const [taille, setTaille] = useState('');

  const recommend = CAFTANS.filter((c) => {
    const okOcc = !occasion || c.occasion.includes(occasion);
    const okTail = !taille || c.tailles.includes(taille);
    return okOcc && okTail;
  }).slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-3xl bg-[#0f1f3d] border border-[#c9903a]/30 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between bg-[#c9903a] px-5 py-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-[#0f1f3d]" />
            <span className="font-black text-[#0f1f3d] text-sm">Marwa vous conseille</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#0f1f3d]/60 hover:text-[#0f1f3d] text-xl font-black"
          >
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          {step === 'occasion' && (
            <>
              <p className="text-white text-sm">
                Pour quelle occasion cherchez-vous votre caftan ?
              </p>
              <div className="flex flex-wrap gap-2">
                {['Mariage', 'Fiançailles', 'Soirée', 'Baptême', 'Autre'].map((o) => (
                  <button
                    key={o}
                    onClick={() => {
                      setOccasion(o === 'Autre' ? '' : o);
                      setStep('taille');
                    }}
                    className="rounded-full border border-[#c9903a]/40 bg-[#c9903a]/10 px-4 py-2 text-sm font-semibold text-[#fde68a] hover:bg-[#c9903a]/20 transition"
                  >
                    {o}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 'taille' && (
            <>
              <p className="text-white text-sm">Quelle taille ?</p>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTaille(t);
                      setStep('result');
                    }}
                    className="rounded-full border border-[#c9903a]/40 bg-[#c9903a]/10 px-4 py-2 text-sm font-bold text-[#fde68a] hover:bg-[#c9903a]/20 transition"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 'result' && (
            <>
              <p className="text-white text-sm font-semibold">
                {recommend.length
                  ? `✨ ${recommend.length} caftan${recommend.length > 1 ? 's' : ''} parfait${recommend.length > 1 ? 's' : ''} pour vous :`
                  : 'Aucun caftan disponible pour ces critères — élargissez votre recherche.'}
              </p>
              <div className="space-y-2">
                {recommend.map(c => (
                  <div key={c.id} className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
                      <CaftanVisual caftan={c} view="face" variant="thumb" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm">Caftan {c.name}</p>
                      <p className="text-xs text-white/60">
                        {c.style} · tarif et disponibilité à confirmer
                      </p>
                    </div>
                    <a
                      href={whatsappLink(
                        MARWA_WHATSAPP,
                        `Bonjour Marwa, je suis intéressée par le Caftan ${c.name}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 rounded-full bg-[#25d366] px-3 py-1.5 text-[11px] font-black text-[#0f1f3d]"
                    >
                      Demander
                    </a>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setStep('occasion');
                  setOccasion('');
                  setTaille('');
                }}
                className="w-full rounded-2xl border border-white/10 py-2.5 text-sm font-semibold text-white/60 hover:text-white transition"
              >
                Recommencer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CaftanCard({ c }: { c: Caftan }) {
  const [liked, setLiked] = useState(false);
  const whatsapp = whatsappLink(
    MARWA_WHATSAPP,
    `Bonjour Marwa, je souhaite des informations sur le Caftan ${c.name}`
  );

  return (
    <div className={`group relative rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${!c.dispo ? 'opacity-60' : 'border-[#e2d5c0]'}`}>
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
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/50 hover:scale-110">
          <Heart size={14} fill={liked ? 'white' : 'none'} />
        </button>

        <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5">
          {c.coupDeCoeur && (
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
            <p className="text-sm font-bold text-[#64748b]">Tarif sur demande</p>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap gap-1">
          {c.occasion.map((o, idx) => (
            <span
              key={o}
              className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-semibold text-[#b45309] transition-all duration-200 hover:bg-[#fde68a] hover:scale-105 animate-in fade-in duration-300"
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {o}
            </span>
          ))}
        </div>

        <p className="mt-3 text-[11px] text-[#64748b]">
          Tarif, taille et disponibilité à confirmer avec Marwa.
        </p>

        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c9903a] py-2.5 text-sm font-extrabold text-[#0f1f3d] shadow-lg shadow-[#c9903a]/20 transition-all duration-300 hover:bg-[#a8741e] hover:shadow-xl hover:shadow-[#c9903a]/30 hover:scale-105"
        >
          <MessageCircle size={14} className="transition-transform group-hover:scale-110" />
          Demander des informations
        </a>
      </div>
    </div>
  );
}

export default function MarwaCaftan() {
  const [filter, setFilter] = useState('Toutes');
  const [agent, setAgent] = useState(false);

  const filtered = CAFTANS.filter((c) => filter === 'Toutes' || c.occasion.includes(filter));

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#fdf8f2]">
      {agent && <AgentChat onClose={() => setAgent(false)} />}

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f1f3d]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M30 5 L55 30 L30 55 L5 30Z%22 fill=%22none%22 stroke=%22%23c9903a%22 stroke-width=%220.5%22 opacity=%220.15%22/%3E%3C/svg%3E')] opacity-40" />
        <div className="relative mx-auto max-w-5xl px-5 py-12 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white mb-6 transition"
          >
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
                  <p className="text-[#c9903a] font-semibold text-sm">
                    Catalogue partenaire · demande d'information
                  </p>
                </div>
              </div>
              <p className="text-white/70 max-w-md text-sm leading-6">
                Découvrez une sélection de styles pour votre mariage, vos fiançailles ou votre
                soirée. Les modèles, tailles, tarifs et modalités sont confirmés directement avec
                Marwa.
              </p>
            </div>
            <button
              onClick={() => setAgent(true)}
              className="group flex shrink-0 items-center gap-2 rounded-2xl bg-[#c9903a] px-5 py-3.5 font-extrabold text-[#0f1f3d] shadow-lg shadow-[#c9903a]/40 transition-all duration-300 hover:bg-[#fde68a] hover:shadow-xl hover:shadow-[#c9903a]/50 hover:scale-105"
            >
              <Sparkles size={16} className="transition-transform group-hover:scale-110" />
              Me faire conseiller
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {[
              { v: 'Style', l: 'Sélection à découvrir' },
              { v: 'Contact', l: 'Demande directe' },
              { v: 'Info', l: 'Conditions à confirmer' },
            ].map((s) => (
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
              {
                icon: ShoppingBag,
                t: '1. Choisissez',
                d: 'Parcourez la collection, filtrez par occasion et taille',
              },
              {
                icon: Calendar,
                t: '2. Demandez',
                d: 'Contactez Marwa via WhatsApp pour préciser vos besoins',
              },
              {
                icon: Truck,
                t: '3. Confirmez',
                d: 'Marwa confirme modèle, conditions et modalités disponibles',
              },
              {
                icon: Package,
                t: '4. Finalisez',
                d: 'Les modalités sont convenues directement avec le partenaire',
              },
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
        <div className="mb-6">
          <p className="mb-3 text-sm font-bold text-[#0f1f3d]">Filtrer par occasion</p>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o, idx) => (
              <button
                key={o}
                onClick={() => setFilter(o)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-left-4 ${filter === o ? 'bg-[#c9903a] text-[#0f1f3d] shadow-lg shadow-[#c9903a]/30' : 'border border-[#e2d5c0] bg-white text-[#64748b] hover:border-[#c9903a]/50 hover:shadow-sm'}`}
                style={{ transitionDelay: `${idx * 50}ms` }}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <CaftanCard key={c.id} c={c} />
          ))}
        </div>
      </section>

      {/* Conditions */}
      <section className="mx-auto max-w-5xl px-5 pb-12 sm:px-8">
        <div className="rounded-3xl bg-[#0f1f3d] border border-[#c9903a]/20 p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#c9903a]">
              <Shield size={20} className="text-[#0f1f3d]" />
            </div>
            <div>
              <h2 className="font-black text-white mb-2">Conditions à confirmer</h2>
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
      <div className="bg-[#0f1f3d] px-5 py-6 text-center text-xs text-white/75">
        Marwa Caftan — espace partenaire{' '}
        <Link href="/" className="text-[#c9903a] underline hover:no-underline">
          RME Voyage
        </Link>{' '}
        · Contact WhatsApp
        <div className="mt-2 flex items-center justify-center gap-2">
          <Tag size={11} /> Informations à confirmer avec le partenaire
        </div>
      </div>
    </main>
  );
}
