import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'RME Voyage Pro — Offre en préparation',
  description: 'Les offres professionnelles de RME Voyage sont en préparation. Aucun tarif ni engagement commercial n’est actuellement publié.',
  robots: { index: false, follow: false },
};

const prerequisites = [
  'Cas d’usage et périmètre de service validés',
  'Sources de données et limites documentées',
  'Parcours de paiement, support et conditions vérifiés',
  'Mesures de disponibilité et de confidentialité définies',
];

export default function ProPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f8fafc] text-[#0f1f3d]">
      <nav className="bg-[#0f1f3d] px-5 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-base font-black text-white">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#f59e0b] text-sm text-[#0f1f3d]">R</span>
            RME <span className="font-medium text-[#f5cd93]">Voyage</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
            <ArrowLeft size={16} /> Retour
          </Link>
        </div>
      </nav>

      <section className="bg-[#0f1f3d] px-5 py-20 text-white sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.16em] text-[#f5cd93]">
            <Building2 size={13} /> Offre professionnelle
          </span>
          <h1 className="mt-6 text-4xl font-display font-semibold tracking-tight sm:text-6xl">
            RME Voyage Pro est en préparation.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/75">
            Aucun tarif, abonnement, SLA, intégration, analytique ou délai de support n’est actuellement proposé.
            Nous publierons une offre uniquement après validation de son périmètre et de ses conditions.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
        <div className="rounded-3xl border border-[#e2e8f0] bg-white p-8 shadow-sm sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e9f1ed] text-[#0369a1]">
            <ShieldCheck size={24} />
          </div>
          <h2 className="mt-5 text-2xl font-display font-semibold">Avant toute ouverture commerciale</h2>
          <ul className="mt-6 space-y-4">
            {prerequisites.map((item) => (
              <li key={item} className="flex items-start gap-3 text-[#475569]">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-[#0369a1]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm leading-6 text-[#64748b]">
            Les fonctionnalités présentées dans l’application publique restent soumises à leurs propres sources,
            disponibilités et limites. Cette page ne constitue pas une offre commerciale.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-[#0f1f3d] px-6 py-3.5 font-extrabold text-white transition hover:bg-[#1e3a5f]">
            Découvrir RME Voyage <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
