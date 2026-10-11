import Link from 'next/link';
import type { Metadata } from 'next';
import KitRetour from '@/components/KitRetour';
import WhatsAppShare from '@/components/WhatsAppShare';

export const metadata: Metadata = {
  title: 'Kit Retour au bled — vos papiers pour le Maroc',
  description:
    'Répondez à 4 questions et obtenez la liste exacte des papiers pour partir au Maroc : passeport, enfants, voiture, assurance, avec les sources officielles.',
};

export default function KitRetourPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f8fafc] px-5 py-16 text-[#0f1f3d]">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm font-semibold text-[#5a716c] hover:text-[#0f1f3d] print:hidden">
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="mt-6 text-3xl font-black">Kit Retour au bled</h1>
        <p className="mt-2 text-slate-700">
          4 questions, et vous avez la liste de vos papiers pour partir au Maroc. Chaque ligne indique sa source.
        </p>
        <div className="mt-4">
          <WhatsAppShare message="La liste des papiers pour partir au Maroc, en 4 questions :" path="/kit-retour" />
        </div>
        <div className="mt-6">
          <KitRetour />
        </div>
        <p className="mt-8 text-base print:hidden">
          Besoin de scanner, signer ou envoyer un papier ?{' '}
          <Link href="/outils-papiers" className="font-bold text-blue-700 underline">
            Outils gratuits
          </Link>
        </p>
        <p className="mt-4 text-xs text-slate-600">
          Ce kit est une aide et ne remplace pas les sites officiels. Les règles peuvent changer : vérifiez les
          lignes marquées « à confirmer » avant le départ.
        </p>
      </div>
    </main>
  );
}
