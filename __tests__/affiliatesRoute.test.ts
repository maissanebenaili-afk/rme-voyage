/** @jest-environment node */

import { NextRequest } from "next/server";

import { GET } from "../app/api/affiliates/route";

describe("GET /api/affiliates", () => {
  const originalTravelpayoutsPartnerId = process.env.TRAVELPAYOUTS_FLIGHT_URL;
  const originalDirectFerriesPartnerId = process.env.DIRECT_FERRIES_PARTNER_ID;
  const originalDirectFerriesBaseUrl = process.env.DIRECT_FERRIES_BASE_URL;

  afterEach(() => {
    if (originalTravelpayoutsPartnerId === undefined) delete process.env.TRAVELPAYOUTS_FLIGHT_URL;
    else process.env.TRAVELPAYOUTS_FLIGHT_URL = originalTravelpayoutsPartnerId;
    process.env.DIRECT_FERRIES_PARTNER_ID = originalDirectFerriesPartnerId;
    process.env.DIRECT_FERRIES_BASE_URL = originalDirectFerriesBaseUrl;
  });

  it("returns 400 for invalid requests", async () => {
    const response = GET(
      new NextRequest("http://localhost/api/affiliates?type=train&origin=Paris&destination=Tanger"),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid affiliate request.",
    });
  });

  it("returns configured false when no flight partner is configured", async () => {
    delete process.env.TRAVELPAYOUTS_FLIGHT_URL;

    const response = GET(
      new NextRequest("http://localhost/api/affiliates?type=flight&origin=Paris&destination=Tanger"),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      configured: false,
      affiliateUrl: null,
      provider: null,
    });
  });

  it("returns the built flight affiliate URL when configured", async () => {
    process.env.TRAVELPAYOUTS_FLIGHT_URL = "https://tp.media/r?marker=test-marker&u=https%3A%2F%2Fwww.skyscanner.fr%2F";

    const response = GET(
      new NextRequest(
        "http://localhost/api/affiliates?type=flight&origin=Paris&destination=Tanger&date=2026-09-20",
      ),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.configured).toBe(true);
    expect(data.provider).toBe("travelpayouts");
    expect(data.affiliateUrl).toContain("tp.media");
    expect(data.affiliateUrl).toContain("marker=test-marker");
    expect(data.affiliateUrl).toContain("skyscanner");
  });

  it("returns the GNV provider name when only GNV is configured", async () => {
    delete process.env.DIRECT_FERRIES_AFFILIATE_URL;
    process.env.GNV_AFFILIATE_URL = "https://www.gnv.it/fr/booking?ref=test";

    const response = GET(
      new NextRequest("http://localhost/api/affiliates?type=ferry&origin=Paris&destination=Tanger"),
    );
    const data = await response.json();

    expect(data.configured).toBe(true);
    expect(data.provider).toBe("gnv");
    expect(data.affiliateUrl).toBe("https://www.gnv.it/fr/booking?ref=test");

    delete process.env.GNV_AFFILIATE_URL;
  });
});
