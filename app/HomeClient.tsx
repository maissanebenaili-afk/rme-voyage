'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import RouteSearch from '@/components/RouteSearch';
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
import StepHeader from '@/components/home/StepHeader';
import ToolDrawer from '@/components/home/ToolDrawer';
import TripNav from '@/components/home/TripNav';
import LiveNews from '@/components/home/LiveNews';
import { Bell, Coins, Handshake, MoonStar, ShoppingBag, Smartphone, Trophy } from 'lucide-react';
import MoroccoFlag from '@/components/MoroccoFlag';
import { useHomeText } from '@/lib/LanguageContext';

// Hadak et l'écran d'accueil embarquent framer-motion (~120 Ko). Aucun des
// deux n'apparaît dans le HTML serveur (le splash démarre masqué, Hadak ne
// s'ouvre qu'au clic) : on les charge après l'affichage de la page plutôt
// que dans le JavaScript initial de l'accueil.
const HadakAI = dynamic(() => import('@/components/HadakAI'), { ssr: false });
const SplashScreen = dynamic(() => import('@/components/SplashScreen'), { ssr: false });

const askHadak = (msg: string) => window.dispatchEvent(new CustomEvent('hadak:open-with-message', { detail: msg }));

/*
 * Accueil V2 : un voyageur ouvre RME, voit son voyage, puis une seule
 * prochaine étape. Les étapes suivent l'ordre du voyage (route, ferry, coût,
 * documents, météo, services) ; tout le reste est rangé dans des tiroirs
 * qui s'ouvrent sur place. Aucune logique métier ni source n'a changé : seuls
 * l'ordre et la présentation.
 */
