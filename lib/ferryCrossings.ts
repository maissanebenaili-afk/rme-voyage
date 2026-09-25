import type { LonLat } from '@/lib/geo';

/**
 * Liaisons maritimes Espagne ↔ Maroc prises en compte pour construire un
 * itinéraire voiture + ferry. Les coordonnées sont celles des terminaux
 * passagers dans OpenStreetMap (identifiants ci-dessous, relevés le
 * 2026-09-25) : aucune donnée d'horaire, de prix ou d'opérateur n'est
 * stockée ici. Les liaisons existantes et leurs tarifs se vérifient auprès
 * des compagnies (voir BookingCards).
 */

export interface Port {
  id: string;
  name: string;
  /** [lon, lat] du terminal passagers. */
  location: LonLat;
  osm: string;
}

export interface Crossing {
  europe: Port;
  morocco: Port;
}

const ALGECIRAS: Port = { id: 'algeciras', name: 'Algeciras', location: [-5.4396219, 36.1298302], osm: 'way/22740679' };
const TARIFA: Port = { id: 'tarifa', name: 'Tarifa', location: [-5.6025662, 36.0108633], osm: 'way/180591777' };
const ALMERIA: Port = { id: 'almeria', name: 'Almería', location: [-2.467675, 36.835149], osm: 'way/196310297' };
const TANGER_MED: Port = { id: 'tanger-med', name: 'Tanger Med', location: [-5.5143478, 35.8779354], osm: 'way/178877454' };
const TANGER_VILLE: Port = { id: 'tanger-ville', name: 'Tanger Ville', location: [-5.8045379, 35.789116], osm: 'way/366204667' };
const NADOR: Port = { id: 'nador', name: 'Nador (Beni Ansar)', location: [-2.9188718, 35.2710745], osm: 'node/2297872972' };

export const CROSSINGS: Crossing[] = [
  { europe: ALGECIRAS, morocco: TANGER_MED },
  { europe: TARIFA, morocco: TANGER_VILLE },
  { europe: ALMERIA, morocco: NADOR },
];

export const EUROPE_PORTS: Port[] = [...new Set(CROSSINGS.map((c) => c.europe))];
export const MOROCCO_PORTS: Port[] = [...new Set(CROSSINGS.map((c) => c.morocco))];

/** Pays depuis/vers lesquels on accepte un itinéraire par ces traversées. */
export const EUROPE_SIDE = new Set([
  'AD', 'AT', 'BE', 'BG', 'CH', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HR',
  'HU', 'IE', 'IT', 'LI', 'LT', 'LU', 'LV', 'MC', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SE', 'SI',
  'SK', 'SM',
]);
export const MOROCCO_SIDE = new Set(['MA']);
