import Link from 'next/link';
import {
  ArrowLeft, CalendarCheck, Phone, ExternalLink, Sparkles, Leaf, Home, Heart,
} from 'lucide-react';
import { BELISAMAE_PHONE, BELISAMAE_URL } from '@/lib/partners';

const ACCOMPAGNEMENTS = [
  {
    icon: Sparkles,
    nom: 'Bioénergie',
    desc: 'Un travail sur les tensions qui se sont installées avec le temps : fatigue persistante, charge mentale, sensation d\'être bloqué. La séance vise à relancer ce qui s\'est figé.',
  },
  {
    icon: Heart,
    nom: 'Reiki',
    desc: 'Une approche douce, par apposition des mains, pour apaiser les blessures émotionnelles et retrouver du calme. Particulièrement indiquée dans les périodes de deuil, de séparation ou de transition.',
  },
  {
    icon: Home,
    nom: 'Géobiologie',
    desc: 'L\'étude du lieu de vie lui-même : sommeil perturbé, malaise diffus dans une pièce, impression que rien ne va depuis l\'emménagement. L\'analyse porte sur l\'habitat et son environnement.',
  },
];

const DEROULE = [
  { n: 1, t: 'Premier échange', d: 'On fait le point sur ce qui vous amène, sans engagement.' },
  { n: 2, t: 'La séance', d: 'En cabinet ou à distance, dans un temps entièrement consacré à vous.' },
  { n: 3, t: 'Après', d: 'Des repères pour prolonger le travail chez vous, et un suivi si besoin.' },
];

export default function BelisamaePage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f7f6f2]">
      <header className="relative overflow-hidden px-5 pb-20 pt-6 sm:px-8">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#40634f]/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 top-40 h-72 w-72 rounded-full bg-[#c8d5c8]/30 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5b665c] transition hover:text-[#2f3a33]"
          >
            <ArrowLeft size={14} /> La Boutique
          </Link>

          <div className="mt-14 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-[#dde5dd]">
              <Leaf size={20} className="text-[#40634f]" />
            </div>
            <div>
              <p className="font-display text-xl font-semibold tracking-tight text-[#2f3a33]">
                Belisamae
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#5b665c]">
                Énergéticienne · Reiki · Géobiologie
              </p>
            </div>
          </div>

          <h1 className="mt-10 font-display text-4xl font-normal italic leading-tight tracking-tight text-[#2f3a33] sm:text-6xl">
            Se libérer. Comprendre. Avancer.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5d6a60]">
            Un accompagnement énergétique personnalisé pour traverser les moments de mal-être,
            apaiser les blessures émotionnelles et retrouver un équilibre intérieur.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href={BELISAMAE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#40634f] px-7 py-3.5 font-bold text-white transition hover:bg-[#33513f]"
            >
              <CalendarCheck size={16} /> Prendre rendez-vous <ExternalLink size={12} />
            </a>
            <a
              href={`tel:${BELISAMAE_PHONE}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#cfd6ca] bg-white/60 px-7 py-3.5 font-bold text-[#40634f] transition hover:bg-white"
            >
              <Phone size={15} /> 06 86 62 83 61
            </a>
          </div>
        </div>
      </header>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#5b665c]">
            Les accompagnements
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-[#2f3a33] sm:text-4xl">
            Trois façons de travailler ensemble.
          </h2>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {ACCOMPAGNEMENTS.map(a => (
              <article key={a.nom} className="rounded-3xl border border-[#e6e9e2] bg-[#fafbf9] p-6">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#dde5dd]">
                  <a.icon size={18} className="text-[#40634f]" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold tracking-tight text-[#2f3a33]">
                  {a.nom}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#5d6a60]">{a.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[#2f3a33] sm:text-4xl">
            Un temps entièrement consacré à vous.
          </h2>
          <p className="mt-3 max-w-2xl text-[#5d6a60]">
            Un espace d&apos;écoute où déposer ce qui vous pèse et retrouver vos propres ressources.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {DEROULE.map(e => (
              <div key={e.n} className="rounded-3xl border border-[#e6e9e2] bg-white p-6">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-[#40634f] font-display text-sm font-semibold text-white">
                  {e.n}
                </span>
                <h3 className="mt-4 text-sm font-black text-[#2f3a33]">{e.t}</h3>
                <p className="mt-1.5 text-xs leading-5 text-[#5b665c]">{e.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#40634f] py-16">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <h2 className="font-display text-3xl font-normal italic tracking-tight text-white sm:text-4xl">
            Le premier pas est un simple échange.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/90">
            Prenez rendez-vous en ligne ou appelez directement — en cabinet comme à distance.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={BELISAMAE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-bold text-[#40634f] transition hover:bg-[#eef3ee]"
            >
              <CalendarCheck size={16} /> Prendre rendez-vous <ExternalLink size={12} />
            </a>
            <a
              href={`tel:${BELISAMAE_PHONE}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 font-bold text-white transition hover:bg-white/10"
            >
              <Phone size={15} /> Appeler
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
