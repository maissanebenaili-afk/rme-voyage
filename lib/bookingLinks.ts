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

export function verifiedPartnerUrl(value: string | undefined, type: BookingType): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null;
    if (!partnerHosts[type].includes(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}
