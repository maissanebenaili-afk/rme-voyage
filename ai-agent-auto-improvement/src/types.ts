/**
 * Core data model for the auto-improvement loop.
 *
 * The loop treats the target AI as a versioned document (system prompt +
 * knowledge entries), not as opaque model weights. That keeps every change
 * auditable: a "version" is a JSON snapshot, a "patch" is a diff with a
 * reason and evidence, and history.json is a full changelog.
 */

export interface KnowledgeEntry {
  id: string;
  keywords: string[];
  content: string;
  lastVerified?: string;
}

export interface AgentVersion {
  id: string;
  parentId: string | null;
  createdAt: string;
  systemPrompt: string;
  fallbackResponse: string;
  knowledge: KnowledgeEntry[];
}

export interface TestCase {
  id: string;
  query: string;
  /** Substrings (case-insensitive) the response must contain to be considered correct. */
  mustInclude: string[];
}

export interface EvalResult {
  testCaseId: string;
  query: string;
  response: string;
  matchedEntryId: string | null;
  score: number;
  passed: boolean;
}

export interface EvaluationSummary {
  versionId: string;
  results: EvalResult[];
  averageScore: number;
  passRate: number;
}

/** A single fact pulled from an external ("global data") source. */
export interface GlobalDataFact {
  id: string;
  topic: string;
  statement: string;
  value?: number;
  unit?: string;
  fetchedAt: string;
  sourceUrl: string;
  sourceName: string;
}

export type Patch =
  | {
      kind: 'update_entry';
      entryId: string;
      newContent: string;
      reason: string;
      evidence: GlobalDataFact;
    }
  | {
      kind: 'add_entry';
      entry: KnowledgeEntry;
      reason: string;
    };

export interface CycleLogEntry {
  cycleId: string;
  timestamp: string;
  baselineVersionId: string;
  candidateVersionId: string;
  accepted: boolean;
  baselineScore: number;
  candidateScore: number;
  patches: Patch[];
  notes: string[];
}
