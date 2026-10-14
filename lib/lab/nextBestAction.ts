/**
 * RME Lab — Magic Button, step 2. Turns IntentFacts into at most 5 next
 * actions, each with a reason taken from what the user said. Pure and
 * deterministic. The order comes from the facts, never from a commission, and
 * a partner whose link is not active is never presented as bookable.
 */
import type { PartnerCatalogueEntry } from '@/lib/partnerCatalogue';
import { norm } from '@/lib/tripFacts';
import type { IntentFacts, Need } from '@/lib/lab/intentFacts';

export type MagicLang = 'fr' | 'da';
export type MagicActionKind = 'papers' | 'flight' | 'route' | 'hotel' | 'car_rental' | 'money' | 'sim';

export type MagicAction = {
  kind: MagicActionKind;
  label: string;
  reason: string;
  /** In-app path or partner link; absent while no verified partner exists. */
  href?: string;
  /** Present only when href is an active affiliate link. */
  partner?: { id: string; name: string };
};

export type MagicPlan = { actions: MagicAction[]; notes: string[] };

/** The /trajet landing pages, reduced to what matching needs (the full dataset stays on the server). */
export type RouteIndexEntry = { slug: string; originCity: string; destinationCity: string };

export type PlanOptions = {
  partners: PartnerCatalogueEntry[];
  routes: RouteIndexEntry[];
  /** The user's local date, YYYY-MM-DD. */
  today: string;
  lang: MagicLang;
};

const MAX_ACTIONS = 5;
const URGENT_DAYS = 7;
const DAY_MS = 86_400_000;

const KIND_OF_NEED: Record<Need, MagicActionKind> = {
  flight: 'flight', hotel: 'hotel', car_rental: 'car_rental', ferry: 'route', sim: 'sim', money: 'money', papers: 'papers',
};

const PARTNER_OF: Partial<Record<MagicActionKind, string>> = {
  flight: 'travelpayouts-flights',
  hotel: 'travelpayouts-hotels',
  car_rental: 'travelpayouts-car',
  sim: 'esim-morocco',
};

const LABEL: Record<MagicActionKind, Record<MagicLang, string>> = {
  papers: { fr: 'Préparer mes papiers', da: 'Wajjed l-wraq' },
  flight: { fr: 'Trouver mon vol', da: 'Qelleb 3la l-vol' },
  route: { fr: 'Calculer mon trajet', da: '7seb triq dyali' },
  hotel: { fr: 'Trouver où dormir', da: 'Fin nbat' },
  car_rental: { fr: 'Louer une voiture', da: 'Kri tomobil' },
  money: { fr: 'Comparer les transferts', da: 'Qaren tahwil l-flous' },
  sim: { fr: 'Rester connecté', da: 'Bqa connecté' },
};

const NOT_VERIFIED: Partial<Record<MagicActionKind, Record<MagicLang, string>>> = {
  flight: { fr: 'Pas encore de partenaire vol vérifié dans RME.', da: 'Mazal ma kayn partenaire dyal l-vol m2akked f RME.' },
  hotel: { fr: 'Pas encore de partenaire hôtel vérifié dans RME.', da: 'Mazal ma kayn partenaire dyal l-otel m2akked f RME.' },
  car_rental: { fr: 'Pas encore de partenaire location vérifié dans RME.', da: 'Mazal ma kayn partenaire dyal kra tomobil m2akked f RME.' },
};

const PILGRIMAGE_NOTE: Record<MagicLang, string> = {
  fr: 'Omra et Hajj : formalités uniquement auprès de la source officielle.',
  da: 'Omra w l-7ajj: l-wraq ghir mn l-masdar r-rasmi.',
};

const DAYS: Record<MagicLang, string[]> = {
  fr: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
  da: ['l7ed', 'tnin', 'tlat', 'larb3', 'lkhmis', 'jem3a', 'sebt'],
};
const MONTHS: Record<MagicLang, string[]> = {
  fr: ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'],
  da: ['yanayir', 'fbrayr', 'mars', 'abril', 'may', 'yonyo', 'yolyoz', 'ghusht', 'shutanbir', 'oktobr', 'nowanbir', 'dujanbir'],
};

