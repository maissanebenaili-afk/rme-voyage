import { NextResponse } from 'next/server';

/**
 * This endpoint is intentionally unavailable until server-side authentication,
 * moderation, and ownership policies are implemented. It must not publish
 * unverified example recommendations as community data.
 */
const response = () => NextResponse.json(
  {
    error: 'Community tips are temporarily unavailable while moderation is being implemented.',
    code: 'COMMUNITY_TIPS_MODERATION_REQUIRED',
  },
  { status: 410 },
);

export const GET = response;
export const POST = response;
