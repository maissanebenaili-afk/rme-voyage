'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Compass,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Plane,
  Ship,
  Route as RouteIcon,
  Moon,
  Wallet,
  CheckCircle2,
  Star,
  Users,
  Globe,
  TrendingUp,
  Banknote,
} from 'lucide-react';
import RouteSearch from '@/components/RouteSearch';
import CostCalculator from '@/components/CostCalculator';
import TripDecisionEngine from '@/components/TripDecisionEngine';
import PrayerWidget from '@/components/PrayerWidget';
import ServicesMap from '@/components/ServicesMap';
import NewsFeed from '@/components/NewsFeed';
import QiblaCompass from '@/components/QiblaCompass';
import TravelChecklist from '@/components/TravelChecklist';
import CurrencyConverter from '@/components/CurrencyConverter';
import RemittanceComparator from '@/components/RemittanceComparator';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import HadakAI from '@/components/HadakAI';
import DailyWidget from '@/components/DailyWidget';
import { WeatherMorocco, DarijaPhrasebook, CustomsCalculator, EmergencyContacts, MoroccanCalendar, ZakaatCalculator, TimeZoneSIM, FuelPriceComparator } from '@/components/TravelWidgets';
import SmartPacking from '@/components/SmartPacking';
import NewsletterSection from '@/components/NewsletterSection';
import FaicalWidget from '@/components/FaicalWidget';
import TVWidget from '@/components/TVWidget';
import MarwaCaftanWidget from '@/components/MarwaCaftanWidget';
import ServicesProWidget from '@/components/ServicesProWidget';
import MouniaWidget from '@/components/MouniaWidget';
import ColisWidget from '@/components/ColisWidget';
import BookBanner from '@/components/BookBanner';
import Reveal from '@/components/Reveal';

const benefits = [
  { icon: MapPinned, title: 'Votre itinéraire', text: 'Préparez chaque étape, de votre ville à votre destination au Maroc.' },
  { icon: Compass, title: 'Vos options', text: 'Route, ferry et vol comparés dans un seul parcours.' },
  { icon: ShieldCheck, title: 'Vos repères', text: 'Prières, Qibla, services et conseils pour voyager sereinement.' },
];

const stats = [
  { value: '5M+', label: 'MRE en Europe', icon: Users },
  { value: '€4,8Md', label: 'Envoyés/an Europe → Maroc', icon: Banknote },
  { value: '19,8M', label: 'Touristes au Maroc (2025)', icon: Globe },
  { value: '15+', label: 'Outils intégrés', icon: TrendingUp },
];

const liveTicker = [
  '🇲🇦 Maroc · Actualités et informations utiles',
  '🚗 Routes · Trafic, travaux et perturbations',
  '⛴️ Ferries · Traversées Europe ↔ Maroc',
  '🇫🇷 France · Informations pratiques pour les MRE',
  '⚽ Sport · Résultats et rendez-vous',
  '🌍 International · Les informations à retenir',
];

const features = [
  { icon: RouteIcon, title: 'Recherche de trajet', text: 'Trouvez le meilleur itinéraire Europe ↔ Maroc en un clic.' },
  { icon: Wallet, title: 'Calculateur de budget', text: 'Estimez carburant, péages, ferry et coût total.' },
  { icon: Ship, title: 'Ferry & vol', text: 'Comparez les traversées et vols avec nos partenaires.' },
  { icon: Moon, title: 'Horaires de prière', text: 'Prières et Qibla adaptés à votre position GPS.' },
  { icon: CheckCircle2, title: 'Checklist voyage', text: 'Ne oubliez rien : documents, véhicule, santé, logistique.' },
  { icon: Sparkles, title: 'Assistant IA Darija', text: 'Posez vos questions en darija, français, arabe, anglais ou espagnol.' },
];

