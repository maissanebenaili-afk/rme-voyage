// « Déroule ! » : 10 secondes pour dérouler le plus de papier possible.
// Le jeu idiot des toilettes. Logique pure : le composant convertit les
// glissements de doigt en centimètres et appelle `derouler` et `attendre`.

export const DUREE = 10; // secondes par manche
/** Un glissement d'un pixel déroule ce nombre de centimètres. */
export const CM_PAR_PIXEL = 0.25;
/** Un simple appui déroule un petit bout. */
export const CM_PAR_APPUI = 6;

export interface Manche {
  centimetres: number;
  reste: number;
  commencee: boolean;
  finie: boolean;
}

export function nouvelleManche(): Manche {
  return { centimetres: 0, reste: DUREE, commencee: false, finie: false };
}

export function derouler(manche: Manche, centimetres: number): Manche {
  if (manche.finie || !(centimetres > 0)) return manche;
  return { ...manche, centimetres: manche.centimetres + centimetres, commencee: true };
}

/** Le temps ne file qu'une fois la manche commencée. */
export function attendre(manche: Manche, secondes: number): Manche {
  if (!manche.commencee || manche.finie || !(secondes > 0)) return manche;
  const reste = Math.max(0, manche.reste - secondes);
  return { ...manche, reste, finie: reste === 0 };
}

export function metres(manche: Manche): number {
  return Math.round(manche.centimetres) / 100;
}

/** Le verdict, en français de la rue avec un peu de darija. */
export function verdict(m: number): string {
  if (m < 5) return 'Wakha… t’as les mains qui dorment ? Recommence, khoya !';
  if (m < 15) return 'Pas mal ! Mais Mima a vu : « Hchouma, tout le rouleau ! »';
  if (m < 30) return 'Wa3er ! Le rouleau est fini et quelqu’un frappe à la porte 😂';
  return 'Champion du bled ! Plus un seul rouleau dans toute la maison 🧻👑';
}
