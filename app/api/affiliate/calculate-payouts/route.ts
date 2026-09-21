import { NextRequest, NextResponse } from 'next/server';
import { calculateAndProcessPayouts } from '@/lib/payout';

export async function POST(req: NextRequest) {
  try {
    // Verify internal request (should come from cron or admin)
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.PAYOUT_CALCULATION_SECRET || '';

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const results = await calculateAndProcessPayouts();

    return NextResponse.json({
      success: true,
      processed: results?.length || 0,
      results,
    });
  } catch (error) {
    console.error('[Calculate Payouts] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Payout calculation failed',
      },
      { status: 500 }
    );
  }
}
