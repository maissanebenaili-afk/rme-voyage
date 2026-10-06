/** @jest-environment node */
import { GET } from "../app/api/route/route";
import { searchServices } from "@/lib/servicesSearch";

// 2026-10-06 : une surcharge de Nominatim (429) affichait « Ville de départ
// introuvable » pour une ville qui existe.
describe("map service unavailable is not « city not found »", () => {
  const originalFetch = global.fetch;
  afterEach(() => { global.fetch = originalFetch; });

  it.each([[429], [503]])("route: Nominatim %i → 503 « momentanément indisponible »", async (status) => {
    global.fetch = jest.fn(async () => new Response("busy", { status })) as unknown as typeof fetch;
    const response = await GET(new Request("http://localhost/api/route?origin=Paris%2C%20France&destination=Tanger%2C%20Maroc"));
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body.error).toMatch(/momentanément indisponible/);
    expect(body.error).not.toMatch(/introuvable/);
  });

  it("route: a network failure is reported the same way", async () => {
    global.fetch = jest.fn(async () => { throw new TypeError("fetch failed"); }) as unknown as typeof fetch;
    const response = await GET(new Request("http://localhost/api/route?origin=Paris&destination=Lyon"));
    expect(response.status).toBe(503);
  });

  it("services: Nominatim 429 → unavailable, not not_found", async () => {
    global.fetch = jest.fn(async () => new Response("busy", { status: 429 })) as unknown as typeof fetch;
    await expect(searchServices("Burgos, Espagne", "fuel")).resolves.toEqual({ ok: false, reason: "unavailable" });
  });
});
