export type PartnerProduct = 'ferry' | 'flight' | 'transfer' | 'hotel' | 'car_rental' | 'other';

export type PartnerClickEvent = {
  partner: string;
  product: PartnerProduct;
  placement: string;
  page: string;
};

type AnalyticsWindow = Window & {
  va?: (event: string, properties?: Record<string, string>) => void;
};

export function trackPartnerClick(event: PartnerClickEvent): void {
  if (typeof window === 'undefined') return;

  const analytics = window as AnalyticsWindow;
  if (typeof analytics.va === 'function') {
    analytics.va('partner_click', {
      partner: event.partner,
      product: event.product,
      placement: event.placement,
      page: event.page,
    });
  }
}
