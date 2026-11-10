import Link from 'next/link';
import type { Metadata } from 'next';
import { BOUTIQUES_PAR_LIVRE, LIVRES, boutiquesActives, type Livre } from '@/lib/coloriages';

export const metadata: Metadata = {
  title: 'Livres de coloriage : Maroc, Nour, Joha et la fée',
  description:
    'Deux livres de 25 dessins à colorier inspirés du Maroc et des histoires RME Voyage. Téléchargez 4 dessins gratuits par livre, à imprimer chez vous.',
};

export default function ColoriagesPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f4f1e8] px-4 pb-32 pt-8 text-[#0f1f3d] sm:pt-12">
      <div className="mx-auto max-w-xl">
        <Link href="/dessins-animes" className="text-sm font-semibold text-[#5a716c] hover:text-[#0f1f3d]">← Dessins animés</Link>
        <h1 className="mt-4 text-3xl font-black">Livres de coloriage</h1>
        <p className="mt-1 text-slate-700">Des dessins originaux pour toute la famille, inspirés du Maroc. 4 dessins gratuits à imprimer pour chaque livre.</p>
        {LIVRES.map((livre) => <LivreSection key={livre.id} livre={livre} />)}
      </div>
    </main>
  );
}

function LivreSection({ livre }: { livre: Livre }) {
  const actives = boutiquesActives(BOUTIQUES_PAR_LIVRE[livre.id] ?? []);
  const titreId = `livre-${livre.id}`;
  return (
    <section className="mt-10" aria-labelledby={titreId}>
      <h2 id={titreId} className="text-2xl font-black">{livre.titre}</h2>
      <p className="mt-1 text-slate-700">{livre.sousTitre}. {livre.dessins} dessins originaux.</p>

      <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {livre.apercus.map(({ id, alt }) => (
          <li key={id} className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/coloriages/${livre.prefixe}${id}.png`} alt={alt} width={425} height={550} loading="lazy" className="h-auto w-full" />
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
        <h3 className="text-xl font-black">4 dessins gratuits</h3>
        <p className="mt-1 text-slate-700">Téléchargez l’échantillon et imprimez-le chez vous. Pas de compte, pas d’adresse e-mail.</p>
        <a href={livre.echantillon} download aria-label={`Télécharger le PDF gratuit : ${livre.titre}`} className="mt-3 inline-flex min-h-12 items-center rounded-full bg-[#0f1f3d] px-6 font-bold text-white">
          Télécharger le PDF gratuit
        </a>
      </div>

      <div className="mt-4 rounded-3xl bg-white p-4 shadow-sm">
        <h3 className="text-xl font-black">Le livre complet</h3>
        <div className="mt-3 flex gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={livre.couverture} alt={`Couverture du livre ${livre.titre}`} width={425} height={550} className="h-auto w-32 shrink-0 rounded-xl shadow" />
          <ul className="space-y-1 text-slate-700">
            <li>{livre.dessins} dessins, {livre.pages} pages</li>
            <li>{livre.format}</li>
            <li>Traits nets, zones assez grandes pour les crayons</li>
            <li>{livre.contenu}</li>
          </ul>
        </div>
        {actives.length === 0 ? (
          <p role="status" className="mt-4 rounded-2xl bg-amber-50 p-3 font-semibold text-amber-900">
            Bientôt disponible en livre papier. En attendant, les 4 dessins gratuits ci-dessus.
          </p>
        ) : (
          <>
            <ul className="mt-4 grid gap-2">
              {actives.map((b) => (
                <li key={b.id}>
                  <a href={b.url} target="_blank" rel="sponsored noopener noreferrer" className="flex min-h-12 items-center justify-between rounded-2xl bg-[#0f1f3d] px-4 py-2 font-bold text-white">
                    <span>{b.nom}</span><span className="text-sm font-normal opacity-80">{b.note}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-slate-600">Ces liens mènent à des boutiques externes : nous pouvons toucher une commission, sans frais pour vous.</p>
          </>
        )}
      </div>
    </section>
  );
}
