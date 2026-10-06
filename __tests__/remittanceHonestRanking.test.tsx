import { render, screen } from '@testing-library/react';
import RemittanceComparator from '@/components/RemittanceComparator';
import { LanguageProvider } from '@/lib/LanguageContext';

// What production returned for 500 € on 4 Oct 2026: hard-coded fees crowned Wise,
// which real quotes that morning placed 4th (5 431 MAD, not 5 519).
const PRODUCTION_500 = [
  ['wise', 'Wise', 5519.02], ['remitly', 'Remitly', 5490.18], ['worldremit', 'WorldRemit', 5478.97],
  ['moneygram', 'MoneyGram', 5467.77], ['western-union', 'Western Union', 5456.63],
].map(([id, name, received]) => ({
  id, name, received, fee: 2, appliedRate: 11, time: '24h', affiliateUrl: null, isAffiliate: false, costBasis: 'estimated',
}));

function mockApi(providers: object[]) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ from: 'EUR', to: 'MAD', amount: 500, midRate: 11.18, rateSource: 'x', observedAt: '', providers }),
  }) as unknown as typeof fetch;
}

const BEST = /^(Meilleur taux|Best rate)$/;

async function providerOrder() {
  render(<LanguageProvider><RemittanceComparator /></LanguageProvider>);
  await screen.findByText('Wise', {}, { timeout: 2000 });
  return screen.getAllByText(/^(Wise|Remitly|WorldRemit|MoneyGram|Western Union)$/).map((n) => n.textContent);
}

describe('Remittance comparator never ranks its own estimates', () => {
  it('estimates: no medal, no "best" badge, alphabetical order, each amount marked as an estimate', async () => {
    mockApi(PRODUCTION_500);
    const order = await providerOrder();
    expect(screen.queryByText('🥇')).toBeNull();
    expect(screen.queryByText(BEST)).toBeNull();
    expect(order).toEqual(['MoneyGram', 'Remitly', 'Western Union', 'Wise', 'WorldRemit']);
    expect(screen.getAllByText('estimation RME, non vérifiée')).toHaveLength(5);
  });

  it('dated provider quotes keep the podium (the path back once data is authorised)', async () => {
    mockApi(PRODUCTION_500.map((p) => ({ ...p, costBasis: 'quoted' })));
    expect((await providerOrder())[0]).toBe('Wise');
    expect(screen.getByText('🥇')).toBeTruthy();
    expect(screen.getByText(BEST)).toBeTruthy();
  });
});
