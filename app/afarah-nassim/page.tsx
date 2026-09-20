'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ChefHat,
  Phone,
  MessageCircle,
  MapPin,
  Users,
  Star,
  Check,
  Utensils,
} from 'lucide-react';
import { MARWA_PHONE, MARWA_WHATSAPP, whatsappLink } from '@/lib/partners';

type Formule = {
  id: string;
  nom: string;
  occasion: string;
  desc: string;
  plats: string[];
  gradient: string;
  populaire?: boolean;
};

const FORMULES: Formule[] = [
  {
    id: 'mariage',
    nom: 'Mariage',
    occasion: 'Mariage',
    desc: "Le service complet d'un mariage marocain : entrées, pastilla, tajines, méchoui et pâtisseries.",
    plats: [
      'Assortiment de salades marocaines',
      'Pastilla au poulet et aux amandes',
      'Méchoui ou tajine au choix',
      'Couscous royal',
      'Cornes de gazelle & briouates',
      'Thé à la menthe à volonté',
    ],
    gradient: 'from-[#7a1f2e] to-[#b8455a]',
    populaire: true,
  },
  {
    id: 'fiancailles',
    nom: 'Fiançailles',
    occasion: 'Fiançailles',
    desc: 'Une table élégante et généreuse pour la demande et la cérémonie du henné.',
    plats: [
      'Salades et mezzés',
      'Pastilla au poisson',
      'Tajine de volaille aux olives',
      'Assortiment de pâtisseries',
      'Thé et jus frais',
    ],
    gradient: 'from-[#8a6a1f] to-[#d4af5a]',
  },
  {
    id: 'bapteme',
    nom: 'Baptême & Aqiqa',
    occasion: 'Baptême',
    desc: 'Formule familiale et chaleureuse, pensée pour les grandes tablées du dimanche.',
    plats: [
      'Rfissa traditionnelle',
      'Tajine de veau aux pruneaux',
      'Salades variées',
      'Sellou et pâtisseries',
      'Thé à la menthe',
    ],
    gradient: 'from-[#1f5c4a] to-[#3d9d7e]',
  },
  {
    id: 'reception',
    nom: 'Réception & Entreprise',
    occasion: 'Réception',
    desc: 'Buffet froid et chaud, cocktail dînatoire ou plateaux repas pour vos événements.',
    plats: [
      'Cocktail dînatoire fusion',
      'Mini-pastillas et briouates',
      'Plateaux mezzés',
      'Buffet sucré',
      'Service et vaisselle en option',
    ],
    gradient: 'from-[#2b3a67] to-[#5a74b8]',
  },
];

const ENGAGEMENTS = [
  { titre: 'Viande halal certifiée', desc: 'Fournisseurs de confiance, traçabilité complète.' },
  { titre: 'Cuisine faite maison', desc: 'Tout est préparé le jour même, rien de surgelé.' },
  {
    titre: 'Déplacements France entière',
    desc: 'Basé en Île-de-France, nous nous déplaçons partout.',
  },
  {
    titre: 'Demande de devis',
    desc: 'Un échange permet de confirmer le menu, le prix et les conditions.',
  },
];

function FormuleCard({ f }: { f: Formule }) {
  const [ouvert, setOuvert] = useState(false);
  const devis = whatsappLink(
    MARWA_WHATSAPP,
    `Bonjour, je souhaite un devis traiteur Afarah Nassim — formule ${f.nom}`
  );

  return (
    <div
      className={`overflow-hidden rounded-3xl border bg-white transition hover:shadow-xl ${f.populaire ? 'border-[#c9903a]/60 shadow-lg shadow-[#c9903a]/10' : 'border-[#e7e0d4]'}`}
    >
      <div className={`relative h-32 bg-gradient-to-br ${f.gradient} p-5`}>
        {f.populaire && (
          <span className="absolute right-4 top-4 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[#7a1f2e]">
            Le plus demandé
          </span>
        )}
        <span className="rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/90">
          {f.occasion}
        </span>
        <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-white">
          {f.nom}
        </h3>
      </div>

      <div className="p-5">
        <p className="text-sm leading-6 text-[#5c5348]">{f.desc}</p>

        <p className="mt-4 flex items-center gap-1.5 text-sm font-bold text-[#8a7d6d]">
          <Users size={14} /> Tarif et nombre de convives à confirmer sur devis
        </p>

        <button
          onClick={() => setOuvert((v) => !v)}
          aria-expanded={ouvert}
          className="mt-4 w-full rounded-xl border border-[#e7e0d4] py-2 text-xs font-bold text-[#3a2f24] transition hover:border-[#c9903a]/50"
        >
          {ouvert ? 'Masquer le menu' : 'Voir le menu'}
        </button>

        {ouvert && (
          <ul className="mt-3 space-y-1.5">
            {f.plats.map((p) => (
              <li key={p} className="flex items-start gap-2 text-xs text-[#5c5348]">
                <Utensils size={11} className="mt-0.5 shrink-0 text-[#c9903a]" />
                {p}
              </li>
            ))}
          </ul>
        )}

        <a
          href={devis}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#25d366] py-3 text-sm font-extrabold text-white transition hover:bg-[#1da851]"
        >
          <MessageCircle size={14} /> Demander un devis
        </a>
      </div>
    </div>
  );
}

