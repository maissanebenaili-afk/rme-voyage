/**
 * RME Lab — Intent Engine V1: the same facts as the Latin parser, read from
 * Arabic script (Modern Standard Arabic and Darija written in Arabic
 * letters). Pure and deterministic. Every value is taken from the sentence;
 * « البلاد » (home) is RME's reading, hence INFERENCE, as « bled » is.
 */
import type { Fact } from '@/lib/tripFacts';
import { LAB_MOROCCAN_CITIES } from '@/lib/tripFacts';
import type { Need } from '@/lib/lab/intentFacts';

/** A relative date, resolved against `today` by the caller. */
export type RelativeRule =
  | { type: 'offset'; days: number }
  | { type: 'weekend'; next: boolean }
  | { type: 'nextWeek' }
  | { type: 'summer' }
  | { type: 'weekday'; dow: number };

export type ArabicFacts = {
  destination?: Fact<{ key: string; label: string; country: 'MA' }>;
  origin?: Fact<{ label: string; countryCode: string }>;
  country?: { value: 'MA'; status: 'FACT_USER' | 'INFERENCE'; evidence: string };
  when?: { said: string; rule: RelativeRule };
  mode?: Fact<'car' | 'plane' | 'ferry'>;
  travellers?: Fact<{ family?: boolean; children?: boolean }>;
  needs: Array<Fact<Need>>;
};

const ARABIC_LETTER = /[؀-ۿ]/;

