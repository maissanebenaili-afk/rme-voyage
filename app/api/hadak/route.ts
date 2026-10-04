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
type Intent = 'services' | 'weather' | 'time' | 'ferry' | 'docs' | 'customs' | 'currency' | 'prayer' | 'sim' | 'ramadan' | 'fuel' | 'trip' | 'football' | 'education' | 'generic';

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

function detectIntent(msg: string): Intent {
  const m = msg.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  // School work first: "prépare-moi pour le bac" must not become a trip card.
  if (EDUCATION_RE.test(m)) return 'education';
  // A real place nearby (garage, consulate, station…): before trip, weather,
  // fuel and clock, which used to answer "garage près de Taza" with the weather.
  if (detectServiceRequest(msg)) return 'services';
  // Trip planning — "prépare-moi un voyage à X", "safari l X", "je veux aller à X"
  if (/\b(prepare|preparer|planifie|organise|voyage.*\ba\b|safari.*\bl\b|veux.*aller|want.*go|quiero.*ir|trip.*to|bghit.*nmshi|bghit.*nsafr)\b/.test(m)) return 'trip';
  // Weather — broad pattern: temps, meteo, chaud, froid, pluie, soleil, nuageux, brouillard, vent
  if (/\b(temps|meteo|weather|ta9s|chaud|froid|pluie|soleil|nuage|brouillard|vent|temperature|il fait|fait-il|t-il chaud|t-il froid|climat)\b/.test(m)) return 'weather';
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
  if (/\b(ferry|bateau|traversee|boat|algeciras|tanger med|tarifa|genova|grimaldi|ceuta|balearia|trasmed|crossing|traversia)\b/.test(m)) return 'ferry';
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
  if (/\b(heure|time|wa9t|وقت|maintenant|en ce moment|quelle heure|what time|hora|zeit|ora)\b/.test(m)) return 'time';
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

  if (intent === 'weather' || (intent === 'generic' && cityKey)) {
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
    if (lang === 'da') return `Ferry dyal MRE: Algeciras → Tanger Med (1h30, bzzaf compagnies: FRS, Balearia, Trasmediterranea). Tarifa → Tanger Ville (35 min). Barcelona/Genova → Nador (Grimaldi). L-waqt dialhoum: htta 5-6 sa3at f ramadan. Hsen tkon 3andek réservation.`;
    if (lang === 'ar') return `العبارات للمغاربة في الخارج: الجزيرة الخضراء → طنجة المتوسط (1س30). طريفة → طنجة المدينة (35 دقيقة). برشلونة/جنوة → الناظور (Grimaldi). احجز مسبقاً في موسم الصيف.`;
    if (lang === 'es') return `Ferry para MRE: Algeciras → Tanger Med (1h30, FRS/Balearia/Trasmediterranea). Tarifa → Tánger ciudad (35 min). Barcelona/Génova → Nador (Grimaldi). Reserva con antelación en verano.`;
    return `**Ferries pour les MRE** : Algeciras → Tanger Med (1h30, FRS/Balearia/Trasmed). Tarifa → Tanger Ville (35 min). Barcelona/Gênes → Nador (Grimaldi). En été, réservez à l'avance — les traversées affichent complet rapidement.`;
  }

  if (intent === 'docs') {
    if (lang === 'da') return `Documents li khassak: CIN (wajib l-Magharba) + Passeport. Permis dyal siyaqa marocain maqboul. Voiture: assurance + carte grise. L-Maghrib ma kaytlabu visa l-europiyyin.`;
    if (lang === 'ar') return `الوثائق الضرورية: بطاقة التعريف الوطنية + جواز السفر. رخصة القيادة المغربية معترف بها. السيارة: تأمين + بطاقة رمادية. المغرب لا يشترط تأشيرة للأوروبيين.`;
    if (lang === 'es') return `Documentos necesarios: DNI marroquí + pasaporte. El permiso de conducir marroquí es válido. Coche: seguro + carta gris. Marruecos no exige visado a europeos.`;
    return `**Documents nécessaires** : CIN (obligatoire pour les Marocains) + passeport. Permis de conduire marocain accepté. Pour la voiture : assurance + carte grise. Le Maroc n'exige pas de visa pour les Européens.`;
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
    if (lang === 'da') return `SIM f l-Maghrib: Maroc Telecom, Inwi, Orange. Ghanni bzzaf — 3G/4G f kull blad. Forfait b 10-20 MAD l-jum3a. Khassk passeport bach tshri SIM. eSIM kaytkhdam m3a ba3d les téléphones.`;
    if (lang === 'ar') return `شرائح SIM في المغرب: اتصالات المغرب، إنوي، أورانج. رخيصة جداً — تغطية 4G في كل مكان. باقة أسبوعية بـ 10-20 درهم. تحتاج جواز السفر للشراء. بعض الهواتف تدعم eSIM.`;
    if (lang === 'es') return `SIM en Marruecos: Maroc Telecom, Inwi, Orange. Muy barato — cobertura 4G por todo el país. Tarifa semanal por 10-20 MAD. Necesitas pasaporte para comprar. Algunos móviles admiten eSIM.`;
    return `**SIM au Maroc** : Maroc Telecom, Inwi, Orange. Très abordable — couverture 4G dans tout le pays. Forfait hebdomadaire pour 10-20 MAD. Passeport requis à l'achat. Certains téléphones supportent l'eSIM.`;
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

const SYSTEM_PROMPTS: Record<string, string> = {
  da: `Nta Hadak — assistant dyal MRE. Jaweb b darija, MAX 2 jmal, 3tini l-jawab mbachar bla moqadima.`,
  fr: `Tu es Hadak — assistant MRE. Réponds en français, MAX 2 phrases, va droit au but sans intro.`,
  en: `You are Hadak — MRE assistant. Reply in English, MAX 2 sentences, answer directly no intro.`,
  ar: `أنت حدّاك — مساعد MRE. أجب بالعربية، جملتان MAX، مباشرة بدون مقدمة.`,
  es: `Eres Hadak — asistente MRE. Responde en español, MAX 2 frases, directo sin intro.`,
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
