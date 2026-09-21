import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  // For now, this is a pass-through middleware
  // In the future, this will refresh Supabase auth sessions
  const response = NextResponse.next();

  // Add X-User-ID header from localStorage if not present
  // (client-side will set this, but add fallback for testing)
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    // Generate a temporary session ID for guests (will be replaced by localStorage client UUID)
    const guestId = `guest_${Date.now()}`;
    response.headers.set('x-user-id', guestId);
  }

  return response;
}
