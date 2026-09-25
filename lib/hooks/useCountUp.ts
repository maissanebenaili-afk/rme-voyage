import { useEffect, useRef, useState } from 'react';

/**
 * Anime une valeur numérique vers sa nouvelle cible (~250ms) plutôt que de
 * sauter d'un coup — retour visuel léger quand le prix/la durée change suite
 * à une action utilisateur. Respecte prefers-reduced-motion (saut immédiat).
 */
export function useCountUp(value: number, durationMs = 250): number {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const frameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const from = fromRef.current;
    if (reduceMotion || from === value) {
      fromRef.current = value;
      setDisplay(value);
      return;
    }

    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min(1, (now - start) / durationMs);
      setDisplay(from + (value - from) * progress);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value;
      }
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== undefined) cancelAnimationFrame(frameRef.current);
    };
  }, [value, durationMs]);

  return display;
}
