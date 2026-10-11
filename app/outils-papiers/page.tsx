import Link from 'next/link';
import type { Metadata } from 'next';
import OutilsPapiers from '@/components/OutilsPapiers';
import WhatsAppShare from '@/components/WhatsAppShare';

export const metadata: Metadata = {
  title: 'Papiers faciles — outils gratuits pour vos démarches',
  description:
    'Scanner, mettre en PDF, signer, traduire, déposer et suivre un dossier : les outils gratuits et officiels, expliqués simplement et à écouter.',
};

export default function OutilsPapiersPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f8fafc] px-5 py-16 text-[#0f1f3d]">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm font-semibold text-[#5a716c] hover:text-[#0f1f3d]">
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="mt-6 text-3xl font-black">Papiers faciles</h1>
        <p className="mt-2 text-lg text-slate-700">
          Des outils gratuits, dans l&apos;ordre d&apos;une démarche. Appuyez sur « Écouter » pour entendre
          l&apos;explication.
        </p>
        <p className="mt-3 text-base">
          Vous partez au Maroc ?{' '}
          <Link href="/kit-retour" className="font-bold text-blue-700 underline">
            Faites votre liste de papiers
          </Link>
          .
        </p>
        <div className="mt-4">
          <WhatsAppShare message="Des outils gratuits pour scanner, signer et envoyer ses papiers :" path="/outils-papiers" />
        </div>
        <div className="mt-8">
          <OutilsPapiers />
        </div>
        <p className="mt-10 text-sm text-slate-600">
          RME Voyage n&apos;est pas un site du gouvernement. Les démarches officielles sont toujours gratuites
          sur les sites en « .gouv.fr ».
        </p>
      </div>
    </main>
  );
}
