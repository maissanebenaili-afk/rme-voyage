import { describe, expect, it } from 'vitest';
import { __test__ } from '@/components/RmeNowCard';

describe('RmeNowCard state', () => {
  it('asks for a plan when no trip exists', () => {
    expect(__test__.buildState(false, 'mon-voyage', null, false, '', '').title).toBe('On prépare quoi, maintenant ?');
  });

  it('prioritizes the ferry transition on departure day', () => {
    const state = __test__.buildState(true, 'route', 0, true, 'Paris', 'Tanger');
    expect(state.title).toBe('Votre passage vers le Maroc');
    expect(state.actions.some((action) => action.href === '#booking-title')).toBe(true);
  });
  it('asks for a date when a trip exists without a departure date', () => {
    const state = __test__.buildState(true, 'mon-voyage', null, false, 'Paris', 'Tanger');
    expect(state.title).toBe('Paris → Tanger');
    expect(state.actions[0].label).toBe('Définir ma date');
  });

});
