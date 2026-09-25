import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ferryOf, formatDuration, formatKm, frenchDate, ROUTE_PAGES } from '@/lib/routePages';

export const revalidate = 86_400;

export const metadata: Metadata = {
  title: 'Trajets Europe ↔ Maroc : distances, durées et budget carburant',
  description:
    "Distance routière, durée de conduite, traversée retenue et coût du carburant pays par pays pour les principaux trajets entre l'Europe et le Maroc.",
  alternates: { canonical: '/trajet' },
};

export default function TrajetIndexPage() {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#fffdf8] text-[#0f1f3d]">
      <header className="bg-[#0f1f3d] px-5 py-10 text-white sm:px-8">
        <div className="mx-auto max-w-4xl">
          <nav aria-label="Fil d'Ariane" className="text-xs font-semibold uppercase tracking-[.16em] text-[#fde68a]">
            <Link href="/" className="hover:underline">
              Accueil
            </Link>
          </nav>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Trajets Europe ↔ Maroc
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
            {ROUTE_PAGES.routes.length} trajets calculés sur les données OpenStreetMap le{' '}
            {frenchDate(ROUTE_PAGES.generatedAt)} : distance routière, durée de conduite, traversée retenue et coût du
            carburant pays par pays. Votre trajet n'est pas dans la liste ?{' '}
            <Link href="/#planifier" className="underline">
              Calculez-le directement
            </Link>
            .
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
        <ul className="grid gap-3 sm:grid-cols-2">
          {ROUTE_PAGES.routes.map((route) => {
            const ferry = ferryOf(route);
            return (
              <li key={route.slug}>
                <Link
                  href={`/trajet/${route.slug}`}
                  className="flex h-full flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-[#e2e8f0] transition hover:ring-[#0f1f3d]"
                >
                  <span className="flex items-center gap-2 font-display text-lg font-semibold">
                    {route.originCity} → {route.destinationCity}
                    <ArrowRight size={16} className="shrink-0 text-[#b45309]" aria-hidden="true" />
                  </span>
                  <span className="mt-1 text-sm text-[#475569]">
                    {formatKm(route.distanceMeters)} · {formatDuration(route.durationSeconds)} de conduite
                  </span>
                  {ferry && (
                    <span className="mt-1 text-xs text-[#64748b]">
                      Traversée {ferry.from} → {ferry.to}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
