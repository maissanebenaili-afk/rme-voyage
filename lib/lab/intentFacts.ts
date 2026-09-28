/**
 * RME Lab — Magic Button, step 1. Adds to extractTripFacts() what a vague
 * sentence carries: the country alone (« Maroc », « bled »), a relative date
 * (« ce week-end », « samedi ») and the needs said out loud (« hôtel »,
 * « envoyer de l'argent »). Pure: `today` (YYYY-MM-DD, the user's local date)
 * is passed in. A computed date is an INFERENCE, never a FACT_USER, and nothing
 * is filled in by default. Not wired into production.
 */
import { extractTripFacts, norm, type Fact, type TripFacts } from '@/lib/tripFacts';

export type Need = 'flight' | 'hotel' | 'car_rental' | 'ferry' | 'sim' | 'money' | 'papers';

export type Horizon = {
  /** The user's own words, e.g. « ce week-end ». */
  said: string;
  start: string;
  end: string;
  status: 'INFERENCE';
};

export type IntentFacts = TripFacts & {
  /** Only when no city was named. « bled » is RME's reading of the word, hence INFERENCE. */
  country?: { value: 'MA'; status: 'FACT_USER' | 'INFERENCE'; evidence: string };
  horizon?: Horizon;
  /** In the order they were said. */
  needs: Array<Fact<Need>>;
};

const MAX_CHARS = 2000;
const DAY_MS = 86_400_000;

// norm() keeps the length of NFC text, so an index found in the normalised
// sentence points at the user's own spelling (« hôtel », not « hotel »).
function saidAt(raw: string, n: string, index: number, length: number): string {
  return (raw.length === n.length ? raw : n).slice(index, index + length);
}

const COUNTRY_RE = /\b(?:maroc|morocco|marruecos|marokko|marocco|l[- ]?maghrib)\b/g;
const HOME_RE = /\b(?:l?bled)\b/g;
const PRAYER_RE = /\b(?:salat|sala|priere|prayer|adhan|wa9t)\b/;
const FROM_BEFORE_RE = /\b(?:depuis|from|desde|vanaf|van|mn|men|du|de|d)\s+(?:le\s+|l\s+|el\s+)?$/;
const BRAND_BEFORE_RE = /\bair\s+$/;
const BRAND_AFTER_RE = /^\s*telecom\b/;

function findCountry(raw: string, n: string): IntentFacts['country'] {
  const readings = [[COUNTRY_RE, 'FACT_USER'], [HOME_RE, 'INFERENCE']] as const;
  for (const [re, status] of readings) {
    for (const m of n.matchAll(re)) {
      const index = m.index ?? 0;
      const before = n.slice(0, index);
      if (FROM_BEFORE_RE.test(before) || BRAND_BEFORE_RE.test(before)) continue;
      if (BRAND_AFTER_RE.test(n.slice(index + m[0].length))) continue;
      if (m[0].includes('maghrib') && PRAYER_RE.test(n)) continue; // « salat l-maghrib » is a prayer
      return { value: 'MA', status, evidence: saidAt(raw, n, index, m[0].length) };
    }
  }
  return undefined;
}

type Range = [number, number];
const plus = (t: number, days: number) => t + days * DAY_MS;

function weekend(t: number, dow: number, next: boolean): Range {
  if (dow === 6) return next ? [plus(t, 7), plus(t, 8)] : [t, plus(t, 1)];
  if (dow === 0) return next ? [plus(t, 6), plus(t, 7)] : [t, t];
  const saturday = plus(t, 6 - dow);
  return [saturday, plus(saturday, 1)];
}

// Morocco's diaspora season: July and August, this year until it has passed.
function summer(t: number): Range {
  const year = new Date(t).getUTCFullYear();
  const y = t > Date.UTC(year, 7, 31) ? year + 1 : year;
  return [Math.max(Date.UTC(y, 6, 1), t), Date.UTC(y, 7, 31)];
}

const RELATIVE: Array<[RegExp, (t: number, dow: number, m: RegExpMatchArray) => Range | null]> = [
  [/\b(?:apres-demain|apres demain|day after tomorrow|pasado manana|overmorgen|dopodomani|ba3d ghedda|be3d ghedda)\b/, (t) => [plus(t, 2), plus(t, 2)]],
  [/\b(?:demain|tomorrow|morgen|domani|ghedda|ghda)\b/, (t) => [plus(t, 1), plus(t, 1)]],
  [/\b(?:aujourd hui|ce soir|today|tonight|hoy|vandaag|oggi|lyoum|lyouma)\b/, (t) => [t, t]],
  [/\b(?:week[- ]?end prochain|prochain week[- ]?end|next weekend|proximo fin de semana|fin de semana que viene|volgend weekend|prossimo weekend|prossimo fine settimana|l ?week[- ]?end jay|l ?wikand jay)\b/, (t, dow) => weekend(t, dow, true)],
  [/\b(?:ce week[- ]?end|this weekend|este fin de semana|dit weekend|deze weekend|questo weekend|questo fine settimana|had l ?week[- ]?end|had l ?wikand)\b/, (t, dow) => weekend(t, dow, false)],
  [/\b(?:semaine prochaine|prochaine semaine|next week|semana que viene|proxima semana|volgende week|settimana prossima|prossima settimana|s[i]?mana jaya)\b/, (t, dow) => {
    const monday = plus(t, (8 - dow) % 7 || 7);
    return [monday, plus(monday, 6)];
  }],
  [/\b(?:cette semaine|this week|esta semana|deze week|questa settimana|had s[i]?mana)\b/, (t, dow) => [t, plus(t, (7 - dow) % 7)]],
  [/\b(?:dans|in|en|over|tra|mn daba)\s+(\d{1,2})\s+(?:jours?|days?|dias|dagen|giorni|ayam|iyam|iyyam)\b/, (t, _dow, m) => {
    const days = Number(m[1]);
    return days >= 1 && days <= 60 ? [plus(t, days), plus(t, days)] : null;
  }],
  [/\b(?:cet ete|l ete prochain|this summer|next summer|este verano|deze zomer|quest estate|questa estate|had s-?sif|f s-?sif|fsif)\b/, (t) => summer(t)],
];

