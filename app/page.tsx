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
} from 'lucide-react';
import RouteSearch from '@/components/RouteSearch';
import CostCalculator from '@/components/CostCalculator';
import PrayerWidget from '@/components/PrayerWidget';
import ServicesMap from '@/components/ServicesMap';
import NewsFeed from '@/components/NewsFeed';
import QiblaCompass from '@/components/QiblaCompass';
import TravelChecklist from '@/components/TravelChecklist';
import CurrencyConverter from '@/components/CurrencyConverter';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import HadakAI from '@/components/HadakAI';
import { WeatherMorocco, DarijaPhrasebook, CustomsCalculator, EmergencyContacts, MoroccanCalendar, ZakaatCalculator, TimeZoneSIM, FuelPriceComparator } from '@/components/TravelWidgets';
import SmartPacking from '@/components/SmartPacking';
import JuryPack from '@/components/JuryPack';

const benefits = [
  { icon: MapPinned, title: 'Votre itinéraire', text: 'Préparez chaque étape, de votre ville à votre destination au Maroc.' },
  { icon: Compass, title: 'Vos options', text: 'Route, ferry et vol comparés dans un seul parcours.' },
  { icon: ShieldCheck, title: 'Vos repères', text: 'Prières, Qibla, services et conseils pour voyager sereinement.' },
];

