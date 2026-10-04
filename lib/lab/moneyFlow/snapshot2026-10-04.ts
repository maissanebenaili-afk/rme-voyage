import type { TransferQuote } from './quotes';

// Quotes collected by hand on 4 October 2026 for the lab measurement only.
// Never displayed: the right to show these prices is not established.
const WISE_COMPARISON = 'https://api.wise.com/v4/comparisons/?sourceCurrency=EUR&targetCurrency=MAD&sourceCountry=FR&targetCountry=MA';
const REMITLY_CALCULATOR = 'https://api.remitly.io/v3/calculator/estimate?conduit=FRA:EUR-MAR:MAD&pay_out=BANK_DEPOSIT';
const RME_PRODUCTION = 'https://rme-voyage.netlify.app/api/remittance';

type Row = Omit<TransferQuote, 'sendEur'>;

const AT_500: Row[] = [
  // Remitly's own calculator gives both rates: base 11.08 and 11.21 on the first 500 € of a new customer.
  { provider: 'Remitly', feeEur: 0, rate: 11.21, receivedMad: 5605, audience: 'new_customer', priceKind: 'promotional', promoCapEur: 500, conditions: ['virement bancaire au Maroc'], collectedAt: '2026-10-04T08:20Z', source: REMITLY_CALCULATOR, confidence: 'PROVIDER_API' },
  { provider: 'Remitly', feeEur: 0, rate: 11.08, receivedMad: 5540, audience: 'any_customer', priceKind: 'standard', conditions: ['virement bancaire au Maroc'], collectedAt: '2026-10-04T08:20Z', source: REMITLY_CALCULATOR, confidence: 'PROVIDER_API' },
  { provider: 'BNP Paribas', feeEur: 0, rate: 11.0297, receivedMad: 5514.85, audience: 'account_holder', priceKind: 'UNKNOWN', conditions: ['depuis un compte BNP'], collectedAt: '2026-10-03T14:10Z', source: WISE_COMPARISON, confidence: 'THIRD_PARTY_COMPARATOR' },
  { provider: 'Western Union', feeEur: 2.99, rate: 10.956063, receivedMad: 5445.27, audience: 'UNKNOWN', priceKind: 'UNKNOWN', conditions: [], collectedAt: '2026-10-04T06:32Z', source: WISE_COMPARISON, confidence: 'THIRD_PARTY_COMPARATOR' },
  // Wise prices itself at the mid-market rate for every customer: no new-customer offer in the data.
  { provider: 'Wise', feeEur: 14.07, rate: 11.1771, receivedMad: 5431.29, audience: 'any_customer', priceKind: 'standard', conditions: ['livraison jusqu’à 96 h'], collectedAt: '2026-10-04T06:58Z', source: WISE_COMPARISON, confidence: 'THIRD_PARTY_COMPARATOR' },
  { provider: 'OFX', feeEur: 10, rate: 10.8304, receivedMad: 5306.9, audience: 'UNKNOWN', priceKind: 'UNKNOWN', conditions: [], collectedAt: '2026-10-04T06:28Z', source: WISE_COMPARISON, confidence: 'THIRD_PARTY_COMPARATOR' },
  { provider: 'La Banque Postale', feeEur: 37.9, rate: 10.9084, receivedMad: 5040.78, audience: 'account_holder', priceKind: 'UNKNOWN', conditions: ['depuis un compte La Banque Postale'], collectedAt: '2026-10-02T06:57Z', source: WISE_COMPARISON, confidence: 'THIRD_PARTY_COMPARATOR' },
];

const AT_1000: Row[] = [
  // 500 € at 11.21 + 500 € at 11.08: the promotion stops at the cap.
  { provider: 'Remitly', feeEur: 0, rate: null, receivedMad: 11145, audience: 'new_customer', priceKind: 'promotional', promoCapEur: 500, conditions: ['virement bancaire au Maroc'], collectedAt: '2026-10-04T08:20Z', source: REMITLY_CALCULATOR, confidence: 'PROVIDER_API' },
  { provider: 'Remitly', feeEur: 0, rate: 11.08, receivedMad: 11080, audience: 'any_customer', priceKind: 'standard', conditions: ['virement bancaire au Maroc'], collectedAt: '2026-10-04T08:20Z', source: REMITLY_CALCULATOR, confidence: 'PROVIDER_API' },
  { provider: 'Wise', feeEur: 24.16, rate: 11.1771, receivedMad: 10907.06, audience: 'any_customer', priceKind: 'standard', conditions: ['livraison jusqu’à 96 h'], collectedAt: '2026-10-04T06:58Z', source: WISE_COMPARISON, confidence: 'THIRD_PARTY_COMPARATOR' },
];

// What RME production showed for 500 € on the same morning (hard-coded fees and margins).
export const RME_PRODUCTION_500: TransferQuote[] = [
  ['Wise', 3.89, 11.1246, 5519.02], ['Remitly', 3.99, 11.0687, 5490.18], ['WorldRemit', 2.49, 11.0128, 5478.97],
  ['MoneyGram', 1.99, 10.9792, 5467.77], ['Western Union', 1.99, 10.9569, 5456.63],
].map(([provider, feeEur, rate, receivedMad]) => ({
  provider: provider as string, sendEur: 500, feeEur: feeEur as number, rate: rate as number, receivedMad: receivedMad as number,
  audience: 'UNKNOWN', priceKind: 'UNKNOWN', conditions: [], collectedAt: '2026-10-04T08:13Z', source: RME_PRODUCTION, confidence: 'ESTIMATED',
}));

export const SNAPSHOT_500: TransferQuote[] = AT_500.map((r) => ({ ...r, sendEur: 500 }));
export const SNAPSHOT_1000: TransferQuote[] = AT_1000.map((r) => ({ ...r, sendEur: 1000 }));
