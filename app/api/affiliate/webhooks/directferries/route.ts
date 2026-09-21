import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const DIRECTFERRIES_WEBHOOK_SECRET = process.env.DIRECTFERRIES_WEBHOOK_SECRET || '';

function validateDirectFerriesSignature(body: string, signature: string): boolean {
  if (!DIRECTFERRIES_WEBHOOK_SECRET) {
    console.warn('[Direct Ferries Webhook] No webhook secret configured');
    return false;
  }

  const expected = crypto
    .createHmac('sha256', DIRECTFERRIES_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return expected === signature;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-signature') || '';

    // Log webhook for audit
    const payloadHash = crypto.createHash('sha256').update(body).digest('hex');

    // Validate signature
    if (!validateDirectFerriesSignature(body, signature)) {
      console.warn('[Direct Ferries Webhook] Invalid signature');

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('affiliate_partner_webhooks')
          .insert({
            program: 'ferry',
            payload_hash: payloadHash,
            status: 'failed',
            error_message: 'Invalid signature',
          });
      }

      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);

    // Get Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Direct Ferries Webhook] Supabase not configured');
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle conversion event
    if (payload.type === 'booking_completed') {
      const { booking_id, booking_total, commission_percentage } = payload;

      // Find the click by reference ID
      const { data: clicks } = await supabase
        .from('affiliate_clicks')
        .select('id, user_id')
        .eq('program', 'ferry')
        .contains('metadata', { booking_ref: booking_id })
        .limit(1)
        .single();

      if (clicks) {
        // Create conversion record
        const commissionEarned = (booking_total * commission_percentage) / 100;

        await supabase.from('affiliate_conversions').insert({
          click_id: clicks.id,
          user_id: clicks.user_id,
          program: 'ferry',
          status: 'confirmed',
          amount: booking_total,
          currency: 'EUR',
          commission_rate: commission_percentage,
          commission_earned: commissionEarned,
          conversion_url: payload.booking_url,
        });
      }

      // Log webhook
      await supabase.from('affiliate_partner_webhooks').insert({
        program: 'ferry',
        payload_hash: payloadHash,
        status: 'processed',
        payload,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Direct Ferries Webhook] Error:', error);

    // Log error webhook
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const body = await (error as any).text?.();
      const payloadHash = crypto
        .createHash('sha256')
        .update(body || '')
        .digest('hex');

      await supabase.from('affiliate_partner_webhooks').insert({
        program: 'ferry',
        payload_hash: payloadHash,
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
