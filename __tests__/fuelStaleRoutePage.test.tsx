import { render } from '@testing-library/react';
import TrajetPage from '../app/trajet/[slug]/page';
import { FUEL_PRICES } from '@/lib/fuelByCountry';
import { NON_EU_FALLBACK_PRICE } from '@/lib/routePages';

// Before: once the bulletin expired, the public route pages priced France and Spain
// at the 1,40 €/L non-EU guess, a third under the pump, while saying the prices were
// "more than two weeks old". The last bulletin is now kept, dated and marked stale.
const daysAfterBulletin = (days: number) => {
  const d = new Date(`${FUEL_PRICES.observedAt}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
};

const franceRow = (container: HTMLElement) =>
  container.querySelector('tr[data-country="FR"]')?.textContent?.replace(/\s/g, ' ') ?? '';

describe('route page fuel prices after the bulletin expires', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline'));
  });
  afterEach(() => jest.useRealTimers());

  const renderAt = async (days: number) => {
    jest.useFakeTimers({ doNotFake: ['nextTick', 'setImmediate'] }).setSystemTime(daysAfterBulletin(days));
    return render(await TrajetPage({ params: Promise.resolve({ slug: 'paris-tanger' }) })).container;
  };

  it('20 days after: France keeps its official price, marked stale', async () => {
    const row = franceRow(await renderAt(20));
    const official = FUEL_PRICES.prices.FR!.diesel!.toFixed(3).replace('.', ',');
    expect(row).toContain(official);
    expect(row).toContain('(périmé)');
    expect(row).not.toContain(NON_EU_FALLBACK_PRICE.toFixed(3).replace('.', ','));
  });

  it('30 days after: the guess applies everywhere, and the page says so', async () => {
    const container = await renderAt(30);
    expect(franceRow(container)).toContain('(hypothèse)');
    expect(container.textContent).toContain('bulletin trop ancien');
  });
});
