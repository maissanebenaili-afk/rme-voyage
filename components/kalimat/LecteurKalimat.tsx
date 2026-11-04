'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import { EPISODES, LANGUES, dureeEpisode, repliques, sousTitresSrt, type Langue } from '@/lib/kalimat/episodes';
import { HAUTEUR, LARGEUR, dessinerEpisode } from '@/lib/kalimat/dessin';
import { FREQUENCE, enWav, genererSon } from '@/lib/kalimat/son';

/** Pour fabriquer les vidéos YouTube : la page ouverte avec ?video expose l'image et le son de chaque épisode. */
interface ExportKalimat {
  nombre: number;
  duree: (episode: number, langue: Langue) => number;
  image: (episode: number, t: number, qualite: number, langue: Langue) => string;
  srt: (episode: number, langue: Langue) => string;
  wav: (episode: number, langue: Langue) => string;
}

const NOM_LANGUE: Record<Langue, string> = { fr: 'Français', es: 'Español' };

function police(): string {
  return getComputedStyle(document.body).fontFamily || 'sans-serif';
}

function enBase64(octets: Uint8Array): string {
  let texte = '';
  for (let i = 0; i < octets.length; i += 0x8000) texte += String.fromCharCode(...octets.subarray(i, i + 0x8000));
  return btoa(texte);
}

