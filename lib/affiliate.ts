import { verifiedPartnerUrl } from './bookingLinks';

export type AffiliateProvider = 'travelpayouts' | 'directferries';
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
