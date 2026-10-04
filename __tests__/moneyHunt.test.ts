import { decide, type Sender } from '@/lib/lab/moneyFlow/quotes';
import { RME_PRODUCTION_500, SNAPSHOT_1000, SNAPSHOT_500 } from '@/lib/lab/moneyFlow/snapshot2026-10-04';
import { verifiedPartnerUrl } from '@/lib/bookingLinks';

const nobody: Sender = { knownProviders: [], bankAccounts: [] };
const top = (s: Sender, q = SNAPSHOT_500) => decide(q, s).ranked[0];

describe('Money Flow lab — five real senders, quotes of 4 Oct 2026', () => {
  it('1. first transfer, 500 €: the promotion wins and says it is a first-transfer price', () => {
    const t = top(nobody);
    expect([t.quote.provider, t.quote.receivedMad]).toEqual(['Remitly', 5605]);
    expect(t.reason).toMatch(/Premier envoi seulement/);
  });

  it('2. regular Remitly sender, 500 €: the promotion is gone, the normal price still wins', () => {
    const d = decide(SNAPSHOT_500, { knownProviders: ['Remitly'], bankAccounts: [] });
    expect([d.ranked[0].quote.priceKind, d.ranked[0].quote.receivedMad]).toEqual(['standard', 5540]);
    expect(d.excluded.find((e) => e.quote.priceKind === 'promotional')?.reason).toBe('offre réservée aux nouveaux clients');
  });

  it('3. regular Wise sender, 500 €: switching is worth 108.71 MAD per transfer', () => {
    const d = decide(SNAPSHOT_500, { knownProviders: ['Wise', 'Remitly'], bankAccounts: [] });
    const wise = d.ranked.find((p) => p.quote.provider === 'Wise')!;
    expect(+(d.ranked[0].quote.receivedMad! - wise.quote.receivedMad!).toFixed(2)).toBe(108.71);
  });

  it('4. first transfer, 1 000 €: the promotion stops at 500 €, worth only 65 MAD', () => {
    const d = decide(SNAPSHOT_1000, nobody);
    const promo = d.ranked.find((p) => p.quote.priceKind === 'promotional')!;
    const normal = d.ranked.find((p) => p.quote.priceKind === 'standard' && p.quote.provider === 'Remitly')!;
    expect(promo.quote.receivedMad! - normal.quote.receivedMad!).toBe(65);
  });

  it('5. not a BNP customer: the bank price and every price of unknown status are left out, with a reason', () => {
    const d = decide(SNAPSHOT_500, nobody);
    expect(d.ranked.map((p) => p.quote.provider)).not.toContain('BNP Paribas');
    expect(d.excluded.map((e) => e.quote.provider).sort()).toEqual(['BNP Paribas', 'La Banque Postale', 'OFX', 'Western Union']);
  });

  it('silent error found in production: RME estimates crown Wise; none of them is a quote', () => {
    const naive = [...RME_PRODUCTION_500].sort((a, b) => b.receivedMad! - a.receivedMad!);
    expect(naive[0].provider).toBe('Wise');
    expect(SNAPSHOT_500.find((q) => q.provider === 'Wise')!.receivedMad).toBe(5431.29); // 4th among real quotes
    expect(decide(RME_PRODUCTION_500, nobody).ranked).toHaveLength(0);
  });
});

describe('Ferry money leak — what activation would need', () => {
  it('today the ferry button links to the public site: no partner, no commission', () => {
    expect(verifiedPartnerUrl(undefined, 'ferry')).toBeNull();
  });

  it('a partner link is accepted only on the hosts already listed; any other Direct Ferries host is dropped silently', () => {
    expect(verifiedPartnerUrl('https://www.directferries.fr/?ref=x', 'ferry')).not.toBeNull();
    // The tracking host Direct Ferries Connect will issue is UNKNOWN: these would fall back to the unpaid link.
    expect(verifiedPartnerUrl('https://www.directferries.co.uk/?ref=x', 'ferry')).toBeNull();
    expect(verifiedPartnerUrl('https://connect.directferries.com/?ref=x', 'ferry')).toBeNull();
  });
});
