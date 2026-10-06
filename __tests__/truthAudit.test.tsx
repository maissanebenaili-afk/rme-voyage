import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CurrencyConverter, { parseLiveRates } from '@/components/CurrencyConverter';
import ServicesMap from '@/components/ServicesMap';

jest.mock('@/components/ServicesMapViewWrapper', () => function Mock() { return null; });

// Rates of the public source on 3 Oct 2026; the converter's fixed table said MAD 10.8, CAD 1.47.
const SOURCE = {
  date: '2026-10-03',
  eur: { mad: 11.18048328, usd: 1.12533272, gbp: 0.85000881, chf: 0.93278268, cad: 1.60366198, sek: 11.29569487, dkk: 7.475904, nok: 10.83221261 },
};

afterEach(() => jest.restoreAllMocks());

describe('currency converter shows the day rate, dated, or says it cannot', () => {
  it('uses the same public source as the remittance comparator, with its date', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => SOURCE }) as unknown as typeof fetch;
    render(<CurrencyConverter />);
    await waitFor(() => expect(document.querySelector('[data-rates="live"]')).not.toBeNull());
    expect(screen.getByText(/Taux de marché du 3 octobre 2026/)).toBeTruthy();
    // 100 EUR → 1 118,05 MAD with the day rate (the fixed table gave 1 080).
    expect(screen.getAllByText(/1\s118,05/).length).toBeGreaterThan(0);
  });

  it('says the rates are fixed and not current when the source fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('offline')) as unknown as typeof fetch;
    render(<CurrencyConverter />);
    await waitFor(() => expect(document.querySelector('[data-rates="fixed"]')).not.toBeNull());
    expect(screen.getByText(/Taux fixes, non à jour/)).toBeTruthy();
  });

  it('refuses a partial answer rather than mixing live and fixed rates', () => {
    expect(parseLiveRates({ date: '2026-10-03', eur: { ...SOURCE.eur, nok: undefined } })).toBeNull();
    expect(parseLiveRates({ eur: SOURCE.eur })).toBeNull();
    expect(parseLiveRates(SOURCE)?.rates.MAD).toBeCloseTo(11.18, 2);
  });
});

describe('a service searched on the road is counted, without the place', () => {
  it('logs the category and the number of places found, never the city typed', async () => {
    Object.defineProperty(navigator, 'sendBeacon', { value: undefined, configurable: true });
    const fetchMock = jest.fn(async (url: string) =>
      url.startsWith('/api/services')
        ? { ok: true, json: async () => ({ center: { lat: 42.34, lon: -3.7 }, results: [{ id: 'n/1', name: 'Taller', lat: 42.3, lon: -3.7, distanceMeters: 800 }] }) }
        : { ok: true, json: async () => ({}) },
    );
    global.fetch = fetchMock as unknown as typeof fetch;
    render(<ServicesMap />);
    fireEvent.click(screen.getByRole('button', { name: /Garages/i }));
    fireEvent.click(screen.getByRole('button', { name: /Rechercher/i }));
    await waitFor(() => expect(fetchMock.mock.calls.some(([u]) => u === '/api/events')).toBe(true));
    const [, init] = fetchMock.mock.calls.find(([u]) => u === '/api/events') as unknown as [string, { body: string }];
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ event: 'services_searched', props: { category: 'garage', results: 1, placement: 'services_map' } });
    expect(init.body).not.toMatch(/Tanger/);
  });
});
