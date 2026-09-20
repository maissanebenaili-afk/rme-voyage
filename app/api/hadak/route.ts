import { NextRequest, NextResponse } from 'next/server';

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

// ── Moroccan cities geo database ───────────────────────────────────────────
const MOROCCO_CITIES: Record<string, { lat: number; lon: number; fr: string; ar: string; da: string }> = {
  casablanca: { lat: 33.59, lon: -7.62, fr: 'Casablanca', ar: 'الدار البيضاء', da: 'Casa' },
  marrakech:  { lat: 31.63, lon: -8.01, fr: 'Marrakech',  ar: 'مراكش',         da: 'Marrakech' },
  fes:        { lat: 34.04, lon: -5.00, fr: 'Fès',        ar: 'فاس',           da: 'Fès' },
  fès:        { lat: 34.04, lon: -5.00, fr: 'Fès',        ar: 'فاس',           da: 'Fès' },
  tanger:     { lat: 35.77, lon: -5.80, fr: 'Tanger',     ar: 'طنجة',          da: 'Tanger' },
  tangier:    { lat: 35.77, lon: -5.80, fr: 'Tanger',     ar: 'طنجة',          da: 'Tanger' },
  agadir:     { lat: 30.42, lon: -9.60, fr: 'Agadir',     ar: 'أكادير',        da: 'Agadir' },
  rabat:      { lat: 34.02, lon: -6.84, fr: 'Rabat',      ar: 'الرباط',        da: 'Rbat' },
  oujda:      { lat: 34.68, lon: -1.91, fr: 'Oujda',      ar: 'وجدة',          da: 'Oujda' },
  meknes:     { lat: 33.89, lon: -5.55, fr: 'Meknès',     ar: 'مكناس',         da: 'Meknes' },
  meknès:     { lat: 33.89, lon: -5.55, fr: 'Meknès',     ar: 'مكناس',         da: 'Meknes' },
  nador:      { lat: 35.17, lon: -2.93, fr: 'Nador',      ar: 'الناظور',       da: 'Nador' },
  tetouan:    { lat: 35.57, lon: -5.37, fr: 'Tétouan',    ar: 'تطوان',         da: 'Tetouan' },
  tétouan:    { lat: 35.57, lon: -5.37, fr: 'Tétouan',    ar: 'تطوان',         da: 'Tetouan' },
  safi:       { lat: 32.30, lon: -9.24, fr: 'Safi',       ar: 'آسفي',          da: 'Safi' },
  kenitra:    { lat: 34.26, lon: -6.58, fr: 'Kénitra',    ar: 'القنيطرة',      da: 'Kenitra' },
  kénitra:    { lat: 34.26, lon: -6.58, fr: 'Kénitra',    ar: 'القنيطرة',      da: 'Kenitra' },
  essaouira:  { lat: 31.51, lon: -9.76, fr: 'Essaouira',  ar: 'الصويرة',       da: 'Essaouira' },
  ouarzazate: { lat: 30.92, lon: -6.91, fr: 'Ouarzazate', ar: 'ورزازات',       da: 'Ouarzazate' },
  benimelal:  { lat: 32.34, lon: -6.36, fr: 'Beni Mellal',ar: 'بني ملال',      da: 'Beni Mellal' },
  taza:       { lat: 34.22, lon: -4.01, fr: 'Taza',       ar: 'تازة',          da: 'Taza' },
  larache:    { lat: 35.19, lon: -6.15, fr: 'Larache',    ar: 'العرائش',       da: 'Larache' },
  khouribga:  { lat: 32.88, lon: -6.91, fr: 'Khouribga',  ar: 'خريبكة',        da: 'Khouribga' },
  settat:     { lat: 33.00, lon: -7.62, fr: 'Settat',     ar: 'سطات',          da: 'Settat' },
  berrechid:  { lat: 33.27, lon: -7.59, fr: 'Berrechid',  ar: 'برشيد',         da: 'Berrechid' },
  sale:       { lat: 34.04, lon: -6.80, fr: 'Salé',       ar: 'سلا',           da: 'Salé' },
  salé:       { lat: 34.04, lon: -6.80, fr: 'Salé',       ar: 'سلا',           da: 'Salé' },
};

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

// ── Detect city mention ───────────────────────────────────────────────────
// Short keys that collide with everyday words (Darija "safi" = ok/done, FR "sale" = dirty).
// These require an explicit location/weather signal nearby.
const AMBIGUOUS_CITIES = new Set(['safi', 'sale']);
const LOCATION_CONTEXT_RE = /\b(a |de |dans |en |pres de |au |vers |meteo|temps|chaud|froid|pluie|soleil|temperature|priere|salat)\b/;

