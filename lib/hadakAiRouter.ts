/**
 * Hadak AI Router — Lot A+
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

export type LedgerEntry = {
  request_id: string;
  provider: string | null;
  resolution_type: ResolutionType;
  latency_ms: number;
  tokens_estimated: number;
  estimated_cost: number;
  actual_cost?: number;
  benchmark_cost?: number;
  estimated_cost_avoided?: number;
  error_class?: string;
};

type Provider = {
  id: string;
  freeTier: boolean;
  baseUrl: string;
  model: string;
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
};

type RouteResult = {
  text: string | null;
  provider: string | null;
  resolutionType: ResolutionType;
  requestId: string;
};

const COOLDOWN_MS = 30_000;
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
      model: 'llama-3.3-70b-versatile',
      kind: 'openai-compatible',
      getKey: () => process.env.GROQ_API_KEY,
    },
    {
      id: 'gemini',
      freeTier: true,
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
      model: 'gemini-3.8-flash',
      kind: 'openai-compatible',
      getKey: () => process.env.GEMINI_API_KEY,
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

function estimateTokens(message: string, output: string): number {
  return Math.ceil((message.length + output.length) / 4);
}

function appendLedger(entry: LedgerEntry): void {
  ledger.push(entry);
  if (ledger.length > LEDGER_MAX_ENTRIES) ledger.splice(0, ledger.length - LEDGER_MAX_ENTRIES);
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

function markFailure(id: string, state: ProviderState): void {
  const r = runtimeFor(id);
  r.state = state;
  r.failures += 1;
  if (state === 'RATE_LIMITED' || state === 'QUOTA_EXHAUSTED' || state === 'AUTH_ERROR') {
    r.cooldownUntil = Date.now() + COOLDOWN_MS;
    return;
  }
  if (r.failures >= FAILURE_THRESHOLD) {
    r.state = 'CIRCUIT_OPEN';
    r.cooldownUntil = Date.now() + COOLDOWN_MS;
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

async function callProvider(provider: Provider, systemPrompt: string, message: string): Promise<{ text: string | null; state?: ProviderState }> {
  const key = provider.getKey();
  if (!key) return { text: null, state: 'DISABLED' };

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    let body: string;
    let url: string;

    if (provider.kind === 'anthropic') {
      url = provider.baseUrl + '/messages';
      headers['x-api-key'] = key;
      headers['anthropic-version'] = '2023-06-01';
      body = JSON.stringify({
        model: provider.model,
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      });
    } else {
      url = provider.baseUrl + '/chat/completions';
      headers.Authorization = `Bearer ${key}`;
      body = JSON.stringify({
        model: provider.model,
        max_tokens: 512,
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }],
      });
    }

    const response = await fetchWithTimeout(url, { method: 'POST', headers, body });
    if (!response.ok) return { text: null, state: classifyStatus(response.status) };

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
      content?: Array<{ type?: string; text?: string }>;
    };

    const text = provider.kind === 'anthropic'
      ? data.content?.find((block) => block.type === 'text')?.text ?? null
      : data.choices?.[0]?.message?.content ?? null;

    return { text };
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return { text: null, state: 'TIMEOUT' };
    return { text: null, state: 'PROVIDER_ERROR' };
  }
}

export async function routeHadakAI(options: RouteOptions): Promise<RouteResult> {
  const started = Date.now();
  const id = options.requestId ?? requestId();

  for (const provider of providers()) {
    if (!isEligible(provider)) continue;

    const result = await callProvider(provider, options.systemPrompt, options.message);
    if (result.text) {
      markSuccess(provider.id);
      appendLedger({
        request_id: id,
        provider: provider.id,
        resolution_type: provider.freeTier ? 'FREE_PROVIDER' : 'PAID_PROVIDER',
        latency_ms: Date.now() - started,
        tokens_estimated: estimateTokens(options.message, result.text),
        estimated_cost: 0,
      });
      return { ...result, provider: provider.id, resolutionType: provider.freeTier ? 'FREE_PROVIDER' : 'PAID_PROVIDER', requestId: id };
    }

    const failure = result.state ?? 'PROVIDER_ERROR';
    markFailure(provider.id, failure);
    appendLedger({
      request_id: id,
      provider: provider.id,
      resolution_type: provider.freeTier ? 'FREE_PROVIDER' : 'PAID_PROVIDER',
      latency_ms: Date.now() - started,
      tokens_estimated: 0,
      estimated_cost: 0,
      error_class: failure,
    });
  }

  appendLedger({
    request_id: id,
    provider: null,
    resolution_type: 'OFFLINE_FALLBACK',
    latency_ms: Date.now() - started,
    tokens_estimated: 0,
    estimated_cost: 0,
  });

  return { text: null, provider: null, resolutionType: 'OFFLINE_FALLBACK', requestId: id };
}
