export type BookingType = 'flight' | 'ferry' | 'other';

export const comparisonFallbacks: Record<'flight' | 'ferry', string> = {
  ferry: 'https://www.directferries.fr/',
  flight: 'https://www.skyscanner.fr/',
};

const partnerHosts: Record<BookingType, string[]> = {
  flight: ['tp.media', 'www.aviasales.com', 'www.skyscanner.fr'],
  ferry: [
    'www.directferries.fr', 'www.directferries.com', 'directferries.com', 'tp.media',
    'www.gnv.it', 'www.frs.es',
  ],
  other: [
    'www.unibet.fr', 'unibet.fr',
    'www.betclic.fr', 'betclic.fr',
    'www.winamax.fr', 'winamax.fr',
    'www.bet365.fr', 'bet365.fr',
    'tp.media',
  ],
};

// Travelpayouts' link generator returns short links on a brand subdomain of
// tp.st (e.g. https://aviasales.tp.st/AbCd1234). They are accepted only where
// tp.media, the Travelpayouts long-link host, is already trusted.
const TRAVELPAYOUTS_SHORT_LINK_HOST = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.tp\.st$/;

export function isAllowedPartnerHost(hostname: string, allowedHosts: readonly string[]): boolean {
  if (allowedHosts.includes(hostname)) return true;
  return allowedHosts.includes('tp.media') && TRAVELPAYOUTS_SHORT_LINK_HOST.test(hostname);
}

export function verifiedPartnerUrl(value: string | undefined, type: BookingType, allowedHosts?: string[]): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    if (!isAllowedPartnerHost(url.hostname, allowedHosts ?? partnerHosts[type])) return null;
    return url.toString();
  } catch {
    return null;
  }
}
