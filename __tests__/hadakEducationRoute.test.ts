/** @jest-environment node */
import { NextRequest } from 'next/server';
import { POST } from '../app/api/hadak/route';
import { resetRouterForTests } from '../lib/hadakAiRouter';
import { resetFootballCacheForTests } from '../lib/hadakFootballCache';

const realFetch = global.fetch;
const realEnv = process.env;

type Sent = { system: string; max_tokens: number; user: string };

function useGroq(answer = 'Étape 1…') {
  process.env = { ...realEnv, AI_ROUTER_FREE_ONLY: 'true', GROQ_API_KEY: 'g' };
  for (const k of ['GEMINI_API_KEY', 'OPENROUTER_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY']) delete process.env[k];
  const sent: Sent[] = [];
  global.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    if (new URL(input.toString()).hostname !== 'api.groq.com') throw new Error('offline');
    const body = JSON.parse(String(init?.body));
    sent.push({ system: body.messages[0].content, user: body.messages[1].content, max_tokens: body.max_tokens });
    return new Response(JSON.stringify({ choices: [{ message: { content: answer } }] }), { status: 200 });
  }) as unknown as typeof fetch;
  return sent;
}

function post(body: unknown) {
  return POST(new NextRequest('http://localhost/api/hadak', {
    method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' },
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

describe('Hadak Education wired into /api/hadak', () => {
  it('solves a 4e equation step by step with room for the full correction', async () => {
    const sent = useGroq();
    const data = await (await post({ message: "Résous l'équation 2x + 3 = 7, je suis en 4e", lang: 'fr' })).json();

    expect(data).toMatchObject({ source: 'groq', education: { mode: 'SOLVE', level: 'COLLEGE_4E_3E', solution_policy: 'FULL_SOLUTION' } });
    expect(sent[0].system).toMatch(/complete solution step by step/);
    expect(sent[0].system).toMatch(/4e or 3e/);
    expect(sent[0].system).not.toMatch(/MAX 2 phrases/);
    expect(sent[0].max_tokens).toBe(1500);
  });

  it('gives hints first for a practice request and asks the level when unknown', async () => {
    const sent = useGroq();
    const data = await (await post({ message: 'Donne-moi des exercices sur les fractions', lang: 'fr' })).json();

    expect(data.education).toEqual({ mode: 'PRACTICE', level: null, solution_policy: 'HINTS_FIRST' });
    expect(sent[0].system).toMatch(/level is unknown/);
  });

  it('takes the mode and level chosen in the app over what the text suggests', async () => {
    const sent = useGroq();
    const data = await (await post({
      message: 'Les fractions', lang: 'da',
      education: { mode: 'REVISE', level: 'PRIMARY_3_5' },
    })).json();

    expect(data.education).toMatchObject({ mode: 'REVISE', level: 'PRIMARY_3_5' });
    expect(sent[0].system).toMatch(/Darija/);
  });

  it('rejects unknown education options', async () => {
    const sent = useGroq();
    for (const education of [{ mode: 'CHEAT' }, { level: 'constructor' }, { wantsFullSolution: 'yes' }, 'SOLVE']) {
      expect((await post({ message: 'exercice', education })).status).toBe(400);
    }
    expect(sent).toHaveLength(0);
  });

  it('keeps travel questions on their own answers', async () => {
    const sent = useGroq();
    for (const message of ['Quel ferry pour rentrer au Maroc ?', 'Quels documents pour passer à Tanger Med ?', 'Quel est le cours du dirham ?']) {
      const data = await (await post({ message, lang: 'fr' })).json();
      expect(data.education).toBeUndefined();
    }
    expect(sent).toHaveLength(0);
  });

  it('falls back offline and still reports the plan when no provider answers', async () => {
    process.env = { ...realEnv };
    for (const k of ['GROQ_API_KEY', 'GEMINI_API_KEY', 'OPENROUTER_API_KEY', 'OPENAI_API_KEY', 'ANTHROPIC_API_KEY']) delete process.env[k];
    global.fetch = jest.fn(async () => { throw new Error('offline'); }) as unknown as typeof fetch;

    const data = await (await post({ message: 'Prépare-moi pour le bac de maths', lang: 'fr' })).json();
    expect(data).toMatchObject({ fallback: true, education: { mode: 'EXAM_PREP', level: 'LYCEE_TERMINALE' } });
  });
});
