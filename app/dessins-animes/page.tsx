import Link from 'next/link';
import type { Metadata } from 'next';
import LecteurKalimat from '@/components/kalimat/LecteurKalimat';

export const metadata: Metadata = {
  title: 'Dessins animés Kalimat : la darija en riant',
  description:
    'Kalimat, les mots du bled : un mini dessin animé par jour, en français plein de darija, pour que les familles de la diaspora apprennent les mots du Maroc. Gratuit, sans publicité, sans compte.',
};

export default function DessinsAnimesPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f4f1e8] px-4 pb-32 pt-8 text-[#0f1f3d] sm:pt-12">
      <div className="mx-auto max-w-xl">
        <Link href="/radio-tv" className="text-sm font-semibold text-[#5a716c] hover:text-[#0f1f3d]">
          ← Radios, télé et vidéos
        </Link>
        <h1 className="mt-4 text-3xl font-black">Kalimat, les mots du bled</h1>
        <p className="mt-1 text-slate-700">
          Un mini dessin animé pour apprendre la darija en riant, avec Inès, Adam, Yassine, Nour, Mima et la chatte
          Mchicha. Gratuit, sans publicité, sans compte.
        </p>
        <p className="mt-2 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">
          Ouvrez cette page une fois avec du réseau : les épisodes marcheront ensuite même sans réseau, en voiture.
        </p>

        <Link href="/feuilletons" className="mt-4 block rounded-2xl bg-violet-100 p-3 text-sm font-black text-violet-950">
          🎧 Histoires pour la route : Le Fil d’or, Les Larmes de l’Atlas (à télécharger, sans réseau) →
        </Link>

        <div className="mt-6">
          <LecteurKalimat />
        </div>
      </div>
    </main>
  );
}
