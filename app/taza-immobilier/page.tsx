'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Square,
  DollarSign,
  MessageCircle,
  ChevronRight,
  ArrowLeft,
  Heart,
  Search,
} from 'lucide-react';
import { whatsappLink } from '@/lib/partners';
import { PROPERTIES, PROPERTY_TYPES, MODES, IDOUR_WHATSAPP, type Property } from '@/lib/properties';

function PropertyCard({ p }: { p: Property }) {
  const [liked, setLiked] = useState(false);
  const primaryMode = p.modes[0];
  const primaryPrice = primaryMode === 'vente' ? p.price_sale : p.price_month;
  const priceLabel = primaryMode === 'vente' ? `${primaryPrice?.toLocaleString()} DH` : `${primaryPrice?.toLocaleString()} DH/mois`;

  const whatsapp = whatsappLink(
    IDOUR_WHATSAPP,
    `Bonjour, je suis intéressé(e) par la propriété: ${p.title} à ${p.location}`
  );

  return (
    <div className="group relative rounded-3xl border border-[#e2d5c0] overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      {/* Image placeholder */}
      <div className="relative h-72 overflow-hidden bg-gradient-to-br from-[#8a6a3c] to-[#c9903a]">
        <Link
          href={`/taza-immobilier/${p.id}`}
          aria-label={`Voir ${p.title}`}
          className="absolute inset-0"
        />

        <button onClick={() => setLiked(v => !v)}
          aria-label={liked ? `Retirer ${p.title} des favoris` : `Ajouter ${p.title} aux favoris`}
          className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-all duration-200 hover:bg-black/50 hover:scale-110">
          <Heart size={14} fill={liked ? 'white' : 'none'} />
        </button>

        {/* Property type badge */}
        <div className="pointer-events-none absolute bottom-3 left-3">
          <span className="rounded-full bg-[#c9903a] px-2.5 py-1 text-[10px] font-black text-[#0f1f3d]">
            {PROPERTY_TYPES[p.type]}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="bg-white p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-black text-[#0f1f3d] truncate">{p.title}</h3>
            <p className="text-xs text-[#64748b] mt-0.5 flex items-center gap-1">
              <MapPin size={12} /> {p.location}
            </p>
          </div>
        </div>

        {/* Specs */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {p.bedrooms > 0 && (
            <span className="flex items-center gap-1 text-[#475569]">
              <Bed size={12} /> {p.bedrooms} ch.
            </span>
          )}
          {p.bathrooms > 0 && (
            <span className="flex items-center gap-1 text-[#475569]">
              <Bath size={12} /> {p.bathrooms} SDB
            </span>
          )}
          <span className="flex items-center gap-1 text-[#475569]">
            <Square size={12} /> {p.area} m²
          </span>
        </div>

        {/* Modes & Price */}
        <div className="mt-3 flex flex-wrap gap-1">
          {p.modes.map((m, idx) => (
            <span
              key={m}
              className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-semibold text-[#b45309] transition-all duration-200 hover:bg-[#fde68a] hover:scale-105 animate-in fade-in duration-300"
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              {m === 'location' ? 'Location' : m === 'vente' ? 'Vente' : 'Location meublée'}
            </span>
          ))}
        </div>

        <p className="mt-3 font-bold text-[#0f1f3d]">{priceLabel}</p>

        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c9903a] py-2.5 text-sm font-extrabold text-white shadow-lg shadow-[#c9903a]/20 transition-all duration-300 hover:bg-[#a8741e] hover:shadow-xl hover:shadow-[#c9903a]/30 hover:scale-105"
        >
          <MessageCircle size={14} className="transition-transform group-hover:scale-110" />
          Demander des informations
        </a>
      </div>
    </div>
  );
}

export default function TazaImmobilier() {
  const [filter, setFilter] = useState('Tous');
  const [furnish, setFurnish] = useState('Tous');

  const filtered = PROPERTIES.filter((p) => {
    const typeMatch = filter === 'Tous' || p.modes.some(m => {
      if (filter === 'Location') return m === 'location';
      if (filter === 'Vente') return m === 'vente';
      if (filter === 'Location meublée') return m === 'location-meuble';
      return true;
    });
    const furnishMatch = furnish === 'Tous' || p.furnish === furnish.toLowerCase();
    return typeMatch && furnishMatch;
  });

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#fdf8f2]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0f1f3d]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect width=10 height=10 fill=%22%23c9903a%22 opacity=%220.2%22/%3E%3C/svg%3E')] opacity-40" />
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
                  <Building2 size={28} className="text-[#0f1f3d]" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tight">Idour Immobilier</h1>
                  <p className="text-[#c9903a] font-semibold text-sm">
                    Propriétés à Taza · Location & Vente
                  </p>
                </div>
              </div>
              <p className="text-white/70 max-w-md text-sm leading-6">
                Découvrez notre sélection d'appartements, villas et riads à Taza. Location meublée ou non meublée, vente. Tous les détails et tarifs à confirmer directement.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {[
              { v: PROPERTIES.length.toString(), l: 'Propriétés' },
              { v: 'Taza', l: 'Localisation' },
              { v: 'Flexible', l: 'Modalités' },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <div className="text-2xl font-black text-[#c9903a]">{s.v}</div>
                <div className="text-xs text-white/50 mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-[#e2d5c0] py-8">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Mode filter */}
            <div>
              <p className="mb-3 text-sm font-bold text-[#0f1f3d]">Type de location</p>
              <div className="flex flex-wrap gap-2">
                {['Tous', ...MODES].map((m, idx) => (
                  <button
                    key={m}
                    onClick={() => setFilter(m)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-left-4 ${filter === m ? 'bg-[#c9903a] text-white shadow-lg shadow-[#c9903a]/30' : 'border border-[#e2d5c0] bg-white text-[#64748b] hover:border-[#c9903a]/50 hover:shadow-sm'}`}
                    style={{ transitionDelay: `${idx * 50}ms` }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Furnish filter */}
            <div>
              <p className="mb-3 text-sm font-bold text-[#0f1f3d]">État de meublement</p>
              <div className="flex flex-wrap gap-2">
                {['Tous', 'Meublé', 'Non-meublé'].map((f, idx) => (
                  <button
                    key={f}
                    onClick={() => setFurnish(f)}
                    className={`rounded-full px-3 py-1.5 text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-left-4 ${furnish === f ? 'bg-[#c9903a] text-white shadow-lg shadow-[#c9903a]/30' : 'border border-[#e2d5c0] bg-white text-[#64748b] hover:border-[#c9903a]/50 hover:shadow-sm'}`}
                    style={{ transitionDelay: `${idx * 50}ms` }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-[#64748b]">
            {filtered.length} propriété{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-[#e2d5c0] bg-[#fdf8f2] p-8 text-center">
            <Search size={32} className="mx-auto mb-4 text-[#c9903a]" />
            <p className="text-[#64748b]">Aucune propriété ne correspond à vos critères.</p>
          </div>
        )}
      </section>

      {/* About */}
      <section className="mx-auto max-w-5xl px-5 pb-12 sm:px-8">
        <div className="rounded-3xl bg-[#0f1f3d] border border-[#c9903a]/20 p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#c9903a]">
              <Building2 size={20} className="text-[#0f1f3d]" />
            </div>
            <div>
              <h2 className="font-black text-white mb-2">À propos d'Idour Immobilier</h2>
              <p className="text-sm text-white/70 leading-6">
                Aziz Immobilier Idour est un constructeur et promoteur immobilier basé à Taza, spécialisé dans le développement de résidences modernes et la restauration de propriétés traditionnelles. Nous proposons des solutions de location et de vente pour répondre à tous les besoins.
              </p>
              <ul className="mt-4 space-y-1 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-[#c9903a]" /> Propriétés neuves et de prestige
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-[#c9903a]" /> Options meublées et non meublées
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-[#c9903a]" /> Service client direct et réactif
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <div className="bg-[#0f1f3d] px-5 py-6 text-center text-xs text-white/40">
        Idour Immobilier — Taza · Immobilier{' '}
        <Link href="/" className="text-[#c9903a] hover:underline">
          RME Voyage
        </Link>{' '}
        · Tous les détails à confirmer directement
      </div>
    </main>
  );
}
