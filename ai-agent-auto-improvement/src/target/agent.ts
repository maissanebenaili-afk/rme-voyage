import type { AgentVersion, KnowledgeEntry } from '../types.js';

export interface AgentResponse {
  content: string;
  matchedEntryId: string | null;
}

/**
 * The "target AI" being improved: a keyword-routed knowledge base.
 * Deliberately simple and pluggable — swap this class for a real RAG/LLM
 * agent and the rest of the loop (eval, analyze, propose, apply) is unchanged
 * as long as it still exposes an AgentVersion-shaped knowledge base.
 */
export class PromptKnowledgeAgent {
  constructor(private readonly version: AgentVersion) {}

  respond(query: string): AgentResponse {
    const q = query.toLowerCase();
    let best: { entry: KnowledgeEntry; score: number } | null = null;

    for (const entry of this.version.knowledge) {
      let score = 0;
      for (const kw of entry.keywords) {
        if (q.includes(kw.toLowerCase())) score += kw.length;
      }
      if (score > 0 && (!best || score > best.score)) {
        best = { entry, score };
      }
    }

    if (best) {
      return { content: best.entry.content, matchedEntryId: best.entry.id };
    }
    return { content: this.version.fallbackResponse, matchedEntryId: null };
  }
}