export default function LecteurKalimat() {
  const { lang } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempsRef = useRef(0);
  const audioRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const pistesRef = useRef(new Map<string, AudioBuffer>());
  const [choix, setChoix] = useState(0);
  const [langue, setLangue] = useState<Langue>(lang === 'es' ? 'es' : 'fr');
  const [lecture, setLecture] = useState(false);
  const [son, setSon] = useState(true);
  const [temps, setTemps] = useState(0);
  const ep = EPISODES[choix];
  const total = dureeEpisode(ep, langue);

  const dessiner = useCallback(
    (t: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      ctx.setTransform(canvas.width / LARGEUR, 0, 0, canvas.height / HAUTEUR, 0, 0);
      dessinerEpisode(ctx, ep, t, police(), langue);
    },
    [ep, langue],
  );

  const arreterSon = useCallback(() => {
    const source = sourceRef.current;
    if (!source) return;
    source.stop();
    source.disconnect();
    sourceRef.current = null;
  }, []);

  /** Lance la musique à l'instant `t` ; renvoie l'heure de l'horloge audio au départ, ou null sans son. */
  const lancerSon = useCallback(
    (t: number): { horloge: AudioContext; depart: number } | null => {
      if (!son || typeof AudioContext === 'undefined') return null;
      if (!audioRef.current) audioRef.current = new AudioContext();
      const horloge = audioRef.current;
      const cle = `${choix}-${langue}`;
      let piste = pistesRef.current.get(cle);
      if (!piste) {
        const donnees = genererSon(ep, langue);
        piste = horloge.createBuffer(1, donnees.length, FREQUENCE);
        piste.getChannelData(0).set(donnees);
        pistesRef.current.set(cle, piste);
      }
      const source = horloge.createBufferSource();
      source.buffer = piste;
      source.connect(horloge.destination);
      source.start(0, Math.min(t, piste.duration));
      sourceRef.current = source;
      return { horloge, depart: horloge.currentTime };
    },
    [choix, ep, langue, son],
  );

  // En pause : l'image suit l'épisode, la langue et la barre de progression.
  useEffect(() => {
    if (!lecture) dessiner(tempsRef.current);
  }, [dessiner, lecture, temps]);

  useEffect(() => {
    if (!lecture) return;
    let id = 0;
    const t0 = tempsRef.current;
    const audio = lancerSon(t0);
    const debut = performance.now();
    const boucle = (maintenant: number) => {
      // Avec le son, on suit l'horloge audio : l'image et la musique restent calées.
      // Si le navigateur n'a pas encore ouvert le son, on suit l'horloge de la page.
      const ecoule = audio && audio.horloge.state === 'running' ? audio.horloge.currentTime - audio.depart : (maintenant - debut) / 1000;
      const t = Math.min(total, t0 + Math.max(0, ecoule));
      tempsRef.current = t;
      dessiner(t);
      setTemps(Math.floor(t * 10) / 10);
      if (t >= total) {
        setTemps(total);
        setLecture(false);
        return;
      }
      id = requestAnimationFrame(boucle);
    };
    id = requestAnimationFrame(boucle);
    return () => {
      cancelAnimationFrame(id);
      arreterSon();
    };
  }, [lecture, dessiner, total, lancerSon, arreterSon]);

  useEffect(() => {
    const audio = audioRef;
    return () => void audio.current?.close();
  }, []);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('video')) return;
    const exporter: ExportKalimat = {
      nombre: EPISODES.length,
      duree: (i, l) => dureeEpisode(EPISODES[i], l),
      image: (i, t, qualite, l) => {
        const canvas = document.createElement('canvas');
        canvas.width = LARGEUR;
        canvas.height = HAUTEUR;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas indisponible pour fabriquer la vidéo');
        dessinerEpisode(ctx, EPISODES[i], t, police(), l);
        return canvas.toDataURL('image/jpeg', qualite);
      },
      srt: (i, l) => sousTitresSrt(EPISODES[i], l),
      wav: (i, l) => enBase64(enWav(genererSon(EPISODES[i], l))),
    };
    (window as unknown as { __kalimat?: ExportKalimat }).__kalimat = exporter;
  }, []);

  function aller(t: number) {
    tempsRef.current = t;
    setTemps(t);
  }

  function choisir(i: number) {
    setLecture(false);
    setChoix(i);
    aller(0);
  }

  /** Le son doit s'ouvrir pendant l'appui (obligatoire sur iPhone). */
  function reveillerSon() {
    if (!son || typeof AudioContext === 'undefined') return;
    if (!audioRef.current) audioRef.current = new AudioContext();
    void audioRef.current.resume();
  }

  function basculer() {
    if (!lecture) reveillerSon();
    if (!lecture && tempsRef.current >= total - 0.05) aller(0);
    setLecture((l) => !l);
  }

  function changerLangue(l: Langue) {
    setLecture(false);
    setLangue(l);
    aller(0);
  }

  const fini = !lecture && temps >= total - 0.05;
  const prochain = choix + 1 < EPISODES.length ? choix + 1 : null;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div role="group" aria-label="Langue de l’épisode" className="flex rounded-full bg-white p-1 ring-1 ring-slate-200">
          {LANGUES.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => changerLangue(l)}
              aria-pressed={l === langue}
              className={`min-h-11 rounded-full px-4 text-sm font-bold ${l === langue ? 'bg-[#0f1f3d] text-white' : 'text-[#0f1f3d]'}`}
            >
              {NOM_LANGUE[l]}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setLecture(false);
            setSon((s) => !s);
          }}
          aria-pressed={son}
          aria-label={son ? 'Couper le son' : 'Mettre le son'}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0f1f3d] ring-1 ring-slate-200"
        >
          {son ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}
        </button>
      </div>

      <ul className="mt-3 grid gap-2 sm:grid-cols-3">
        {EPISODES.map((e, i) => (
          <li key={e.numero}>
            <button
              type="button"
              onClick={() => choisir(i)}
              aria-pressed={i === choix}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${i === choix ? 'border-[#0f1f3d] bg-[#0f1f3d] text-white' : 'border-slate-200 bg-white text-[#0f1f3d] hover:border-[#0f1f3d]'}`}
            >
              <span className="block text-sm font-semibold opacity-80">Épisode {e.numero}</span>
              <span className="block font-black">{e.titre[langue]}</span>
            </button>
          </li>
        ))}
      </ul>

      <canvas
        ref={canvasRef}
        width={720}
        height={1280}
        role="img"
        aria-label={`Dessin animé Kalimat, épisode ${ep.numero} : ${ep.titre[langue]}`}
        onClick={basculer}
        className="mx-auto mt-5 block aspect-[9/16] w-full max-w-[360px] cursor-pointer rounded-3xl bg-[#0f1f3d] shadow-lg"
      />

      <div className="mx-auto mt-4 flex max-w-[360px] items-center gap-3">
        <button
          type="button"
          onClick={basculer}
          aria-label={lecture ? 'Pause' : fini ? 'Revoir l’épisode' : 'Lecture'}
          className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#0f1f3d] text-white"
        >
          {lecture ? <Pause size={26} aria-hidden="true" /> : fini ? <RotateCcw size={24} aria-hidden="true" /> : <Play size={26} className="ms-0.5" aria-hidden="true" />}
        </button>
        <label className="flex-1">
          <span className="sr-only">Avancer dans l’épisode</span>
          <input
            type="range"
            min={0}
            max={total}
            step={0.1}
            value={temps}
            onChange={(e) => {
              setLecture(false);
              aller(Number(e.target.value));
            }}
            className="w-full accent-[#0f1f3d]"
          />
        </label>
        <span className="w-12 text-right text-sm font-bold tabular-nums">{Math.max(0, Math.round(total - temps))} s</span>
      </div>

      {fini && prochain !== null && (
        <button
          type="button"
          onClick={() => {
            reveillerSon();
            choisir(prochain);
            setLecture(true);
          }}
          className="mx-auto mt-4 flex min-h-14 w-full max-w-[360px] items-center justify-center gap-2 rounded-2xl bg-amber-400 px-4 font-black text-[#0f1f3d]"
        >
          <SkipForward size={20} aria-hidden="true" /> Épisode suivant : {EPISODES[prochain].titre[langue]}
        </button>
      )}

      <p className="mx-auto mt-3 max-w-[360px] text-center text-sm text-slate-700">
        Musique et bruitages, pas encore de voix : lisez les bulles à voix haute avec les enfants, c’est encore plus drôle !
      </p>

      <details className="mt-6 rounded-2xl bg-white p-4">
        <summary className="cursor-pointer font-bold">Lire le texte de l’épisode</summary>
        <ol className="mt-3 space-y-1 text-slate-800">
          {repliques(ep, langue)
            .filter((r) => r.qui !== 'Narration' || r.debut > 0)
            .map((r) => (
              <li key={`${r.debut}-${r.qui}`}>
                <span className="font-bold">{r.qui} :</span> {r.texte}
              </li>
            ))}
        </ol>
      </details>
    </div>
  );
}
