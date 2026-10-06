/** @jest-environment node */
import { routeHadakAI, getProviderHealth, getLedgerSnapshot, isFreeOnly, resetRouterForTests } from '../lib/hadakAiRouter';
import { resetFootballCacheForTests } from '../lib/hadakFootballCache';
import { POST } from '../app/api/hadak/route';
import { NextRequest } from 'next/server';

const realFetch = global.fetch;
const realEnv = process.env;

function setEnv(values: Record<string, string | undefined>) {
  process.env = { ...realEnv };
  for (const key of ['AI_ROUTER_FREE_ONLY', 'GROQ_API_KEY', 'GEMINI_API_KEY', 'OPENROUTER_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY']) {
    delete process.env[key];
  }
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) process.env[key] = value;
  }
}

function mockJson(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
}

function post(message: string, lang = 'fr') {
  return POST(new NextRequest('http://localhost/api/hadak', {
    method: 'POST',
    body: JSON.stringify({ message, lang }),
    headers: { 'content-type': 'application/json' },
  }));
}

function hostname(input: RequestInfo | URL): string {
  return new URL(input.toString()).hostname;
}
beforeEach(() => {
  resetRouterForTests();
  resetFootballCacheForTests();
  setEnv({});
});
afterEach(() => {
  jest.useRealTimers();
  global.fetch = realFetch;
  process.env = realEnv;
});

