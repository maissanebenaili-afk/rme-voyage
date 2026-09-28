import { track } from '@vercel/analytics';

// One event per outbound partner click. Only coarse, non-personal properties are sent:
// never an e-mail, an amount, a route typed by the user or the destination URL.
export type OutboundClick = {
  partner: string;
  placement: 'booking-cards' | 'remittance';
  sponsored: boolean;
};

export function trackOutboundClick({ partner, placement, sponsored }: OutboundClick): void {
  try {
    track('Outbound Click', { partner, placement, sponsored });
  } catch {
    // Measurement must never block the link itself.
  }
}

export function trackNewsletterSignup(): void {
  try {
    track('Newsletter Signup');
  } catch {
    // Same rule: ignore measurement failures.
  }
}
