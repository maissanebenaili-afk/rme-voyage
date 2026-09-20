import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import MarwaCaftanWidget from '@/components/MarwaCaftanWidget';
import MouniaWidget from '@/components/MouniaWidget';
import ServicesProWidget from '@/components/ServicesProWidget';
import ColisWidget from '@/components/ColisWidget';
import BookBanner from '@/components/BookBanner';
import Reveal from '@/components/Reveal';
import InspirationImage from '@/components/InspirationImage';
import { INSPIRATION_IMAGES } from '@/lib/inspirationImages';

const RUBRIQUES = [
  { href: '#caftan', label: '👗 Caftans' },
  { href: '#bienetre', label: '🌿 Bien-être' },
  { href: '#colis', label: '📦 Colis' },
  { href: '#services', label: '🔧 Services' },
];

export default function BoutiquePage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f8fafc]">
      <header className="relative overflow-hidden bg-[#0f1f3d] px-5 pb-16 pt-6 text-white sm:px-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#c9903a]/20 blur-3xl" />

        <div className="mx-auto max-w-6xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-white/60 transition hover:text-white"
          >
            <ArrowLeft size={14} /> Retour à l&apos;accueil
          </Link>

          <div className="relative mt-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#c9903a]/40 bg-[#c9903a]/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-[.16em] text-[#fde68a]">
              <Sparkles size={11} /> La Boutique
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold tracking-tight sm:text-6xl">
              Nos partenaires,
              <br />
              <span className="text-[#f59e0b]">de la France au Maroc.</span>
            </h1>
            <p className="mt-5 text-lg leading-8 text-white/65">
              Des espaces pour découvrir des professionnels et prendre contact. Caftans, bien-être,
              traiteurs, colis et mobilité — les informations de chaque fiche sont confirmées avec
              le professionnel concerné.
            </p>
          </div>

          <nav aria-label="Rubriques" className="relative mt-8 flex flex-wrap gap-2.5">
            {RUBRIQUES.map((r) => (
              <a
                key={r.href}
                href={r.href}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/80 transition hover:border-[#c9903a]/50 hover:bg-[#c9903a]/15 hover:text-white"
              >
                {r.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <section id="caftan" className="scroll-mt-6 bg-white py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#b45309]">
              Mode &amp; cérémonie
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#0f1f3d] sm:text-4xl">
              Le caftan, sans l&apos;acheter.
            </h2>
            <p className="mt-3 max-w-2xl text-[#475569]">
              Explorez des styles pour un mariage ou une soirée, puis demandez les modalités
              directement au partenaire.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
            <div className="rounded-3xl border border-[#e2d5c0] bg-[#f7f1e7] p-6 text-[#0f1f3d]">
              <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#b45309]">
                Marwa Caftan
              </p>
              <p className="mt-3 text-sm leading-6 text-[#64748b]">
                Les styles, modèles et disponibilités sont présentés à titre indicatif et confirmés directement avec le partenaire.
              </p>
              <p className="mt-4 text-xs font-semibold text-[#8a6a3c]">
                Photos d’inspiration — modèles non contractuels.
              </p>
            </div>
            <Reveal delay={90}>
              <MarwaCaftanWidget />
            </Reveal>
          </div>
        </div>
      </section>

      <section id="bienetre" className="scroll-mt-6 bg-[#f7f6f2] py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#40634f]">
              Bien-être
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#2f3a33] sm:text-4xl">
              Souffler, avant et après la route.
            </h2>
            <p className="mt-3 max-w-2xl text-[#5d6a60]">
              Un accompagnement énergétique pour traverser les périodes de fatigue, de stress ou de
              transition — en cabinet comme à distance.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
            <InspirationImage
              image={INSPIRATION_IMAGES.wellness}
              caption="Photo d’ambiance — elle ne représente pas une prestation Belisamae."
            />
            <Reveal delay={90}>
              <MouniaWidget />
            </Reveal>
          </div>
        </div>
      </section>

      <section id="colis" className="scroll-mt-6 bg-[#f8fafc] py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#b45309]">
              Nouveau
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#0f1f3d] sm:text-4xl">
              Envoyez au bled sans prendre la route.
            </h2>
            <p className="mt-3 max-w-2xl text-[#475569]">
              Cartons, électroménager, mobilier : découvrez les options prévues pour l&apos;envoi
              vers le Maroc et demandez les conditions au professionnel concerné.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
            <InspirationImage
              image={INSPIRATION_IMAGES.delivery}
              caption="Illustration d’ambiance — elle ne représente pas un transporteur partenaire."
            />
            <Reveal delay={90}>
              <ColisWidget />
            </Reveal>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-6 bg-white py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#b45309]">
              Sur la route
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#0f1f3d] sm:text-4xl">
              Traiteurs, mobilité, garages.
            </h2>
            <p className="mt-3 max-w-2xl text-[#475569]">
              Des catégories de services pour découvrir les profils publiés et contacter les
              professionnels disponibles.
            </p>
          </Reveal>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
            <InspirationImage
              image={INSPIRATION_IMAGES.services}
              caption="Photo d’ambiance — elle ne représente pas un professionnel référencé."
            />
            <Reveal delay={90}>
              <ServicesProWidget />
            </Reveal>
          </div>
        </div>
      </section>

      <BookBanner />

      <section className="bg-[#0f1f3d] py-16">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Vous êtes professionnel ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/65">
            Caftans, traiteur, transport, garage, bien-être : rejoignez l&apos;annuaire et touchez
            des voyageurs et familles MRE à la recherche de services adaptés.
          </p>
          <a
            href="mailto:pro@rme-voyage.com?subject=Rejoindre%20la%20Boutique%20RME%20Voyage"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#f59e0b] px-7 py-3.5 font-extrabold text-[#0f1f3d] transition hover:bg-[#fde68a]"
          >
            Rejoindre l&apos;annuaire
          </a>
        </div>
      </section>
    </main>
  );
}
