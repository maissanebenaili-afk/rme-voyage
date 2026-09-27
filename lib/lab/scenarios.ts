/**
 * RME Test Lab scenarios (docs/rme-lab/IDEA_VAULT.md, IV-020…023). Each one is
 * a sentence a real traveller could say and the facts RME must read from it —
 * no more. Used by __tests__/labScenarios.test.ts; not imported by production.
 */
import type { TripField } from '@/lib/tripFacts';

export type LabScenario = {
  id: string;
  sentence: string;
  expect: {
    destination?: string;   // destination key
    origin?: string;        // origin label
    via?: string;           // hub key
    month?: number;
    family?: boolean;
    mode?: 'car' | 'plane' | 'ferry';
    purpose?: 'omra' | 'hajj';
    unknown: TripField[];
  };
};

export const LAB_SCENARIOS: LabScenario[] = [
  {
    id: 'IV-020',
    sentence: 'Je vais à Taza en août avec ma famille depuis Paris en voiture',
    expect: { destination: 'taza', origin: 'Paris', month: 8, family: true, mode: 'car', unknown: [] },
  },
  {
    id: 'IV-021',
    sentence: 'Paris → Martil en famille cet été',
    // « cet été » is not a month: the date stays unknown, never guessed.
    expect: { destination: 'martil', origin: 'Paris', family: true, unknown: ['when', 'mode'] },
  },
  {
    id: 'IV-022',
    sentence: 'De Conakry à Fès via Casablanca en avion',
    expect: { destination: 'fes', origin: 'Conakry', via: 'casablanca', mode: 'plane', unknown: ['when', 'travellers'] },
  },
  {
    id: 'IV-023',
    sentence: 'Préparer une omra depuis Lyon en mars',
    expect: { destination: 'makkah', origin: 'Lyon', month: 3, purpose: 'omra', unknown: ['travellers', 'mode'] },
  },
];
