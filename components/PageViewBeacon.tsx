'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackFunnelEvent } from '@/lib/partnerTracking';

// Counts page views in the anonymous event log (/api/events): only the path, never the
// query string, no cookie, no identifier. Renders nothing; a failed send changes nothing.
export default function PageViewBeacon() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname) trackFunnelEvent({ event: 'page_view', placement: 'layout', page: pathname });
  }, [pathname]);
  return null;
}
