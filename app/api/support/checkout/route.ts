import { NextRequest, NextResponse } from 'next/server';
import { getStripeClient, isStripeConfigured } from '@/lib/stripe';
import { siteUrl } from '@/lib/siteUrl';

const MIN_AMOUNT_CENTS = 100; // 1 €
const MAX_AMOUNT_CENTS = 100_000; // 1000 €, guards against a fat-fingered/abusive amount

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: 'Le don en ligne n\'est pas encore configuré.', configured: false },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const amountEur = (body as { amountEur?: unknown })?.amountEur;
  if (typeof amountEur !== 'number' || !Number.isFinite(amountEur)) {
    return NextResponse.json({ error: 'amountEur must be a number' }, { status: 400 });
  }

  const amountCents = Math.round(amountEur * 100);
  if (amountCents < MIN_AMOUNT_CENTS || amountCents > MAX_AMOUNT_CENTS) {
    return NextResponse.json(
      { error: `Montant invalide (entre ${MIN_AMOUNT_CENTS / 100}€ et ${MAX_AMOUNT_CENTS / 100}€)` },
      { status: 400 },
    );
  }

  const stripe = getStripeClient()!;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Don libre — Soutenir RME Voyage',
              description: 'Don ponctuel, sans contrepartie, pour soutenir le développement de RME Voyage.',
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/soutenir?status=success`,
      cancel_url: `${siteUrl}/soutenir?status=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL' }, { status: 502 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[Support Checkout] Stripe error');
    return NextResponse.json({ error: 'Unable to create checkout session' }, { status: 502 });
  }
}
