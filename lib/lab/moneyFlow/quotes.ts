// Lab only — not wired to any page. A transfer quote that keeps apart what a
// comparator usually blends: who the price is for, whether it is a promotion,
// and what the family actually receives. Unknown stays UNKNOWN.

export type Audience = 'new_customer' | 'any_customer' | 'account_holder' | 'UNKNOWN';
export type PriceKind = 'promotional' | 'standard' | 'UNKNOWN';
export type Confidence = 'PROVIDER_API' | 'THIRD_PARTY_COMPARATOR' | 'ESTIMATED' | 'UNKNOWN';

export interface TransferQuote {
  provider: string;
  sendEur: number;
  feeEur: number | null;
  rate: number | null;
  receivedMad: number | null;
  audience: Audience;
  priceKind: PriceKind;
  /** Only the first N euros get the promotional rate (Remitly: 500). */
  promoCapEur?: number;
  conditions: string[];
  collectedAt: string;
  source: string;
  confidence: Confidence;
}

export interface Sender {
  /** Providers this person has already used: their new-customer offers no longer apply. */
  knownProviders: string[];
  /** Banks where this person holds an account: other banks' prices do not apply. */
  bankAccounts: string[];
}

export interface Pick {
  quote: TransferQuote;
  /** Why this quote applies to this sender, in plain words. */
  reason: string;
}

export interface Decision {
  ranked: Pick[];
  excluded: { quote: TransferQuote; reason: string }[];
}

function excludeReason(q: TransferQuote, s: Sender): string | null {
  if (q.receivedMad == null) return 'montant reçu inconnu';
  if (q.confidence === 'ESTIMATED' || q.confidence === 'UNKNOWN') return 'prix estimé, pas un devis';
  if (q.priceKind === 'UNKNOWN') return 'on ne sait pas si ce prix est une promotion';
  if (q.audience === 'UNKNOWN') return 'on ne sait pas à qui ce prix s’adresse';
  if (q.audience === 'new_customer' && s.knownProviders.includes(q.provider)) return 'offre réservée aux nouveaux clients';
  if (q.audience === 'account_holder' && !s.bankAccounts.includes(q.provider)) return 'réservé aux clients de cette banque';
  return null;
}

/** Ranks only the quotes that really apply to this sender, by amount received. */
export function decide(quotes: TransferQuote[], sender: Sender): Decision {
  const ranked: Pick[] = [];
  const excluded: Decision['excluded'] = [];
  for (const q of quotes) {
    const why = excludeReason(q, sender);
    if (why) excluded.push({ quote: q, reason: why });
    else ranked.push({
      quote: q,
      reason: q.priceKind === 'promotional'
        ? `Premier envoi seulement${q.promoCapEur ? ` (promotion sur les ${q.promoCapEur} premiers euros)` : ''}`
        : 'Prix normal, valable aussi pour les envois suivants',
    });
  }
  ranked.sort((a, b) => (b.quote.receivedMad ?? 0) - (a.quote.receivedMad ?? 0));
  return { ranked, excluded };
}
