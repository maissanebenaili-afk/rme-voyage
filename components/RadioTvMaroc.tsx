'use client';

import { useEffect, useRef, useState } from 'react';
import { Clapperboard, ExternalLink, Loader2, Pause, Play, Radio, Smartphone, Tv } from 'lucide-react';
import { FREE_STREAMING, LAST_RADIO_KEY, RADIOS, SNRT_RADIOS, SOCIAL_SANS_COMPTE, TV_CHANNELS, radioById, type OfficialLink, type RadioStation } from '@/lib/radiosMaroc';

type PlayState = 'idle' | 'loading' | 'playing' | 'error';

function remember(id: string) {
  try {
    localStorage.setItem(LAST_RADIO_KEY, id);
  } catch {
    // Stockage indisponible (navigation privée) : la dernière radio ne sera pas proposée.
  }
}

function lastRadio(): RadioStation | undefined {
  try {
    return radioById(localStorage.getItem(LAST_RADIO_KEY));
  } catch {
    // Stockage indisponible : pas de dernière radio.
    return undefined;
  }
}

// Le nom de la radio sur l'écran verrouillé du téléphone, avec lecture et pause.
function showOnLockScreen(station: RadioStation, toggle: () => void) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;
  navigator.mediaSession.metadata = new MediaMetadata({ title: station.name, artist: station.genre, album: 'Radios du Maroc · RME Voyage' });
  navigator.mediaSession.setActionHandler('play', toggle);
  navigator.mediaSession.setActionHandler('pause', toggle);
}

function LinkList({ items }: { items: readonly OfficialLink[] }) {
  return (
    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-14 items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-emerald-500"
          >
            <span>
              <span className="block font-bold text-[#0f1f3d]">{item.name}</span>
              <span className="block text-sm text-slate-600">{item.detail}</span>
            </span>
            <ExternalLink size={18} className="shrink-0 text-slate-500" aria-hidden="true" />
            <span className="sr-only">(nouvel onglet)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export default function RadioTvMaroc() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<RadioStation | null>(null);
  const [state, setState] = useState<PlayState>('idle');
  const [previous, setPrevious] = useState<RadioStation | undefined>(undefined);

  useEffect(() => setPrevious(lastRadio()), []);

  function play(station: RadioStation) {
    const audio = audioRef.current;
    if (!audio) return;
    if (current?.id === station.id && state === 'playing') {
      audio.pause();
      return;
    }
    if (current?.id !== station.id) {
      audio.src = station.stream;
      setCurrent(station);
    }
    setState('loading');
    remember(station.id);
    setPrevious(station);
    showOnLockScreen(station, () => (audio.paused ? audio.play().catch(() => setState('error')) : audio.pause()));
    audio.play().catch(() => setState('error'));
  }

  return (
    <div className="space-y-10">
      <section aria-labelledby="radios-title">
        <h2 id="radios-title" className="flex items-center gap-2 text-2xl font-black text-[#0f1f3d]">
          <Radio size={24} aria-hidden="true" /> Radios en direct
        </h2>
        <p className="mt-1 text-slate-700">Un appui pour écouter, un autre pour arrêter. Pratique sur la route.</p>

        {previous && !current && (
          <button
            type="button"
            onClick={() => play(previous)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f1f3d] px-4 py-4 text-base font-bold text-white"
          >
            <Play size={20} aria-hidden="true" /> Reprendre {previous.name}
          </button>
        )}

        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {RADIOS.map((station) => {
            const active = current?.id === station.id;
            const label =
              active && state === 'playing' ? 'Arrêter' : active && state === 'loading' ? 'Connexion…' : 'Écouter';
            return (
              <li
                key={station.id}
                className={`flex items-center gap-3 rounded-2xl border bg-white p-3 ${active ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-200'}`}
              >
                <button
                  type="button"
                  onClick={() => play(station)}
                  aria-label={`${label} ${station.name}`}
                  aria-pressed={active && state === 'playing'}
                  className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition ${active && state === 'playing' ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'}`}
                >
                  {active && state === 'loading' ? (
                    <Loader2 size={24} className="animate-spin" aria-hidden="true" />
                  ) : active && state === 'playing' ? (
                    <Pause size={24} aria-hidden="true" />
                  ) : (
                    <Play size={24} className="ms-0.5" aria-hidden="true" />
                  )}
                </button>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-[#0f1f3d]">{station.name}</span>
                  <span className="block text-sm text-slate-600">{station.genre}</span>
                  {active && state === 'error' && (
                    <span role="alert" className="block text-sm font-semibold text-red-700">
                      Indisponible pour le moment : essayez une autre radio.
                    </span>
                  )}
                </span>
                <a
                  href={station.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Site de ${station.name} (nouvel onglet)`}
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                >
                  <ExternalLink size={18} aria-hidden="true" />
                </a>
              </li>
            );
          })}
        </ul>
        <p role="status" className="sr-only">
          {current && state === 'playing' ? `${current.name} en cours d'écoute` : ''}
        </p>
        <audio
          ref={audioRef}
          preload="none"
          onPlaying={() => setState('playing')}
          onPause={() => setState((s) => (s === 'error' ? s : 'idle'))}
          onError={() => setState('error')}
        />

        <h3 className="mt-8 text-lg font-black text-[#0f1f3d]">Radios nationales (SNRT)</h3>
        <LinkList items={SNRT_RADIOS} />
      </section>

      <section aria-labelledby="tv-title">
        <h2 id="tv-title" className="flex items-center gap-2 text-2xl font-black text-[#0f1f3d]">
          <Tv size={24} aria-hidden="true" /> Télé marocaine en direct
        </h2>
        <p className="mt-1 text-slate-700">Sur les sites officiels des chaînes, gratuitement.</p>
        <LinkList items={TV_CHANNELS} />
      </section>

      <section aria-labelledby="films-title">
        <h2 id="films-title" className="flex items-center gap-2 text-2xl font-black text-[#0f1f3d]">
          <Clapperboard size={24} aria-hidden="true" /> Films et séries gratuits
        </h2>
        <p className="mt-1 text-slate-700">
          Sur les plateformes officielles, gratuites avec publicité. Certaines ne marchent qu&apos;en France.
        </p>
        <LinkList items={FREE_STREAMING} />
      </section>

      <section aria-labelledby="social-title">
        <h2 id="social-title" className="flex items-center gap-2 text-2xl font-black text-[#0f1f3d]">
          <Smartphone size={24} aria-hidden="true" /> Vidéos et réseaux, sans compte
        </h2>
        <p className="mt-1 text-slate-700">À regarder directement, sans s&apos;inscrire. Pour les enfants : YouTube Kids.</p>
        <LinkList items={SOCIAL_SANS_COMPTE} />
      </section>
    </div>
  );
}
