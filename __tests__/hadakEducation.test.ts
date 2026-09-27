import { buildEducationPlan, isEducationMode } from '../lib/hadakEducation';
describe('LOT E.1 — Hadak Education contract', () => {
  it('builds an understand plan without calling a provider', () => { const p = buildEducationPlan({ mode:'UNDERSTAND', level:'LYCEE', subject:'maths', language:'fr', prompt:'Explique les probabilités' }); expect(p.requiresStepByStep).toBe(true); expect(p.shouldAvoidDoingHomeworkVerbatim).toBe(true); expect(p.instruction).toContain('concept'); });
  it('supports the four MVP modes', () => { expect(isEducationMode('UNDERSTAND')).toBe(true); expect(isEducationMode('LEARN')).toBe(true); expect(isEducationMode('REVISE')).toBe(true); expect(isEducationMode('PRACTICE')).toBe(true); expect(isEducationMode('UNKNOWN')).toBe(false); });
  it('trims learner input', () => { const p=buildEducationPlan({mode:'PRACTICE',language:' fr ',prompt:'  exercice  '}); expect(p.language).toBe('fr'); expect(p.prompt).toBe('exercice'); });
  it('rejects empty prompt or language', () => { expect(() => buildEducationPlan({mode:'LEARN',language:'fr',prompt:' '})).toThrow(); expect(() => buildEducationPlan({mode:'LEARN',language:' ',prompt:'test'})).toThrow(); });
});