// Types for core.mjs, so TypeScript tests can import it.
export type Scenario = {
  id: string;
  family: 'truth' | 'action' | 'function' | 'ux' | 'commercial';
  kind: 'hadak' | 'api' | 'page' | 'browser';
  [key: string]: unknown;
};
export type Corpus = { forbiddenEverywhere?: Array<{ re: string; why: string }>; scenarios: Scenario[] };
export type Observed = { status?: number; text?: string; source?: string; json?: Record<string, unknown> | null; failures?: string[] };
export type Result = { id: string; family: string; verdict: 'PASS' | 'FAIL' | 'SKIPPED'; failures: string[]; metrics?: Record<string, unknown> };
export type Run = { label: string; base: string; at: string; pass: number; fail: number; skipped: number; families: Record<string, { PASS: number; FAIL: number; SKIPPED: number }>; results: Result[] };
export function loadCorpus(file?: string): Corpus;
export function checkInvariants(scenario: Scenario | undefined, observed: Observed, corpus: Corpus): string[];
export function visibleText(html: string): string;
export function runForge(options: { base: string; label?: string; browser?: boolean; corpus?: Corpus; only?: string[] }): Promise<Run>;
export function toMarkdown(run: Run, previous?: { label: string; results: Array<{ id: string; verdict: string }> }): string;
