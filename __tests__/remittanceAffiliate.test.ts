/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";

import { GET } from "../app/api/remittance/route";

type Provider = { id: string; affiliateUrl: string; isAffiliate: boolean };

async function wise(): Promise<Provider> {
  const res = await GET(new NextRequest("http://localhost/api/remittance?amount=500"));
  const body = (await res.json()) as { providers: Provider[] };
  return body.providers.find((p) => p.id === "wise")!;
}

describe("remittance affiliate links", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ eur: { mad: 10.8 } }),
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.WISE_AFFILIATE_URL;
  });

  test("uses a valid https affiliate link and flags it", async () => {
    process.env.WISE_AFFILIATE_URL = "https://wise.com/invite/rme";
    expect(await wise()).toMatchObject({ affiliateUrl: "https://wise.com/invite/rme", isAffiliate: true });
  });

  test.each([
    ["non-https", "http://wise.com/invite/rme"],
    ["script scheme", "javascript:alert(1)"],
    ["not a URL", "wise.com/invite/rme"],
    ["embedded credentials", "https://user:pass@wise.com/invite"],
  ])("ignores a malformed configured value (%s) and keeps the public link", async (_label, value) => {
    process.env.WISE_AFFILIATE_URL = value;
    const provider = await wise();
    expect(provider.isAffiliate).toBe(false);
    expect(provider.affiliateUrl).toMatch(/^https:\/\/wise\.com\/gb\/send-money\//);
  });
});
