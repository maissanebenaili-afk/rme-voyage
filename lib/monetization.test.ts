import {
  estimateExpectedValue,
  estimateFromMeasuredFunnel,
  monetizationCatalogue,
  selectOpportunities,
} from './monetization';

describe('monetization opportunity engine', () => {
  it('does not invent expected revenue when measurements are missing', () => {
    const result = estimateExpectedValue(monetizationCatalogue[0]);

    expect(result.expectedValue).toBeNull();
    expect(result.reason).toBe('insufficient_verified_measurements');
  });

  it('calculates expected value only from supplied measurements', () => {
    const result = estimateExpectedValue({
      ...monetizationCatalogue[0],
      commissionRate: 0.05,
      basketValue: 400,
      conversionProbability: 0.1,
    });

    expect(result.expectedValue).toBe(2);
  });

  it('binds measured clicks and bookings without inventing a forecast', () => {
    const result = estimateFromMeasuredFunnel(
      {
        ...monetizationCatalogue[0],
        commissionRate: 0.05,
      },
      {
        clicks: 100,
        bookings: 12,
        observedBasketValue: 400,
      },
    );

    expect(result.expectedValue).toBe(2.4);
  });

  it('returns UNKNOWN when measured funnel data is invalid', () => {
    const result = estimateFromMeasuredFunnel(
      {
        ...monetizationCatalogue[0],
        commissionRate: 0.05,
      },
      {
        clicks: 0,
        bookings: 1,
      },
    );

    expect(result.expectedValue).toBeNull();
    expect(result.reason).toBe('invalid_funnel_measurement');
  });

  it('rejects invalid conversion probabilities', () => {
    const result = estimateExpectedValue({
      ...monetizationCatalogue[0],
      commissionRate: 0.05,
      basketValue: 400,
      conversionProbability: 1.5,
    });

    expect(result.expectedValue).toBeNull();
    expect(result.reason).toBe('invalid_measurement');
  });

  it('returns only verified opportunities matching current intent', () => {
    const results = selectOpportunities(
      { ferryIntent: true, connectivityIntent: true },
      monetizationCatalogue,
    );

    expect(results.map((item) => item.id)).toEqual(['direct-ferries-core']);
  });

  it('keeps strategic opportunities out of the active funnel until verified', () => {
    const results = selectOpportunities(
      { serviceIntent: true },
      monetizationCatalogue,
    );

    expect(results).toEqual([]);
  });
});
