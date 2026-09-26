import { ROUTE_PAGES } from "../lib/routePages";

const COUNTRY: Record<string, string> = {
  France: "FR", Belgique: "BE", "Pays-Bas": "NL", Allemagne: "DE", Italie: "IT", Espagne: "ES", Suisse: "CH",
};

// Each /trajet page is a search landing page ("Rotterdam Al Hoceima voiture"):
// the computed route must really start in the origin country and end in Morocco,
// otherwise a geocoding mix-up would publish a wrong itinerary.
describe("route landing pages", () => {
  test("cover the main diaspora corridors, including the Rif from Belgium and the Netherlands", () => {
    const slugs = ROUTE_PAGES.routes.map((r) => r.slug);
    expect(slugs.length).toBeGreaterThanOrEqual(56);
    for (const slug of ["bruxelles-al-hoceima", "rotterdam-nador", "anvers-nador", "paris-taza", "marseille-oujda"]) {
      expect(slugs).toContain(slug);
    }
  });

  test.each(ROUTE_PAGES.routes.map((r) => [r.slug, r] as const))("%s starts in its origin country and ends in Morocco", (_slug, route) => {
    const first = route.legs[0].countries[0].country;
    const lastLeg = route.legs[route.legs.length - 1];
    const last = lastLeg.countries[lastLeg.countries.length - 1].country;
    expect(first).toBe(COUNTRY[route.origin.split(", ")[1]]);
    expect(last).toBe("MA");
  });
});
