import type { GlobalDataSource } from '../globalData.js';
import type { GlobalDataFact } from '../../types.js';

/**
 * Real, live global data — no API key required. Pulls the EUR→MAD rate from
 * open.er-api.com (exchangerate-api.com's free tier) so the demo has at
 * least one fact that genuinely changes day to day, not just a fixture.
 */
export class LiveCurrencyRateSource implements GlobalDataSource {
  name = 'open-er-api-eur-mad';

  async fetch(): Promise<GlobalDataFact[]> {
    const res = await fetch('https://open.er-api.com/v6/latest/EUR', {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      throw new Error('Failed to fetch exchange rate data');
    }
    const data = (await res.json()) as {
      result?: string;
      rates?: Record<string, number>;
      time_last_update_utc?: string;
    };
    if (data.result !== 'success') {
      throw new Error('open.er-api.com response was not successful');
    }
    const rate = data.rates?.MAD;
    if (typeof rate !== 'number') {
      throw new Error('No MAD rate found in open.er-api.com response');
    }
    return [
      {
        id: `eur-mad-${data.time_last_update_utc ?? Date.now()}`,
        topic: 'eur_mad_rate',
        statement: `1 EUR ≈ ${rate.toFixed(2)} MAD`,
        value: rate,
        unit: 'MAD',
        fetchedAt: new Date().toISOString(),
        sourceUrl: 'https://www.exchangerate-api.com',
        sourceName: 'exchangerate-api.com (open.er-api.com free tier)',
      },
    ];
  }
}
