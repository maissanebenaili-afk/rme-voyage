import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    // For MVP, return mock data
    // TODO: Implement Supabase query when database is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
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

    // TODO: Query affiliate_clicks and affiliate_conversions tables
    // Group by program, calculate conversion rate and revenue

    return NextResponse.json({
      programs: [
        { program: 'Airalo', clicks: 0, conversions: 0, revenue: 0, rate: '0%' },
        { program: 'Direct Ferries', clicks: 0, conversions: 0, revenue: 0, rate: '0%' },
        { program: 'Omio', clicks: 0, conversions: 0, revenue: 0, rate: '0%' },
      ],
      totalRevenue: 0,
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
