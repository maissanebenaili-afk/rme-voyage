import Link from 'next/link';
import type { Metadata } from 'next';
import RadioTvMaroc from '@/components/RadioTvMaroc';

export const metadata: Metadata = {
  title: 'Radios et télé du Maroc en direct',
  description:
    'Écoutez Hit Radio, Radio Mars, Medina FM, Med Radio et d’autres radios marocaines en un appui, et retrouvez les directs officiels d’Al Aoula, Al Maghribia, 2M et Medi1 TV.',
};

export default function RadioTvPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f4f1e8] px-4 py-8 text-[#0f1f3d] sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold text-[#5a716c] hover:text-[#0f1f3d]">
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="mt-4 text-3xl font-black">Radios et télé du Maroc</h1>
        <p className="mt-1 text-slate-700">En direct, gratuit, sans compte.</p>

        <div className="mt-6">
          <RadioTvMaroc />
        </div>

        <p className="mt-10 text-xs leading-relaxed text-slate-600">
          Les radios sont diffusées par leurs éditeurs ; RME Voyage relaie seulement leurs flux publics et renvoie
          vers leurs sites. Les chaînes de télévision s&apos;ouvrent sur leurs sites officiels (SNRT, 2M, Medi1 TV).
          Liste vérifiée le 4 novembre 2026 : si une radio ne répond plus, essayez-en une autre.
        </p>
      </div>
    </main>
  );
}