export default function HomeClient() {
  const h = useHomeText();
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f6f3ec] text-[#0f1f3d]">
      <SplashScreen />

      <div id="planifier" className="scroll-mt-0">
        <RouteSearch
          header={
            <nav aria-label={h.navAria} className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-4">
              <Link href="/" className="flex shrink-0 items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f59e0b] font-black text-[#0f1f3d]">R</span>
                <span className="text-base font-black tracking-tight text-white">RME <span className="font-medium text-[#fcd34d]">Voyage</span></span>
                <MoroccoFlag />
              </Link>
              <div className="flex items-center gap-1 text-white">
                <Link href="/guide" className="hidden rounded-full px-3 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white sm:block">{h.guide}</Link>
                <LanguageSwitcher />
              </div>
            </nav>
          }
          title={
            <h1 className="font-display text-[2.6rem] font-semibold leading-none tracking-tight sm:text-6xl">
              {h.heroTitle}<span className="sr-only">{h.heroTitleSr}</span>
            </h1>
          }
          belowHero={<><TripNav /><LiveNews /></>}
        />
      </div>

      <div className="mx-auto max-w-2xl px-5 pb-16">
        <section id="route" aria-labelledby="cout-title" className="mt-14 scroll-mt-20">
          <StepHeader id="cout-title" step={3} title={h.costTitle} text={h.costText} />
          <TripDecisionEngine />
        </section>

        <section id="preparer" aria-labelledby="docs-title" className="mt-14 scroll-mt-20">
          <StepHeader id="docs-title" step={4} title={h.docsTitle} text={h.docsText} />
          <div className="space-y-4">
            <TravelChecklist />
            <CustomsCalculator />
          </div>
        </section>

        <section id="meteo" aria-labelledby="meteo-title" className="mt-14 scroll-mt-20">
          <StepHeader id="meteo-title" step={5} title={h.weatherTitle} text={h.weatherText} />
          <WeatherMorocco />
        </section>

        <section id="services" aria-labelledby="services-title" className="mt-14 scroll-mt-20">
          <StepHeader id="services-title" title={h.nearbyTitle} text={h.nearbyText} />
          <div className="space-y-4">
            <ServicesMap />
            <EmergencyContacts />
          </div>
        </section>

        <section aria-labelledby="hadak-title" className="mt-12 rounded-3xl bg-[#0f1f3d] p-5 text-white">
          <h2 id="hadak-title" className="text-lg font-extrabold">{h.hadakTitle}</h2>
          <p className="mt-1 text-sm text-white/70">{h.hadakText}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[h.hadakQ1, h.hadakQ2, h.hadakQ3].map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => askHadak(question)}
                className="min-h-11 rounded-full bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20"
              >
                {question}
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="outils-title" className="mt-12">
          <h2 id="outils-title" className="font-display text-2xl font-semibold tracking-tight">{h.toolsTitle}</h2>
          <div className="mt-4 space-y-3">
            <ToolDrawer id="maroc" icon={<MoonStar size={20} />} title={h.drawerFaithTitle} text={h.drawerFaithText}>
              <DailyWidget />
              <PrayerWidget />
              <QiblaCompass />
              <MoroccanCalendar />
              <NewsFeed />
            </ToolDrawer>
            <ToolDrawer id="argent" icon={<Coins size={20} />} title={h.drawerMoneyTitle} text={h.drawerMoneyText}>
              <CurrencyConverter />
              <RemittanceComparator />
              <ZakaatCalculator />
            </ToolDrawer>
            <ToolDrawer id="sur-place" icon={<Smartphone size={20} />} title={h.drawerLocalTitle} text={h.drawerLocalText}>
              <TimeZoneSIM />
              <DarijaPhrasebook />
              <FuelPriceComparator />
              <SmartPacking />
            </ToolDrawer>
            <ToolDrawer id="sport-tv" icon={<Trophy size={20} />} title={h.drawerSportTitle} text={h.drawerSportText}>
              <SportsHub />
              <FaicalWidget />
              <TVWidget />
            </ToolDrawer>
            <ToolDrawer id="boutique" icon={<ShoppingBag size={20} />} title={h.drawerShopTitle} text={h.drawerShopText}>
              <MarwaCaftanWidget />
              <MouniaWidget />
              <ColisWidget />
              <ServicesProWidget />
              <Link href="/boutique" className="inline-flex min-h-11 items-center rounded-full bg-[#0f1f3d] px-5 text-sm font-extrabold text-white">{h.shopAll}</Link>
            </ToolDrawer>
            <ToolDrawer id="partenaires" icon={<Handshake size={20} />} title={h.drawerBookTitle} text={h.drawerBookText}>
              {/* Public links first; PartnerComparison asks /api/partners for the
                  configured ones after hydration. */}
              <PartnerComparison partners={getPartnerCatalogue({})} />
            </ToolDrawer>
            <ToolDrawer id="nouvelles" icon={<Bell size={20} />} title={h.drawerNewsTitle} text={h.drawerNewsText}>
              <NewsletterSection />
              <BookBanner />
            </ToolDrawer>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-black/5 bg-[#efebe2] px-5 py-12 text-[#475569]">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 text-lg font-black text-[#0f1f3d]">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f59e0b] text-sm text-[#0f1f3d]">R</span>
                RME Voyage
                <MoroccoFlag className="h-5 w-7" />
              </div>
              <p className="mt-3 text-sm">{h.footerTagline}</p>
            </div>
            <div>
              <h3 className="font-bold text-[#0f1f3d]">{h.footerNav}</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/" className="inline-block py-1.5 hover:text-[#0f1f3d]">{h.footerHome}</Link></li>
                <li><Link href="/guide" className="inline-block py-1.5 hover:text-[#0f1f3d]">{h.guide}</Link></li>
                <li><Link href="/trajet" className="inline-block py-1.5 hover:text-[#0f1f3d]">{h.footerRoutes}</Link></li>
                <li><Link href="/decouvrir" className="inline-block py-1.5 hover:text-[#0f1f3d]">{h.footerDiscover}</Link></li>
                <li><Link href="/boutique" className="inline-block py-1.5 hover:text-[#0f1f3d]">{h.footerShop}</Link></li>
                <li><Link href="/kit-retour" className="inline-block py-1.5 hover:text-[#0f1f3d]">{h.footerKit}</Link></li>
                <li><Link href="/outils-papiers" className="inline-block py-1.5 hover:text-[#0f1f3d]">{h.footerPapers}</Link></li>
                <li><Link href="/telecharger" className="inline-block py-1.5 hover:text-[#0f1f3d]">{h.footerDownload}</Link></li>
                <li><Link href="/soutenir" className="inline-block py-1.5 hover:text-[#0f1f3d]">{h.footerSupport}</Link></li>
                <li><Link href="/boutique#livre" className="inline-block py-1.5 hover:text-[#0f1f3d]">{h.footerBook}</Link></li>
                <li><a href="/rss.xml" className="inline-block py-1.5 hover:text-[#0f1f3d]">{h.footerRss}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[#0f1f3d]">{h.footerPartners}</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/marwa-caftan" className="inline-block py-1.5 hover:text-[#0f1f3d]">Marwa Caftan</Link></li>
                <li><Link href="/belisamae" className="inline-block py-1.5 hover:text-[#0f1f3d]">Belisamae</Link></li>
                <li><Link href="/afarah-nassim" className="inline-block py-1.5 hover:text-[#0f1f3d]">Afarah Nassim</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[#0f1f3d]">{h.footerAbout}</h3>
              <p className="mt-3 text-sm">{h.footerAboutText}</p>
              <p className="mt-2 text-xs">{h.footerMvp}</p>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs">
            <p>© 2026 RME Voyage — Nova Presta. {h.footerRights}</p>
            <p className="mt-2">
              <a href="/api/legal/privacy" className="underline hover:text-[#0f1f3d]">{h.footerPrivacy}</a>
              {" · "}
              <a href="/api/legal/terms" className="underline hover:text-[#0f1f3d]">{h.footerTerms}</a>
            </p>
          </div>
        </div>
      </footer>
      <HadakAI />
    </main>
  );
}
