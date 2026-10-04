import type { RmeEventName, RmeEventProps } from '@/lib/rmeEvents';

// Durable storage for the anonymous `[rme-event]` lines. Netlify keeps function
// logs about a day, so a partner click could not be proven a week later.
//
// When RME_EVENTS_SUPABASE_URL and RME_EVENTS_SUPABASE_KEY (the project's anon
// key) are set, each event is also inserted in the `rme_events` table
// (supabase/rme_events.sql) through the REST API. Row-level security there
// allows INSERT only: that key can write an event, never read the table; the
// founder reads it in the Supabase dashboard. Dedicated server-only variables,
// not NEXT_PUBLIC_SUPABASE_*: those also switch on sign-in and a session
// refresh on every request (proxy.ts). Without them nothing changes.

const TIMEOUT_MS = 1500;

export type StoreResult = 'stored' | 'not_configured' | 'failed';

export function eventStoreConfig(env: Record<string, string | undefined> = process.env) {
  const url = env.RME_EVENTS_SUPABASE_URL?.trim();
  const key = env.RME_EVENTS_SUPABASE_KEY?.trim();
  if (!url || !key) return null;
  try {
    const parsed = new URL(url);
    // Only a Supabase project: a mistyped variable must not send events elsewhere.
    if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.supabase.co')) return null;
    return { endpoint: `${parsed.origin}/rest/v1/rme_events`, key };
  } catch {
    return null;
  }
}

export async function storeEvent(
  event: RmeEventName,
  props: RmeEventProps,
  env: Record<string, string | undefined> = process.env,
): Promise<StoreResult> {
  const config = eventStoreConfig(env);
  if (!config) return 'not_configured';
  try {
    const res = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        apikey: config.key,
        Authorization: `Bearer ${config.key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ event, props }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return res.ok ? 'stored' : 'failed';
  } catch {
    return 'failed';
  }
}
