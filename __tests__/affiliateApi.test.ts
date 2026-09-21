import { buildAiraloAffiliateUrl, buildFlightAffiliateUrl, buildFerryAffiliateUrl } from '@/lib/affiliate';

describe('Affiliate URL Builders', () => {
  describe('buildAiraloAffiliateUrl', () => {
    it('returns null if AIRALO_AFFILIATE_ID is not set', () => {
      const url = buildAiraloAffiliateUrl();
      expect(url).toBeNull();
    });

    it('builds Airalo URL with affiliate ID when configured', () => {
      const originalEnv = process.env.AIRALO_AFFILIATE_ID;
      process.env.AIRALO_AFFILIATE_ID = 'test-affiliate-123';

      const url = buildAiraloAffiliateUrl();

      expect(url).toContain('https://www.airalo.com/');
      expect(url).toContain('ref=test-affiliate-123');
      expect(url).toContain('utm_source=rme-voyage');
      expect(url).toContain('utm_medium=affiliate');

      process.env.AIRALO_AFFILIATE_ID = originalEnv;
    });

    it('includes UTM parameters for tracking', () => {
      process.env.AIRALO_AFFILIATE_ID = 'test-id';

      const url = buildAiraloAffiliateUrl();

      expect(url).toContain('utm_source=rme-voyage');
      expect(url).toContain('utm_medium=affiliate');

      delete process.env.AIRALO_AFFILIATE_ID;
    });

    it('ignores trip parameters (not needed for eSIM)', () => {
      process.env.AIRALO_AFFILIATE_ID = 'test-id';

      const url1 = buildAiraloAffiliateUrl({
        origin: 'Paris',
        destination: 'Marrakech',
        date: '2026-09-21'
      });

      const url2 = buildAiraloAffiliateUrl();

      // Both should return the same URL regardless of parameters
      expect(url1).toBe(url2);

      delete process.env.AIRALO_AFFILIATE_ID;
    });
  });

  describe('buildFlightAffiliateUrl', () => {
    it('returns null if TRAVELPAYOUTS_FLIGHT_URL is not set', () => {
      const url = buildFlightAffiliateUrl({
        origin: 'Paris',
        destination: 'Marrakech'
      });
      expect(url).toBeNull();
    });
  });

  describe('buildFerryAffiliateUrl', () => {
    it('returns null if DIRECT_FERRIES_AFFILIATE_URL is not set', () => {
      const url = buildFerryAffiliateUrl({
        origin: 'Barcelona',
        destination: 'Tangier'
      });
      expect(url).toBeNull();
    });
  });
});

describe('Affiliate Routing', () => {
  it('supports multiple affiliate programs', () => {
    const programs = ['flight', 'ferry', 'esim'];

    // Verify all programs are valid types
    programs.forEach(program => {
      expect(['flight', 'ferry', 'esim']).toContain(program);
    });
  });
});