describe('LOT B — resilience and routing invariants', () => {
  it('1. FREE_ONLY blocks OpenAI', async () => {
    setEnv({ AI_ROUTER_FREE_ONLY: 'true', GROQ_API_KEY: 'groq-test', OPENAI_API_KEY: 'openai-test' });
    const urls: string[] = [];
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      urls.push(input.toString());
      if (hostname(input) === 'api.groq.com') return mockJson({ choices: [{ message: { content: 'groq ok' } }] });
      throw new Error('paid provider must not be called');
    }) as unknown as typeof fetch;
    const result = await routeHadakAI({ message: 'question', systemPrompt: 'answer' });
    expect(result.provider).toBe('groq');
    expect(urls.some((u) => new URL(u).hostname === 'api.openai.com')).toBe(false);
  });

  it('2. FREE_ONLY blocks Anthropic', async () => {
    setEnv({ AI_ROUTER_FREE_ONLY: 'true', GROQ_API_KEY: 'groq-test', ANTHROPIC_API_KEY: 'anthropic-test' });
    const urls: string[] = [];
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      urls.push(input.toString());
      if (new URL(input.toString()).hostname === 'api.groq.com') return mockJson({ choices: [{ message: { content: 'groq ok' } }] });
      throw new Error('paid provider must not be called');
    }) as unknown as typeof fetch;
    await routeHadakAI({ message: 'question', systemPrompt: 'answer' });
    expect(urls.some((u) => new URL(u).hostname === 'api.anthropic.com')).toBe(false);
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
      hostname(input) === 'api.groq.com' ? mockJson({}, 429) : mockJson({ choices: [{ message: { content: 'openai ok' } }] }),
    ) as unknown as typeof fetch;
    const result = await routeHadakAI({ message: 'question', systemPrompt: 'answer' });
    expect(result.provider).toBe('openai');
    expect(getProviderHealth().groq.state).toBe('RATE_LIMITED');
    expect(getProviderHealth().groq.cooldown_until).not.toBeNull();
  });

  it('5. timeout moves to the next provider', async () => {
    setEnv({ GROQ_API_KEY: 'g', OPENAI_API_KEY: 'o' });
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      if (new URL(input.toString()).hostname === 'api.groq.com') throw Object.assign(new Error('timeout'), { name: 'AbortError' });
      return mockJson({ choices: [{ message: { content: 'openai ok' } }] });
    }) as unknown as typeof fetch;
    const result = await routeHadakAI({ message: 'question', systemPrompt: 'answer' });
    expect(result.provider).toBe('openai');
    expect(getProviderHealth().groq.state).toBe('TIMEOUT');
  });

  it('6. 5xx moves to the next provider', async () => {
    setEnv({ GROQ_API_KEY: 'g', OPENAI_API_KEY: 'o' });
    global.fetch = jest.fn(async (input: RequestInfo | URL) =>
      new URL(input.toString()).hostname === 'api.groq.com' ? mockJson({}, 503) : mockJson({ choices: [{ message: { content: 'openai ok' } }] }),
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
    expect(getProviderHealth().groq.cooldown_until).not.toBeNull();
  });

  it('8. circuit opens after repeated transient failures', async () => {
    setEnv({ GROQ_API_KEY: 'g', OPENAI_API_KEY: undefined, ANTHROPIC_API_KEY: undefined });
    global.fetch = jest.fn(async () => mockJson({}, 503)) as unknown as typeof fetch;
    await routeHadakAI({ message: 'one', systemPrompt: 'answer' });
    await routeHadakAI({ message: 'two', systemPrompt: 'answer' });
    expect(getProviderHealth().groq.state).toBe('CIRCUIT_OPEN');
    expect(getProviderHealth().groq.cooldown_until).not.toBeNull();
  });

  it('9. 429 cooldown grows exponentially after repeated rate limits', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-26T12:00:00.000Z'));
    setEnv({ GROQ_API_KEY: 'g' });
    global.fetch = jest.fn(async () => mockJson({}, 429)) as unknown as typeof fetch;

    await routeHadakAI({ message: 'one', systemPrompt: 'answer' });
    const first = getProviderHealth().groq.cooldown_until;
    expect(first).toBe(Date.now() + 30_000);

    jest.advanceTimersByTime(30_000);
    await routeHadakAI({ message: 'two', systemPrompt: 'answer' });
    const second = getProviderHealth().groq.cooldown_until;
    expect(second).toBe(Date.now() + 60_000);

    jest.useRealTimers();
  });

  it('10. 429 honors a valid Retry-After delay', async () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-09-26T12:00:00.000Z'));
    setEnv({ GROQ_API_KEY: 'g' });
    global.fetch = jest.fn(async () => mockJson({}, 429, { 'retry-after': '45' })) as unknown as typeof fetch;

    await routeHadakAI({ message: 'rate limited', systemPrompt: 'answer' });
    expect(getProviderHealth().groq.cooldown_until).toBe(Date.now() + 45_000);

    jest.useRealTimers();
  });

  it('11. deterministic time resolution happens before any LLM', async () => {
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

  it('12. OpenRouter free fallback is eligible when earlier free providers are unavailable', async () => {
    setEnv({ AI_ROUTER_FREE_ONLY: 'true', OPENROUTER_API_KEY: 'openrouter-test' });
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      expect(hostname(input)).toBe('openrouter.ai');
      return mockJson({ choices: [{ message: { content: 'openrouter free response' } }] });
    }) as unknown as typeof fetch;

    const result = await routeHadakAI({ message: 'question', systemPrompt: 'answer' });
    expect(result.provider).toBe('openrouter');
    expect(result.resolutionType).toBe('FREE_PROVIDER');
  });

  it('13. cached football answers avoid a second LLM call', async () => {
    setEnv({ OPENAI_API_KEY: 'o' });
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (new URL(url).hostname === 'api.openai.com') return mockJson({ choices: [{ message: { content: 'cached candidate' } }] });
      return new Response('', { status: 503 });
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    const first = await post('Wydad ou Raja ce soir ?', 'da');
    const callsAfterFirst = fetchMock.mock.calls.length;
    const second = await post('Wydad ou Raja ce soir ?', 'da');
    expect((await first.json()).response).toBe('cached candidate');
    expect((await second.json()).response).toBe('cached candidate');
    expect(fetchMock.mock.calls.length).toBe(callsAfterFirst);
  });

  it('14. all providers unavailable reaches the offline fallback', async () => {
    setEnv({ GROQ_API_KEY: 'g', OPENAI_API_KEY: 'o', ANTHROPIC_API_KEY: 'a' });
    global.fetch = jest.fn(async () => mockJson({}, 503)) as unknown as typeof fetch;
    const result = await routeHadakAI({ message: 'generic', systemPrompt: 'answer' });
    expect(result.text).toBeNull();
    expect(result.resolutionType).toBe('OFFLINE_FALLBACK');
  });

  it('15. logs/ledger contain no API key values', async () => {
    const secret = 'TEST_SECRET_SHOULD_NEVER_APPEAR';
    setEnv({ GROQ_API_KEY: secret });
    global.fetch = jest.fn(async () => mockJson({}, 503)) as unknown as typeof fetch;
    await routeHadakAI({ message: 'generic', systemPrompt: 'answer' });
    const serialized = JSON.stringify(getLedgerSnapshot());
    expect(serialized).not.toContain(secret);
  });

  it('16. football regression still returns a named-team answer through the router', async () => {
    setEnv({ OPENAI_API_KEY: 'o' });
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      if (hostname(input) === 'api.openai.com') return mockJson({ choices: [{ message: { content: 'football answer' } }] });
      return new Response('', { status: 503 });
    }) as unknown as typeof fetch;
    const response = await post('Wydad ou Raja ce soir ?', 'da');
    const body = await response.json();
    expect(body.response).toBe('football answer');
  });

  it('17. ferry regression remains deterministic', async () => {
    setEnv({ GROQ_API_KEY: 'g' });
    global.fetch = jest.fn(async () => { throw new Error('LLM must not be called'); }) as unknown as typeof fetch;
    const response = await post('Quel ferry pour rentrer au Maroc ?');
    const body = await response.json();
    expect(body.source).toBe('local');
    expect(body.response).toMatch(/Ferries pour les MRE/);
  });

  it('18. clock regression remains deterministic', async () => {
    setEnv({ GROQ_API_KEY: 'g' });
    global.fetch = jest.fn(async () => { throw new Error('LLM must not be called'); }) as unknown as typeof fetch;
    const response = await post('quelle heure est-il au Maroc');
    expect((await response.json()).response).toMatch(/Il est actuellement/);
  });

  it('19. weather regression uses external data before LLM', async () => {
    setEnv({ GROQ_API_KEY: 'g' });
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      if (hostname(input) === 'api.open-meteo.com') {
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

  it('20. currency regression uses external data before LLM', async () => {
    setEnv({ GROQ_API_KEY: 'g' });
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      if (hostname(input) === 'open.er-api.com') return mockJson({ rates: { MAD: 11, GBP: 0.85, CHF: 0.95, USD: 1.1 } });
      throw new Error('LLM must not be called');
    });
    global.fetch = fetchMock as unknown as typeof fetch;
    const response = await post('combien vaut 100 euros en dirhams ?');
    const body = await response.json();
    expect(body.source).toBe('local');
    expect(body.response).toContain('11.00 MAD');
  });

  it('21. generic questions reach the AI router', async () => {
    setEnv({ GROQ_API_KEY: 'g' });
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      if (new URL(input.toString()).hostname === 'api.groq.com') return mockJson({ choices: [{ message: { content: 'generic answer' } }] });
      throw new Error('unexpected upstream');
    }) as unknown as typeof fetch;
    const response = await post('Donne-moi une idée originale.');
    const body = await response.json();
    expect(body.source).toBe('groq');
    expect(body.response).toBe('generic answer');
  });

  it('22. successful provider resets failures and becomes AVAILABLE', async () => {
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

describe('reasoning never reaches a user', () => {
  const leak =
    "Here's a thinking process: 1. **Analyze User Input:** - Role: Faical, charismatic football pundit from RME - Output requirements: exactly 1 probable result.";

  it('rejects an answer that is a reasoning trace and uses the next model (Faical leak, 2026-10-06)', async () => {
    setEnv({ AI_ROUTER_FREE_ONLY: 'true', GROQ_API_KEY: 'groq-test' });
    let call = 0;
    global.fetch = jest.fn(async () => {
      call += 1;
      return call === 1
        ? mockJson({ choices: [{ message: { content: leak }, finish_reason: 'length' }] })
        : mockJson({ choices: [{ message: { content: 'Berkane gagne 1-0 : meilleure forme récente.' }, finish_reason: 'stop' }] });
    }) as unknown as typeof fetch;
    const result = await routeHadakAI({ message: 'Match', systemPrompt: 'Tu es Faical' });
    expect(result.text).toBe('Berkane gagne 1-0 : meilleure forme récente.');
    expect(result.text).not.toMatch(/thinking process|Analyze User Input/i);
  });

  it('removes <think> blocks and keeps the answer after them', async () => {
    setEnv({ AI_ROUTER_FREE_ONLY: 'true', GROQ_API_KEY: 'groq-test' });
    global.fetch = jest.fn(async () =>
      mockJson({ choices: [{ message: { content: '<think>The user asks about ferries.</think>Consultez frs.es et aml.es pour les horaires.' } }] }),
    ) as unknown as typeof fetch;
    const result = await routeHadakAI({ message: 'ferry', systemPrompt: 'Hadak' });
    expect(result.text).toBe('Consultez frs.es et aml.es pour les horaires.');
  });

  it('keeps ordinary answers untouched', async () => {
    setEnv({ AI_ROUTER_FREE_ONLY: 'true', GROQ_API_KEY: 'groq-test' });
    global.fetch = jest.fn(async () => mockJson({ choices: [{ message: { content: 'Analyse : Wydad favori à domicile.' } }] })) as unknown as typeof fetch;
    const result = await routeHadakAI({ message: 'Wydad', systemPrompt: 'Faical' });
    expect(result.text).toBe('Analyse : Wydad favori à domicile.');
  });
});
