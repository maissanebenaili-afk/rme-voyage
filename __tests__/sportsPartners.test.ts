import { describe, expect, it } from 'vitest';
import { getSportsPartners } from '@/lib/sportsPartners';

describe('sports partners', () => {
  it('keeps sports operators pending until an affiliate URL is actually configured', () => {
    const partners = getSportsPartners();
    expect(partners).toHaveLength(4);
    expect(partners.every((partner) => partner.status === 'pending')).toBe(true);
    expect(partners.every((partner) => partner.affiliateUrl === undefined)).toBe(true);
  });

  it('exposes only HTTPS official fallback URLs', () => {
    const partners = getSportsPartners();
    for (const partner of partners) {
      expect(partner.url).toMatch(/^https:\/\//);
    }
  });
});
