/**
 * RME Lab — intent benchmark. Generates the sentences travellers actually say
 * (French, Darija, Arabic script, English, Spanish, Dutch), runs them through
 * the engine and measures what it reads, what it can act on, and one invariant:
 * every piece of evidence shown as « vous avez dit » is really in the sentence.
 * Deterministic: the same cases every run, so a drop is a regression.
 */
import type { PartnerCatalogueEntry } from '@/lib/partnerCatalogue';
import { norm } from '@/lib/tripFacts';
import { normArabic } from '@/lib/lab/arabicIntent';
import { extractIntent, type IntentFacts, type Need } from '@/lib/lab/intentFacts';
import { planNextActions, type RouteIndexEntry } from '@/lib/lab/nextBestAction';

export type BenchLang = 'fr' | 'da' | 'ar' | 'en' | 'es' | 'nl';
type Field = 'destination' | 'country' | 'when' | 'origin' | 'mode' | 'needs';

export type BenchCase = {
  id: string;
  lang: BenchLang;
  sentence: string;
  expect: { destination?: string; country?: true; when?: true; origin?: string; mode?: 'car' | 'plane' | 'ferry'; needs?: Need[] };
};

// label = what RME must show; the other keys are how people write the city.
const CITIES = [
  { label: 'Tanger', fr: 'Tanger', da: 'Tanja', ar: 'طنجة' },
  { label: 'Nador', fr: 'Nador', da: 'Nador', ar: 'الناظور' },
  { label: 'Al Hoceïma', fr: 'Al Hoceima', da: 'Hoceima', ar: 'الحسيمة' },
  { label: 'Casablanca', fr: 'Casablanca', da: 'Casablanca', ar: 'الدار البيضاء' },
  { label: 'Marrakech', fr: 'Marrakech', da: 'Marrakech', ar: 'مراكش' },
  { label: 'Agadir', fr: 'Agadir', da: 'Agadir', ar: 'اكادير' },
  { label: 'Fès', fr: 'Fès', da: 'Fes', ar: 'فاس' },
  { label: 'Oujda', fr: 'Oujda', da: 'Wejda', ar: 'وجدة' },
  { label: 'Tétouan', fr: 'Tétouan', da: 'Tetwan', ar: 'تطوان' },
  { label: 'Chefchaouen', fr: 'Chefchaouen', da: 'Chaouen', ar: 'شفشاون' },
];
const ORIGINS = [
  { label: 'Paris', ar: 'باريس' }, { label: 'Bruxelles', ar: 'بروكسيل' }, { label: 'Amsterdam', ar: 'امستردام' },
  { label: 'Lyon', ar: 'ليون' }, { label: 'Madrid', ar: 'مدريد' },
];
const WHEN: Record<BenchLang, string[]> = {
  fr: ['ce week-end', 'samedi', 'demain', 'en août', 'cet été', 'la semaine prochaine', 'dans 3 jours'],
  da: ['had l weekend', 'ghedda', 'f ghusht', 'f sif', 'nhar sebt'],
  ar: ['نهار السبت', 'غدا', 'الويكاند', 'فالصيف'],
  en: ['this weekend', 'tomorrow', 'in August', 'next week'],
  es: ['este fin de semana', 'mañana', 'en agosto', 'la próxima semana'],
  nl: ['dit weekend', 'morgen', 'in augustus', 'volgende week'],
};

type City = (typeof CITIES)[number];
type Slots = { city: City; when: string; origin: (typeof ORIGINS)[number] };
type Template = { lang: BenchLang; text: (s: Slots) => string; expect: (s: Slots) => BenchCase['expect'] };

// « ل » + name, « لل » when the name carries the article: لطنجة, للناظور.
const toAr = (name: string) => (name.startsWith('ال') ? `لل${name.slice(2)}` : `ل${name}`);
const inAr = (name: string) => `ف${name}`;

