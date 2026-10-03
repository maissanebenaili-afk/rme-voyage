export type HadakLang = 'da' | 'fr' | 'en' | 'ar' | 'es';

const MARKERS: Record<Exclude<HadakLang, 'ar'>, string[]> = {
  fr: ['bonjour', 'merci', 'avec', 'pour', 'quelle', 'quel', 'comment', 'est-ce', 'je', 'veux', 'peux', 'où', 'quand', 'combien', 'voyage', 'trajet', 'ferry', 'billet', 'prix', 'documents'],
  en: ['hello', 'thanks', 'please', 'with', 'what', 'where', 'when', 'how', 'can', 'want', 'need', 'travel', 'trip', 'flight', 'ferry', 'price', 'ticket', 'documents'],
  es: ['hola', 'gracias', 'por', 'para', 'qué', 'como', 'dónde', 'cuándo', 'cuánto', 'quiero', 'puedo', 'viaje', 'vuelo', 'ferry', 'precio', 'billete', 'documentos'],
  da: ['salam', 'labas', 'bghit', 'bghiti', 'fin', 'fayn', 'kifach', 'kidayr', 'chhal', 'shhal', 'wach', '3lach', '3tini', 'bghina', 'nmchi', 'nsafr', 'safar', 'ferry', 'dirham', 'daba', 'lyoum', 'ghdda'],
};

const normalize = (text: string) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const tokenCount = (text: string, words: string[]) => {
  const tokens = new Set(normalize(text).split(/[^a-z0-9à-ÿ']+/).filter(Boolean));
  return words.reduce((score, word) => score + (tokens.has(normalize(word)) ? 1 : 0), 0);
};

/**
 * Keep the selected UI language as the default, but switch when the user's
 * message clearly belongs to another language. This is deliberately
 * conservative: mixed French/Darija remains Darija unless French is clearly dominant.
 */
export function detectHadakLanguage(message: string, preferred: HadakLang): HadakLang {
  const trimmed = message.trim();
  if (!trimmed) return preferred;
  if (/[\u0600-\u06ff]/.test(trimmed)) return preferred === 'da' ? 'da' : 'ar';

  const scores = {
    fr: tokenCount(trimmed, MARKERS.fr),
    en: tokenCount(trimmed, MARKERS.en),
    es: tokenCount(trimmed, MARKERS.es),
    da: tokenCount(trimmed, MARKERS.da),
  };
  const ranked = (Object.entries(scores) as Array<[Exclude<HadakLang, 'ar'>, number]>).sort((a, b) => b[1] - a[1]);
  const [candidate, score] = ranked[0];
  const second = ranked[1]?.[1] ?? 0;
  if (score < 2 || score <= second) return preferred;
  return candidate;
};
