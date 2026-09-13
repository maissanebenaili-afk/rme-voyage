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
    expect(data.affiliateUrl).toContain("tp.media");
    expect(data.affiliateUrl).toContain("marker=test-marker");
    expect(data.affiliateUrl).toContain("skyscanner");
  });
});
