import Link from 'next/link';
import type { Metadata } from 'next';
import CoranLive from '@/components/CoranLive';

export const metadata: Metadata = {
  title: 'Coran Live — lire et écouter le Coran',
  description:
    'Choisissez une sourate, écoutez la récitation et lisez le texte arabe avec sa traduction française. Gratuit, sans compte.',
};

export default function CoranPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f4f1e8] px-4 py-8 text-[#0f1f3d] sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm font-semibold text-[#5a716c] hover:text-[#0f1f3d]">
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="mt-4 text-3xl font-black">Coran Live</h1>
        <p className="mt-1 text-slate-700">Lire et écouter le Coran, en arabe et en français. Gratuit, sans compte.</p>

        <div className="mt-6">
          <CoranLive />
        </div>

        <p className="mt-8 text-xs leading-relaxed text-slate-600">
          Texte arabe : édition Tanzil « quran-uthmani », non modifiée. Traduction : Muhammad Hamidullah. Récitation :
          Mishary Rashid Alafasy. Textes fournis par AlQuran Cloud, récitation par Islamic Network. RME Voyage ne
          modifie pas le texte et n&apos;affiche aucune publicité sur cette page.
        </p>
      </div>
    </main>
  );
}
