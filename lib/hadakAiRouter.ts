/**
 * Hadak AI Router — Lot B
 *
 * Scope: provider routing only. No UI, partner, monetisation, or persistence.
 * Serverless note: circuit state is instance-local; inter-instance coherence
 * is deliberately not claimed.
 */

export type ProviderState =
  | 'AVAILABLE'
  | 'DEGRADED'
  | 'RATE_LIMITED'
  | 'QUOTA_EXHAUSTED'
  | 'AUTH_ERROR'
  | 'TIMEOUT'
  | 'PROVIDER_ERROR'
  | 'CIRCUIT_OPEN'
  | 'DISABLED';

export type ResolutionType =
  | 'FREE_PROVIDER'
  | 'PAID_PROVIDER'
  | 'DETERMINISTIC_LOCAL'
  | 'CACHE'
  | 'EXTERNAL_DATA'
  | 'OFFLINE_FALLBACK';

export type CostBasis = 'free_plan' | 'list_price_estimate' | 'none';

export type LedgerEntry = {
  request_id: string;
  provider: string | null;
  model?: string;
  resolution_type: ResolutionType;
  latency_ms: number;
  tokens_input: number;
  tokens_output: number;
  /** 'provider' = counted by the provider's `usage`; 'estimated' = characters / 4. */
  tokens_source: 'provider' | 'estimated' | 'none';
  /** USD. For a paid provider this is tokens × public list price, never an invoice. */
  estimated_cost: number;
  /** USD, set only when the price is known for certain: 0 on a free plan. Absent means unknown. */
  actual_cost?: number;
  cost_basis: CostBasis;
  error_class?: string;
};

export type LedgerSummary = {
  requests: number;
  by_resolution: Partial<Record<ResolutionType, number>>;
  answered_without_llm: number;
  answered_without_llm_share: number | null;
  provider_tokens: Record<string, { input: number; output: number }>;
  estimated_cost_usd: number;
  unknown_cost_entries: number;
};

// Public list prices in USD per 1M tokens, checked 2026-09-26 (OpenAI model page,
// Anthropic pricing). Only used to estimate paid calls; blocked while AI_ROUTER_FREE_ONLY=true.
const LIST_PRICE_PER_MTOK: Record<string, { input: number; output: number }> = {
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'claude-haiku-4-5-20251001': { input: 1, output: 5 },
};

type Provider = {
  id: string;
  freeTier: boolean;
  baseUrl: string;
  model: string | string[];
  kind: 'openai-compatible' | 'anthropic';
  getKey: () => string | undefined;
};

type ProviderRuntime = {
  state: ProviderState;
  failures: number;
  cooldownUntil: number;
};

type RouteOptions = {
  message: string;
  systemPrompt: string;
  requestId?: string;
  /** Default 512; a step-by-step correction needs more room. */
  maxTokens?: number;
};

type RouteResult = {
  text: string | null;
  provider: string | null;
  resolutionType: ResolutionType;
  requestId: string;
};

const BASE_COOLDOWN_MS = 30_000;
const MAX_COOLDOWN_MS = 5 * 60_000;
const FAILURE_THRESHOLD = 2;
const REQUEST_TIMEOUT_MS = 8_000;
const LEDGER_MAX_ENTRIES = 256;

const runtime = new Map<string, ProviderRuntime>();
const ledger: LedgerEntry[] = [];

function envFlag(name: string): boolean {
  return String(process.env[name] ?? '').toLowerCase() === 'true';
}

export function isFreeOnly(): boolean {
  return envFlag('AI_ROUTER_FREE_ONLY');
}