export default function AfarahNassimPage() {
  const contactGeneral = whatsappLink(
    MARWA_WHATSAPP,
    'Bonjour Afarah Nassim, je souhaite des informations pour un événement'
  );

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#fdfaf5]">
      <header className="relative overflow-hidden bg-[#2a1f18] px-5 pb-16 pt-6 text-white sm:px-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, #c9903a 0 1px, transparent 1px 14px), repeating-linear-gradient(-45deg, #c9903a 0 1px, transparent 1px 14px)',
          }}
        />
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#c9903a]/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white/55 transition hover:text-white"
          >
            <ArrowLeft size={14} /> La Boutique
          </Link>

          <div className="mt-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#c9903a] shadow-lg shadow-[#c9903a]/25">
                  <ChefHat size={24} className="text-[#2a1f18]" />
                </div>
                <div>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} fill="#c9903a" className="text-[#c9903a]" />
                    ))}
                  </div>
                  <p className="mt-0.5 text-[10px] font-black uppercase tracking-[.18em] text-[#fde68a]">
                    Profil partenaire à confirmer
                  </p>
                </div>
              </div>

              <h1 className="mt-6 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
                Afarah Nassim
              </h1>
              <p className="mt-2 font-display text-xl italic text-[#c9903a] sm:text-2xl">
                Traiteur franco-marocain
              </p>
              <p className="mt-5 text-lg leading-8 text-white/65">
                Mariages, fiançailles, baptêmes et réceptions. Une cuisine marocaine faite maison,
                servie comme à la maison — pour dix convives comme pour trois cents.
              </p>

              <p className="mt-5 flex items-center gap-2 text-sm text-white/50">
                <MapPin size={14} /> Île-de-France · déplacements France entière
              </p>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row lg:flex-col">
              <a
                href={contactGeneral}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-7 py-3.5 font-extrabold text-white transition hover:bg-[#1da851]"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
              <a
                href={`tel:${MARWA_PHONE}`}
                className="flex items-center justify-center gap-2 rounded-full border border-white/20 px-7 py-3.5 font-bold text-white transition hover:bg-white/10"
              >
                <Phone size={15} /> Appeler
              </a>
            </div>
          </div>
        </div>
      </header>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#b45309]">
            Nos formules
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#3a2f24] sm:text-4xl">
            Un menu pour chaque occasion.
          </h2>
          <p className="mt-3 max-w-2xl text-[#5c5348]">
            Les formules ci-dessous servent de base. Tout se compose sur mesure lors du devis :
            nombre de convives, plats, service en salle, vaisselle.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {FORMULES.map((f) => (
              <FormuleCard key={f.id} f={f} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#3a2f24] sm:text-4xl">
            Nos engagements.
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ENGAGEMENTS.map((e) => (
              <div key={e.titre} className="rounded-2xl border border-[#e7e0d4] p-5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#fdf3e0]">
                  <Check size={18} className="text-[#c9903a]" />
                </div>
                <h3 className="mt-3 text-sm font-black text-[#3a2f24]">{e.titre}</h3>
                <p className="mt-1.5 text-xs leading-5 text-[#7a6f61]">{e.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#2a1f18] py-16">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Parlons de votre événement.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/65">
            Dites-nous la date, le nombre de convives et l&apos;occasion — vous recevez un menu et
            les disponibilités, le menu et les conditions directement avec le partenaire.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={contactGeneral}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-7 py-3.5 font-extrabold text-white transition hover:bg-[#1da851]"
            >
              <MessageCircle size={16} /> Devis par WhatsApp
            </a>
            <a
              href={`tel:${MARWA_PHONE}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 font-bold text-white transition hover:bg-white/10"
            >
              <Phone size={15} /> Appeler
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
