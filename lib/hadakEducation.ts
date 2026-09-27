/** Hadak Education — Lot E.1 domain contract. No provider calls or UI. */

export type EducationMode = 'UNDERSTAND' | 'LEARN' | 'REVISE' | 'PRACTICE' | 'SOLVE' | 'EXAM_PREP';
export type EducationLevel =
  | 'PRIMARY_1_2' | 'PRIMARY_3_5'
  | 'COLLEGE_6E_5E' | 'COLLEGE_4E_3E'
  | 'LYCEE_2NDE' | 'LYCEE_1ERE' | 'LYCEE_TERMINALE'
  | 'UNIVERSITY' | 'ADULT';
/** Same codes as the Hadak route. */
export type EducationLanguage = 'fr' | 'da' | 'en' | 'ar' | 'es';
export type SolutionPolicy = 'HINTS_FIRST' | 'FULL_SOLUTION';

export type EducationRequest = {
  mode: EducationMode;
  level?: EducationLevel;
  subject?: string;
  language: string;
  prompt: string;
  wantsFullSolution?: boolean;
};

export type EducationPlan = Omit<EducationRequest, 'language'> & {
  language: EducationLanguage;
  instruction: string;
  solutionPolicy: SolutionPolicy;
};

const MODE_INSTRUCTIONS: Record<EducationMode, string> = {
  UNDERSTAND: 'Explain the concept clearly, give one example, then check understanding with a question.',
  LEARN: 'Teach progressively: prerequisite, concept, worked example, then a short question to verify understanding.',
  REVISE: 'Build a concise revision sheet: key ideas, definitions, formulas or methods, common traps and recall questions.',
  PRACTICE: 'Give exercises adapted to the level, one at a time.',
  SOLVE: 'Solve the exercise.',
  EXAM_PREP: 'Prepare for the exam: targeted revision plan, representative exercises and timed practice.',
};

const LEVEL_GUIDANCE: Record<EducationLevel, string> = {
  PRIMARY_1_2: 'The learner is 6 to 8 years old: very short sentences, everyday words, concrete things to see or count, no notation they have not learned yet.',
  PRIMARY_3_5: 'The learner is 8 to 11 years old: simple sentences, one idea at a time, familiar examples, define each new word.',
  COLLEGE_6E_5E: 'The learner is in 6e or 5e (11 to 13): clear steps, school vocabulary defined on first use, examples from daily life.',
  COLLEGE_4E_3E: 'The learner is in 4e or 3e (13 to 15), towards the brevet: precise vocabulary, method they can reuse, brevet-style examples.',
  LYCEE_2NDE: 'The learner is in seconde: rigorous definitions, justify each step, connect to the collège basics.',
  LYCEE_1ERE: 'The learner is in première: rigorous reasoning, formal notation, examples in the style of the bac specialities.',
  LYCEE_TERMINALE: 'The learner is in terminale, towards the bac: full rigour, bac-style exercises, point out what earns marks.',
  UNIVERSITY: 'The learner is at university: formal and complete, cite the underlying theory, assume secondary-school knowledge.',
  ADULT: 'The learner is an adult returning to the subject: plain language, practical examples, no school jargon without explanation.',
};

const UNKNOWN_LEVEL = 'The level is unknown: start simple and ask one short question about the learner\'s level before going deeper.';

const LANGUAGE_NAMES: Record<EducationLanguage, string> = {
  fr: 'French',
  da: 'Moroccan Darija, in Latin script as Moroccans write it',
  en: 'English',
  ar: 'Modern Standard Arabic',
  es: 'Spanish',
};

const SOLUTION_INSTRUCTIONS: Record<SolutionPolicy, string> = {
  HINTS_FIRST: 'Give hints one at a time and let the learner try; reveal the complete solution only when asked.',
  FULL_SOLUTION: 'Give the complete solution step by step, showing the reasoning at each step so the learner can reproduce the method.',
};

export function isEducationMode(value: string): value is EducationMode {
  return Object.hasOwn(MODE_INSTRUCTIONS, value);
}

export function isEducationLevel(value: string): value is EducationLevel {
  return Object.hasOwn(LEVEL_GUIDANCE, value);
}

export function isEducationLanguage(value: string): value is EducationLanguage {
  return Object.hasOwn(LANGUAGE_NAMES, value);
}

function solutionPolicyFor(mode: EducationMode, wantsFullSolution: boolean): SolutionPolicy {
  if (mode === 'SOLVE' || mode === 'EXAM_PREP' || wantsFullSolution) return 'FULL_SOLUTION';
  return 'HINTS_FIRST';
}

export function buildEducationPlan(request: EducationRequest): EducationPlan {
  const prompt = request.prompt.trim();
  const language = request.language.trim();
  if (!prompt) throw new Error('Education prompt is required');
  if (!isEducationLanguage(language)) throw new Error(`Unsupported education language: ${language || '(empty)'}`);

  const solutionPolicy = solutionPolicyFor(request.mode, request.wantsFullSolution === true);
  const instruction = [
    MODE_INSTRUCTIONS[request.mode],
    request.level ? LEVEL_GUIDANCE[request.level] : UNKNOWN_LEVEL,
    SOLUTION_INSTRUCTIONS[solutionPolicy],
    `Answer in ${LANGUAGE_NAMES[language]}.`,
  ].join(' ');

  return { ...request, prompt, language, instruction, solutionPolicy };
}
