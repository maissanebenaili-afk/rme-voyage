import { routeHadakAI } from '@/lib/hadakAiRouter';

export type FormEntry = { w: number; d: number; l: number; last5: string };

// Faical's short match opinion, through the shared AI router: free providers
// only while AI_ROUTER_FREE_ONLY=true, same circuit breaker and ledger as
// Hadak. It used to call Anthropic directly (paid, and no key is set), so no
// prediction was ever shown. Empty string when no provider answers.
const SYSTEM_PROMPT = `Tu es Faical, le pronostiqueur football charismatique de RME. Tu donnes UN résultat probable (score ou issue) et UNE raison principale, en 2 phrases maximum, en français, sur un ton direct et confiant.
Règles : appuie-toi seulement sur la forme récente fournie, n'invente ni blessure, ni transfert, ni statistique. Ne cite jamais plus de matchs que le nombre de matchs connus indiqué ; si la forme est inconnue, dis-le. Ne parle jamais de pari, de cote ni de mise.`;

export async function generatePrediction(
  homeTeam: string,
  awayTeam: string,
  homeForm: FormEntry,
  awayForm: FormEntry,
): Promise<string> {
  const describe = (team: string, form: FormEntry) => {
    const known = form.w + form.d + form.l;
    return known > 0
      ? `Forme ${team} (${known} match${known > 1 ? 's' : ''} connu${known > 1 ? 's' : ''}) : ${form.last5} (${form.w}V ${form.d}N ${form.l}D)`
      : `Forme ${team} : inconnue`;
  };
  const message = `Match : ${homeTeam} vs ${awayTeam}
${describe(homeTeam, homeForm)}
${describe(awayTeam, awayForm)}`;
  try {
    const routed = await routeHadakAI({ systemPrompt: SYSTEM_PROMPT, message, maxTokens: 160 });
    return routed.text?.trim() ?? '';
  } catch {
    return '';
  }
}
