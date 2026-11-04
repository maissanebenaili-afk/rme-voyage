'use client';

import { useState } from 'react';
import Chameau from '@/components/jeux/Chameau';
import Memoire from '@/components/jeux/Memoire';
import Zellige from '@/components/jeux/Zellige';

const JEUX = [
  { id: 'memoire', nom: 'Mémoire des souks', emoji: '🐪', texte: 'Retrouve les paires. Dès 4 ans.' },
  { id: 'chameau', nom: 'Le chameau sauteur', emoji: '🌵', texte: 'Saute par-dessus les cactus. Un seul bouton.' },
  { id: 'zellige', nom: 'Zellige', emoji: '🟩', texte: 'Range les mosaïques pour faire des lignes.' },
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
                <span className="block text-xl font-black text-[#0f1f3d]">{j.nom}</span>
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
      {choisi.id === 'memoire' && <Memoire />}
      {choisi.id === 'chameau' && <Chameau />}
      {choisi.id === 'zellige' && <Zellige />}
    </div>
  );
}
