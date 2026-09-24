import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  let email: string;
  try {
    const body = (await request.json()) as { email?: string };
    email = (body.email ?? '').trim().toLowerCase();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  // Linear-time structural validation — avoids ReDoS from nested quantifiers.
  const atIdx = email.indexOf('@');
  const isValidEmail =
    atIdx > 0 &&
    atIdx < email.length - 1 &&
    !email.includes(' ') &&
    (() => { const domain = email.slice(atIdx + 1); const dot = domain.lastIndexOf('.'); return dot > 0 && dot < domain.length - 1; })();
  if (!isValidEmail) {
    return Response.json({ error: 'Email invalide' }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (resendKey && audienceId) {
    const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({ email, unsubscribed: false }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error('Resend error:', err);
      return Response.json({ error: 'Erreur serveur' }, { status: 502 });
    }
    return Response.json({ ok: true, message: 'Inscrit avec succès' });
  }

  // No Resend configured: the address cannot be stored, so never report a success
  // (and never write the address to the logs).
  console.warn('[newsletter] subscription refused: RESEND_API_KEY / RESEND_AUDIENCE_ID not configured');
  return Response.json(
    { error: 'Les inscriptions ne sont pas encore ouvertes. Reviens bientôt.' },
    { status: 503 },
  );
}