function providers(): Provider[] {
  return [
    {
      id: 'groq',
      freeTier: true,
      baseUrl: 'https://api.groq.com/openai/v1',
      // gpt-oss-20b is listed in Groq's Free Plan Limits (2026-09-26). The others
      // stay as fallbacks: this account got a 404 on a documented Groq model.
      model: ['openai/gpt-oss-20b', 'llama-3.3-70b-versatile', 'llama-3.1-8b-instant'],
      kind: 'openai-compatible',
      getKey: () => process.env.GROQ_API_KEY,
    },
    {
      id: 'gemini',
      freeTier: true,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
      // gemini-3.8-flash is the model Google's API named for this key and it
      // answered in production; the documented free-tier models follow it.
      model: ['gemini-3.8-flash', 'gemini-3-flash-preview', 'gemini-3.1-flash-lite'],
      kind: 'openai-compatible',
      getKey: () => process.env.GEMINI_API_KEY,
    },
    {
      // Verified 2026-09-26: OpenRouter free-model router is $0, with a free-account daily request cap.
      id: 'openrouter',
      freeTier: true,
      baseUrl: 'https://openrouter.ai/api/v1',
      model: 'openrouter/free',
      kind: 'openai-compatible',
      getKey: () => process.env.OPENROUTER_API_KEY,
    },
    {
      id: 'openai',
      freeTier: false,
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-4o-mini',
      kind: 'openai-compatible',
      getKey: () => process.env.OPENAI_API_KEY,
    },
    {
      id: 'anthropic',
      freeTier: false,
      baseUrl: 'https://api.anthropic.com/v1',
      model: 'claude-haiku-4-5-20251001',
      kind: 'anthropic',
      getKey: () => process.env.ANTHROPIC_API_KEY,
    },
  ];
}

function runtimeFor(id: string): ProviderRuntime {
  const existing = runtime.get(id);
  if (existing) return existing;
  const fresh = { state: 'AVAILABLE' as ProviderState, failures: 0, cooldownUntil: 0 };
  runtime.set(id, fresh);
  return fresh;
}

