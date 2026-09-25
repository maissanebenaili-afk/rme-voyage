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
      if (url.hostname === "nominatim.openstreetmap.org") {
        return jsonResponse(url.searchParams.get("q") === "A" ? [{ lat: "1", lon: "1" }] : [{ lat: "2", lon: "2" }]);
      }
      return jsonResponse({ code: "NoRoute" });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const response = await GET(
      new Request("http://localhost/api/route?origin=A&destination=B"),
    );

    expect(response.status).toBe(404);
  });

  it("refuses an origin and destination that geocode to the same place", async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input.toString());
      if (url.hostname === "nominatim.openstreetmap.org") return jsonResponse([{ lat: "48.8566", lon: "2.3522" }]);
      throw new Error(`OSRM must not be called: ${url}`);
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const response = await GET(new Request("http://localhost/api/route?origin=Paris&destination=Paris%2C%20France"));
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toMatch(/même endroit/);
  });

  it("splits OSRM's own ferry steps out of the road distance (Palma → mainland)", async () => {
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input.toString());
      if (url.hostname === "nominatim.openstreetmap.org") {
        return jsonResponse(
          url.searchParams.get("q") === "Palma" ? [{ lat: "39.5696", lon: "2.6502" }] : [{ lat: "40.4168", lon: "-3.7038" }],
        );
      }
      const step = (mode: string, name: string, distance: number, duration: number, coordinates: number[][]) => ({
        mode, name, distance, duration, geometry: { coordinates },
      });
      return jsonResponse({
        code: "Ok",
        routes: [
          {
            geometry: { coordinates: [[2.6502, 39.5696], [3.14, 39.83], [2.177, 41.37], [-3.7038, 40.4168]] },
            distance: 60_000 + 200_900 + 620_000,
            duration: 3_000 + 23_400 + 22_000,
            legs: [
              {
                steps: [
                  step("driving", "Ma-13", 60_000, 3_000, [[2.6502, 39.5696], [3.14, 39.83]]),
                  step("ferry", "Barcelona – Alcúdia", 200_900, 23_400, [[3.14, 39.83], [2.177, 41.37]]),
                  step("driving", "A-2", 620_000, 22_000, [[2.177, 41.37], [-0.88, 41.65], [-3.7038, 40.4168]]),
                ],
              },
            ],
          },
        ],
        waypoints: [{ distance: 10 }, { distance: 10 }],
      });
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const response = await GET(new Request("http://localhost/api/route?origin=Palma&destination=Madrid"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.legs.map((leg: { kind: string }) => leg.kind)).toEqual(["road", "ferry", "road"]);
    // Le nom de ligne est gardé tel quel : il ne dit pas le sens (depuis Palma on embarque à Alcúdia).
    expect(data.legs[1]).toEqual({
      kind: "ferry", from: "Barcelona – Alcúdia", to: "", distanceMeters: 200_900, measured: "route",
    });
    expect(data.legs[0]).toMatchObject({ from: "Palma", to: "Port d'embarquement" });
    expect(data.legs[2]).toMatchObject({ from: "Port de débarquement", to: "Madrid" });
    // Distance et durée routières : sans les 200,9 km ni les 6 h 30 de mer.
    expect(data.distanceMeters).toBe(680_000);
    expect(data.durationSeconds).toBe(25_000);
  });
});