function detectCity(msg: string): string | null {
  const lower = msg.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const hasLocationContext = LOCATION_CONTEXT_RE.test(lower);
  const normalized: Record<string, string> = {};
  for (const k of Object.keys(MOROCCO_CITIES)) {
    const nk = k.normalize('NFD').replace(/[̀-ͯ]/g, '');
    normalized[nk] = k;
  }
  for (const [nk, orig] of Object.entries(normalized)) {
    if (new RegExp(`\\b${nk}\\b`).test(lower)) {
      if (AMBIGUOUS_CITIES.has(nk) && !hasLocationContext) continue;
      return orig;
    }
  }
  return null;
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

// ── Smart local responder ─────────────────────────────────────────────────
type Intent = 'weather' | 'time' | 'ferry' | 'docs' | 'currency' | 'prayer' | 'sim' | 'ramadan' | 'fuel' | 'generic';

function detectIntent(msg: string): Intent {
  const m = msg.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  // Weather — broad pattern: temps, meteo, chaud, froid, pluie, soleil, nuageux, brouillard, vent
  if (/\b(temps|meteo|weather|ta9s|chaud|froid|pluie|soleil|nuage|brouillard|vent|temperature|il fait|fait-il|t-il chaud|t-il froid|climat)\b/.test(m)) return 'weather';
  // Time
  if (/\b(heure|time|wa9t|وقت|maintenant|en ce moment|quelle heure|what time|hora|zeit|ora)\b/.test(m)) return 'time';
  // Prayer
  if (/\b(priere|salat|prayer|salawat|fajr|dhuhr|asr|maghrib|isha|صلاة|موعد الصلاة|adhan|azan|imsakiyya|horaire.*(priere|salat)|quando.*(priere|salat))\b/.test(m)) return 'prayer';
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

  if (intent === 'ramadan') {
    if (lang === 'da') return `Ramadan f l-Maghrib: iftaar ≈ 7:30-8pm f saif, 5:30-6pm f shta. Shor ≈ 4-5am. l-7awanit kay7ddu bkri. Kaytla9aw atmosphere special — bzzaf dyalna kayrj3u f had l-wa9t.`;
    if (lang === 'ar') return `في رمضان بالمغرب: الإفطار ≈ 7:30-8م صيفاً، 5:30-6م شتاءً. السحور ≈ 4-5ص. المحلات تغلق مبكراً. أجواء رائعة — كثير من المغتربين يعودون خلال هذه الفترة.`;
    return `**Ramadan au Maroc** : iftar ≈ 19h30-20h en été, 17h30-18h en hiver. Suhour ≈ 4-5h. Les commerces ferment plus tôt. Ambiance unique — beaucoup de MRE rentrent exprès pendant cette période.`;
  }

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
const SYSTEM_PROMPTS: Record<string, string> = {
  da: `Nta Hadak, assistant daki dyal MRE. Jaweb b darija maghribiya. Kun dafi2, sadiq, w mfid (2-4 jmal bzzaf).
Jaweb 3la ay so2al: l-wa9t dyal mdina, t-ta9s, jughrafiya dyal Maghrib, safari, watha2i9, ferry, budget, sarfa, douane, salawat, halal, SIM, carburant, 3a2ila, Ramdan, packing.
L-wa9t f l-Maghrib: UTC+1 (WET, bla changement). Ila ma 3raftihs dakshchi, gol l-wa9t ta9riban 3la UTC+1 w nsah ysowwel l-phone.`,
  fr: `Tu es Hadak, assistant intelligent pour les Marocains résidant à l'étranger.
Réponds en français. Sois chaleureux, pratique, concis (2-4 phrases max).
Tu peux répondre à toutes les questions : heure locale, météo, villes marocaines, géographie, culture, voyage, documents, ferry, budget, monnaie, douane, prières, halal, SIM, carburant, famille, Ramadan, bagages.
Pour l'heure locale : le Maroc est en UTC+1 (WET, pas de changement d'heure).`,
  en: `You are Hadak, an intelligent assistant for Moroccan diaspora.
Reply in English. Be warm, practical, concise (2-4 sentences max).
Answer all questions: local time, weather, Moroccan cities, geography, culture, travel, documents, ferry, budget, currency, customs, prayers, halal, SIM, fuel, family, Ramadan, packing.
Morocco is UTC+1 (WET, no DST).`,
  ar: `أنت حدّاك، مساعد ذكي للمغاربة في الخارج. أجب بالعربية. كن دافئًا وعمليًا وموجزًا (2-4 جمل).
أجب على جميع الأسئلة: الوقت المحلي، الطقس، المدن المغربية، الجغرافيا، السفر، الوثائق، العبارة، الميزانية، العملة، الجمارك، الصلاة، الحلال، SIM، الوقود، العائلة، رمضان، الأمتعة.
التوقيت في المغرب: UTC+1 (WET، بدون تغيير).`,
  es: `Eres Hadak, asistente inteligente para la diáspora marroquí. Responde en español. Sé cálido, práctico y conciso (2-4 frases).
Responde a cualquier pregunta: hora local, clima, ciudades marroquíes, geografía, viaje, documentos, ferry, presupuesto, moneda, aduana, oraciones, halal, SIM, combustible, familia, Ramadán, equipaje.
Marruecos está en UTC+1 (WET, sin cambio horario).`,
};

// ── Main handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { message, lang = 'fr' } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    const systemPrompt = SYSTEM_PROMPTS[lang] ?? SYSTEM_PROMPTS.fr;
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

    console.error('[hadak] no provider succeeded');
    return NextResponse.json({ response: '', fallback: true }, { status: 503 });
  } catch (err) {
    console.error('[hadak] error:', err);
    return NextResponse.json({ response: '', fallback: true }, { status: 503 });
  }
}
