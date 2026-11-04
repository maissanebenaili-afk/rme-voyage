'use client';

import { useEffect, useRef, useState } from 'react';
import { CM_PAR_APPUI, CM_PAR_PIXEL, attendre, derouler, metres, nouvelleManche, verdict, type Manche } from '@/lib/jeux/rouleau';
import { battre, charger, enregistrer } from '@/lib/jeux/records';

export default function Rouleau() {
  const [manche, setManche] = useState<Manche>(nouvelleManche());
  const [record, setRecord] = useState(0);
  const [nouveauRecord, setNouveauRecord] = useState(false);
  const dernierY = useRef<number | null>(null);

  useEffect(() => setRecord(charger().rouleau ?? 0), []);

  // Le chrono tourne dès le premier glissement.
  useEffect(() => {
    if (!manche.commencee || manche.finie) return;
    let precedent = Date.now();
    const t = setInterval(() => {
      const maintenant = Date.now();
      // Écart calculé ici : React peut appeler la fonction de mise à jour plus tard.
      const ecart = (maintenant - precedent) / 1000;
      precedent = maintenant;
      setManche((m) => attendre(m, ecart));
    }, 100);
    return () => clearInterval(t);
  }, [manche.commencee, manche.finie]);

  // Fin de manche : record en centimètres, pour rester entier.
  useEffect(() => {
    if (!manche.finie) return;
    const score = Math.round(manche.centimetres);
    const { records, nouveau } = battre(charger(), 'rouleau', score);
    if (nouveau) enregistrer(records);
    setRecord(records.rouleau ?? score);
    setNouveauRecord(nouveau);
  }, [manche.finie, manche.centimetres]);

  function glisser(y: number) {
    if (dernierY.current !== null && y > dernierY.current) {
      const pixels = y - dernierY.current;
      setManche((m) => derouler(m, pixels * CM_PAR_PIXEL));
    }
    dernierY.current = y;
  }

  const m = metres(manche);
  // Bande de papier : elle s'allonge (affichage plafonné) et défile.
  const bande = Math.min(260, 40 + manche.centimetres * 0.6);

  return (
    <div className="text-center">
      <div className="flex items-center justify-between text-sm font-bold text-[#0f1f3d]">
        <span>{manche.reste.toFixed(1)} s</span>
        <span className="text-2xl font-black">{m.toFixed(2)} m</span>
        <span>Record : {(record / 100).toFixed(2)} m</span>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Glissez vers le bas pour dérouler le papier"
        onPointerDown={(e) => {
          dernierY.current = e.clientY;
          setManche((mm) => derouler(mm, CM_PAR_APPUI));
        }}
        onPointerMove={(e) => {
          if (e.buttons || e.pointerType === 'touch') glisser(e.clientY);
        }}
        onPointerUp={() => {
          dernierY.current = null;
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === ' ') {
            e.preventDefault();
            setManche((mm) => derouler(mm, CM_PAR_APPUI));
          }
        }}
        className="relative mx-auto mt-4 flex h-[340px] max-w-[280px] touch-none select-none flex-col items-center overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100 to-sky-200"
      >
        {/* support et rouleau */}
        <div className="mt-6 h-3 w-40 rounded-full bg-slate-400" />
        <div className="-mt-1 h-20 w-36 rounded-[2rem] border-4 border-slate-200 bg-white shadow-inner" />
        {/* bande de papier qui descend */}
        <div
          className="w-28 border-x-2 border-dashed border-slate-200 bg-white"
          style={{
            height: bande,
            backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 38px, #e2e8f0 38px 40px)',
            backgroundPositionY: `${manche.centimetres * 2}px`,
          }}
        />
        {!manche.commencee && (
          <span className="absolute bottom-6 left-0 right-0 text-lg font-black text-[#0f1f3d]">👇 Glisse vers le bas !</span>
        )}
      </div>

      {manche.finie && (
        <div role="status" className="mt-4 rounded-2xl bg-white p-4">
          <p className="text-xl font-black text-[#0f1f3d]">{nouveauRecord ? `Nouveau record : ${m.toFixed(2)} m !` : `${m.toFixed(2)} mètres`}</p>
          <p className="mt-1 text-slate-700">{verdict(m)}</p>
          <button
            type="button"
            onClick={() => {
              setManche(nouvelleManche());
              setNouveauRecord(false);
            }}
            className="mt-3 min-h-12 rounded-full bg-[#0f1f3d] px-6 font-bold text-white"
          >
            Encore un rouleau
          </button>
        </div>
      )}
    </div>
  );
}