const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);

function dayText(iso: string, lang: MagicLang, withMonth = true): string {
  const d = utc(iso);
  const text = `${DAYS[lang][d.getUTCDay()]} ${d.getUTCDate()}`;
  return withMonth ? `${text} ${MONTHS[lang][d.getUTCMonth()]}` : text;
}

/** « samedi 3 octobre », « du samedi 3 au dimanche 4 octobre », « en août ». */
export function whenText(facts: IntentFacts, lang: MagicLang, today: string): string | undefined {
  if (facts.horizon) {
    const { start, end } = facts.horizon;
    const year = utc(start).getUTCFullYear();
    const suffix = year !== utc(today).getUTCFullYear() ? ` ${year}` : '';
    if (start === end) return dayText(start, lang) + suffix;
    const sameMonth = utc(start).getUTCMonth() === utc(end).getUTCMonth();
    const from = dayText(start, lang, !sameMonth);
    return lang === 'fr' ? `du ${from} au ${dayText(end, lang)}${suffix}` : `mn ${from} l ${dayText(end, lang)}${suffix}`;
  }
  const when = facts.when?.value;
  if (!when?.month) return undefined;
  const month = MONTHS[lang][when.month - 1];
  if (when.day) return lang === 'fr' ? `le ${when.day} ${month}` : `${when.day} ${month}`;
  return lang === 'fr' ? `en ${month}` : `f ${month}`;
}

export function daysUntilDeparture(facts: IntentFacts, today: string): number | undefined {
  const t0 = Date.parse(`${today}T00:00:00Z`);
  if (!Number.isFinite(t0)) return undefined;
  let start: number | undefined;
  if (facts.horizon) {
    start = Date.parse(`${facts.horizon.start}T00:00:00Z`);
  } else if (facts.when?.value.month && facts.when.value.day) {
    const { month, day, year } = facts.when.value;
    const thisYear = new Date(t0).getUTCFullYear();
    start = Date.UTC(year ?? thisYear, month - 1, day);
    if (!year && start < t0) start = Date.UTC(thisYear + 1, month - 1, day);
  }
  if (start === undefined || !Number.isFinite(start)) return undefined;
  const days = Math.round((start - t0) / DAY_MS);
  return days >= 0 ? days : undefined;
}

type Context = {
  lang: MagicLang;
  city?: string;
  country: boolean;
  origin?: string;
  when?: string;
  days?: number;
  car: boolean;
};

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function towards(c: Context): string {
  if (c.lang === 'fr') return c.city ? `vers ${c.city}` : 'vers le Maroc';
  return c.city ? `l ${c.city}` : 'l l-Maghrib';
}

function at(c: Context): string {
  if (!c.city && !c.country) return '';
  if (c.lang === 'fr') return c.city ? ` à ${c.city}` : ' au Maroc';
  return c.city ? ` f ${c.city}` : ' f l-Maghrib';
}

function baseReason(kind: MagicActionKind, c: Context): string {
  const fr = c.lang === 'fr';
  const when = c.when ? `, ${c.when}` : '';
  switch (kind) {
    case 'papers': {
      const list = fr ? `passeport, CIN${c.car ? ', papiers de la voiture' : ''}` : `passport, CIN${c.car ? ', wraq tomobil' : ''}`;
      if (c.days === 0) return fr ? `Départ aujourd’hui : ${list}.` : `Safar lyoum: ${list}.`;
      if (c.days === 1) return fr ? `Départ demain : ${list}.` : `Safar ghedda: ${list}.`;
      if (c.days !== undefined) return fr ? `Départ dans ${c.days} jours : ${list}.` : `B9aw ${c.days} ayyam l-safar: ${list}.`;
      return fr ? `La liste avant le départ : ${list}.` : `Liste 9bel ma tsafer: ${list}.`;
    }
    case 'flight': {
      const from = c.origin ? (fr ? `, depuis ${c.origin}` : `, mn ${c.origin}`) : '';
      return `${capitalise(towards(c))}${when}${from}.`;
    }
    case 'route':
      if (c.car) {
        const from = c.origin ? (fr ? ` depuis ${c.origin}` : ` mn ${c.origin}`) : '';
        return fr ? `En voiture${from} : distance, péages, carburant et ferry.` : `B tomobil${from}: l-masafa, péage, lissans w ferry.`;
      }
      return fr ? `En ferry ${towards(c)} : traversées et ports.` : `B l-babor ${towards(c)}: traversées w l-mwani.`;
    case 'hotel':
      return fr ? `Pour dormir${at(c)}${when}.` : `Bach tbat${at(c)}${when}.`;
    case 'car_rental':
      return fr ? `Sur place${at(c)}${when}.` : `F blasa${at(c)}${when}.`;
    case 'money':
      return fr ? 'Frais et taux affichés pour envoyer de l’argent au Maroc.' : 'L-frais w s-sarf dyal tahwil l-flous l l-Maghrib.';
    case 'sim':
      return fr ? `Internet dès l’arrivée${at(c)} : SIM ou eSIM.` : `Internet mn nhar twsel${at(c)}: SIM wla eSIM.`;
  }
}

