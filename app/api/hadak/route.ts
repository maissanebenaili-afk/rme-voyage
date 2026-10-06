import { NextRequest, NextResponse } from 'next/server';

import { MOROCCO_CITIES, detectCity } from '@/lib/moroccoCities';
import { cacheFootballAnswer, footballCacheKey, getCachedFootballAnswer } from '@/lib/hadakFootballCache';
import { recordResolution, routeHadakAI } from '@/lib/hadakAiRouter';
import {
  buildEducationPlan, isEducationLanguage, isEducationLevel, isEducationMode,
  type EducationLevel, type EducationMode,
} from '@/lib/hadakEducation';
import { moroccoTimeZone, moroccoUtcOffset } from '@/lib/moroccoTime';
import { isHadakLang, newTrace, nextActionsFor, provenanceOf, type AnswerTrace } from '@/lib/hadakGuidance';
import { detectHadakLanguage } from '@/lib/hadakLanguage';
import { detectServiceRequest, serviceAnswer } from '@/lib/hadakServices';
import { searchServices } from '@/lib/servicesSearch';

// ── Types ──────────────────────────────────────────────────────────────────
type OpenAICompatibleResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};
type AnthropicResponse = {
  content?: Array<{ type?: string; text?: string }>;
};
type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    weather_code?: number;
    wind_speed_10m?: number;
    relative_humidity_2m?: number;
  };
};

// ── Env helpers ────────────────────────────────────────────────────────────
function findEnvKey(pattern: RegExp): string | undefined {
  return Object.entries(process.env).find(([k]) => pattern.test(k))?.[1];
}
function findEnvValue(prefix: string): string | undefined {
  return Object.values(process.env).find(v => v?.startsWith(prefix));
}

const WMO_CODE: Record<number, { fr: string; da: string; ar: string }> = {
  0:  { fr: 'ciel dégagé ☀️',       da: 'sma safiya ☀️',       ar: 'سماء صافية ☀️' },
  1:  { fr: 'peu nuageux 🌤️',       da: 'shwiya d ssḥab 🌤️',   ar: 'قليل الغيوم 🌤️' },
  2:  { fr: 'partiellement nuageux ⛅', da: 'ssḥab w shshems ⛅', ar: 'غائم جزئياً ⛅' },
  3:  { fr: 'nuageux ☁️',            da: 'mghayem ☁️',           ar: 'غائم ☁️' },
  45: { fr: 'brouillard 🌫️',        da: 'dbab 🌫️',              ar: 'ضباب 🌫️' },
  48: { fr: 'brouillard givrant 🌫️', da: 'dbab 🌫️',             ar: 'ضباب ثلجي 🌫️' },
  51: { fr: 'bruine légère 🌦️',     da: 'shta khafiifa 🌦️',    ar: 'رذاذ خفيف 🌦️' },
  61: { fr: 'pluie légère 🌧️',      da: 'shta khafiifa 🌧️',    ar: 'مطر خفيف 🌧️' },
  63: { fr: 'pluie modérée 🌧️',     da: 'shta 🌧️',             ar: 'مطر متوسط 🌧️' },
  65: { fr: 'pluie forte 🌧️',       da: 'shta bzaf 🌧️',        ar: 'مطر غزير 🌧️' },
  71: { fr: 'neige légère ❄️',       da: 'thalj ❄️',             ar: 'ثلج خفيف ❄️' },
  80: { fr: 'averses 🌦️',           da: 'l-mtar 🌦️',           ar: 'زخات مطر 🌦️' },
  95: { fr: 'orage ⛈️',             da: 'ra3d w braq ⛈️',       ar: 'عاصفة رعدية ⛈️' },
};

function describeWeather(code: number, lang: string): string {
  const closest = [0,1,2,3,45,48,51,61,63,65,71,80,95].reduce((a,b) =>
    Math.abs(b - code) < Math.abs(a - code) ? b : a
  );
  const entry = WMO_CODE[closest] ?? WMO_CODE[0];
  return lang === 'ar' ? entry.ar : lang === 'da' ? entry.da : entry.fr;
}

// ── Open-Meteo weather (free, no key) ──────────────────────────────────────
async function getWeather(cityKey: string): Promise<OpenMeteoResponse | null> {
  const city = MOROCCO_CITIES[cityKey];
  if (!city) return null;
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=Africa%2FCasablanca`;
    const res = await fetch(url, { next: { revalidate: 900 } });
    if (!res.ok) return null;
    return (await res.json()) as OpenMeteoResponse;
  } catch {
    return null;
  }
}

// ── AlAdhan prayer times (free, no key) ───────────────────────────────────
type PrayerTimes = { Fajr: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string } | null;
async function getPrayerTimes(cityKey: string): Promise<PrayerTimes> {
  const city = MOROCCO_CITIES[cityKey];
  if (!city) return null;
  try {
    const cityName = city.fr.replace('è', 'e').replace('é', 'e');
    const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(cityName)}&country=Morocco&method=12`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json() as { data?: { timings?: Record<string, string> } };
    const t = data?.data?.timings;
    if (!t) return null;
    return { Fajr: t.Fajr, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha };
  } catch {
    return null;
  }
}

// ── Live exchange rates (open.er-api.com, free, no key) ───────────────────
type ExchangeRates = { MAD: number; GBP: number; CHF: number; USD: number } | null;
async function getLiveRates(): Promise<ExchangeRates> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/EUR', { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json() as { rates?: Record<string, number> };
    const r = data?.rates;
    if (!r) return null;
    return { MAD: r.MAD ?? 10.9, GBP: r.GBP ?? 0.86, CHF: r.CHF ?? 0.94, USD: r.USD ?? 1.15 };
  } catch {
    return null;
  }
}

