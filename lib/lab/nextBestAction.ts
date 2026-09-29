/**
 * RME Lab — Magic Button, step 2. Turns IntentFacts into at most 5 next
 * actions, each with a reason taken from what the user said. Pure and
 * deterministic. The order comes from the facts, never from a commission, and
 * a partner whose link is not active is never presented as bookable.
 */
import type { PartnerCatalogueEntry } from '@/lib/partnerCatalogue';
import { buildShareUrl } from '@/lib/tripShare';
import { norm } from '@/lib/tripFacts';
import { extractIntent, type IntentFacts, type Need } from '@/lib/lab/intentFacts';

export type MagicLang = 'fr' | 'da';
export type MagicActionKind = 'papers' | 'flight' | 'route' | 'local_transfer' | 'hotel' | 'car_rental' | 'money' | 'sim';

export type MagicAction = {
  kind: MagicActionKind;
  label: string;
  reason: string;
  /** In-app path or partner link; absent while no verified partner exists. */
  href?: string;
  /** Present only when href is an active affiliate link. */
  partner?: { id: string; name: string };
  /** The user already ticked this step in their checklist. */
  done?: boolean;
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
  /** Steps the user ticked as done (their checklist, on their device): shown last. */
  done?: MagicActionKind[];
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
  local_transfer: 'lgrima',
};

const LABEL: Record<MagicActionKind, Record<MagicLang, string>> = {
  papers: { fr: 'Préparer mes papiers', da: 'Wajjed l-wraq' },
  flight: { fr: 'Trouver mon vol', da: 'Qelleb 3la l-vol' },
  route: { fr: 'Calculer mon trajet', da: '7seb triq dyali' },
  local_transfer: { fr: 'Transport sur place', da: 'Transport f blasa' },
  hotel: { fr: 'Trouver où dormir', da: 'Fin nbat' },
  car_rental: { fr: 'Louer une voiture', da: 'Kri tomobil' },
  money: { fr: 'Comparer les transferts', da: 'Qaren tahwil l-flous' },
  sim: { fr: 'Rester connecté', da: 'Bqa connecté' },
};

const NOT_VERIFIED: Partial<Record<MagicActionKind, Record<MagicLang, string>>> = {
  flight: { fr: 'Pas encore de partenaire vol vérifié dans RME.', da: 'Mazal ma kayn partenaire dyal l-vol m2akked f RME.' },
  hotel: { fr: 'Pas encore de partenaire hôtel vérifié dans RME.', da: 'Mazal ma kayn partenaire dyal l-otel m2akked f RME.' },
  car_rental: { fr: 'Pas encore de partenaire location vérifié dans RME.', da: 'Mazal ma kayn partenaire dyal kra tomobil m2akked f RME.' },
  local_transfer: { fr: 'Pas encore de partenaire transport local vérifié dans RME.', da: 'Mazal ma kayn partenaire dyal transport m2akked f RME.' },
};

const IMPOSSIBLE_DATE_NOTE: Record<MagicLang, string> = {
  fr: 'Cette date n’existe pas dans le calendrier : vérifiez-la.',
  da: 'Had tarikh ma kaynch f l-calendrier: t2akked mno.',
};

const PAST_DATE_NOTE: Record<MagicLang, string> = {
  fr: 'La date indiquée est déjà passée : vérifiez-la.',
  da: 'Had tarikh fat: t2akked mno.',
};

const PILGRIMAGE_NOTE: Record<MagicLang, string> = {
  fr: 'Omra et Hajj : formalités uniquement auprès de la source officielle.',
  da: 'Omra w l-7ajj: l-wraq ghir mn l-masdar r-rasmi.',
};

const RETURN_NOTE: Record<MagicLang, string> = {
  fr: 'Retour vers l’Europe : RME prépare surtout l’aller pour l’instant, donc rien n’est proposé pour le mauvais sens.',
  da: 'Rje3 l Ouroupa: daba RME kaywejjed ghir d-dhab, wakha ma kan9tarah walou.',
};

const PAST_NOTE: Record<MagicLang, string> = {
  fr: 'On dirait un souvenir plutôt qu’un projet. Dites-moi ce que vous voulez préparer.',
  da: 'Ka-ybano souvenir mashi mashru3. 9ol lia ash bghiti twejjed.',
};

