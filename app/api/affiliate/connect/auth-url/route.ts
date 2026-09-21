import { NextRequest, NextResponse } from 'next/server';
import { getConnectAuthorizationUrl } from '@/lib/stripeConnect';

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');

    if (!userId || userId.length < 10) {
      return NextResponse.json(
        { error: 'Missing or invalid X-User-ID header' },
        { status: 401 }
      );
    }

    const authUrl = getConnectAuthorizationUrl(userId);

    return NextResponse.json({
      auth_url: authUrl,
    });
  } catch (error) {
    console.error('[Connect Auth URL] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    );
  }
}
