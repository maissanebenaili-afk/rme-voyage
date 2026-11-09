import Link from 'next/link';
import type { Metadata } from 'next';
import DepartCalendar from '@/components/DepartCalendar';
import WhatsAppShare from '@/components/WhatsAppShare';

// Le mois affiché à l'ouverture est celui du jour : on régénère chaque jour.
export const revalidate = 86_400;

export const metadata: Metadata = {
  title: 'Quand partir au Maroc ? Le calendrier des jours calmes',
  description:
    "Choisissez votre jour de traversée vers le Maroc : pour chaque jour, l'affluence prévue au port (calme, chargé, très chargé) et le jour plus calme le plus proche. Une indication tirée du calendrier, pas une donnée en direct.",
  alternates: { canonical: '/quand-partir' },
};

export default function QuandPartirPage() {
  const now = new Date();
  const initial = { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f8fafc] px-5 py-16 text-[#0f1f3d]">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm font-semibold text-[#5a716c] hover:text-[#0f1f3d]">
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="mt-6 text-3xl font-black">Quand partir au Maroc ?</h1>
        <p className="mt-2 text-slate-700">
          Un jour calme, c&apos;est moins d&apos;attente au port et plus de places sur le ferry. Regardez le mois,
          touchez un jour.
        </p>
        <div className="mt-4">
          <WhatsAppShare message="Le calendrier des jours calmes pour traverser vers le Maroc :" path="/quand-partir" />
        </div>
        <div className="mt-6">
          <DepartCalendar initial={initial} />
        </div>
        <p className="mt-8 text-xs text-slate-600">
          Indication calculée à partir du calendrier seulement (été, Aïd annoncés). Ce n&apos;est ni un prix ni une
          donnée en direct : l&apos;attente réelle dépend aussi de la météo et du port. Vérifiez auprès de votre
          compagnie avant de partir.
        </p>
      </div>
    </main>
  );
}
