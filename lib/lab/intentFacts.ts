/**
 * RME Lab — Magic Button, step 1. Adds to extractTripFacts() what a vague
 * sentence carries: the country alone (« Maroc », « bled »), a relative date
 * (« ce week-end », « samedi ») and the needs said out loud (« hôtel »,
 * « envoyer de l'argent »). Pure: `today` (YYYY-MM-DD, the user's local date)
 * is passed in. A computed date is an INFERENCE, never a FACT_USER, and nothing
 * is filled in by default. Not wired into production.
 */
import { extractTripFacts, LAB_MOROCCAN_CITIES, norm, type Fact, type TripFacts, type TripField } from '@/lib/tripFacts';
import { extractArabicFacts, type RelativeRule } from '@/lib/lab/arabicIntent';
import { BROKEN_MODE_RE, modeIsUndecided, pastStory, presenceOrigin, returnTrip, saidAt, withoutNegatedCities, type Direction } from '@/lib/lab/intentGuards';

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
  /** A misspelt Moroccan city (« marakech »): RME's reading, never a FACT_USER. */
  destinationGuess?: { value: { key: string; label: string }; status: 'INFERENCE'; evidence: string };
  horizon?: Horizon;
  /** Morocco → Europe: the planner does not prepare this direction yet and says so. */
  direction?: Direction;
  /** A memory (« hier je suis allé à Nador »), not a plan. */
  past?: { evidence: string };
  /** In the order they were said. */
  needs: Array<Fact<Need>>;
};

const MAX_CHARS = 2000;
const DAY_MS = 86_400_000;

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
  [/\b(?:cet ete|l ete prochain|this summer|next summer|este verano|deze zomer|quest estate|questa estate|had (?:s-?)?sif|f (?:s-?)?sif|fs?sif)\b/, (t) => summer(t)],
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

const CAR_RENTAL_RE = /\b(?:location de voiture|location voiture|louer une voiture|voiture de location|rent a car|car rental|rental car|alquiler de coche|alquilar un coche|huurauto|auto huren|noleggio auto|nkri tomobil|kri tomobil|kra tomobil)\b/;
// « pas de voiture », « sans voiture », « ma 3andich tomobil »: a mode the user does NOT use.
const NEGATED_MODE_RE = /\b(?:pas de|pas d|sans|no tengo|without|no|zonder|geen|senza|ma 3andich|ma3andich|ma 3ndich|bla)\s+(?:la |le |ma |mon |une |un |l |de )?(?:voiture|car|coche|auto|tomobil|tonobil|macchina|avion|plane|ferry|bateau)\b/g;

