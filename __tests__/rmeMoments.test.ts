import { canRunWithoutConfirmation, createMoment, getNextAction } from '../lib/rmeMoments';

describe('LOT E.3 — Context / Moment foundation', () => {
  const base = {
    title: 'Préparer mon départ au Maroc',
    phase: 'BEFORE' as const,
    intent: { id: 'i1', label: 'Voyage au Maroc', confidence: 'EXPLICIT' as const, goal: 'Arriver préparé', constraints: ['vendredi'] },
    actions: [
      { id: 'a1', label: 'Vérifier les documents', reason: 'Le départ approche', safety: 'INFORMATIONAL' as const },
      { id: 'a2', label: 'Voir les options de transport', reason: 'Préparer le trajet', safety: 'USER_CONFIRMATION_REQUIRED' as const, destination: '/ferry' },
    ],
    createdAt: '2026-09-27T00:00:00Z',
  };
  const fixedId = { newId: () => 'm-1' };

  it('creates a moment with a system-assigned id', () => {
    const m = createMoment(base, fixedId);
    expect(m.id).toBe('m-1');
    expect(m.title).toContain('départ');
  });

  it('generates an id without any mock when none is supplied', () => {
    expect(createMoment(base).id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('proposes the next action without running it', () => {
    const next = getNextAction(createMoment(base, fixedId));
    expect(next.id).toBe('a1');
    expect(canRunWithoutConfirmation(next)).toBe(true);
  });

  it('can show an action that needs confirmation, but never runs it without one', () => {
    const m = createMoment({ ...base, actions: [base.actions[1]] }, fixedId);
    expect(getNextAction(m).label).toBe('Voir les options de transport');
    expect(canRunWithoutConfirmation(getNextAction(m))).toBe(false);
  });

  it('requires a valid destination for confirmable actions', () => {
    expect(() => createMoment({ ...base, actions: [{ ...base.actions[1], destination: undefined }] })).toThrow('requires a destination');
    for (const destination of ['javascript:alert(1)', '//evil.example', 'ferry']) {
      expect(() => createMoment({ ...base, actions: [{ ...base.actions[1], destination }] })).toThrow('in-app path or an http(s) link');
    }
    expect(createMoment({ ...base, actions: [{ ...base.actions[1], destination: 'https://www.directferries.fr' }] }, fixedId).actions[0].destination).toContain('https://');
  });

  it('rejects empty moments and invalid timestamps', () => {
    expect(() => createMoment({ ...base, actions: [] })).toThrow();
    expect(() => createMoment({ ...base, createdAt: 'bad' })).toThrow();
    expect(() => createMoment({ ...base, expiresAt: '2026-09-26T00:00:00Z' })).toThrow('expiresAt');
    expect(createMoment({ ...base, expiresAt: '2026-10-09T00:00:00Z' }, fixedId).expiresAt).toBe('2026-10-09T00:00:00Z');
  });

  it('keeps explicit, detected and inferred intent distinct', () => {
    expect(createMoment({ ...base, intent: { ...base.intent, confidence: 'DETECTED' } }, fixedId).intent.confidence).toBe('DETECTED');
    expect(createMoment({ ...base, intent: { ...base.intent, confidence: 'INFERRED' } }, fixedId).intent.confidence).toBe('INFERRED');
  });
});
