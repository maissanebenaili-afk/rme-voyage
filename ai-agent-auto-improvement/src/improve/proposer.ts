import type { KnowledgeEntry } from '../types.js';

export interface Proposer {
  readonly enabled: boolean;
  proposeEntry(query: string, existingTopics: string[]): Promise<KnowledgeEntry>;
}

/** Default when no API key is configured — refuses to fabricate content. */
export class NullProposer implements Proposer {
  readonly enabled = false;

  async proposeEntry(): Promise<KnowledgeEntry> {
    throw new Error('LLM proposer disabled — set ANTHROPIC_API_KEY to enable coverage-gap drafting.');
  }
}

/** Drafts a knowledge entry for a failing query via the Anthropic Messages API. */
export class AnthropicProposer implements Proposer {
  readonly enabled = true;

  constructor(
    private readonly apiKey: string,
    private readonly model: string = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
  ) {}

  async proposeEntry(query: string, existingTopics: string[]): Promise<KnowledgeEntry> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 400,
        messages: [
          {
            role: 'user',
            content:
              `Draft a concise, factual knowledge-base entry (2-3 sentences, no speculation, ` +
              `no filler) that answers this travel-assistant user question: "${query}". ` +
              `Topics already covered: ${existingTopics.join(', ') || 'none'}. ` +
              `Reply with ONLY the answer text, no preamble.`,
          },
        ],
      }),
    });

    if (!res.ok) {
      throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
    }

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((c) => c.type === 'text')?.text?.trim();
    if (!text) throw new Error('Empty proposer response');

    return {
      id: `auto-${Date.now()}`,
      keywords: extractKeywords(query),
      content: text,
      lastVerified: new Date().toISOString(),
    };
  }
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'do', 'does', 'what', 'how', 'i', 'to', 'for', 'of', 'in', 'on',
  'le', 'la', 'les', 'de', 'du', 'des', 'est', 'ce', 'que', 'qu', 'qui', 'quoi', 'comment',
]);

function extractKeywords(query: string): string[] {
  const words = query
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
  return Array.from(new Set(words));
}