function requestId(): string {
  return `hadak-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

type Usage = { input: number; output: number };

function readUsage(data: unknown): Usage | null {
  const usage = (data as { usage?: Record<string, unknown> } | null)?.usage;
  if (!usage) return null;
  const input = usage.prompt_tokens ?? usage.input_tokens;
  const output = usage.completion_tokens ?? usage.output_tokens;
  return typeof input === 'number' && typeof output === 'number' ? { input, output } : null;
}

function costFor(provider: Provider, model: string, tokens: Usage): Pick<LedgerEntry, 'estimated_cost' | 'actual_cost' | 'cost_basis'> {
  if (provider.freeTier) return { estimated_cost: 0, actual_cost: 0, cost_basis: 'free_plan' };
  const price = LIST_PRICE_PER_MTOK[model];
  if (!price) return { estimated_cost: 0, cost_basis: 'none' };
  const usd = (tokens.input * price.input + tokens.output * price.output) / 1_000_000;
  return { estimated_cost: Number(usd.toFixed(6)), cost_basis: 'list_price_estimate' };
}

// One JSON line per resolution, readable in the Netlify function logs. It never
// carries the question, the answer or a key.
function appendLedger(entry: LedgerEntry): void {
  ledger.push(entry);
  if (ledger.length > LEDGER_MAX_ENTRIES) ledger.splice(0, ledger.length - LEDGER_MAX_ENTRIES);
  console.info(`[hadak-ledger] ${JSON.stringify(entry)}`);
}

export function recordResolution(resolutionType: 'DETERMINISTIC_LOCAL' | 'CACHE' | 'EXTERNAL_DATA', latencyMs: number): void {
  appendLedger({
    request_id: requestId(),
    provider: null,
    resolution_type: resolutionType,
    latency_ms: latencyMs,
    tokens_input: 0,
    tokens_output: 0,
    tokens_source: 'none',
    estimated_cost: 0,
    actual_cost: 0,
    cost_basis: 'none',
  });
}

export function summarizeLedger(entries: readonly LedgerEntry[] = ledger): LedgerSummary {
  const byResolution: Partial<Record<ResolutionType, number>> = {};
  const providerTokens: Record<string, { input: number; output: number }> = {};
  let estimated = 0;
  let unknown = 0;
  for (const entry of entries) {
    byResolution[entry.resolution_type] = (byResolution[entry.resolution_type] ?? 0) + 1;
    if (entry.provider && (entry.tokens_input || entry.tokens_output)) {
      const t = (providerTokens[entry.provider] ??= { input: 0, output: 0 });
      t.input += entry.tokens_input;
      t.output += entry.tokens_output;
    }
    estimated += entry.estimated_cost;
    if (entry.actual_cost === undefined && !entry.error_class && entry.resolution_type === 'PAID_PROVIDER') unknown += 1;
  }
  const withoutLlm = (byResolution.DETERMINISTIC_LOCAL ?? 0) + (byResolution.CACHE ?? 0) + (byResolution.EXTERNAL_DATA ?? 0);
  // A request ends in exactly one answered or offline entry; provider failures before it are not requests.
  const requests = entries.filter((e) => !e.error_class).length;
  return {
    requests,
    by_resolution: byResolution,
    answered_without_llm: withoutLlm,
    answered_without_llm_share: requests === 0 ? null : Number((withoutLlm / requests).toFixed(4)),
    provider_tokens: providerTokens,
    estimated_cost_usd: Number(estimated.toFixed(6)),
    unknown_cost_entries: unknown,
  };
}

export function getLedgerSnapshot(): readonly LedgerEntry[] {
  return ledger.slice();
}

export function resetRouterForTests(): void {
  runtime.clear();
  ledger.length = 0;
}

export function getProviderHealth(): Record<string, { state: ProviderState; cooldown_until: number | null }> {
  const now = Date.now();
  return Object.fromEntries(
    providers().map((provider) => {
      const state = runtimeFor(provider.id);
      const activeCooldown = state.cooldownUntil > now ? state.cooldownUntil : null;
      if (state.state === 'CIRCUIT_OPEN' && !activeCooldown) {
        state.state = 'AVAILABLE';
        state.failures = 0;
      }
      return [provider.id, { state: state.state, cooldown_until: activeCooldown }];
    }),
  );
}

function classifyStatus(status: number): ProviderState {
  if (status === 401 || status === 403) return 'AUTH_ERROR';
  if (status === 408 || status === 504) return 'TIMEOUT';
  if (status === 429) return 'RATE_LIMITED';
  if (status === 402) return 'QUOTA_EXHAUSTED';
  if (status >= 500) return 'PROVIDER_ERROR';
  return 'DEGRADED';
}

function exponentialCooldownMs(failures: number): number {
  return Math.min(BASE_COOLDOWN_MS * 2 ** Math.max(0, failures - 1), MAX_COOLDOWN_MS);
}

function markFailure(id: string, state: ProviderState, retryAfterMs = 0): void {
  const r = runtimeFor(id);
  r.state = state;
  r.failures += 1;
  const cooldownMs = Math.max(exponentialCooldownMs(r.failures), retryAfterMs);

  if (state === 'RATE_LIMITED' || state === 'QUOTA_EXHAUSTED' || state === 'AUTH_ERROR') {
    r.cooldownUntil = Date.now() + cooldownMs;
    return;
  }
  if (r.failures >= FAILURE_THRESHOLD) {
    r.state = 'CIRCUIT_OPEN';
    r.cooldownUntil = Date.now() + cooldownMs;
  }
}

function markSuccess(id: string): void {
  const r = runtimeFor(id);
  r.state = 'AVAILABLE';
  r.failures = 0;
  r.cooldownUntil = 0;
}

function isEligible(provider: Provider): boolean {
  const key = provider.getKey();
  if (!key) return false;
  if (isFreeOnly() && !provider.freeTier) return false;
  const r = runtimeFor(provider.id);
  if (r.state === 'DISABLED') return false;
  if (r.cooldownUntil > Date.now()) return false;
  if (r.state === 'CIRCUIT_OPEN') {
    r.state = 'AVAILABLE';
    r.failures = 0;
  }
  return true;
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function parseRetryAfterMs(response: Response): number {
  const raw = response.headers.get('retry-after');
  if (!raw) return 0;

  const seconds = Number(raw);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return seconds * 1000;
  }

  const retryAt = Date.parse(raw);
  if (!Number.isNaN(retryAt)) {
    return Math.max(0, retryAt - Date.now());
  }

  return 0;
}

/** The text up to its last complete sentence, or null when there is none. */
export function completeSentences(text: string): string | null {
  const ends = [...text.matchAll(/[.!?…](?=\s|$)/g)];
  const last = ends.at(-1);
  if (!last || last.index === undefined) return null;
  const kept = text.slice(0, last.index + 1).trim();
  return kept.length >= 20 ? kept : null;
}

async function callProvider(
  provider: Provider,
  systemPrompt: string,
  message: string,
  maxTokens = 512,
): Promise<{ text: string | null; state?: ProviderState; retryAfterMs?: number; model?: string; usage?: Usage | null }> {
  const key = provider.getKey();
  if (!key) return { text: null, state: 'DISABLED' };

  const models = Array.isArray(provider.model) ? provider.model : [provider.model];
  let lastState: ProviderState = 'PROVIDER_ERROR';

  for (const model of models) {
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      let body: string;
      let url: string;

      if (provider.kind === 'anthropic') {
        url = provider.baseUrl + '/messages';
        headers['x-api-key'] = key;
        headers['anthropic-version'] = '2023-06-01';
        body = JSON.stringify({
          model,
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: 'user', content: message }],
        });
      } else {
        url = provider.baseUrl + '/chat/completions';
        headers.Authorization = `Bearer ${key}`;
        body = JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
        });
      }

      const response = await fetchWithTimeout(url, { method: 'POST', headers, body });
      if (!response.ok) {
        lastState = classifyStatus(response.status);
        if (response.status === 429) {
          return { text: null, state: lastState, retryAfterMs: parseRetryAfterMs(response) };
        }
        if (response.status === 401 || response.status === 403) {
          return { text: null, state: lastState };
        }
        continue;
      }

      const data = await response.json() as {
        choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
        content?: Array<{ type?: string; text?: string }>;
        stop_reason?: string;
      };

      const raw = provider.kind === 'anthropic'
        ? data.content?.find((block) => block.type === 'text')?.text ?? null
        : data.choices?.[0]?.message?.content ?? null;
      // A reasoning model can spend the token budget before finishing its
      // answer: "Consulte le site officiel d" reached a user (2026-10-04).
      // Keep only complete sentences; with none, try the next model.
      const finish = provider.kind === 'anthropic' ? data.stop_reason : data.choices?.[0]?.finish_reason;
      const text = raw && (finish === 'length' || finish === 'max_tokens') ? completeSentences(raw) : raw;

      if (text) return { text, model, usage: readUsage(data) };
      lastState = 'DEGRADED';
    } catch (error) {
      lastState = error instanceof Error && error.name === 'AbortError' ? 'TIMEOUT' : 'PROVIDER_ERROR';
    }
  }

  return { text: null, state: lastState };
}

export async function routeHadakAI(options: RouteOptions): Promise<RouteResult> {
  const started = Date.now();
  const id = options.requestId ?? requestId();

  for (const provider of providers()) {
    if (!isEligible(provider)) continue;

    const result = await callProvider(provider, options.systemPrompt, options.message, options.maxTokens);
    if (result.text) {
      markSuccess(provider.id);
      const model = result.model ?? (Array.isArray(provider.model) ? provider.model[0] : provider.model);
      const tokens = result.usage ?? {
        input: Math.ceil((options.systemPrompt.length + options.message.length) / 4),
        output: Math.ceil(result.text.length / 4),
      };
      appendLedger({
        request_id: id,
        provider: provider.id,
        model,
        resolution_type: provider.freeTier ? 'FREE_PROVIDER' : 'PAID_PROVIDER',
        latency_ms: Date.now() - started,
        tokens_input: tokens.input,
        tokens_output: tokens.output,
        tokens_source: result.usage ? 'provider' : 'estimated',
        ...costFor(provider, model, tokens),
      });
      return { text: result.text, provider: provider.id, resolutionType: provider.freeTier ? 'FREE_PROVIDER' : 'PAID_PROVIDER', requestId: id };
    }

    const failure = result.state ?? 'PROVIDER_ERROR';
    markFailure(provider.id, failure, result.retryAfterMs);
    appendLedger({
      request_id: id,
      provider: provider.id,
      resolution_type: provider.freeTier ? 'FREE_PROVIDER' : 'PAID_PROVIDER',
      latency_ms: Date.now() - started,
      tokens_input: 0,
      tokens_output: 0,
      tokens_source: 'none',
      estimated_cost: 0,
      cost_basis: 'none',
      error_class: failure,
    });
  }

  appendLedger({
    request_id: id,
    provider: null,
    resolution_type: 'OFFLINE_FALLBACK',
    latency_ms: Date.now() - started,
    tokens_input: 0,
    tokens_output: 0,
    tokens_source: 'none',
    estimated_cost: 0,
    actual_cost: 0,
    cost_basis: 'none',
  });

  return { text: null, provider: null, resolutionType: 'OFFLINE_FALLBACK', requestId: id };
}