const stats = [
  { value: '5M+', label: 'Marocains à l\'étranger', icon: Users },
  { value: '19.8M', label: 'Touristes au Maroc (2025)', icon: Globe },
  { value: '2 100', label: 'km Paris → Tanger', icon: RouteIcon },
  { value: '4.9★', label: 'Objectif qualité', icon: Star },
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
    <main id="main-content" tabIndex={-1} className="min-h-screen overflow-hidden bg-[#f8f7f2] text-[#173a36]">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-[#0d3f38] text-white">
        {/* Background decorations */}
        <div className="absolute -right-20 -top-24 -z-10 h-96 w-96 rounded-full bg-[#eead59]/20 blur-3xl" />
        <div className="absolute -bottom-36 left-1/4 -z-10 h-72 w-72 rounded-full bg-[#4cc3ac]/15 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 -z-10 h-64 w-64 rounded-full bg-[#d9824b]/10 blur-3xl" />

        {/* Navigation */}
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-5 sm:px-8 sm:py-6">
          <Link href="/" className="flex shrink-0 items-center gap-2 text-base font-black tracking-tight sm:text-lg">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-[#e6a44e] text-sm text-[#103d37] sm:h-10 sm:w-10">R</span>
            <span className="whitespace-nowrap">RME <span className="font-medium text-[#f5cd93]">Voyage</span></span>
          </Link>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <LanguageSwitcher />
            <Link href="/guide" className="hidden text-sm font-bold text-white/80 hover:text-white sm:inline">Le guide</Link>
            <Link href="/decouvrir" className="hidden text-sm font-bold text-white/80 hover:text-white sm:inline">Découvrir</Link>
            <a href="#planifier" className="shrink-0 whitespace-nowrap rounded-full bg-white px-3 py-2 text-xs font-extrabold text-[#0d3f38] transition hover:bg-[#f5cd93] sm:px-4 sm:text-sm">Planifier</a>
          </div>
        </nav>

        {/* Hero content */}
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:pb-28 lg:pt-20">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.16em] text-[#f5cd93]">
              <Sparkles size={14} /> Europe · Maroc · Diaspora
            </p>
            <h1 className="mt-6 max-w-3xl text-5xl font-display font-semibold leading-[.96] tracking-tight sm:text-7xl">
              Le voyage commence <span className="gradient-text-gold">bien avant le départ.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/75">
              RME Voyage réunit itinéraire, budget, prières, Qibla et services dans une expérience claire,
              pensée pour les familles qui voyagent entre l'Europe, le Maroc et au-delà.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#planifier" className="inline-flex items-center gap-2 rounded-full bg-[#e6a44e] px-6 py-3.5 font-extrabold text-[#103d37] shadow-lg shadow-black/20 transition hover:bg-[#f5cd93]">
                Préparer mon voyage <ArrowRight size={18} />
              </a>
              <Link href="/decouvrir" className="rounded-full border border-white/20 px-6 py-3.5 font-bold text-white transition hover:bg-white/10">
                Découvrir le service
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold text-white/70">
              <span className="inline-flex items-center gap-2"><BadgeCheck size={17} className="text-[#f2b963]" /> Gratuit à utiliser</span>
              <span className="inline-flex items-center gap-2"><BadgeCheck size={17} className="text-[#f2b963]" /> Liens partenaires signalés</span>
              <span className="inline-flex items-center gap-2"><BadgeCheck size={17} className="text-[#f2b963]" /> Prières & Qibla inclus</span>
            </div>
          </div>

          {/* Hero card */}
          <div className="relative mx-auto w-full max-w-md animate-scale-in delay-300">
            <div className="absolute inset-0 rotate-3 rounded-[2.25rem] bg-[#e6a44e]" />
            <div className="relative rounded-[2.25rem] border border-white/10 bg-[#153f39] p-7 shadow-2xl sm:p-9">
              <p className="text-sm font-bold text-[#f5cd93]">Votre carnet de voyage</p>
              <h2 className="mt-3 text-3xl font-display font-semibold leading-tight">Un parcours simple. Des décisions plus sereines.</h2>
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f5cd93] font-black text-[#103d37]">1</span>
                  <div><p className="text-xs text-white/60">Avant le départ</p><p className="font-bold">Itinéraire et budget</p></div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#73c8b4] font-black text-[#103d37]">2</span>
                  <div><p className="text-xs text-white/60">Sur la route</p><p className="font-bold">Prières, Qibla et services</p></div>
                </div>
                <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d9824b] font-black text-white">3</span>
                  <div><p className="text-xs text-white/60">À l'arrivée</p><p className="font-bold">Checklist et conseils</p></div>
                </div>
              </div>
              <p className="mt-7 border-t border-white/10 pt-5 text-sm leading-6 text-white/65">
                Pensé mobile, lisible et utile, quel que soit votre point de départ.
              </p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/10 bg-black/20">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-5 py-6 sm:px-8 md:grid-cols-4">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon size={24} className="text-[#f5cd93]" />
                <div>
                  <div className="text-xl font-black text-white">{value}</div>
                  <div className="text-xs text-white/60">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-b border-[#dce3dc] bg-white py-8">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:grid-cols-3 sm:px-8">
          {benefits.map(({ icon: Icon, title, text }) => (
            <article key={title} className="flex gap-4 card-hover">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e9f1ed] text-[#0d6255]">
                <Icon size={21} />
              </span>
              <div>
                <h2 className="font-extrabold">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-[#5a716c]">{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Planning Section */}
      <section id="planifier" className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
        <div className="mb-10 max-w-2xl animate-fade-up">
          <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#a84f2b]">Préparez sereinement</p>
          <h2 className="mt-3 text-4xl font-display font-semibold tracking-tight sm:text-5xl">L'essentiel, au bon moment.</h2>
          <p className="mt-4 text-lg leading-8 text-[#5a716c]">
            Commencez par votre trajet, puis ajustez votre budget avant de comparer vos options.
          </p>
        </div>
        <div className="space-y-6">
          <RouteSearch />
          <CostCalculator />
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-[#e8efe7] py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#a84f2b]">Visualisez</p>
            <h2 className="mt-3 text-4xl font-display font-semibold tracking-tight sm:text-5xl">Votre trajet sur la carte.</h2>
            <p className="mt-4 text-lg leading-8 text-[#5a716c]">
              Du départ en Europe à l'arrivée au Maroc, visualisez chaque étape de votre voyage.
            </p>
          </div>
          {/* Interactive map available in production with Vercel */}
        </div>
      </section>

      {/* Spiritual & Services Section */}
      <section className="bg-[#f8f7f2] py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#a84f2b]">En route</p>
            <h2 className="mt-3 text-4xl font-display font-semibold tracking-tight sm:text-5xl">Les repères qui comptent.</h2>
            <p className="mt-4 text-lg leading-8 text-[#5a716c]">
              Prières, Qibla, services et conseils pratiques pour un voyage serein.
            </p>
          </div>
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <PrayerWidget />
              <QiblaCompass />
            </div>
            <CurrencyConverter />
            <ServicesMap />
            <NewsFeed />
            <TravelChecklist />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#a84f2b]">Tout-en-un</p>
            <h2 className="mt-3 text-4xl font-display font-semibold tracking-tight sm:text-5xl">Un seul outil. Tout votre voyage.</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-[#dce3dc] p-6 card-hover">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-[#e9f1ed] text-[#0d6255]">
                  <Icon size={24} />
                </div>
                <h3 className="mt-4 text-lg font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5a716c]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0d3f38] py-20">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <h2 className="text-4xl font-display font-semibold tracking-tight text-white sm:text-5xl">
            Prêt à organiser votre voyage ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">
            Accédez à RME Voyage et commencez votre préparation dès maintenant. Gratuit.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="#planifier" className="inline-flex items-center gap-2 rounded-full bg-[#e6a44e] px-6 py-3.5 font-extrabold text-[#103d37] transition hover:bg-[#f5cd93]">
              Commencer gratuitement <ArrowRight size={18} />
            </a>
            <Link href="/guide" className="rounded-full border border-white/20 px-6 py-3.5 font-bold text-white transition hover:bg-white/10">
              Voir le guide
            </Link>
          </div>
        </div>
      </section>

      {/* Widgets Suite Section */}
      <section className="py-16 bg-gradient-to-b from-[#f8f7f2] to-[#e8e6df]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-[#8f5b08]">Suite d'outils</p>
            <h2 className="mt-3 font-[family-name:var(--font-jakarta)] text-3xl font-extrabold tracking-tight text-[#173a36] sm:text-4xl">
              15+ widgets intelligents dans une seule app
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5a716c]">
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
        </div>
      </section>

      {/* Jury Pack Section */}
      <JuryPack />

      {/* Footer */}
      <footer className="bg-[#0a2e28] px-5 py-12 text-white/65">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-lg font-black text-white">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e6a44e] text-sm text-[#103d37]">R</span>
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
                <li><Link href="/telecharger" className="hover:text-white">Télécharger</Link></li>
                <li><a href="/rss.xml" className="hover:text-white">Flux RSS</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white">Fonctionnalités</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li>Recherche de trajet</li>
                <li>Calculateur de budget</li>
                <li>Horaires de prière</li>
                <li>Direction Qibla</li>
                <li>Météo Maroc</li>
                <li>Phrasebook Darija</li>
                <li>Calculateur Douane</li>
                <li>SOS Ambassades</li>
                <li>Calendrier Marocain</li>
                <li>Calculateur Zakat</li>
                <li>Prix Carburant</li>
                <li>Smart Packing IA</li>
                <li>Assistant Hadak IA</li>
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
