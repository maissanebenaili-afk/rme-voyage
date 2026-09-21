import { stripe } from './stripe';

const STRIPE_CONNECT_CLIENT_ID = process.env.STRIPE_CONNECT_CLIENT_ID || '';

export function getConnectAuthorizationUrl(userId: string, state?: string): string {
  if (!STRIPE_CONNECT_CLIENT_ID) {
    throw new Error('STRIPE_CONNECT_CLIENT_ID not configured');
  }

  const params = new URLSearchParams({
    client_id: STRIPE_CONNECT_CLIENT_ID,
    state: state || userId,
    stripe_user: JSON.stringify({
      email: '',
    }),
  });

  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeAuthorizationCode(code: string): Promise<{
  stripe_account_id: string;
  stripe_user_id: string;
  access_token: string;
}> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const clientSecret = process.env.STRIPE_CONNECT_CLIENT_SECRET || '';
  if (!clientSecret) {
    throw new Error('STRIPE_CONNECT_CLIENT_SECRET not configured');
  }

  const response = await fetch('https://connect.stripe.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(`OAuth token exchange failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getConnectAccountStatus(
  stripeConnectId: string
): Promise<{
  id: string;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  type: string;
  email?: string;
  country?: string;
}> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const account = await stripe.accounts.retrieve(stripeConnectId);

  return {
    id: account.id,
    charges_enabled: account.charges_enabled || false,
    payouts_enabled: account.payouts_enabled || false,
    type: account.type,
    email: account.email || undefined,
    country: account.country || undefined,
  };
}

export async function getConnectAccountLink(stripeConnectId: string): Promise<{
  url: string;
  expires_at: number;
}> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const accountLink = await stripe.accountLinks.create({
    account: stripeConnectId,
    type: 'account_onboarding',
    refresh_url: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/dashboard/affiliate/connect/refresh`,
    return_url: `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}/dashboard/affiliate?connect_status=success`,
  });

  return {
    url: accountLink.url,
    expires_at: accountLink.expires_at,
  };
}

export async function getPayoutBalance(stripeConnectId: string): Promise<{
  available: number;
  pending: number;
  currency: string;
}> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const balance = await (stripe.balance.retrieve as any)({}, {
    stripeAccount: stripeConnectId,
  });

  const available = balance.available[0]?.amount || 0;
  const pending = balance.pending[0]?.amount || 0;
  const currency = balance.available[0]?.currency || 'eur';

  return {
    available: available / 100,
    pending: pending / 100,
    currency,
  };
}

export async function initiateTransfer(
  stripeConnectId: string,
  amountCents: number,
  description: string
): Promise<{
  id: string;
  amount: number;
  status: string;
}> {
  if (!stripe) {
    throw new Error('Stripe not configured');
  }

  const transfer = await stripe.transfers.create({
    amount: amountCents,
    currency: 'eur',
    destination: stripeConnectId,
    description,
  });

  return {
    id: transfer.id,
    amount: transfer.amount / 100,
    status: (transfer as any).status || 'created',
  };
}
