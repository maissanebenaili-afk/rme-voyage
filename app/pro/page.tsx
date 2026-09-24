import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Building2, Users, Globe, Zap } from 'lucide-react';

// This B2B offer is not yet built or commercially validated: no embeddable
// widget, no Stripe billing, no analytics dashboard, no SLA exist in this
// codebase today. Do not reintroduce prices, a subscription CTA, an SLA
// guarantee, or a VAT/invoicing claim here until they are real — see
// __tests__/proPage.test.tsx and RME_ROUTE_ETAT.md.
export const metadata: Metadata = {
  title: 'RME Voyage Pro — Solution B2B en préparation',
  description: 'Intégrez les outils RME Voyage (transferts, itinéraire, prières) dans votre site. Offre B2B en cours de construction — laissez-nous vos coordonnées.',
  robots: { index: false, follow: false },
};

const useCases = [
  { icon: Building2, title: 'Agences de voyage MRE', text: 'Proposez un comparateur transferts intégré à votre site. Vos clients partent mieux préparés, vous touchez une commission.' },
  { icon: Users, title: 'Associations diaspora', text: 'Offrez à vos membres un outil concret : taux de change live, prières, itinéraire. Zéro développement de votre côté.' },
  { icon: Globe, title: 'Consulats & mairies', text: 'Un service à valeur ajoutée pour la communauté MRE, clé en main, hébergé par nous.' },
];

export default function ProPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f8fafc] text-[#0f1f3d]">
      {/* Nav */}
      <nav className="bg-[#0f1f3d] px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-base font-black text-white">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#f59e0b] text-sm text-[#0f1f3d]">R</span>
            RME <span className="font-medium text-[#f5cd93]">Voyage</span>
          </Link>
          <Link href="/" className="text-sm text-white/70 hover:text-white">← Retour</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#0f1f3d] pb-24 pt-16 text-white">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.16em] text-[#f5cd93]">
            <Zap size={13} /> Solution B2B — en préparation
          </span>
          <h1 className="mt-6 text-4xl font-display font-semibold tracking-tight sm:text-6xl">
            Le comparateur MRE, bientôt <span style={{background:'linear-gradient(135deg,#f2b963,#f59e0b,#d9824b)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>intégrable chez vous.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/75">
            Nous préparons une offre pour intégrer les outils RME Voyage — transferts EUR→MAD,
            itinéraire, prières — dans votre site. Rien n'est encore disponible à l'abonnement :
            si ça vous intéresse, laissez-nous vos coordonnées et on vous tient au courant.
          </p>
        </div>
      </section>

      {/* Use cases */}
      <section className="mx-auto -mt-8 max-w-5xl px-5 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          {useCases.map(({ icon: Icon, title, text }) => (
            <div key={title} className="premium-card rounded-2xl p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e9f1ed] text-[#0369a1]">
                <Icon size={22} />
              </div>
              <h3 className="mt-4 font-extrabold text-[#0f1f3d]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#5a716c]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Statut */}
      <section className="mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
        <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#a84f2b]">Statut</p>
        <h2 className="mt-3 text-3xl font-display font-semibold tracking-tight">
          Pas encore de tarifs, pas encore d'abonnement.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[#5a716c]">
          Le widget embarquable, la facturation et le tableau de bord analytics n'existent pas
          encore. Nous ne facturons rien tant que ce n'est pas réellement construit et testé.
          Écrivez-nous pour être prévenu·e au lancement — aucun engagement de votre part.
        </p>
      </section>

      {/* CTA */}
      <section className="bg-[#0f1f3d] py-16 text-center text-white">
        <div className="mx-auto max-w-xl px-5">
          <h2 className="text-3xl font-display font-semibold">Intéressé·e par cette offre ?</h2>
          <p className="mt-3 text-white/70">On répond sous 24h. Pas de pitch, juste des réponses.</p>
          <a
            href="mailto:contact@rmevoyage.com?subject=RME%20Voyage%20Pro%20%E2%80%94%20Demande%20d%27information"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f59e0b] px-6 py-3.5 font-extrabold text-[#0f1f3d] transition hover:bg-[#f5cd93]"
          >
            Nous écrire <ArrowRight size={17} />
          </a>
        </div>
      </section>

      <footer className="bg-[#080f28] py-8 text-center text-sm text-white/40">
        © 2026 RME Voyage — Nova Presta ·{' '}
        <Link href="/" className="hover:text-white/70">Retour à l'accueil</Link>
      </footer>
    </main>
  );
}