// Darija « tnin » / « tlata » are left out: they also mean two and three.
const WEEKDAYS: Array<[RegExp, number]> = [
  [/\b(?:lundi|monday|lunes|maandag|lunedi)\b/, 1],
  [/\b(?:mardi|tuesday|martes|dinsdag|martedi)\b/, 2],
  [/\b(?:mercredi|wednesday|miercoles|woensdag|mercoledi|larb3a?)\b/, 3],
  [/\b(?:jeudi|thursday|jueves|donderdag|giovedi|l?khmis)\b/, 4],
  [/\b(?:vendredi|friday|viernes|vrijdag|venerdi|jem3a|jm3a)\b/, 5],
  [/\b(?:samedi|saturday|sabado|zaterdag|sabato|s?sebt)\b/, 6],
  [/\b(?:dimanche|sunday|domingo|zondag|domenica|l7ed|lhed)\b/, 0],
];

function findHorizon(raw: string, n: string, today: string): Horizon | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return undefined;
  const t = Date.parse(`${today}T00:00:00Z`);
  if (!Number.isFinite(t)) return undefined;
  const dow = new Date(t).getUTCDay();
  const toIso = (time: number) => new Date(time).toISOString().slice(0, 10);

  for (const [re, range] of RELATIVE) {
    const m = n.match(re);
    const r = m && range(t, dow, m);
    if (m && r) return { said: saidAt(raw, n, m.index ?? 0, m[0].length), start: toIso(r[0]), end: toIso(r[1]), status: 'INFERENCE' };
  }
  for (const [re, target] of WEEKDAYS) {
    const m = n.match(re);
    if (!m) continue;
    const day = plus(t, (target - dow + 7) % 7 || 7); // the next one, never today
    return { said: saidAt(raw, n, m.index ?? 0, m[0].length), start: toIso(day), end: toIso(day), status: 'INFERENCE' };
  }
  return undefined;
}

// Money only when a transfer is meant: « pas assez d'argent » is not a need.
const MONEY_RE = /\b(?:western union|moneygram|wise|remitly|worldremit|transfert d argent|money transfer|virement)\b|\b(?:envoyer|transferer|send|transfer|enviar|sturen|inviare|nsifet|nsift|sifet)\b[^.?!]*?\b(?:argent|sous|flous|floos|dirhams?|euros?|money|dinero|geld|soldi)\b/;

const NEEDS: Array<[RegExp, Need]> = [
  [/\b(?:hotels?|hebergements?|logements?|riads?|dormir|airbnb|fondo9|fondoq|nbat)\b/, 'hotel'],
  [/\b(?:vols?|billets? d avion|flights?|plane tickets?|vuelos?|vlucht(?:en)?|voli|volo)\b/, 'flight'],
  [/\b(?:location de voiture|location voiture|louer une voiture|voiture de location|rent a car|car rental|rental car|alquiler de coche|alquilar un coche|huurauto|auto huren|noleggio auto|nkri tomobil|kri tomobil|kra tomobil)\b/, 'car_rental'],
  [/\b(?:traversees?|crossing|travesia|overtocht|traversata)\b/, 'ferry'],
  [/\b(?:e-?sim|carte sim|sim|internet|forfait|roaming)\b/, 'sim'],
  [MONEY_RE, 'money'],
  [/\b(?:papiers?|passeport|passport|pasaporte|paspoort|passaporto|visa|cin|carte d identite|documents?|l-?wraq|wraq)\b/, 'papers'],
];

function findNeeds(raw: string, n: string): Array<Fact<Need>> {
  const hits: Array<{ index: number; fact: Fact<Need> }> = [];
  for (const [re, need] of NEEDS) {
    const m = n.match(re);
    if (m) hits.push({ index: m.index ?? 0, fact: { value: need, status: 'FACT_USER', evidence: saidAt(raw, n, m.index ?? 0, m[0].length) } });
  }
  return hits.sort((a, b) => a.index - b.index).map((h) => h.fact);
}

export function extractIntent(input: string, today: string): IntentFacts {
  const raw = typeof input === 'string' ? input.slice(0, MAX_CHARS) : '';
  const n = norm(raw);
  const trip = extractTripFacts(raw);
  const facts: IntentFacts = { ...trip, needs: findNeeds(raw, n) };

  const country = trip.destination ? undefined : findCountry(raw, n);
  if (country) facts.country = country;
  const horizon = findHorizon(raw, n, today);
  if (horizon) facts.horizon = horizon;

  // A country or a relative date counts as said: completeness() reads `unknown`.
  facts.unknown = trip.unknown.filter((field) =>
    !(field === 'destination' && country) && !(field === 'when' && horizon));
  return facts;
}