// ── Morocco local time ─────────────────────────────────────────────────────
function getMoroccoTime(): string {
  return new Date().toLocaleTimeString('fr-FR', {
    timeZone: moroccoTimeZone(),
    hour: '2-digit',
    minute: '2-digit',
  });
}
function getMoroccoDate(): string {
  return new Date().toLocaleDateString('fr-FR', {
    timeZone: moroccoTimeZone(),
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── TheSportsDB football helper (free, key "3" public) ────────────────────
type SportsDBEvent = { idHomeTeam?: string; strHomeTeam: string; intHomeScore: string; strAwayTeam: string; intAwayScore: string; dateEvent: string };

// Pinned TheSportsDB ids (checked 2026-09-26): a name search returns the wrong
// club — "wydad" gives Wydad de Fès, "raja" Rajasthan FC, "psg" PSG Talon.
const FOOTBALL_TEAMS: Array<{ id: string; name: string; alias: RegExp }> = [
  { id: '136402', name: 'Wydad Casablanca', alias: /\b(wydad|wac)\b/ },
  { id: '136404', name: 'Raja Casablanca', alias: /\b(raja|rca)\b/ },
  { id: '136403', name: 'FAR Rabat', alias: /\b(as far|far rabat|asfar)\b/ },
  { id: '136414', name: 'IR Tanger', alias: /\b(ittihad tanger|ir tanger|irt)\b/ },
  { id: '137426', name: 'Difaâ Hassani El Jadidi', alias: /\b(difaa|dhj)\b/ },
  { id: '137425', name: 'RS Berkane', alias: /\b(berkane|rsb)\b/ },
  { id: '136410', name: 'FUS Rabat', alias: /\bfus\b/ },
  { id: '136408', name: 'Moghreb Tétouan', alias: /\bmoghreb\b/ },
  { id: '136416', name: 'Mouloudia Oujda', alias: /\b(mouloudia|mco)\b/ },
  { id: '133613', name: 'Manchester City', alias: /\b(man city|manchester city)\b/ },
  { id: '133738', name: 'Real Madrid', alias: /\breal madrid\b/ },
  { id: '133739', name: 'Barcelona', alias: /\b(barcelona|barca)\b/ },
  { id: '133714', name: 'Paris Saint-Germain', alias: /\b(psg|paris saint.germain)\b/ },
];

async function handleFootball(msg: string, lang: string, trace: AnswerTrace = newTrace()): Promise<string | null> {
  const msgLower = msg.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const teams = FOOTBALL_TEAMS.filter(t => t.alias.test(msgLower));
  const mentioned = teams.map(t => t.name);

  // Cache must short-circuit before any external football-data calls.
  const cacheKey = footballCacheKey(lang, mentioned);
  const cached = mentioned.length > 0 ? getCachedFootballAnswer(cacheKey) : null;
  if (cached) {
    recordResolution('CACHE', 0);
    trace.ai = true;
    return cached;
  }

  // --- Form data for mentioned teams ---
  let formData = '';
  for (const team of teams.slice(0, 2)) {
    try {
      const ev = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=${team.id}`,
        { next: { revalidate: 3600 } }
      ).then(r => r.json()).catch(() => null) as { results?: SportsDBEvent[] } | null;
      const last5 = ev?.results?.slice(0, 5) ?? [];
      if (last5.length === 0) continue;
      const form = last5.map(e => {
        const home = e.idHomeTeam === team.id;
        const gf = parseInt(home ? e.intHomeScore : e.intAwayScore);
        const ga = parseInt(home ? e.intAwayScore : e.intHomeScore);
        return isNaN(gf) ? '?' : gf > ga ? 'W' : gf < ga ? 'L' : 'D';
      }).join('');
      const last = last5[0];
      formData += `${team.name} (forme: ${form}): dernier match ${last.strHomeTeam} ${last.intHomeScore}-${last.intAwayScore} ${last.strAwayTeam}\n`;
    } catch { /* ignore */ }
  }

  // --- Upcoming Botola Pro fixtures ---
  let nextMatchesText = '';
  try {
    const leagues = await fetch(
      'https://www.thesportsdb.com/api/v1/json/3/search_all_leagues.php?c=Morocco&s=Soccer',
      { next: { revalidate: 86400 } }
    ).then(r => r.json()).catch(() => null) as { countrys?: Array<{ idLeague: string; strLeague: string }> } | null;
    const botola = leagues?.countrys?.find(l => l.strLeague.toLowerCase().includes('botola'));
    if (botola?.idLeague) {
      const fx = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/eventsnextleague.php?id=${botola.idLeague}`,
        { next: { revalidate: 3600 } }
      ).then(r => r.json()).catch(() => null) as { events?: SportsDBEvent[] } | null;
      const next3 = fx?.events?.slice(0, 3) ?? [];
      if (next3.length > 0) {
        nextMatchesText = next3.map(e => `• ${e.strHomeTeam} vs ${e.strAwayTeam} (${e.dateEvent})`).join('\n');
      }
    }
  } catch { /* ignore */ }

  // --- AI prediction through the shared router ---
  if (mentioned.length > 0) {
    const langLabel = lang === 'da' ? 'darija marocaine' : lang === 'ar' ? 'arabe' : lang === 'es' ? 'espagnol' : lang === 'en' ? 'anglais' : 'français';
    const context = [
      `Date du jour au Maroc : ${getMoroccoDate()}`,
      nextMatchesText ? `Prochains matchs Botola Pro:\n${nextMatchesText}` : '',
      formData ? `Forme récente:\n${formData}` : '',
    ].filter(Boolean).join('\n\n');
    const userContent = context ? `Données:\n${context}\n\nQuestion: ${msg}` : msg;
    const routed = await routeHadakAI({
      message: userContent,
      systemPrompt: `Tu es un expert passionné de football marocain (Botola Pro, équipe nationale Lions de l'Atlas, CAF). Tu analyses les données de forme et donnes des pronostics argumentés. N'utilise que les équipes, matchs, dates et scores présents dans les Données : n'invente jamais de club, de match ni de résultat. Si les Données ne montrent pas de match entre ces équipes à la date demandée, dis-le clairement avant tout pronostic. Réponds en ${langLabel}, 3-4 phrases maximum, direct et précis.`,
    });
    if (routed.text) {
      cacheFootballAnswer(cacheKey, routed.text);
      trace.ai = true;
      return routed.text;
    }
  }

  // A team was named but no prediction came back (no Anthropic key in
  // production, or the call failed): let the general LLM chain answer the
  // actual question instead of replying "mention the team".
  if (mentioned.length > 0) return null;

  recordResolution('DETERMINISTIC_LOCAL', 0);

  // --- Static fallback ---
  if (nextMatchesText) {
    trace.live.push('TheSportsDB');
    trace.liveOnly = true;
    if (lang === 'da') return `⚽ **Kora dial Maghrib**\n\nMatchat jaya f Botola Pro:\n${nextMatchesText}`;
    if (lang === 'ar') return `⚽ **كرة القدم المغربية**\n\nالمباريات القادمة في البطولة:\n${nextMatchesText}`;
    if (lang === 'es') return `⚽ **Fútbol marroquí**\n\nPróximos partidos Botola Pro:\n${nextMatchesText}`;
    if (lang === 'en') return `⚽ **Moroccan Football**\n\nUpcoming Botola Pro fixtures:\n${nextMatchesText}`;
    return `⚽ **Football marocain**\n\nProchains matchs Botola Pro :\n${nextMatchesText}`;
  }
  if (lang === 'da') return `⚽ Kora dial Maghrib: Botola Pro, Lions de l'Atlas, CAF. Kteb ism l-feriq bach n3tik pronostic (ex: "wydad ou raja ghayrbeh?").`;
  if (lang === 'ar') return `⚽ كرة القدم المغربية: البطولة الاحترافية، أسود الأطلس، دوري أبطال إفريقيا. اذكر اسم الفريق للحصول على تحليل (مثال: "من سيفوز: الوداد أم الرجاء؟").`;
  if (lang === 'es') return `⚽ Fútbol marroquí: Botola Pro, Leones del Atlas, CAF. Menciona el equipo para obtener un pronóstico (ej: "¿Wydad o Raja ganará?").`;
  if (lang === 'en') return `⚽ Moroccan football: Botola Pro, Atlas Lions, CAF CL. Mention the team for a prediction (e.g. "Wydad vs Raja who wins?").`;
  return `⚽ **Football marocain** : Botola Pro, Lions de l'Atlas, CAF Champions League. Mentionne l'équipe pour un pronostic (ex : "Wydad ou Raja ce soir ?").`;
}

// ── Smart local responder ─────────────────────────────────────────────────
type Intent = 'services' | 'weather' | 'time' | 'ferry' | 'docs' | 'customs' | 'vehicle' | 'minor' | 'cash' | 'currency' | 'prayer' | 'sim' | 'ramadan' | 'fuel' | 'trip' | 'football' | 'education' | 'generic';

// "cours" alone is left out: "cours du dirham" is a currency question.
const EDUCATION_RE = /\b(exercices?|devoirs?|resous|resoudre|corrige|correction|reviser|revision|brevet|bac|examen|lecon|equations?|fractions?|theoremes?|conjugaison|grammaire|dissertation|homework|exercise|tamrin|dars)\b|تمرين|درس|امتحان/;

function inferEducation(m: string): { mode: EducationMode; level?: EducationLevel } {
  const mode: EducationMode =
    /\b(resous|resoudre|corrige|correction|solution|solve)\b/.test(m) ? 'SOLVE'
    : /\b(brevet|bac|examen|exam|controle)\b|امتحان/.test(m) ? 'EXAM_PREP'
    : /\b(revise|reviser|revision|fiche)\b/.test(m) ? 'REVISE'
    : /\b(exercices?|entraine|entrainer|tamrin|practice)\b|تمرين/.test(m) ? 'PRACTICE'
    : /\b(apprendre|apprends|lecon|learn|dars)\b|درس/.test(m) ? 'LEARN'
    : 'UNDERSTAND';
  const level: EducationLevel | undefined =
    /\b(cp|ce1)\b/.test(m) ? 'PRIMARY_1_2'
    : /\b(ce2|cm1|cm2)\b/.test(m) ? 'PRIMARY_3_5'
    : /\b(6e|6eme|sixieme|5e|5eme|cinquieme)\b/.test(m) ? 'COLLEGE_6E_5E'
    : /\b(4e|4eme|quatrieme|3e|3eme|troisieme|brevet)\b/.test(m) ? 'COLLEGE_4E_3E'
    : /\b(en seconde|2nde)\b/.test(m) ? 'LYCEE_2NDE'
    : /\b(en premiere|1ere)\b/.test(m) ? 'LYCEE_1ERE'
    : /\b(terminale|bac)\b/.test(m) ? 'LYCEE_TERMINALE'
    : /\b(fac|universite|licence|master|university)\b/.test(m) ? 'UNIVERSITY'
    : undefined;
  return { mode, level };
}

function normalize(msg: string): string {
  return msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

const DURATION_TEMPS_RE = /\b(combien de temps|en combien de temps|pendant combien de temps|le temps de|temps de (trajet|route|conduite|traversee|parcours|attente|vol))\b/g;
const VEHICLE_RE = /^(?=.*\b(voiture|vehicule|auto|moto|camping[- ]?car|fourgon|camionnette|tomobil|tomobile|coche)\b)(?=.*\b(laisser|rester|reste|garder|mois|admission|d16|dedouan|depasse|depassement|delai|immatricul|plaque|carte verte|assurance frontiere)).*|\b(admission temporaire|d16 ?ter|assurance frontiere)\b/;
const MINOR_RE = /^(?=.*\b(mineur|mineure|enfant|fils|fille|ado|adolescent)s?\b)(?=.*\b(seul|seule|sans (moi|nous|ses parents|parent|son pere|sa mere)|non accompagne|avec (son|sa|ses) (oncle|tante|grand|cousin|ami)|colonie)\b).*|\b(autorisation de sortie|sortie du territoire)\b/;
const CASH_RE = /^(?=.*\b(liquide|especes|cash)\b)(?=.*(\beuros?\b|€|\bfrance\b|quitt|\bsortir\b|\bsortie\b|emporter|transporter|\bpasser\b|declarer|maximum|combien)).*|\bdalia\b/;

/** A message that is only a city name ("Tanger ?", "et à Fès"): the weather is a fair guess. */
function isBareCity(m: string): boolean {
  const cityWords = new Set(Object.keys(MOROCCO_CITIES).flatMap((k) => k.normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[\s-]+/)));
  const stop = new Set(['a', 'au', 'aux', 'en', 'et', 'la', 'le', 'les', 'l', 'de', 'du', 'pour', 'sur', 'ici', 'aujourd', 'hui', 'maintenant', 'demain', 'f', 'fi']);
  const rest = m.replace(/[^a-z\s-]/g, ' ').split(/[\s-]+/).filter((w) => w && !cityWords.has(w) && !stop.has(w));
  return rest.length === 0;
}

function detectIntent(msg: string): Intent {
  const m = msg.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  // School work first: "prépare-moi pour le bac" must not become a trip card.
  if (EDUCATION_RE.test(m)) return 'education';
  // A real place nearby (garage, consulate, station…): before trip, weather,
  // fuel and clock, which used to answer "garage près de Taza" with the weather.
  if (detectServiceRequest(msg)) return 'services';
  // MRE rules with a primary source (2026-10-04): before weather, docs and
  // currency. "Combien de temps je peux laisser ma voiture au Maroc" got the
  // weather; "mon enfant voyage seul, quel papier" got the generic documents
  // answer without the AST; cash leaving France went to the AI.
  if (VEHICLE_RE.test(m)) return 'vehicle';
  if (MINOR_RE.test(m)) return 'minor';
  if (CASH_RE.test(m) && !/\b(douanes?|douanier|customs|aduanas?)\b/.test(m)) return 'cash';
  // Trip planning — "prépare-moi un voyage à X", "safari l X", "je veux aller à X"
  if (/\b(prepare|preparer|planifie|organise|voyage.*\ba\b|safari.*\bl\b|veux.*aller|want.*go|quiero.*ir|trip.*to|bghit.*nmshi|bghit.*nsafr)\b/.test(m)) return 'trip';
  // Weather — broad pattern: temps, meteo, chaud, froid, pluie, soleil, nuageux, brouillard, vent
  // "Temps" is also a duration ("combien de temps", "temps de trajet"): that
  // sense never means the weather.
  if (/\b(temps|meteo|weather|ta9s|chaud|froid|pluie|soleil|nuage|brouillard|vent|temperature|il fait|fait-il|t-il chaud|t-il froid|climat)\b/.test(m.replace(DURATION_TEMPS_RE, ' '))) return 'weather';
  // Prayer — checked before "time": "wa9t salat" and "à quelle heure est la
  // prière" both contain a time word (heure/wa9t) *and* a prayer word: the
  // prayer word must win, or the app answers the clock instead of the
  // prayer times it was actually asked for.
  if (/\b(priere|salat|prayer|salawat|fajr|dhuhr|asr|maghrib|isha|صلاة|موعد الصلاة|adhan|azan|imsakiyya|horaire.*(priere|salat)|quando.*(priere|salat))\b/.test(m)) return 'prayer';
  // Customs — before documents and currency: "combien d'argent liquide à la
  // douane" is a customs question, and an AI answer gave travellers the
  // general 2 000 DH gift limit instead of the 20 000 DH one for MRE.
  if (/\b(douanes?|douanier|customs|aduanas?|jamarik|diwana|dwana)\b|جمارك|الجمارك|ديوانة/.test(m)) return 'customs';
  // Explicit document words — checked before "ferry": "quels documents pour
  // passer à Tanger Med" names a port but asks about papers. Only unambiguous
  // document words here; "rentrer/entrer" stay in the later docs rule so
  // "quel ferry pour rentrer au Maroc" still gets the ferry answer.
  if (/\b(documents?|passeport|passport|visa|papiers?|watha2iq|carte.*(nationale|identite)|laissez.passer)\b/.test(m)) return 'docs';
  // Ferry — "barcelona" is not listed: alone it names the football club far
  // more often; "ferry Barcelona → Nador" still matches on "ferry".
  // "Algésiras" is the French spelling (normalised: algesiras).
  if (/\b(ferry|bateau|traversee|boat|algeciras|algesiras|tanger med|tarifa|genova|grimaldi|ceuta|balearia|trasmed|crossing|traversia)\b/.test(m)) return 'ferry';
  // Documents
  if (/\b(document|passeport|passport|cin|visa|permis|papier|watha2iq|carte.*(nationale|identite)|laissez.passer|required.*enter|rentrer|entrer)\b/.test(m)) return 'docs';
  // Currency
  if (/\b(euro|dirham|mad|change|taux|monnaie|argent|flouus|sarfa|صرف|currency|exchange|combien.*vaut|vaut.*(euro|dirham)|livres?|franc|usd|gbp|chf)\b/.test(m)) return 'currency';
  // SIM
  if (/\b(sim|forfait|internet|data|4g|5g|orange|inwi|maroc.telecom|telephone|mobile|roaming|reseau)\b/.test(m)) return 'sim';
  // Ramadan
  if (/\b(ramadan|iftar|shor|suhoor|jeune|jeûne|coupure|ftour)\b/.test(m)) return 'ramadan';
  // Fuel
  if (/\b(carburant|essence|gasoil|diesel|fuel|station.service|litre|petrole|estacion|benzina)\b/.test(m)) return 'fuel';
  // Football
  if (/\b(foot|football|kora|lkora|ballon|wydad|raja|ittihad|difaa|renaissance|fus|botola|botola pro|caf|la can|can 20\d\d|coupe d.afrique|lions de l.atlas|lions atlas|equipe nationale|pronostic|qui va gagner|gagner ce soir|match.*ce soir|men 3ndo lhaq|ghayrbe7|man city|real madrid|barcelona|psg|premier league|champions league|ligue 1|liga)\b/.test(m)) return 'football';
  // Time — checked last: "heure/time/maintenant" also appear in questions on
  // another subject ("quelle heure part le ferry", "match ce soir à quelle
  // heure"). The clock only answers when no subject was recognised.
  // "maintenant" alone is not a clock question: "je suis au port, qu'est-ce
  // que je fais maintenant ?" got the time (Forge H15, 2026-10-04).
  if (/\b(heure|time|wa9t|وقت|quelle heure|what time|hora|zeit|ora)\b/.test(m)) return 'time';
  return 'generic';
}

async function buildLocalResponse(msg: string, lang: string, intent: Intent, trace: AnswerTrace = newTrace()): Promise<string | null> {
  const time = getMoroccoTime();
  const date = getMoroccoDate();
  const cityKey = detectCity(msg);

  if (intent === 'services') {
    const request = detectServiceRequest(msg)!;
    const found = request.place ? await searchServices(request.place, request.category).catch(() => null) : null;
    if (found?.ok) {
      trace.live.push('OpenStreetMap');
      trace.liveOnly = true;
    }
    return serviceAnswer(request, found, lang);
  }

  if (intent === 'time') {
    trace.clock = true;
    const offset = moroccoUtcOffset();
    if (lang === 'da') return `F l-Maghrib daba ${time} (${date}), b tawqit ${offset}.`;
    if (lang === 'ar') return `الوقت الآن في المغرب ${time} (${date})، بتوقيت ${offset}.`;
    if (lang === 'es') return `En Marruecos son las ${time} (${date}), hora ${offset}.`;
    return `Il est actuellement **${time}** au Maroc (${date}), heure ${offset}.`;
  }

  // A question that names a city is not a weather question ("combien coûte le
  // péage Tanger Casablanca" got Casablanca's weather): only a bare city is.
  if (intent === 'weather' || (intent === 'generic' && cityKey && isBareCity(normalize(msg)))) {
    const key = cityKey ?? 'casablanca';
    const city = MOROCCO_CITIES[key];
    const weather = await getWeather(key);
    const cityName = lang === 'ar' ? city.ar : lang === 'da' ? city.da : city.fr;

    if (weather?.current) {
      trace.live.push('Open-Meteo');
      trace.liveOnly = true;
      const temp = Math.round(weather.current.temperature_2m ?? 0);
      const desc = describeWeather(weather.current.weather_code ?? 0, lang);
      const wind = Math.round(weather.current.wind_speed_10m ?? 0);
      if (lang === 'da') return `F ${cityName} daba: ${temp}°C, ${desc}. Rih: ${wind} km/h. L-wa9t: ${time}.`;
      if (lang === 'ar') return `الطقس الآن في ${cityName}: ${temp}°C، ${desc}. الرياح: ${wind} كم/س. الوقت: ${time}.`;
      if (lang === 'es') return `El tiempo ahora en ${cityName}: ${temp}°C, ${desc}. Viento: ${wind} km/h. Hora: ${time}.`;
      return `Météo actuelle à **${cityName}** : ${temp}°C, ${desc}. Vent : ${wind} km/h. Il est ${time} au Maroc.`;
    }
  }

  if (intent === 'ferry') {
    // Lignes vérifiées le 4 octobre 2026 (sources secondaires) : Tarifa → Tanger
    // Ville exploitée par Baleària depuis mai 2025 (FRS s'est retirée) ; Nador
    // est desservi par GNV (Sète, Barcelone), pas par Grimaldi ; Almería → Nador
    // est la traversée que prennent 23 pages trajet de RME.
    if (lang === 'da') return `Ferry dyal MRE: Algeciras → Tanger Med (1h30). Tarifa → Tanger Ville (35-55 min, Baleària mn ma 2025). Almería → Nador. Sète w Barcelona → Nador, Sète, Barcelona w Genova → Tanger Med (GNV). L-khtout w l-compagnies kaytbeddlo: tcheck 3nd l-opérateur. F sif, réservi bkri.`;
    if (lang === 'ar') return `العبارات لمغاربة العالم: الجزيرة الخضراء → طنجة المتوسط (1س30). طريفة → طنجة المدينة (35-55 دقيقة، Baleària منذ ماي 2025). ألميريا → الناظور. سيت وبرشلونة → الناظور، وسيت وبرشلونة وجنوة → طنجة المتوسط (GNV). الخطوط والشركات تتغير: تحقق لدى الشركة. احجز مسبقاً في الصيف.`;
    if (lang === 'es') return `Ferry para MRE: Algeciras → Tanger Med (1h30). Tarifa → Tánger ciudad (35-55 min, Baleària desde mayo de 2025). Almería → Nador. Sète y Barcelona → Nador; Sète, Barcelona y Génova → Tanger Med (GNV). Líneas y compañías cambian: compruébalo con la naviera. En verano, reserva con antelación.`;
    return `**Ferries pour les MRE** : Algeciras → Tanger Med (1h30). Tarifa → Tanger Ville (35-55 min, Baleària depuis mai 2025). Almería → Nador. Sète et Barcelone → Nador ; Sète, Barcelone et Gênes → Tanger Med (GNV). Lignes et compagnies changent : vérifiez auprès de l'opérateur. En été, réservez à l'avance.`;
  }

  if (intent === 'docs') {
    // France Diplomatie, « Entrée / séjour » Maroc (lu le 4 octobre 2026) :
    // passeport en cours de validité pour le séjour, carte d'identité refusée.
    // Rien n'est affirmé ici sur les papiers des Marocains : renvoi au consulat.
    if (lang === 'da') return `Documents: passeport valide l-moddat l-i9ama kamla (France Diplomatie); l-carte d'identité française ma kafyach. L-Magharba: swwlo l-consulat 3la CNIE w passeport. Voiture: carte grise, permis, w assurance li kat9bel l-Maghrib (code MA f carte verte ma mchtob-ch).`;
    if (lang === 'ar') return `الوثائق: جواز سفر ساري المفعول طوال مدة الإقامة (الخارجية الفرنسية)؛ بطاقة التعريف الفرنسية غير كافية. للمغاربة: استفسروا القنصلية عن البطاقة الوطنية والجواز. السيارة: البطاقة الرمادية، رخصة السياقة، وتأمين يغطي المغرب (رمز MA غير مشطوب في البطاقة الخضراء).`;
    if (lang === 'es') return `Documentos: pasaporte válido durante toda la estancia (France Diplomatie); el DNI francés no basta. Marroquíes: consulta en tu consulado sobre la CNIE y el pasaporte. Coche: permiso de circulación, carnet de conducir y seguro válido en Marruecos (código MA sin tachar en la carta verde).`;
    return `**Documents nécessaires** : passeport en cours de validité pour toute la durée du séjour (France Diplomatie) ; la carte d'identité française ne suffit pas. Marocains : renseignez-vous au consulat sur la CNIE et le passeport. Voiture : carte grise, permis et assurance valable au Maroc (code MA non barré sur la carte verte).`;
  }

  if (intent === 'currency') {
    const rates = await getLiveRates();
    if (rates) trace.live.push('open.er-api.com');
    const mad = rates ? rates.MAD.toFixed(2) : '10.90';
    const gbpMad = rates ? (rates.MAD / rates.GBP).toFixed(2) : '12.70';
    const chfMad = rates ? (rates.MAD / rates.CHF).toFixed(2) : '11.55';
    const src = rates ? '' : ' (approximatifs)';
    if (lang === 'da') return `Sarfa daba${src}: 1 EUR = ${mad} MAD, 1 GBP ≈ ${gbpMad} MAD, 1 CHF ≈ ${chfMad} MAD. ATM f kull mdina. Cartes bancaires maqboulin f l-hwanut l-kbar. Mabadilsh flus f ssiyahin.`;
    if (lang === 'ar') return `الصرف الآن${src}: 1 يورو = ${mad} درهم، 1 جنيه ≈ ${gbpMad} درهم، 1 فرنك سويسري ≈ ${chfMad} درهم. الصراف الآلي في كل مدينة. تجنب الصرافين غير الرسميين.`;
    if (lang === 'es') return `Cambio actual${src}: 1 EUR = ${mad} MAD, 1 GBP ≈ ${gbpMad} MAD, 1 CHF ≈ ${chfMad} MAD. Cajeros en todas las ciudades. Cambia en bancos, no en la calle.`;
    return `**Taux de change${src}** : 1 EUR = **${mad} MAD**, 1 GBP ≈ ${gbpMad} MAD, 1 CHF ≈ ${chfMad} MAD. DAB partout. Cartes acceptées dans les grandes enseignes. Évitez les changeurs informels.`;
  }

  if (intent === 'prayer') {
    const prayerCity = cityKey ?? 'casablanca';
    const city = MOROCCO_CITIES[prayerCity];
    const cityName = lang === 'ar' ? city.ar : lang === 'da' ? city.da : city.fr;
    const pt = await getPrayerTimes(prayerCity);
    if (pt) {
      trace.live.push('AlAdhan');
      trace.liveOnly = true;
      if (lang === 'da') return `Salawat f ${cityName} lyoum: Fajr ${pt.Fajr} • Dhuhr ${pt.Dhuhr} • Asr ${pt.Asr} • Maghrib ${pt.Maghrib} • Isha ${pt.Isha}`;
      if (lang === 'ar') return `أوقات الصلاة في ${cityName} اليوم: الفجر ${pt.Fajr} • الظهر ${pt.Dhuhr} • العصر ${pt.Asr} • المغرب ${pt.Maghrib} • العشاء ${pt.Isha}`;
      if (lang === 'es') return `Horarios de oración en ${cityName} hoy: Fajr ${pt.Fajr} • Dhuhr ${pt.Dhuhr} • Asr ${pt.Asr} • Maghrib ${pt.Maghrib} • Isha ${pt.Isha}`;
      return `**Horaires de prière à ${cityName} aujourd'hui** : Fajr ${pt.Fajr} · Dhuhr ${pt.Dhuhr} · Asr ${pt.Asr} · Maghrib ${pt.Maghrib} · Isha ${pt.Isha}`;
    }
    if (lang === 'da') return `Salawat: Fajr ≈ 5h, Dhuhr ≈ 13h, Asr ≈ 16h30, Maghrib ≈ 18h30, Isha ≈ 20h (ta9riban, kaytghayar b l-fasl). Sta3mal app Athan wla Muslim Pro l-mawaqit l-da9i9a.`;
    if (lang === 'ar') return `أوقات الصلاة تتفاوت حسب المدينة والفصل. استخدم تطبيق Athan أو Muslim Pro للمواقيت الدقيقة. في المغرب، كل المساجد على التوقيت الرسمي.`;
    return `Les horaires varient selon la ville et la saison. Utilisez **Athan** ou **Muslim Pro** pour les horaires précis. Toutes les mosquées du Maroc suivent l'horaire officiel du ministère des Habous.`;
  }

  if (intent === 'sim') {
    // Until 2026-10-04: "4G dans tout le pays" (rural gaps exist) and "forfait
    // hebdomadaire 10-20 MAD" (no source; offers change). Identity check at
    // purchase: mandatory since 2014-04-01 (Médias24, Le360).
    if (lang === 'da') return `SIM f l-Maghrib: Maroc Telecom (iam.ma), Orange (orange.ma), inwi (inwi.ma). L-offres kaytbeddlo bzzaf: chouf l-offre dyal daba f site dyalhom. Khassk pièce d'identité (CIN wla passeport) bach tshri SIM (wajib mn 2014). Ba3d les téléphones kaykhdmo b eSIM.`;
    if (lang === 'ar') return `شرائح SIM في المغرب: اتصالات المغرب (iam.ma)، أورانج (orange.ma)، إنوي (inwi.ma). العروض تتغير كثيراً: قارن العروض الحالية على مواقعهم. يُطلب إثبات هوية رسمي (البطاقة الوطنية أو جواز السفر) عند الشراء، وهو إلزامي منذ 2014. بعض الهواتف تدعم eSIM.`;
    if (lang === 'es') return `SIM en Marruecos: Maroc Telecom (iam.ma), Orange (orange.ma), inwi (inwi.ma). Las ofertas cambian a menudo: compara las actuales en sus webs. Al comprar se pide un documento de identidad oficial (CIN o pasaporte), obligatorio desde 2014. Algunos móviles admiten eSIM.`;
    return `**SIM au Maroc** : Maroc Telecom (iam.ma), Orange (orange.ma), inwi (inwi.ma). Les offres changent souvent : comparez celles du moment sur leurs sites. Une pièce d'identité officielle (CIN ou passeport) est demandée à l'achat, obligatoire depuis 2014. Certains téléphones acceptent l'eSIM.`;
  }

  if (intent === 'fuel') {
    // Prix libres, révisés tous les quinze jours : un chiffre sans date devient
    // faux. Le gasoil était annoncé « 11-12 MAD » alors que la presse marocaine
    // le relève au-dessus de 16 DH/L le 1er octobre 2026.
    if (lang === 'da') return `Carburant f l-Maghrib: l-asar hourra w kaytbeddlo kol 15 youm. Nhar 1 octobre 2026, l-presse 3tat l-gasoil fo9 16 DH/l. Tcheck l-prix f l-station. F l-blad l-b3ida, 3ammr 9bal ma tmshi.`;
    if (lang === 'ar') return `الوقود في المغرب: الأسعار حرة وتتغير كل 15 يوماً. في 1 أكتوبر 2026، ذكرت الصحافة أن الغازوال تجاوز 16 درهماً للتر. تحقق من السعر في المحطة. في المناطق النائية، املأ الخزان قبل المغادرة.`;
    if (lang === 'es') return `Combustible en Marruecos: precios libres, revisados cada 15 días. El 1 de octubre de 2026 la prensa situaba el gasóleo por encima de 16 MAD/l. Comprueba el precio en la gasolinera. En zonas remotas, llena el depósito antes de salir.`;
    return `**Carburant au Maroc** : les prix sont libres et changent tous les 15 jours. Le 1er octobre 2026, la presse marocaine relevait le gasoil au-dessus de 16 DH/L. Vérifiez le prix affiché en station. En zone rurale, faites le plein avant de partir.`;
  }

  if (intent === 'vehicle') {
    // Guide « Marocains du Monde » de l'ADII (finances.gov.ma, 2011), p. 11 et
    // 15-16, lu le 4 octobre 2026 : 6 mois par année civile pour une voiture
    // de tourisme ou une moto, 3 mois pour un utilitaire léger, sans
    // prorogation ; D16ter ; pénalité en cas de dépassement ; assurance
    // frontière si la carte verte ne couvre pas le Maroc.
    if (lang === 'da') return `Tomobil dyal MRE f l-Maghrib (admission temporaire): tomobil wla moto: **6 chhour f l-3am** (3am civil), metta3la wla mfer9a, bla tamdid. Utilitaire sghir: 3 chhour. 3emmer D16ter f douane.gov.ma 9bel ma tdkhol; f l-khrouj 3tihom « Déclarant » w « Apurement ». Ila fat l-ajal: pénalité, w tomobil ma tkhrej 7ta tkhelles. Ila carte verte ma katghettich l-Maghrib: assurance frontière f l-7oudoud. Source: guide ADII (2011), tcheck douane.gov.ma.`;
    if (lang === 'ar') return `سيارة مغاربة العالم في المغرب (القبول المؤقت): السيارة السياحية أو الدراجة النارية: **6 أشهر في السنة الميلادية**، متصلة أو متفرقة، دون تمديد. السيارة النفعية الخفيفة: 3 أشهر. املأ التصريح D16ter على douane.gov.ma قبل الوصول، وعند الخروج قدّم نسختي « Déclarant » و« Apurement ». عند تجاوز الأجل: غرامة، ولا تخرج السيارة إلا بعد أدائها. إذا كانت البطاقة الخضراء لا تغطي المغرب: تأمين الحدود إلزامي. المصدر: دليل إدارة الجمارك (2011)، تحقق على douane.gov.ma.`;
    if (lang === 'es') return `Coche de un MRE en Marruecos (admisión temporal): turismo o moto: **6 meses por año civil**, seguidos o fraccionados, sin prórroga. Utilitario ligero: 3 meses. Declaración D16ter en douane.gov.ma antes de llegar; al salir, presente los ejemplares « Déclarant » y « Apurement ». Si supera el plazo: multa, y el coche no sale hasta pagarla. Si la carta verde no cubre Marruecos: seguro de frontera obligatorio. Fuente: guía de la ADII (2011), compruebe en douane.gov.ma.`;
    return `**Voiture d'un MRE au Maroc (admission temporaire)** : voiture de tourisme ou moto : **6 mois par année civile**, en continu ou en plusieurs fois, sans prolongation possible ; utilitaire léger : 3 mois. Déclaration en ligne D16ter avant l'arrivée (douane.gov.ma), visée à l'entrée ; à la sortie, présentez les exemplaires « Déclarant » et « Apurement ». Au-delà du délai : pénalité, et la voiture ne sort qu'après paiement. Si votre carte verte ne couvre pas le Maroc, une assurance frontière est obligatoire à l'entrée. Source : guide « Marocains du Monde » de l'ADII (2011) : vérifiez les règles actuelles sur douane.gov.ma.`;
  }

  if (intent === 'minor') {
    // service-public.gouv.fr F1922 (vérifié le 16 avril 2025, lu le 4 octobre
    // 2026) : pièce d'identité ou passeport valide + AST ; règles selon la
    // nationalité du parent signataire. Entrée au Maroc : France Diplomatie.
    if (lang === 'da') return `Wlid qaser kaykhrej mn França bla walidih: khassou carte d'identité wla passeport sali7 **w autorisation de sortie du territoire (AST)** mwe99a3a mn wa7ed l-walidin (service-public.gouv.fr). Bach ydkhol l-Maghrib: passeport sali7 l-moddat l-i9ama kamla. Les règles kaytbeddlo 3la 7sab jensiya dyal l-walid li mwe99a3: tcheck service-public.gouv.fr.`;
    if (lang === 'ar') return `قاصر يغادر فرنسا دون والديه: يحتاج بطاقة تعريف أو جواز سفر ساري المفعول **وإذن الخروج من التراب (AST)** موقّعاً من أحد الوالدين (service-public.gouv.fr). لدخول المغرب: جواز سفر صالح طوال مدة الإقامة. تختلف القواعد حسب جنسية الوالد الموقّع: تحقق على service-public.gouv.fr.`;
    if (lang === 'es') return `Menor que sale de Francia sin sus padres: necesita DNI o pasaporte válido **y la autorización de salida del territorio (AST)** firmada por uno de los padres (service-public.gouv.fr). Para entrar en Marruecos: pasaporte válido durante toda la estancia. Las reglas cambian según la nacionalidad del padre o madre que firma: compruébelo en service-public.gouv.fr.`;
    return `**Mineur qui quitte la France sans ses parents** : il lui faut sa carte d'identité ou son passeport valide **et une autorisation de sortie du territoire (AST)** signée par un parent (service-public.gouv.fr). Pour entrer au Maroc : passeport valide pour toute la durée du séjour (France Diplomatie). Les règles varient selon la nationalité du parent signataire : vérifiez sur service-public.gouv.fr.`;
  }

  if (intent === 'cash') {
    // douane.gouv.fr « Vous voyagez avec 10 000 euros ou plus » (DALIA) ;
    // IGOC 2026 de l'Office des Changes, p. 38 (100 000 DH) et p. 41 (2 000 DH).
    if (lang === 'da') return `Flous cash: f l-khrouj wla d-dkhoul l l-Union européenne, déclaration wajba **mn 10 000 €** (online b DALIA, douane.gouv.fr). F d-dkhoul l l-Maghrib: devises katdéclarihom mn **100 000 DH**, w dirham cash ma ktar mn 2 000 DH (Office des Changes, IGOC 2026).`;
    if (lang === 'ar') return `النقود: عند الخروج من الاتحاد الأوروبي أو الدخول إليه، التصريح إلزامي **ابتداءً من 10 000 يورو** (عبر DALIA، douane.gouv.fr). عند دخول المغرب: التصريح بالعملات الأجنبية ابتداءً من **100 000 درهم**، والدرهم نقداً لا يتجاوز 2 000 درهم (مكتب الصرف، IGOC 2026).`;
    if (lang === 'es') return `Dinero en efectivo: al salir o entrar en la Unión Europea, declaración obligatoria **desde 10 000 €** (en línea con DALIA, douane.gouv.fr). Al entrar en Marruecos: divisas a declarar desde **100 000 MAD**, y como máximo 2 000 MAD en dirhams (Office des Changes, IGOC 2026).`;
    return `**Argent liquide** : en quittant ou en entrant dans l'Union européenne, déclaration obligatoire **à partir de 10 000 €** (en ligne avec DALIA, jusqu'à 30 jours avant le départ : douane.gouv.fr). En entrant au Maroc : devises à déclarer à partir de **100 000 DH**, et 2 000 DH au plus en billets de dirhams (Office des Changes, IGOC 2026).`;
  }

  if (intent === 'customs') {
    // Sources primaires lues le 4 octobre 2026 : guide « Marocains du Monde »
    // de l'ADII (finances.gov.ma, cadeaux < 20 000 DH par année civile) et
    // Instruction générale des opérations de change 2026 (oc.gov.ma : 2 000 DH
    // en billets, déclaration des devises dès 100 000 DH). Aucun chiffre sans
    // source primaire : autres voyageurs, tabac, alcool et parfum renvoyés.
    if (lang === 'da') return `Douane f l-Maghrib: l-cadeaux l-3a2iliya dyal MRE li khddam f l-kharij: a9al mn 20 000 DH f l-3am, merra f l-3am, bla 7aja tijariya w machi ga3 f naw3 wa7ed (guide rasmi dyal ADII). Dirham cash: ma ktar mn 2 000 DH. Devises: déclaration mn 100 000 DH w fo9 (Office des Changes, IGOC 2026). L-akhrin, tabac, l-kohol w parfum: douane.gov.ma.`;
    if (lang === 'ar') return `الجمارك المغربية: الهدايا العائلية لمغاربة العالم الذين يعملون بالخارج: أقل من 20 000 درهم في السنة الميلادية، مرة واحدة في السنة، دون طابع تجاري ولا تتركز في نوع واحد (دليل إدارة الجمارك الرسمي). الدرهم نقداً: لا يتجاوز 2 000 درهم. العملات الأجنبية: التصريح إلزامي ابتداءً من 100 000 درهم (مكتب الصرف، التعليمات العامة 2026). باقي المسافرين والتبغ والكحول والعطور: douane.gov.ma.`;
    if (lang === 'es') return `Aduana marroquí: regalos familiares de un MRE que trabaja en el extranjero: menos de 20 000 MAD por año civil, una vez al año, sin carácter comercial ni concentrados en un solo tipo de artículo (guía oficial de la ADII). Dirhams en efectivo: máximo 2 000 MAD. Divisas: declaración obligatoria desde 100 000 MAD (Office des Changes, IGOC 2026). Otros viajeros, tabaco, alcohol y perfume: douane.gov.ma.`;
    return `**Douane marocaine** : cadeaux familiaux d'un MRE qui travaille à l'étranger : **moins de 20 000 DH** par année civile, une fois par an, sans caractère commercial et pas sur un seul type d'article (guide officiel de l'ADII). Dirhams en espèces : 2 000 DH au plus. Devises : déclaration obligatoire à partir de **100 000 DH** (Office des Changes, IGOC 2026). Autres voyageurs, tabac, alcool et parfum : douane.gov.ma.`;
  }

  if (intent === 'trip') {
    const key = cityKey ?? 'casablanca';
    const city = MOROCCO_CITIES[key];
    const cityName = lang === 'ar' ? city.ar : lang === 'da' ? city.da : city.fr;
    const [weather, pt, rates] = await Promise.all([getWeather(key), getPrayerTimes(key), getLiveRates()]);
    const temp = weather?.current ? `${Math.round(weather.current.temperature_2m ?? 0)}°C, ${describeWeather(weather.current.weather_code ?? 0, lang)}` : null;
    const mad = rates ? rates.MAD.toFixed(2) : '10.90';
    if (weather?.current) trace.live.push('Open-Meteo');
    if (pt) trace.live.push('AlAdhan');
    if (rates) trace.live.push('open.er-api.com');

    if (lang === 'da') {
      const lines = [`🗺️ **Voyage l-${cityName}**`];
      if (temp) lines.push(`🌤️ T-ta9s: ${temp}`);
      if (pt) lines.push(`🕌 Salawat: Fajr ${pt.Fajr} · Dhuhr ${pt.Dhuhr} · Maghrib ${pt.Maghrib}`);
      lines.push(`💶 Sarfa: 1 EUR = ${mad} MAD`);
      lines.push(`📄 Documents: CIN + passeport + assurance voiture`);
      lines.push(`⛴️ Ferry: Algeciras → Tanger Med (1h30)`);
      return lines.join('\n');
    }
    if (lang === 'ar') {
      const lines = [`🗺️ **رحلة إلى ${cityName}**`];
      if (temp) lines.push(`🌤️ الطقس: ${temp}`);
      if (pt) lines.push(`🕌 الصلاة: الفجر ${pt.Fajr} · الظهر ${pt.Dhuhr} · المغرب ${pt.Maghrib}`);
      lines.push(`💶 الصرف: 1 يورو = ${mad} درهم`);
      lines.push(`📄 الوثائق: البطاقة الوطنية + الجواز + تأمين السيارة`);
      lines.push(`⛴️ العبارة: الجزيرة الخضراء → طنجة المتوسط (1س30)`);
      return lines.join('\n');
    }
    if (lang === 'es') {
      const lines = [`🗺️ **Viaje a ${cityName}**`];
      if (temp) lines.push(`🌤️ Tiempo: ${temp}`);
      if (pt) lines.push(`🕌 Oración: Fajr ${pt.Fajr} · Dhuhr ${pt.Dhuhr} · Maghrib ${pt.Maghrib}`);
      lines.push(`💶 Cambio: 1 EUR = ${mad} MAD`);
      lines.push(`📄 Documentos: DNI + pasaporte + seguro del coche`);
      lines.push(`⛴️ Ferry: Algeciras → Tánger Med (1h30)`);
      return lines.join('\n');
    }
    const lines = [`🗺️ **Voyage à ${cityName}**`];
    if (temp) lines.push(`🌤️ Météo : ${temp}`);
    if (pt) lines.push(`🕌 Prières : Fajr ${pt.Fajr} · Dhuhr ${pt.Dhuhr} · Maghrib ${pt.Maghrib}`);
    lines.push(`💶 Change : 1 EUR = ${mad} MAD`);
    lines.push(`📄 Documents : CIN + passeport + assurance véhicule`);
    lines.push(`⛴️ Ferry : Algeciras → Tanger Med (1h30)`);
    return lines.join('\n');
  }

  if (intent === 'ramadan') {
    if (lang === 'da') return `Ramadan f l-Maghrib: iftaar ≈ 7:30-8pm f saif, 5:30-6pm f shta. Shor ≈ 4-5am. l-7awanit kay7ddu bkri. Kaytla9aw atmosphere special — bzzaf dyalna kayrj3u f had l-wa9t.`;
    if (lang === 'ar') return `في رمضان بالمغرب: الإفطار ≈ 7:30-8م صيفاً، 5:30-6م شتاءً. السحور ≈ 4-5ص. المحلات تغلق مبكراً. أجواء رائعة — كثير من المغتربين يعودون خلال هذه الفترة.`;
    return `**Ramadan au Maroc** : iftar ≈ 19h30-20h en été, 17h30-18h en hiver. Suhour ≈ 4-5h. Les commerces ferment plus tôt. Ambiance unique — beaucoup de MRE rentrent exprès pendant cette période.`;
  }

  if (intent === 'football') return handleFootball(msg, lang, trace);

  return null;
}

// ── LLM provider helpers ───────────────────────────────────────────────────
// A provider that hangs must not use up the whole function budget: the next one gets its turn.
const LLM_TIMEOUT_MS = 8_000;

// Groq retires models without notice and a new account may not see all of them,
// so each free provider lists several; the first one that answers wins.
const GROQ_MODELS = ['llama-3.3-70b-versatile', 'openai/gpt-oss-20b', 'llama-3.1-8b-instant'];
const GEMINI_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest'];

async function firstAnswer(baseUrl: string, models: string[], apiKey: string, systemPrompt: string, message: string, providerName: string): Promise<string | null> {
  for (const model of models) {
    const text = await callOpenAICompatible(baseUrl, model, apiKey, systemPrompt, message, providerName);
    if (text) return text;
  }
  return null;
}

async function callOpenAICompatible(baseUrl: string, model: string, apiKey: string, systemPrompt: string, message: string, providerName: string): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model, max_tokens: 512, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }] }),
      signal: AbortSignal.timeout(LLM_TIMEOUT_MS),
    });
    if (!res.ok) { console.error(`[hadak] ${providerName} ${model} error ${res.status}`); return null; }
    const data = (await res.json()) as OpenAICompatibleResponse;
    return data.choices?.[0]?.message?.content ?? null;
  } catch (e) { console.error(`[hadak] ${providerName} failed:`, e); return null; }
}