const TEMPLATES: Template[] = [
  { lang: 'fr', text: (s) => `Je veux aller à ${s.city.fr} ${s.when}`, expect: (s) => ({ destination: s.city.label, when: true }) },
  { lang: 'fr', text: (s) => `On part à ${s.city.fr} ${s.when} avec les enfants`, expect: (s) => ({ destination: s.city.label, when: true }) },
  { lang: 'fr', text: (s) => `Il me faut un hôtel à ${s.city.fr} ${s.when}`, expect: (s) => ({ destination: s.city.label, when: true, needs: ['hotel'] }) },
  { lang: 'fr', text: (s) => `On descend en voiture de ${s.origin.label} à ${s.city.fr} ${s.when}`, expect: (s) => ({ destination: s.city.label, when: true, origin: s.origin.label, mode: 'car' }) },
  { lang: 'fr', text: (s) => `Vol pour ${s.city.fr} ${s.when} depuis ${s.origin.label}`, expect: (s) => ({ destination: s.city.label, when: true, origin: s.origin.label, needs: ['flight'] }) },
  { lang: 'fr', text: (s) => `Ferry pour ${s.city.fr} ${s.when}`, expect: (s) => ({ destination: s.city.label, when: true, mode: 'ferry' }) },
  { lang: 'fr', text: (s) => `Je rentre au bled ${s.when}`, expect: () => ({ country: true, when: true }) },
  { lang: 'fr', text: (s) => `Je dois envoyer de l'argent à ma mère à ${s.city.fr}`, expect: (s) => ({ destination: s.city.label, needs: ['money'] }) },
  { lang: 'da', text: (s) => `bghit nmshi l ${s.city.da} ${s.when}`, expect: (s) => ({ destination: s.city.label, when: true }) },
  { lang: 'da', text: (s) => `ghadi nmshi l ${s.city.da} ${s.when} b tomobil mn ${s.origin.label}`, expect: (s) => ({ destination: s.city.label, when: true, origin: s.origin.label, mode: 'car' }) },
  { lang: 'da', text: (s) => `bghit nbat f ${s.city.da} ${s.when}`, expect: (s) => ({ destination: s.city.label, when: true, needs: ['hotel'] }) },
  { lang: 'da', text: (s) => `ghadi nmshi l bled ${s.when} m3a drari`, expect: () => ({ country: true, when: true }) },
  { lang: 'ar', text: (s) => `بغيت نمشي ${toAr(s.city.ar)} ${s.when}`, expect: (s) => ({ destination: s.city.label, when: true }) },
  { lang: 'ar', text: (s) => `غادي نمشي للمغرب ${s.when} مع العائلة`, expect: () => ({ country: true, when: true }) },
  { lang: 'ar', text: (s) => `بغيت فندق ${inAr(s.city.ar)} ${s.when}`, expect: (s) => ({ destination: s.city.label, when: true, needs: ['hotel'] }) },
  { lang: 'ar', text: (s) => `من ${s.origin.ar} ${toAr(s.city.ar)} بالطوموبيل ${s.when}`, expect: (s) => ({ destination: s.city.label, when: true, origin: s.origin.label, mode: 'car' }) },
  { lang: 'en', text: (s) => `I want to go to ${s.city.fr} ${s.when}`, expect: (s) => ({ destination: s.city.label, when: true }) },
  { lang: 'en', text: (s) => `Flight to ${s.city.fr} ${s.when}`, expect: (s) => ({ destination: s.city.label, when: true, needs: ['flight'] }) },
  { lang: 'es', text: (s) => `Quiero ir a ${s.city.fr} ${s.when}`, expect: (s) => ({ destination: s.city.label, when: true }) },
  { lang: 'nl', text: (s) => `Ik wil naar ${s.city.fr} ${s.when}`, expect: (s) => ({ destination: s.city.label, when: true }) },
  { lang: 'nl', text: (s) => `Met de auto naar ${s.city.fr} ${s.when}`, expect: (s) => ({ destination: s.city.label, when: true, mode: 'car' }) },
];

