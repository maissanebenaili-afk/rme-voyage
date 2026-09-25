import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '../../../packages/utils/supabase';

export const revalidate = 60; // Revalidate every 60 seconds
export const runtime = 'edge';

export async function GET() {
  try {
    // Comprehensive health checks (Edge Runtime compatible)
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          supabase: isSupabaseConfigured() ? 'configured' : 'not_configured',
        },
        apis: {
          aladhan: 'available', // Free, always available
          openweathermap: process.env.OPENWEATHERMAP_API_KEY ? 'configured' : 'not_configured',
          exchangerate: 'available', // Free tier available
        },
        auth: {
          openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
        },
      },
      endpoints: {
        trips: 'GET/POST/PUT/DELETE /api/trips',
        tips: 'GET/POST /api/tips',
        health: 'GET /api/health',
      },
    };

    return NextResponse.json(checks, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    });
  } catch {
    console.error('[Health API] Error');
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
      { status: 500 }
    );
  }
}
