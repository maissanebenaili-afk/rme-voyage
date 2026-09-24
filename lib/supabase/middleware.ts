import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Supabase is optional (see DEVELOPMENT.md): without both variables the app runs
// in mock-data mode, and the proxy must not throw on every request.
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

type SessionResult = { response: NextResponse; userId: string | null };

/**
 * Refreshes the Supabase auth session cookies for this request and returns the
 * response that carries them, plus the authenticated user id validated from the
 * session JWT (null if there is none). Callers must build on the returned
 * response (add headers to it) rather than creating a new one, or refreshed
 * cookies are lost.
 *
 * The returned response also carries an X-User-ID header forwarded to route
 * handlers, set to this verified userId (or stripped if unauthenticated) —
 * never to whatever a client sent. Route handlers must trust this header only
 * because the proxy overwrites it here; do not read X-User-ID before this runs.
 */
export async function updateSession(request: NextRequest): Promise<SessionResult> {
  let userId: string | null = null;
  let pendingCookies: { name: string; value: string; options?: CookieOptions }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          pendingCookies = cookiesToSet;
        },
      },
    },
  );

  // Validates the JWT and refreshes an expired session (getSession() does not validate).
  // If Supabase is unreachable the page is still served, without a refreshed session:
  // auth decisions are made server-side (app/auth/actions.ts), not here.
  try {
    const { data } = await supabase.auth.getClaims();
    userId = (data?.claims?.sub as string | undefined) ?? null;
  } catch (error) {
    console.warn('Supabase session refresh failed', error);
  }

  const headers = new Headers(request.headers);
  if (userId) {
    headers.set('x-user-id', userId);
  } else {
    headers.delete('x-user-id');
  }

  const response = NextResponse.next({ request: { headers } });
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));

  return { response, userId };
}
