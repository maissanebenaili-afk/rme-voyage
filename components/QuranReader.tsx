'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Download, Loader2, Search, WifiOff } from 'lucide-react';

type Ayah = { number: number; text: string; numberInSurah: number; juz: number; page: number };
type Surah = { number: number; name: string; englishName: string; englishNameTranslation: string; numberOfAyahs: number; ayahs: Ayah[] };
type QuranPayload = { surahs: Surah[] };

const DB_NAME = 'rme-quran';
const STORE = 'quran';
const KEY = 'uthmani-v1';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readOffline(): Promise<QuranPayload | null> {
  if (!('indexedDB' in window)) return null;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve((request.result as QuranPayload | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function writeOffline(payload: QuranPayload) {
  if (!('indexedDB' in window)) return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(payload, KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function fetchQuran(): Promise<QuranPayload> {
  const response = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani', {
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error('Quran source unavailable');
  const json = await response.json();
  if (json?.code !== 200 || !Array.isArray(json?.data?.surahs)) throw new Error('Invalid Quran payload');
  return json.data as QuranPayload;
}

export default function QuranReader() {
  const [quran, setQuran] = useState<QuranPayload | null>(null);
  const [selected, setSelected] = useState(1);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [offline, setOffline] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setOffline(!navigator.onLine);
    const online = () => setOffline(false);
    const offlineEvent = () => setOffline(true);
    window.addEventListener('online', online);
    window.addEventListener('offline', offlineEvent);

    (async () => {
      try {
        const cached = await readOffline();
        if (cached) {
          setQuran(cached);
          setOfflineReady(true);
          setLoading(false);
        }
        if (navigator.onLine) {
          const fresh = await fetchQuran();
          setQuran(fresh);
          await writeOffline(fresh);
          setOfflineReady(true);
          setError('');
        }
      } catch {
        setError('Le Coran n’a pas pu être chargé. Reviens en ligne puis réessaie.');
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offlineEvent);
    };
  }, []);

  const surahs = quran?.surahs ?? [];
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return surahs;
    return surahs.filter((s) =>
      (s.number + ' ' + s.name + ' ' + s.englishName + ' ' + s.englishNameTranslation).toLowerCase().includes(needle),
    );
  }, [query, surahs]);

  const current = surahs.find((s) => s.number === selected) ?? surahs[0];

  async function downloadOffline() {
    setDownloading(true);
    setError('');
    try {
      const fresh = await fetchQuran();
      await writeOffline(fresh);
      setQuran(fresh);
      setOfflineReady(true);
    } catch {
      setError('Téléchargement impossible pour le moment. Fais-le avant le départ quand tu as du réseau.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[330px_1fr]">
      <aside className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm lg:sticky lg:top-4 lg:h-fit">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-emerald-700">114 sourates</p>
            <h2 className="mt-1 text-xl font-black text-[#0f1f3d]">Choisir une sourate</h2>
          </div>
          {offlineReady && <span title="Disponible hors connexion" className="rounded-full bg-emerald-50 p-2 text-emerald-700"><Check size={16} /></span>}
        </div>

        <label className="relative mt-4 block">
          <Search size={16} className="absolute left-3 top-3.5 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher une sourate"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-3 text-sm outline-none focus:border-emerald-400"
          />
        </label>

        <div className="mt-3 max-h-[55vh] space-y-1 overflow-auto pr-1">
          {filtered.map((surah) => (
            <button
              key={surah.number}
              onClick={() => setSelected(surah.number)}
              className={'w-full rounded-2xl px-3 py-3 text-left transition ' + (selected === surah.number ? 'bg-[#0f1f3d] text-white' : 'hover:bg-emerald-50')}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-[11px] font-black text-emerald-800">{surah.number}</span>
                  <span className="font-bold">{surah.englishName}</span>
                </span>
                <span className="font-[family-name:var(--font-amiri)] text-lg">{surah.name}</span>
              </div>
              <p className={'mt-1 pl-9 text-xs ' + (selected === surah.number ? 'text-white/70' : 'text-slate-500')}>{surah.englishNameTranslation} · {surah.numberOfAyahs} versets</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-3xl border border-emerald-100 bg-[#fffdf8] shadow-sm">
        <div className="border-b border-emerald-100 px-5 py-5 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-emerald-700">Coran · Hafs / écriture uthmanique</p>
              <h1 className="mt-1 font-[family-name:var(--font-amiri)] text-3xl font-bold text-[#172033] sm:text-4xl">{current?.name ?? 'Coran'}</h1>
              {current && <p className="mt-1 text-sm text-slate-500">{current.englishName} · {current.numberOfAyahs} versets</p>}
            </div>
            <button
              onClick={downloadOffline}
              disabled={downloading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0f1f3d] px-5 py-3 text-sm font-extrabold text-white disabled:opacity-60"
            >
              {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {offlineReady ? 'Mettre à jour hors connexion' : 'Télécharger pour le voyage'}
            </button>
          </div>
          {offline && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">
              <WifiOff size={14} /> Mode hors connexion : lecture depuis le stockage de l’app.
            </div>
          )}
          {error && <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </div>

        <div className="px-5 py-8 sm:px-10">
          {loading && !current ? (
            <div className="flex items-center justify-center gap-2 py-20 text-slate-500"><Loader2 className="animate-spin" size={20} /> Chargement du Coran…</div>
          ) : current ? (
            <div dir="rtl" className="space-y-7">
              {current.ayahs.map((ayah) => (
                <article key={ayah.number} className="rounded-2xl border-b border-emerald-50 pb-6">
                  <div className="flex items-start gap-4">
                    <span className="mt-3 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-emerald-200 text-xs font-black text-emerald-800">{ayah.numberInSurah}</span>
                    <p className="font-[family-name:var(--font-amiri)] text-right text-2xl leading-[2.25] text-[#18212f] sm:text-3xl">{ayah.text}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center text-slate-500">Aucune donnée disponible.</div>
          )}
        </div>

        <div className="border-t border-emerald-100 bg-emerald-50/60 px-5 py-4 text-xs leading-5 text-slate-600 sm:px-8">
          Texte arabe : édition <strong>quran-uthmani</strong> distribuée par AlQuran Cloud, issue de la chaîne de provenance Tanzil. Le texte sacré est affiché sans modification. Pour la référence et les conditions de Tanzil, consultez tanzil.net.
        </div>
      </section>
    </div>
  );
}
