import { MOROCCO_CITIES, detectCity } from "../lib/moroccoCities";

describe("detectCity", () => {
  it("finds an unambiguous city by name, accent-insensitive", () => {
    expect(detectCity("je veux aller à Taza")).toBe("taza");
    expect(detectCity("wa9t salat f Taza")).toBe("taza");
    expect(MOROCCO_CITIES[detectCity("Meknes ou Meknès")!].fr).toBe("Meknès");
  });

  it("requires location context for ambiguous city keys", () => {
    // Darija "safi" (ok/done) and FR "sale" (dirty) collide with city names.
    expect(detectCity("safi, merci")).toBeNull();
    expect(detectCity("la chambre est sale")).toBeNull();
    expect(detectCity("météo à Safi aujourd'hui")).toBe("safi");
  });

  it("returns null when no known city is mentioned", () => {
    expect(detectCity("quel est le prix du ferry")).toBeNull();
  });

  it("every entry resolves back to itself in MOROCCO_CITIES", () => {
    for (const key of Object.keys(MOROCCO_CITIES)) {
      expect(MOROCCO_CITIES[key].fr).toBeTruthy();
    }
  });
});
