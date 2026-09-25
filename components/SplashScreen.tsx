'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SESSION_KEY = 'rme-splash-shown';
const HOLD_MS = 550;

/**
 * Écran de démarrage bref (logo, ~1s) affiché une seule fois par session —
 * pas à chaque navigation, pas aux visiteurs qui reviennent. Purement
 * décoratif : ne retarde jamais le rendu réel de la page en dessous, se
 * contente de la recouvrir puis de disparaître. Respecte
 * prefers-reduced-motion (pas affiché du tout) et n'affecte pas le clavier
 * (rien de focusable dessous, aria-hidden).
 */
export default function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      // Stockage indisponible (navigation privée stricte) : on ne bloque
      // jamais l'affichage pour ça, on saute simplement le splash.
      alreadyShown = true;
    }
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (alreadyShown || reduceMotion) return;

    setVisible(true);
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // Rien à faire : au pire le splash rejouera une fois de plus.
    }
    const timer = setTimeout(() => setVisible(false), HOLD_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#eef1f6]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="flex flex-col items-center gap-3"
          >
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-[#0f1f3d] text-2xl font-black text-[#f59e0b] shadow-xl shadow-[#0f1f3d]/15">
              R
            </span>
            <span className="text-lg font-black tracking-tight text-[#0f1f3d]">
              RME <span className="font-medium text-[#b45309]">Voyage</span>
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
