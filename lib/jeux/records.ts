// Meilleurs scores gardés dans le navigateur, d'une partie à l'autre.

export const RECORDS_KEY = 'rme-jeux-records';

export type Records = Record<string, number>;

export function lireRecords(brut: string | null): Records {
  if (!brut) return {};
  try {
    const valeur = JSON.parse(brut) as unknown;
    if (!valeur || typeof valeur !== 'object' || Array.isArray(valeur)) return {};
    return Object.fromEntries(
      Object.entries(valeur as Record<string, unknown>).filter(
        (e): e is [string, number] => typeof e[1] === 'number' && Number.isFinite(e[1]) && e[1] >= 0,
      ),
    );
  } catch {
    // Valeur abîmée dans le stockage : on repart sans record.
    return {};
  }
}

/** Le nouveau record si le score le bat (plus grand, ou plus petit pour un jeu « en moins de coups »). */
export function battre(records: Records, jeu: string, score: number, mieux: 'plus' | 'moins' = 'plus'): { records: Records; nouveau: boolean } {
  const actuel = records[jeu];
  const nouveau = actuel === undefined || (mieux === 'plus' ? score > actuel : score < actuel);
  return { records: nouveau ? { ...records, [jeu]: score } : records, nouveau };
}

export function charger(): Records {
  try {
    return lireRecords(localStorage.getItem(RECORDS_KEY));
  } catch {
    // Stockage indisponible (navigation privée) : pas de record gardé.
    return {};
  }
}

export function enregistrer(records: Records) {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch {
    // Stockage indisponible : le record vaut pour cette visite seulement.
  }
}
