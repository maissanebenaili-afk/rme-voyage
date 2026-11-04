'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, RotateCw } from 'lucide-react';
import { droite, gauche, image, lacher, nouveauJeu, tomber, tourner, vitesse, type Jeu } from '@/lib/jeux/zellige';

// Couleurs de zellige : vert de Fès, bleu majorelle, ocre, terre cuite, blanc cassé, noir.
const COULEURS = ['', '#0f7a5c', '#2747c9', '#d99a1e', '#b8532c', '#e9dfc9', '#26313f'];

function Carreau({ couleur }: { couleur: number }) {
  if (!couleur) return <div className="aspect-square rounded-[3px] bg-white/5" />;
  return (
    <div
      className="aspect-square rounded-[3px]"
      style={{
        backgroundColor: COULEURS[couleur],
        // Petite étoile de mosaïque au centre de chaque carreau.
        backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,.55) 0 18%, transparent 19%), linear-gradient(135deg, rgba(255,255,255,.25), transparent 55%)',
      }}
    />
  );
}

export default function Zellige() {
  const [jeu, setJeu] = useState<Jeu | null>(null);
  const [pause, setPause] = useState(false);

  useEffect(() => setJeu(nouveauJeu()), []);

  const agir = useCallback((action: (j: Jeu) => Jeu) => setJeu((j) => (j ? action(j) : j)), []);

  // La pièce tombe toute seule, de plus en plus vite.
  const lignes = jeu?.lignes ?? 0;
  const fini = jeu?.fini ?? false;
  useEffect(() => {
    if (fini || pause || !jeu) return;
    const t = setInterval(() => agir((j) => tomber(j)), vitesse(lignes));
    return () => clearInterval(t);
  }, [lignes, fini, pause, agir, jeu]);

  // Clavier sur ordinateur : flèches et espace.
  useEffect(() => {
    function touche(e: KeyboardEvent) {
      const actions: Record<string, (j: Jeu) => Jeu> = {
        ArrowLeft: gauche,
        ArrowRight: droite,
        ArrowUp: tourner,
        ArrowDown: (j) => tomber(j),
        ' ': (j) => lacher(j),
      };
      const action = actions[e.key];
      if (!action) return;
      e.preventDefault();
      agir(action);
    }
    window.addEventListener('keydown', touche);
    return () => window.removeEventListener('keydown', touche);
  }, [agir]);

  if (!jeu) return null;
  const grille = image(jeu);
  const bouton = 'inline-flex h-16 flex-1 items-center justify-center rounded-2xl bg-[#0f1f3d] text-white active:scale-95';

  return (
    <div>
      <div className="flex items-center justify-between text-sm font-bold text-[#0f1f3d]">
        <span>Score : {jeu.score}</span>
        <span>Lignes : {jeu.lignes}</span>
        <button type="button" onClick={() => setPause((p) => !p)} className="min-h-10 rounded-full bg-white px-4">
          {pause ? 'Reprendre' : 'Pause'}
        </button>
      </div>

      <div className="relative mx-auto mt-3 max-w-[300px] rounded-2xl bg-[#0f1f3d] p-2" aria-label="Plateau de jeu" role="img">
        <div className="grid grid-cols-9 gap-[2px]">
          {grille.flatMap((ligne, l) => ligne.map((couleur, c) => <Carreau key={`${l}-${c}`} couleur={couleur} />))}
        </div>
        {(jeu.fini || pause) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/60 text-center text-white">
            <p className="text-2xl font-black">{jeu.fini ? 'Partie finie' : 'Pause'}</p>
            {jeu.fini && <p className="mt-1">{jeu.score} points</p>}
            <button
              type="button"
              onClick={() => {
                if (jeu.fini) setJeu(nouveauJeu());
                setPause(false);
              }}
              className="mt-4 min-h-12 rounded-full bg-amber-400 px-6 font-bold text-[#0f1f3d]"
            >
              {jeu.fini ? 'Rejouer' : 'Reprendre'}
            </button>
          </div>
        )}
      </div>

      <div className="mx-auto mt-4 flex max-w-[360px] gap-2">
        <button type="button" aria-label="Gauche" onClick={() => agir(gauche)} className={bouton}>
          <ArrowLeft size={28} aria-hidden="true" />
        </button>
        <button type="button" aria-label="Tourner" onClick={() => agir(tourner)} className={bouton}>
          <RotateCw size={28} aria-hidden="true" />
        </button>
        <button type="button" aria-label="Droite" onClick={() => agir(droite)} className={bouton}>
          <ArrowRight size={28} aria-hidden="true" />
        </button>
        <button type="button" aria-label="Descendre d'un coup" onClick={() => agir((j) => lacher(j))} className={bouton}>
          <ArrowDown size={28} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
