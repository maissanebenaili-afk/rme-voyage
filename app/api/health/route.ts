import { NextResponse } from 'next/server';

export const revalidate = 60; // Revalidate every 60 seconds

export async function GET() {
  try {
    // Basic health checks
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      apis: {
        prayer: process.env.NODE_ENV === 'production' ? 'configured' : 'optional',
        hadak: process.env.ANTHROPIC_API_KEY ? 'configured' : 'optional',
      },
    };

    return NextResponse.json(checks, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
