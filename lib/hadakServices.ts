import type { ServiceCategory, ServicesSearch } from '@/lib/servicesSearch';

/**
 * "Je cherche un garage près de Taza" used to get Taza's weather, "station
 * essence près de Nador" a fuel price, and "un consulat à Paris" an AI-made
 * address that differed by language (both wrong; checked 2026-10-04). RME
 * already searches real places (OpenStreetMap, /api/services): Hadak now uses
 * that search and never gives a place, address or phone number from memory.
 */
export type ServiceRequest = { category: ServiceCategory; place: string | null };

const CATEGORY_RULES: Array<[ServiceCategory, RegExp]> = [
  ['consulate', /\b(consulats?|ambassades?|consulate|embassy|consulado|embajada|qonsoliya)\b|قنصلية|سفارة/],
  ['garage', /\b(garages?|garagiste|mecanicien|mecanique|depann\w*|car repair|mechanic|taller|mecanico)\b/],
  ['rest_area', /\b(aires? de repos|aires? d'autoroute|rest area|area de descanso)\b/],
  ['halal', /\b(restaurants?|manger|eat|comer)\b.*\bhalal\b|\bhalal\b.*\b(restaurants?|manger)\b/],
  ['mosque', /\b(mosquees?|mosque|mezquita|jami3|masjid)\b|مسجد/],
];
const FUEL_PLACE = /\b(stations?|pompes?|gas station|gasolinera)\b/;
const FUEL_WORD = /\b(essence|gasoil|diesel|carburant|fuel|service|gasolina)\b/;
const WHERE = /\b(ou|trouver|pres|proche|autour|cherche|where|near|donde|cerca|fin)\b/;

export function detectServiceRequest(message: string): ServiceRequest | null {
  const m = message.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  let category: ServiceCategory | null = null;
  for (const [key, re] of CATEGORY_RULES) {
    if (re.test(m)) { category = key; break; }
  }
  // "station essence près de Nador" asks for a place; "prix de l'essence" does not.
  if (!category && FUEL_PLACE.test(m) && (FUEL_WORD.test(m) || WHERE.test(m))) category = 'fuel';
  if (!category) return null;
  return { category, place: extractPlace(message) };
}

/** The capitalised place after "à / près de / autour de / in / near / en…". */
export function extractPlace(message: string): string | null {
  const match = message.match(
    /(?:^|\s)(?:à|a|près de|pres de|proche de|autour de|vers|sur|dans|in|near|en|cerca de)\s+((?:[A-ZÀ-Ý][\p{L}'’-]*)(?:\s+[A-ZÀ-Ý][\p{L}'’-]*)*)/u,
  );
  return match ? match[1].trim() : null;
}

const LABEL: Record<ServiceCategory, Record<'fr' | 'en' | 'es' | 'da' | 'ar', string>> = {
  garage: { fr: 'Garages', en: 'Car repair', es: 'Talleres', da: 'Garages', ar: 'مرائب' },
  consulate: { fr: 'Consulats et ambassades', en: 'Consulates and embassies', es: 'Consulados y embajadas', da: 'Consulats', ar: 'قنصليات وسفارات' },
  fuel: { fr: 'Stations-service', en: 'Fuel stations', es: 'Gasolineras', da: 'Stations', ar: 'محطات الوقود' },
  rest_area: { fr: 'Aires de repos', en: 'Rest areas', es: 'Áreas de descanso', da: 'Aires de repos', ar: 'باحات الاستراحة' },
  halal: { fr: 'Restaurants halal', en: 'Halal restaurants', es: 'Restaurantes halal', da: 'Restaurants halal', ar: 'مطاعم حلال' },
  mosque: { fr: 'Mosquées', en: 'Mosques', es: 'Mezquitas', da: 'Mesajid', ar: 'مساجد' },
};

type L = keyof (typeof LABEL)['garage'];
const asLang = (lang: string): L => (lang === 'en' || lang === 'es' || lang === 'da' || lang === 'ar' ? lang : 'fr');
const km = (m: number) => `${(m / 1000).toFixed(1).replace('.', ',')} km`;

export function serviceAnswer(request: ServiceRequest, found: ServicesSearch | null, rawLang: string): string {
  const lang = asLang(rawLang);
  const label = LABEL[request.category][lang];
  if (!request.place) {
    return {
      fr: `${label} : dans quelle ville ? Exemple : « garage près de Taza ».`,
      en: `${label}: in which town? Example: "garage near Taza".`,
      es: `${label}: ¿en qué ciudad? Ejemplo: «taller cerca de Taza».`,
      da: `${label}: f ina mdina? Matalan: « garage près de Taza ».`,
      ar: `${label}: في أي مدينة؟ مثال: « garage près de Taza ».`,
    }[lang];
  }
  const place = request.place;
  if (!found || (!found.ok && found.reason === 'unavailable')) {
    return {
      fr: `La recherche de ${label.toLowerCase()} est indisponible pour l'instant. Je ne donne pas d'adresse de mémoire : elle pourrait être fausse. Réessayez dans quelques minutes.`,
      en: `The ${label.toLowerCase()} search is unavailable right now. I won't give an address from memory: it could be wrong. Try again in a few minutes.`,
      es: `La búsqueda de ${label.toLowerCase()} no está disponible ahora. No doy direcciones de memoria: podrían ser falsas. Inténtalo en unos minutos.`,
      da: `L-9lib 3la ${label} ma khdamch daba. Ma kan3tik-ch adresse mn rasi: t9der tkon ghalta. 3awed men ba3d.`,
      ar: `البحث عن ${label} غير متاح حالياً. لا أعطي عنواناً من الذاكرة لأنه قد يكون خاطئاً. أعد المحاولة بعد دقائق.`,
    }[lang];
  }
  if (!found.ok) {
    return {
      fr: `Je ne trouve pas « ${place} ». Ajoutez le pays, par exemple « ${place}, Maroc ».`,
      en: `I can't find "${place}". Add the country, e.g. "${place}, Morocco".`,
      es: `No encuentro «${place}». Añade el país, por ejemplo «${place}, Marruecos».`,
      da: `Ma l9itch « ${place} ». Zid l-blad, matalan « ${place}, Maroc ».`,
      ar: `لم أجد « ${place} ». أضف البلد، مثلاً « ${place}, Maroc ».`,
    }[lang];
  }
  if (found.results.length === 0) {
    return {
      fr: `Aucun résultat « ${label.toLowerCase()} » dans OpenStreetMap à moins de 15 km de ${place}. Cela ne prouve pas qu'il n'y en a pas : demandez sur place.`,
      en: `No "${label.toLowerCase()}" in OpenStreetMap within 15 km of ${place}. That doesn't prove there are none: ask locally.`,
      es: `Ningún resultado «${label.toLowerCase()}» en OpenStreetMap a menos de 15 km de ${place}. Eso no prueba que no haya: pregunta allí.`,
      da: `Ma kayn ta natija f OpenStreetMap 9rib mn ${place} (15 km). Momkin kaynin: swwel temma.`,
      ar: `لا نتيجة في OpenStreetMap على بعد 15 كم من ${place}. هذا لا يعني عدم وجودها: اسأل محلياً.`,
    }[lang];
  }
  const lines = found.results.slice(0, 3).map((p, i) => `${i + 1}. ${p.name} — ${km(p.distanceMeters)}${p.address ? ` (${p.address})` : ''}`);
  const head = {
    fr: `**${label} autour de ${place}** (OpenStreetMap, distance à vol d'oiseau) :`,
    en: `**${label} around ${place}** (OpenStreetMap, straight-line distance):`,
    es: `**${label} cerca de ${place}** (OpenStreetMap, distancia en línea recta):`,
    da: `**${label} 9rib mn ${place}** (OpenStreetMap, l-masafa f khatt mosta9im):`,
    ar: `**${label} قرب ${place}** (OpenStreetMap، المسافة في خط مستقيم):`,
  }[lang];
  const foot = {
    fr: `Données publiques, parfois incomplètes : vérifiez horaires et coordonnées avant de vous déplacer.`,
    en: `Public data, sometimes incomplete: check opening hours and details before you go.`,
    es: `Datos públicos, a veces incompletos: comprueba horarios y datos antes de ir.`,
    da: `Données publiques, momkin na9sin: tcheck l-wa9t w l-adresse 9bel ma tmshi.`,
    ar: `بيانات عامة وقد تكون ناقصة: تحقق من المواعيد والعنوان قبل الذهاب.`,
  }[lang];
  return [head, ...lines, foot].join('\n');
}