async function callAnthropic(apiKey: string, systemPrompt: string, message: string): Promise<string | null> {
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 512, system: systemPrompt, messages: [{ role: 'user', content: message }] }),
    });
    if (!res.ok) { console.error('[hadak] Anthropic error', res.status); return null; }
    const data = (await res.json()) as AnthropicResponse;
    return data.content?.find(b => b.type === 'text')?.text ?? null;
  } catch (e) { console.error('[hadak] Anthropic failed:', e); return null; }
}

// ── System prompts ─────────────────────────────────────────────────────────
/** Au-delà, la requête est refusée avant tout appel à un fournisseur LLM. */
const MAX_MESSAGE_CHARS = 1_000;

// The AI answered "250 USD" for the Moroccan customs allowance (production,
// 2026-10-04): it must never produce a figure, price, legal delay, rule,
// address or phone number; it points to the official source instead.
const NO_INVENTION: Record<string, string> = {
  da: `Ma t3tich abadan chi ra9m, taman, ajal 9anouni, 9a3ida dyal douane wla idara, 3onwan wla ra9m telephone: 9oul belli ma 3andekch source m2akkda w 3tih l-site r-rasmi li kayt3l9 b l-mawdou3 (b7al douane.gov.ma l d-douane, service-public.gouv.fr l l-wra9 f França, l-consulat l l-wra9 l-maghribiya, site dyal charika l chi taman wla wa9t).`,
  fr: `Ne donne jamais de chiffre, prix, délai légal, règle douanière ou administrative, adresse ou numéro de téléphone : dis que tu n'as pas de source vérifiée et renvoie vers le site officiel qui correspond au sujet (par exemple douane.gov.ma pour la douane marocaine, service-public.gouv.fr pour les démarches françaises, le consulat pour les papiers marocains, le site de l'opérateur pour un prix ou un horaire).`,
  en: `Never give a figure, price, legal deadline, customs or administrative rule, address or phone number: say you have no verified source and point to the official site that matches the topic (for example douane.gov.ma for Moroccan customs, service-public.gouv.fr for French formalities, the consulate for Moroccan papers, the operator's own site for a price or a timetable).`,
  ar: `لا تعطِ أبداً رقماً أو سعراً أو أجلاً قانونياً أو قاعدة جمركية أو إدارية أو عنواناً أو رقم هاتف: قل إنه لا يوجد لديك مصدر موثّق ووجّه إلى الموقع الرسمي المناسب للموضوع (مثلاً douane.gov.ma للجمارك المغربية، service-public.gouv.fr للإجراءات الفرنسية، القنصلية للوثائق المغربية، موقع الشركة المعنية للأسعار أو المواعيد).`,
  es: `Nunca des cifras, precios, plazos legales, normas aduaneras o administrativas, direcciones ni teléfonos: di que no tienes una fuente verificada y remite al sitio oficial que corresponda al tema (por ejemplo douane.gov.ma para la aduana marroquí, service-public.gouv.fr para trámites franceses, el consulado para papeles marroquíes, la web del operador para un precio o un horario).`,
};

