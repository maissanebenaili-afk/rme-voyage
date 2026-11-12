import Link from 'next/link';
import type { Metadata } from 'next';
import { contactEmail } from '@/lib/contact';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: "Éditeur et hébergeur du site RME Voyage, comme l'exige la loi française (LCEN, article 6).",
};

// Loi pour la confiance dans l'économie numérique : tout site édité par une
// société doit nommer l'éditeur, le directeur de la publication et l'hébergeur.
export default function MentionsLegalesPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f8fafc] px-5 py-16 text-[#0f1f3d]">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm font-semibold text-[#5a716c] hover:text-[#0f1f3d]">
          ← Retour à l&apos;accueil
        </Link>
        <h1 className="mt-6 text-3xl font-black">Mentions légales</h1>

        <section className="mt-8">
          <h2 className="text-lg font-extrabold">Éditeur du site</h2>
          <p className="mt-2 leading-7 text-slate-700">
            Nova Presta SASU
            <br />
            25 rue de Ponthieu, 75008 Paris, France
            <br />
            RCS Paris 992 191 726
            {contactEmail && (
              <>
                <br />
                Contact : <a href={`mailto:${contactEmail}`} className="underline">{contactEmail}</a>
              </>
            )}
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-extrabold">Directeur de la publication</h2>
          <p className="mt-2 leading-7 text-slate-700">Tarek Benaili, président de Nova Presta.</p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-extrabold">Hébergeur</h2>
          <p className="mt-2 leading-7 text-slate-700">
            Netlify, Inc.
            <br />
            101 2nd Street, San Francisco, CA 94105, États-Unis
            <br />
            <a href="https://www.netlify.com" className="underline" rel="noopener noreferrer">www.netlify.com</a>
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-extrabold">Vos données</h2>
          <p className="mt-2 leading-7 text-slate-700">
            Voir la <a href="/api/legal/privacy" className="underline">politique de confidentialité</a> et les{' '}
            <a href="/api/legal/terms" className="underline">conditions d&apos;utilisation</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
