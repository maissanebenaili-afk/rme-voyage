import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  let email: string;
  try {
    const body = (await request.json()) as { email?: string };
    email = (body.email ?? '').trim().toLowerCase();
  } catch {
    return Response.json({ error: 'Invalid request' }, { status: 400 });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

  // No Resend configured — log and return success (collect manually later)
  console.log('[newsletter] new subscriber (no Resend configured):', email);
  return Response.json({ ok: true, message: 'Inscrit avec succès' });
}
