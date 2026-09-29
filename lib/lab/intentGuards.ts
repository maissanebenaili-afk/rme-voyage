/**
 * RME Lab — guards against silent errors in the intent reading. Each one only
 * removes or adds a fact when the user's own words prove it; otherwise the fact
 * stays unknown and the planner asks. Pure, not wired into production.
 */
import { extractTripFacts, norm, ORIGINS, type TripFacts } from '@/lib/tripFacts';

// norm() keeps the length of NFC text, so an index found in the normalised
// sentence points at the user's own spelling (« hôtel », not « hotel »).
export function saidAt(raw: string, n: string, index: number, length: number): string {
  return (raw.length === n.length ? raw : n).slice(index, index + length);
}

export type Direction = { value: 'return'; status: 'INFERENCE'; evidence: string; to?: string };

// « pas à Marrakech », « sauf Tanger »: a city the user rules out is not the destination.
const NEGATED_PLACE_BEFORE = /\b(?:pas|not|sauf|except|excepto|behalve|machi)\s+(?:(?:a|au|aux|de|d|to|vers|pour|l|ila|f|fi|in|en|naar)\s+)?$/;

export function withoutNegatedCities(raw: string): string {
  let text = raw;
  for (let i = 0; i < 3; i++) {
    const trip = extractTripFacts(text);
    const evidence = trip.destination?.evidence;
    if (!evidence || trip.destination?.value.country !== 'MA') break;
    const n = norm(text);
    const needle = norm(evidence);
    const index = n.lastIndexOf(needle);
    if (index < 0 || n.length !== text.length) break;
    if (!NEGATED_PLACE_BEFORE.test(n.slice(0, index))) break;
    text = text.slice(0, index) + ' '.repeat(evidence.length) + text.slice(index + evidence.length);
  }
  return text;
}

// « ma voiture est en panne »: the car is not how the trip will be made.
export const BROKEN_MODE_RE = /\b(?:voiture|tomobil|car|auto)\s+(?:est\s+|kanet\s+|is\s+)?(?:en\s+panne|kharba|kharbat|broken(?:\s+down)?)\b/g;

const PRESENT_BEFORE = /(?:je suis|on est|nous sommes|j habite|on habite|je vis|on vit|i am|i m|im|ik ben|wij zijn|estoy|estamos|ana|kan9im|kanskon)\s+(?:a|au|in|en|f|fi|de|d)?\s*$/;

/** « je suis à Paris », « Paris Tanger », « vol Paris Casablanca »: where they leave from. */
export function presenceOrigin(raw: string, n: string, facts: TripFacts): TripFacts['origin'] {
  const destinationWord = facts.destination ? norm(facts.destination.evidence) : undefined;
  for (const o of ORIGINS) {
    const on = norm(o.label);
    for (const m of n.matchAll(new RegExp(`\\b${on}\\b`, 'g'))) {
      const index = m.index ?? 0;
      const next = n.slice(index + on.length);
      const beside = destinationWord !== undefined && next.startsWith(' ') && next.trimStart().startsWith(destinationWord);
      if (PRESENT_BEFORE.test(n.slice(0, index)) || beside) {
        return { value: { label: o.label, countryCode: o.countryCode }, status: 'FACT_USER', evidence: saidAt(raw, n, index, on.length) };
      }
    }
  }
  return undefined;
}

const RETURN_MARKER = /\b(?:retour|rentre|rentrer|rentrons|retourne|retourner|back|return|returning|terug|volver|regreso|vuelta|kanrje3|knrje3|nrje3|rje3|kanrjaa|rjou3)\b/;
const EUROPE_COUNTRY = /\b(?:en|au|aux|vers|a|l|ila)\s+(france|belgique|espagne|allemagne|pays[- ]bas|italie|suisse|europe|angleterre|royaume[- ]uni|luxembourg|portugal)\b/;
const COUNTRY_LABEL: Record<string, string> = { 'pays bas': 'Pays-Bas', 'pays-bas': 'Pays-Bas', 'royaume uni': 'Royaume-Uni', 'royaume-uni': 'Royaume-Uni' };
const MOROCCO_WORD = /\b(?:maroc|morocco|marruecos|marokko|l?bled)\b/;
const LEAVING_MOROCCO = /\b(?:du|de|depuis|from|desde|vanaf|men|mn|d)\s+(?:le\s+|l\s+)?(?:l?bled|maroc|morocco|marruecos|marokko)\b/;

/**
 * The trip goes from Morocco to Europe: « je rentre du Maroc à Bruxelles »,
 * « retour Casablanca Paris », « kanrje3 men Tanja l Lyon ». « je rentre au bled »
 * is the other direction and is not touched.
 */
