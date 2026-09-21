import { verifiedPartnerUrl } from './bookingLinks';

export type AffiliateProvider = 'travelpayouts' | 'directferries' | 'airalo';
type Trip = { origin: string; destination: string; date?: string };

// Use the COMPLETE link supplied by the approved partner dashboard.
// A publisher ID alone does not prove programme approval, tracking format,
// product ID or support for city/date deep links. Never manufacture those.
export function buildFlightAffiliateUrl(_params: Trip) {
  return verifiedPartnerUrl(process.env.TRAVELPAYOUTS_FLIGHT_URL, 'flight');
}

export function buildFerryAffiliateUrl(_params: Trip) {
  return verifiedPartnerUrl(process.env.DIRECT_FERRIES_AFFILIATE_URL, 'ferry');
}

export function buildAiraloAffiliateUrl(_params?: Trip) {
  // Airalo affiliate link - simple ref parameter
  const affiliateId = process.env.AIRALO_AFFILIATE_ID;
  if (!affiliateId) return null;

  const url = new URL('https://www.airalo.com/');
  url.searchParams.set('ref', affiliateId);
  url.searchParams.set('utm_source', 'rme-voyage');
  url.searchParams.set('utm_medium', 'affiliate');

  return url.toString();
}
