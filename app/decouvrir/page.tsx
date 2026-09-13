import Link from 'next/link';
import { ArrowRight, CalendarCheck, CircleDollarSign, MapPinned, ShipWheel, Sparkles } from 'lucide-react';

const features = [
  {
    icon: MapPinned,
    title: 'Préparez votre trajet',
    text: 'Organisez votre voyage entre l’Europe et le Maroc en un seul endroit.',
  },
  {
    icon: CircleDollarSign,
    title: 'Estimez votre budget',
    text: 'Comparez les options de transport et anticipez les principaux coûts.',
  },
  {
    icon: ShipWheel,
    title: 'Ferry, avion et route',
    text: 'Retrouvez les informations utiles pour choisir la solution adaptée à votre voyage.',
  },
  {
    icon: CalendarCheck,
    title: 'Voyagez sereinement',
    text: 'Accédez aux services, horaires de prière et informations pratiques pendant votre trajet.',
  },
];

export const metadata = {
  title: 'Découvrir RME Voyage',
  description: 'La plateforme pour préparer vos trajets entre l’Europe et le Maroc.',
};

export default function DiscoverPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen overflow-hidden bg-[#0d3f38] text-white">
      {/* Background decorations, consistent with homepage hero */}
      <div className="relative isolate">
        <div className="pointer-events-none absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-[#eead59]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 left-1/4 -z-10 h-72 w-72 rounded-full bg-[#4cc3ac]/15 blur-3xl" />

        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6 sm:px-8">
          <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e6a44e] text-sm text-[#103d37]">R</span>
            RME <span className="font-medium text-[#f5cd93]">Voyage</span>
          </Link>
          <Link
            href="/telecharger"
            className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Ouvrir l&apos;application
          </Link>
        </nav>

        <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:pt-16">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.16em] text-[#f5cd93]">
              <Sparkles size={14} /> Europe ↔ Maroc
            </p>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Votre voyage vers le Maroc, mieux préparé.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
              RME Voyage rassemble les outils essentiels pour planifier votre itinéraire, estimer votre
              budget et retrouver les services utiles sur la route.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-[#e6a44e] px-6 py-3.5 font-extrabold text-[#103d37] shadow-gold transition hover:bg-[#f5cd93]"
              >
                Préparer mon voyage <ArrowRight size={18} />
              </Link>
              <a
                href="#fonctionnalites"
                className="inline-flex items-center rounded-full border border-white/20 px-6 py-3.5 font-bold text-white transition hover:bg-white/10"
              >
                Découvrir le service
              </a>
            </div>
          </div>

          <div className="relative animate-scale-in delay-200">
            <div className="absolute inset-0 -rotate-2 rounded-[2rem] bg-[#e6a44e]/90" />
            <div className="relative rounded-[2rem] border border-white/10 bg-[#153f39] p-7 shadow-2xl sm:p-9">
              <p className="text-sm font-bold text-[#f5cd93]">Un seul point de départ</p>
              <div className="mt-7 space-y-5">
                <div className="rounded-2xl bg-white/10 p-5">
                  <p className="text-sm text-white/60">Itinéraire</p>
                  <p className="mt-1 text-xl font-bold">Europe → Maroc</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/10 p-5">
                    <p className="text-sm text-white/60">Transport</p>
                    <p className="mt-1 font-bold">Comparé</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-5">
                    <p className="text-sm text-white/60">Budget</p>
                    <p className="mt-1 font-bold">Estimé</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section id="fonctionnalites" className="bg-[#fffdf8] py-20 text-[#173a36]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="text-sm font-extrabold uppercase tracking-[.18em] text-[#a84f2b]">
            Pensé pour votre trajet
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            Les informations utiles, sans multiplier les outils.
          </h2>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, text }) => (
              <article key={title} className="card-hover rounded-3xl border border-[#dce3dc] bg-white p-7">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e9f1ed] text-[#0d6255]">
                  <Icon size={24} />
                </span>
                <h3 className="mt-5 text-xl font-extrabold">{title}</h3>
                <p className="mt-3 leading-7 text-[#5a716c]">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fffdf8] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-[#0d3f38] px-7 py-14 text-center text-white shadow-warm-lg sm:px-12">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
            Prêt à organiser votre voyage ?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/75">
            Accédez à RME Voyage et commencez votre préparation dès maintenant.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#e6a44e] px-6 py-3 font-bold text-[#103d37] transition hover:bg-[#f5cd93]"
          >
            Ouvrir l&apos;application <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#0a2e28] px-5 py-8 text-center text-sm text-white/60">
        RME Voyage — Informations indicatives. Vérifiez les conditions des transporteurs avant le
        départ.
      </footer>
    </main>
  );
}
