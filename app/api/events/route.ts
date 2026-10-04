import { NextResponse } from 'next/server';
import { storeEvent } from '@/lib/eventStore';
import { cleanEventProps, isRmeEvent } from '@/lib/rmeEvents';

// Anonymous usage events: one `[rme-event]` line per event in the server logs
// (Netlify → Logs → Functions), like `[hadak-intent]`, kept for good in the
// `rme_events` table when it is configured (lib/eventStore.ts). No cookie, no
// IP address, and only whitelisted event names with cleaned props.
const MAX_BODY_BYTES = 2048;

export async function POST(request: Request) {
  const raw = await request.text().catch(() => '');
  if (!raw || raw.length > MAX_BODY_BYTES) return NextResponse.json({ error: 'Invalid body' }, { status: 400 });

  let body: { event?: unknown; props?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  if (!isRmeEvent(body?.event)) return NextResponse.json({ error: 'Unknown event' }, { status: 400 });

  const props = cleanEventProps(body.props);
  console.info('[rme-event]', JSON.stringify({ ...props, event: body.event }));
  // Awaited: a serverless function may be frozen once it has answered.
  const stored = await storeEvent(body.event, props);
  if (stored === 'failed') console.warn('[rme-event-store] failed');
  return new NextResponse(null, { status: 204 });
}