const SYSTEM_PROMPTS: Record<string, string> = {
  da: `Nta Hadak — assistant dyal MRE. Jaweb b darija, MAX 2 jmal, 3tini l-jawab mbachar bla moqadima. ${NO_INVENTION.da}`,
  fr: `Tu es Hadak — assistant MRE. Réponds en français, MAX 2 phrases, va droit au but sans intro. ${NO_INVENTION.fr}`,
  en: `You are Hadak — MRE assistant. Reply in English, MAX 2 sentences, answer directly no intro. ${NO_INVENTION.en}`,
  ar: `أنت حدّاك — مساعد MRE. أجب بالعربية، جملتان MAX، مباشرة بدون مقدمة. ${NO_INVENTION.ar}`,
  es: `Eres Hadak — asistente MRE. Responde en español, MAX 2 frases, directo sin intro. ${NO_INVENTION.es}`,
};

// ── Intent log (month-1 metric: intent → resolution rate) ─────────────────
// One line per question, never the question itself: which intent, how it
// was resolved, where the answer came from, how many suggestions were shown.
function logIntent(intent: string, resolution: 'LOCAL' | 'AI' | 'OFFLINE', basis: string | null, nextActions: number): void {
  console.info(`[hadak-intent] ${JSON.stringify({ intent, resolution, basis, next_actions: nextActions })}`);
}

