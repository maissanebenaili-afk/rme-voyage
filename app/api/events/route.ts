import { NextResponse } from 'next/server';
import { cleanEventProps, isRmeEvent } from '@/lib/rmeEvents';

// Anonymous usage events: one `[rme-event]` line per event in the server logs
// (Netlify → Logs → Functions), like `[hadak-intent]`. No storage, no cookie,
// no IP address, and only whitelisted event names with cleaned props.
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

  console.info('[rme-event]', JSON.stringify({ ...cleanEventProps(body.props), event: body.event }));
  return new NextResponse(null, { status: 204 });
}
