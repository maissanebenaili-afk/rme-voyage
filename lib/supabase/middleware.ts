import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// Supabase is optional (see DEVELOPMENT.md): without both variables the app runs
// in mock-data mode, and the proxy must not throw on every request.
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Refreshes the Supabase auth session cookies for this request and returns the
 * response that carries them. Callers must build on the returned response (add
 * headers to it) rather than creating a new one, or refreshed cookies are lost.
 */
export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request });

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
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Validates the JWT and refreshes an expired session (getSession() does not validate).
  // If Supabase is unreachable the page is still served, without a refreshed session:
  // auth decisions are made server-side (app/auth/actions.ts), not here.
  try {
    await supabase.auth.getClaims();
  } catch (error) {
    console.warn('Supabase session refresh failed', error);
  }

  return supabaseResponse;
}
