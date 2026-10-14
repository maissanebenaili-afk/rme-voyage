/**
 * RME Lab — first brick of the Intent Engine (docs/rme-lab/NORTH_STAR.md).
 * Turns one sentence into the trip facts the user actually said. Pure and
 * deterministic: no LLM, no network. Only FACT_USER values come out; anything
 * not said stays in `unknown` — no default city, date or mode is ever filled in.
 * Not wired into production yet (IV-001, EXPERIMENT).
 */
import { CITY_SUGGESTIONS } from '@/lib/geocoding';
import { MOROCCO_CITIES } from '@/lib/moroccoCities';

export type Fact<T> = { value: T; status: 'FACT_USER'; evidence: string };
export type TripField = 'destination' | 'origin' | 'when' | 'travellers' | 'mode';

export type TripFacts = {
  destination?: Fact<{ key: string; label: string; country: 'MA' | 'SA' }>;
  origin?: Fact<{ label: string; countryCode: string }>;
  via?: Fact<{ key: string; label: string }>;
  when?: Fact<{ month?: number; day?: number; year?: number }>;
  travellers?: Fact<{ family?: boolean; children?: boolean }>;
  mode?: Fact<'car' | 'plane' | 'ferry'>;
  purpose?: Fact<'omra' | 'hajj'>;
  unknown: TripField[];
};

const MAX_CHARS = 2000;

export function norm(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ');
}

// Moroccan cities known to the Lab only; promoted to MOROCCO_CITIES once checked.
// Al Hoceïma has its own /trajet pages; the others are frequent MRE destinations.
const LAB_EXTRA_DESTINATIONS: Record<string, string> = {
  martil: 'Martil',
  'al hoceima': 'Al Hoceïma',
  chefchaouen: 'Chefchaouen',
  berkane: 'Berkane',
  driouch: 'Driouch',
  'el jadida': 'El Jadida',
  mohammedia: 'Mohammedia',
  ifrane: 'Ifrane',
  errachidia: 'Errachidia',
  dakhla: 'Dakhla',
  laayoune: 'Laâyoune',
  tiznit: 'Tiznit',
  taroudant: 'Taroudant',
  guelmim: 'Guelmim',
  asilah: 'Asilah',
  saidia: 'Saïdia',
  fnideq: 'Fnideq',
};

// Everyday spellings (Darija, Spanish, English) → the key of a city above or in MOROCCO_CITIES.
const LAB_CITY_ALIASES: Record<string, string> = {
  tanja: 'tanger',
  tetuan: 'tetouan',
  tetwan: 'tetouan',
  fez: 'fes',
  fass: 'fes',
  marrakesh: 'marrakech',
  mraksh: 'marrakech',
  wejda: 'oujda',
  'beni mellal': 'benimelal',
  'al-hoceima': 'al hoceima',
  alhoceima: 'al hoceima',
  'el hoceima': 'al hoceima',
  hoceima: 'al hoceima',
  lhoceima: 'al hoceima',
  alhucemas: 'al hoceima',
  chaouen: 'chefchaouen',
  xauen: 'chefchaouen',
  jdida: 'el jadida',
  'el-jadida': 'el jadida',
  layoune: 'laayoune',
};
// Words that are also everyday words: only taken after a place preposition.
const AMBIGUOUS = new Set(['safi', 'sale']);
const PLACE_PREP = /(?:^|\s)(?:a|au|vers|pour|to|naar|hacia|en|in|l|ila|via|par|de|depuis|from|desde|vanaf|da)\s+$/;

type CityHit = { key: string; label: string; index: number; end: number };

/** Every Moroccan city the Lab knows, by normalised key, with its French label. */
export const LAB_MOROCCAN_CITIES: Record<string, string> = {
  ...Object.fromEntries(Object.entries(MOROCCO_CITIES).map(([k, v]) => [norm(k), v.fr])),
  ...LAB_EXTRA_DESTINATIONS,
};

