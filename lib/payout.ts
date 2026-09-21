import { createClient } from '@supabase/supabase-js';
import { stripe } from './stripe';

export async function calculateAndProcessPayouts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase not configured');
  }

  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Get current month period
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get confirmed conversions for the period
  const { data: conversions, error: conversionError } = await supabase
    .from('affiliate_conversions')
    .select('*')
    .eq('status', 'confirmed')
    .gte('created_at', periodStart.toISOString())
    .lt('created_at', periodEnd.toISOString());

  if (conversionError) {
    throw conversionError;
  }

  if (!conversions || conversions.length === 0) {
    console.log('[Payout] No confirmed conversions to process');
    return;
  }

  // Group conversions by user
  const userCommissions: {
    [userId: string]: { total: number; conversions: any[] };
  } = {};

  for (const conversion of conversions) {
    if (!conversion.user_id) continue;

    if (!userCommissions[conversion.user_id]) {
      userCommissions[conversion.user_id] = {
        total: 0,
        conversions: [],
      };
    }

    userCommissions[conversion.user_id].total += conversion.commission_earned || 0;
    userCommissions[conversion.user_id].conversions.push(conversion.id);
  }

  // Process each user's payout
  const results = [];

  for (const [userId, data] of Object.entries(userCommissions)) {
    try {
      // Get user's Stripe Connect account
      const { data: connectAccount, error: connectError } = await supabase
        .from('user_stripe_connect')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (connectError || !connectAccount) {
        console.warn(`[Payout] No Connect account for user ${userId}`);
        continue;
      }

      if (!connectAccount.status || connectAccount.status !== 'active') {
        console.warn(
          `[Payout] Connect account not ready for user ${userId}: ${connectAccount.status}`
        );
        continue;
      }

      // Create Stripe transfer (amount in cents)
      const amountCents = Math.round(data.total * 100);
      const transfer = await stripe.transfers.create({
        amount: amountCents,
        currency: 'eur',
        destination: connectAccount.stripe_connect_id,
        description: `Affiliate commissions - ${periodStart.toLocaleDateString()} to ${periodEnd.toLocaleDateString()}`,
      });

      // Record payout
      const { error: payoutError } = await supabase.from('affiliate_payouts').insert({
        user_id: userId,
        stripe_connect_id: connectAccount.stripe_connect_id,
        total_amount: data.total,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        status: 'completed',
        stripe_transfer_id: transfer.id,
        processed_at: new Date().toISOString(),
      });

      if (payoutError) {
        throw payoutError;
      }

      // Mark conversions as paid
      await supabase
        .from('affiliate_conversions')
        .update({ status: 'paid' })
        .in('id', data.conversions);

      results.push({
        userId,
        amount: data.total,
        transferId: transfer.id,
        status: 'completed',
      });

      console.log(
        `[Payout] Processed ${data.total.toFixed(2)}€ for user ${userId} (transfer: ${transfer.id})`
      );
    } catch (error) {
      console.error(`[Payout] Failed to process payout for user ${userId}:`, error);
      results.push({
        userId,
        amount: data.total,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

export async function getUserPayoutHistory(userId: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase not configured');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: payouts, error } = await supabase
    .from('affiliate_payouts')
    .select('*')
    .eq('user_id', userId)
    .order('period_end', { ascending: false });

  if (error) {
    throw error;
  }

  return payouts;
}
