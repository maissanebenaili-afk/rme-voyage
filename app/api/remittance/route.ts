import type { NextRequest } from 'next/server';
import { verifiedRemittanceUrl } from '@/lib/remittanceLinks';

const PROVIDERS = [
  {
    id: 'wise',
    name: 'Wise',
    spread: 0.005,
    fee: 3.89,
    time: '1-2j',
    affiliateEnvKey: 'WISE_AFFILIATE_URL',
    hosts: ['wise.com'],
    deepLinkFn: (amount: number) =>
      `https://wise.com/gb/send-money/?sourceCurrency=EUR&targetCurrency=MAD&sourceAmount=${amount}`,
  },
  {
    id: 'worldremit',
    name: 'WorldRemit',
    spread: 0.015,
    fee: 2.49,
    time: '24h',
    affiliateEnvKey: 'WORLDREMIT_AFFILIATE_URL',
    hosts: ['www.worldremit.com'],
    deepLinkFn: (amount: number) =>
      `https://www.worldremit.com/en/moneytransfer?selectedSendingCountryCode=FR&selectedReceivingCountryCode=MA&selectedSendingCurrencyCode=EUR&selectedReceivingCurrencyCode=MAD&amount=${amount}`,
  },
  {
    id: 'remitly',
    name: 'Remitly',
    spread: 0.010,
    fee: 3.99,
    time: '1-3j',
    affiliateEnvKey: 'REMITLY_AFFILIATE_URL',
    hosts: ['www.remitly.com'],
    deepLinkFn: (amount: number) =>
      `https://www.remitly.com/fr/fr/maroc?sendAmount=${amount}&sendCurrency=EUR`,
  },
  {
    id: 'western-union',
    name: 'Western Union',
    spread: 0.020,
    fee: 1.99,
    time: 'Instant',
    affiliateEnvKey: 'WESTERN_UNION_AFFILIATE_URL',
    hosts: ['www.westernunion.com'],
    deepLinkFn: (amount: number) =>
      `https://www.westernunion.com/fr/fr/send-money/app/start?toCountry=MA&fromCurrency=EUR&fromAmount=${amount}`,
  },
  {
    id: 'moneygram',
    name: 'MoneyGram',
    spread: 0.018,
    fee: 1.99,
    time: 'Instant',
    affiliateEnvKey: 'MONEYGRAM_AFFILIATE_URL',
    hosts: ['www.moneygram.com'],
    deepLinkFn: (amount: number) =>
      `https://www.moneygram.com/mgo/fr/fr/envoyer-de-l-argent/?currency=EUR&amount=${amount}&receiveCountry=MA`,
  },
] as const;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const rawAmount = searchParams.get('amount');
  const from = searchParams.get('from') || 'EUR';
  const to = searchParams.get('to') || 'MAD';

  const amount = rawAmount ? parseFloat(rawAmount) : 500;
  if (!isFinite(amount) || amount <= 0 || amount > 1_000_000) {
    return Response.json({ error: 'Invalid amount' }, { status: 400 });
  }

  // Fetch mid-market rate — fawaz-ahmed currency API, free, no key, supports MAD
  let midRate: number;
  try {
    const baseCurrency = from.toLowerCase();
    const targetCurrency = to.toLowerCase();
    const rateRes = await fetch(
      `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${encodeURIComponent(baseCurrency)}.json`,
      { next: { revalidate: 3600 } }
    );
    if (!rateRes.ok) throw new Error('upstream');
    const rateData = (await rateRes.json()) as Record<string, Record<string, number>>;
    midRate = rateData[baseCurrency]?.[targetCurrency] ?? 0;
    if (!midRate) throw new Error('no rate');
  } catch {
    return Response.json({ error: 'Exchange rate unavailable' }, { status: 502 });
  }

  const results = PROVIDERS.map((p) => {
    const netSent = amount - p.fee;
    const received = netSent > 0 ? netSent * midRate * (1 - p.spread) : 0;
    // Prefer a verified affiliate URL; otherwise the provider's public pre-filled page,
    // which is NOT an affiliate link and must not be labelled as one.
    const partnerUrl = verifiedRemittanceUrl(process.env[p.affiliateEnvKey], p.hosts);
    return {
      id: p.id,
      name: p.name,
      fee: p.fee,
      appliedRate: parseFloat((midRate * (1 - p.spread)).toFixed(4)),
      received: parseFloat(received.toFixed(2)),
      time: p.time,
      url: partnerUrl ?? p.deepLinkFn(amount),
      sponsored: partnerUrl !== null,
    };
  }).sort((a, b) => b.received - a.received);

  return Response.json({
    from,
    to,
    amount,
    midRate,
    // Fees and spreads are manually entered averages, not live provider quotes.
    estimate: true,
    providers: results,
  });
}
