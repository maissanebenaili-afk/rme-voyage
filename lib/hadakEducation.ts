/** Hadak Education — Lot E.1 domain contract. No provider calls or UI. */
export type EducationMode = 'UNDERSTAND' | 'LEARN' | 'REVISE' | 'PRACTICE';
export type EducationLevel = 'PRIMARY' | 'COLLEGE' | 'LYCEE' | 'UNIVERSITY' | 'ADULT';
export type EducationRequest = { mode: EducationMode; level?: EducationLevel; subject?: string; language: string; prompt: string };
export type EducationPlan = { mode: EducationMode; level?: EducationLevel; subject?: string; language: string; prompt: string; instruction: string; requiresStepByStep: boolean; shouldAvoidDoingHomeworkVerbatim: boolean };
const MODE_INSTRUCTIONS: Record<EducationMode, string> = {
  UNDERSTAND: 'Explain the concept clearly, with a simple example and a short check for understanding.',
  LEARN: 'Teach progressively: concept, example, then a small question to verify understanding.',
  REVISE: 'Produce a concise revision structure with key ideas, definitions and recall questions.',
  PRACTICE: 'Guide the learner through practice, giving hints before a complete solution.',
};
export function buildEducationPlan(request: EducationRequest): EducationPlan {
  if (!request.prompt.trim()) throw new Error('Education prompt is required');
  if (!request.language.trim()) throw new Error('Education language is required');
  return { ...request, prompt: request.prompt.trim(), language: request.language.trim(), instruction: MODE_INSTRUCTIONS[request.mode], requiresStepByStep: true, shouldAvoidDoingHomeworkVerbatim: true };
}
export function isEducationMode(value: string): value is EducationMode { return ['UNDERSTAND','LEARN','REVISE','PRACTICE'].includes(value); }