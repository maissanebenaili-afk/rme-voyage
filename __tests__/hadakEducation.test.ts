import { buildEducationPlan, isEducationMode } from '../lib/hadakEducation';

describe('LOT E.1 — Hadak Education contract', () => {
  it('builds an understand plan for terminale', () => {
    const p = buildEducationPlan({ mode:'UNDERSTAND', level:'LYCEE_TERMINALE', subject:'maths', language:'fr', prompt:'Explique les probabilités' });
    expect(p.requiresStepByStep).toBe(true);
    expect(p.canProvideFullSolution).toBe(true);
    expect(p.solutionPolicy).toBe('GUIDED_FIRST');
  });

  it('supports the expanded school levels and modes', () => {
    expect(isEducationMode('SOLVE')).toBe(true);
    expect(isEducationMode('EXAM_PREP')).toBe(true);
    expect(isEducationMode('UNKNOWN')).toBe(false);
  });

  it('allows a complete step-by-step solution when explicitly requested', () => {
    const p = buildEducationPlan({ mode:'SOLVE', level:'LYCEE_TERMINALE', language:'fr', prompt:'Résous cet exercice', wantsFullSolution:true });
    expect(p.solutionPolicy).toBe('FULL_SOLUTION_ALLOWED');
    expect(p.canProvideFullSolution).toBe(true);
    expect(p.requiresStepByStep).toBe(true);
  });

  it('supports exam preparation', () => {
    const p = buildEducationPlan({ mode:'EXAM_PREP', level:'LYCEE_1ERE', language:'fr', prompt:'Prépare-moi pour mon examen' });
    expect(p.instruction).toContain('revision');
  });

  it('trims learner input and rejects empty fields', () => {
    const p=buildEducationPlan({mode:'PRACTICE',language:' fr ',prompt:'  exercice  '});
    expect(p.language).toBe('fr');
    expect(p.prompt).toBe('exercice');
    expect(() => buildEducationPlan({mode:'LEARN',language:'fr',prompt:' '})).toThrow();
    expect(() => buildEducationPlan({mode:'LEARN',language:' ',prompt:'test'})).toThrow();
  });
});
