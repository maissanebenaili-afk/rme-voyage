'use client';

import type { AnchorHTMLAttributes } from 'react';
import { trackPartnerClick } from '@/lib/partnerTracking';

type LeadChannel = 'whatsapp' | 'phone' | 'site';

// A contact link to a partner business (quote, booking, call). Counts the
// click in RME's anonymous event log as a 'contact' click: not a lead, not a
// request, not a sale, which only the partner can confirm. Only the partner id
// and the channel are logged, never the number or message.
export default function LeadLink({
  partner,
  channel,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { partner: string; channel: LeadChannel }) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackPartnerClick({
          partner,
          product: 'contact',
          placement: `vendor_${channel}`,
          page: window.location.pathname,
        });
        onClick?.(event);
      }}
    />
  );
}