function moroccanHits(n: string): CityHit[] {
  // [spelling to look for, key of the city it names]
  const entries: Array<[string, string]> = [
    ...Object.keys(LAB_MOROCCAN_CITIES).map((k) => [k, k] as [string, string]),
    ...Object.entries(LAB_CITY_ALIASES),
  ];
  const seen = new Set<string>();
  const hits: CityHit[] = [];
  for (const [spelling, key] of entries) {
    const ns = norm(spelling);
    if (seen.has(ns)) continue;
    seen.add(ns);
    const re = new RegExp(`\\b${ns}\\b`, 'g');
    for (const m of n.matchAll(re)) {
      const index = m.index ?? 0;
      if (AMBIGUOUS.has(ns) && !PLACE_PREP.test(n.slice(0, index))) continue;
      hits.push({ key, label: LAB_MOROCCAN_CITIES[key], index, end: index + ns.length });
    }
  }
  return hits.sort((a, b) => a.index - b.index);
}

// Departure cities: the planner's list (Europe) plus West-African hubs.
const ORIGINS: Array<{ label: string; countryCode: string }> = [
  ...CITY_SUGGESTIONS.filter((c) => c.countryCode !== 'ma').map((c) => ({
    label: c.displayName.split(',')[0], countryCode: c.countryCode,
  })),
  { label: 'Conakry', countryCode: 'gn' },
  { label: 'Dakar', countryCode: 'sn' },
  { label: 'Abidjan', countryCode: 'ci' },
  { label: 'Bamako', countryCode: 'ml' },
];

const FROM_RE = /(?:depuis|from|desde|vanaf|van|mn|men|\bde|\bd|\bda)\s+$/;
const VIA_RE = /(?:via|par|en passant par|through|over|por)\s+$/;

const MONTHS: Array<[RegExp, number]> = [
  [/\b(janvier|january|enero|januari|gennaio|yanayir)\b/, 1],
  [/\b(fevrier|february|febrero|februari|febbraio|fbrayr)\b/, 2],
  [/\b(mars|march|marzo|maart|mars)\b/, 3],
  [/\b(avril|april|abril|aprile|abril)\b/, 4],
  [/\b(mai|may|mayo|mei|maggio|may)\b/, 5],
  [/\b(juin|june|junio|juni|giugno|yonyo)\b/, 6],
  [/\b(juillet|july|julio|juli|luglio|yolyoz)\b/, 7],
  [/\b(aout|august|agosto|augustus|ghosht|ghusht)\b/, 8],
  [/\b(septembre|september|septiembre|settembre|shutanbir)\b/, 9],
  [/\b(octobre|october|octubre|oktober|ottobre|oktobr)\b/, 10],
  [/\b(novembre|november|noviembre|nowanbir)\b/, 11],
  [/\b(decembre|december|diciembre|dicembre|dujanbir)\b/, 12],
];

const MODES: Array<[RegExp, 'car' | 'plane' | 'ferry']> = [
  [/\b(voiture|car|coche|auto|tomobil|tonobil|macchina)\b/, 'car'],
  [/\b(avion|plane|flight|vuelo|vliegtuig|aereo|tayyara|tiyara)\b/, 'plane'],
  [/\b(ferry|bateau|barco|boot|traghetto|babor)\b/, 'ferry'],
];

const FAMILY_RE = /\b(famille|family|familia|gezin|famiglia|l3a2ila|l3aila|la3ila)\b/;
const CHILDREN_RE = /\b(enfants?|kids|children|ninos|kinderen|bambini|drari|wlad)\b/;
const OMRA_RE = /\b(omra|oumra|umrah|umra|la mecque|makkah|mecca|la meca|mekka)\b/;
const HAJJ_RE = /\b(hajj|hadj|pelerinage)\b/;

