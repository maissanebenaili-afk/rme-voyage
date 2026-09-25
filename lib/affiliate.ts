import { verifiedPartnerUrl } from './bookingLinks';

export type AffiliateProvider = 'travelpayouts' | 'directferries';
export type FerryAffiliateProvider = 'direct_ferries' | 'gnv' | 'frs';
type Trip = { origin: string; destination: string; date?: string };

// Use the COMPLETE link supplied by the approved partner dashboard.
// A publisher ID alone does not prove programme approval, tracking format,
// product ID or support for city/date deep links. Never manufacture those.
export function buildFlightAffiliateUrl(_params: Trip) {
  return verifiedPartnerUrl(process.env.TRAVELPAYOUTS_FLIGHT_URL, 'flight');
}

// Tried in this order; the first partner with a complete, verified dashboard
// link wins. Each env var is independent — setting GNV_AFFILIATE_URL does not
// require Direct Ferries or FRS to also be configured, and vice versa.
const FERRY_PROVIDERS: { provider: FerryAffiliateProvider; envVar: string }[] = [
  { provider: 'direct_ferries', envVar: 'DIRECT_FERRIES_AFFILIATE_URL' },
  { provider: 'gnv', envVar: 'GNV_AFFILIATE_URL' },
  { provider: 'frs', envVar: 'FRS_AFFILIATE_URL' },
];

export function buildFerryAffiliateUrl(
  _params: Trip,
): { url: string; provider: FerryAffiliateProvider } | null {
  for (const { provider, envVar } of FERRY_PROVIDERS) {
    const url = verifiedPartnerUrl(process.env[envVar], 'ferry');
    if (url) return { url, provider };
  }
  return null;
}
