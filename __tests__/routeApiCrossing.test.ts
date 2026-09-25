/** @jest-environment node */

import { GET } from "../app/api/route/route";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

// Distances de table relevées sur router.project-osrm.org le 2026-09-25.
// Ports européens (ordre EUROPE_PORTS) : Algeciras, Tarifa, Almería.
const PARIS_TO_EU_PORTS = [[1918576.5, 1938871.3, 1806519.9]];
// Ports marocains (ordre MOROCCO_PORTS) : Tanger Med, Tanger Ville, Nador → Marrakech.
const MA_PORTS_TO_MARRAKECH = [[607583.5], [573092.8], [844110]];

function osrmMock(calls: string[]) {
  return jest.fn(async (input: RequestInfo | URL) => {
    const url = new URL(input.toString());
    calls.push(url.pathname);
    if (url.hostname === "nominatim.openstreetmap.org") {
      const q = url.searchParams.get("q");
      if (q === "Paris") return jsonResponse([{ lat: "48.8566", lon: "2.3522" }]);
      if (q === "Marrakech") return jsonResponse([{ lat: "31.6295", lon: "-7.9811" }]);
      // Lisbonne tombe « en mer » sur le trait de côte 1:50m.
      if (q === "Lisboa") return jsonResponse([{ lat: "38.7223", lon: "-9.1393" }]);
      return jsonResponse([]);
    }
    if (url.pathname.startsWith("/table/")) {
      const firstPoint = url.pathname.split("/").pop()!.split(";")[0];
      return jsonResponse({
        code: "Ok",
        distances: firstPoint.startsWith("2.3522") ? PARIS_TO_EU_PORTS : MA_PORTS_TO_MARRAKECH,
      });
    }
    if (url.pathname.startsWith("/route/")) {
      const fromParis = url.pathname.includes("2.3522,48.8566");
      return jsonResponse({
        code: "Ok",
        routes: [
          fromParis
            ? {
                geometry: { coordinates: [[2.3522, 48.8566], [0, 45], [-3.7, 40.4], [-5.6026, 36.0109]] },
                distance: 1938871.3,
                duration: 70000,
              }
            : {
                geometry: {
                  coordinates: [
                    [-5.8045, 35.7891], [-5.83, 35.76], [-5.9, 35.6], [-6.1, 35.2],
                    [-5.9, 34.6], [-6.6, 33.9], [-7.5, 32.8], [-7.9811, 31.6295],
                  ],
                },
                distance: 573092.8,
                duration: 22000,
              },
        ],
        waypoints: [{ distance: 20 }, { distance: 40 }],
      });
    }
    throw new Error(`Unexpected fetch: ${url}`);
  });
}

describe("GET /api/route — Europe ↔ Maroc", () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("builds road + ferry + road instead of stopping at the Spanish coast", async () => {
    const calls: string[] = [];
    global.fetch = osrmMock(calls) as unknown as typeof fetch;

    const response = await GET(new Request("http://localhost/api/route?origin=Paris&destination=Marrakech"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.legs.map((leg: { kind: string }) => leg.kind)).toEqual(["road", "ferry", "road"]);
    // Tarifa → Tanger Ville minimise route + mer + route pour ces distances.
    expect(data.legs[1]).toMatchObject({ kind: "ferry", from: "Tarifa", to: "Tanger Ville" });
    expect(data.legs[1].distanceMeters).toBeGreaterThan(25_000);
    expect(data.legs[1].distanceMeters).toBeLessThan(35_000);
    expect(data.legs[0]).toMatchObject({ from: "Paris", to: "Tarifa" });
    expect(data.legs[2]).toMatchObject({ from: "Tanger Ville", to: "Marrakech" });
    expect(data.legs[0].countries.map((c: { country: string }) => c.country)).toEqual(["FR", "ES"]);
    expect(data.legs[2].countries.map((c: { country: string }) => c.country)).toEqual(["MA"]);
    // Distance/durée routières : les deux tronçons, sans la traversée.
    expect(data.distanceMeters).toBeCloseTo(1938871.3 + 573092.8, 1);
    expect(data.durationSeconds).toBe(92000);
    // Les traversées alternatives restent visibles, triées.
    expect(data.crossings.map((c: { from: string }) => c.from)).toEqual(["Tarifa", "Algeciras", "Almería"]);
    expect(calls.filter((path) => path.startsWith("/table/"))).toHaveLength(2);
    expect(calls.filter((path) => path.startsWith("/route/"))).toHaveLength(2);
  });

  it("detects the crossing even when the origin city sits on a simplified coastline", async () => {
    const calls: string[] = [];
    global.fetch = osrmMock(calls) as unknown as typeof fetch;

    const response = await GET(new Request("http://localhost/api/route?origin=Lisboa&destination=Marrakech"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.legs.map((leg: { kind: string }) => leg.kind)).toEqual(["road", "ferry", "road"]);
    expect(calls.filter((path) => path.startsWith("/table/"))).toHaveLength(2);
  });

  it("returns 502 when the OSRM table service is down", async () => {
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input.toString());
      if (url.hostname === "nominatim.openstreetmap.org") {
        return jsonResponse(
          url.searchParams.get("q") === "Paris" ? [{ lat: "48.8566", lon: "2.3522" }] : [{ lat: "31.6295", lon: "-7.9811" }],
        );
      }
      return new Response("down", { status: 503 });
    }) as unknown as typeof fetch;

    const response = await GET(new Request("http://localhost/api/route?origin=Paris&destination=Marrakech"));
    expect(response.status).toBe(502);
  });
});
