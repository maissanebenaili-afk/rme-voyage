/**
 * Server-side proxy to the Anthropic Messages API for Hadak, the in-app
 * travel assistant. Requires ANTHROPIC_API_KEY to be set in the deployment
 * environment (Vercel project settings → Environment Variables) — never
 * committed, never sent to the client. Without it configured, this route
 * returns 503 and the frontend falls back to the local keyword-matched
 * knowledge base rather than failing the chat outright.
 */

const SYSTEM_PROMPT = `Tu es Hadak, l'assistant de voyage intégré à l'application RME Voyage.
RME Voyage aide les Marocains résidant à l'étranger (MRE) et leurs familles à préparer
un trajet entre l'Europe et le Maroc : itinéraire, budget, ferry, vol, prières, Qibla,
documents et services sur la route.

Règles :
- Réponds toujours dans la langue de la dernière question (français, anglais, arabe,
  espagnol, ou darija marocaine si l'utilisateur écrit en darija).
- Sois concis et concret : 2 à 4 phrases sauf si on te demande plus de détail.
- N'invente jamais de prix, d'horaires ou de distances précis que tu ne connais pas
  avec certitude. Pour un chiffre exact (distance, coût, horaires de prière), renvoie
  l'utilisateur vers les outils intégrés de l'app (planificateur d'itinéraire,
  calculateur de budget, widget de prière) plutôt que d'inventer un nombre.
- Ton chaleureux, direct, jamais condescendant. Tu peux utiliser des mots de darija
  courants (salam, inchallah, zwina) même en français, comme le ferait un ami MRE.
- Tu ne réponds qu'aux questions liées au voyage Europe ↔ Maroc, à la culture
  marocaine, à la diaspora ou à l'usage de l'application. Pour toute autre demande,
  redis brièvement ton rôle et propose d'aider sur un sujet voyage.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function isValidMessage(m: unknown): m is ChatMessage {
  if (typeof m !== "object" || m === null) return false;
  const { role, content } = m as Record<string, unknown>;
  return (
    (role === "user" || role === "assistant") &&
    typeof content === "string" &&
    content.trim().length > 0 &&
    content.length <= 2000
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "AI backend not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { messages } = (body ?? {}) as { messages?: unknown };
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
    return Response.json({ error: "messages must be a non-empty array (max 20)" }, { status: 400 });
  }
  if (!messages.every(isValidMessage)) {
    return Response.json({ error: "Each message needs role (user|assistant) and content (1-2000 chars)" }, { status: 400 });
  }

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });

  if (!upstream.ok) {
    // Don't leak upstream error bodies (may include account/billing detail).
    return Response.json({ error: "AI backend error" }, { status: 502 });
  }

  const data = (await upstream.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((block) => block.type === "text")?.text?.trim();
  if (!text) {
    return Response.json({ error: "Empty AI response" }, { status: 502 });
  }

  return Response.json({ content: text });
}
