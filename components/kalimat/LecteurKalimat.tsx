'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { EPISODES, dureeEpisode, repliques, sousTitresSrt } from '@/lib/kalimat/episodes';
import { HAUTEUR, LARGEUR, dessinerEpisode } from '@/lib/kalimat/dessin';

/** Pour fabriquer les vidéos YouTube : la page ouverte avec ?video expose l'image de chaque instant. */
interface ExportKalimat {
  nombre: number;
  duree: (episode: number) => number;
  image: (episode: number, t: number, qualite: number) => string;
  srt: (episode: number) => string;
}

function police(): string {
  return getComputedStyle(document.body).fontFamily || 'sans-serif';
}

export default function LecteurKalimat() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tempsRef = useRef(0);
  const [choix, setChoix] = useState(0);
  const [lecture, setLecture] = useState(false);
  const [temps, setTemps] = useState(0);
  const ep = EPISODES[choix];
  const total = dureeEpisode(ep);

  const dessiner = useCallback(
    (t: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;
      ctx.setTransform(canvas.width / LARGEUR, 0, 0, canvas.height / HAUTEUR, 0, 0);
      dessinerEpisode(ctx, ep, t, police());
    },
    [ep],
  );

  // En pause : l'image suit l'épisode choisi et la barre de progression.
  useEffect(() => {
    if (!lecture) dessiner(tempsRef.current);
  }, [dessiner, lecture, temps]);

  useEffect(() => {
    if (!lecture) return;
    let id = 0;
    let avant = performance.now();
    const boucle = (maintenant: number) => {
      const t = Math.min(total, tempsRef.current + (maintenant - avant) / 1000);
      avant = maintenant;
      tempsRef.current = t;
      dessiner(t);
      setTemps(Math.floor(t * 10) / 10);
      if (t >= total) {
        setLecture(false);
        return;
      }
      id = requestAnimationFrame(boucle);
    };
    id = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(id);
  }, [lecture, dessiner, total]);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('video')) return;
    const exporter: ExportKalimat = {
      nombre: EPISODES.length,
      duree: (i) => dureeEpisode(EPISODES[i]),
      image: (i, t, qualite) => {
        const canvas = document.createElement('canvas');
        canvas.width = LARGEUR;
        canvas.height = HAUTEUR;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas indisponible pour fabriquer la vidéo');
        dessinerEpisode(ctx, EPISODES[i], t, police());
        return canvas.toDataURL('image/jpeg', qualite);
      },
      srt: (i) => sousTitresSrt(EPISODES[i]),
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

  function basculer() {
    if (!lecture && tempsRef.current >= total) aller(0);
    setLecture((l) => !l);
  }

  const fini = !lecture && temps >= total - 0.05;

  return (
    <div>
      <ul className="grid gap-2 sm:grid-cols-3">
        {EPISODES.map((e, i) => (
          <li key={e.numero}>
            <button
              type="button"
              onClick={() => choisir(i)}
              aria-pressed={i === choix}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${i === choix ? 'border-[#0f1f3d] bg-[#0f1f3d] text-white' : 'border-slate-200 bg-white text-[#0f1f3d] hover:border-[#0f1f3d]'}`}
            >
              <span className="block text-sm font-semibold opacity-80">Épisode {e.numero}</span>
              <span className="block font-black">{e.titre}</span>
            </button>
          </li>
        ))}
      </ul>

      <canvas
        ref={canvasRef}
        width={720}
        height={1280}
        role="img"
        aria-label={`Dessin animé Kalimat, épisode ${ep.numero} : ${ep.titre}`}
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
            onChange={(e) => aller(Number(e.target.value))}
            className="w-full accent-[#0f1f3d]"
          />
        </label>
        <span className="w-12 text-right text-sm font-bold tabular-nums">{Math.round(total - temps)} s</span>
      </div>

      <p className="mx-auto mt-3 max-w-[360px] text-center text-sm text-slate-700">
        Pas encore de voix : lisez les bulles à voix haute avec les enfants, c’est encore plus drôle !
      </p>

      <details className="mt-6 rounded-2xl bg-white p-4">
        <summary className="cursor-pointer font-bold">Lire le texte de l’épisode</summary>
        <ol className="mt-3 space-y-1 text-slate-800">
          {repliques(ep)
            .filter((r) => r.qui !== 'Les mots du jour')
            .map((r) => (
              <li key={`${r.debut}-${r.qui}`}>
                <span className="font-bold">{r.qui} :</span> {r.texte}
              </li>
            ))}
        </ol>
        <p className="mt-3 font-bold">Les mots du jour</p>
        <ul className="mt-1 text-slate-800">
          {ep.mots.map((m) => (
            <li key={m.mot}>
              <span className="font-bold text-orange-800">{m.mot}</span> = {m.sens}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
