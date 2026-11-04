// Coran Live : choisir une sourate, l'écouter, la lire avec sa traduction.
// Fonctions pures (sans réseau) : liste et recherche des sourates, adresses
// des sources, lecture de la réponse de l'API, reprise de lecture.
//
// Sources :
// - texte arabe : édition « quran-uthmani » de Tanzil (CC BY 3.0, texte non
//   modifié), servie par AlQuran Cloud ;
// - traduction française : Muhammad Hamidullah (édition « fr.hamidullah »
//   d'AlQuran Cloud, usage non commercial : aucune publicité sur la page) ;
// - récitation : Mishary Rashid Alafasy, CDN d'Islamic Network.

import data from '@/lib/data/surahs.json';

export interface Surah {
  n: number;
  ar: string;
  tr: string;
  ayahs: number;
  type: string;
}

export interface Verse {
  n: number;
  ar: string;
  fr: string;
}

export const SURAHS: readonly Surah[] = data.surahs;

export const CORAN_API = 'https://api.alquran.cloud';
export const CORAN_AUDIO = 'https://cdn.islamic.network';

// Les sourates que l'on vient le plus souvent chercher : un seul appui.
export const FAVORITE_SURAHS = [1, 36, 18, 55, 67, 112] as const;

// Orthographes françaises courantes que le nom translittéré ne couvre pas.
const ALIASES: Record<number, string[]> = {
  1: ['fatiha', 'fatihah', 'ouverture'],
  2: ['baqara', 'baqarah', 'la vache'],
  18: ['kahf', 'la caverne'],
  36: ['yasin', 'yassine', 'ya sin', 'yaseen'],
  55: ['rahman', 'rahmane', 'ar rahman'],
  56: ['waqia', 'waqiah', 'waqi a'],
  67: ['mulk', 'al moulk', 'royaute'],
  112: ['ikhlas', 'le monotheisme pur'],
  113: ['falaq', 'l aube'],
  114: ['nas', 'les hommes'],
};

function fold(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9؀-ۿ]+/g, ' ')
    .replace(/([a-z])\1+/g, '$1')
    .trim();
}

// Lettres arabes seules (sans voyelles ni signes), pour chercher « الكهف ».
function arabicLetters(text: string): string {
  return text.replace(/[ً-ٰٟۖ-ۭـ]/g, '').replace(/[^ء-يٱ]/g, '');
}

export function surahByNumber(n: number): Surah | undefined {
  return Number.isInteger(n) ? SURAHS[n - 1] : undefined;
}

/** Par numéro, nom translittéré (avec ou sans « Al- »), nom arabe ou orthographe courante. */
export function searchSurahs(query: string): Surah[] {
  const q = fold(query);
  if (!q) return [...SURAHS];
  if (/^\d+$/.test(q)) {
    const surah = surahByNumber(Number(q));
    return surah ? [surah] : [];
  }
  const qArabic = arabicLetters(query);
  return SURAHS.filter((s) => {
    const names = [s.tr, s.tr.replace(/^(al|an|ar|as|ash|at|ad|az|adh)-/i, ''), ...(ALIASES[s.n] ?? [])].map(fold);
    if (names.some((name) => name.includes(q))) return true;
    return qArabic.length >= 2 && arabicLetters(s.ar).includes(qArabic);
  });
}

export function surahTextUrl(n: number): string {
  return `${CORAN_API}/v1/surah/${n}/editions/quran-uthmani,fr.hamidullah`;
}

export function surahAudioUrl(n: number): string {
  return `${CORAN_AUDIO}/quran/audio-surah/128/ar.alafasy/${n}.mp3`;
}

interface ApiAyah {
  numberInSurah?: unknown;
  text?: unknown;
}

// « Au nom d'Allah… », tel que l'édition quran-uthmani l'écrit (verset 1 de la
// Fatiha). Pour les autres sourates (sauf la 9), elle le place en tête du
// verset 1 : on l'affiche au-dessus de la sourate, comme dans un mushaf.
export const BASMALA =
  'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

export interface SurahText {
  /** La basmala ouvre la sourate, au-dessus du verset 1. */
  basmala: boolean;
  verses: Verse[];
}

/** Arabe et français verset par verset, ou null si la réponse est inattendue. */
export function parseSurahResponse(json: unknown, n: number): SurahText | null {
  const body = json as { code?: unknown; data?: unknown };
  if (body?.code !== 200 || !Array.isArray(body.data) || body.data.length !== 2) return null;
  const [arabic, french] = body.data as { number?: unknown; ayahs?: unknown }[];
  if (arabic?.number !== n || french?.number !== n) return null;
  if (!Array.isArray(arabic.ayahs) || !Array.isArray(french.ayahs)) return null;
  const ar = arabic.ayahs as ApiAyah[];
  const fr = french.ayahs as ApiAyah[];
  const expected = surahByNumber(n)?.ayahs;
  if (ar.length !== expected || fr.length !== expected) return null;
  const verses: Verse[] = [];
  for (let i = 0; i < ar.length; i++) {
    const a = ar[i];
    const f = fr[i];
    if (typeof a.text !== 'string' || typeof f.text !== 'string' || a.numberInSurah !== i + 1) return null;
    // Le caractère invisible de début de fichier (BOM) n'est pas du texte.
    verses.push({ n: i + 1, ar: a.text.replace(/^﻿/, ''), fr: f.text });
  }
  const basmala = n !== 1 && n !== 9 && verses[0].ar.startsWith(`${BASMALA} `);
  if (basmala) verses[0] = { ...verses[0], ar: verses[0].ar.slice(BASMALA.length + 1) };
  return { basmala, verses };
}

// Reprise de lecture : la dernière sourate et l'endroit où l'écoute s'est arrêtée.
export const RESUME_KEY = 'rme-coran-reprise';

export interface Resume {
  surah: number;
  time: number;
}

export function parseResume(raw: string | null): Resume | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as { surah?: unknown; time?: unknown };
    if (typeof value.surah !== 'number' || !surahByNumber(value.surah)) return null;
    const time = typeof value.time === 'number' && Number.isFinite(value.time) && value.time > 0 ? value.time : 0;
    return { surah: value.surah, time };
  } catch {
    // Valeur abîmée dans le stockage du navigateur : on repart de zéro.
    return null;
  }
}

/** « 4:05 » ou « 1:02:30 ». */
export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
}