/** Harakat, tatweel and the alif / ya variants removed, so one spelling matches them all. */
export function normArabic(text: string): string {
  return text
    .normalize('NFC')
    .replace(/[ً-ٰٟـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي');
}

// A word, optionally glued to « و ف ب ل ك » and the article: لطنجة, للمغرب, فالمغرب, بالطوموبيل.
const B = '(?<![\\p{L}\\p{M}])';
const E = '(?![\\p{L}\\p{M}])';
const PREFIX = '(?:و?[فبلك]?(?:ال|ل)?)';
const word = (stems: string, prefix = PREFIX) => new RegExp(`${B}${prefix}(?:${stems})${E}`, 'u');
const stem = (arabicName: string) => normArabic(arabicName).replace(/^ال/, '');

// Moroccan cities by Arabic name → the Lab key (lib/tripFacts.ts). The names of
// MOROCCO_CITIES come from that file's `ar` field; the others are added here.
const MOROCCAN_AR: Array<[string, string]> = [
  ['الدار البيضاء', 'casablanca'], ['كازا', 'casablanca'], ['مراكش', 'marrakech'], ['فاس', 'fes'],
  ['طنجة', 'tanger'], ['اكادير', 'agadir'], ['الرباط', 'rabat'], ['وجدة', 'oujda'], ['مكناس', 'meknes'],
  ['الناظور', 'nador'], ['تطوان', 'tetouan'], ['اسفي', 'safi'], ['القنيطرة', 'kenitra'], ['الصويرة', 'essaouira'],
  ['ورزازات', 'ouarzazate'], ['بني ملال', 'benimelal'], ['تازة', 'taza'], ['العرائش', 'larache'], ['خريبكة', 'khouribga'],
  ['سطات', 'settat'], ['برشيد', 'berrechid'], ['الحسيمة', 'al hoceima'], ['شفشاون', 'chefchaouen'],
  ['بركان', 'berkane'], ['الدريوش', 'driouch'], ['الجديدة', 'el jadida'], ['المحمدية', 'mohammedia'], ['افران', 'ifrane'],
  ['الرشيدية', 'errachidia'], ['الداخلة', 'dakhla'], ['تزنيت', 'tiznit'], ['تارودانت', 'taroudant'], ['كلميم', 'guelmim'],
  ['اصيلة', 'asilah'], ['السعيدية', 'saidia'], ['الفنيدق', 'fnideq'], ['مرتيل', 'martil'],
];

// Departure cities in Europe, written in Arabic; labels match the planner's list.
const ORIGINS_AR: Array<[string, string, string]> = [
  ['باريس', 'Paris', 'fr'], ['ليون', 'Lyon', 'fr'], ['مرسيليا', 'Marseille', 'fr'], ['بروكسيل|بروكسل', 'Bruxelles', 'be'],
  ['انفرس|انتويرب', 'Anvers', 'be'], ['امستردام', 'Amsterdam', 'nl'], ['روتردام', 'Rotterdam', 'nl'], ['مدريد', 'Madrid', 'es'],
  ['برشلونة', 'Barcelone', 'es'], ['ميلانو', 'Milan', 'it'], ['فرانكفورت', 'Francfort', 'de'],
];

const FROM = '(?:من|مـن)\\s+';

const COUNTRY_RE = word('مغرب');
const HOME_RE = word('بلاد');
const PRAYER_RE = new RegExp(`${B}(?:ال)?(?:صلاة|اذان)${E}|وقت\\s+(?:ال)?مغرب`, 'u');

const NEG_RE = word('ما ?عنديش|ماعنديش|بلا|بدون|بغير', '');
const CAR = 'طوموبيل|طونوبيل|سيارة|طوموبيلة';
const PLANE = 'طيارة|طائرة';
const FERRY = 'بابور|باطو|فيري';
const RENTAL_RE = new RegExp(`${B}(?:كراء|نكري|نكرا|كري)\\s+${PREFIX}(?:${CAR})${E}`, 'u');

// Day names only with their article (« السبت », « نهار الحد »): bare « تلات », « تنين » are also numbers.
const weekday = (stems: string) => new RegExp(`${B}(?:نهار\\s+)?[فبل]?ال(?:${stems})${E}`, 'u');

const RELATIVE: Array<[RegExp, RelativeRule]> = [
  [word('بعد غدا|بعد غدوة', ''), { type: 'offset', days: 2 }],
  [word('غدا|غدوة|غدوا', ''), { type: 'offset', days: 1 }],
  [word('اليوم|ليوم|هاد النهار', ''), { type: 'offset', days: 0 }],
  [word('(?:ويكاند|ويكند|نهاية الاسبوع) (?:الجاي|المقبل|القادم)'), { type: 'weekend', next: true }],
  [word('ويكاند|ويكند|نهاية الاسبوع'), { type: 'weekend', next: false }],
  [word('(?:اسبوع|سيمانة|سمانة) (?:الجاي|الجاية|المقبل|القادم)'), { type: 'nextWeek' }],
  [word('صيف|صيفية'), { type: 'summer' }],
  [weekday('اثنين|اتنين'), { type: 'weekday', dow: 1 }],
  [weekday('ثلاثاء'), { type: 'weekday', dow: 2 }],
  [weekday('اربعاء'), { type: 'weekday', dow: 3 }],
  [weekday('خميس'), { type: 'weekday', dow: 4 }],
  [weekday('جمعة'), { type: 'weekday', dow: 5 }],
  [weekday('سبت'), { type: 'weekday', dow: 6 }],
  [weekday('احد|حد'), { type: 'weekday', dow: 0 }],
];

const NEEDS: Array<[RegExp, Need]> = [
  [new RegExp(`${B}${PREFIX}(?:فندق|اوطيل|لوطيل)${E}|${B}فين\\s+ن?بات${E}`, 'u'), 'hotel'],
  [new RegExp(`${B}(?:تذكرة|تذاكر|بيي)\\s+${PREFIX}(?:${PLANE})${E}|${B}(?:فلايت|رحلة جوية)${E}`, 'u'), 'flight'],
  [RENTAL_RE, 'car_rental'],
  [word('انترنت|شريحة|لابوس|سيم|ايسيم'), 'sim'],
  [new RegExp(`${B}(?:نصيفط|صيفط|نرسل|ارسال|تحويل|نحول)${E}[^.؟!]*?${B}${PREFIX}(?:فلوس|مال|دراهم|اورو|يورو)${E}|${B}(?:ويسترن|وايز)${E}`, 'u'), 'money'],
  [word('جواز|باسبور|بطاقة الوطنية|لاكارط|وراق|اوراق|وثائق|فيزا'), 'papers'],
];

export function extractArabicFacts(raw: string): ArabicFacts {
  const facts: ArabicFacts = { needs: [] };
  if (!ARABIC_LETTER.test(raw)) return facts;
  const a = normArabic(raw);

  // Cities: « من X » is where the user leaves from; the last other Moroccan city is the destination.
  let destinationAt = -1;
  for (const [name, key] of MOROCCAN_AR) {
    const re = new RegExp(`${B}${PREFIX}${stem(name)}${E}`, 'gu');
    for (const m of a.matchAll(re)) {
      const index = m.index ?? 0;
      const fromHere = new RegExp(`${FROM}$`, 'u').test(a.slice(0, index));
      const label = LAB_MOROCCAN_CITIES[key];
      if (fromHere) {
        if (!facts.origin) facts.origin = { value: { label, countryCode: 'ma' }, status: 'FACT_USER', evidence: m[0] };
      } else if (index > destinationAt) {
        destinationAt = index;
        facts.destination = { value: { key, label, country: 'MA' }, status: 'FACT_USER', evidence: m[0] };
      }
    }
  }
  for (const [names, label, countryCode] of ORIGINS_AR) {
    const m = a.match(new RegExp(`${B}${FROM}(?:${names})${E}`, 'u'));
    if (m && !facts.origin) facts.origin = { value: { label, countryCode }, status: 'FACT_USER', evidence: m[0] };
  }

  if (!facts.destination) {
    const readings = [[COUNTRY_RE, 'FACT_USER'], [HOME_RE, 'INFERENCE']] as const;
    for (const [re, status] of readings) {
      const m = a.match(re);
      if (!m) continue;
      const before = a.slice(0, m.index ?? 0);
      if (new RegExp(`${FROM}$`, 'u').test(before)) continue;
      if (re === COUNTRY_RE && PRAYER_RE.test(a)) continue; // « صلاة المغرب » is a prayer
      facts.country = { value: 'MA', status, evidence: m[0] };
      break;
    }
  }

  for (const [re, rule] of RELATIVE) {
    const m = a.match(re);
    if (m) { facts.when = { said: m[0], rule }; break; }
  }

  // The travel mode, ignoring « ما عنديش طوموبيل » and « كراء طوموبيل ».
  const travelText = a.replace(new RegExp(`${NEG_RE.source}\\s+${PREFIX}(?:${CAR}|${PLANE}|${FERRY})${E}`, 'gu'), ' ')
    .replace(new RegExp(RENTAL_RE.source, 'gu'), ' ');
  for (const [stems, mode] of [[CAR, 'car'], [PLANE, 'plane'], [FERRY, 'ferry']] as const) {
    const m = travelText.match(word(stems));
    if (m) { facts.mode = { value: mode, status: 'FACT_USER', evidence: m[0] }; break; }
  }

  const family = a.match(word('عائلة|عايلة|فاميلة|فاميلا'));
  const children = a.match(word('وليدات|دراري|اولاد|ولادي|اطفال'));
  if (family || children) {
    facts.travellers = {
      value: { ...(family ? { family: true } : {}), ...(children ? { children: true } : {}) },
      status: 'FACT_USER',
      evidence: (family ?? children)![0],
    };
  }

  const hits = NEEDS.flatMap(([re, need]) => {
    const m = a.match(re);
    return m ? [{ index: m.index ?? 0, fact: { value: need, status: 'FACT_USER' as const, evidence: m[0].trim() } }] : [];
  });
  facts.needs = hits.sort((x, y) => x.index - y.index).map((h) => h.fact);
  return facts;
}
