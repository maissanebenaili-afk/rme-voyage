import Link from 'next/link';
import type { Metadata } from 'next';
import JeuxRoute from '@/components/jeux/JeuxRoute';

export const metadata: Metadata = {
  title: 'Jeux pour la route',
  description:
    'Petits jeux gratuits pour le trajet vers le Maroc : Quiz du voyageur, Skate à la corniche, Zellige, Mémoire des souks et Déroule !, le jeu des toilettes. Sans publicité, sans compte, sans réseau une fois la page ouverte.',
};

export default function JeuxPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f4f1e8] px-4 pb-32 pt-8 text-[#0f1f3d] sm:pt-12">
      <div className="mx-auto max-w-xl">
        <Link href="/" className="text-sm font-semibold text-[#5a716c] hover:text-[#0f1f3d]">
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="mt-4 text-3xl font-black">Jeux pour la route</h1>
        <p className="mt-1 text-slate-700">Pour les enfants à l&apos;arrière. Sans publicité, sans compte.</p>
        <p className="mt-2 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          Ouvrez cette page une fois avant de partir, avec du réseau : les jeux marcheront ensuite même sans réseau.
        </p>

        <div className="mt-6">
          <JeuxRoute />
        </div>
      </div>
    </main>
  );
}
