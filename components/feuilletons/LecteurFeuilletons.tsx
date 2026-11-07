'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { episodesDe, seriesDisponibles, type EpisodeAudio } from '@/lib/feuilletons/catalogue';
import { ErreurTelechargement, estTelecharge, formaterDuree, formaterTaille, lireLocal, repliqueActive, supprimer, telecharger } from '@/lib/feuilletons/horsLigne';

interface Replique { debut: number; fin: number; qui: string; texte: string }
type Langue = 'fr' | 'en' | 'es' | 'nl';
const LANGUES: { id: Langue; nom: string }[] = [{ id: 'fr', nom: 'Français' }, { id: 'en', nom: 'English' }, { id: 'es', nom: 'Español' }, { id: 'nl', nom: 'Nederlands' }];
const VITESSES = [0.85, 1, 1.25];
const cle = (e: EpisodeAudio) => `${e.serie}-${e.numero}`;
const etiquetteDe = (e: EpisodeAudio) => seriesDisponibles().find((s) => s.id === e.serie)?.etiquette ?? 'Épisode';

/** Lecture de localStorage sans jamais planter (navigation privée, stockage bloqué). */
const memoire = {
  lire(k: string): string | null { try { return localStorage.getItem(k); } catch { return null; } },
  ecrire(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* stockage indisponible : la reprise est facultative */ } },
};

/** La bonne fée : petit guide qui dit quoi faire selon la situation. */
function BonneFee({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-violet-50 p-3 text-violet-950" role="status">
      <svg viewBox="0 0 64 64" className="h-14 w-14 shrink-0" aria-hidden="true">
        <ellipse cx="18" cy="30" rx="14" ry="9" fill="#c4b5fd" opacity=".8" transform="rotate(-25 18 30)" />
        <ellipse cx="46" cy="30" rx="14" ry="9" fill="#c4b5fd" opacity=".8" transform="rotate(25 46 30)" />
        <circle cx="32" cy="22" r="9" fill="#fde2c8" />
        <path d="M22 20c2-9 18-9 20 0-6-4-14-4-20 0z" fill="#7c3aed" />
        <path d="M24 31l-5 24h26l-5-24z" fill="#a78bfa" />
        <circle cx="29" cy="22" r="1.2" fill="#3b2a52" /><circle cx="35" cy="22" r="1.2" fill="#3b2a52" />
        <path d="M29.5 26c1.5 1.4 3.5 1.4 5 0" stroke="#3b2a52" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M46 36l10-14" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
        <path d="M56 14l1.8 4 4 1.8-4 1.8-1.8 4-1.8-4-4-1.8 4-1.8z" fill="#fbbf24" />
      </svg>
      <p className="text-sm font-semibold"><span className="font-black">Lalla Nejma, la bonne fée :</span> {message}</p>
    </div>
  );
}

