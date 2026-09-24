import { track } from '@vercel/analytics';

export type PartnerProduct = 'ferry' | 'flight' | 'transfer' | 'hotel' | 'car_rental' | 'other';

export type PartnerClickEvent = {
  partner: string;
  product: PartnerProduct;
  placement: string;
  page: string;
};

export function trackPartnerClick(event: PartnerClickEvent): void {
  if (typeof window === 'undefined') return;

  track('partner_click', {
    partner: event.partner,
    product: event.product,
    placement: event.placement,
    page: event.page,
  });
}
