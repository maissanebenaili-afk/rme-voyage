'use client';

import { useState } from 'react';
import { Phone, Globe, MapPin, Star, ExternalLink, Bike, MessageCircle } from 'lucide-react';
import { MARWA_PHONE, MARWA_WHATSAPP, whatsappLink } from '@/lib/partners';

type Business = {
  name: string;
  desc: string;
  location: string;
  phone?: string;
  whatsapp?: string;
  web?: string;
  featured?: boolean;
  stars?: number;
  tag?: string;
};

const SERVICES: Record<string, Business[]> = {
  traiteurs: [
    {
      name: 'Afarah Nassim',
      desc: 'Traiteur franco-marocain · Mariages, fiançailles, baptêmes. Menus authentiques Maroc & fusion.',
      location: 'Île-de-France & déplacements',
      phone: MARWA_PHONE,
      whatsapp: whatsappLink(MARWA_WHATSAPP, 'Bonjour, je souhaite un devis traiteur Afarah Nassim'),
      featured: true,
      stars: 5,
      tag: 'Partenaire Officiel',
    },
    {
      name: 'Saveurs du Maghreb',
      desc: 'Couscous, tajines, pâtisseries orientales. Buffets sur mesure 50–500 personnes.',
      location: 'Lyon & Rhône-Alpes',
      phone: '+33 6 00 00 00 01',
      stars: 4,
      tag: 'Inscrivez votre traiteur →',
    },
    {
      name: 'Festins Berbères',
      desc: 'Spécialités du Souss et Haut Atlas. Déco traditionnelle incluse sur demande.',
      location: 'Marseille & PACA',
      phone: '+33 6 00 00 00 02',
      stars: 4,
      tag: 'Inscrivez votre traiteur →',
    },
  ],
  mobilite: [
    {
      name: 'Véloc Maroc',
      desc: 'Location vélos électriques Marrakech, Agadir, Essaouira. Livraison hôtel incluse.',
      location: 'Marrakech · Agadir · Essaouira',
      web: '#',
      featured: false,
      stars: 4,
      tag: 'Mobilité douce',
    },
    {
      name: 'Atlas Car Rental',
      desc: 'Location voiture toutes catégories. Aéroport CMN, RAK, AGA, TNG. Kilométrage illimité.',
      location: 'Tous aéroports Maroc',
      phone: '+212 5 00 00 00 00',
      web: '#',
      stars: 4,
      tag: 'Location voiture',
    },
    {
      name: 'TransMED Dépannage',
      desc: 'Dépannage & remorquage France–Espagne–Maroc. Assistance 24h/24, numéro unique.',
      location: 'Axe Europe → Maroc',
      phone: '+33 9 00 00 00 00',
      stars: 5,
      tag: '24h/24 · 7j/7',
    },
    {
      name: 'Iberia Rent',
      desc: 'Location véhicules Espagne côté traversée · Algeciras, Tarifa, Barcelone.',
      location: 'Algeciras · Tarifa · BCN',
      web: '#',
      stars: 4,
      tag: 'Location voiture',
    },
  ],
  garages: [
    { name: 'Garage Hassan — Tanger',  desc: 'Mécanique générale, vidange, pneumatiques. Prix MRE.',          location: 'Tanger, entrée ville',      phone: '+212 6 00 00 00 10', stars: 5 },
    { name: 'Auto Marrakech',           desc: 'Climatisation, électronique, carrosserie.',                      location: 'Marrakech, route Casablanca', phone: '+212 6 00 00 00 11', stars: 4 },
    { name: 'Garage El Jadida',         desc: 'Pneus, freins, contrôle technique rapide.',                      location: 'El Jadida, centre',         phone: '+212 6 00 00 00 12', stars: 4 },
    { name: 'Taller Algeciras',         desc: 'Mécanique rapide côté espagnol avant traversée.',               location: 'Algeciras, port',           phone: '+34 9 00 00 00 00',  stars: 4 },
    { name: 'Garage Ibn Batouta',       desc: 'Spécialiste diesel & autoroutes Maroc. Devis SMS.',             location: 'Rabat, N1',                 phone: '+212 6 00 00 00 13', stars: 5 },
    { name: 'Auto Fes',                 desc: 'Révision complète, location utilitaires ponctuellement.',        location: 'Fès, quartier industriel',  phone: '+212 6 00 00 00 14', stars: 4 },
  ],
};

const TABS = [
  { key: 'traiteurs', label: '🍽️ Traiteurs' },
  { key: 'mobilite',  label: '🚗 Mobilité' },
  { key: 'garages',   label: '🔧 Garages' },
] as const;

type TabKey = typeof TABS[number]['key'];

function BusinessCard({ b }: { b: Business }) {
  return (
    <div className={`rounded-2xl border p-4 transition ${b.featured ? 'border-[#c9903a]/60 bg-[#fef9f0] shadow-md shadow-[#c9903a]/10' : 'border-[#e2e8f0] bg-white hover:border-[#c9903a]/30'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-[#0f1f3d] text-sm">{b.name}</h3>
            {b.tag && (
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${b.featured ? 'bg-[#c9903a] text-white' : 'bg-[#f1f5f9] text-[#64748b]'}`}>
                {b.tag}
              </span>
            )}
          </div>
          {b.stars && (
            <div className="flex mt-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={9} fill={i < b.stars! ? '#c9903a' : 'none'} className={i < b.stars! ? 'text-[#c9903a]' : 'text-[#e2e8f0]'} />
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-[#475569] leading-5 mb-2">{b.desc}</p>

      <div className="flex items-center gap-1.5 text-[11px] text-[#64748b] mb-3">
        <MapPin size={10} />
        <span className="truncate">{b.location}</span>
      </div>

      <div className="flex gap-2">
        {b.phone && (
          <a href={`tel:${b.phone}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#e2e8f0] py-2 text-xs font-bold text-[#0f1f3d] hover:border-[#c9903a]/50 transition">
            <Phone size={11} /> Appeler
          </a>
        )}
        {b.whatsapp && (
          <a href={b.whatsapp} target="_blank" rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#25d366] py-2 text-xs font-bold text-white transition hover:bg-[#1da851]">
            <MessageCircle size={11} /> WhatsApp
          </a>
        )}
        {b.web && b.web !== '#' && (
          <a href={b.web} target="_blank" rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#c9903a] py-2 text-xs font-bold text-white transition hover:bg-[#a8741e]">
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
            <p className="text-xs text-[#fde68a]/80 font-semibold">Traiteurs · Mobilité · Garages</p>
          </div>
          <a href="mailto:pro@rme-voyage.com"
            className="ml-auto rounded-full border border-[#c9903a]/40 bg-[#c9903a]/10 px-3 py-1.5 text-[11px] font-bold text-[#c9903a] hover:bg-[#c9903a]/20 transition whitespace-nowrap">
            + Rejoindre
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 py-3 text-xs font-bold transition ${tab === t.key ? 'border-b-2 border-[#c9903a] text-[#b45309] bg-white' : 'text-[#64748b] hover:text-[#0f1f3d]'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Listings */}
      <div className="p-4 grid gap-3 sm:grid-cols-2">
        {SERVICES[tab].map(b => <BusinessCard key={b.name} b={b} />)}
      </div>

      <p className="px-5 pb-4 text-center text-[10px] text-[#94a3b8]">
        Vous êtes professionnel ? <a href="mailto:pro@rme-voyage.com" className="text-[#c9903a] hover:underline">Rejoignez l'annuaire</a> — visibilité auprès de 5M de MRE.
      </p>
    </div>
  );
}