export default function LecteurFeuilletons() {
  const audio = useRef<HTMLAudioElement>(null);
  const urlLocale = useRef<string | null>(null);
  const [telecharges, setTelecharges] = useState<Record<string, boolean>>({});
  const [progression, setProgression] = useState<Record<string, number>>({});
  const [erreur, setErreur] = useState<string | null>(null);
  const [enLigne, setEnLigne] = useState(true);
  const [actif, setActif] = useState<EpisodeAudio | null>(null);
  const [repliques, setRepliques] = useState<Replique[]>([]);
  const [traductions, setTraductions] = useState<Partial<Record<Langue, string[]>> | null>(null);
  const [langue, setLangue] = useState<Langue>('fr');
  const [temps, setTemps] = useState(0);
  const [vitesse, setVitesse] = useState(1);
  const [message, setMessage] = useState('Touche « Télécharger » avant le départ : l’épisode marchera dans la voiture, sans réseau.');
  const controleurs = useRef<Record<string, AbortController>>({});

  const tous = seriesDisponibles().flatMap((s) => episodesDe(s.id));

  useEffect(() => {
    setEnLigne(navigator.onLine);
    const haut = () => setEnLigne(true), bas = () => setEnLigne(false);
    window.addEventListener('online', haut); window.addEventListener('offline', bas);
    return () => { window.removeEventListener('online', haut); window.removeEventListener('offline', bas); };
  }, []);

  useEffect(() => {
    (async () => {
      const etat: Record<string, boolean> = {};
      try { for (const e of tous) etat[cle(e)] = await estTelecharge(e.fichier); } catch { /* pas de Cache Storage : tout reste « en ligne seulement » */ }
      setTelecharges(etat);
    })();
    return () => { if (urlLocale.current) URL.revokeObjectURL(urlLocale.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const telechargerEp = useCallback(async (e: EpisodeAudio) => {
    setErreur(null);
    // Demande au navigateur de ne pas effacer les épisodes quand le téléphone manque de place (sans effet s'il refuse).
    await navigator.storage?.persist?.().catch(() => false);
    const c = new AbortController();
    controleurs.current[cle(e)] = c;
    setProgression((p) => ({ ...p, [cle(e)]: 0 }));
    try {
      await telecharger(e.fichier, e.texte, e.octets, { signal: c.signal, onProgress: (p) => setProgression((x) => ({ ...x, [cle(e)]: p.total ? p.recu / p.total : 0 })) });
      setTelecharges((t) => ({ ...t, [cle(e)]: true }));
      setMessage(`C’est gardé : « ${e.titre} » s’écoutera sans réseau. Tu peux le supprimer quand tu veux.`);
    } catch (err) {
      if (c.signal.aborted) setMessage('Téléchargement arrêté. Rien n’a été gardé.');
      else setErreur(err instanceof ErreurTelechargement ? err.message : 'Le téléchargement a échoué. Vérifie le réseau et réessaie.');
    } finally {
      setProgression((p) => { const { [cle(e)]: _fini, ...reste } = p; return reste; });
      delete controleurs.current[cle(e)];
    }
  }, []);

  const supprimerEp = useCallback(async (e: EpisodeAudio) => {
    try { await supprimer(e.fichier, e.texte); setTelecharges((t) => ({ ...t, [cle(e)]: false })); setMessage('Supprimé de ton téléphone. Il reste disponible avec du réseau.'); }
    catch { setErreur('Impossible de supprimer. Réessaie.'); }
  }, []);

  const ecouter = useCallback(async (e: EpisodeAudio) => {
    setErreur(null);
    const local = telecharges[cle(e)] ? await lireLocal(e.fichier) : null;
    if (!local && !navigator.onLine) { setErreur('Pas de réseau et cet épisode n’est pas téléchargé. Télécharge-le quand tu as du réseau.'); return; }
    if (urlLocale.current) { URL.revokeObjectURL(urlLocale.current); urlLocale.current = null; }
    let source = e.fichier;
    if (local) { urlLocale.current = URL.createObjectURL(local); source = urlLocale.current; }
    setActif(e); setRepliques([]); setTraductions(null); setLangue('fr'); setTemps(0);
    try {
      const texteLocal = local ? await lireLocal(e.texte) : null;
      const reponse = texteLocal ? new Response(texteLocal) : await fetch(e.texte);
      const donnees = await reponse.json();
      setRepliques(donnees.repliques ?? []);
      setTraductions(donnees.traductions ?? null);
    } catch { /* sans texte on écoute quand même */ }
    const a = audio.current; if (!a) return;
    a.src = source; a.playbackRate = vitesse;
    const reprise = Number(memoire.lire(`feuilleton-${cle(e)}`)) || 0;
    a.onloadedmetadata = () => { if (reprise > 3 && reprise < a.duration - 5) a.currentTime = reprise; };
    try { await a.play(); } catch { setErreur('Appuie sur lecture pour démarrer.'); }
    setMessage(local ? 'Tu écoutes la copie gardée sur ton téléphone : ça marche sans réseau.' : 'Tu écoutes avec le réseau. Pense à télécharger pour la route !');
  }, [telecharges, vitesse]);

  const aller = (secondes: number) => { const a = audio.current; if (a) a.currentTime = Math.max(0, Math.min(a.duration || secondes, secondes)); };
  const changerVitesse = () => { const v = VITESSES[(VITESSES.indexOf(vitesse) + 1) % VITESSES.length]; setVitesse(v); if (audio.current) audio.current.playbackRate = v; };
  const suivant = () => { if (!actif) return; const i = tous.findIndex((e) => cle(e) === cle(actif)); if (i >= 0 && tous[i + 1]) void ecouter(tous[i + 1]); };
  const courante = repliqueActive(repliques, temps);

  return (
    <div className="space-y-5">
      <BonneFee message={enLigne ? message : 'Tu es hors ligne : seuls les épisodes marqués « sur ton téléphone » se lisent. Bon voyage !'} />
      {!enLigne && <p className="rounded-xl bg-slate-100 p-2 text-sm font-semibold text-slate-700">Hors ligne</p>}
      {erreur && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800">{erreur}</p>}

      <div className="sticky top-0 z-10 rounded-2xl bg-white p-3 shadow ring-1 ring-slate-200">
        <p className="truncate text-sm font-black">{actif ? `${etiquetteDe(actif)} ${actif.numero} : ${actif.titre}` : 'Choisis une histoire ci-dessous'}</p>
        <audio ref={audio} controls preload="none" className="mt-1 w-full" aria-label="Lecteur de l’épisode"
          onTimeUpdate={(ev) => { const t = ev.currentTarget.currentTime; setTemps(t); if (actif && Math.round(t) % 5 === 0) memoire.ecrire(`feuilleton-${cle(actif)}`, String(Math.floor(t))); }}
          onEnded={() => { if (actif) memoire.ecrire(`feuilleton-${cle(actif)}`, '0'); suivant(); }} />
        <div className="mt-2 flex gap-2 text-sm font-bold">
          <button type="button" onClick={() => aller(temps - 15)} className="rounded-xl bg-slate-100 px-3 py-2">−15 s</button>
          <button type="button" onClick={() => aller(temps + 15)} className="rounded-xl bg-slate-100 px-3 py-2">+15 s</button>
          <button type="button" onClick={changerVitesse} className="rounded-xl bg-slate-100 px-3 py-2" aria-label={`Vitesse ${vitesse}`}>{vitesse}×</button>
        </div>
        {traductions && (
          <div className="mt-2 flex flex-wrap items-center gap-1 text-xs font-bold" role="group" aria-label="Langue du texte">
            {LANGUES.filter((l) => l.id === 'fr' || traductions[l.id]).map((l) => (
              <button key={l.id} type="button" onClick={() => setLangue(l.id)} aria-pressed={langue === l.id}
                className={`rounded-full px-3 py-1 ${langue === l.id ? 'bg-[#0f1f3d] text-white' : 'bg-slate-100'}`}>{l.nom}</button>
            ))}
            {langue !== 'fr' && <span className="basis-full text-slate-500">Traduction automatique, pas encore relue. La voix reste en français.</span>}
          </div>
        )}
        {repliques.length > 0 && (
          <ol className="mt-2 max-h-32 space-y-1 overflow-y-auto" aria-label="Texte de l’épisode">
            {repliques.map((r, i) => (
              <li key={i}>
                <button type="button" onClick={() => aller(r.debut)} aria-current={i === courante}
                  className={`w-full rounded-lg px-2 py-1 text-left text-sm ${i === courante ? 'bg-amber-100 font-bold' : 'text-slate-600'}`}>
                  {r.qui && <span className="font-black">{r.qui} : </span>}{langue === 'fr' ? r.texte : traductions?.[langue]?.[i] ?? r.texte}
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>

      {seriesDisponibles().map((s) => (
        <section key={s.id} aria-labelledby={`serie-${s.id}`}>
          <h2 id={`serie-${s.id}`} className="text-xl font-black">{s.titre}</h2>
          <p className="text-sm text-slate-600">{s.genre}</p>
          <ul className="mt-2 space-y-3">
            {episodesDe(s.id).map((e) => {
              const k = cle(e), p = progression[k];
              return (
                <li key={k} className="rounded-2xl bg-white p-3 ring-1 ring-slate-200">
                  <p className="font-black">{s.etiquette} {e.numero} : {e.titre}</p>
                  <p className="text-sm text-slate-600">{formaterDuree(e.duree)} · {formaterTaille(e.octets)}{telecharges[k] ? ' · sur ton téléphone ✓' : ''}</p>
                  <p className="mt-1 text-sm italic text-slate-700">{e.question}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm font-bold">
                    <button type="button" onClick={() => void ecouter(e)} className="rounded-xl bg-[#0f1f3d] px-4 py-2 text-white">Écouter</button>
                    {p === undefined && !telecharges[k] && <button type="button" onClick={() => void telechargerEp(e)} disabled={!enLigne} className="rounded-xl bg-amber-200 px-4 py-2 text-amber-950 disabled:opacity-50">Télécharger ({formaterTaille(e.octets)})</button>}
                    {p !== undefined && <button type="button" onClick={() => controleurs.current[k]?.abort()} className="rounded-xl bg-slate-200 px-4 py-2">Arrêter {Math.round(p * 100)} %</button>}
                    {telecharges[k] && <button type="button" onClick={() => void supprimerEp(e)} className="rounded-xl bg-slate-100 px-4 py-2">Supprimer</button>}
                  </div>
                  {p !== undefined && <progress className="mt-2 w-full" value={p} max={1} aria-label="Progression du téléchargement" />}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
