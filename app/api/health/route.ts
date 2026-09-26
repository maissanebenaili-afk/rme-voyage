import { NextResponse } from 'next/server';
import { getProviderHealth, isFreeOnly } from '@/lib/hadakAiRouter';

export const revalidate = 60;
export const runtime = 'edge';

/**
 * Non-sensitive operational health.
 * Never return keys, tokens, Authorization headers, raw upstream errors,
 * request payloads, or PII.
 */
export async function GET() {
  try {
    const providerHealth = getProviderHealth();
    const providers = Object.fromEntries(
      Object.entries(providerHealth).map(([id, state]) => [id, {
        state: state.state,
        cooldown: state.cooldown_until !== null,
      }]),
    );

    return NextResponse.json({
      status: 'healthy',
      ai_router: {
        free_only: isFreeOnly(),
        providers,
      },
    }, {
      status: 200,
      headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' },
    });
  } catch {
    return NextResponse.json(
      { status: 'error' },
      { status: 500 },
    );
  }
}
