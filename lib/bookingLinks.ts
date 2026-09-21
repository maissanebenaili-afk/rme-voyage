export type BookingType = 'flight' | 'ferry' | 'esim';

export const comparisonFallbacks: Record<BookingType, string> = {
  ferry: 'https://www.directferries.fr/',
  flight: 'https://www.skyscanner.fr/',
  esim: 'https://www.airalo.com/',
};

const partnerHosts: Record<BookingType, string[]> = {
  flight: ['tp.media', 'www.aviasales.com', 'www.skyscanner.fr'],
  ferry: ['www.directferries.fr', 'www.directferries.com', 'directferries.com', 'tp.media'],
  esim: ['www.airalo.com', 'airalo.com'],
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
