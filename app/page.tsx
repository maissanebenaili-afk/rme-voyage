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
import RouteJourney from '@/components/RouteJourney';
import SplashScreen from '@/components/SplashScreen';
import TravelHub from '@/components/TravelHub';
import TripDecisionEngine from '@/components/TripDecisionEngine';
import PrayerWidget from '@/components/PrayerWidget';
import ServicesMap from '@/components/ServicesMap';
import NewsFeed from '@/components/NewsFeed';
import QiblaCompass from '@/components/QiblaCompass';
import TravelChecklist from '@/components/TravelChecklist';
import CurrencyConverter from '@/components/CurrencyConverter';
import RemittanceComparator from '@/components/RemittanceComparator';
import PartnerComparison from '@/components/PartnerComparison';
import { getPartnerCatalogue } from "@/lib/partnerCatalogue";
import LanguageSwitcher from '@/components/LanguageSwitcher';
import HadakAI from '@/components/HadakAI';
import DailyWidget from '@/components/DailyWidget';
import { WeatherMorocco, DarijaPhrasebook, CustomsCalculator, EmergencyContacts, MoroccanCalendar, ZakaatCalculator, TimeZoneSIM, FuelPriceComparator } from '@/components/TravelWidgets';
import SmartPacking from '@/components/SmartPacking';
import NewsletterSection from '@/components/NewsletterSection';
import FaicalWidget from '@/components/FaicalWidget';
import SportsHub from '@/components/SportsHub';
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
    <main id="main-content" tabIndex={-1} className="min-h-screen overflow-hidden bg-[#eef1f6] text-[#1e293b]">
      <SplashScreen />

      {/* Hero — the planner itself, not a pitch. Someone who has never heard
          of RME Voyage sees, in one glance: enter your two cities, get your
          route/ferry/cost. Waze-style "map first" rather than a headline you
          have to read before you can act. Muted blue-gray surface with just
          a whisper of warm horizon tone at the base — navy carries the
          structure (nav, borders, headings), not a bright full-bleed wash. */}
      <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#eef6f1] via-[#eef1ec] to-[#e6dfc9] text-[#0f1f3d]">
        <div className="absolute -top-24 right-[-10%] -z-10 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,.14),transparent_70%)] blur-2xl" />
        <div className="absolute -bottom-16 left-[-8%] -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(35,122,84,.14),transparent_70%)] blur-2xl" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-16 bg-gradient-to-t from-[#f59e0b]/10 to-transparent" />

        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0f1f3d] font-black text-[#f59e0b] shadow-lg shadow-[#0f1f3d]/20">R</span>
            <span className="text-base font-black tracking-tight sm:text-lg">RME <span className="font-medium text-[#b45309]">Voyage</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/guide" className="hidden rounded-full px-3 py-2 text-sm font-bold text-[#334155] transition hover:bg-[#0f1f3d]/5 hover:text-[#0f1f3d] sm:block">Guide</Link>
            <Link href="/decouvrir" className="hidden rounded-full px-3 py-2 text-sm font-bold text-[#334155] transition hover:bg-[#0f1f3d]/5 hover:text-[#0f1f3d] sm:block">Découvrir</Link>
            <LanguageSwitcher />
          </div>
        </nav>

        <div id="planifier" className="mx-auto max-w-5xl px-4 pb-12 pt-2 sm:px-8 sm:pb-16">
          <div className="animate-fade-up text-center">
            <h1 className="text-3xl font-display font-semibold leading-tight tracking-tight sm:text-5xl">
              Où voulez-vous aller <span className="gradient-text-gold">au Maroc ?</span>
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-[#475569] sm:text-base">
              Entrez vos deux villes : itinéraire, ferry et budget en un instant.
            </p>
          </div>

          <div className="mt-6 animate-scale-in">
            <RouteSearch />
            <RouteJourney />
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-bold text-[#475569]">
            <span className="inline-flex items-center gap-1.5"><BadgeCheck size={15} className="text-[#b45309]" /> Gratuit</span>
            <span className="inline-flex items-center gap-1.5"><BadgeCheck size={15} className="text-[#b45309]" /> Sans inscription</span>
            <span className="inline-flex items-center gap-1.5"><BadgeCheck size={15} className="text-[#b45309]" /> Pensé mobile</span>
          </div>
        </div>
      </section>

      <TravelHub />

      {/* Coût — juste après le trajet : DESTINATION → TRAJET → COÛT. Vert
          Atlas pâle plutôt que gris neutre : une section qu'on identifie
          d'un coup d'œil, un peu de couleur au lieu du "tout blanc". */}
      <section id="route" className="scroll-mt-4 border-b border-slate-200 bg-atlas-100 py-10">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <TripDecisionEngine />
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
      <section className="border-y border-amber-100 bg-amber-50/50 py-12">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f59e0b]">
                <Sparkles size={22} className="text-[#0f1f3d]" />
              </div>
              <div className="text-left">
                <p className="text-xl font-extrabold text-[#0f1f3d] tracking-tight">Hadak AI</p>
                <p className="text-xs text-[#92400e] font-semibold">Ton assistant voyage MRE</p>
              </div>
            </div>
            <p className="text-[#334155] text-base max-w-lg">
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
                  className="rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-[#92400e] transition hover:bg-amber-100 hover:border-amber-400"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Spiritual & Services Section — léger violet Jacaranda, comme le vert
          Atlas plus haut : une section de plus qui se repère d'un regard. */}
      <section id="maroc" className="scroll-mt-4 bg-jacaranda-50 py-20">
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
            <div id="preparer" className="scroll-mt-4">
              <TravelChecklist />
            </div>
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
      <section className="border-y border-slate-200 bg-white py-20">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <h2 className="text-4xl font-display font-semibold tracking-tight text-[#0f1f3d] sm:text-5xl">
            Partez du bon pied. Préparez maintenant.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#334155]">
            Gratuit, sans inscription. Tous les outils essentiels pour voyager entre l'Europe et le Maroc.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#planifier" className="inline-flex items-center gap-2 rounded-full bg-[#f59e0b] px-6 py-3.5 font-extrabold text-[#0f1f3d] transition hover:bg-[#fde68a]">
              Tester l'application <ArrowRight size={18} />
            </a>
            <Link href="/guide" className="rounded-full border border-slate-300 px-6 py-3.5 font-bold text-[#0f1f3d] transition hover:bg-slate-50">
              Voir le guide
            </Link>
          </div>
        </div>
      </section>

      {/* Widgets Suite Section */}
      <section className="py-16 bg-gradient-to-b from-[#f5f7fa] to-[#e2e8f0]">
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

          {/* RME Sport — unified match hub */}
          <div id="sport-tv" className="mt-6 scroll-mt-4"><SportsHub /></div>

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
            </div>
            <div className="p-4 sm:p-5">
              <TVWidget />
            </div>
          </div>
        </div>
      </section>

      {/* Boutiques & Services Section */}
      <section id="services" className="scroll-mt-4 py-16 bg-white">
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

      {/* Monétisation & transferts — étape commerciale finale, après voyage, outils et services. */}
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


      {/* Affiliate Comparison — one neutral marketplace layer for every travel vertical */}
      <section className="bg-slate-50 py-12">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <PartnerComparison partners={getPartnerCatalogue()} />
        </div>
      </section>


      <BookBanner />

      {/* Newsletter Section */}
      <NewsletterSection />

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 px-5 py-12 text-[#475569]">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-lg font-black text-[#0f1f3d]">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f59e0b] text-sm text-[#0f1f3d]">R</span>
                RME Voyage
              </div>
              <p className="mt-3 text-sm">Votre compagnon de route entre l'Europe, le Maroc et les communautés du monde.</p>
            </div>
            <div>
              <h3 className="font-bold text-[#0f1f3d]">Navigation</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/" className="hover:text-[#0f1f3d]">Accueil</Link></li>
                <li><Link href="/guide" className="hover:text-[#0f1f3d]">Guide</Link></li>
                <li><Link href="/decouvrir" className="hover:text-[#0f1f3d]">Découvrir</Link></li>
                <li><Link href="/boutique" className="hover:text-[#0f1f3d]">Boutique ✨</Link></li>
                <li><Link href="/telecharger" className="hover:text-[#0f1f3d]">Télécharger</Link></li>
                <li><Link href="/soutenir" className="hover:text-[#0f1f3d]">Soutenir le projet 💛</Link></li>
                <li><a href="/rss.xml" className="hover:text-[#0f1f3d]">Flux RSS</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[#0f1f3d]">Fonctionnalités</h3>
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
                <li>Smart Packing</li>
                <li>Assistant Hadak IA</li>
                <li>Pronos de Faical ⚽</li>
                <li>TV Gratuite — 20+ chaînes</li>
                <li><Link href="/marwa-caftan" className="hover:text-[#0f1f3d]">Marwa Caftan — Location & Vente 👗</Link></li>
                <li>Traiteurs · Mobilité · Garages</li>
                <li>Colis &amp; Groupage Maroc 📦</li>
                <li><Link href="/belisamae" className="hover:text-[#0f1f3d]">Belisamae — Bien-être 🌿</Link></li>
                <li><Link href="/afarah-nassim" className="hover:text-[#0f1f3d]">Afarah Nassim — Traiteur 🍽️</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[#0f1f3d]">À propos</h3>
              <p className="mt-3 text-sm">Un projet Nova Presta — SAS de conseil en gestion et services aux entreprises.</p>
              <p className="mt-2 text-xs">MVP. Les données temps réel nécessitent des sources vérifiées.</p>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs">
            <p>© 2026 RME Voyage — Nova Presta. Tous droits réservés.</p>
            <p className="mt-2">
              <a href="/api/legal/privacy" className="underline hover:text-[#0f1f3d]">Confidentialité</a>
              {" · "}
              <a href="/api/legal/terms" className="underline hover:text-[#0f1f3d]">Conditions d&apos;utilisation</a>
            </p>
          </div>
        </div>
      </footer>
      <HadakAI />
    </main>
  );
}
