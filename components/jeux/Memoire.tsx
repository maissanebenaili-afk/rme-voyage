'use client';

import { useEffect, useState } from 'react';
import { doitRecacher, gagnee, nouvellePartie, recacher, retourner, visible, type Partie } from '@/lib/jeux/memoire';

const NIVEAUX = [
  { paires: 4, nom: 'Petit' },
  { paires: 6, nom: 'Moyen' },
  { paires: 8, nom: 'Grand' },
] as const;

export default function Memoire() {
  const [paires, setPaires] = useState<number>(4);
  const [partie, setPartie] = useState<Partie | null>(null);

  // Le hasard seulement dans le navigateur, pour un affichage serveur stable.
  useEffect(() => setPartie(nouvellePartie(paires)), [paires]);

  // Deux cartes différentes restent visibles un instant, puis se recachent.
  useEffect(() => {
    if (!partie || !doitRecacher(partie)) return;
    const t = setTimeout(() => setPartie((p) => (p ? recacher(p) : p)), 900);
    return () => clearTimeout(t);
  }, [partie]);

  if (!partie) return null;
  const fini = gagnee(partie);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {NIVEAUX.map((n) => (
          <button
            key={n.paires}
            type="button"
            onClick={() => setPaires(n.paires)}
            aria-pressed={paires === n.paires}
            className={`min-h-11 rounded-full px-4 font-bold ${paires === n.paires ? 'bg-[#0f1f3d] text-white' : 'bg-white text-[#0f1f3d]'}`}
          >
            {n.nom}
          </button>
        ))}
        <span className="ms-auto text-sm font-semibold text-slate-700">{partie.coups} coups</span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
        {partie.cartes.map((carte, i) => {
          const montre = visible(partie, i);
          return (
            <button
              key={carte.id}
              type="button"
              onClick={() => setPartie((p) => (p ? retourner(p, i) : p))}
              aria-label={montre ? carte.symbole : `Carte ${i + 1}, cachée`}
              className={`flex aspect-square items-center justify-center rounded-2xl text-4xl shadow-sm transition sm:text-5xl ${
                carte.trouvee ? 'bg-emerald-100' : montre ? 'bg-white' : 'bg-gradient-to-br from-[#0f6e5a] to-[#0f1f3d]'
              }`}
            >
              {montre ? carte.symbole : <span aria-hidden="true" className="text-2xl text-amber-300">✦</span>}
            </button>
          );
        })}
      </div>

      {fini && (
        <div role="status" className="mt-4 rounded-2xl bg-emerald-50 p-4 text-center">
          <p className="text-xl font-black text-emerald-900">Bravo ! Toutes les paires en {partie.coups} coups 🎉</p>
          <button type="button" onClick={() => setPartie(nouvellePartie(paires))} className="mt-3 min-h-12 rounded-full bg-emerald-800 px-6 font-bold text-white">
            Rejouer
          </button>
        </div>
      )}
    </div>
  );
}
