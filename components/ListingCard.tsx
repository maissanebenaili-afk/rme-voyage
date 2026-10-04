import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { STATUS_LABEL, type Listing } from '@/lib/listings';

// Card for a referenced business (issue #227): name, category, its real
// status, and a link to its page. No stars, badge, price or promise.
export default function ListingCard({ listing, href }: { listing: Listing; href: string }) {
  return (
    <div className="rounded-3xl border border-[#e2e8f0] bg-white p-6 text-[#0f1f3d] shadow-sm">
      <h2 className="font-display text-2xl font-semibold">{listing.name}</h2>
      <p className="mt-1 text-sm text-[#475569]">{listing.category}</p>
      <p className="mt-3 text-xs font-bold text-[#64748b]">{STATUS_LABEL[listing.status]}</p>
      <Link href={href} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0f1f3d] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#1e3a5f]">
        Voir le contact <ArrowRight size={14} />
      </Link>
    </div>
  );
}
