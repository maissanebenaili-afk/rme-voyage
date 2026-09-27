/** @jest-environment node */
import fs from 'node:fs';
import path from 'node:path';

jest.mock('@/lib/hadakAiRouter', () => ({ routeHadakAI: jest.fn() }));

import { routeHadakAI } from '@/lib/hadakAiRouter';
import { generatePrediction } from '@/lib/faicalPrediction';

const routeMock = routeHadakAI as jest.MockedFunction<typeof routeHadakAI>;
const form = (last5: string) => ({ w: 2, d: 1, l: 2, last5 });

describe('Faical prediction', () => {
  beforeEach(() => routeMock.mockReset());

  it('goes through the shared AI router (free-only, ledger) with the match form', async () => {
    routeMock.mockResolvedValue({ text: '  Raja gagne 2-1. Meilleure forme.  ', provider: 'groq', resolutionType: 'FREE_PROVIDER', requestId: 'r1' });
    const out = await generatePrediction('Raja', 'Wydad', form('WWDLW'), form('LDLWW'));
    expect(out).toBe('Raja gagne 2-1. Meilleure forme.');
    const call = routeMock.mock.calls[0][0];
    expect(call.message).toContain('Raja vs Wydad');
    expect(call.message).toContain('WWDLW');
    expect(call.systemPrompt).toMatch(/n'invente/);
    expect(call.systemPrompt).toMatch(/pari/);
  });

  it('returns an empty string when no provider answers or the router throws', async () => {
    routeMock.mockResolvedValue({ text: null, provider: null, resolutionType: 'OFFLINE_FALLBACK', requestId: 'r2' });
    expect(await generatePrediction('A', 'B', form(''), form(''))).toBe('');
    routeMock.mockRejectedValue(new Error('boom'));
    expect(await generatePrediction('A', 'B', form(''), form(''))).toBe('');
  });

  it('no longer calls a paid provider directly from the Faical route', () => {
    const route = fs.readFileSync(path.join(__dirname, '..', 'app/api/faical/route.ts'), 'utf-8');
    expect(route).not.toMatch(/api\.anthropic\.com|ANTHROPIC_API/);
  });

  it('labels the prediction as an AI opinion, not betting advice, in every language', () => {
    const widget = fs.readFileSync(path.join(__dirname, '..', 'components/FaicalWidget.tsx'), 'utf-8');
    expect(widget.match(/aiNote:/g)).toHaveLength(5);
  });
});

describe('Faical fixtures source', () => {
  const route = fs.readFileSync(path.join(__dirname, '..', 'app/api/faical/route.ts'), 'utf-8');

  it('asks TheSportsDB for the Botola Pro (id 4520), not the non-existent id 1159', () => {
    expect(route).toContain("BOTOLA_PRO_LEAGUE_ID = '4520'");
    expect(route).toContain('eventsnextleague.php?id=${BOTOLA_PRO_LEAGUE_ID}');
    expect(route).not.toMatch(/id=1159/);
  });

  it('reuses the team ids of the fixture before searching by name', () => {
    expect(route).toMatch(/evt\.idHomeTeam \|\| getTeamId/);
  });
});
