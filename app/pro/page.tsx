import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Check, Building2, Users, Globe, Zap, HeadphonesIcon, BarChart3 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'RME Voyage Pro — Widget B2B pour agences & associations MRE',
  description: 'Intégrez le comparateur de transferts EUR→MAD, l\'itinéraire et les outils voyage RME dans votre site. Abonnement annuel, 3 formules.',
};

const plans = [
  {
    name: 'Agence',
    price: '490',
    freq: '/an',
    desc: 'Pour une agence de voyage ou un cabinet de conseil MRE.',
    stripeEnv: 'NEXT_PUBLIC_STRIPE_LINK_STARTER',
    features: [
      '1 domaine autorisé',
      'Widget Comparateur Transferts EUR→MAD',
      'Taux de change live (mise à jour /h)',
      'Logo blanc — votre marque, pas la nôtre',
      'Support email sous 48h',
    ],
    highlight: false,
    cta: 'Commencer',
  },
  {
    name: 'Association MRE',
    price: '990',
    freq: '/an',
    desc: 'Pour les associations diaspora, consulats et mairies partenaires.',
    stripeEnv: 'NEXT_PUBLIC_STRIPE_LINK_PRO',
    features: [
      '3 domaines autorisés',
      'Suite complète (transferts, itinéraire, prière, météo)',
      'Taux de change live',
      'Logo blanc + couleurs personnalisées',
      'Newsletter mensuelle co-brandée',
      'Support prioritaire sous 24h',
    ],
    highlight: true,
    cta: 'Formule recommandée',
  },
  {
    name: 'Institutionnel',
    price: '1 990',
    freq: '/an',
    desc: 'Pour les institutionnels, banques et opérateurs de transfert.',
    stripeEnv: 'NEXT_PUBLIC_STRIPE_LINK_ENTERPRISE',
    features: [
      'Domaines illimités',
      'Accès API complet',
      'Tableau de bord analytics clics/conversions',
      'Intégration sur-mesure',
      'Account manager dédié',
      'SLA 99,9 % garanti',
    ],
    highlight: false,
    cta: 'Nous contacter',
  },
];

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
            <Zap size={13} /> Solution B2B
          </span>
          <h1 className="mt-6 text-4xl font-display font-semibold tracking-tight sm:text-6xl">
            Le comparateur MRE, <span style={{background:'linear-gradient(135deg,#f2b963,#f59e0b,#d9824b)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>chez vous en 5 minutes.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/75">
            Intégrez les outils RME Voyage dans votre site — widget transferts EUR→MAD,
            itinéraire, prières — sans développement. Vos utilisateurs restent sur votre domaine.
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

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="mb-12 text-center">
          <p className="text-sm font-extrabold uppercase tracking-[.16em] text-[#a84f2b]">Tarifs</p>
          <h2 className="mt-3 text-4xl font-display font-semibold tracking-tight">Simple. Transparent. Sans surprise.</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {plans.map((plan) => {
            const stripeUrl = process.env[plan.stripeEnv as keyof typeof process.env] as string | undefined;
            return (
              <article
                key={plan.name}
                className={`flex flex-col rounded-2xl p-8 ${
                  plan.highlight
                    ? 'bg-[#0f1f3d] text-white ring-2 ring-[#f59e0b]'
                    : 'premium-card'
                }`}
              >
                {plan.highlight && (
                  <span className="mb-4 self-start rounded-full bg-[#f59e0b] px-3 py-1 text-xs font-extrabold text-[#0f1f3d]">
                    ⭐ Recommandé
                  </span>
                )}
                <p className={`text-sm font-extrabold uppercase tracking-wider ${plan.highlight ? 'text-[#f5cd93]' : 'text-[#0369a1]'}`}>
                  {plan.name}
                </p>
                <div className="mt-3 flex items-end gap-1">
                  <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-[#0f1f3d]'}`}>
                    {plan.price}€
                  </span>
                  <span className={`mb-1 text-sm ${plan.highlight ? 'text-white/60' : 'text-[#5a716c]'}`}>{plan.freq}</span>
                </div>
                <p className={`mt-2 text-sm ${plan.highlight ? 'text-white/70' : 'text-[#5a716c]'}`}>{plan.desc}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check size={16} className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-[#f5cd93]' : 'text-[#0369a1]'}`} />
                      <span className={plan.highlight ? 'text-white/85' : 'text-[#5a716c]'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={stripeUrl || 'mailto:contact@rmevoyage.com?subject=RME%20Voyage%20Pro%20-%20' + plan.name}
                  className={`mt-8 flex items-center justify-center gap-2 rounded-full py-3.5 font-extrabold transition ${
                    plan.highlight
                      ? 'bg-[#f59e0b] text-[#0f1f3d] hover:bg-[#f5cd93]'
                      : 'bg-[#0f1f3d] text-white hover:bg-[#0f1f3d]'
                  }`}
                >
                  {plan.cta} <ArrowRight size={17} />
                </a>
              </article>
            );
          })}
        </div>
        <p className="mt-6 text-center text-sm text-[#5a716c]">
          Toutes les formules incluent la TVA. Facturation annuelle. Résiliation à tout moment.
        </p>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            {[
              { icon: Zap, title: 'Intégration 5 min', text: 'Un tag `<script>` dans votre HTML. C\'est tout.' },
              { icon: BarChart3, title: 'Analytics inclus', text: 'Suivi des clics affiliés et conversions dans votre tableau de bord.' },
              { icon: HeadphonesIcon, title: 'Support humain', text: 'Une vraie personne vous répond. Pas un bot.' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title}>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f1ed] text-[#0369a1]">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#5a716c]">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0f1f3d] py-16 text-center text-white">
        <div className="mx-auto max-w-xl px-5">
          <h2 className="text-3xl font-display font-semibold">Une question avant de vous lancer ?</h2>
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
