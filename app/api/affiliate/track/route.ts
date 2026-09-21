import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

function hashValue(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

export async function POST(req: NextRequest) {
  try {
    // Skip tracking if Supabase not configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({
        success: true,
        skipReason: 'Supabase not configured',
      });
    }

    const userId = req.headers.get('x-user-id');
    const body = await req.json();

    const { program, source, destination } = body;

    if (!program) {
      return NextResponse.json(
        { error: 'Missing program parameter' },
        { status: 400 }
      );
    }

    // Extract IP and User-Agent for fingerprinting
    const ip = req.headers.get('x-forwarded-for') ||
               req.headers.get('x-real-ip') ||
               'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    const ipHash = hashValue(ip);
    const userAgentHash = hashValue(userAgent);

    // Lazy load Supabase to avoid build-time errors
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Record click
    const { data, error } = await supabase
      .from('affiliate_clicks')
      .insert([{
        user_id: userId,
        program,
        source,
        destination,
        ip_hash: ipHash,
        user_agent_hash: userAgentHash,
        metadata: {
          ip_country: req.headers.get('cf-ipcountry'),
          timestamp: new Date().toISOString(),
        }
      }])
      .select('id')
      .single();

    if (error) {
      console.error('[Affiliate Track] Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to track click' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      clickId: data?.id,
    });
  } catch (error) {
    console.error('[Affiliate Track] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
