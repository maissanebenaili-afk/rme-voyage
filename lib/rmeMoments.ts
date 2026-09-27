/**
 * RME Context Engine — Moment foundation. No network, provider or transaction
 * side effects: a Moment describes a situation and proposes actions; it never
 * runs them. Every action may be shown; running one is the caller's job, after
 * the user confirms when `safety` says so.
 */
import { newId, type IdGenerator } from '@/lib/ids';
import { isHttpUrl } from '@/lib/trust';

export type MomentPhase = 'BEFORE' | 'NOW' | 'AFTER';
/** INFORMATIONAL: opening it changes nothing. USER_CONFIRMATION_REQUIRED: it leads to a booking, payment or sending. */
export type ActionSafety = 'INFORMATIONAL' | 'USER_CONFIRMATION_REQUIRED';
/** EXPLICIT: said by the user. DETECTED: read from their words. INFERRED: deduced by RME. */
export type IntentConfidence = 'EXPLICIT' | 'DETECTED' | 'INFERRED';

export type RmeIntent = {
  id: string;
  label: string;
  confidence: IntentConfidence;
  goal?: string;
  constraints?: string[];
};

export type NextAction = {
  id: string;
  label: string;
  reason: string;
  safety: ActionSafety;
  /** Where the action leads: an in-app path ("/ferry") or an http(s) link. */
  destination?: string;
};

export type RmeMoment = {
  id: string;
  title: string;
  phase: MomentPhase;
  intent: RmeIntent;
  actions: NextAction[];
  /** When RME built the Moment. */
  createdAt: string;
  /** After this, the Moment should no longer be shown. */
  expiresAt?: string;
};

function isValidDestination(value: string): boolean {
  return (value.startsWith('/') && !value.startsWith('//')) || isHttpUrl(value);
}

export function createMoment(input: Omit<RmeMoment, 'id'>, options: { newId?: IdGenerator } = {}): RmeMoment {
  if (!input.title.trim()) throw new Error('Moment title is required');
  if (!input.intent.label.trim()) throw new Error('Intent label is required');
  if (!input.actions.length) throw new Error('Moment requires at least one action');
  const created = Date.parse(input.createdAt);
  if (!input.createdAt || Number.isNaN(created)) throw new Error('Valid createdAt is required');
  if (input.expiresAt !== undefined) {
    const expires = Date.parse(input.expiresAt);
    if (Number.isNaN(expires) || expires <= created) throw new Error('expiresAt must be a valid date after createdAt');
  }
  for (const action of input.actions) {
    if (!action.label.trim() || !action.reason.trim()) throw new Error('Action label and reason are required');
    if (action.safety === 'USER_CONFIRMATION_REQUIRED' && !action.destination) {
      throw new Error('Confirmable action requires a destination');
    }
    if (action.destination !== undefined && !isValidDestination(action.destination)) {
      throw new Error('Action destination must be an in-app path or an http(s) link');
    }
  }
  return { ...input, id: (options.newId ?? newId)() };
}

export function getNextAction(moment: RmeMoment): NextAction {
  return moment.actions[0];
}

/** True only for actions that can be opened without asking the user first. Showing an action is always allowed. */
export function canRunWithoutConfirmation(action: NextAction): boolean {
  return action.safety === 'INFORMATIONAL';
}
