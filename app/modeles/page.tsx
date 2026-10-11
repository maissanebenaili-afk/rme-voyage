import Link from 'next/link';
import type { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';
import ModeleProcuration from '@/components/ModeleProcuration';
import WhatsAppShare from '@/components/WhatsAppShare';
import { DOCUMENTS_OFFICIELS } from '@/lib/modeles';

export const metadata: Metadata = {
  title: 'Documents à remplir — procuration de véhicule et formulaires officiels',
  description:
    'Procuration pour prêter sa voiture (conduite au Maroc) à remplir en ligne et imprimer, et liens vers les formulaires officiels : sortie du territoire, cession de véhicule.',
};

export default function ModelesPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f8fafc] px-5 py-16 text-[#0f1f3d] print:bg-white print:p-0">
      <div className="mx-auto max-w-lg">
        <div className="print:hidden">
          <Link href="/outils-papiers" className="text-sm font-semibold text-[#5a716c] hover:text-[#0f1f3d]">
            ← Papiers faciles
          </Link>
          <h1 className="mt-6 text-3xl font-black">Documents à remplir</h1>
          <p className="mt-2 text-lg text-slate-700">Remplissez en ligne, imprimez, puis signez au bon endroit.</p>
          <div className="mt-4">
            <WhatsAppShare message="Procuration de voiture pour le Maroc, à remplir et imprimer :" path="/modeles" />
          </div>

          <h2 className="mt-10 text-xl font-black">🚗 Prêter sa voiture pour aller au Maroc</h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-base text-slate-700">
            <li>Remplissez la procuration ci-dessous et imprimez-la.</li>
            <li>
              <strong>Ne signez pas chez vous.</strong> Allez à la mairie avec votre pièce d&apos;identité : vous signez
              devant l&apos;agent, qui légalise la signature. C&apos;est gratuit.
            </li>
            <li>Le conducteur garde la procuration avec une copie de la carte grise et de votre pièce d&apos;identité.</li>
          </ol>
          <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">
            Au Maroc, une voiture entrée en admission temporaire ne peut être ni vendue ni donnée sur place sans
            passer par la douane. Cette procuration autorise seulement à conduire.
          </p>
        </div>

        <div className="mt-6">
          <ModeleProcuration />
        </div>

        <section className="mt-12 print:hidden">
          <h2 className="text-xl font-black">📄 Formulaires officiels</h2>
          <p className="mt-1 text-base text-slate-700">
            Ceux-là, il faut les remplir sur le site de l&apos;État : une copie faite ailleurs ne serait pas valable.
          </p>
          <ul className="mt-3 space-y-3">
            {DOCUMENTS_OFFICIELS.map((doc) => (
              <li key={doc.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-lg font-bold">{doc.nom}</p>
                <p className="mt-1 text-base text-slate-700">{doc.pourquoi}</p>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#0f1f3d] px-4 py-3 text-base font-bold text-white"
                >
                  Ouvrir <ExternalLink size={18} />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm text-slate-600">
            Ces modèles sont une aide et ne remplacent pas un conseil juridique. En cas de doute, demandez à la
            mairie, à la douane ou à un agent France services.
          </p>
        </section>
      </div>
    </main>
  );
}
