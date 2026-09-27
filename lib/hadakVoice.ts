// Hadak's spoken answers use the phone's own voices (free, offline). Voice
// objects carry no gender, so female voices are recognised by their names on
// Apple, Microsoft, Google and Android; "natural/neural/premium" ones sound
// the least robotic.
type VoiceLike = Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'localService'>;

const LOCALES: Record<string, string[]> = {
  fr: ['fr-FR', 'fr-BE', 'fr-CH', 'fr-CA'],
  en: ['en-GB', 'en-US', 'en-AU', 'en-IE'],
  es: ['es-ES', 'es-MX', 'es-US'],
  ar: ['ar-MA', 'ar-SA', 'ar-EG', 'ar-AE', 'ar-DZ'],
  // No phone ships a Darija voice; Moroccan Arabic is the closest.
  da: ['ar-MA', 'ar-DZ', 'ar-TN', 'ar-SA', 'ar-EG'],
};

const FEMALE = /\b(am[eé]lie|audrey|aur[eé]lie|marie|c[eé]line|julie|denise|eloise|vivienne|hortense|brigitte|coralie|charline|jos[eé]phine|samantha|ava|allison|susan|karen|moira|tessa|serena|zira|aria|jenny|emma|michelle|libby|sonia|hazel|catherine|natasha|kate|fiona|victoria|monica|m[oó]nica|paulina|marisol|helena|elvira|laura|luc[ií]a|elena|ximena|dalia|laila|layla|mouna|salma|zariyah|hoda|amina|fatima|mariam|sana|female|femme)\b/i;
const MALE = /\b(thomas|daniel|alex|fred|maged|tarik|jorge|diego|paul|henri|claude|guy|hamed|jamal|david|mark|pablo|nicolas|rayan|shakir|hamdan|omar|male|homme|gordon|arthur|oliver|george|ryan|guy)\b/i;
const NATURAL = /(natural|neural|online|premium|enhanced|wavenet|siri)/i;
const GOOGLE_FEMALE_DEFAULT = /^google (fran[cç]ais|us english|espa[nñ]ol|español de estados unidos)$/i;

export function speechLocale(lang: string): string {
  return (LOCALES[lang] ?? LOCALES.en)[0];
}

function score(voice: VoiceLike, locales: string[]): number {
  const voiceLang = voice.lang.replace('_', '-');
  const exact = locales.findIndex((l) => l.toLowerCase() === voiceLang.toLowerCase());
  const samePrefix = locales.some((l) => voiceLang.toLowerCase().startsWith(l.slice(0, 2).toLowerCase()));
  if (!samePrefix) return -Infinity;
  let s = exact >= 0 ? 40 - exact * 5 : 10;
  if (MALE.test(voice.name)) s -= 1000;
  if (FEMALE.test(voice.name) || GOOGLE_FEMALE_DEFAULT.test(voice.name)) s += 100;
  if (NATURAL.test(voice.name)) s += 50;
  return s;
}

/** Best female voice for this Hadak language, or null to let the phone decide. */
export function pickHadakVoice<V extends VoiceLike>(voices: readonly V[], lang: string): V | null {
  const locales = LOCALES[lang] ?? LOCALES.en;
  let best: V | null = null;
  let bestScore = -Infinity;
  for (const voice of voices) {
    const s = score(voice, locales);
    if (s > bestScore) { best = voice; bestScore = s; }
  }
  return bestScore > -Infinity && bestScore > -500 ? best : null;
}

/** Text as it should be heard: no Markdown marks, bullets, emojis or links. */
export function cleanForSpeech(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\*\*|__|`|#+\s?/g, '')
    .replace(/^\s*[•\-*]\s+/gm, '')
    .replace(/\s*→\s*/g, ', ')
    .replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '')
    .replace(/\s*\n+\s*/g, '. ')
    .replace(/\.\s*\./g, '.')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Voices load asynchronously on Chrome and Android; wait for them briefly. */
export function loadVoices(synth: SpeechSynthesis, timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  const now = synth.getVoices();
  if (now.length) return Promise.resolve(now);
  return new Promise((resolve) => {
    const done = () => {
      synth.removeEventListener('voiceschanged', done);
      clearTimeout(timer);
      resolve(synth.getVoices());
    };
    const timer = setTimeout(done, timeoutMs);
    synth.addEventListener('voiceschanged', done);
  });
}
