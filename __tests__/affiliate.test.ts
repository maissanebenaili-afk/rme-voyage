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
  it('requires a complete ferry link, not an assumed template', () => {
    delete process.env.DIRECT_FERRIES_AFFILIATE_URL;
    process.env.DIRECT_FERRIES_PARTNER_ID = '123';
    expect(buildFerryAffiliateUrl(trip)).toBeNull();
    process.env.DIRECT_FERRIES_AFFILIATE_URL = 'https://www.directferries.fr/?partner=approved';
    expect(buildFerryAffiliateUrl(trip)).toBe(process.env.DIRECT_FERRIES_AFFILIATE_URL);
  });
  it.each(['javascript:alert(1)', 'http://tp.media/r', 'https://tp.media.evil.test/',
    'https://user:password@tp.media/', 'https://tp.media:444/r', 'not-a-url'])(
    'rejects unsafe or unapproved destination %s', (url) => {
      expect(verifiedPartnerUrl(url, 'flight')).toBeNull();
    });
});
