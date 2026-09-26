'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';

const SESSION_KEY = 'rme-splash-shown';
const HOLD_MS = 1500;

/**
 * Écran de démarrage (logo, 1,5 s) affiché une seule fois par session — pas à
 * chaque navigation, pas aux visiteurs qui reviennent. Purement décoratif :
 * ne retarde jamais le rendu réel de la page en dessous, se contente de la
 * recouvrir puis de disparaître. Respecte prefers-reduced-motion (pas
 * affiché du tout, une pause imposée de 5s serait justement le genre de
 * chose que ce réglage sert à éviter) et n'affecte pas le clavier (rien de
 * focusable dessous, aria-hidden).
 *
 * Fond plein vert Atlas foncé (identité de marque, à la Waze) plutôt que la
 * palette pâle du reste du site : c'est un instant de marque, pas du
 * contenu à lire — un aplat de couleur franche n'y pose pas le même
 * problème de fatigue visuelle qu'un paragraphe sur fond sombre.
 *
 * L'ouverture en iris (clip-path circulaire qui s'étend depuis le centre)
 * donne l'impression que l'écran "sort" d'un point plutôt qu'un simple
 * fondu plat.
 */
interface SplashScreenProps {
  /** Surchargeable pour les tests, sans quoi la suite attendrait 5s pour de vrai. */
  holdMs?: number;
}

export default function SplashScreen({ holdMs = HOLD_MS }: SplashScreenProps = {}) {
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

    // Dans l'application Android/iOS, l'écran de démarrage natif
    // (capacitor.config.ts) s'affiche déjà : ne pas en enchaîner un second.
    const nativeApp = Capacitor.isNativePlatform();

    if (alreadyShown || reduceMotion || nativeApp) return;

    setVisible(true);
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // Rien à faire : au pire le splash rejouera une fois de plus.
    }
    const timer = setTimeout(() => setVisible(false), holdMs);
    return () => clearTimeout(timer);
  }, [holdMs]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          aria-hidden="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-atlas-700"
          initial={{ clipPath: 'circle(0% at 50% 50%)' }}
          animate={{ clipPath: 'circle(150% at 50% 50%)' }}
          exit={{ opacity: 0 }}
          transition={{ clipPath: { duration: 0.6, ease: 'easeOut' }, opacity: { duration: 0.35, ease: 'easeOut' } }}
        >
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.2, 0.9, 0.3, 1.2] }}
            className="flex flex-col items-center gap-3"
          >
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-white text-2xl font-black text-atlas-700 shadow-xl shadow-black/20">
              R
            </span>
            <span className="text-lg font-black tracking-tight text-white">
              RME <span className="font-medium text-[#fde68a]">Voyage</span>
            </span>
            <span className="text-xs font-semibold tracking-wide text-white/70">by Tarek Benaïli</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