export function extractTripFacts(input: string): TripFacts {
  const raw = typeof input === 'string' ? input.slice(0, MAX_CHARS) : '';
  const n = norm(raw).replace(/\s*(?:→|->|=>)\s*/g, ' → ');
  const facts: TripFacts = { unknown: [] };
  // Evidence is the user's own spelling (« Tanja », « août »), never RME's label.
  // norm() keeps the length of NFC text; with an arrow rewritten, the normalised text is used.
  const said = (index: number, length: number) => (raw.length === n.length ? raw : n).slice(index, index + length);

  // Origin: a known departure city right after "depuis / from / de …", or before an arrow.
  for (const o of ORIGINS) {
    const on = norm(o.label);
    const re = new RegExp(`\\b${on}\\b`, 'g');
    for (const m of n.matchAll(re)) {
      const idx = m.index ?? 0;
      const before = n.slice(0, idx);
      const after = n.slice(idx + on.length);
      if (FROM_RE.test(before) || /^\s*→/.test(after)) {
        facts.origin = { value: { label: o.label, countryCode: o.countryCode }, status: 'FACT_USER', evidence: said(idx, m[0].length) };
        break;
      }
    }
    if (facts.origin) break;
  }

  // Moroccan cities: a "via" hub, a Moroccan origin, then the destination.
  const hits = moroccanHits(n);
  let destination: CityHit | undefined;
  for (const h of hits) {
    const before = n.slice(0, h.index);
    if (!facts.via && VIA_RE.test(before)) {
      facts.via = { value: { key: h.key, label: h.label }, status: 'FACT_USER', evidence: said(h.index, h.end - h.index) };
      continue;
    }
    if (!facts.origin && (FROM_RE.test(before) || /^\s*→/.test(n.slice(h.end)))) {
      facts.origin = { value: { label: h.label, countryCode: 'ma' }, status: 'FACT_USER', evidence: said(h.index, h.end - h.index) };
      continue;
    }
    destination = h; // the last Moroccan city that is neither origin nor via
  }

  if (OMRA_RE.test(n) || HAJJ_RE.test(n)) {
    const isHajj = HAJJ_RE.test(n) && !/\b(omra|oumra|umrah|umra)\b/.test(n);
    const p = n.match(isHajj ? HAJJ_RE : OMRA_RE);
    facts.purpose = { value: isHajj ? 'hajj' : 'omra', status: 'FACT_USER', evidence: p ? said(p.index ?? 0, p[0].length) : '' };
    if (!destination) {
      facts.destination = { value: { key: 'makkah', label: 'La Mecque', country: 'SA' }, status: 'FACT_USER', evidence: facts.purpose.evidence };
    }
  }
  if (destination) {
    facts.destination = { value: { key: destination.key, label: destination.label, country: 'MA' }, status: 'FACT_USER', evidence: said(destination.index, destination.end - destination.index) };
  }

  // When: month (+ optional valid day), year only if written.
  for (const [re, month] of MONTHS) {
    const m = n.match(re);
    if (!m) continue;
    const when: { month?: number; day?: number; year?: number } = { month };
    const dayMatch = n.slice(0, m.index).match(/\b(\d{1,2})\s*(?:er)?\s*$/);
    if (dayMatch) {
      const day = Number(dayMatch[1]);
      if (day >= 1 && day <= 31) when.day = day;
    }
    const yearMatch = n.match(/\b(20\d{2})\b/);
    if (yearMatch) when.year = Number(yearMatch[1]);
    facts.when = { value: when, status: 'FACT_USER', evidence: said(m.index ?? 0, m[0].length) };
    break;
  }

  for (const [re, mode] of MODES) {
    const m = n.match(re);
    if (m) { facts.mode = { value: mode, status: 'FACT_USER', evidence: said(m.index ?? 0, m[0].length) }; break; }
  }

  const family = n.match(FAMILY_RE);
  const children = n.match(CHILDREN_RE);
  if (family || children) {
    facts.travellers = {
      value: { ...(family ? { family: true } : {}), ...(children ? { children: true } : {}) },
      status: 'FACT_USER',
      evidence: said((family ?? children)!.index ?? 0, (family ?? children)![0].length),
    };
  }

  const fields: TripField[] = ['destination', 'origin', 'when', 'travellers', 'mode'];
  facts.unknown = fields.filter((f) => facts[f] === undefined);
  return facts;
}

/** Share of the 5 core fields the user stated (a measure, not a quality claim). */
export function completeness(facts: TripFacts): number {
  return (5 - facts.unknown.length) / 5;
}
