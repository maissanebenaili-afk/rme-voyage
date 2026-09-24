import Stripe from 'stripe';

// Stripe is optional, same fallback pattern as Supabase and the affiliate
// links: without a secret key, the app must not throw, it must say so.
export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let client: Stripe | null = null;

export function getStripeClient(): Stripe | null {
  if (!isStripeConfigured()) return null;
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return client;
}
