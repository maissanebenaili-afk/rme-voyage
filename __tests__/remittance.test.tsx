/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from '../app/api/remittance/route';
import { verifiedRemittanceUrl } from '@/lib/remittanceLinks';

const ENV_KEYS = ['WISE_AFFILIATE_URL', 'REMITLY_AFFILIATE_URL'];

describe('verifiedRemittanceUrl', () => {
  it('accepts only a plain https URL on an allowed host', () => {
    expect(verifiedRemittanceUrl('https://wise.com/invite/abc', ['wise.com'])).toBe('https://wise.com/invite/abc');
    expect(verifiedRemittanceUrl('http://wise.com/invite/abc', ['wise.com'])).toBeNull();
    expect(verifiedRemittanceUrl('https://evil.example/wise', ['wise.com'])).toBeNull();
    expect(verifiedRemittanceUrl('javascript:alert(1)', ['wise.com'])).toBeNull();
    expect(verifiedRemittanceUrl('https://user:pw@wise.com/', ['wise.com'])).toBeNull();
    expect(verifiedRemittanceUrl('  ', ['wise.com'])).toBeNull();
    expect(verifiedRemittanceUrl(undefined, ['wise.com'])).toBeNull();
  });
});

describe('/api/remittance', () => {
  const saved: Record<string, string | undefined> = {};
  beforeEach(() => {
    for (const k of ENV_KEYS) { saved[k] = process.env[k]; delete process.env[k]; }
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ eur: { mad: 10.8 } }) }) as jest.Mock;
  });
  afterEach(() => {
    for (const k of ENV_KEYS) { if (saved[k] === undefined) delete process.env[k]; else process.env[k] = saved[k]; }
  });

  async function providers() {
    const res = await GET(new NextRequest('http://localhost/api/remittance?amount=500&from=EUR'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.estimate).toBe(true);
    return Object.fromEntries(body.providers.map((p: { id: string }) => [p.id, p])) as Record<string, { url: string; sponsored: boolean }>;
  }

  it('never labels a public provider page as an affiliate link', async () => {
    const byId = await providers();
    for (const p of Object.values(byId)) expect(p.sponsored).toBe(false);
    expect(byId.wise.url).toMatch(/^https:\/\/wise\.com\//);
  });

  it('uses a configured affiliate URL only when it is on the provider domain', async () => {
    process.env.WISE_AFFILIATE_URL = 'https://wise.com/invite/u/rme';
    process.env.REMITLY_AFFILIATE_URL = 'https://phishing.example/remitly';
    const byId = await providers();
    expect(byId.wise).toMatchObject({ url: 'https://wise.com/invite/u/rme', sponsored: true });
    expect(byId.remitly.sponsored).toBe(false);
    expect(byId.remitly.url).toMatch(/^https:\/\/www\.remitly\.com\//);
  });
});
