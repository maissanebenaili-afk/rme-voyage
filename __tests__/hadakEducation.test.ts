import { buildEducationPlan, isEducationLanguage, isEducationMode, type EducationLevel, type EducationMode } from '../lib/hadakEducation';

const MODES: EducationMode[] = ['UNDERSTAND', 'LEARN', 'REVISE', 'PRACTICE', 'SOLVE', 'EXAM_PREP'];
const LEVELS: EducationLevel[] = ['PRIMARY_1_2', 'PRIMARY_3_5', 'COLLEGE_6E_5E', 'COLLEGE_4E_3E', 'LYCEE_2NDE', 'LYCEE_1ERE', 'LYCEE_TERMINALE', 'UNIVERSITY', 'ADULT'];

describe('LOT E.1 — Hadak Education contract', () => {
  it('gives each mode its own instruction', () => {
    const instructions = MODES.map((mode) => buildEducationPlan({ mode, level: 'LYCEE_1ERE', language: 'fr', prompt: 'x' }).instruction);
    expect(new Set(instructions).size).toBe(MODES.length);
  });

  it('adapts the instruction to every level', () => {
    const instructions = LEVELS.map((level) => buildEducationPlan({ mode: 'UNDERSTAND', level, language: 'fr', prompt: 'Explique les fractions' }).instruction);
    expect(new Set(instructions).size).toBe(LEVELS.length);
    expect(instructions[0]).toMatch(/6 to 8 years old/);
    expect(instructions[6]).toMatch(/bac/);
  });

  it('asks for the level when it is unknown', () => {
    expect(buildEducationPlan({ mode: 'LEARN', language: 'fr', prompt: 'x' }).instruction).toMatch(/level is unknown/);
  });

  it('solves step by step in SOLVE and EXAM_PREP', () => {
    for (const mode of ['SOLVE', 'EXAM_PREP'] as const) {
      const plan = buildEducationPlan({ mode, level: 'LYCEE_TERMINALE', language: 'fr', prompt: 'Résous cet exercice' });
      expect(plan.solutionPolicy).toBe('FULL_SOLUTION');
      expect(plan.instruction).toMatch(/complete solution step by step/);
    }
  });

  it('gives hints first in PRACTICE, and the full solution when the learner asks for it', () => {
    expect(buildEducationPlan({ mode: 'PRACTICE', language: 'fr', prompt: 'exercice' }).solutionPolicy).toBe('HINTS_FIRST');
    expect(buildEducationPlan({ mode: 'PRACTICE', language: 'fr', prompt: 'exercice', wantsFullSolution: true }).solutionPolicy).toBe('FULL_SOLUTION');
  });

  it('uses the Hadak language codes and names the answer language', () => {
    expect(buildEducationPlan({ mode: 'LEARN', language: 'da', prompt: 'x' }).instruction).toMatch(/Darija/);
    expect(isEducationLanguage('darija')).toBe(false);
    expect(() => buildEducationPlan({ mode: 'LEARN', language: 'it', prompt: 'x' })).toThrow(/Unsupported/);
  });

  it('recognises modes without trusting prototype keys', () => {
    expect(isEducationMode('SOLVE')).toBe(true);
    expect(isEducationMode('UNKNOWN')).toBe(false);
    expect(isEducationMode('constructor')).toBe(false);
  });

  it('trims learner input and rejects empty fields', () => {
    const plan = buildEducationPlan({ mode: 'PRACTICE', language: ' fr ', prompt: '  exercice  ' });
    expect(plan.language).toBe('fr');
    expect(plan.prompt).toBe('exercice');
    expect(() => buildEducationPlan({ mode: 'LEARN', language: 'fr', prompt: ' ' })).toThrow();
    expect(() => buildEducationPlan({ mode: 'LEARN', language: ' ', prompt: 'test' })).toThrow();
  });
});
