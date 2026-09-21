import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    if (!stripe) {
      console.error('[Stripe Webhook] Stripe not configured');
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 501 });
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Handle events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        console.log('[Stripe Webhook] Subscription event:', event.data.object);
        // TODO: Update subscription status in Supabase
        break;

      case 'customer.subscription.deleted':
        console.log('[Stripe Webhook] Subscription cancelled:', event.data.object);
        // TODO: Update subscription status in Supabase
        break;

      case 'invoice.payment_succeeded':
        console.log('[Stripe Webhook] Payment succeeded:', event.data.object);
        // TODO: Update subscription status and payment record
        break;

      case 'invoice.payment_failed':
        console.log('[Stripe Webhook] Payment failed:', event.data.object);
        // TODO: Notify user of failed payment
        break;

      default:
        console.log('[Stripe Webhook] Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
