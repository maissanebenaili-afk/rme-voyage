import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, Phone, MessageCircle } from 'lucide-react';
import { contactMailto } from '@/lib/contact';
import { DEMO_SLUGS, demoPour } from '@/lib/demoEtablissements';

// Page à montrer aux commerçants : maquette avec un établissement fictif.
// Pas de prix, pas de chiffre de fréquentation, pas de promesse : voir
// __tests__/demoEtablissements.test.tsx.
export const metadata: Metadata = {
  title: 'Maquette pour les établissements | RME Voyage',
  description: 'Maquette d’une fiche d’établissement sur RME Voyage. Exemple fictif.',
  robots: { index: false, follow: false },
};

export function generateStaticParams() {
  return DEMO_SLUGS.map((categorie) => ({ categorie }));
}

export default async function DemoPage({ params }: { params: Promise<{ categorie: string }> }) {
  const { categorie } = await params;
  const demo = demoPour(categorie);
  if (!demo) notFound();
  const mailto = contactMailto(`Je veux apparaître sur RME Voyage : ${demo.titre}`);

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f8fafc] text-[#0f1f3d]">
      <div className="bg-[#f59e0b] px-5 py-3 text-center text-sm font-bold text-[#0f1f3d]">
        Maquette : l’établissement ci-dessous est fictif et cet affichage n’est pas encore en ligne.
      </div>
      <div className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="font-display text-3xl font-semibold">{demo.titre} sur RME Voyage</h1>
        <p className="mt-3 text-base leading-7 text-[#475569]">
          RME Voyage aide les familles qui voyagent entre l’Europe et le Maroc à préparer leur route. Voici à quoi
          pourrait ressembler votre fiche.
        </p>

        <article className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5" aria-label="Exemple de fiche">
          <p className="text-xs font-extrabold uppercase tracking-[.14em] text-[#b45309]">Exemple fictif</p>
          <h2 className="mt-2 text-2xl font-bold">{demo.exemple}</h2>
          <p className="mt-1 flex items-center gap-2 text-sm text-[#475569]">
            <MapPin size={15} aria-hidden="true" /> {demo.ville}
          </p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm leading-6">
            {demo.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3" aria-hidden="true">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0f1f3d] px-4 py-2 text-sm font-semibold text-white">
              <Phone size={15} /> Appeler
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#15803d] px-4 py-2 text-sm font-semibold text-white">
              <MessageCircle size={15} /> WhatsApp
            </span>
          </div>
        </article>

        <section className="mt-10" aria-labelledby="apport-title">
          <h2 id="apport-title" className="font-display text-xl font-semibold">
            Ce que ça peut vous apporter
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
            {demo.apport.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>

        <section className="mt-10 rounded-2xl bg-[#0f1f3d] p-5 text-white" aria-labelledby="regles-title">
          <h2 id="regles-title" className="text-lg font-bold">
            Nos engagements
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-white/85">
            <li>Nous ne publions rien sur vous sans votre accord écrit.</li>
            <li>Vous gardez la main sur vos informations et pouvez demander leur retrait à tout moment.</li>
            <li>Nous ne promettons aucun nombre de clients. Les conditions se discutent ensemble.</li>
          </ul>
          {mailto && (
            <a
              href={mailto}
              className="mt-4 inline-block rounded-full bg-[#f59e0b] px-5 py-2.5 text-sm font-bold text-[#0f1f3d]"
            >
              Je veux en savoir plus
            </a>
          )}
        </section>

        <p className="mt-8 text-sm">
          <Link href="/" className="text-[#475569] underline">
            ← Retour au site
          </Link>
        </p>
      </div>
    </main>
  );
}
