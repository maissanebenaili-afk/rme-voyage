import { track } from '@vercel/analytics';

export type PartnerProduct = 'ferry' | 'flight' | 'transfer' | 'hotel' | 'car_rental' | 'other';

export type PartnerClickEvent = {
  partner: string;
  product: PartnerProduct;
  placement: string;
  page: string;
};

export type FunnelEvent = {
  event: string;
  placement: string;
  page?: string;
  /** Contexte non personnel (ex. has_ferry), jamais d'adresse ni de ville saisie. */
  data?: Record<string, string | number | boolean>;
};

// Passe par track() de @vercel/analytics : le script Vercel n'accepte que
// va('event', { name, data }). L'ancien appel direct va(nom, props) était
// ignoré, si bien qu'aucun événement de l'entonnoir n'était enregistré.
export function trackFunnelEvent(event: FunnelEvent): void {
  if (typeof window === 'undefined') return;
  track(event.event, {
    ...event.data,
    placement: event.placement,
    page: event.page ?? window.location.pathname,
  });
}

export function trackPartnerClick(event: PartnerClickEvent): void {
  if (typeof window === 'undefined') return;
  track('partner_click', {
    partner: event.partner,
    product: event.product,
    placement: event.placement,
    page: event.page,
  });
}
