'use client';

import { useEffect, useRef, useState } from 'react';
import { battre, charger, enregistrer } from '@/lib/jeux/records';
import { aRepondu, etoiles, nouvellePartie, repondre, suivante, termine, type Niveau, type Partie } from '@/lib/jeux/quiz';

const NIVEAUX: { id: Niveau; nom: string }[] = [
  { id: 'facile', nom: 'Facile' },
  { id: 'moyen', nom: 'Moyen' },
  { id: 'difficile', nom: 'Difficile' },
];
const LETTRES = ['A', 'B', 'C', 'D'];

export default function Quiz() {
  const [niveau, setNiveau] = useState<Niveau>('facile');
  const [partie, setPartie] = useState<Partie | null>(null);
  const [record, setRecord] = useState<{ valeur: number | undefined; nouveau: boolean }>({ valeur: undefined, nouveau: false });

  // Le hasard seulement dans le navigateur, pour un affichage serveur stable.
  useEffect(() => { setPartie(nouvellePartie(niveau)); setRecord({ valeur: charger()[`quiz-${niveau}`], nouveau: false }); }, [niveau]);

  const retour = useRef<HTMLDivElement>(null);
  const fini = !!partie && termine(partie);
  const repondu = !!partie && aRepondu(partie);
  // Sur téléphone, la bonne réponse et le bouton « suivante » sont sous les propositions : on les amène à l'écran.
  useEffect(() => { if (repondu) retour.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }); }, [repondu]);
  useEffect(() => {
    if (!partie || !fini) return;
    const { records, nouveau } = battre(charger(), `quiz-${partie.niveau}`, partie.score);
    if (nouveau) enregistrer(records);
    setRecord({ valeur: records[`quiz-${partie.niveau}`], nouveau });
    // une seule fois à la fin de la partie
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fini]);

  if (!partie) return null;
  const total = partie.questions.length;

  if (fini) {
    const n = etoiles(partie);
    return (
      <div role="status" className="rounded-3xl bg-white p-6 text-center shadow-sm">
        <p aria-label={`${n} étoile${n > 1 ? 's' : ''} sur 3`} className="text-5xl tracking-widest">
          {[0, 1, 2].map((i) => <span key={i} className={i < n ? '' : 'opacity-25 grayscale'}>⭐</span>)}
        </p>
        <p className="mt-3 text-2xl font-black text-[#0f1f3d]">{partie.score} sur {total}</p>
        <p className="mt-1 text-slate-700">{n === 3 ? 'Sans faute, bravo champion !' : n >= 1 ? 'Joli ! Tu peux faire encore mieux.' : 'On réessaie ? Les réponses se retiennent vite.'}</p>
        {partie.meilleureSerie > 1 && <p className="mt-1 text-sm font-semibold text-amber-800">Meilleure série : {partie.meilleureSerie} bonnes réponses d’affilée</p>}
        {record.nouveau && <p className="mt-2 rounded-xl bg-emerald-50 p-2 font-black text-emerald-900">Nouveau record ! 🎉</p>}
        {!record.nouveau && record.valeur !== undefined && <p className="mt-2 text-sm text-slate-600">Ton record à ce niveau : {record.valeur} sur {total}</p>}
        <button type="button" onClick={() => setPartie(nouvellePartie(niveau))} className="mt-4 min-h-12 w-full rounded-full bg-[#0f1f3d] px-6 font-bold text-white">Rejouer</button>
      </div>
    );
  }

  const question = partie.questions[partie.index];
  const choix = partie.choix[partie.index];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {NIVEAUX.map((n) => (
          <button key={n.id} type="button" onClick={() => setNiveau(n.id)} aria-pressed={niveau === n.id}
            className={`min-h-11 rounded-full px-4 font-bold ${niveau === n.id ? 'bg-[#0f1f3d] text-white' : 'bg-white text-[#0f1f3d]'}`}>
            {n.nom}
          </button>
        ))}
        {record.valeur !== undefined && <span className="ms-auto text-sm font-semibold text-slate-700">Record : {record.valeur}/{total}</span>}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <progress className="h-2 flex-1" value={partie.index + (repondu ? 1 : 0)} max={total} aria-label="Avancement du quiz" />
        <span className="text-sm font-bold text-slate-700">{partie.index + 1}/{total}</span>
        {partie.serie > 1 && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-sm font-black text-amber-900">🔥 {partie.serie}</span>}
      </div>

      <h3 className="mt-4 text-xl font-black text-[#0f1f3d]">{question.q}</h3>

      <ul className="mt-3 grid gap-2">
        {question.options.map((o, i) => {
          const bonne = i === question.bonne, choisie = i === choix;
          const style = !repondu ? 'bg-white text-[#0f1f3d] active:scale-[.99]' : bonne ? 'bg-emerald-100 text-emerald-950 ring-2 ring-emerald-600' : choisie ? 'bg-red-100 text-red-950 ring-2 ring-red-500' : 'bg-white/60 text-slate-500';
          return (
            <li key={o}>
              <button type="button" disabled={repondu} onClick={() => setPartie((p) => (p ? repondre(p, i) : p))}
                className={`flex min-h-14 w-full items-center gap-3 rounded-2xl px-4 py-2 text-left font-bold shadow-sm transition ${style}`}>
                <span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-sm">{LETTRES[i]}</span>
                <span className="flex-1">{o}</span>
                {repondu && bonne && <span aria-label="Bonne réponse">✓</span>}
                {repondu && choisie && !bonne && <span aria-label="Mauvaise réponse">✗</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {repondu && (
        <div ref={retour} role="status" className="mt-3 scroll-mb-4">
          <p className="font-black text-[#0f1f3d]">{choix === question.bonne ? 'Bonne réponse ! 🎉' : `La bonne réponse : ${question.options[question.bonne]}`}</p>
          <button type="button" onClick={() => setPartie((p) => (p ? suivante(p) : p))} className="mt-2 min-h-12 w-full rounded-full bg-[#0f1f3d] px-6 font-bold text-white">
            {partie.index + 1 === total ? 'Voir mon score' : 'Question suivante →'}
          </button>
        </div>
      )}
    </div>
  );
}
