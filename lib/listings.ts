import { BELISAMAE_PHONE, BELISAMAE_URL, IDOUR_WHATSAPP, MARWA_PHONE, MARWA_WHATSAPP } from '@/lib/partners';

/**
 * Commercial status of a business shown on RME (issue #227). Each level needs
 * its own proof; none is ever inferred from the code or from clicks.
 * - CANDIDATE: real business spotted, never contacted, not shown.
 * - REFERENCED: real business shown with its contact, no commercial agreement.
 * - PARTNER: explicit agreement with RME, with a written proof.
 * - AFFILIATE: official affiliate programme validated, with a written proof.
 */
export type ListingStatus = 'CANDIDATE' | 'REFERENCED' | 'PARTNER' | 'AFFILIATE';

export type ListingContact =
  | { channel: 'whatsapp'; number: string; message: string }
  | { channel: 'phone'; number: string }
  | { channel: 'site'; url: string };

export type Listing = {
  /** Partner id used by contact-click tracking (scripts/partner-funnel.mjs). */
  id: 'marwa_caftan' | 'afarah_nassim' | 'taza_immobilier' | 'belisamae';
  name: string;
  category: string;
  status: ListingStatus;
  /** Where the shown facts come from: a public URL, or how RME got the contact. */
  source: string;
  sourceUrl?: string;
  /** Date (YYYY-MM-DD) the facts above were last checked. */
  verifiedAt: string;
  contacts: ListingContact[];
};

// Checked on 2026-10-04: no public page found for Marwa Caftan, Afarah Nassim or
// HiDOUR; the repository records their commercial agreement as « À VÉRIFIER »
// (docs/MONETISATION_SURFACES.md). They stay REFERENCED until Tarek holds a
// written agreement. Their former catalogues (12 caftans, 4 catering menus,
// properties with prices) were invented and are gone.
export const LISTINGS: Record<Listing['id'], Listing> = {
  marwa_caftan: {
    id: 'marwa_caftan',
    name: 'Marwa Caftan',
    category: 'Caftans (location et vente)',
    status: 'REFERENCED',
    source: 'Contact transmis à RME Voyage. Aucune page publique trouvée.',
    verifiedAt: '2026-10-04',
    contacts: [
      { channel: 'whatsapp', number: MARWA_WHATSAPP, message: 'Bonjour, je souhaite voir vos caftans disponibles.' },
      { channel: 'phone', number: MARWA_PHONE },
    ],
  },
  afarah_nassim: {
    id: 'afarah_nassim',
    name: 'Afarah Nassim',
    category: 'Traiteur (même contact que Marwa Caftan)',
    status: 'REFERENCED',
    source: 'Contact transmis à RME Voyage. Aucune page publique trouvée.',
    verifiedAt: '2026-10-04',
    contacts: [
      { channel: 'whatsapp', number: MARWA_WHATSAPP, message: 'Bonjour, je souhaite un devis traiteur.' },
      { channel: 'phone', number: MARWA_PHONE },
    ],
  },
  taza_immobilier: {
    id: 'taza_immobilier',
    name: 'HiDOUR Immobilier',
    category: 'Immobilier à Taza (vente et location)',
    status: 'REFERENCED',
    source: 'Contact transmis à RME Voyage. Aucune page publique trouvée.',
    verifiedAt: '2026-10-04',
    contacts: [
      { channel: 'whatsapp', number: IDOUR_WHATSAPP, message: 'Bonjour, je cherche un bien à Taza. Quels biens avez-vous actuellement ?' },
    ],
  },
  belisamae: {
    id: 'belisamae',
    name: 'Belisamae',
    category: 'Énergéticienne (Reiki, géobiologie)',
    status: 'REFERENCED',
    source: 'Site public de Belisamae.',
    sourceUrl: BELISAMAE_URL,
    verifiedAt: '2026-10-04',
    contacts: [
      { channel: 'site', url: BELISAMAE_URL },
      { channel: 'phone', number: BELISAMAE_PHONE },
    ],
  },
};

export const STATUS_LABEL: Record<ListingStatus, string> = {
  CANDIDATE: 'Non contacté',
  REFERENCED: 'Référencé gratuitement · aucun accord commercial',
  PARTNER: 'Partenaire de RME Voyage',
  AFFILIATE: 'Lien affilié : RME peut être rémunéré',
};
