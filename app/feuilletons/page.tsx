import Link from 'next/link';
import type { Metadata } from 'next';
import LecteurFeuilletons from '@/components/feuilletons/LecteurFeuilletons';
import { CHAINE_YOUTUBE } from '@/lib/chaineYoutube';

export const metadata: Metadata = {
  title: 'Feuilletons audio à écouter hors ligne',
  description:
    'Des histoires en épisodes pour la route : Le Fil d’or et Les Larmes de l’Atlas. Téléchargez avant le départ, écoutez sans réseau. Gratuit, sans publicité, sans compte.',
};

export default function FeuilletonsPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f4f1e8] px-4 pb-32 pt-8 text-[#0f1f3d] sm:pt-12">
      <div className="mx-auto max-w-xl">
        <Link href="/dessins-animes" className="text-sm font-semibold text-[#5a716c] hover:text-[#0f1f3d]">← Dessins animés</Link>
        <h1 className="mt-4 text-3xl font-black">Histoires pour la route</h1>
        <p className="mt-1 text-slate-700">
          Des feuilletons à écouter en voiture ou en bateau. Appuyez sur « Télécharger » quand vous avez du réseau :
          rien ne se télécharge tout seul, et vous pouvez tout supprimer à tout moment.
        </p>
        <a href={CHAINE_YOUTUBE} target="_blank" rel="noopener noreferrer" className="mt-3 block rounded-2xl bg-rose-100 p-3 text-sm font-black text-rose-950">
          ▶️ Préférez la vidéo ? Les séries sont sur notre chaîne YouTube →
        </a>
        <div className="mt-6"><LecteurFeuilletons /></div>
      </div>
    </main>
  );
}
