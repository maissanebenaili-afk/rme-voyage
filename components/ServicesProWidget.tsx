'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Phone, Globe, MapPin, Star, ExternalLink, Bike, ArrowRight } from 'lucide-react';
import { MARWA_PHONE } from '@/lib/partners';

type Business = {
  name: string;
  desc: string;
  location: string;
  phone?: string;
  /** Page dédiée sur le site, pour les partenaires qui en ont une. */
  page?: string;
  web?: string;
  featured?: boolean;
  tag?: string;
};

const SERVICES: Record<string, Business[]> = {
  traiteurs: [
    {
      name: 'Afarah Nassim',
      desc: 'Traiteur franco-marocain · Mariages, fiançailles, baptêmes. Menus authentiques Maroc & fusion.',
      location: 'Île-de-France & déplacements',
      phone: MARWA_PHONE,
      page: '/afarah-nassim',
      featured: true,
      tag: 'Profil à confirmer',
    },
    {
      name: 'Votre traiteur',
      desc: 'Emplacement disponible pour un futur partenaire validé.',
      location: 'Zone à confirmer',
      tag: 'À venir',
    },
    {
      name: 'Votre service événementiel',
      desc: 'Emplacement disponible pour un futur partenaire validé.',
      location: 'Zone à confirmer',
      tag: 'À venir',
    },
  ],
  mobilite: [],
  garages: [],
};

const TABS = [
  { key: 'traiteurs', label: '🍽️ Traiteurs' },
  { key: 'mobilite', label: '🚗 Mobilité' },
  { key: 'garages', label: '🔧 Garages' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function BusinessCard({ b }: { b: Business }) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${b.featured ? 'border-[#c9903a]/60 bg-[#fef9f0] shadow-md shadow-[#c9903a]/10' : 'border-[#e2e8f0] bg-white hover:border-[#c9903a]/30'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-[#0f1f3d] text-sm">{b.name}</h3>
            {b.tag && (
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${b.featured ? 'bg-[#c9903a] text-white' : 'bg-[#f1f5f9] text-[#64748b]'}`}
              >
                {b.tag}
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-[#475569] leading-5 mb-2">{b.desc}</p>

      <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mb-3">
        <MapPin size={10} />
        <span className="truncate">{b.location}</span>
      </div>

      <div className="flex gap-2">
        {b.phone && (
          <a
            href={`tel:${b.phone}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e2e8f0] py-2 text-xs font-bold text-[#0f1f3d] hover:border-[#c9903a]/50 transition"
          >
            <Phone size={11} /> Appeler
          </a>
        )}
        {b.page && (
          <Link
            href={b.page}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#c9903a] py-2 text-xs font-bold text-white transition hover:bg-[#a8741e]"
          >
            Voir la page <ArrowRight size={11} />
          </Link>
        )}
        {b.web && b.web !== '#' && (
          <a
            href={b.web}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#c9903a] py-2 text-xs font-bold text-white transition hover:bg-[#a8741e]"
          >
            <Globe size={11} /> Site <ExternalLink size={9} />
          </a>
        )}
        {(!b.web || b.web === '#') && !b.phone && (
          <span className="flex flex-1 items-center justify-center rounded-xl bg-[#f1f5f9] py-2 text-xs text-[#94a3b8]">
            Bientôt disponible
          </span>
        )}
      </div>
    </div>
  );
}

export default function ServicesProWidget() {
  const [tab, setTab] = useState<TabKey>('traiteurs');

  return (
    <div className="rounded-3xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="border-b border-[#e2e8f0] bg-[#0f1f3d] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#c9903a]">
            <Bike size={18} className="text-[#0f1f3d]" />
          </div>
          <div>
            <h2 className="font-black text-white text-base">Services Pro</h2>
            <p className="text-xs text-[#fde68a]/80 font-semibold">
              Traiteurs · Mobilité · Garages
            </p>
          </div>
          <a
            href="mailto:pro@rme-voyage.com"
            className="ml-auto rounded-full border border-[#c9903a]/40 bg-[#c9903a]/10 px-3 py-1.5 text-[11px] font-bold text-[#c9903a] hover:bg-[#c9903a]/20 transition whitespace-nowrap"
          >
            + Rejoindre
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-xs font-bold transition ${tab === t.key ? 'border-b-2 border-[#c9903a] text-[#b45309] bg-white' : 'text-[#64748b] hover:text-[#0f1f3d]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Listings */}
      <div className="p-4 grid gap-3 sm:grid-cols-2">
        {SERVICES[tab].length > 0 ? (
          SERVICES[tab].map((b) => <BusinessCard key={b.name} b={b} />)
        ) : (
          <p className="rounded-2xl bg-[#f8fafc] p-5 text-center text-sm text-[#64748b] sm:col-span-2">
            Aucun partenaire vérifié dans cette catégorie pour le moment.
          </p>
        )}
      </div>

      <p className="px-5 pb-4 text-center text-[10px] text-[#94a3b8]">
        Vous êtes professionnel ?{' '}
        <a href="mailto:pro@rme-voyage.com" className="text-[#c9903a] hover:underline">
          Rejoignez l'annuaire
        </a>{' '}
        — une fiche sera publiée après vérification.
      </p>
    </div>
  );
}
