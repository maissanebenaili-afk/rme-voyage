/** @jest-environment node */
import { routeHadakAI, getProviderHealth, getLedgerSnapshot, isFreeOnly, resetRouterForTests } from '../lib/hadakAiRouter';
import { POST } from '../app/api/hadak/route';
import { NextRequest } from 'next/server';

const realFetch = global.fetch;
const realEnv = process.env;

function setEnv(values: Record<string, string | undefined>) {
  process.env = { ...realEnv };
  for (const key of ['AI_ROUTER_FREE_ONLY', 'GROQ_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY']) {
    delete process.env[key];
  }
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) process.env[key] = value;
  }
}

function mockJson(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

function post(message: string, lang = 'fr') {
  return POST(new NextRequest('http://localhost/api/hadak', {
    method: 'POST',
    body: JSON.stringify({ message, lang }),
    headers: { 'content-type': 'application/json' },
  }));
}

beforeEach(() => {
  resetRouterForTests();
  setEnv({});
});
afterEach(() => {
  global.fetch = realFetch;
  process.env = realEnv;
});

describe('LOT A+ — 19 mandatory routing invariants', () => {
  it('1. FREE_ONLY blocks OpenAI', async () => {
    setEnv({ AI_ROUTER_FREE_ONLY: 'true', GROQ_API_KEY: 'groq-test', OPENAI_API_KEY: 'openai-test' });
    const urls: string[] = [];
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      urls.push(input.toString());
      if (input.toString().includes('api.groq.com')) return mockJson({ choices: [{ message: { content: 'groq ok' } }] });
      throw new Error('paid provider must not be called');
    }) as unknown as typeof fetch;
    const result = await routeHadakAI({ message: 'question', systemPrompt: 'answer' });
    expect(result.provider).toBe('groq');
    expect(urls.some((u) => u.includes('api.openai.com'))).toBe(false);
  });

  it('2. FREE_ONLY blocks Anthropic', async () => {
    setEnv({ AI_ROUTER_FREE_ONLY: 'true', GROQ_API_KEY: 'groq-test', ANTHROPIC_API_KEY: 'anthropic-test' });
    const urls: string[] = [];
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      urls.push(input.toString());
      if (input.toString().includes('api.groq.com')) return mockJson({ choices: [{ message: { content: 'groq ok' } }] });
      throw new Error('paid provider must not be called');
    }) as unknown as typeof fetch;
    await routeHadakAI({ message: 'question', systemPrompt: 'answer' });
    expect(urls.some((u) => u.includes('api.anthropic.com'))).toBe(false);
  });

  it('3. uses the configured free provider', async () => {
    setEnv({ AI_ROUTER_FREE_ONLY: 'true', GROQ_API_KEY: 'groq-test' });
    global.fetch = jest.fn(async () => mockJson({ choices: [{ message: { content: 'free response' } }] })) as unknown as typeof fetch;
    const result = await routeHadakAI({ message: 'question', systemPrompt: 'answer' });
    expect(result.provider).toBe('groq');
    expect(result.resolutionType).toBe('FREE_PROVIDER');
  });

  it('4. 429 moves to the next provider and records RATE_LIMITED', async () => {
    setEnv({ GROQ_API_KEY: 'g', OPENAI_API_KEY: 'o' });
    global.fetch = jest.fn(async (input: RequestInfo | URL) =>
      input.toString().includes('groq') ? mockJson({}, 429) : mockJson({ choices: [{ message: { content: 'openai ok' } }] }),
    ) as unknown as typeof fetch;
    const result = await routeHadakAI({ message: 'question', systemPrompt: 'answer' });
    expect(result.provider).toBe('openai');
    expect(getProviderHealth().groq.state).toBe('RATE_LIMITED');
    expect(getProviderHealth().groq.cooldown).toBe(true);
  });

  it('5. timeout moves to the next provider', async () => {
    setEnv({ GROQ_API_KEY: 'g', OPENAI_API_KEY: 'o' });
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      if (input.toString().includes('groq')) throw Object.assign(new Error('timeout'), { name: 'AbortError' });
      return mockJson({ choices: [{ message: { content: 'openai ok' } }] });
    }) as unknown as typeof fetch;
    const result = await routeHadakAI({ message: 'question', systemPrompt: 'answer' });
    expect(result.provider).toBe('openai');
    expect(getProviderHealth().groq.state).toBe('TIMEOUT');
  });

  it('6. 5xx moves to the next provider', async () => {
    setEnv({ GROQ_API_KEY: 'g', OPENAI_API_KEY: 'o' });
    global.fetch = jest.fn(async (input: RequestInfo | URL) =>
      input.toString().includes('groq') ? mockJson({}, 503) : mockJson({ choices: [{ message: { content: 'openai ok' } }] }),
    ) as unknown as typeof fetch;
    expect((await routeHadakAI({ message: 'question', systemPrompt: 'answer' })).provider).toBe('openai');
  });

  it('7. 401/403 disables the failing provider for the cooldown window', async () => {
    setEnv({ GROQ_API_KEY: 'g', OPENAI_API_KEY: 'o' });
    global.fetch = jest.fn(async (input: RequestInfo | URL) =>
      input.toString().includes('groq') ? mockJson({}, 401) : mockJson({ choices: [{ message: { content: 'openai ok' } }] }),
    ) as unknown as typeof fetch;
    await routeHadakAI({ message: 'question', systemPrompt: 'answer' });
    expect(getProviderHealth().groq.state).toBe('AUTH_ERROR');
    expect(getProviderHealth().groq.cooldown).toBe(true);
  });

  it('8. circuit opens after repeated transient failures', async () => {
    setEnv({ GROQ_API_KEY: 'g', OPENAI_API_KEY: undefined, ANTHROPIC_API_KEY: undefined });
    global.fetch = jest.fn(async () => mockJson({}, 503)) as unknown as typeof fetch;
    await routeHadakAI({ message: 'one', systemPrompt: 'answer' });
    await routeHadakAI({ message: 'two', systemPrompt: 'answer' });
    expect(getProviderHealth().groq.state).toBe('CIRCUIT_OPEN');
    expect(getProviderHealth().groq.cooldown).toBe(true);
  });

  it('9. deterministic time resolution happens before any LLM', async () => {
    setEnv({ GROQ_API_KEY: 'g' });
    const fetchMock = jest.fn(async () => {
      throw new Error('LLM must not be called');
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    const response = await post('quelle heure est-il au Maroc');
    const body = await response.json();
    expect(body.source).toBe('local');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('10. cached football answers avoid a second LLM call', async () => {
    setEnv({ OPENAI_API_KEY: 'o' });
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes('openai.com')) return mockJson({ choices: [{ message: { content: 'cached candidate' } }] });
      return new Response('', { status: 503 });
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    const first = await post('Wydad ou Raja ce soir ?');
    const callsAfterFirst = fetchMock.mock.calls.length;
    const second = await post('Wydad ou Raja ce soir ?');
    expect((await first.json()).response).toBe('cached candidate');
    expect((await second.json()).response).toBe('cached candidate');
    expect(fetchMock.mock.calls.length).toBe(callsAfterFirst);
  });

  it('11. all providers unavailable reaches the offline fallback', async () => {
    setEnv({ GROQ_API_KEY: 'g', OPENAI_API_KEY: 'o', ANTHROPIC_API_KEY: 'a' });
    global.fetch = jest.fn(async () => mockJson({}, 503)) as unknown as typeof fetch;
    const result = await routeHadakAI({ message: 'generic', systemPrompt: 'answer' });
    expect(result.text).toBeNull();
    expect(result.resolutionType).toBe('OFFLINE_FALLBACK');
  });

  it('12. logs/ledger contain no API key values', async () => {
    const secret = 'TEST_SECRET_SHOULD_NEVER_APPEAR';
    setEnv({ GROQ_API_KEY: secret });
    global.fetch = jest.fn(async () => mockJson({}, 503)) as unknown as typeof fetch;
    await routeHadakAI({ message: 'generic', systemPrompt: 'answer' });
    const serialized = JSON.stringify(getLedgerSnapshot());
    expect(serialized).not.toContain(secret);
  });

  it('13. football regression still returns a named-team answer through the router', async () => {
    setEnv({ OPENAI_API_KEY: 'o' });
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      if (input.toString().includes('api.openai.com')) return mockJson({ choices: [{ message: { content: 'football answer' } }] });
      return new Response('', { status: 503 });
    }) as unknown as typeof fetch;
    const response = await post('Wydad ou Raja ce soir ?');
    const body = await response.json();
    expect(body.response).toBe('football answer');
  });

  it('14. ferry regression remains deterministic', async () => {
    setEnv({ GROQ_API_KEY: 'g' });
    global.fetch = jest.fn(async () => { throw new Error('LLM must not be called'); }) as unknown as typeof fetch;
    const response = await post('Quel ferry pour rentrer au Maroc ?');
    const body = await response.json();
    expect(body.source).toBe('local');
    expect(body.response).toMatch(/Ferries pour les MRE/);
  });

  it('15. clock regression remains deterministic', async () => {
    setEnv({ GROQ_API_KEY: 'g' });
    global.fetch = jest.fn(async () => { throw new Error('LLM must not be called'); }) as unknown as typeof fetch;
    const response = await post('quelle heure est-il au Maroc');
    expect((await response.json()).response).toMatch(/Il est actuellement/);
  });

  it('16. weather regression uses external data before LLM', async () => {
    setEnv({ GROQ_API_KEY: 'g' });
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      if (input.toString().includes('open-meteo.com')) {
        return mockJson({ current: { temperature_2m: 22, weather_code: 0, wind_speed_10m: 5 } });
      }
      throw new Error('LLM must not be called');
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    const response = await post('Quel temps à Casablanca ?');
    const body = await response.json();
    expect(body.source).toBe('local');
    expect(body.response).toContain('22°C');
  });

  it('17. currency regression uses external data before LLM', async () => {
    setEnv({ GROQ_API_KEY: 'g' });
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      if (input.toString().includes('open.er-api.com')) return mockJson({ rates: { MAD: 11, GBP: 0.85, CHF: 0.95, USD: 1.1 } });
      throw new Error('LLM must not be called');
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    const response = await post('combien vaut 100 euros en dirhams ?');
    const body = await response.json();
    expect(body.source).toBe('local');
    expect(body.response).toContain('11.00 MAD');
  });

  it('18. generic questions reach the AI router', async () => {
    setEnv({ GROQ_API_KEY: 'g' });
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      if (input.toString().includes('api.groq.com')) return mockJson({ choices: [{ message: { content: 'generic answer' } }] });
      throw new Error('unexpected upstream');
    }) as unknown as typeof fetch;
    const response = await post('Explique-moi comment préparer mon voyage.');
    const body = await response.json();
    expect(body.source).toBe('groq');
    expect(body.response).toBe('generic answer');
  });

  it('19. successful provider resets failures and becomes AVAILABLE', async () => {
    setEnv({ GROQ_API_KEY: 'g', OPENAI_API_KEY: 'o' });
    global.fetch = jest.fn(async (input: RequestInfo | URL) =>
      input.toString().includes('groq') ? mockJson({}, 503) : mockJson({ choices: [{ message: { content: 'ok' } }] }),
    ) as unknown as typeof fetch;
    await routeHadakAI({ message: 'one', systemPrompt: 'answer' });
    expect(getProviderHealth().groq.state).toBe('PROVIDER_ERROR');
    setEnv({ GROQ_API_KEY: 'g' });
    global.fetch = jest.fn(async () => mockJson({ choices: [{ message: { content: 'recovered' } }] })) as unknown as typeof fetch;
    resetRouterForTests();
    await routeHadakAI({ message: 'two', systemPrompt: 'answer' });
    expect(getProviderHealth().groq.state).toBe('AVAILABLE');
  });
});
