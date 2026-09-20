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
import InspirationImage from '@/components/InspirationImage';
import { INSPIRATION_IMAGES } from '@/lib/inspirationImages';

type Caftan = {
  id: string;
  name: string;
  style: string;
  color: string;
  gradient: string;
  tailles: string[];
  occasion: string[];
};

const CAFTANS: Caftan[] = [
  {
    id: 'c1',
    name: 'Zahia',
    style: 'Broderie dorée',
    color: '#6b1a2e',
    gradient: 'from-[#6b1a2e] to-[#a0344a]',
    tailles: ['S', 'M', 'L'],
    occasion: ['Mariage', 'Fiançailles'],
  },
  {
    id: 'c2',
    name: 'Nour',
    style: 'Perles & soie',
    color: '#e8dcc8',
    gradient: 'from-[#bfa882] to-[#e8dcc8]',
    tailles: ['XS', 'S', 'M'],
    occasion: ['Mariage'],
  },
  {
    id: 'c3',
    name: 'Malika',
    style: 'Velours vert émeraude',
    color: '#1a5c3a',
    gradient: 'from-[#1a5c3a] to-[#2d9d62]',
    tailles: ['M', 'L', 'XL'],
    occasion: ['Mariage', 'Soirée'],
  },
  {
    id: 'c4',
    name: 'Amira',
    style: 'Rose poudré brodé',
    color: '#d4829a',
    gradient: 'from-[#c4607a] to-[#e8a8ba]',
    tailles: ['XS', 'S', 'M', 'L'],
    occasion: ['Fiançailles', 'Baptême'],
  },
  {
    id: 'c5',
    name: 'Yasmine',
    style: 'Doré palace',
    color: '#c9903a',
    gradient: 'from-[#8a5c10] to-[#c9903a]',
    tailles: ['S', 'M'],
    occasion: ['Mariage'],
  },
  {
    id: 'c6',
    name: 'Fatima Zahra',
    style: 'Bleu roi & argent',
    color: '#1e3a8a',
    gradient: 'from-[#1e3a8a] to-[#3b82f6]',
    tailles: ['S', 'M', 'L', 'XL'],
    occasion: ['Soirée', 'Mariage'],
  },
  {
    id: 'c7',
    name: 'Siham',
    style: 'Noir & broderie argent',
    color: '#1a1a2e',
    gradient: 'from-[#1a1a2e] to-[#4a4a6a]',
    tailles: ['XS', 'S', 'M'],
    occasion: ['Soirée', 'Gala'],
  },
  {
    id: 'c8',
    name: 'Houda',
    style: 'Turquoise & or',
    color: '#0d6e6e',
    gradient: 'from-[#0d6e6e] to-[#2ab5b5]',
    tailles: ['M', 'L'],
    occasion: ['Baptême', 'Fiançailles'],
  },
  {
    id: 'c9',
    name: 'Karima',
    style: 'Prune & dentelle',
    color: '#5b1e6e',
    gradient: 'from-[#5b1e6e] to-[#9c4dc4]',
    tailles: ['S', 'M', 'L'],
    occasion: ['Mariage', 'Soirée'],
  },
  {
    id: 'c10',
    name: 'Zainab',
    style: 'Ivoire & corail',
    color: '#c97a5a',
    gradient: 'from-[#c97a5a] to-[#e8b898]',
    tailles: ['XS', 'S', 'M', 'L'],
    occasion: ['Fiançailles', 'Baptême'],
  },
  {
    id: 'c11',
    name: 'Samira',
    style: 'Rouge grenat luxe',
    color: '#7c1d1d',
    gradient: 'from-[#7c1d1d] to-[#c44040]',
    tailles: ['S', 'M'],
    occasion: ['Mariage'],
  },
  {
    id: 'c12',
    name: 'Layla',
    style: 'Lavande & cristaux',
    color: '#7c6b9e',
    gradient: 'from-[#4a3a7e] to-[#9e8ec4]',
    tailles: ['XS', 'S', 'M'],
    occasion: ['Soirée', 'Fiançailles'],
  },
];

const OCCASIONS = ['Toutes', 'Mariage', 'Fiançailles', 'Soirée', 'Baptême', 'Gala'];

type AgentStep = 'occasion' | 'taille' | 'result';

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
                {recommend.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-2xl bg-white/5 border border-white/10 p-3"
                  >
                    <div
                      className={`h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br ${c.gradient}`}
                    />
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
                      className="shrink-0 rounded-full bg-[#25d366] px-3 py-1.5 text-[11px] font-black text-white"
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
    <div
      className={`group relative rounded-3xl border overflow-hidden transition hover:-translate-y-1 hover:shadow-xl border-[#e2d5c0]`}
    >
      {/* Color swatch */}
      <div className={`relative h-48 bg-gradient-to-br ${c.gradient} flex items-end p-4`}>
        <button
          onClick={() => setLiked((v) => !v)}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/20 text-white backdrop-blur-sm transition hover:bg-white/40"
        >
          <Heart size={14} fill={liked ? 'white' : 'none'} />
        </button>
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
          {c.occasion.map((o) => (
            <span
              key={o}
              className="rounded-full bg-[#fef3c7] px-2 py-0.5 text-[10px] font-semibold text-[#b45309]"
            >
              {o}
            </span>
          ))}
        </div>

        <p className="mt-3 text-[11px] text-[#64748b]">
          Tailles et disponibilité à confirmer avec Marwa.
        </p>

        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#c9903a] py-2.5 text-sm font-extrabold text-white transition hover:bg-[#a8741e]"
        >
          <MessageCircle size={14} />
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
              className="flex shrink-0 items-center gap-2 rounded-2xl bg-[#c9903a] px-5 py-3.5 font-extrabold text-[#0f1f3d] shadow-lg transition hover:bg-[#fde68a]"
            >
              <Sparkles size={16} />
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

      <section className="mx-auto max-w-5xl px-5 pt-10 sm:px-8">
        <InspirationImage
          image={INSPIRATION_IMAGES.caftan}
          caption="Photos d’inspiration — modèles non contractuels. Elles ne représentent pas le catalogue officiel Marwa Caftan."
        />
      </section>

      {/* Catalog */}
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {/* Controls */}
        <div className="mb-6">
          <p className="mb-3 text-sm font-bold text-[#0f1f3d]">Filtrer par occasion</p>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <button
                key={o}
                onClick={() => setFilter(o)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${filter === o ? 'bg-[#c9903a] text-white' : 'border border-[#e2d5c0] bg-white text-[#64748b] hover:border-[#c9903a]/50'}`}
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
                <li className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-[#c9903a]" /> Tarif, taille et
                  disponibilité à confirmer
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-[#c9903a]" /> Livraison, retour et
                  paiement à convenir directement avec Marwa
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight size={14} className="text-[#c9903a]" /> Toute demande est sans
                  engagement jusqu’à confirmation du partenaire
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <div className="bg-[#0f1f3d] px-5 py-6 text-center text-xs text-white/40">
        Marwa Caftan — espace partenaire{' '}
        <Link href="/" className="text-[#c9903a] hover:underline">
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
