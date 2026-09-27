/** Hadak Education — Lot E.1 domain contract. No provider calls or UI. */

export type EducationMode = 'UNDERSTAND' | 'LEARN' | 'REVISE' | 'PRACTICE' | 'SOLVE' | 'EXAM_PREP';
export type EducationLevel =
  | 'PRIMARY_1_2' | 'PRIMARY_3_5'
  | 'COLLEGE_6E_5E' | 'COLLEGE_4E_3E'
  | 'LYCEE_2NDE' | 'LYCEE_1ERE' | 'LYCEE_TERMINALE'
  | 'UNIVERSITY' | 'ADULT';
export type EducationLanguage = 'fr' | 'en' | 'es' | 'it' | 'nl' | 'ar' | 'darija';
export type EducationRequest = {
  mode: EducationMode;
  level?: EducationLevel;
  subject?: string;
  language: string;
  prompt: string;
  wantsFullSolution?: boolean;
};

export type EducationPlan = EducationRequest & {
  instruction: string;
  requiresStepByStep: boolean;
  canProvideFullSolution: boolean;
  solutionPolicy: 'GUIDED_FIRST' | 'FULL_SOLUTION_ALLOWED';
};

const MODE_INSTRUCTIONS: Record<EducationMode, string> = {
  UNDERSTAND: 'Explain the concept clearly, adapt vocabulary to the learner level, give an example, then check understanding.',
  LEARN: 'Teach progressively: prerequisite, concept, worked example, then a short question to verify understanding.',
  REVISE: 'Build a concise revision sheet with key ideas, definitions, formulas or methods, common traps and recall questions.',
  PRACTICE: 'Give exercises adapted to the level; provide hints progressively before revealing the complete solution.',
  SOLVE: 'Solve the exercise step by step, showing the reasoning and mechanism so the learner can reproduce the method.',
  EXAM_PREP: 'Prepare for an exam with a targeted revision plan, representative exercises, timed practice and step-by-step corrections.',
};

export function buildEducationPlan(request: EducationRequest): EducationPlan {
  if (!request.prompt.trim()) throw new Error('Education prompt is required');
  if (!request.language.trim()) throw new Error('Education language is required');
  const wantsFullSolution = request.wantsFullSolution === true || request.mode === 'SOLVE';
  return {
    ...request,
    prompt: request.prompt.trim(),
    language: request.language.trim(),
    instruction: MODE_INSTRUCTIONS[request.mode],
    requiresStepByStep: true,
    canProvideFullSolution: true,
    solutionPolicy: wantsFullSolution ? 'FULL_SOLUTION_ALLOWED' : 'GUIDED_FIRST',
  };
}

export function isEducationMode(value: string): value is EducationMode {
  return ['UNDERSTAND', 'LEARN', 'REVISE', 'PRACTICE', 'SOLVE', 'EXAM_PREP'].includes(value);
}
