import { NextRequest, NextResponse } from 'next/server';

import { MOROCCO_CITIES, detectCity } from '@/lib/moroccoCities';
import { cacheFootballAnswer, footballCacheKey, getCachedFootballAnswer } from '@/lib/hadakFootballCache';

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
    timeZone: 'Africa/Casablanca',
    hour: '2-digit',
    minute: '2-digit',
  });
}
function getMoroccoDate(): string {
  return new Date().toLocaleDateString('fr-FR', {
    timeZone: 'Africa/Casablanca',
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

// ── TheSportsDB football helper (free, key "3" public) ────────────────────
type SportsDBTeam  = { idTeam: string; strTeam: string };
type SportsDBEvent = { strHomeTeam: string; intHomeScore: string; strAwayTeam: string; intAwayScore: string; dateEvent: string };

async function handleFootball(msg: string, lang: string): Promise<string> {
  const msgLower = msg.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  // Teams whose names we recognize in the message
  const TEAM_QUERIES = ['wydad', 'raja', 'ittihad tanger', 'difaa hassani', 'renaissance berkane', 'fus rabat',
    'moghreb tetouan', 'mouloudia oujda', 'man city', 'real madrid', 'barcelona', 'psg'];
  const mentioned = TEAM_QUERIES.filter(t => msgLower.includes(t.split(' ')[0]));

  // --- Form data for mentioned teams ---
  let formData = '';
  for (const teamQuery of mentioned.slice(0, 2)) {
    try {
      const s = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamQuery)}`,
        { next: { revalidate: 86400 } }
      ).then(r => r.json()).catch(() => null) as { teams?: SportsDBTeam[] } | null;
      const team = s?.teams?.[0];
      if (!team?.idTeam) continue;
      const ev = await fetch(
        `https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=${team.idTeam}`,
        { next: { revalidate: 3600 } }
      ).then(r => r.json()).catch(() => null) as { results?: SportsDBEvent[] } | null;
      const last5 = ev?.results?.slice(0, 5) ?? [];
      if (last5.length === 0) continue;
      const form = last5.map(e => {
        const home = e.strHomeTeam.toLowerCase().includes(teamQuery.split(' ')[0]);
        const gf = parseInt(home ? e.intHomeScore : e.intAwayScore);
        const ga = parseInt(home ? e.intAwayScore : e.intHomeScore);
        return isNaN(gf) ? '?' : gf > ga ? 'W' : gf < ga ? 'L' : 'D';
      }).join('');
      const last = last5[0];
      formData += `${team.strTeam} (forme: ${form}): dernier match ${last.strHomeTeam} ${last.intHomeScore}-${last.intAwayScore} ${last.strAwayTeam}\n`;
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

  // --- Try Claude for prediction ---
  const anthropicKey = process.env.ANTHROPIC_API_KEY ||
    Object.entries(process.env).find(([k]) => /^ANTHROPIC.API.(KEY|CL[EÉeé])/i.test(k))?.[1] ||
    Object.values(process.env).find(v => v?.startsWith('sk-ant-'));
  const cacheKey = footballCacheKey(lang, mentioned);
  const cached = mentioned.length > 0 ? getCachedFootballAnswer(cacheKey) : null;
  if (cached) return cached;

  if (anthropicKey && (formData || mentioned.length > 0)) {
    try {
      const langLabel = lang === 'da' ? 'darija marocaine' : lang === 'ar' ? 'arabe' : lang === 'es' ? 'espagnol' : lang === 'en' ? 'anglais' : 'français';
      const context = [
        nextMatchesText ? `Prochains matchs Botola Pro:\n${nextMatchesText}` : '',
        formData ? `Forme récente:\n${formData}` : '',
      ].filter(Boolean).join('\n\n');
      const userContent = context ? `Données:\n${context}\n\nQuestion: ${msg}` : msg;
      const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001', max_tokens: 350,
          system: `Tu es un expert passionné de football marocain (Botola Pro, équipe nationale Lions de l'Atlas, CAF). Tu analyses les données de forme et donnes des pronostics argumentés. Réponds en ${langLabel}, 3-4 phrases maximum, direct et précis.`,
          messages: [{ role: 'user', content: userContent }],
        }),
      });
      if (apiRes.ok) {
        const data = await apiRes.json() as AnthropicResponse;
        const text = data.content?.find(b => b.type === 'text')?.text;
        if (text) {
          cacheFootballAnswer(cacheKey, text);
          return text;
        }
      }
    } catch { /* fall through */ }
  }

  // --- Static fallback ---
  if (nextMatchesText) {
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
type Intent = 'weather' | 'time' | 'ferry' | 'docs' | 'currency' | 'prayer' | 'sim' | 'ramadan' | 'fuel' | 'trip' | 'football' | 'generic';

function detectIntent(msg: string): Intent {
  const m = msg.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  // Trip planning — "prépare-moi un voyage à X", "safari l X", "je veux aller à X"
  if (/\b(prepare|preparer|planifie|organise|voyage.*\ba\b|safari.*\bl\b|veux.*aller|want.*go|quiero.*ir|trip.*to|bghit.*nmshi|bghit.*nsafr)\b/.test(m)) return 'trip';
  // Weather — broad pattern: temps, meteo, chaud, froid, pluie, soleil, nuageux, brouillard, vent
  if (/\b(temps|meteo|weather|ta9s|chaud|froid|pluie|soleil|nuage|brouillard|vent|temperature|il fait|fait-il|t-il chaud|t-il froid|climat)\b/.test(m)) return 'weather';
  // Prayer — checked before "time": "wa9t salat" and "à quelle heure est la
  // prière" both contain a time word (heure/wa9t) *and* a prayer word: the
  // prayer word must win, or the app answers the clock instead of the
  // prayer times it was actually asked for.
  if (/\b(priere|salat|prayer|salawat|fajr|dhuhr|asr|maghrib|isha|صلاة|موعد الصلاة|adhan|azan|imsakiyya|horaire.*(priere|salat)|quando.*(priere|salat))\b/.test(m)) return 'prayer';
  // Time
  if (/\b(heure|time|wa9t|وقت|maintenant|en ce moment|quelle heure|what time|hora|zeit|ora)\b/.test(m)) return 'time';
  // Explicit document words — checked before "ferry": "quels documents pour
  // passer à Tanger Med" names a port but asks about papers. Only unambiguous
  // document words here; "rentrer/entrer" stay in the later docs rule so
  // "quel ferry pour rentrer au Maroc" still gets the ferry answer.
  if (/\b(documents?|passeport|passport|visa|papiers?|watha2iq|carte.*(nationale|identite)|laissez.passer)\b/.test(m)) return 'docs';
  // Ferry
  if (/\b(ferry|bateau|traversee|boat|algeciras|tanger med|tarifa|barcelona|genova|grimaldi|ceuta|balearia|trasmed|crossing|traversia)\b/.test(m)) return 'ferry';
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
  if (/\b(foot|football|kora|lkora|ballon|wydad|raja|ittihad|difaa|renaissance|fus|botola|botola pro|caf|can|lions de l.atlas|lions atlas|equipe nationale|pronostic|qui va gagner|gagner ce soir|match.*ce soir|men 3ndo lhaq|ghayrbe7|man city|real madrid|barcelona|psg|premier league|champions league|ligue 1|liga)\b/.test(m)) return 'football';
  return 'generic';
}

async function buildLocalResponse(msg: string, lang: string, intent: Intent): Promise<string | null> {
  const time = getMoroccoTime();
  const date = getMoroccoDate();
  const cityKey = detectCity(msg);

  if (intent === 'time') {
    if (lang === 'da') return `F l-Maghrib daba ${time} (${date}). L-Maghrib kaytbi3 UTC+1 bla changement d'heure.`;
    if (lang === 'ar') return `الوقت الآن في المغرب ${time} (${date}). المغرب على توقيت UTC+1 بدون تغيير.`;
    if (lang === 'es') return `En Marruecos son las ${time} (${date}). Marruecos sigue UTC+1 sin cambio horario.`;
    return `Il est actuellement **${time}** au Maroc (${date}). Le Maroc suit UTC+1 toute l'année, sans changement d'heure.`;
  }

  if (intent === 'weather' || (intent === 'generic' && cityKey)) {
    const key = cityKey ?? 'casablanca';
    const city = MOROCCO_CITIES[key];
    const weather = await getWeather(key);
    const cityName = lang === 'ar' ? city.ar : lang === 'da' ? city.da : city.fr;

    if (weather?.current) {
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
    if (lang === 'da') return `Carburant f l-Maghrib: essence ≈ 14-15 MAD/l, gasoil ≈ 11-12 MAD/l. Stations-service f kull triq. Shell, Afriquia, Total moujoudin. F l-blad l-b3ida, 3lash t3ammr 9bal ma tmshi.`;
    if (lang === 'ar') return `أسعار الوقود في المغرب: بنزين ≈ 14-15 درهم/لتر، غازوال ≈ 11-12 درهم/لتر. محطات Shell, Afriquia, Total في كل مكان. في المناطق النائية، ابل بالتعبئة قبل المغادرة.`;
    if (lang === 'es') return `Combustible en Marruecos: gasolina ≈ 14-15 MAD/l, gasóleo ≈ 11-12 MAD/l. Gasolineras Shell, Afriquia, Total por todo el país. En zonas remotas, llena el depósito antes de salir.`;
    return `**Carburant au Maroc** : essence ≈ 14-15 MAD/l, gasoil ≈ 11-12 MAD/l. Stations Shell, Afriquia, Total partout. En zone rurale, faites le plein avant de partir — les stations peuvent être espacées.`;
  }

  if (intent === 'trip') {
    const key = cityKey ?? 'casablanca';
    const city = MOROCCO_CITIES[key];
    const cityName = lang === 'ar' ? city.ar : lang === 'da' ? city.da : city.fr;
    const [weather, pt, rates] = await Promise.all([getWeather(key), getPrayerTimes(key), getLiveRates()]);
    const temp = weather?.current ? `${Math.round(weather.current.temperature_2m ?? 0)}°C, ${describeWeather(weather.current.weather_code ?? 0, lang)}` : null;
    const mad = rates ? rates.MAD.toFixed(2) : '10.90';

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

  if (intent === 'football') return handleFootball(msg, lang);

  return null;
}

// ── Paid provider helpers ──────────────────────────────────────────────────
async function callOpenAICompatible(baseUrl: string, model: string, apiKey: string, systemPrompt: string, message: string, providerName: string): Promise<string | null> {
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model, max_tokens: 512, messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }] }),
    });
    if (!res.ok) { console.error(`[hadak] ${providerName} error ${res.status}`); return null; }
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
  da: `Nta Hadak — assistant dyal MRE. Jaweb b darija, MAX 2 jmal, 3tini l-jawab mbachar bla moqadima. L-Maghrib: UTC+1.`,
  fr: `Tu es Hadak — assistant MRE. Réponds en français, MAX 2 phrases, va droit au but sans intro. Maroc : UTC+1.`,
  en: `You are Hadak — MRE assistant. Reply in English, MAX 2 sentences, answer directly no intro. Morocco: UTC+1.`,
  ar: `أنت حدّاك — مساعد MRE. أجب بالعربية، جملتان MAX، مباشرة بدون مقدمة. المغرب: UTC+1.`,
  es: `Eres Hadak — asistente MRE. Responde en español, MAX 2 frases, directo sin intro. Marruecos: UTC+1.`,
};