// ── Main handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { message, lang = 'fr', education } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }
    // Optional explicit choice from the app: { mode?, level?, wantsFullSolution? }.
    if (education !== undefined && (
      typeof education !== 'object' || education === null
      || (education.mode !== undefined && !(typeof education.mode === 'string' && isEducationMode(education.mode)))
      || (education.level !== undefined && !(typeof education.level === 'string' && isEducationLevel(education.level)))
      || (education.wantsFullSolution !== undefined && typeof education.wantsFullSolution !== 'boolean')
    )) {
      return NextResponse.json({ error: 'Invalid education options' }, { status: 400 });
    }
    // Chaque message peut partir vers un LLM payant : on borne sa taille
    // avant tout appel (la limite par IP du proxy ne borne pas les tokens).
    if (message.length > MAX_MESSAGE_CHARS) {
      return NextResponse.json({ error: 'Message too long' }, { status: 413 });
    }

    // hasOwn : « constructor » ou « __proto__ » ne doivent pas servir de prompt système.
    const selectedLang = isHadakLang(lang) ? lang : 'fr';
    // The selector is the conversation default, not a hard lock. If the user
    // clearly switches language, Hadak follows the language actually used.
    const responseLang = detectHadakLanguage(message, selectedLang);
    const basePrompt =
      Object.hasOwn(SYSTEM_PROMPTS, responseLang) ? SYSTEM_PROMPTS[responseLang] : SYSTEM_PROMPTS.fr;
    const systemPrompt = `${basePrompt} Maroc : ${moroccoUtcOffset()}, il est ${getMoroccoTime()}.`;
    const intent = detectIntent(message);
    const guideLang = responseLang;

    if (education !== undefined || intent === 'education') {
      const inferred = inferEducation(normalize(message));
      const plan = buildEducationPlan({
        mode: education?.mode ?? inferred.mode,
        level: education?.level ?? inferred.level,
        language: isEducationLanguage(responseLang) ? responseLang : 'fr',
        prompt: message,
        wantsFullSolution: education?.wantsFullSolution,
      });
      const routed = await routeHadakAI({
        message: plan.prompt,
        systemPrompt: `You are Hadak, a patient tutor for Moroccan families and students. ${plan.instruction}`,
        maxTokens: 1500,
      });
      const educationInfo = { mode: plan.mode, level: plan.level ?? null, solution_policy: plan.solutionPolicy };
      if (routed.text) {
        logIntent('education', 'AI', 'AI', 0);
        return NextResponse.json({
          response: routed.text, fallback: false, source: routed.provider ?? 'router', request_id: routed.requestId, education: educationInfo,
          trust: provenanceOf({ live: [], liveOnly: false, ai: true }), next_actions: [],
        });
      }
      logIntent('education', 'OFFLINE', null, 0);
      return NextResponse.json({ response: buildOfflineFallback(responseLang, message), fallback: true, education: educationInfo });
    }

    // 1. Smart local responder — free, always available, real-time data
    const localStarted = Date.now();
    const trace = newTrace();
    const local = await buildLocalResponse(message, responseLang, intent, trace);
    if (local) {
      // Football records its own resolution (cache, router or static text).
      if (intent !== 'football') {
        const usesLiveData = intent === 'services' || intent === 'weather' || intent === 'prayer' || intent === 'currency' || intent === 'trip' || intent === 'generic';
        recordResolution(usesLiveData ? 'EXTERNAL_DATA' : 'DETERMINISTIC_LOCAL', Date.now() - localStarted);
      }
      const trust = provenanceOf(trace);
      const nextActions = nextActionsFor(intent, guideLang);
      logIntent(intent, trust.basis === 'AI' ? 'AI' : 'LOCAL', trust.basis, nextActions.length);
      return NextResponse.json({ response: local, fallback: false, source: 'local', trust, next_actions: nextActions });
    }

    // 2. Shared AI Router — provider registry, FREE_ONLY, circuit breaker and ledger.
    const routed = await routeHadakAI({ message, systemPrompt });
    if (routed.text) {
      const nextActions = nextActionsFor(intent, guideLang);
      logIntent(intent, 'AI', 'AI', nextActions.length);
      return NextResponse.json({
        response: routed.text,
        fallback: false,
        source: routed.provider ?? 'router',
        request_id: routed.requestId,
        trust: provenanceOf({ live: [], liveOnly: false, ai: true }),
        next_actions: nextActions,
      });
    }

    // No LLM available — return a helpful offline guide instead of an empty response
    logIntent(intent, 'OFFLINE', null, 0);
    return NextResponse.json({ response: buildOfflineFallback(lang, message), fallback: true });
  } catch (err) {
    console.error('[hadak] error:', err);
    return NextResponse.json({ response: buildOfflineFallback('fr', ''), fallback: true });
  }
}

