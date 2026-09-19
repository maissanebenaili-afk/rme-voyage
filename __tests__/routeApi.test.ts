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
      if (url.hostname === "nominatim.openstreetmap.org" && url.searchParams.get("q") === "Tanger") {
        return jsonResponse([{ lat: "35.7595", lon: "-5.834" }]);
      }
      if (url.hostname === "router.project-osrm.org") {
        return jsonResponse({
          code: "Ok",
          routes: [
            {
              geometry: { coordinates: [[2.3522, 48.8566], [-5.834, 35.7595]] },
              distance: 1850000,
              duration: 65400,
            },
          ],
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const response = await GET(
      new Request("http://localhost/api/route?origin=Paris&destination=Tanger"),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.geometry).toEqual([[48.8566, 2.3522], [35.7595, -5.834]]);
    expect(data.distanceMeters).toBe(1850000);
    expect(data.durationSeconds).toBe(65400);
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