// ── Main handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { message, lang = 'fr' } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }
    // Chaque message peut partir vers un LLM payant : on borne sa taille
    // avant tout appel (la limite par IP du proxy ne borne pas les tokens).
    if (message.length > MAX_MESSAGE_CHARS) {
      return NextResponse.json({ error: 'Message too long' }, { status: 413 });
    }

    // hasOwn : « constructor » ou « __proto__ » ne doivent pas servir de prompt système.
    const systemPrompt =
      typeof lang === 'string' && Object.hasOwn(SYSTEM_PROMPTS, lang) ? SYSTEM_PROMPTS[lang] : SYSTEM_PROMPTS.fr;
    const intent = detectIntent(message);

    // 1. Smart local responder — free, always available, real-time data
    const local = await buildLocalResponse(message, lang, intent);
    if (local) return NextResponse.json({ response: local, fallback: false, source: 'local' });

    // 2. Groq — free tier, no CC, OpenAI-compatible
    const groqKey = process.env.GROQ_API_KEY || findEnvKey(/^GROQ.API.KEY$/i) || findEnvValue('gsk_');
    if (groqKey) {
      const text = await callOpenAICompatible('https://api.groq.com/openai/v1', 'llama-3.1-8b-instant', groqKey, systemPrompt, message, 'Groq');
      if (text) return NextResponse.json({ response: text, fallback: false, source: 'groq' });
    }

    // 3. OpenAI
    const openaiKey = process.env.OPENAI_API_KEY || findEnvKey(/^OPENAI.API.KEY$/i);
    if (openaiKey) {
      const text = await callOpenAICompatible('https://api.openai.com/v1', 'gpt-4o-mini', openaiKey, systemPrompt, message, 'OpenAI');
      if (text) return NextResponse.json({ response: text, fallback: false, source: 'openai' });
    }

    // 4. Anthropic
    const anthropicKey = process.env.ANTHROPIC_API_KEY || findEnvKey(/^ANTHROPIC.API.(KEY|CL[EÉeé])/i) || findEnvValue('sk-ant-');
    if (anthropicKey) {
      const text = await callAnthropic(anthropicKey, systemPrompt, message);
      if (text) return NextResponse.json({ response: text, fallback: false, source: 'anthropic' });
    }

    // No LLM available — return a helpful offline guide instead of an empty response
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