// ── Offline fallback — shown when no LLM is reachable ─────────────────────
function buildOfflineFallback(lang: string, message: string): string {
  const q = message.trim().length > 0 ? `"${message.slice(0, 60)}${message.length > 60 ? '…' : ''}"` : '';
  const topics: Record<string, string> = {
    da: `Ma qdersh njaweb 3la ${q || 'had s-so2al'} bla connexion l-LLM daba.\n\nWalayenni nqder njawbek 3la had l-mawadi3 men gher internet:\n• 🌤️ **T-ta9s** — "chno kayna meteo f Marrakech"\n• 🕌 **Salawat** — "wa9t salat f Taza"\n• 💶 **Sarfa** — "sh7al kaytswwa l-euro b dirham"\n• ⏰ **L-wa9t** — "sh7al l-wa9t f Maghrib"\n• 🚢 **Ferry** — horaires w compagnies\n• 📄 **Watha2i9** — passeport, visa, CIN\n• 📱 **SIM** — forfaits Maroc Telecom, Orange, Inwi\n• ⛽ **Carburant** — prix mazout w essence\n• ⚽ **Kora** — pronostics Botola, Lions de l'Atlas`,
    fr: `Je ne peux pas répondre à ${q || 'cette question'} sans connexion LLM pour l'instant.\n\nMais je réponds instantanément à ces sujets sans internet :\n• 🌤️ **Météo** — "quel temps à Agadir ?"\n• 🕌 **Prières** — "horaires de prière à Fès"\n• 💶 **Change** — "combien vaut 100€ en dirhams ?"\n• ⏰ **Heure Maroc** — "quelle heure au Maroc ?"\n• 🚢 **Ferry** — horaires et compagnies\n• 📄 **Documents** — passeport, visa, CIN\n• 📱 **SIM** — forfaits opérateurs marocains\n• ⛽ **Carburant** — prix à la pompe\n• ⚽ **Football** — pronostics Botola, Lions de l'Atlas`,
    en: `I can't answer ${q || 'that question'} without an LLM connection right now.\n\nBut I answer these instantly with no internet needed:\n• 🌤️ **Weather** — "what's the weather in Rabat?"\n• 🕌 **Prayers** — "prayer times in Casablanca"\n• 💶 **Exchange** — "how much is 100€ in dirhams?"\n• ⏰ **Morocco time** — "what time is it in Morocco?"\n• 🚢 **Ferry** — schedules and companies\n• 📄 **Documents** — passport, visa, ID card\n• 📱 **SIM** — Moroccan carrier plans\n• ⛽ **Fuel** — pump prices\n• ⚽ **Football** — Botola predictions, Atlas Lions`,
    ar: `لا أستطيع الإجابة على ${q || 'هذا السؤال'} بدون اتصال LLM الآن.\n\nلكن أجيب فوراً على هذه المواضيع بدون انترنت:\n• 🌤️ **الطقس** — "كيف الطقس في مراكش؟"\n• 🕌 **أوقات الصلاة** — "مواعيد الصلاة في فاس"\n• 💶 **الصرف** — "كم يساوي 100 يورو بالدرهم؟"\n• ⏰ **توقيت المغرب** — "كم الساعة في المغرب؟"\n• 🚢 **العبارة** — المواعيد والشركات\n• 📄 **الوثائق** — جواز السفر، التأشيرة، البطاقة الوطنية\n• 📱 **الشريحة** — باقات المشغلين المغاربة\n• ⛽ **الوقود** — أسعار المحطات\n• ⚽ **كرة القدم** — توقعات البطولة، أسود الأطلس`,
    es: `No puedo responder a ${q || 'esa pregunta'} sin conexión LLM ahora mismo.\n\nPero respondo al instante sobre estos temas sin internet:\n• 🌤️ **Tiempo** — "¿qué tiempo hace en Agadir?"\n• 🕌 **Oraciones** — "horarios de oración en Fez"\n• 💶 **Cambio** — "¿cuánto vale 100€ en dírhams?"\n• ⏰ **Hora Marruecos** — "¿qué hora es en Marruecos?"\n• 🚢 **Ferry** — horarios y compañías\n• 📄 **Documentos** — pasaporte, visado, DNI\n• 📱 **SIM** — tarifas operadoras marroquíes\n• ⛽ **Combustible** — precios en gasolineras\n• ⚽ **Fútbol** — pronósticos Botola, Leones del Atlas`,
  };
  return topics[lang] ?? topics.fr;
}
