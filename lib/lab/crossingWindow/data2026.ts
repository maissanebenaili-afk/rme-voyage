/**
 * RME Lab — « Quand partir ? ». Données de l'été 2026, avec leur provenance.
 *
 * 1. Bison Futé 2026, sens des départs (Paris → régions, régions → côte), juillet et août.
 *    Source officielle : https://www.bison-fute.gouv.fr/IMG/pdf/Calendrier_Bison_Fute_2026.pdf
 *    (publié le 27/03/2026). Les couleurs sont dessinées dans le PDF, pas écrites : elles ont été
 *    TRANSCRITES À LA MAIN le 2026-10-04 depuis une image de la page. Statut : SOURCE OFFICIELLE,
 *    TRANSCRIPTION À VÉRIFIER. Zones : 1 Île-de-France, 2 Grand-Ouest et Nord, 3 Bourgogne et Est,
 *    4 Auvergne-Rhône-Alpes, 5 Sud-Ouest, 6 Arc méditerranéen.
 *    Le niveau national s'applique partout ; une zone citée peut être plus difficile que le national.
 *
 * 2. Détroit (Opération Paso del Estrecho, OPE). Aucun calendrier officiel jour par jour n'a été trouvé.
 *    Faits retenus :
 *    - OPE 2026 du 15 juin au 15 septembre (gouvernement espagnol, CONFIRMÉ par plusieurs sources).
 *    - OPE 2025 : la plus forte concentration de la phase de sortie a eu lieu le premier week-end
 *      d'août (ministère de l'Intérieur espagnol, bilan 2025, cité par la presse ; CONFIRMÉ, source officielle relayée).
 *    - 2026 : record de 1 929 voitures en 24 h à Tarifa ; Algésiras + Tarifa : 39 006 passagers et
 *      10 056 voitures ce jour-là (dépêche EFE du 2 août 2026, « samedi » = samedi 1er août). À VÉRIFIER
 *      sur une source officielle.
 *    - 2026, premier mois (15 juin – 15 juillet) : 160 698 véhicules pour tous les ports, soit environ
 *      5 200 par jour en moyenne (ministère de l'Intérieur, 16/07/2026, CONFIRMÉ).
 *    Le reste du modèle de pression au port est une INFÉRENCE (week-ends plus chargés), affichée comme telle.
 */

export type RoadLevel = 0 | 1 | 2 | 3; // 0 habituelle (vert), 1 difficile (orange), 2 très difficile (rouge), 3 extrêmement difficile (noir)
export type BisonDay = { national: RoadLevel; zones?: { zones: number[]; level: RoadLevel } };

export const BISON_SOURCE = 'Bison Futé, calendrier 2026 (PDF officiel du 27/03/2026), sens des départs';
export const BISON_URL = 'https://www.bison-fute.gouv.fr/IMG/pdf/Calendrier_Bison_Fute_2026.pdf';

const G: BisonDay = { national: 0 };
const d = (national: RoadLevel, zones?: number[], level?: RoadLevel): BisonDay => (zones && level !== undefined ? { national, zones: { zones, level } } : { national });

/** Sens des départs, 1er juillet – 31 août 2026 (transcription manuelle, voir l'en-tête). */
export const BISON_DEPARTURES_2026: Record<string, BisonDay> = {
  '2026-07-01': G, '2026-07-02': G,
  '2026-07-03': d(1, [1, 2, 3], 2), '2026-07-04': d(1, [1, 2], 2), '2026-07-05': d(0, [4], 1),
  '2026-07-06': G, '2026-07-07': G, '2026-07-08': G, '2026-07-09': G,
  '2026-07-10': d(2, [4], 3), '2026-07-11': d(2, [2, 3, 4], 3), '2026-07-12': d(0, [4], 1),
  '2026-07-13': G, '2026-07-14': G, '2026-07-15': G, '2026-07-16': G,
  '2026-07-17': d(1, [3, 4], 2), '2026-07-18': d(2), '2026-07-19': d(0, [3, 4], 1),
  '2026-07-20': G, '2026-07-21': G, '2026-07-22': G, '2026-07-23': G,
  '2026-07-24': d(1, [3, 4, 5], 2), '2026-07-25': d(2), '2026-07-26': d(0, [4], 1),
  '2026-07-27': G, '2026-07-28': G, '2026-07-29': G, '2026-07-30': G,
  '2026-07-31': d(2, [5], 3),
  '2026-08-01': d(3), '2026-08-02': d(1, [4, 5], 2), '2026-08-03': d(1),
  '2026-08-04': G, '2026-08-05': G, '2026-08-06': G,
  '2026-08-07': d(0, [2, 3, 4], 1), '2026-08-08': d(2), '2026-08-09': d(0, [4, 5], 1), '2026-08-10': d(0, [2], 1),
  '2026-08-11': G, '2026-08-12': G, '2026-08-13': G,
  '2026-08-14': d(0, [4, 5, 6], 1), '2026-08-15': d(2, [4], 3), '2026-08-16': d(0, [4, 5, 6], 1), '2026-08-17': d(0, [4, 5, 6], 1),
  '2026-08-18': G, '2026-08-19': G, '2026-08-20': G,
  '2026-08-21': d(0, [2, 3, 4, 5], 1), '2026-08-22': d(0, [2, 3, 4], 1), '2026-08-23': G,
  '2026-08-24': G, '2026-08-25': G, '2026-08-26': G, '2026-08-27': G,
  '2026-08-28': d(0, [2, 3, 4, 5], 1), '2026-08-29': d(0, [2, 3, 4], 1), '2026-08-30': G, '2026-08-31': G,
};

export const OPE_2026 = { start: '2026-06-15', end: '2026-09-15', exitPhaseEnd: '2026-08-15' } as const;

/** Jours où une pointe au port est documentée (et non déduite). */
export const PORT_EVIDENCE_2026: Record<string, { level: RoadLevel; text: string; status: 'CONFIRMÉ' | 'À VÉRIFIER' }> = {
  '2026-08-01': {
    level: 3,
    text: 'Record de 1 929 voitures en 24 h à Tarifa ; 10 056 voitures à Algésiras et Tarifa (EFE, 2 août 2026)',
    status: 'À VÉRIFIER',
  },
};

/** Le premier week-end d'août est la pointe de sortie documentée en 2025 (source officielle relayée). */
export const PORT_PEAK_PATTERN = {
  text: "En 2025, la plus forte concentration de la phase de sortie a eu lieu le premier week-end d'août (ministère de l'Intérieur espagnol)",
  status: 'CONFIRMÉ' as const,
};
