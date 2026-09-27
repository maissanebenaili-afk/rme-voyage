/** RME Context Engine — Moment foundation. No network, provider or transaction side effects. */

export type MomentPhase = 'BEFORE' | 'NOW' | 'AFTER';
export type ActionSafety = 'INFORMATIONAL' | 'USER_CONFIRMATION_REQUIRED';
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
  destination?: string;
};

export type RmeMoment = {
  id: string;
  title: string;
  phase: MomentPhase;
  intent: RmeIntent;
  actions: NextAction[];
  createdAt: string;
  expiresAt?: string;
};

export function createMoment(input: Omit<RmeMoment, 'id'>): RmeMoment {
  if (!input.title.trim()) throw new Error('Moment title is required');
  if (!input.intent.label.trim()) throw new Error('Intent label is required');
  if (!input.actions.length) throw new Error('Moment requires at least one action');
  if (!input.createdAt || Number.isNaN(Date.parse(input.createdAt))) throw new Error('Valid createdAt is required');
  for (const action of input.actions) {
    if (!action.label.trim() || !action.reason.trim()) throw new Error('Action label and reason are required');
    if (action.safety === 'USER_CONFIRMATION_REQUIRED' && !action.destination) {
      throw new Error('Confirmable action requires a destination');
    }
  }
  return { ...input, id: crypto.randomUUID() };
}

export function getNextAction(moment: RmeMoment): NextAction {
  return moment.actions[0];
}

export function isActionSafeToAutoPresent(action: NextAction): boolean {
  return action.safety === 'INFORMATIONAL';
}