export default function Home() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen overflow-hidden bg-[#f8fafc] text-[#1e293b]">
      {/* Hero — product-first, visual and mobile-first */}
      <section className="relative isolate overflow-hidden bg-[#07152f] text-white">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_78%_20%,rgba(245,158,11,.22),transparent_28%),radial-gradient(circle_at_12%_70%,rgba(14,165,233,.16),transparent_30%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-[#f59e0b]/70 to-transparent" />

        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f59e0b] font-black text-[#07152f] shadow-lg shadow-[#f59e0b]/20">R</span>
            <span className="text-base font-black tracking-tight sm:text-lg">RME <span className="font-medium text-[#fde68a]">Voyage</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/guide" className="hidden rounded-full px-3 py-2 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white sm:block">Guide</Link>
            <Link href="/decouvrir" className="hidden rounded-full px-3 py-2 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white sm:block">Découvrir</Link>
            <LanguageSwitcher />
            <a href="#planifier" className="rounded-full bg-white px-4 py-2 text-xs font-black text-[#07152f] transition hover:bg-[#fde68a] sm:text-sm">Planifier</a>
          </div>
        </nav>

        <div className="mx-auto max-w-7xl px-4 pb-10 pt-7 sm:px-8 sm:pb-16 sm:pt-12">
          <div className="grid gap-8 lg:grid-cols-[.86fr_1.14fr] lg:items-center lg:gap-12">
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.06] px-3 py-1.5 text-xs font-extrabold text-[#fde68a]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e]" />
                Votre copilote Europe ↔ Maroc
              </div>
              <h1 className="mt-5 max-w-xl text-5xl font-display font-semibold leading-[.94] tracking-tight sm:text-7xl">
                La route vers le Maroc, <span className="gradient-text-gold">autrement.</span>
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/70 sm:text-lg">
                Itinéraire, ferry, budget et repères utiles réunis dans une expérience pensée comme une vraie application de voyage.
              </p>

              <div className="mt-7 flex flex-wrap gap-2 text-xs font-bold text-white/70">
                <span className="rounded-full border border-white/10 bg-white/[.05] px-3 py-2">🗺️ Route</span>
                <span className="rounded-full border border-white/10 bg-white/[.05] px-3 py-2">⛴️ Ferry</span>
                <span className="rounded-full border border-white/10 bg-white/[.05] px-3 py-2">💶 Budget</span>
                <span className="rounded-full border border-white/10 bg-white/[.05] px-3 py-2">🕌 Repères</span>
              </div>

              <div className="mt-7 flex items-center gap-3 text-sm text-white/55">
                <BadgeCheck size={18} className="text-[#fcd34d]" />
                Gratuit · sans inscription · pensé mobile
              </div>
            </div>

            {/* App preview — the product is the hero, not a marketing illustration */}
            <div className="relative mx-auto w-full max-w-2xl animate-scale-in">
              <div className="absolute -inset-5 -z-10 rounded-[2.5rem] bg-[#f59e0b]/10 blur-2xl" />
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#f7fafc] shadow-2xl shadow-black/40">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#07152f] text-xs font-black text-[#f59e0b]">R</span>
                    <div>
                      <p className="text-xs font-black text-[#07152f]">RME Voyage</p>
                      <p className="text-[10px] text-slate-500">Itinéraire intelligent</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700">PRÊT À PARTIR</span>
                </div>

                <div className="relative min-h-[330px] overflow-hidden bg-[#dceaf0]">
                  <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:34px_34px]" />
                  <div className="absolute left-[8%] top-[18%] h-28 w-40 rotate-[-8deg] rounded-[45%] bg-[#f8fafc] shadow-sm" />
                  <div className="absolute left-[32%] top-[35%] h-40 w-52 rotate-[9deg] rounded-[45%] bg-[#f8fafc] shadow-sm" />
                  <div className="absolute right-[5%] bottom-[2%] h-48 w-56 rotate-[-12deg] rounded-[45%] bg-[#f8fafc] shadow-sm" />
                  <div className="absolute left-[15%] top-[31%] h-1 w-[63%] rotate-[18deg] origin-left bg-[#07152f] shadow-[0_0_0_3px_rgba(245,158,11,.35)]" />
                  <div className="absolute left-[49%] top-[51%] flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-[#f59e0b] text-[#07152f] shadow-lg">
                    <Ship size={15} />
                  </div>
                  <div className="absolute left-[11%] top-[27%] h-3.5 w-3.5 rounded-full border-2 border-white bg-[#07152f] shadow-md" />
                  <div className="absolute right-[9%] bottom-[13%] h-3.5 w-3.5 rounded-full border-2 border-white bg-[#07152f] shadow-md" />

                  <div className="absolute left-4 top-4 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-lg backdrop-blur sm:left-5 sm:top-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Départ</p>
                    <p className="mt-0.5 text-sm font-black text-[#07152f]">Paris</p>
                  </div>
                  <div className="absolute right-4 bottom-4 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-lg backdrop-blur sm:right-5 sm:bottom-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Arrivée</p>
                    <p className="mt-0.5 text-sm font-black text-[#07152f]">Marrakech</p>
                  </div>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/80 bg-[#07152f]/95 px-4 py-2 text-xs font-bold text-white shadow-xl backdrop-blur">
                    🇫🇷 Paris → ⛴️ Tanger → 🇲🇦 Marrakech
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-px border-t border-slate-200 bg-slate-200">
                  <div className="bg-white p-3 sm:p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Distance</p>
                    <p className="mt-1 text-lg font-black text-[#07152f]">≈ 2 500 km</p>
                  </div>
                  <div className="bg-white p-3 sm:p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Étapes</p>
                    <p className="mt-1 text-lg font-black text-[#07152f]">Route + ferry</p>
                  </div>
                  <div className="bg-white p-3 sm:p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Budget</p>
                    <p className="mt-1 text-lg font-black text-[#07152f]">Calculé</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { icon: RouteIcon, title: 'Choisir sa route', text: 'Europe → Maroc, avec les vraies étapes.' },
              { icon: Wallet, title: 'Voir le coût', text: 'Carburant, ferry et hypothèses visibles.' },
              { icon: Sparkles, title: 'Continuer le voyage', text: 'Météo, prière, services et conseils.' },
            ].map(({ icon: Icon, title, text }) => (
              <a key={title} href="#planifier" className="group rounded-2xl border border-white/10 bg-white/[.045] p-4 transition hover:-translate-y-0.5 hover:bg-white/[.08]">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#fde68a]"><Icon size={17} /></span>
                  <div>
                    <p className="text-sm font-extrabold text-white">{title}</p>
                    <p className="mt-0.5 text-xs text-white/55">{text}</p>
                  </div>
                  <ArrowRight size={15} className="ml-auto text-white/30 transition group-hover:translate-x-1 group-hover:text-[#f59e0b]" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* RME Live — compact, useful, and intentionally secondary to the journey */ }
      <section aria-label="RME Live" className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-3 overflow-hidden px-4 py-2.5 sm:px-8">
          <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-700">
            🔴 RME Live
          </span>
          <div className="min-w-0 overflow-hidden">
            <div className="flex min-w-max animate-[marquee_32s_linear_infinite] gap-8 text-xs font-semibold text-slate-600">
              {[...liveTicker, ...liveTicker].map((item, index) => (
                <span key={index} className="whitespace-nowrap">{item}</span>
              ))}
            </div>
          </div>
          <Link href="/actualites" className="hidden shrink-0 text-xs font-extrabold text-sky-700 sm:block">
            Tout voir →
          </Link>
        </div>
      </section>

      {/* Daily Widget — hijri date, Ramadan countdown, personalized weather */}
      <DailyWidget />

      {/* Benefits Section */}
      <section className="border-b border-[#e2e8f0] bg-white py-8">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:grid-cols-3 sm:px-8">
          {benefits.map(({ icon: Icon, title, text }) => (
            <article key={title} className="flex gap-4 card-hover">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e0f2fe] text-[#0369a1]">
                <Icon size={21} />
              </span>
              <div>
                <h2 className="font-extrabold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-[#475569]">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Hadak AI Section */}
      <section className="bg-[#0f1f3d] py-12">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f59e0b]">
                <Sparkles size={22} className="text-[#0f1f3d]" />
              </div>
              <div className="text-left">
                <p className="text-xl font-extrabold text-white tracking-tight">Hadak AI</p>
                <p className="text-xs text-[#fde68a] font-semibold">Ton assistant voyage MRE</p>
              </div>
            </div>
            <p className="text-white/70 text-base max-w-lg">
              Dis-lui où tu veux aller — il prépare tout : météo, prières, change, ferry, documents.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5 mt-1">
              {[
                { label: '🗺️ Prépare-moi un voyage à Taza', msg: 'Prépare-moi un voyage à Taza' },
                { label: '🌤️ Météo à Agadir', msg: 'Météo à Agadir' },
                { label: '🕌 Prières à Marrakech', msg: 'Horaires de prière à Marrakech' },
                { label: '💶 Taux dirham', msg: 'Combien vaut 100 euros en dirhams ?' },
                { label: '⛴️ Ferry Algeciras', msg: 'Ferry Algeciras Tanger' },
                { label: '⚽ Wydad ce soir ?', msg: 'Qui va gagner le match Wydad ce soir ?' },
              ].map(({ label, msg }) => (
                <button
                  key={msg}
                  onClick={() => window.dispatchEvent(new CustomEvent('hadak:open-with-message', { detail: msg }))}
                  className="rounded-full border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-4 py-2 text-sm font-semibold text-[#fde68a] transition hover:bg-[#f59e0b]/20 hover:border-[#f59e0b]/70"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Planning Section */}
      <section id="planifier" className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
        <div className="mb-10 max-w-2xl animate-fade-up">
          <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#b45309]">Préparez sereinement</p>
          <h2 className="mt-3 text-4xl font-display font-semibold tracking-tight sm:text-5xl">L'essentiel, au bon moment.</h2>
          <p className="mt-4 text-lg leading-8 text-[#475569]">
            Commencez par votre trajet, puis ajustez votre budget avant de comparer vos options.
          </p>
        </div>
        <div className="space-y-6">
          <RouteSearch />
          <CostCalculator />
          <TripDecisionEngine />
        </div>
      </section>

      {/* Remittance Section — hero product, investor highlight */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#b45309]">Produit phare</p>
            <h2 className="mt-3 text-4xl font-display font-semibold tracking-tight sm:text-5xl">
              Comparer les transferts EUR → MAD.
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#475569]">
              5 millions de MRE envoient <strong>€4,8 milliards par an</strong> vers le Maroc.
              RME Voyage fournit un taux de change indicatif et des estimations de coûts. Certains liens vers des prestataires peuvent être affiliés.
            </p>
          </div>
          <RemittanceComparator />
        </div>
      </section>

      {/* Spiritual & Services Section */}
      <section className="bg-[#f8fafc] py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#b45309]">En route</p>
            <h2 className="mt-3 text-4xl font-display font-semibold tracking-tight sm:text-5xl">Les repères qui comptent.</h2>
            <p className="mt-4 text-lg leading-8 text-[#475569]">
              Prières, Qibla, actualités Maroc et services pratiques pour un voyage serein.
            </p>
          </div>
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <PrayerWidget />
              <QiblaCompass />
            </div>
            <CurrencyConverter />
            <NewsFeed />
            <ServicesMap />
            <TravelChecklist />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#b45309]">Tout-en-un</p>
            <h2 className="mt-3 text-4xl font-display font-semibold tracking-tight sm:text-5xl">Un seul outil. Tout votre voyage.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-[#e2e8f0] p-6 card-hover">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#e0f2fe] text-[#0369a1]">
                  <Icon size={24} />
                </div>
                <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#475569]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0f1f3d] py-20">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <h2 className="text-4xl font-display font-semibold tracking-tight text-white sm:text-5xl">
            Partez du bon pied. Préparez maintenant.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Gratuit, sans inscription. Tous les outils essentiels pour voyager entre l'Europe et le Maroc.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#planifier" className="inline-flex items-center gap-2 rounded-full bg-[#f59e0b] px-6 py-3.5 font-extrabold text-[#0f1f3d] transition hover:bg-[#fde68a]">
              Tester l'application <ArrowRight size={18} />
            </a>
            <Link href="/guide" className="rounded-full border border-white/20 px-6 py-3.5 font-bold text-white transition hover:bg-white/10">
              Voir le guide
            </Link>
          </div>
        </div>
      </section>

      {/* Widgets Suite Section */}
      <section className="py-16 bg-gradient-to-b from-[#f8fafc] to-[#e2e8f0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#b45309]">Suite d'outils</p>
            <h2 className="mt-3 font-[family-name:var(--font-jakarta)] text-3xl font-extrabold tracking-tight text-[#0f1f3d] sm:text-4xl">
              15+ widgets intelligents dans une seule app
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#475569]">
              Hadak ne parle pas seulement — il agit. Chaque widget résout un problème réel de voyage entre l'Europe et le Maroc.
            </p>
          </div>

          {/* Weather + Calendar */}
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <WeatherMorocco />
            <MoroccanCalendar />
          </div>

          {/* Darija Phrasebook + Customs */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <DarijaPhrasebook />
            <CustomsCalculator />
          </div>

          {/* Emergency + Zakaat */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <EmergencyContacts />
            <ZakaatCalculator />
          </div>

          {/* TimeZone + Fuel */}
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <TimeZoneSIM />
            <FuelPriceComparator />
          </div>

          {/* Smart Packing */}
          <div className="mt-6">
            <SmartPacking />
          </div>

          {/* Faical Football Picks */}
          <div className="mt-6">
            <FaicalWidget />
          </div>

          {/* RME TV — discover official/public broadcasts without pretending to host rights-restricted streams */}
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-[#b45309]">RME TV</p>
                <h3 className="mt-1 text-2xl font-black tracking-tight text-[#0f1f3d]">Télévision, sport et direct au même endroit.</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">Retrouvez les chaînes et diffusions publiques ou officielles, sans reproduire les flux protégés.</p>
              </div>
              <Link href="/television" className="shrink-0 rounded-full bg-[#0f1f3d] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#1e3a5f]">
                Voir RME TV →
              </Link>
            </div>
            <div className="p-4 sm:p-5">
              <TVWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Boutiques & Services Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#b45309]">Boutiques & Services</p>
            <h2 className="mt-3 font-[family-name:var(--font-jakarta)] text-3xl font-extrabold tracking-tight text-[#0f1f3d] sm:text-4xl">
              Le Maroc jusqu'à votre porte
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#475569]">
              Caftans, traiteurs, mobilité et garages — des partenaires vérifiés de la France jusqu'au Maroc.
            </p>
          </div>

          <Reveal className="mt-12 grid gap-6 lg:grid-cols-2 lg:items-start">
            <MarwaCaftanWidget />
            <MouniaWidget />
          </Reveal>

          <Reveal className="mt-6" delay={80}>
            <ColisWidget />
          </Reveal>

          <Reveal className="mt-6" delay={80}>
            <ServicesProWidget />
          </Reveal>

          <div className="mt-10 text-center">
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 rounded-full bg-[#0f1f3d] px-7 py-3.5 font-extrabold text-white transition hover:bg-[#1e3a5f]"
            >
              Voir toute la Boutique <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <BookBanner />

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Footer */}
      <footer className="bg-[#080f28] px-5 py-12 text-white/65">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-lg font-black text-white">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f59e0b] text-sm text-[#0f1f3d]">R</span>
                RME Voyage
              </div>
              <p className="mt-3 text-sm">Votre compagnon de route entre l'Europe, le Maroc et les communautés du monde.</p>
            </div>
            <div>
              <h3 className="font-bold text-white">Navigation</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/" className="hover:text-white">Accueil</Link></li>
                <li><Link href="/guide" className="hover:text-white">Guide</Link></li>
                <li><Link href="/decouvrir" className="hover:text-white">Découvrir</Link></li>
                <li><Link href="/boutique" className="hover:text-white">Boutique ✨</Link></li>
                <li><Link href="/telecharger" className="hover:text-white">Télécharger</Link></li>
                <li><Link href="/soutenir" className="hover:text-white">Soutenir le projet 💛</Link></li>
                <li><a href="/rss.xml" className="hover:text-white">Flux RSS</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white">Fonctionnalités</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>Comparateur Transferts EUR→MAD</li>
                <li>Recherche de trajet</li>
                <li>Calculateur de budget</li>
                <li>Horaires de prière</li>
                <li>Direction Qibla</li>
                <li>Flux d'actualités Maroc</li>
                <li>Météo Maroc</li>
                <li>Phrasebook Darija</li>
                <li>Calculateur Douane</li>
                <li>SOS Ambassades</li>
                <li>Calendrier Marocain</li>
                <li>Calculateur Zakat</li>
                <li>Smart Packing IA</li>
                <li>Assistant Hadak IA</li>
                <li>Pronos de Faical ⚽</li>
                <li>TV Gratuite — 20+ chaînes</li>
                <li><Link href="/marwa-caftan" className="hover:text-white">Marwa Caftan — Location & Vente 👗</Link></li>
                <li>Traiteurs · Mobilité · Garages</li>
                <li>Colis &amp; Groupage Maroc 📦</li>
                <li><Link href="/belisamae" className="hover:text-white">Belisamae — Bien-être 🌿</Link></li>
                <li><Link href="/afarah-nassim" className="hover:text-white">Afarah Nassim — Traiteur 🍽️</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white">À propos</h3>
              <p className="mt-3 text-sm">Un projet Nova Presta — SAS de conseil en gestion et services aux entreprises.</p>
              <p className="mt-2 text-xs">MVP. Les données temps réel nécessitent des sources vérifiées.</p>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs">
            © 2026 RME Voyage — Nova Presta. Tous droits réservés.
          </div>
        </div>
      </footer>
      <HadakAI />
    </main>
  );
}
