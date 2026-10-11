import type { Metadata } from 'next';
import Link from 'next/link';
import CrossingWindow from '@/components/lab/CrossingWindow';
import { KNOWN_ORIGINS, type Trip } from '@/lib/lab/crossingWindow/engine';
import { tripFromRoutePage } from '@/lib/lab/crossingWindow/trips';
import { ROUTE_PAGES } from '@/lib/routePages';

// RME Lab prototype « Quand partir ? » : non lié, non indexé, données de l'été 2026 seulement.
export const metadata: Metadata = {
  title: 'RME Lab — Quand partir ?',
  description: 'Prototype : la route française et le port le même voyage, jour par jour.',
  robots: { index: false, follow: false },
};

export default function CrossingWindowLabPage() {
  // Only one small trip per departure city reaches the browser, not the route dataset.
  const trips: Trip[] = [];
  for (const origin of KNOWN_ORIGINS) {
    const slug = ROUTE_PAGES.routes.find((r) => r.originCity === origin)?.slug;
    const trip = slug ? tripFromRoutePage(slug) : null;
    if (trip) trips.push(trip);
  }
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f8fafc] text-[#0f1f3d]">
      <nav className="bg-[#0f1f3d] px-5 py-4">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <Link href="/" className="text-base font-black text-white">RME <span className="font-medium text-[#f5cd93]">Voyage</span></Link>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70">RME Lab</span>
        </div>
      </nav>
      <div className="mx-auto max-w-xl px-4 py-6">
        <CrossingWindow trips={trips} />
      </div>
    </main>
  );
}
