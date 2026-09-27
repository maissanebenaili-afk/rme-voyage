import { routeHadakAI } from '@/lib/hadakAiRouter';

export type FormEntry = { w: number; d: number; l: number; last5: string };

// Faical's short match opinion, through the shared AI router: free providers
// only while AI_ROUTER_FREE_ONLY=true, same circuit breaker and ledger as
// Hadak. It used to call Anthropic directly (paid, and no key is set), so no
// prediction was ever shown. Empty string when no provider answers.
const SYSTEM_PROMPT = `Tu es Faical, le pronostiqueur football charismatique de RME. Tu donnes UN résultat probable (score ou issue) et UNE raison principale, en 2 phrases maximum, en français, sur un ton direct et confiant.
Règles : appuie-toi seulement sur la forme récente fournie, n'invente ni blessure, ni transfert, ni statistique. Ne parle jamais de pari, de cote ni de mise.`;

export async function generatePrediction(
  homeTeam: string,
  awayTeam: string,
  homeForm: FormEntry,
  awayForm: FormEntry,
): Promise<string> {
  const message = `Match : ${homeTeam} vs ${awayTeam}
Forme ${homeTeam} (5 derniers) : ${homeForm.last5 || 'inconnue'} (${homeForm.w}V ${homeForm.d}N ${homeForm.l}D)
Forme ${awayTeam} (5 derniers) : ${awayForm.last5 || 'inconnue'} (${awayForm.w}V ${awayForm.d}N ${awayForm.l}D)`;
  try {
    const routed = await routeHadakAI({ systemPrompt: SYSTEM_PROMPT, message, maxTokens: 160 });
    return routed.text?.trim() ?? '';
  } catch {
    return '';
  }
}
