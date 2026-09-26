'use client';

import { useState } from 'react';
import { Package, Phone, MapPin, Star, Truck, Calculator } from 'lucide-react';
import { contactMailto } from '@/lib/contact';

const joinMailto = contactMailto('Inscription annuaire Colis & Groupage');

type Transporteur = {
  name: string;
  desc: string;
  depart: string;
  delai: string;
  prixKg: number;
  phone: string;
  stars: number;
  featured?: boolean;
};

const TRANSPORTEURS: Transporteur[] = [
  {
    name: 'Atlas Express Colis',
    desc: 'Groupage hebdomadaire porte-à-porte. Cartons, électroménager, mobilier.',
    depart: 'Paris · Lille · Rouen',
    delai: '5–7 jours',
    prixKg: 3.5,
    phone: '+33 6 00 00 00 20',
    stars: 5,
    featured: true,
  },
  {
    name: 'Maghreb Cargo',
    desc: 'Départs bi-mensuels, suivi SMS à chaque étape. Assurance incluse.',
    depart: 'Lyon · Grenoble · Saint-Étienne',
    delai: '6–9 jours',
    prixKg: 3.2,
    phone: '+33 6 00 00 00 21',
    stars: 4,
  },
  {
    name: 'Sud Transit Maroc',
    desc: 'Camion complet et demi-lot. Enlèvement à domicile sur rendez-vous.',
    depart: 'Marseille · Montpellier · Nice',
    delai: '4–6 jours',
    prixKg: 3.9,
    phone: '+33 6 00 00 00 22',
    stars: 4,
  },
  {
    name: 'Benelux Maroc Lignes',
    desc: 'Départs depuis la Belgique et les Pays-Bas. Palettes et gros volumes.',
    depart: 'Bruxelles · Anvers · Rotterdam',
    delai: '7–10 jours',
    prixKg: 3.6,
    phone: '+32 4 00 00 00 00',
    stars: 4,
  },
];

function Card({ t }: { t: Transporteur }) {
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        t.featured
          ? 'border-[#c9903a]/60 bg-[#fef9f0] shadow-md shadow-[#c9903a]/10'
          : 'border-[#e2e8f0] bg-white hover:border-[#c9903a]/30'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-black text-[#0f1f3d]">{t.name}</h3>
        {t.featured && (
          <span className="rounded-full bg-[#c9903a] px-2 py-0.5 text-[9px] font-black uppercase text-white">
            Mis en avant
          </span>
        )}
      </div>

      <div className="mt-0.5 flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={9}
            fill={i < t.stars ? '#c9903a' : 'none'}
            className={i < t.stars ? 'text-[#c9903a]' : 'text-[#e2e8f0]'}
          />
        ))}
      </div>

      <p className="mt-2 text-xs leading-5 text-[#475569]">{t.desc}</p>

      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#64748b]">
        <MapPin size={10} />
        <span className="truncate">{t.depart}</span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[10px] font-bold text-[#475569]">
          {t.delai}
        </span>
        <span className="rounded-full bg-[#ecfdf5] px-2.5 py-1 text-[10px] font-black text-[#047857]">
          dès {t.prixKg.toFixed(2).replace('.', ',')} €/kg
        </span>
      </div>

      <a
        href={`tel:${t.phone}`}
        className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-[#e2e8f0] py-2 text-xs font-bold text-[#0f1f3d] transition hover:border-[#c9903a]/50"
      >
        <Phone size={11} /> Demander un devis
      </a>
    </div>
  );
}

export default function ColisWidget() {
  const [poids, setPoids] = useState(30);

  const moins = TRANSPORTEURS.reduce((a, b) => (a.prixKg <= b.prixKg ? a : b));
  const estimation = poids * moins.prixKg;

  return (
    <div className="overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-sm">
      <div className="border-b border-[#e2e8f0] bg-[#0f1f3d] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#c9903a]">
            <Package size={18} className="text-[#0f1f3d]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-black text-white">Colis &amp; Groupage Maroc</h2>
            <p className="text-xs font-semibold text-[#fde68a]/80">
              Envoyez vos affaires au bled sans prendre la route
            </p>
          </div>
          {joinMailto && (
            <a
              href={joinMailto}
              className="ml-auto hidden whitespace-nowrap rounded-full border border-[#c9903a]/40 bg-[#c9903a]/10 px-3 py-1.5 text-[11px] font-bold text-[#c9903a] transition hover:bg-[#c9903a]/20 sm:block"
            >
              + Rejoindre
            </a>
          )}
        </div>
      </div>

      <div className="border-b border-[#e2e8f0] bg-[#f8fafc] px-5 py-4">
        <label htmlFor="colis-poids" className="flex items-center gap-1.5 text-xs font-bold text-[#0f1f3d]">
          <Calculator size={12} /> Estimer mon envoi — {poids} kg
        </label>
        <input
          id="colis-poids"
          type="range"
          min={5}
          max={300}
          step={5}
          value={poids}
          onChange={e => setPoids(Number(e.target.value))}
          className="mt-2 w-full accent-[#c9903a]"
        />
        <p className="mt-1.5 text-xs text-[#475569]">
          À partir de{' '}
          <strong className="text-[#047857]">
            {estimation.toFixed(0)} €
          </strong>{' '}
          avec {moins.name} · estimation indicative, hors options
        </p>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2">
        {TRANSPORTEURS.map(t => (
          <Card key={t.name} t={t} />
        ))}
      </div>

      {joinMailto && (
        <p className="flex items-center justify-center gap-1.5 px-5 pb-4 text-center text-[10px] text-[#94a3b8]">
          <Truck size={10} /> Transporteur ?{' '}
          <a href={joinMailto} className="text-[#c9903a] hover:underline">
            Rejoignez l&apos;annuaire
          </a>
        </p>
      )}
    </div>
  );
}
