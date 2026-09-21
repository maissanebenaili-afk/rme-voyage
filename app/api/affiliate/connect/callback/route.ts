import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { exchangeAuthorizationCode, getConnectAccountStatus } from '@/lib/stripeConnect';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing code or state parameter' },
        { status: 400 }
      );
    }

    // Exchange authorization code for access token
    const tokenResponse = await exchangeAuthorizationCode(code);
    const stripeConnectId = tokenResponse.stripe_account_id;

    // Verify account status
    const accountStatus = await getConnectAccountStatus(stripeConnectId);

    // Get Supabase client (lazy load to avoid build-time errors)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Connect Callback] Supabase not configured');
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/dashboard/affiliate?error=config`
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Save Connect account to database
    const { error } = await supabase
      .from('user_stripe_connect')
      .upsert(
        {
          user_id: state,
          stripe_connect_id: stripeConnectId,
          status: accountStatus.charges_enabled ? 'active' : 'pending_verification',
          email: accountStatus.email || null,
          country: accountStatus.country || null,
          verified_at: accountStatus.charges_enabled ? new Date() : null,
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('[Connect Callback] Failed to save Connect account:', error);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/dashboard/affiliate?error=database`
      );
    }

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/dashboard/affiliate?connect_status=success`
    );
  } catch (error) {
    console.error('[Connect Callback] Error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/dashboard/affiliate?error=oauth_failed`
    );
  }
}