function routeHref(facts: IntentFacts, routes: RouteIndexEntry[]): string {
  const origin = facts.origin?.value.label;
  const destination = facts.destination?.value.label;
  if (origin && destination) {
    const page = routes.find((r) => norm(r.originCity) === norm(origin) && norm(r.destinationCity) === norm(destination));
    if (page) return `/trajet/${page.slug}`;
  }
  return '/#route';
}

export function planNextActions(facts: IntentFacts, { partners, routes, today, lang }: PlanOptions): MagicPlan {
  const hasPlace = Boolean(facts.destination || facts.country);
  if (!hasPlace && facts.needs.length === 0) return { actions: [], notes: [] };

  const order: MagicActionKind[] = [];
  const add = (kind: MagicActionKind) => { if (!order.includes(kind)) order.push(kind); };
  const said = new Map<MagicActionKind, string>();
  for (const need of facts.needs) {
    const kind = KIND_OF_NEED[need.value];
    if (!said.has(kind)) said.set(kind, need.evidence);
  }

  const notes: string[] = [];
  const days = daysUntilDeparture(facts, today);
  const mode = facts.mode?.value;

  if (facts.purpose) {
    // Pilgrimage formalities come from the official source only (NORTH_STAR rule 3).
    notes.push(PILGRIMAGE_NOTE[lang]);
    add('flight');
  } else {
    if (days !== undefined && days <= URGENT_DAYS) add('papers');
    for (const kind of said.keys()) add(kind);
    const fromAbroad = facts.origin?.value.countryCode !== 'ma';
    if (mode === 'car' || mode === 'ferry') add('route');
    else if (hasPlace && fromAbroad) add('flight');
    if (hasPlace) { add('papers'); add('sim'); add('money'); }
  }

  const context: Context = {
    lang,
    city: facts.destination?.value.label,
    country: Boolean(facts.country),
    origin: facts.origin?.value.label,
    when: whenText(facts, lang, today),
    days,
    car: mode === 'car',
  };

  const actions = order.slice(0, MAX_ACTIONS).map((kind): MagicAction => {
    const partnerId = PARTNER_OF[kind];
    const partner = partnerId
      ? partners.find((p) => p.id === partnerId && p.status === 'active' && p.affiliateUrl)
      : undefined;

    let href: string | undefined;
    if (kind === 'papers') href = '/#preparer';
    else if (kind === 'money') href = '/#transfert';
    else if (kind === 'route') href = routeHref(facts, routes);
    else if (partner) href = partner.affiliateUrl;
    else if (kind === 'sim') href = '/#preparer'; // the checklist covers the SIM until an eSIM partner is active

    const unverified = !href ? NOT_VERIFIED[kind]?.[lang] : undefined;
    const evidence = said.get(kind);
    const prefix = evidence ? (lang === 'fr' ? `Vous avez dit « ${evidence} ». ` : `Gulti « ${evidence} ». `) : '';

    return {
      kind,
      label: LABEL[kind][lang],
      reason: prefix + (unverified ?? baseReason(kind, context)),
      ...(href ? { href } : {}),
      ...(partner ? { partner: { id: partner.id, name: partner.name } } : {}),
    };
  });

  return { actions, notes };
}