/** One case per template and city; time and origin rotate so every value is covered. */
export function benchCases(): BenchCase[] {
  return TEMPLATES.flatMap((template, t) => CITIES.map((city, c) => {
    const times = WHEN[template.lang];
    const slots: Slots = { city, when: times[(c + t) % times.length], origin: ORIGINS[(c + t) % ORIGINS.length] };
    return { id: `${template.lang}-${t}-${c}`, lang: template.lang, sentence: template.text(slots), expect: template.expect(slots) };
  }));
}

/** Evidence the card will show next to « vous avez dit ». */
export function evidenceOf(facts: IntentFacts): string[] {
  const all = [
    facts.destination?.evidence, facts.origin?.evidence, facts.via?.evidence, facts.when?.evidence,
    facts.travellers?.evidence, facts.mode?.evidence, facts.purpose?.evidence,
    facts.country?.evidence, facts.horizon?.said, facts.destinationGuess?.evidence,
    facts.direction?.evidence, facts.past?.evidence,
    ...facts.needs.map((n) => n.evidence),
  ];
  return all.filter((e): e is string => Boolean(e));
}

const comparable = (text: string) => normArabic(norm(text)).replace(/\s+/g, ' ');

/** True when every evidence is, word for word, in what the user wrote. */
export function evidenceIsSaid(sentence: string, facts: IntentFacts): boolean {
  const said = comparable(sentence);
  return evidenceOf(facts).every((e) => said.includes(comparable(e)));
}

function fieldMisses(c: BenchCase, f: IntentFacts): Field[] {
  const misses: Field[] = [];
  const e = c.expect;
  const city = f.destination?.value.label ?? f.destinationGuess?.value.label;
  if (e.destination && norm(city ?? '') !== norm(e.destination)) misses.push('destination');
  if (e.country && !f.country) misses.push('country');
  if (e.when && !f.when && !f.horizon) misses.push('when');
  if (e.origin && f.origin?.value.label !== e.origin) misses.push('origin');
  if (e.mode && f.mode?.value !== e.mode) misses.push('mode');
  if (e.needs && !e.needs.every((n) => f.needs.some((x) => x.value === n))) misses.push('needs');
  return misses;
}

export type BenchReport = {
  cases: number;
  exact: number;
  actionable: number;
  evidenceViolations: Array<{ sentence: string; evidence: string[] }>;
  byLang: Record<string, { cases: number; exact: number; actionable: number }>;
  misses: Record<string, number>;
  failures: Array<{ id: string; sentence: string; misses: Field[] }>;
};

export function runBench(
  cases: BenchCase[],
  options: { today: string; partners: PartnerCatalogueEntry[]; routes: RouteIndexEntry[] },
): BenchReport {
  const report: BenchReport = { cases: 0, exact: 0, actionable: 0, evidenceViolations: [], byLang: {}, misses: {}, failures: [] };
  for (const c of cases) {
    const facts = extractIntent(c.sentence, options.today);
    const plan = planNextActions(facts, { ...options, lang: 'fr' });
    const misses = fieldMisses(c, facts);
    const actionable = plan.actions.some((a) => a.href);
    const lang = (report.byLang[c.lang] ??= { cases: 0, exact: 0, actionable: 0 });
    report.cases++; lang.cases++;
    if (misses.length === 0) { report.exact++; lang.exact++; } else report.failures.push({ id: c.id, sentence: c.sentence, misses });
    if (actionable) { report.actionable++; lang.actionable++; }
    for (const m of misses) report.misses[`${c.lang}:${m}`] = (report.misses[`${c.lang}:${m}`] ?? 0) + 1;
    if (!evidenceIsSaid(c.sentence, facts)) report.evidenceViolations.push({ sentence: c.sentence, evidence: evidenceOf(facts) });
  }
  return report;
}
