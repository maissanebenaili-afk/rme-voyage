'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Expand, Loader2, Pause, Play, RotateCcw, Search, SkipBack, SkipForward } from 'lucide-react';
import {
  BASMALA,
  FAVORITE_SURAHS,
  RESUME_KEY,
  formatTime,
  parseResume,
  parseSurahResponse,
  searchSurahs,
  surahAudioUrl,
  surahByNumber,
  surahTextUrl,
  type Resume,
  type SurahText,
} from '@/lib/coran';

type TextState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; text: SurahText };

function readResume(): Resume | null {
  try {
    return parseResume(localStorage.getItem(RESUME_KEY));
  } catch {
    // Stockage indisponible (navigation privée) : pas de reprise, la page marche quand même.
    return null;
  }
}

function saveResume(resume: Resume) {
  try {
    localStorage.setItem(RESUME_KEY, JSON.stringify(resume));
  } catch {
    // Stockage indisponible : la reprise ne sera pas proposée la prochaine fois.
  }
}

export default function CoranLive() {
  const [surah, setSurah] = useState(1);
  const [query, setQuery] = useState('');
  const [text, setText] = useState<TextState>({ status: 'loading' });
  const [showFrench, setShowFrench] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [resume, setResume] = useState<Resume | null>(null);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [retry, setRetry] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const readerRef = useRef<HTMLElement | null>(null);
  const cache = useRef(new Map<number, SurahText>());
  const lastSaved = useRef(0);
  // Position à rejoindre quand la récitation sera chargée (reprise de lecture).
  const seekTo = useRef(0);
  // La sourate suivante démarre seule si la précédente était en train de jouer.
  const keepPlaying = useRef(false);

  const current = surahByNumber(surah)!;
  const results = useMemo(() => searchSurahs(query), [query]);

  useEffect(() => {
    setResume(readResume());
    setCanFullscreen(typeof document !== 'undefined' && Boolean(document.documentElement.requestFullscreen));
  }, []);

  // Texte arabe et traduction de la sourate choisie.
  useEffect(() => {
    const cached = cache.current.get(surah);
    if (cached) {
      setText({ status: 'ready', text: cached });
      return;
    }
    const controller = new AbortController();
    setText({ status: 'loading' });
    fetch(surahTextUrl(surah), { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((json) => {
        const parsed = parseSurahResponse(json, surah);
        if (!parsed) {
          setText({ status: 'error' });
          return;
        }
        cache.current.set(surah, parsed);
        setText({ status: 'ready', text: parsed });
      })
      .catch((error: Error) => {
        if (error.name !== 'AbortError') setText({ status: 'error' });
      });
    return () => controller.abort();
  }, [surah, retry]);

  // Nouvelle sourate : nouvelle récitation, au début (ou à l'endroit de la reprise).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setTime(0);
    setDuration(0);
    setAudioError(false);
    audio.src = surahAudioUrl(surah);
    audio.load();
    if (keepPlaying.current) {
      keepPlaying.current = false;
      audio.play().catch(() => setPlaying(false));
    }
  }, [surah]);

  const choose = useCallback(
    (n: number, options: { play?: boolean; at?: number } = {}) => {
      keepPlaying.current = Boolean(options.play);
      seekTo.current = options.at ?? 0;
      if (n === surah) {
        const audio = audioRef.current;
        if (audio && options.at) audio.currentTime = options.at;
        if (audio && options.play) audio.play().catch(() => setPlaying(false));
        return;
      }
      setSurah(n);
      readerRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
    },
    [surah],
  );

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      setAudioError(false);
      audio.play().catch(() => {
        setPlaying(false);
        setAudioError(true);
      });
    } else {
      audio.pause();
    }
  }

  function remember(at: number) {
    const value = { surah, time: at };
    saveResume(value);
    setResume(value);
  }

  function onTimeUpdate() {
    const audio = audioRef.current;
    if (!audio) return;
    setTime(audio.currentTime);
    // Toutes les 5 secondes d'écoute, on retient l'endroit pour la reprise.
    if (Math.abs(audio.currentTime - lastSaved.current) >= 5) {
      lastSaved.current = audio.currentTime;
      remember(audio.currentTime);
    }
  }

  function onLoadedMetadata() {
    const audio = audioRef.current;
    if (!audio) return;
    setDuration(audio.duration);
    if (seekTo.current > 0 && seekTo.current < audio.duration) audio.currentTime = seekTo.current;
    seekTo.current = 0;
  }

  function fullscreen() {
    readerRef.current?.requestFullscreen?.().catch(() => setCanFullscreen(false));
  }

  // « Reprendre » tant que l'on n'écoute pas déjà la sourate retenue.
  const resumeSurah = resume ? surahByNumber(resume.surah) : undefined;
  const showResume = resume !== null && !(resume.surah === surah && (playing || time > 0));

  return (
    <div className="space-y-6">
      {/* Lecteur : toujours en haut, gros boutons. */}
      <section aria-label="Récitation" className="sticky top-0 z-20 rounded-3xl bg-[#0f1f3d] p-4 text-white shadow-lg sm:p-5">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">Sourate {current.n}</p>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <h2 className="text-2xl font-black">{current.tr}</h2>
          <p lang="ar" dir="rtl" className="font-arabic text-2xl">
            {current.ar}
          </p>
        </div>
        <p className="text-sm text-white/70">
          {current.ayahs} versets · {current.type}
        </p>

        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => choose(current.n - 1, { play: playing })}
            disabled={current.n === 1}
            aria-label="Sourate précédente"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-40"
          >
            <SkipBack size={24} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Écouter la récitation'}
            className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-400 text-[#0f1f3d] shadow-lg transition hover:bg-emerald-300 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {playing ? <Pause size={36} aria-hidden="true" /> : <Play size={36} className="ms-1" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => choose(current.n + 1, { play: playing })}
            disabled={current.n === 114}
            aria-label="Sourate suivante"
            className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20 disabled:opacity-40"
          >
            <SkipForward size={24} aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 text-sm tabular-nums">
          <span>{formatTime(time)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={1}
            value={Math.min(time, duration || 0)}
            onChange={(event) => {
              const audio = audioRef.current;
              if (audio) audio.currentTime = Number(event.target.value);
            }}
            disabled={!duration}
            aria-label="Avancer dans la récitation"
            className="h-2 flex-1 accent-emerald-400"
          />
          <span>{formatTime(duration)}</span>
        </div>
        <p role="status" className="mt-2 min-h-5 text-center text-sm text-amber-200">
          {audioError ? 'Récitation indisponible pour le moment : vérifiez la connexion.' : ''}
        </p>
        <p className="text-center text-xs text-white/60">Récitation : Mishary Rashid Alafasy</p>

        <audio
          ref={audioRef}
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => {
            setPlaying(false);
            const audio = audioRef.current;
            if (audio && audio.currentTime > 0) remember(audio.currentTime);
          }}
          onEnded={() => {
            setPlaying(false);
            remember(0);
          }}
          onTimeUpdate={onTimeUpdate}
          onLoadedMetadata={onLoadedMetadata}
          onError={() => {
            setPlaying(false);
            setAudioError(true);
          }}
        />
      </section>

      {showResume && resume && resumeSurah && (
        <button
          type="button"
          onClick={() => choose(resumeSurah.n, { play: true, at: resume.time })}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-emerald-600 bg-white px-4 py-4 text-base font-bold text-emerald-800"
        >
          <RotateCcw size={20} aria-hidden="true" />
          Reprendre : {resumeSurah.tr}
          {resume.time > 0 ? ` à ${formatTime(resume.time)}` : ''}
        </button>
      )}

      {/* Choisir une sourate : les plus écoutées en un appui, ou la recherche. */}
      <section aria-labelledby="choisir-title" className="rounded-3xl bg-white p-4 shadow-sm sm:p-5">
        <h2 id="choisir-title" className="text-lg font-black text-[#0f1f3d]">
          Choisir une sourate
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {FAVORITE_SURAHS.map((n) => {
            const s = surahByNumber(n)!;
            return (
              <button
                key={n}
                type="button"
                onClick={() => choose(n, { play: true })}
                aria-pressed={surah === n}
                className={`min-h-12 rounded-full px-4 text-sm font-bold transition ${surah === n ? 'bg-[#0f1f3d] text-white' : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'}`}
              >
                {s.tr}
              </button>
            );
          })}
        </div>

        <label className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-300 px-3 focus-within:border-emerald-600">
          <Search size={18} className="text-slate-500" aria-hidden="true" />
          <span className="sr-only">Rechercher une sourate</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nom ou numéro : Yassine, Kahf, 36…"
            className="min-h-12 w-full bg-transparent text-base outline-none"
          />
        </label>

        <ul className="mt-3 max-h-72 divide-y divide-slate-100 overflow-y-auto" aria-label="Sourates">
          {results.map((s) => (
            <li key={s.n}>
              <button
                type="button"
                onClick={() => choose(s.n)}
                aria-current={surah === s.n ? 'true' : undefined}
                className={`flex min-h-12 w-full items-center gap-3 px-2 py-2 text-left transition hover:bg-slate-50 ${surah === s.n ? 'bg-emerald-50' : ''}`}
              >
                <span className="w-8 shrink-0 text-center text-sm font-bold text-slate-500">{s.n}</span>
                <span className="flex-1">
                  <span className="block font-bold text-[#0f1f3d]">{s.tr}</span>
                  <span className="block text-xs text-slate-500">{s.ayahs} versets</span>
                </span>
                <span lang="ar" dir="rtl" className="font-arabic text-lg text-[#0f1f3d]">
                  {s.ar}
                </span>
              </button>
            </li>
          ))}
          {results.length === 0 && <li className="px-2 py-3 text-sm text-slate-600">Aucune sourate trouvée.</li>}
        </ul>
      </section>

      {/* Texte : arabe et traduction, verset par verset. */}
      <section ref={readerRef} aria-labelledby="texte-title" className="scroll-mt-48 overflow-y-auto rounded-3xl bg-[#fffdf7] p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="texte-title" className="text-lg font-black text-[#0f1f3d]">
            Texte et traduction
          </h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFrench((v) => !v)}
              aria-pressed={showFrench}
              className="min-h-11 rounded-full border border-slate-300 px-4 text-sm font-bold text-slate-700"
            >
              {showFrench ? 'Masquer le français' : 'Afficher le français'}
            </button>
            {canFullscreen && (
              <button
                type="button"
                onClick={fullscreen}
                aria-label="Plein écran"
                className="inline-flex min-h-11 items-center gap-1 rounded-full border border-slate-300 px-4 text-sm font-bold text-slate-700"
              >
                <Expand size={16} aria-hidden="true" /> Plein écran
              </button>
            )}
          </div>
        </div>

        {text.status === 'loading' && (
          <p role="status" className="mt-6 flex items-center gap-2 text-slate-600">
            <Loader2 size={18} className="animate-spin" aria-hidden="true" /> Chargement de la sourate…
          </p>
        )}
        {text.status === 'error' && (
          <div role="alert" className="mt-6 rounded-2xl bg-amber-50 p-4 text-amber-900">
            <p>Le texte n&apos;a pas pu être chargé. Vérifiez la connexion.</p>
            <button type="button" onClick={() => setRetry((r) => r + 1)} className="mt-2 font-bold underline">
              Réessayer
            </button>
          </div>
        )}
        {text.status === 'ready' && (
          <div className="mt-4">
            {text.text.basmala && (
              <p lang="ar" dir="rtl" className="font-arabic mb-4 text-center text-2xl leading-loose text-[#0f1f3d]">
                {BASMALA}
              </p>
            )}
            <ol className="space-y-5">
              {text.text.verses.map((verse) => (
                <li key={verse.n} className="border-b border-slate-100 pb-4">
                  <p lang="ar" dir="rtl" className="font-arabic text-right text-2xl leading-[2.2] text-[#0f1f3d] sm:text-3xl">
                    {verse.ar} <span className="text-base text-emerald-700">﴿{verse.n}﴾</span>
                  </p>
                  {showFrench && (
                    <p lang="fr" className="mt-2 text-base leading-relaxed text-slate-700">
                      <span className="font-bold text-emerald-800">{verse.n}.</span> {verse.fr}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </div>
  );
}
