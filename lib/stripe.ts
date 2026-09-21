import Stripe from 'stripe';

// Only initialize Stripe if secret key is available (at runtime)
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-08-26.dahlia',
    })
  : null;

export const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || '';

export const PREMIUM_TIER_CONFIG = {
  name: 'Premium',
  price: 4.99,
  currency: 'EUR',
  interval: 'month',
  features: [
    'Sauvegarder les modèles favoris',
    'Alertes de prix',
    'Historique de recherche',
    'Listes de voyage',
    'Accès prioritaire au catalogue',
  ],
};

export async function createCheckoutSession({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  if (!STRIPE_PRICE_ID) {
    throw new Error('NEXT_PUBLIC_STRIPE_PRICE_ID not configured');
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    line_items: [
      {
        price: STRIPE_PRICE_ID,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/account?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/premium`,
    metadata: {
      userId,
    },
  });

  return session;
}

export async function getSubscriptionStatus(userId: string) {
  // This will be implemented with Supabase query
  // Returns subscription status from DB
  return null;
}
