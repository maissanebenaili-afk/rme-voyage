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
};

type AnalyticsWindow = Window & {
  va?: (event: string, properties?: Record<string, string>) => void;
};

export function trackFunnelEvent(event: FunnelEvent): void {
  if (typeof window === 'undefined') return;

  const analytics = window as AnalyticsWindow;
  if (typeof analytics.va === 'function') {
    analytics.va(event.event, {
      placement: event.placement,
      page: event.page ?? window.location.pathname,
    });
  }
}

// Un seul événement par clic : l'ancien appel supplémentaire à
// trackFunnelEvent('partner_click') doublait chaque clic partenaire.
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
