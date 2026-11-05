/**
 * Pauses conseillées pour une famille qui conduit : une toutes les 2 heures,
 * la recommandation de sécurité routière la plus répandue. Calculé depuis la
 * durée de conduite du trajet (hors traversée maritime). Les kilomètres sont une
 * estimation proportionnelle, pas un relevé de la route.
 */

export interface Pause {
  numero: number;
  /** Durée de conduite écoulée au moment de la pause. */
  apresSecondes: number;
  /** Kilomètre approximatif depuis le départ. */
  kmApprox: number;
}

export const INTERVALLE_PAUSE_SECONDES = 2 * 3600;
/** Pas de pause si l'arrivée est proche : on arrive plutôt que de s'arrêter. */
export const MARGE_ARRIVEE_SECONDES = 30 * 60;

export function pausesFamille(dureeSecondes: number, distanceMetres: number): Pause[] {
  if (!(dureeSecondes > 0) || !(distanceMetres > 0)) return [];
  const pauses: Pause[] = [];
  for (let k = 1; k * INTERVALLE_PAUSE_SECONDES <= dureeSecondes - MARGE_ARRIVEE_SECONDES; k++) {
    const apres = k * INTERVALLE_PAUSE_SECONDES;
    pauses.push({ numero: k, apresSecondes: apres, kmApprox: Math.round((distanceMetres * apres) / dureeSecondes / 1000) });
  }
  return pauses;
}
