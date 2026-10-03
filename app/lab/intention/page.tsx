import type { Metadata } from 'next';
import Link from 'next/link';
import MagicIntent from '@/components/lab/MagicIntent';
import { getPartnerCatalogue } from '@/lib/partnerCatalogue';
import { ROUTE_PAGES } from '@/lib/routePages';

// RME Lab prototype (Magic Button MVP): unlinked and not indexed until the GO.
export const metadata: Metadata = {
  title: 'RME Lab — Magic Button',
  description: 'Prototype : une phrase, et RME prépare les prochaines étapes du voyage.',
  robots: { index: false, follow: false },
};

export default function MagicIntentLabPage() {
  // Only the three fields the matcher needs reach the browser, not the 97 KB dataset.
  const routes = ROUTE_PAGES.routes.map(({ slug, originCity, destinationCity }) => ({ slug, originCity, destinationCity }));

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f8fafc] text-[#0f1f3d]">
      <nav className="bg-[#0f1f3d] px-5 py-4">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-base font-black text-white">
            <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#f59e0b] text-sm text-[#0f1f3d]">R</span>
            RME <span className="font-medium text-[#f5cd93]">Voyage</span>
          </Link>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/70">RME Lab</span>
        </div>
      </nav>
      <div className="mx-auto max-w-xl px-4 py-6">
        <MagicIntent partners={getPartnerCatalogue()} routes={routes} />
      </div>
    </main>
  );
}
