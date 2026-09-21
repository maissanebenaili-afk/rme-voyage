import { NextRequest, NextResponse } from 'next/server';
import { buildAiraloAffiliateUrl, buildFlightAffiliateUrl, buildFerryAffiliateUrl } from '@/lib/affiliate';

type AffiliateType = 'flight' | 'ferry' | 'esim';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const program = searchParams.get('program') as AffiliateType;
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const date = searchParams.get('date');

    if (!program) {
      return NextResponse.json(
        { error: 'Missing program parameter' },
        { status: 400 }
      );
    }

    let affiliateUrl: string | null = null;

    switch (program) {
      case 'flight':
        if (!origin || !destination) {
          return NextResponse.json(
            { error: 'Flight requires origin and destination' },
            { status: 400 }
          );
        }
        affiliateUrl = buildFlightAffiliateUrl({ origin, destination, date: date || undefined });
        break;

      case 'ferry':
        if (!origin || !destination) {
          return NextResponse.json(
            { error: 'Ferry requires origin and destination' },
            { status: 400 }
          );
        }
        affiliateUrl = buildFerryAffiliateUrl({ origin, destination, date: date || undefined });
        break;

      case 'esim':
        affiliateUrl = buildAiraloAffiliateUrl();
        break;

      default:
        return NextResponse.json(
          { error: 'Unknown program' },
          { status: 400 }
        );
    }

    if (!affiliateUrl) {
      return NextResponse.json(
        { error: 'Affiliate program not configured' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      url: affiliateUrl,
      program,
    });
  } catch (error) {
    console.error('[Affiliate Link] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
