import Link from 'next/link';
import type { Metadata } from 'next';
import { CheckCircle2, XCircle } from 'lucide-react';
import SupportDonation from '@/components/SupportDonation';

export const metadata: Metadata = {
  title: 'Soutenir RME Voyage',
  description: 'Faites un don libre pour soutenir le développement de RME Voyage, gratuit pour les voyageurs.',
};

export default async function SoutenirPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f8fafc] px-5 py-16 text-[#0f1f3d]">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm font-semibold text-[#5a716c] hover:text-[#0f1f3d]">← Retour à l'accueil</Link>

        {status === 'success' && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm font-semibold">Merci infiniment pour votre don ! Il aide directement RME Voyage à rester gratuit.</p>
          </div>
        )}
        {status === 'cancelled' && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <XCircle size={20} className="mt-0.5 shrink-0" />
            <p className="text-sm font-semibold">Don annulé — aucun montant n'a été prélevé.</p>
          </div>
        )}

        <div className="mt-6">
          <SupportDonation />
        </div>
      </div>
    </main>
  );
}
