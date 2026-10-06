/** @jest-environment node */
import { geocodePlace } from "@/lib/serverGeocode";

describe("geocodePlace rejects unrelated fuzzy matches", () => {
  afterEach(() => jest.restoreAllMocks());

  it("accepts a matching city result", async () => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify([
      { lat: "48.8566", lon: "2.3522", display_name: "Paris, Île-de-France, France" },
    ]))) as unknown as typeof fetch;

    await expect(geocodePlace("Paris, France")).resolves.toEqual({
      lat: 48.8566,
      lon: 2.3522,
    });
  });

  it("rejects a fuzzy result that does not contain the requested place tokens", async () => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify([
      { lat: "48.8566", lon: "2.3522", display_name: "Paris, Île-de-France, France" },
    ]))) as unknown as typeof fetch;

    await expect(geocodePlace("Xyzville123")).resolves.toBeNull();
  });

  it("tries another returned candidate when the first one is unrelated", async () => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify([
      { lat: "48.8566", lon: "2.3522", display_name: "Paris, Île-de-France, France" },
      { lat: "35.17", lon: "-2.93", display_name: "Nador, Oriental, Morocco" },
    ]))) as unknown as typeof fetch;

    await expect(geocodePlace("Nador, Morocco")).resolves.toEqual({
      lat: 35.17,
      lon: -2.93,
    });
  });
});

// 2026-10-06 : « Madrid, Espagne », « Anvers, Belgique »… donnaient « ville
// introuvable » en production, parce que Nominatim écrit le pays (et parfois
// la ville) dans la langue locale.
describe("geocodePlace accepts French names of foreign cities", () => {
  afterEach(() => jest.restoreAllMocks());

  it("accepts « Madrid, Espagne » when Nominatim answers « España »", async () => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify([
      { lat: "40.41", lon: "-3.70", display_name: "Madrid, Comunidad de Madrid, España", namedetails: { name: "Madrid" } },
    ]))) as unknown as typeof fetch;
    await expect(geocodePlace("Madrid, Espagne")).resolves.toEqual({ lat: 40.41, lon: -3.70 });
  });

  it("accepts « Anvers, Belgique » through the city's French name", async () => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify([
      { lat: "51.22", lon: "4.40", display_name: "Antwerpen, Vlaanderen, België / Belgique / Belgien", namedetails: { name: "Antwerpen", "name:fr": "Anvers" } },
    ]))) as unknown as typeof fetch;
    await expect(geocodePlace("Anvers, Belgique")).resolves.toEqual({ lat: 51.22, lon: 4.40 });
  });

  it("still refuses a result whose city name does not match", async () => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify([
      { lat: "40.41", lon: "-3.70", display_name: "Madrid, Comunidad de Madrid, España", namedetails: { name: "Madrid" } },
    ]))) as unknown as typeof fetch;
    await expect(geocodePlace("Xyzville123, Espagne")).resolves.toBeNull();
  });

  it("asks Nominatim for the names in every language", async () => {
    const fetchMock = jest.fn(async () => new Response("[]"));
    global.fetch = fetchMock as unknown as typeof fetch;
    await geocodePlace("Milan, Italie");
    expect(String((fetchMock.mock.calls[0] as unknown[])[0])).toContain("namedetails=1");
  });
});
