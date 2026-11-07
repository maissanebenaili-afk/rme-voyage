'use client';

import { useState } from 'react';
import Memoire from '@/components/jeux/Memoire';
import Quiz from '@/components/jeux/Quiz';
import Rouleau from '@/components/jeux/Rouleau';
import Skate from '@/components/jeux/Skate';
import Zellige from '@/components/jeux/Zellige';

const JEUX = [
  { id: 'quiz', nom: 'Quiz du voyageur', emoji: '🧭', texte: 'Le Maroc, la route, la culture : 5 questions, 3 niveaux, des étoiles à gagner.', nouveau: true },
  { id: 'skate', nom: 'Skate à la corniche', emoji: '🛹', texte: 'Saute les plots, ramasse les pièces, bats ton record.' },
  { id: 'zellige', nom: 'Zellige', emoji: '🟩', texte: 'Range les mosaïques pour faire des lignes. Petits et grands.' },
  { id: 'memoire', nom: 'Mémoire des souks', emoji: '🫖', texte: 'Retrouve les paires. Dès 4 ans.' },
  { id: 'rouleau', nom: 'Déroule !', emoji: '🧻', texte: 'Le jeu des toilettes : 10 secondes pour dérouler tout le rouleau.' },
] as const;

type IdJeu = (typeof JEUX)[number]['id'];

export default function JeuxRoute() {
  const [jeu, setJeu] = useState<IdJeu | null>(null);
  const choisi = JEUX.find((j) => j.id === jeu);

  if (!choisi) {
    return (
      <ul className="grid gap-3">
        {JEUX.map((j) => (
          <li key={j.id}>
            <button
              type="button"
              onClick={() => setJeu(j.id)}
              className="flex w-full items-center gap-4 rounded-3xl bg-white p-4 text-left shadow-sm transition active:scale-[.99]"
            >
              <span aria-hidden="true" className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-4xl">
                {j.emoji}
              </span>
              <span>
                <span className="flex items-center gap-2 text-xl font-black text-[#0f1f3d]">
                  {j.nom}
                  {'nouveau' in j && j.nouveau && <span className="rounded-full bg-violet-600 px-2 py-0.5 text-xs font-black uppercase tracking-wide text-white">Nouveau</span>}
                </span>
                <span className="block text-slate-700">{j.texte}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-2xl font-black text-[#0f1f3d]">{choisi.nom}</h2>
        <button type="button" onClick={() => setJeu(null)} className="min-h-11 rounded-full bg-white px-4 font-bold text-[#0f1f3d]">
          ← Autres jeux
        </button>
      </div>
      {choisi.id === 'quiz' && <Quiz />}
      {choisi.id === 'memoire' && <Memoire />}
      {choisi.id === 'rouleau' && <Rouleau />}
      {choisi.id === 'skate' && <Skate />}
      {choisi.id === 'zellige' && <Zellige />}
    </div>
  );
}
