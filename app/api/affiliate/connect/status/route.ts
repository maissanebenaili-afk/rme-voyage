import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getConnectAccountStatus, getPayoutBalance, getConnectAccountLink } from '@/lib/stripeConnect';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId || userId.length < 10) {
      return NextResponse.json(
        { error: 'Missing or invalid X-User-ID header' },
        { status: 401 }
      );
    }

    // Get Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Connect Status] Supabase not configured');
      return NextResponse.json(
        { error: 'Service unavailable' },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user's Connect account
    const { data: connectAccount, error } = await supabase
      .from('user_stripe_connect')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !connectAccount) {
      return NextResponse.json(
        {
          connected: false,
          status: null,
        },
        { status: 200 }
      );
    }

    // Get account status from Stripe
    const accountStatus = await getConnectAccountStatus(connectAccount.stripe_connect_id);

    // Get balance if account is fully verified
    let balance = null;
    if (accountStatus.charges_enabled && accountStatus.payouts_enabled) {
      balance = await getPayoutBalance(connectAccount.stripe_connect_id);
    }

    // Get onboarding link if account needs completion
    let onboardingUrl = null;
    if (!accountStatus.charges_enabled || !accountStatus.payouts_enabled) {
      const link = await getConnectAccountLink(connectAccount.stripe_connect_id);
      onboardingUrl = link.url;
    }

    return NextResponse.json({
      connected: true,
      status: {
        id: accountStatus.id,
        charges_enabled: accountStatus.charges_enabled,
        payouts_enabled: accountStatus.payouts_enabled,
        email: accountStatus.email,
        country: accountStatus.country,
      },
      balance,
      onboarding_url: onboardingUrl,
      verified_at: connectAccount.verified_at,
    });
  } catch (error) {
    console.error('[Connect Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get Connect status' },
      { status: 500 }
    );
  }
}
