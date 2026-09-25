/** @jest-environment node */

import { GET } from "../app/api/route/route";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

describe("GET /api/route", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    if (originalFetch) {
      global.fetch = originalFetch;
    } else {
      Reflect.deleteProperty(global, "fetch");
    }
  });

  it("rejects requests missing origin or destination", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;

    const response = await GET(new Request("http://localhost/api/route?origin=Paris"));

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("geocodes both places then returns the OSRM route with lat/lon flipped for Leaflet", async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input.toString());
      if (url.hostname === "nominatim.openstreetmap.org" && url.searchParams.get("q") === "Paris") {
        return jsonResponse([{ lat: "48.8566", lon: "2.3522" }]);
      }
      if (url.hostname === "nominatim.openstreetmap.org" && url.searchParams.get("q") === "Madrid") {
        return jsonResponse([{ lat: "40.4168", lon: "-3.7038" }]);
      }
      if (url.hostname === "router.project-osrm.org") {
        return jsonResponse({
          code: "Ok",
          routes: [
            {
              geometry: { coordinates: [[2.3522, 48.8566], [0, 45], [-3.7038, 40.4168]] },
              distance: 1270000,
              duration: 45000,
            },
          ],
          waypoints: [{ distance: 12 }, { distance: 30 }],
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const response = await GET(
      new Request("http://localhost/api/route?origin=Paris&destination=Madrid"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.geometry).toEqual([[48.8566, 2.3522], [45, 0], [40.4168, -3.7038]]);
    expect(data.distanceMeters).toBe(1270000);
    expect(data.durationSeconds).toBe(45000);
    expect(data.legs).toHaveLength(1);
    expect(data.legs[0].kind).toBe("road");
    expect(data.legs[0].countries.map((c: { country: string }) => c.country)).toEqual(["FR", "ES"]);
    const splitTotal = data.legs[0].countries.reduce((sum: number, c: { meters: number }) => sum + c.meters, 0);
    expect(Math.abs(splitTotal - 1270000)).toBeLessThanOrEqual(2);
  });

  it("refuses a road route whose endpoint OSRM had to snap far away", async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input.toString());
      if (url.hostname === "nominatim.openstreetmap.org") {
        return jsonResponse(
          url.searchParams.get("q") === "Paris" ? [{ lat: "48.8566", lon: "2.3522" }] : [{ lat: "40.4168", lon: "-3.7038" }],
        );
      }
      return jsonResponse({
        code: "Ok",
        routes: [{ geometry: { coordinates: [[2.3522, 48.8566], [-3.7, 40.4]] }, distance: 1, duration: 1 }],
        waypoints: [{ distance: 5 }, { distance: 50_000 }],
      });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const response = await GET(new Request("http://localhost/api/route?origin=Paris&destination=Ailleurs"));

    expect(response.status).toBe(404);
  });

  it("returns 404 with a French error when a place can't be geocoded", async () => {
    const fetchMock = jest.fn(async () => jsonResponse([]));
    global.fetch = fetchMock as unknown as typeof fetch;

    const response = await GET(
      new Request("http://localhost/api/route?origin=Nullepart&destination=Tanger"),
    );
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toMatch(/Origin location not found/);
  });

  it("returns 404 when OSRM finds no route between the two points", async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input.toString());
      if (url.hostname === "nominatim.openstreetmap.org") return jsonResponse([{ lat: "1", lon: "1" }]);
      return jsonResponse({ code: "NoRoute" });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const response = await GET(
      new Request("http://localhost/api/route?origin=A&destination=B"),
    );

    expect(response.status).toBe(404);
  });
});
