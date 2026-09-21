import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';

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

    // Get Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Stripe Webhook] Supabase not configured');
      return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle events
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        console.log('[Stripe Webhook] Subscription event:', subscription);

        // Find user by stripe customer ID
        const { data: stripeCustomer } = await supabase
          .from('stripe_customers')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single();

        if (stripeCustomer) {
          const periodStart = new Date(subscription.current_period_start * 1000);
          const periodEnd = new Date(subscription.current_period_end * 1000);

          await supabase
            .from('subscriptions')
            .upsert(
              {
                user_id: stripeCustomer.user_id,
                stripe_subscription_id: subscription.id,
                status: subscription.status,
                tier: 'premium',
                current_period_start: periodStart.toISOString(),
                current_period_end: periodEnd.toISOString(),
                cancel_at_period_end: subscription.cancel_at_period_end || false,
              },
              { onConflict: 'user_id' }
            );
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        console.log('[Stripe Webhook] Subscription cancelled:', subscription);

        const { data: stripeCustomer } = await supabase
          .from('stripe_customers')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer)
          .single();

        if (stripeCustomer) {
          await supabase
            .from('subscriptions')
            .update({ status: 'canceled' })
            .eq('user_id', stripeCustomer.user_id);
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        console.log('[Stripe Webhook] Payment succeeded:', invoice);

        if (invoice.subscription) {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', invoice.subscription)
            .single();

          if (subscription) {
            // Update subscription status to active
            await supabase
              .from('subscriptions')
              .update({ status: 'active' })
              .eq('user_id', subscription.user_id);
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        console.log('[Stripe Webhook] Payment failed:', invoice);

        if (invoice.subscription) {
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', invoice.subscription)
            .single();

          if (subscription) {
            // Mark subscription as payment_failed
            await supabase
              .from('subscriptions')
              .update({ status: 'payment_failed' })
              .eq('user_id', subscription.user_id);
          }
        }
        break;
      }

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
