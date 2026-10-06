import Link from 'next/link';
import { ArrowLeft, ExternalLink, MessageCircle, Phone } from 'lucide-react';
import LeadLink from '@/components/LeadLink';
import { whatsappLink } from '@/lib/partners';
import { STATUS_LABEL, type Listing } from '@/lib/listings';

const verifiedFr = (iso: string) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

// The honest page for a business RME shows (issue #227): who it is, its status,
// where the facts come from, and how to contact it. No catalogue, price,
// review or condition that the business has not published itself.
export default function ReferencedListing({ listing, note }: { listing: Listing; note: string }) {
  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#f8fafc] px-5 py-12 text-[#0f1f3d]">
      <div className="mx-auto max-w-2xl">
        <Link href="/boutique" className="inline-flex items-center gap-1.5 text-sm font-bold text-[#5a716c] hover:text-[#0f1f3d]">
          <ArrowLeft size={14} /> La Boutique
        </Link>

        <h1 className="mt-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{listing.name}</h1>
        <p className="mt-2 text-lg text-[#475569]">{listing.category}</p>

        <p data-testid="listing-status" className="mt-5 inline-block rounded-full border border-[#cbd5e1] bg-white px-3 py-1.5 text-xs font-bold text-[#334155]">
          {STATUS_LABEL[listing.status]}
        </p>

        <p className="mt-6 leading-7 text-[#334155]">{note}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          {listing.contacts.map((contact) => {
            if (contact.channel === 'whatsapp') {
              return (
                <LeadLink key="whatsapp" partner={listing.id} channel="whatsapp"
                  href={whatsappLink(contact.number, contact.message)} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-5 py-3 text-sm font-extrabold text-[#0f1f3d] hover:bg-[#1da851]">
                  <MessageCircle size={16} /> Écrire sur WhatsApp
                </LeadLink>
              );
            }
            if (contact.channel === 'phone') {
              return (
                <LeadLink key="phone" partner={listing.id} channel="phone" href={`tel:${contact.number}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#0f1f3d]/20 bg-white px-5 py-3 text-sm font-extrabold hover:border-[#0f1f3d]/40">
                  <Phone size={15} /> Appeler
                </LeadLink>
              );
            }
            return (
              <LeadLink key="site" partner={listing.id} channel="site" href={contact.url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#0f1f3d] px-5 py-3 text-sm font-extrabold text-white hover:bg-[#1e3a5f]">
                Voir son site <ExternalLink size={13} />
              </LeadLink>
            );
          })}
        </div>

        <p className="mt-10 border-t border-[#e2e8f0] pt-4 text-xs leading-5 text-[#64748b]">
          Source : {listing.sourceUrl ? <a href={listing.sourceUrl} className="underline" target="_blank" rel="noopener noreferrer">{listing.source}</a> : listing.source}{' '}
          Vérifié le {verifiedFr(listing.verifiedAt)}. Prix, disponibilités et conditions sont à demander directement au professionnel ;
          RME Voyage ne vend rien et ne garantit rien sur cette page.
        </p>
      </div>
    </main>
  );
}
