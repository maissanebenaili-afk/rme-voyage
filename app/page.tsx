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
export default function Home() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f6f3ec] text-[#0f1f3d]">
      <SplashScreen />

      <div id="planifier" className="scroll-mt-0">
        <RouteSearch
          header={
            <nav aria-label="Principal" className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-5 py-4">
              <Link href="/" className="flex shrink-0 items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f59e0b] font-black text-[#0f1f3d]">R</span>
                <span className="text-base font-black tracking-tight text-white">RME <span className="font-medium text-[#fcd34d]">Voyage</span></span>
              </Link>
              <div className="flex items-center gap-1 text-white">
                <Link href="/guide" className="hidden rounded-full px-3 py-2 text-sm font-bold text-white/75 transition hover:bg-white/10 hover:text-white sm:block">Guide</Link>
                <LanguageSwitcher />
              </div>
            </nav>
          }
          title={
            <h1 className="font-display text-[2.6rem] font-semibold leading-none tracking-tight sm:text-6xl">
              Votre voyage<span className="sr-only"> au Maroc, étape par étape</span>
            </h1>
          }
          belowHero={<TripNav />}
        />
      </div>

      <div className="mx-auto max-w-2xl px-5 pb-16">
        <section id="route" aria-labelledby="cout-title" className="mt-14 scroll-mt-20">
          <StepHeader id="cout-title" step={3} title="Le coût" text="Un ordre de grandeur selon vos hypothèses. Une fois le trajet calculé, le carburant est compté pays par pays." />
          <TripDecisionEngine />
        </section>

        <section id="preparer" aria-labelledby="docs-title" className="mt-14 scroll-mt-20">
          <StepHeader id="docs-title" step={4} title="Documents et douane" text="Ce qu'il faut avoir avant de partir." />
          <div className="space-y-4">
            <TravelChecklist />
            <CustomsCalculator />
          </div>
        </section>

        <section id="meteo" aria-labelledby="meteo-title" className="mt-14 scroll-mt-20">
          <StepHeader id="meteo-title" step={5} title="La météo" text="À l'arrivée, ville par ville." />
          <WeatherMorocco />
        </section>

        <section id="services" aria-labelledby="services-title" className="mt-14 scroll-mt-20">
          <StepHeader id="services-title" title="À proximité" text="Services utiles et numéros d'urgence." />
          <div className="space-y-4">
            <ServicesMap />
            <EmergencyContacts />
          </div>
        </section>

        <section aria-labelledby="hadak-title" className="mt-12 rounded-3xl bg-[#0f1f3d] p-5 text-white">
          <h2 id="hadak-title" className="text-lg font-extrabold">Une question sur votre voyage ?</h2>
          <p className="mt-1 text-sm text-white/70">Hadak répond en français, darija, arabe, anglais ou espagnol.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: 'Quel ferry pour Tanger ?', msg: 'Ferry Algeciras Tanger' },
              { label: 'Combien de dirhams pour 100 € ?', msg: 'Combien vaut 100 euros en dirhams ?' },
              { label: 'Que dit la douane ?', msg: 'Quelle franchise douane au Maroc ?' },
            ].map(({ label, msg }) => (
              <button
                key={msg}
                type="button"
                onClick={() => askHadak(msg)}
                className="min-h-11 rounded-full bg-white/10 px-4 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20"
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        <section aria-labelledby="outils-title" className="mt-12">
          <h2 id="outils-title" className="font-display text-2xl font-semibold tracking-tight">Le reste, quand vous en avez besoin</h2>
          <div className="mt-4 space-y-3">
            <ToolDrawer id="maroc" icon="🕌" title="Prières et Qibla" text="Horaires, direction de La Mecque, actualités du Maroc">
              <DailyWidget />
              <PrayerWidget />
              <QiblaCompass />
              <MoroccanCalendar />
              <NewsFeed />
            </ToolDrawer>
            <ToolDrawer id="argent" icon="💶" title="Argent" text="Change, envois d'argent, zakat">
              <CurrencyConverter />
              <RemittanceComparator />
              <ZakaatCalculator />
            </ToolDrawer>
            <ToolDrawer id="sur-place" icon="📱" title="Sur place" text="Carte SIM, heure, darija, carburant">
              <TimeZoneSIM />
              <DarijaPhrasebook />
              <FuelPriceComparator />
              <SmartPacking />
            </ToolDrawer>
            <ToolDrawer id="sport-tv" icon="⚽" title="Sport et TV" text="Matchs, chaînes, analyses">
              <SportsHub />
              <FaicalWidget />
              <TVWidget />
            </ToolDrawer>
            <ToolDrawer id="boutique" icon="🛍️" title="Boutique et services" text="Caftans, traiteurs, colis, garages">
              <MarwaCaftanWidget />
              <MouniaWidget />
              <ColisWidget />
              <ServicesProWidget />
              <Link href="/boutique" className="inline-flex min-h-11 items-center rounded-full bg-[#0f1f3d] px-5 text-sm font-extrabold text-white">Voir toute la boutique →</Link>
            </ToolDrawer>
            <ToolDrawer id="partenaires" icon="🤝" title="Réserver" text="Vols, hôtels, voitures chez nos partenaires">
              {/* Public links first; PartnerComparison asks /api/partners for the
                  configured ones after hydration. */}
              <PartnerComparison partners={getPartnerCatalogue({})} />
            </ToolDrawer>
            <ToolDrawer id="nouvelles" icon="✉️" title="Rester informé" text="Les nouveautés de RME, et le livre de Tarek">
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
              </div>
              <p className="mt-3 text-sm">Votre compagnon de route entre l'Europe, le Maroc et les communautés du monde.</p>
            </div>
            <div>
              <h3 className="font-bold text-[#0f1f3d]">Navigation</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/" className="inline-block py-1.5 hover:text-[#0f1f3d]">Accueil</Link></li>
                <li><Link href="/guide" className="inline-block py-1.5 hover:text-[#0f1f3d]">Guide</Link></li>
                <li><Link href="/decouvrir" className="inline-block py-1.5 hover:text-[#0f1f3d]">Découvrir</Link></li>
                <li><Link href="/boutique" className="inline-block py-1.5 hover:text-[#0f1f3d]">Boutique ✨</Link></li>
                <li><Link href="/telecharger" className="inline-block py-1.5 hover:text-[#0f1f3d]">Télécharger</Link></li>
                <li><Link href="/soutenir" className="inline-block py-1.5 hover:text-[#0f1f3d]">Soutenir le projet 💛</Link></li>
                <li><a href="/rss.xml" className="inline-block py-1.5 hover:text-[#0f1f3d]">Flux RSS</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-[#0f1f3d]">Partenaires</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li><Link href="/marwa-caftan" className="inline-block py-1.5 hover:text-[#0f1f3d]">Marwa Caftan</Link></li>
                <li><Link href="/belisamae" className="inline-block py-1.5 hover:text-[#0f1f3d]">Belisamae</Link></li>
                <li><Link href="/afarah-nassim" className="inline-block py-1.5 hover:text-[#0f1f3d]">Afarah Nassim</Link></li>
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
