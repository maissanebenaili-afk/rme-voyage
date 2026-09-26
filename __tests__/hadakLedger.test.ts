/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST } from '../app/api/hadak/route';
import { getLedgerSnapshot, resetRouterForTests, routeHadakAI, summarizeLedger } from '../lib/hadakAiRouter';
import { resetFootballCacheForTests } from '../lib/hadakFootballCache';

const realFetch = global.fetch;
const realEnv = process.env;
const LLM_KEYS = ['AI_ROUTER_FREE_ONLY', 'GROQ_API_KEY', 'GEMINI_API_KEY', 'OPENROUTER_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY'];

function setEnv(values: Record<string, string>) {
  process.env = { ...realEnv };
  for (const key of LLM_KEYS) delete process.env[key];
  Object.assign(process.env, values);
}

function reply(content: string, usage?: Record<string, number>) {
  return new Response(JSON.stringify({ choices: [{ message: { content } }], ...(usage ? { usage } : {}) }), { status: 200 });
}

function post(message: string) {
  return POST(new NextRequest('http://localhost/api/hadak', {
    method: 'POST',
    body: JSON.stringify({ message, lang: 'fr' }),
    headers: { 'content-type': 'application/json' },
  }));
}

beforeEach(() => {
  resetRouterForTests();
  resetFootballCacheForTests();
  jest.spyOn(console, 'info').mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
  global.fetch = realFetch;
  process.env = realEnv;
});

describe('Lot D — economic ledger', () => {
  it('records the provider-counted tokens and a known $0 on a free plan', async () => {
    setEnv({ AI_ROUTER_FREE_ONLY: 'true', GROQ_API_KEY: 'g' });
    global.fetch = jest.fn(async () => reply('ok', { prompt_tokens: 120, completion_tokens: 30 })) as unknown as typeof fetch;

    await routeHadakAI({ message: 'question', systemPrompt: 'sys' });
    expect(getLedgerSnapshot()).toEqual([expect.objectContaining({
      provider: 'groq', model: 'openai/gpt-oss-20b', resolution_type: 'FREE_PROVIDER',
      tokens_input: 120, tokens_output: 30, tokens_source: 'provider',
      estimated_cost: 0, actual_cost: 0, cost_basis: 'free_plan',
    })]);
  });

  it('marks tokens as estimated when the provider sends no usage', async () => {
    setEnv({ GROQ_API_KEY: 'g' });
    global.fetch = jest.fn(async () => reply('ok')) as unknown as typeof fetch;

    await routeHadakAI({ message: 'question', systemPrompt: 'sys' });
    expect(getLedgerSnapshot()[0]).toMatchObject({ tokens_source: 'estimated' });
  });

  it('never reports a paid call as free: list-price estimate, actual cost unknown', async () => {
    setEnv({ OPENAI_API_KEY: 'o' });
    global.fetch = jest.fn(async () => reply('ok', { prompt_tokens: 1_000_000, completion_tokens: 1_000_000 })) as unknown as typeof fetch;

    await routeHadakAI({ message: 'question', systemPrompt: 'sys' });
    const entry = getLedgerSnapshot()[0];
    expect(entry).toMatchObject({ provider: 'openai', resolution_type: 'PAID_PROVIDER', cost_basis: 'list_price_estimate', estimated_cost: 0.75 });
    expect(entry.actual_cost).toBeUndefined();
    expect(summarizeLedger()).toMatchObject({ estimated_cost_usd: 0.75, unknown_cost_entries: 1 });
  });

  it('counts answers served without any LLM', async () => {
    setEnv({});
    global.fetch = jest.fn(async () => { throw new Error('offline'); }) as unknown as typeof fetch;

    await post('Quel ferry pour rentrer au Maroc ?');
    await post('Quelle heure est-il au Maroc ?');
    expect(summarizeLedger()).toMatchObject({ requests: 2, answered_without_llm: 2, answered_without_llm_share: 1 });
    expect(getLedgerSnapshot().every((e) => e.resolution_type === 'DETERMINISTIC_LOCAL')).toBe(true);
  });

  it('records a football cache hit as CACHE, without a second LLM call', async () => {
    setEnv({ GROQ_API_KEY: 'g' });
    let llmCalls = 0;
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      if (new URL(input.toString()).hostname === 'api.groq.com') { llmCalls += 1; return reply('Pas de match ce soir.'); }
      return new Response('{}', { status: 200 });
    }) as unknown as typeof fetch;

    await post('Wydad ou Raja ce soir ?');
    await post('Wydad ou Raja ce soir ?');
    expect(llmCalls).toBe(1);
    expect(getLedgerSnapshot().map((e) => e.resolution_type)).toEqual(['FREE_PROVIDER', 'CACHE']);
  });

  it('summarises an empty ledger without dividing by zero', () => {
    expect(summarizeLedger([])).toEqual({
      requests: 0, by_resolution: {}, answered_without_llm: 0, answered_without_llm_share: null,
      provider_tokens: {}, estimated_cost_usd: 0, unknown_cost_entries: 0,
    });
  });

  it('keeps questions, answers and keys out of the ledger and its log line', async () => {
    const secretKey = 'gsk_LEDGER_SECRET';
    setEnv({ GROQ_API_KEY: secretKey });
    global.fetch = jest.fn(async () => reply('REPONSE_PRIVEE', { prompt_tokens: 5, completion_tokens: 5 })) as unknown as typeof fetch;

    await routeHadakAI({ message: 'Je m appelle Karim, 06 12 34 56 78', systemPrompt: 'sys' });
    const logged = (console.info as jest.Mock).mock.calls.map((c) => String(c[0])).join('\n');
    const stored = JSON.stringify(getLedgerSnapshot());
    for (const text of [stored, logged]) {
      expect(text).not.toMatch(/Karim|06 12 34|REPONSE_PRIVEE|LEDGER_SECRET/);
    }
    expect(logged).toContain('[hadak-ledger]');
  });
});