export type UnderstoodItem = { text: string; evidence: string; inferred: boolean };

const MODE_TEXT: Record<'car' | 'plane' | 'ferry', Record<MagicLang, string>> = {
  car: { fr: 'En voiture', da: 'B tomobil' },
  plane: { fr: 'En avion', da: 'B tiyara' },
  ferry: { fr: 'En ferry', da: 'B l-babor' },
};

const NEED_TEXT: Record<Need, Record<MagicLang, string>> = {
  flight: { fr: 'Un vol', da: 'Vol' },
  hotel: { fr: 'Où dormir', da: 'Fin nbat' },
  car_rental: { fr: 'Une voiture sur place', da: 'Tomobil f blasa' },
  ferry: { fr: 'La traversée', da: 'L-babor' },
  sim: { fr: 'Internet', da: 'Internet' },
  money: { fr: 'Envoyer de l’argent', da: 'Tahwil l-flous' },
  papers: { fr: 'Les papiers', da: 'L-wraq' },
};

/** What RME understood, each item with the user's words that prove it. */
export function describeFacts(facts: IntentFacts, lang: MagicLang, today: string): UnderstoodItem[] {
  const fr = lang === 'fr';
  const items: UnderstoodItem[] = [];
  if (facts.destination) items.push({ text: facts.destination.value.label, evidence: facts.destination.evidence, inferred: false });
  else if (facts.country) items.push({ text: fr ? 'Maroc' : 'L-Maghrib', evidence: facts.country.evidence, inferred: facts.country.status === 'INFERENCE' });
  if (facts.origin) items.push({ text: `${fr ? 'Depuis' : 'Mn'} ${facts.origin.value.label}`, evidence: facts.origin.evidence, inferred: false });
  const when = whenText(facts, lang, today);
  if (facts.horizon && when) items.push({ text: capitalise(when), evidence: facts.horizon.said, inferred: true });
  else if (facts.when && when) items.push({ text: capitalise(when), evidence: facts.when.evidence, inferred: false });
  if (facts.travellers) {
    const { family, children } = facts.travellers.value;
    const text = children ? (fr ? 'Avec les enfants' : 'M3a d-drari') : family ? (fr ? 'En famille' : 'M3a l-3a2ila') : '';
    if (text) items.push({ text, evidence: facts.travellers.evidence, inferred: false });
  }
  if (facts.mode) items.push({ text: MODE_TEXT[facts.mode.value][lang], evidence: facts.mode.evidence, inferred: false });
  if (facts.purpose) items.push({ text: facts.purpose.value === 'hajj' ? 'Hajj' : 'Omra', evidence: facts.purpose.evidence, inferred: false });
  for (const need of facts.needs) items.push({ text: NEED_TEXT[need.value][lang], evidence: need.evidence, inferred: false });
  return items;
}

export type MissingChoice = { field: 'origin' | 'when'; label: string; options: Array<{ text: string; append: string }> };

/** At most two one-tap rows for what is still missing; a choice is appended to the sentence and parsed again. */
export function missingChoices(facts: IntentFacts, lang: MagicLang): MissingChoice[] {
  const fr = lang === 'fr';
  const rows: MissingChoice[] = [];
  const hasPlace = Boolean(facts.destination || facts.country);
  if (!hasPlace || facts.purpose) return rows;
  if (!facts.origin) {
    rows.push({
      field: 'origin',
      label: fr ? 'Départ' : 'Mn fin',
      options: ['Paris', 'Bruxelles', 'Amsterdam'].map((city) => ({ text: city, append: fr ? ` depuis ${city}` : ` mn ${city}` })),
    });
  }
  if (!facts.when && !facts.horizon) {
    rows.push({
      field: 'when',
      label: fr ? 'Quand' : 'Imta',
      options: fr
        ? [{ text: 'Ce week-end', append: ' ce week-end' }, { text: 'En juillet', append: ' en juillet' }, { text: 'En août', append: ' en août' }]
        : [{ text: 'Had l weekend', append: ' had l weekend' }, { text: 'F yolyoz', append: ' f yolyoz' }, { text: 'F ghusht', append: ' f ghusht' }],
    });
  }
  return rows;
}
