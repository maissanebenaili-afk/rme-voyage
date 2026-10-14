/**
 * RME Lab — the traveller's state. Reads only what the user saved on their own
 * device (the trip, and the checklist ticks shared with components/TravelChecklist)
 * and says where they are: phase, steps done, the next step. Pure; nothing leaves the device.
 */
import { computeTravelPhase, type TimelinePhaseId } from '@/lib/travel/travelPhase';
import type { CurrentTravelData } from '@/lib/travel/travelStorage.types';
import type { MagicActionKind, MagicLang } from '@/lib/lab/nextBestAction';

// Ids and French wording of the default items of components/TravelChecklist.tsx.
const STEP_LABEL: Record<string, Record<MagicLang, string>> = {
  passport: { fr: 'Passeport (validité > 6 mois)', da: 'Passport (sal7 kter mn 6 chhour)' },
  insurance: { fr: 'Assurance voyage / carte verte', da: 'Assurance / carte verte' },
  medicines: { fr: 'Médicaments + ordonnances', da: 'Dwa w l-ordonnances' },
  cnr: { fr: 'Carte nationale d’immatriculation (véhicule)', da: 'Carte grise dyal tomobil' },
  'driver-license': { fr: 'Permis de conduire (international recommandé)', da: 'Permis dyal s-siyaqa' },
  cte: { fr: 'Contrôle technique (si véhicule)', da: 'Contrôle technique' },
  'ferry-ticket': { fr: 'Réservation ferry (aller-retour)', da: 'Billet dyal l-babor' },
  'flight-ticket': { fr: 'Billet d’avion', da: 'Billet dyal tiyara' },
};

const ALWAYS = ['passport', 'insurance', 'medicines'];
const BY_MODE: Record<'car' | 'ferry' | 'plane', string[]> = {
  car: ['cnr', 'driver-license', 'cte', 'ferry-ticket'],
  ferry: ['ferry-ticket'],
  plane: ['flight-ticket'],
};

export type JourneyStep = { id: string; label: string; done: boolean };

export type JourneyState = {
  phase: TimelinePhaseId;
  daysUntilDeparture: number | null;
  steps: JourneyStep[];
  done: number;
  next?: JourneyStep;
};

type SavedTrip = Pick<CurrentTravelData, 'dateVoyage' | 'modeTransport'>;

function modeSteps(mode: SavedTrip['modeTransport']): string[] {
  if (mode === 'car' || mode === 'mixed') return BY_MODE.car;
  if (mode === 'ferry' || mode === 'plane') return BY_MODE[mode];
  return [];
}

/** Where the saved trip stands: the existing phase rule, plus the steps that fit its travel mode. */
export function journeyState(trip: SavedTrip, ticked: ReadonlySet<string>, today: string, lang: MagicLang): JourneyState {
  const { phase, daysUntilDeparture } = computeTravelPhase(trip, today);
  const steps = [...ALWAYS, ...modeSteps(trip.modeTransport)].map((id) => ({ id, label: STEP_LABEL[id][lang], done: ticked.has(id) }));
  return { phase, daysUntilDeparture, steps, done: steps.filter((s) => s.done).length, next: steps.find((s) => !s.done) };
}

/** Magic Button actions the user's own ticks already cover. */
export function doneActions(ticked: ReadonlySet<string>, mode: SavedTrip['modeTransport']): MagicActionKind[] {
  const done: MagicActionKind[] = [];
  if (ticked.has('flight-ticket')) done.push('flight');
  const papers = ['passport', 'insurance', ...(mode === 'car' || mode === 'mixed' ? ['cnr', 'driver-license'] : [])];
  if (papers.every((id) => ticked.has(id))) done.push('papers');
  return done;
}
