import type { RmeEventName, RmeEventProps } from '@/lib/rmeEvents';

export type PartnerProduct = 'ferry' | 'flight' | 'transfer' | 'hotel' | 'car_rental' | 'other';

export type PartnerClickEvent = {
  partner: string;
  product: PartnerProduct;
  placement: string;
  page: string;
  /** Contexte non personnel (ex. has_crossing), jamais une ville saisie. */
  context?: Record<string, string | number | boolean>;
};

export type FunnelEvent = {
  event: Exclude<RmeEventName, 'partner_click'>;
  placement: string;
  page?: string;
  /** Contexte non personnel (ex. has_ferry), jamais d'adresse ni de ville saisie. */
  data?: Record<string, string | number | boolean>;
};

// Envoi au journal d'événements anonyme de RME (/api/events), qui remplace
// Vercel Analytics (inactif hors Vercel). sendBeacon survit à la navigation
// vers le site partenaire ; un échec d'envoi n'interrompt jamais l'interface.
function send(event: RmeEventName, props: RmeEventProps): void {
  try {
    const body = JSON.stringify({ event, props });
    const sent = typeof navigator.sendBeacon === 'function'
      && navigator.sendBeacon('/api/events', new Blob([body], { type: 'application/json' }));
    if (!sent) {
      void fetch('/api/events', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' } })
        .catch(() => undefined);
    }
  } catch {
    // mesure seulement : ne jamais casser l'app
  }
}

export function trackFunnelEvent(event: FunnelEvent): void {
  if (typeof window === 'undefined') return;
  send(event.event, {
    ...event.data,
    placement: event.placement,
    page: event.page ?? window.location.pathname,
  });
}

export function trackPartnerClick(event: PartnerClickEvent): void {
  if (typeof window === 'undefined') return;
  send('partner_click', {
    ...event.context,
    partner: event.partner,
    product: event.product,
    placement: event.placement,
    page: event.page,
  });
}