export function returnTrip(raw: string, n: string, facts: TripFacts): { direction: Direction; origin?: TripFacts['origin'] } | undefined {
  const marker = n.match(RETURN_MARKER);
  const leaving = n.match(LEAVING_MOROCCO);
  const europe = ORIGINS.find((o) => new RegExp(`\\b${norm(o.label)}\\b`).test(n));
  const country = n.match(EUROPE_COUNTRY);
  const countryName = country ? (COUNTRY_LABEL[country[1]] ?? country[1].charAt(0).toUpperCase() + country[1].slice(1)) : undefined;
  const toEurope = europe ? { to: europe.label } : countryName ? { to: countryName } : {};
  const said = (m: RegExpMatchArray) => saidAt(raw, n, m.index ?? 0, m[0].length);

  const fromMoroccanCity = facts.origin?.value.countryCode === 'ma' && !facts.destination;
  if (fromMoroccanCity && (marker || europe || country)) {
    return { direction: { value: 'return', status: 'INFERENCE', evidence: facts.origin!.evidence, ...toEurope } };
  }
  if (leaving && !facts.destination && (marker || europe || country)) {
    return { direction: { value: 'return', status: 'INFERENCE', evidence: said(leaving), ...toEurope } };
  }
  // « je dois rentrer en France demain »: coming back, from a Morocco nobody had to name.
  if (marker && country && !europe && !facts.destination && !facts.origin && !MOROCCO_WORD.test(n)) {
    return { direction: { value: 'return', status: 'INFERENCE', evidence: said(marker), ...toEurope } };
  }
  // « retour Casablanca Paris »: a Moroccan city straight followed by a European one.
  if (marker && europe && facts.destination && !facts.origin) {
    const city = norm(facts.destination.evidence);
    const at = n.indexOf(city);
    if (at >= 0 && n.slice(at + city.length).trimStart().startsWith(norm(europe.label)) && n.slice(at + city.length).startsWith(' ')) {
      const origin: TripFacts['origin'] = { value: { label: facts.destination.value.label, countryCode: 'ma' }, status: 'FACT_USER', evidence: facts.destination.evidence };
      return { direction: { value: 'return', status: 'INFERENCE', evidence: said(marker), ...toEurope }, origin };
    }
  }
  return undefined;
}

const PAST = /\b(?:hier|l annee derniere|l an dernier|l ete dernier|le mois dernier|la semaine derniere|il y a \d+ (?:jours?|semaines?|mois|ans?)|je suis alle|je suis allee|on est alle|on est alles|nous sommes alles|j etais|on etait|c etait|yesterday|last (?:year|month|week|summer)|we went|i went|i was|ik ben geweest|ik was|fuimos|mshit|mchit|kount|konna)\b/;
const WANTS = /\b(?:dois|doit|devons|veux|voudrais|voudrions|souhaite|envie|prevois|pars|partir|partons|vais|allons|aller|repars|repartir|retourner|revenir|reviens|besoin|faut|bghit|nbghi|nmshi|kanmshi|ghadi|want|going to|will|plan|quiero|voy|wil|ga)\b/;

/** A memory, not a plan: « hier je suis allé à Nador ». Only when nothing says they want to go. */
export function pastStory(raw: string, n: string, hasFutureDate: boolean): string | undefined {
  if (hasFutureDate) return undefined;
  const m = n.match(PAST);
  if (!m || WANTS.test(n)) return undefined;
  return saidAt(raw, n, m.index ?? 0, m[0].length);
}

const MODE_WORD = '(?:voiture|car|coche|auto|tomobil|tonobil|avion|plane|flight|vuelo|vliegtuig|tiyara|tayyara|ferry|bateau|barco|boot|babor)';
const MODE_CHOICE = new RegExp(`\\b(${MODE_WORD})\\b\\s+(?:ou|or|of|o|oder|wla|walla)\\s+(?:en\\s+|b\\s+|by\\s+|con\\s+|met\\s+)?(?:l\\s+|la\\s+|le\\s+|de\\s+)?\\b(${MODE_WORD})\\b`);

const modeOf = (word: string) => (/voiture|car|coche|auto|tomobil|tonobil/.test(word) ? 'car' : /avion|plane|flight|vuelo|vliegtuig|tiyara|tayyara/.test(word) ? 'plane' : 'ferry');

/**
 * « en avion ou en voiture »: two modes offered is no mode chosen, until the user says one
 * after it (« … en voiture »): what is said last decides, as for the city.
 */
export function resolveModeChoice(raw: string, n: string): { undecided: boolean; later?: TripFacts['mode'] } {
  const m = n.match(MODE_CHOICE);
  if (!m || modeOf(m[1]) === modeOf(m[2])) return { undecided: false };
  const text = raw.length === n.length ? raw : n;
  const later = extractTripFacts(text.slice((m.index ?? 0) + m[0].length)).mode;
  return later ? { undecided: false, later } : { undecided: true };
}

const OR_BEFORE = /\b(?:ou|or|of|wla|walla|o)\s+(?:(?:a|au|vers|pour|to|l|in|naar)\s+)?$/;
const OR_BETWEEN = /^\s*(?:ou|or|of|wla|walla|o)\s+(?:(?:a|au|vers|pour|to|l|in|naar)\s+)?$/;

