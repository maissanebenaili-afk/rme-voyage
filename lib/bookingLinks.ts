export type BookingType = 'flight' | 'ferry';

export const comparisonFallbacks: Record<BookingType, string> = {
  ferry: 'https://www.directferries.fr/',
  flight: 'https://www.skyscanner.fr/',
};

const partnerHosts: Record<BookingType, string[]> = {
  flight: ['tp.media', 'www.aviasales.com', 'www.skyscanner.fr'],
  // gnv.it (Grandi Navi Veloci) and frs.es (FRS) are the operators' own
  // booking domains, per their public partner pages (lib/affiliate.ts).
  ferry: [
    'www.directferries.fr', 'www.directferries.com', 'directferries.com', 'tp.media',
    'www.gnv.it', 'www.frs.es',
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
