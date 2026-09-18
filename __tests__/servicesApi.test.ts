/** @jest-environment node */

import { GET } from "../app/api/services/route";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("GET /api/services", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    if (originalFetch) {
      global.fetch = originalFetch;
    } else {
      Reflect.deleteProperty(global, "fetch");
    }
  });

  it("rejects requests missing place", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const response = await GET(new Request("http://localhost/api/services?category=fuel"));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid category", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const response = await GET(
      new Request("http://localhost/api/services?place=Tanger&category=not-a-real-category"),
    );

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 404 with a French error when the place can't be geocoded", async () => {
    const fetchMock = jest.fn(async () => jsonResponse([]));
    global.fetch = fetchMock as unknown as typeof fetch;

    const response = await GET(
      new Request("http://localhost/api/services?place=Nullepart&category=fuel"),
    );
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toMatch(/Nullepart/);
  });

  it("geocodes the place then returns Overpass results sorted by distance, nearest first", async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(input.toString());
      if (url.hostname === "nominatim.openstreetmap.org") {
        return jsonResponse([{ lat: "35.7595", lon: "-5.834" }]);
      }
      if (url.hostname === "overpass-api.de") {
        expect(init?.method).toBe("POST");
        expect(String(init?.body)).toContain('"amenity"="fuel"');
        // Regression: overpass-api.de returns 406/resets the connection for
        // requests without an identifying User-Agent (verified live).
        const headers = init?.headers as Record<string, string>;
        expect(headers["user-agent"]).toMatch(/RME-Voyage/);
        return jsonResponse({
          elements: [
            { type: "node", id: 1, lat: 35.77, lon: -5.83, tags: { name: "Station lointaine" } },
            { type: "node", id: 2, lat: 35.76, lon: -5.834, tags: { name: "Station proche" } },
            // No name tag: should fall back to a category label, not be dropped.
            { type: "way", id: 3, center: { lat: 35.765, lon: -5.832 } },
          ],
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const response = await GET(
      new Request("http://localhost/api/services?place=Tanger&category=fuel"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.center).toEqual({ lat: 35.7595, lon: -5.834 });
    expect(data.results).toHaveLength(3);
    expect(data.results[0].name).toBe("Station proche");
    expect(data.results[0].distanceMeters).toBeLessThan(data.results[1].distanceMeters);
    // Unnamed element gets an honest category fallback, never a fabricated name.
    expect(data.results.map((r: { name: string }) => r.name)).toContain("Station-service");
  });

  it("returns an empty (not fabricated) results array when Overpass finds nothing", async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input.toString());
      if (url.hostname === "nominatim.openstreetmap.org") return jsonResponse([{ lat: "1", lon: "1" }]);
      return jsonResponse({ elements: [] });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const response = await GET(
      new Request("http://localhost/api/services?place=Somewhere&category=consulate"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.results).toEqual([]);
  });

  it("returns 502 when the Overpass upstream fails", async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input.toString());
      if (url.hostname === "nominatim.openstreetmap.org") return jsonResponse([{ lat: "1", lon: "1" }]);
      return jsonResponse({}, 503);
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const response = await GET(
      new Request("http://localhost/api/services?place=Somewhere&category=garage"),
    );

    expect(response.status).toBe(502);
  });
});