const blank = (text: string, index: number, length: number) => text.slice(0, index) + ' '.repeat(length) + text.slice(index + length);

function findAlternatives(raw: string): { a: NonNullable<TripFacts['destination']>; b: NonNullable<TripFacts['destination']>; ai: number; bi: number } | undefined {
  const b = extractTripFacts(raw).destination;
  const n = norm(raw);
  if (!b || b.value.country !== 'MA' || n.length !== raw.length) return undefined;
  const bi = n.lastIndexOf(norm(b.evidence));
  if (bi < 0 || !OR_BEFORE.test(n.slice(0, bi))) return undefined;
  const a = extractTripFacts(blank(raw, bi, b.evidence.length)).destination;
  if (!a || a.value.country !== 'MA') return undefined;
  const ai = n.lastIndexOf(norm(a.evidence), bi);
  if (ai < 0 || !OR_BETWEEN.test(n.slice(ai + a.evidence.length, bi))) return undefined;
  return { a, b, ai, bi };
}

/** « Tanger ou Nador » offers two cities: no destination is chosen for the user. */
export function withoutAlternativeCities(raw: string): string {
  const found = findAlternatives(raw);
  if (!found) return raw;
  return blank(blank(raw, found.bi, found.b.evidence.length), found.ai, found.a.evidence.length);
}

export type Alternatives = { evidence: string; options: string[] };

/** The two cities offered, with the user's own words, so RME can ask the one question left. */
export function alternativeCities(raw: string): Alternatives | undefined {
  const found = findAlternatives(raw);
  if (!found) return undefined;
  return { evidence: raw.slice(found.ai, found.bi + found.b.evidence.length), options: [found.a.value.label, found.b.value.label] };
}

const MODE_AFTER = '(?!\\s+(?:en|par|via)\\s+(?:voiture|avion|ferry|bateau|car|train|bus))';
const CANCEL_CLEAR = [
  new RegExp(`\\bne (?:pars|part|partons|vais|vas|va|allons|voyage|voyageons) plus\\b${MODE_AFTER}`),
  /\b(?:on|je|nous) n y (?:va|vais|allons|vas) pas\b/,
  /\bfinalement (?:je|on|nous) (?:reste|restons|ne (?:pars|partons|vais|allons))\b/,
  /\bma (?:nbghich|nmshich|ghadich|bghitch|mshitch)\b/,
  /\b(?:no voy|i m not going|i am not going|we are not going|ik ga niet)\b/,
];
const CANCEL_TRIP = [
  /\b(?:voyage|sejour|vacances|trip)\b[^.?!]{0,30}\b(?:annule|annulee|annules|cancel+ed)\b/,
  /\b(?:annule|annulee|cancel+ed)\b[^.?!]{0,20}\b(?:voyage|sejour|vacances|trip)\b/,
];
const CANCEL_POLICY = /\b(?:annulation (?:gratuite|possible|flexible)|conditions d annulation|free cancell?ation)\b/;

/** « je ne pars plus à Tanger », « voyage annulé »: nothing to plan. A cancelled flight with a wish to go is not this. */
export function cancelledTrip(raw: string, n: string): string | undefined {
  for (const re of CANCEL_CLEAR) {
    const m = n.match(re);
    if (m) return saidAt(raw, n, m.index ?? 0, m[0].length);
  }
  if (WANTS.test(n) || CANCEL_POLICY.test(n)) return undefined;
  for (const re of CANCEL_TRIP) {
    const m = n.match(re);
    if (m) return saidAt(raw, n, m.index ?? 0, m[0].length);
  }
  return undefined;
}

const UNIT_AFTER = /^\s*(?:h|heures?|kg|km|euros?|€|%|personnes?|places?|nuits?|jours?)\b/;

/** « 15/08 », « 15/08/2026 », « 15.08.2026 »: day first, as written in Europe. Two-part dates need « / ». */
export function numericDate(raw: string, n: string): TripFacts['when'] {
  for (const m of n.matchAll(/(?<![\d/.-])(\d{1,2})([/.-])(\d{1,2})(?:\2(\d{4}|\d{2}))?(?![\d/])/g)) {
    const [text, d, sep, mo, y] = m;
    if (!y && sep !== '/') continue;
    if (UNIT_AFTER.test(n.slice((m.index ?? 0) + text.length))) continue;
    const day = Number(d), month = Number(mo);
    const year = y ? (y.length === 2 ? 2000 + Number(y) : Number(y)) : undefined;
    if (day < 1 || day > 31 || month < 1 || month > 12) continue;
    if (year !== undefined && (year < 2020 || year > 2100)) continue;
    return { value: { month, day, ...(year ? { year } : {}) }, status: 'FACT_USER', evidence: saidAt(raw, n, m.index ?? 0, text.length) };
  }
  return undefined;
}
