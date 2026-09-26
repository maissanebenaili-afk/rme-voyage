import { NextResponse } from 'next/server';

// Signalement d'une réponse de Hadak jugée inappropriée ou fausse (exigence
// Google Play pour les contenus générés par IA). Seule la réponse signalée est
// reçue, jamais la question de l'utilisateur : elle est écrite dans les journaux
// du serveur (Vercel), où l'équipe la relit.
const MAX_ANSWER_CHARS = 2000;
const REASONS = ['inappropriate', 'wrong'] as const;
type Reason = (typeof REASONS)[number];

export async function POST(request: Request) {
  let body: { answer?: unknown; reason?: unknown; lang?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const answer = typeof body.answer === 'string' ? body.answer.trim() : '';
  if (!answer) return NextResponse.json({ error: 'answer is required' }, { status: 400 });
  if (answer.length > MAX_ANSWER_CHARS) return NextResponse.json({ error: 'answer too long' }, { status: 413 });

  const reason: Reason = REASONS.includes(body.reason as Reason) ? (body.reason as Reason) : 'inappropriate';
  const lang = typeof body.lang === 'string' ? body.lang.slice(0, 5) : 'unknown';

  console.warn('[hadak-report]', JSON.stringify({ reason, lang, answer }));
  return new NextResponse(null, { status: 204 });
}
