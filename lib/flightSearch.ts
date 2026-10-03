/**
 * Pre-filled flight search (Aviasales, through Travelpayouts). Two parts, kept apart:
 *
 * 1. The search URL is Aviasales' documented format, built here:
 *    https://www.aviasales.com/search/PAR0310TNG1 = Paris, 3 October, Tanger, 1 passenger
 *    (origin IATA + DDMM + destination IATA + passengers; without a date the
 *    form opens pre-filled at /?params=PARTNG1).
 * 2. The tracking is never built here. It comes from a deep link generated in
 *    the Travelpayouts dashboard and pasted as a template, in which `{url}`
 *    replaces the Aviasales address. RME only substitutes that address.
 */
import { isAllowedPartnerHost } from '@/lib/bookingLinks';

// IATA codes of the cities RME serves, keyed by lower-case accent-free name.
// A city without its own airport is left out on purpose: no silent substitution.
const IATA: Record<string, string> = {
  // Departures in Europe (the /trajet origins and the planner's list).
  paris: 'PAR', lyon: 'LYS', marseille: 'MRS', nice: 'NCE', toulouse: 'TLS', bordeaux: 'BOD', lille: 'LIL',
  strasbourg: 'SXB', nantes: 'NTE', montpellier: 'MPL', bruxelles: 'BRU', brussels: 'BRU', anvers: 'ANR',
  liege: 'LGG', amsterdam: 'AMS', rotterdam: 'RTM', madrid: 'MAD', barcelone: 'BCN', barcelona: 'BCN',
  valence: 'VLC', milan: 'MIL', turin: 'TRN', bologne: 'BLQ', francfort: 'FRA', 'francfort-sur-le-main': 'FRA',
  cologne: 'CGN', dusseldorf: 'DUS', geneve: 'GVA',
  // Moroccan airports.
  casablanca: 'CMN', marrakech: 'RAK', agadir: 'AGA', fes: 'FEZ', tanger: 'TNG', nador: 'NDR', oujda: 'OUD',
  rabat: 'RBA', 'al hoceima': 'AHU', tetouan: 'TTU', essaouira: 'ESU', ouarzazate: 'OZZ', dakhla: 'VIL',
  laayoune: 'EUN', errachidia: 'ERH', 'beni mellal': 'BEM', guelmim: 'GLN',
};

const TEMPLATE_HOST_PLACEHOLDER = '{url}';
// Stand-in address used only to check where {url} lands in a template.
const PROBE_URL = 'https://www.aviasales.com/';
const MAX_PASSENGERS = 9;

function cityKey(label: string): string {
  return label
    .split(',')[0]
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

export function iataOf(label: string | undefined): string | undefined {
  return label ? IATA[cityKey(label)] : undefined;
}

/** Aviasales search for a one-way trip; null when a city has no known airport. */
export function aviasalesSearchUrl(input: { origin: string; destination: string; date?: string; passengers?: number }): string | null {
  const from = iataOf(input.origin);
  const to = iataOf(input.destination);
  if (!from || !to || from === to) return null;
  const passengers = Math.min(Math.max(Math.trunc(input.passengers ?? 1), 1), MAX_PASSENGERS);
  const date = input.date && /^\d{4}-\d{2}-\d{2}$/.test(input.date) ? input.date : undefined;
  if (!date) return `https://www.aviasales.com/?params=${from}${to}${passengers}`;
  const [, month, day] = date.split('-');
  return `https://www.aviasales.com/search/${from}${day}${month}${to}${passengers}`;
}

/**
 * A dashboard deep link with its Aviasales address replaced by `{url}`, e.g.
 * https://tp.media/r?marker=123456&trs=7890&p=4114&u={url}. Accepted only over
 * https, on a trusted Travelpayouts host, with exactly one `{url}` as a query value.
 */
export function isValidDeepLinkTemplate(template: string | undefined): template is string {
  if (!template?.trim()) return false;
  const value = template.trim();
  if (value.split(TEMPLATE_HOST_PLACEHOLDER).length !== 2) return false;
  try {
    const url = new URL(value.replace(TEMPLATE_HOST_PLACEHOLDER, encodeURIComponent(PROBE_URL)));
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false;
    if (!isAllowedPartnerHost(url.hostname, ['tp.media'])) return false;
    return [...url.searchParams.values()].some((param) => param === PROBE_URL);
  } catch {
    return false;
  }
}

/** The pre-filled, tracked flight link, or null (the caller keeps the generic dashboard link). */
export function prefilledFlightLink(
  template: string | undefined,
  trip: { origin: string; destination: string; date?: string },
): string | null {
  if (!isValidDeepLinkTemplate(template)) return null;
  const search = aviasalesSearchUrl(trip);
  return search ? template.trim().replace(TEMPLATE_HOST_PLACEHOLDER, encodeURIComponent(search)) : null;
}