const NEEDS: Array<[RegExp, Need]> = [
  [/\b(?:hotels?|hebergements?|logements?|riads?|dormir|airbnb|fondo9|fondoq|nbat)\b/, 'hotel'],
  [/\b(?:vols?|billets? d avion|flights?|plane tickets?|vuelos?|vlucht(?:en)?|voli|volo)\b/, 'flight'],
  [CAR_RENTAL_RE, 'car_rental'],
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

// « louer une voiture » is a need on arrival and « pas de voiture » a mode not
// used: blank both, then read the travel mode from what is left.
function travelMode(raw: string, n: string, mode: TripFacts['mode']): TripFacts['mode'] {
  const spans = [...n.matchAll(NEGATED_MODE_RE), ...n.matchAll(new RegExp(CAR_RENTAL_RE.source, 'g')), ...n.matchAll(BROKEN_MODE_RE)];
  if (!mode || spans.length === 0) return mode;
  let text = raw.length === n.length ? raw : n;
  for (const m of spans) {
    const index = m.index ?? 0;
    text = text.slice(0, index) + ' '.repeat(m[0].length) + text.slice(index + m[0].length);
  }
  return extractTripFacts(text).mode;
}

// Optimal string alignment distance, stopped early past `max`.
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

// A word placed where a destination goes: « à marakech », « pour essaouria », « l nadour ».
const TO_BEFORE_RE = /(?:^|\s)(?:a|au|aux|vers|pour|to|naar|hacia|in|l|ila|f|fi|direction)\s+$/;

// « marakech » → Marrakech: one typo allowed from 5 letters, two from 8, and
// only after a place preposition, so « un danger » or « avec Martin » never
// become Tanger or Martil.
function guessCity(raw: string, n: string): IntentFacts['destinationGuess'] {
  let best: { key: string; label: string; evidence: string; d: number } | undefined;
  for (const m of n.matchAll(/[a-z]{5,}/g)) {
    const token = m[0];
    const index = m.index ?? 0;
    if (!TO_BEFORE_RE.test(n.slice(0, index))) continue;
    const max = token.length >= 8 ? 2 : 1;
    for (const [key, label] of Object.entries(LAB_MOROCCAN_CITIES)) {
      const name = norm(label).replace(/[^a-z]/g, '');
      if (name.length < 5) continue;
      const d = distance(token, name, max);
      if (d > 0 && d <= max && (!best || d < best.d)) best = { key, label, evidence: saidAt(raw, n, index, token.length), d };
    }
  }
  return best && { value: { key: best.key, label: best.label }, status: 'INFERENCE', evidence: best.evidence };
}

function resolveRule(rule: RelativeRule, t: number, dow: number): Range {
  switch (rule.type) {
    case 'offset': return [plus(t, rule.days), plus(t, rule.days)];
    case 'weekend': return weekend(t, dow, rule.next);
    case 'nextWeek': { const monday = plus(t, (8 - dow) % 7 || 7); return [monday, plus(monday, 6)]; }
    case 'summer': return summer(t);
    case 'weekday': { const day = plus(t, (rule.dow - dow + 7) % 7 || 7); return [day, day]; }
  }
}

const TRIP_FIELDS: TripField[] = ['destination', 'origin', 'when', 'travellers', 'mode'];

export function extractIntent(input: string, today: string): IntentFacts {
  const raw = typeof input === 'string' ? input.slice(0, MAX_CHARS) : '';
  const n = norm(raw);
  const trip = extractTripFacts(withoutNegatedCities(raw));
  const arabic = extractArabicFacts(raw);
  const facts: IntentFacts = { ...trip, needs: findNeeds(raw, n) };

  const mode = travelMode(raw, n, trip.mode);
  if (mode) facts.mode = mode;
  else delete facts.mode;

  // Arabic script fills only what the Latin reading left empty.
  facts.destination ??= arabic.destination;
  facts.origin ??= arabic.origin;
  facts.mode ??= arabic.mode;
  if (modeIsUndecided(n)) delete facts.mode;
  facts.origin ??= presenceOrigin(raw, n, facts);
  facts.travellers ??= arabic.travellers;
  for (const need of arabic.needs) {
    if (!facts.needs.some((f) => f.value === need.value)) facts.needs.push(need);
  }
  const back = returnTrip(raw, n, facts);
  if (back) {
    facts.direction = back.direction;
    if (back.origin) { facts.origin = back.origin; delete facts.destination; }
  }
  if (!facts.destination && !facts.direction) {
    const country = findCountry(raw, n) ?? arabic.country;
    if (country) facts.country = country;
    const guess = guessCity(raw, n);
    if (guess) facts.destinationGuess = guess;
  }

  const horizon = findHorizon(raw, n, today);
  if (horizon) facts.horizon = horizon;
  else if (arabic.when && /^\d{4}-\d{2}-\d{2}$/.test(today)) {
    const t = Date.parse(`${today}T00:00:00Z`);
    const [start, end] = resolveRule(arabic.when.rule, t, new Date(t).getUTCDay());
    const iso = (time: number) => new Date(time).toISOString().slice(0, 10);
    facts.horizon = { said: arabic.when.said, start: iso(start), end: iso(end), status: 'INFERENCE' };
  }

  const memory = pastStory(raw, n, Boolean(facts.horizon || facts.when));
  if (memory) facts.past = { evidence: memory };

  // A country, a guessed city or a relative date counts as said: completeness() reads `unknown`.
  const known: Record<TripField, unknown> = {
    destination: facts.destination ?? facts.country ?? facts.destinationGuess,
    origin: facts.origin,
    when: facts.when ?? facts.horizon,
    travellers: facts.travellers,
    mode: facts.mode,
  };
  facts.unknown = TRIP_FIELDS.filter((field) => !known[field]);
  return facts;
}
