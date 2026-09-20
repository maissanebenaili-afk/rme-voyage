import { NextResponse } from 'next/server';

/**
 * This endpoint is intentionally unavailable until server-side authentication
 * and ownership policies are implemented. The prior implementation accepted a
 * client-controlled userId and kept fallback data in process memory.
 */
const response = () => NextResponse.json(
  {
    error: 'Trips are temporarily unavailable while secure accounts are being implemented.',
    code: 'TRIPS_AUTH_REQUIRED',
  },
  { status: 410 },
);

export const GET = response;
export const POST = response;
export const PUT = response;
export const DELETE = response;
