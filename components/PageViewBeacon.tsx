'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackFunnelEvent } from '@/lib/partnerTracking';

/**
 * Where the visit came from, without personal data: the previous RME path for
 * an in-app move, the referring site's host for an outside link, else 'direct'.
 * Never a full outside URL (it can carry search terms or identifiers).
 */
export function visitSource(referrer: string, origin: string): string {
  if (!referrer) return 'direct';
  try {
    const url = new URL(referrer);
    if (url.origin === origin) return url.pathname;
    return url.hostname.replace(/^www\./, '');
  } catch {
    return 'direct';
  }
}

// Counts page views in the anonymous event log (/api/events): only the path, never the
// query string, no cookie, no identifier. Renders nothing; a failed send changes nothing.
export default function PageViewBeacon() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);
  useEffect(() => {
    if (!pathname) return;
    // Client-side navigation keeps document.referrer at the landing page's referrer,
    // so later views take their source from the previous path instead.
    const ref = previous.current ?? visitSource(document.referrer, window.location.origin);
    trackFunnelEvent({ event: 'page_view', placement: 'layout', page: pathname, data: { ref } });
    previous.current = pathname;
  }, [pathname]);
  return null;
}
