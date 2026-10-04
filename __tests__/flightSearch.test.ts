/** @jest-environment node */

import { NextRequest } from "next/server";

import { GET } from "../app/api/affiliates/route";
import { aviasalesSearchUrl, iataOf, isValidDeepLinkTemplate, prefilledFlightLink } from "../lib/flightSearch";

// Shape of a dashboard-generated deep link, its Aviasales address replaced by {url}.
const TEMPLATE = "https://tp.media/r?marker=123456&trs=7890&p=4114&u={url}";

describe("Aviasales search address (documented format: IATA + DDMM + IATA + passengers)", () => {
  test("Paris → Tanger on 3 October, one passenger", () => {
    expect(aviasalesSearchUrl({ origin: "Paris, France", destination: "Tanger", date: "2026-10-03" }))
      .toBe("https://www.aviasales.com/search/PAR0310TNG1");
  });

  test("without a date, the search form opens pre-filled", () => {
    expect(aviasalesSearchUrl({ origin: "Bruxelles", destination: "Al Hoceïma" })).toBe("https://www.aviasales.com/?params=BRUAHU1");
  });

  test("accents, case and the country after a comma do not matter", () => {
    expect(iataOf("Fès")).toBe("FEZ");
    expect(iataOf("DÜSSELDORF, Allemagne")).toBe("DUS");
    expect(iataOf("Béni Mellal")).toBe("BEM");
  });

  test.each([
    ["Utrecht", "Nador"], // no airport of its own: never replaced by a neighbour
    ["Paris", "Taza"],
    ["Paris", "Paris"],
    ["Europe", "Maroc"],
  ])("no search for %s → %s", (origin, destination) => {
    expect(aviasalesSearchUrl({ origin, destination })).toBeNull();
  });

  test("an invalid date is ignored rather than guessed", () => {
    expect(aviasalesSearchUrl({ origin: "Paris", destination: "Nador", date: "03/10" })).toBe("https://www.aviasales.com/?params=PARNDR1");
  });
});

describe("dashboard deep-link template", () => {
  test("RME only substitutes the Aviasales address", () => {
    const link = prefilledFlightLink(TEMPLATE, { origin: "Paris", destination: "Tanger", date: "2026-10-03" });
    expect(link).toBe("https://tp.media/r?marker=123456&trs=7890&p=4114&u=https%3A%2F%2Fwww.aviasales.com%2Fsearch%2FPAR0310TNG1");
    expect(new URL(link!).searchParams.get("u")).toBe("https://www.aviasales.com/search/PAR0310TNG1");
  });

  test.each([
    ["http://tp.media/r?marker=1&u={url}", "not https"],
    ["https://evil.example/r?marker=1&u={url}", "not a Travelpayouts host"],
    ["https://tp.media/r?marker=1&u=https://www.aviasales.com", "no {url}"],
    ["https://tp.media/r?marker=1&u={url}&v={url}", "two {url}"],
    ["https://tp.media/{url}", "{url} outside the query"],
    ["https://user:pass@tp.media/r?u={url}", "credentials"],
  ])("rejected: %s (%s)", (template) => {
    expect(isValidDeepLinkTemplate(template)).toBe(false);
    expect(prefilledFlightLink(template, { origin: "Paris", destination: "Tanger" })).toBeNull();
  });

  test("a Travelpayouts short-link host is accepted like tp.media", () => {
    expect(isValidDeepLinkTemplate("https://aviasales.tp.st/r?u={url}")).toBe(true);
  });
});

describe("GET /api/affiliates with a deep-link template", () => {
  const saved = { ...process.env };
  afterEach(() => { process.env = { ...saved }; });

  const flight = async (query: string) =>
    (await GET(new NextRequest(`http://localhost/api/affiliates?type=flight&${query}`))).json();

  test("returns the pre-filled link, flagged as such", async () => {
    process.env.TRAVELPAYOUTS_FLIGHT_DEEPLINK_TEMPLATE = TEMPLATE;
    process.env.TRAVELPAYOUTS_FLIGHT_URL = "https://aviasales.tp.st/generic";
    const data = await flight("origin=Paris&destination=Tanger&date=2026-10-03");
    expect(data).toMatchObject({ configured: true, provider: "travelpayouts", prefilled: true });
    expect(data.affiliateUrl).toContain("PAR0310TNG1");
  });

  test("a city without an airport keeps the generic dashboard link", async () => {
    process.env.TRAVELPAYOUTS_FLIGHT_DEEPLINK_TEMPLATE = TEMPLATE;
    process.env.TRAVELPAYOUTS_FLIGHT_URL = "https://aviasales.tp.st/generic";
    const data = await flight("origin=Utrecht&destination=Nador");
    expect(data).toEqual({ configured: true, affiliateUrl: "https://aviasales.tp.st/generic", provider: "travelpayouts" });
  });

  test("without the template nothing changes", async () => {
    delete process.env.TRAVELPAYOUTS_FLIGHT_DEEPLINK_TEMPLATE;
    process.env.TRAVELPAYOUTS_FLIGHT_URL = "https://aviasales.tp.st/generic";
    const data = await flight("origin=Paris&destination=Tanger&date=2026-10-03");
    expect(data).toEqual({ configured: true, affiliateUrl: "https://aviasales.tp.st/generic", provider: "travelpayouts" });
  });
});
