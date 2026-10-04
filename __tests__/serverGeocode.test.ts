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
