import { buildFerryAffiliateUrl, buildFlightAffiliateUrl } from '@/lib/affiliate';
import { verifiedPartnerUrl } from '@/lib/bookingLinks';

describe('Approved partner links', () => {
  const original = { ...process.env };
  afterEach(() => { process.env = { ...original }; });
  const trip = { origin: 'Paris', destination: 'Tanger', date: '2027-06-10' };

  it('does not fabricate tracking from a publisher ID', () => {
    delete process.env.TRAVELPAYOUTS_FLIGHT_URL;
    process.env.TRAVELPAYOUTS_PARTNER_ID = '123';
    expect(buildFlightAffiliateUrl(trip)).toBeNull();
  });
  it('preserves the complete dashboard-issued link without fake city codes', () => {
    process.env.TRAVELPAYOUTS_FLIGHT_URL = 'https://tp.media/r?marker=123&p=456&u=https%3A%2F%2Fwww.skyscanner.fr%2F';
    expect(buildFlightAffiliateUrl(trip)).toBe(process.env.TRAVELPAYOUTS_FLIGHT_URL);
  });

  describe('buildFerryAffiliateUrl', () => {
    beforeEach(() => {
      delete process.env.DIRECT_FERRIES_AFFILIATE_URL;
      delete process.env.GNV_AFFILIATE_URL;
      delete process.env.FRS_AFFILIATE_URL;
    });

    it('requires a complete link, not an assumed template', () => {
      process.env.DIRECT_FERRIES_PARTNER_ID = '123';
      expect(buildFerryAffiliateUrl(trip)).toBeNull();
    });

    it('returns Direct Ferries when only it is configured', () => {
      process.env.DIRECT_FERRIES_AFFILIATE_URL = 'https://www.directferries.fr/?partner=approved';
      expect(buildFerryAffiliateUrl(trip)).toEqual({
        url: process.env.DIRECT_FERRIES_AFFILIATE_URL,
        provider: 'direct_ferries',
      });
    });

    it('returns GNV when only it is configured (independent of Direct Ferries)', () => {
      process.env.GNV_AFFILIATE_URL = 'https://www.gnv.it/fr/booking?ref=approved';
      expect(buildFerryAffiliateUrl(trip)).toEqual({
        url: process.env.GNV_AFFILIATE_URL,
        provider: 'gnv',
      });
    });

    it('returns FRS when only it is configured', () => {
      process.env.FRS_AFFILIATE_URL = 'https://www.frs.es/?ref=approved';
      expect(buildFerryAffiliateUrl(trip)).toEqual({
        url: process.env.FRS_AFFILIATE_URL,
        provider: 'frs',
      });
    });

    it('prefers Direct Ferries, then GNV, then FRS when several are configured', () => {
      process.env.DIRECT_FERRIES_AFFILIATE_URL = 'https://www.directferries.fr/?partner=approved';
      process.env.GNV_AFFILIATE_URL = 'https://www.gnv.it/fr/booking?ref=approved';
      process.env.FRS_AFFILIATE_URL = 'https://www.frs.es/?ref=approved';
      expect(buildFerryAffiliateUrl(trip)?.provider).toBe('direct_ferries');

      delete process.env.DIRECT_FERRIES_AFFILIATE_URL;
      expect(buildFerryAffiliateUrl(trip)?.provider).toBe('gnv');

      delete process.env.GNV_AFFILIATE_URL;
      expect(buildFerryAffiliateUrl(trip)?.provider).toBe('frs');
    });
  });

  it('accepts the Travelpayouts short link the link generator returns', () => {
    process.env.TRAVELPAYOUTS_FLIGHT_URL = 'https://aviasales.tp.st/AbCd1234';
    expect(buildFlightAffiliateUrl(trip)).toBe('https://aviasales.tp.st/AbCd1234');
  });

  it('accepts a tp.st short link only where tp.media is trusted', () => {
    expect(verifiedPartnerUrl('https://directferries.tp.st/x1', 'ferry')).toBe('https://directferries.tp.st/x1');
    expect(verifiedPartnerUrl('https://brand.tp.st/x1', 'other', ['esimmorocco.org'])).toBeNull();
  });

  it.each(['javascript:alert(1)', 'http://tp.media/r', 'https://tp.media.evil.test/',
    'https://user:password@tp.media/', 'https://tp.media:444/r', 'not-a-url',
    'http://aviasales.tp.st/x', 'https://tp.st/x', 'https://a.b.tp.st/x',
    'https://aviasales.tp.st.evil.test/x', 'https://evil-tp.st/x', 'https://-bad.tp.st/x'])(
    'rejects unsafe or unapproved destination %s', (url) => {
      expect(verifiedPartnerUrl(url, 'flight')).toBeNull();
    });
});
