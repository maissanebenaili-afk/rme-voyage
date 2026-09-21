import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId || userId.length < 10) {
      return NextResponse.json(
        { error: 'Missing or invalid X-User-ID header' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({
        programs: [
          { program: 'Airalo', clicks: 0, conversions: 0, revenue: 0, rate: '0%' },
          { program: 'Direct Ferries', clicks: 0, conversions: 0, revenue: 0, rate: '0%' },
          { program: 'Omio', clicks: 0, conversions: 0, revenue: 0, rate: '0%' },
        ],
        totalRevenue: 0,
        period: 'all_time',
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all clicks for this user
    const { data: clicks, error: clicksError } = await supabase
      .from('affiliate_clicks')
      .select('id, program')
      .eq('user_id', userId);

    if (clicksError) {
      console.error('[Affiliate Stats] Clicks error:', clicksError);
      return NextResponse.json(
        { error: 'Failed to fetch clicks' },
        { status: 500 }
      );
    }

    // Get all conversions for this user
    const { data: conversions, error: conversionsError } = await supabase
      .from('affiliate_conversions')
      .select('program, commission_earned, status')
      .eq('user_id', userId)
      .eq('status', 'confirmed');

    if (conversionsError) {
      console.error('[Affiliate Stats] Conversions error:', conversionsError);
      return NextResponse.json(
        { error: 'Failed to fetch conversions' },
        { status: 500 }
      );
    }

    // Aggregate by program
    const programs: {
      [key: string]: {
        program: string;
        clicks: number;
        conversions: number;
        revenue: number;
      };
    } = {
      airalo: { program: 'Airalo', clicks: 0, conversions: 0, revenue: 0 },
      ferry: { program: 'Direct Ferries', clicks: 0, conversions: 0, revenue: 0 },
      omio: { program: 'Omio', clicks: 0, conversions: 0, revenue: 0 },
    };

    // Count clicks by program
    clicks?.forEach((click) => {
      if (programs[click.program]) {
        programs[click.program].clicks++;
      }
    });

    // Sum conversions and revenue by program
    let totalRevenue = 0;
    conversions?.forEach((conversion) => {
      if (programs[conversion.program]) {
        programs[conversion.program].conversions++;
        programs[conversion.program].revenue += conversion.commission_earned || 0;
        totalRevenue += conversion.commission_earned || 0;
      }
    });

    // Calculate conversion rates
    const programsList = Object.values(programs).map((p) => ({
      ...p,
      rate: p.clicks > 0 ? ((p.conversions / p.clicks) * 100).toFixed(1) + '%' : '0%',
    }));

    return NextResponse.json({
      programs: programsList,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      period: 'all_time',
      userId,
    });
  } catch (error) {
    console.error('[Affiliate Stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch affiliate stats' },
      { status: 500 }
    );
  }
}