const CANCELLED_NOTE: Record<MagicLang, string> = {
  fr: 'Ce voyage semble annulé, donc je ne propose rien. Dites-moi si vous voulez le reprendre.',
  da: 'Had s-safar ban lia mlghi, donc ma kan9tarah walou. 9ol lia ila bghiti trje3 lih.',
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

/** The departure day, YYYY-MM-DD: the start of a relative date, or a day and month said. */
export function departureDate(facts: IntentFacts, today: string): string | undefined {
  if (facts.horizon) return facts.horizon.start;
  const when = facts.when?.value;
  const t0 = Date.parse(`${today}T00:00:00Z`);
  if (!when?.month || !when.day || !Number.isFinite(t0)) return undefined;
  const thisYear = new Date(t0).getUTCFullYear();
  let year = when.year ?? thisYear;
  if (!when.year && Date.UTC(year, when.month - 1, when.day) < t0) year += 1;
  const start = new Date(Date.UTC(year, when.month - 1, when.day));
  // « le 31 février » is not a date: never let it roll over to March.
  if (start.getUTCMonth() !== when.month - 1 || start.getUTCDate() !== when.day) return undefined;
  return start.toISOString().slice(0, 10);
}

/** A day and month the calendar does not have, e.g. « le 31 février ». */
function isImpossibleDate(facts: IntentFacts, today: string): boolean {
  const when = facts.when?.value;
  return Boolean(when?.month && when.day && !departureDate(facts, today));
}

/** A day the user wrote with its year, already gone. */
function isPastDate(facts: IntentFacts, today: string): boolean {
  const date = facts.when?.value.year ? departureDate(facts, today) : undefined;
  return Boolean(date && date < today);
}

export function daysUntilDeparture(facts: IntentFacts, today: string): number | undefined {
  const date = departureDate(facts, today);
  if (!date) return undefined;
  const days = Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY_MS);
  return Number.isFinite(days) && days >= 0 ? days : undefined;
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
    case 'local_transfer': {
      const between = c.origin && c.city ? (fr ? ` entre ${c.origin} et ${c.city}` : ` bin ${c.origin} w ${c.city}`) : at(c);
      return fr ? `Sans voiture${between}.` : `Bla tomobil${between}.`;
    }
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

// A /trajet landing page when one exists, else the planner pre-filled through its share link.
function routeHref(facts: IntentFacts, destination: string | undefined, routes: RouteIndexEntry[], date: string | undefined): string {
  const origin = facts.origin?.value.label;
  if (origin && destination) {
    const page = routes.find((r) => norm(r.originCity) === norm(origin) && norm(r.destinationCity) === norm(destination));
    if (page) return `/trajet/${page.slug}`;
    return buildShareUrl({ from: origin, to: destination, date }, '');
  }
  return '/#route';
}

// Morocco → Europe: no outbound step (papers, arrival SIM, transfers) is right, so only the trip itself is offered.
function returnPlan(facts: IntentFacts, { partners, routes, today, lang }: PlanOptions): MagicPlan {
  const fr = lang === 'fr';
  const mode = facts.mode?.value;
  const from = facts.origin?.value.label;
  const to = facts.direction?.to;
  const when = whenText(facts, lang, today);
  const trip = `${from ? (fr ? ` depuis ${from}` : ` mn ${from}`) : ''}${to ? (fr ? ` vers ${to}` : ` l ${to}`) : ''}${when ? `, ${when}` : ''}`;
  const notes = [RETURN_NOTE[lang]];
  if (mode === 'car' || mode === 'ferry') {
    const href = routeHref(facts, to, routes, departureDate(facts, today));
    return { actions: [{ kind: 'route', label: LABEL.route[lang], reason: `${fr ? 'Retour' : 'Rjou3'}${trip}.`, href }], notes };
  }
  const partner = partners.find((p) => p.id === PARTNER_OF.flight && p.status === 'active' && p.affiliateUrl);
  return {
    actions: [{
      kind: 'flight',
      label: LABEL.flight[lang],
      reason: partner ? `${fr ? 'Retour' : 'Rjou3'}${trip}.` : NOT_VERIFIED.flight![lang],
      ...(partner ? { href: partner.affiliateUrl, partner: { id: partner.id, name: partner.name } } : {}),
    }],
    notes,
  };
}

export function planNextActions(facts: IntentFacts, options: PlanOptions): MagicPlan {
  if (facts.past) return { actions: [], notes: [PAST_NOTE[options.lang]] };
  if (facts.cancelled) return { actions: [], notes: [CANCELLED_NOTE[options.lang]] };
  if (facts.direction) return returnPlan(facts, options);
  const { partners, routes, today, lang, done = [] } = options;
  const city = facts.destination?.value.label ?? facts.destinationGuess?.value.label;
  const hasPlace = Boolean(city || facts.country);
  if (!hasPlace && facts.needs.length === 0) return { actions: [], notes: [] };

  const order: MagicActionKind[] = [];
  const add = (kind: MagicActionKind) => { if (!order.includes(kind)) order.push(kind); };
  const said = new Map<MagicActionKind, string>();
  for (const need of facts.needs) {
    const kind = KIND_OF_NEED[need.value];
    if (!said.has(kind)) said.set(kind, need.evidence);
  }

  const notes: string[] = [];
  if (isImpossibleDate(facts, today)) notes.push(IMPOSSIBLE_DATE_NOTE[lang]);
  else if (isPastDate(facts, today)) notes.push(PAST_DATE_NOTE[lang]);
  const days = daysUntilDeparture(facts, today);
  const mode = facts.mode?.value;

  if (facts.purpose) {
    // Pilgrimage formalities come from the official source only (NORTH_STAR rule 3).
    notes.push(PILGRIMAGE_NOTE[lang]);
    add('flight');
  } else {
    if (days !== undefined && days <= URGENT_DAYS) add('papers');
    for (const kind of said.keys()) add(kind);
    // A trip inside Morocco needs local transport, not a flight or border papers.
    const fromAbroad = facts.origin?.value.countryCode !== 'ma';
    if (mode === 'car' || mode === 'ferry') add('route');
    else if (hasPlace && fromAbroad) add('flight');
    else if (hasPlace) add('local_transfer');
    if (hasPlace) {
      if (fromAbroad) add('papers');
      add('sim');
      add('money');
    }
  }

  const context: Context = {
    lang,
    city,
    country: Boolean(facts.country),
    origin: facts.origin?.value.label,
    when: whenText(facts, lang, today),
    days,
    car: mode === 'car',
  };

  // What the user already did goes last; the order of the rest never changes.
  const ranked = [...order.filter((k) => !done.includes(k)), ...order.filter((k) => done.includes(k))];
  const actions = ranked.slice(0, MAX_ACTIONS).map((kind): MagicAction => {
    const partnerId = PARTNER_OF[kind];
    const partner = partnerId
      ? partners.find((p) => p.id === partnerId && p.status === 'active' && p.affiliateUrl)
      : undefined;

    let href: string | undefined;
    if (kind === 'papers') href = '/#preparer';
    else if (kind === 'money') href = '/#transfert';
    else if (kind === 'route') href = routeHref(facts, city, routes, departureDate(facts, today));
    else if (partner) href = partner.affiliateUrl;
    else if (kind === 'sim') href = '/#preparer'; // the checklist covers the SIM until an eSIM partner is active

    const unverified = !href ? NOT_VERIFIED[kind]?.[lang] : undefined;
    const evidence = said.get(kind);
    const prefix = evidence ? (lang === 'fr' ? `Vous avez dit « ${evidence} ». ` : `Gulti « ${evidence} ». `) : '';
    const isDone = done.includes(kind);
    const doneNote = isDone ? (lang === 'fr' ? 'Déjà coché dans votre checklist. ' : 'Deja m-cochi f checklist dyalk. ') : '';

    return {
      kind,
      label: LABEL[kind][lang],
      reason: doneNote + prefix + (unverified ?? baseReason(kind, context)),
      ...(href ? { href } : {}),
      ...(partner ? { partner: { id: partner.id, name: partner.name } } : {}),
      ...(isDone ? { done: true } : {}),
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
  else if (facts.destinationGuess) items.push({ text: facts.destinationGuess.value.label, evidence: facts.destinationGuess.evidence, inferred: true });
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
  if (facts.direction) items.push({ text: facts.direction.to ? (fr ? `Retour vers ${facts.direction.to}` : `Rjou3 l ${facts.direction.to}`) : (fr ? 'Retour vers l’Europe' : 'Rjou3 l Ouroupa'), evidence: facts.direction.evidence, inferred: true });
  if (facts.purpose) items.push({ text: facts.purpose.value === 'hajj' ? 'Hajj' : 'Omra', evidence: facts.purpose.evidence, inferred: false });
  for (const need of facts.needs) items.push({ text: NEED_TEXT[need.value][lang], evidence: need.evidence, inferred: false });
  return items;
}

export type MissingChoice = { field: 'destination' | 'origin' | 'when' | 'mode'; label: string; options: Array<{ text: string; append: string }> };

/** Every one-tap row that could fill a missing field; a choice is appended to the sentence and parsed again. */
export function missingChoices(facts: IntentFacts, lang: MagicLang): MissingChoice[] {
  const fr = lang === 'fr';
  const rows: MissingChoice[] = [];
  if (facts.past || facts.cancelled || facts.direction) return rows;
  const hasPlace = Boolean(facts.destination || facts.destinationGuess || facts.country);
  if (facts.purpose) return rows;
  if (!hasPlace) {
    // « Je pars demain » with no place: where is the one answer that unlocks everything.
    const said = Boolean(facts.when || facts.horizon || facts.needs.length || facts.origin || facts.mode);
    if (said) {
      rows.push({
        field: 'destination',
        label: fr ? 'Où' : 'Fin',
        options: fr
          ? [{ text: 'Maroc', append: ' au Maroc' }, { text: 'Tanger', append: ' à Tanger' }, { text: 'Nador', append: ' à Nador' }, { text: 'Casablanca', append: ' à Casablanca' }]
          : [{ text: 'L-Maghrib', append: ' l l-maghrib' }, { text: 'Tanja', append: ' l Tanja' }, { text: 'Nador', append: ' l Nador' }, { text: 'Casablanca', append: ' l Casablanca' }],
      });
    }
    return rows;
  }
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
  if (!facts.mode && facts.origin?.value.countryCode !== 'ma') {
    rows.push({
      field: 'mode',
      label: fr ? 'Comment' : 'Kifach',
      options: fr
        ? [{ text: 'Avion', append: ' en avion' }, { text: 'Voiture', append: ' en voiture' }, { text: 'Ferry', append: ' en ferry' }]
        : [{ text: 'Tiyara', append: ' b tiyara' }, { text: 'Tomobil', append: ' b tomobil' }, { text: 'Babor', append: ' b l-babor' }],
    });
  }
  return rows;
}

const actionKey = (a: MagicAction) => `${a.kind}|${a.href ?? ''}|${a.reason}`;

function planDistance(a: MagicAction[], b: MagicAction[]): number {
  let changed = Math.abs(a.length - b.length);
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (actionKey(a[i]) !== actionKey(b[i])) changed++;
  return changed;
}

/**
 * The questions worth asking, best first: each row is scored by how much the
 * plan changes, on average, when the user taps one of its answers. Pure: it
 * only replays the parser and the planner on the sentence plus each answer.
 */
export function rankedChoices(sentence: string, options: PlanOptions, max = 2): Array<MissingChoice & { gain: number }> {
  const trimmed = sentence.replace(/[\s.!?]+$/, '');
  const base = planNextActions(extractIntent(trimmed, options.today), options).actions;
  const scored = missingChoices(extractIntent(trimmed, options.today), options.lang).map((row) => {
    const gains = row.options.map((o) => planDistance(base, planNextActions(extractIntent(trimmed + o.append, options.today), options).actions));
    return { ...row, gain: gains.reduce((sum, g) => sum + g, 0) / gains.length };
  });
  // Stable: equal gains keep the natural order (destination, origin, when, mode).
  return scored.map((row, i) => ({ row, i })).sort((x, y) => y.row.gain - x.row.gain || x.i - y.i).slice(0, max).map(({ row }) => row);
}
