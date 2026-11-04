import { getPartnerCatalogue } from "@/lib/partnerCatalogue";

describe("getPartnerCatalogue", () => {
  it("covers the main travel monetization categories", () => {
    const catalogue = getPartnerCatalogue();

    expect(catalogue.map((partner) => partner.category)).toEqual(
      expect.arrayContaining([
        "ferry",
        "flight",
        "hotel",
        "esim",
        "luggage",
        "experiences",
        "transfer",
        "car_rental",
        "insurance",
      ]),
    );
  });

  describe("Travelpayouts short links", () => {
    const original = { ...process.env };
    afterEach(() => { process.env = { ...original }; });

    it("activates the flight partner with a tp.st short link", () => {
      process.env.TRAVELPAYOUTS_FLIGHT_URL = "https://aviasales.tp.st/AbCd1234";
      const flights = getPartnerCatalogue().find((partner) => partner.id === "travelpayouts-flights");
      expect(flights).toMatchObject({ status: "active", affiliateUrl: "https://aviasales.tp.st/AbCd1234" });
    });

    it("keeps a partner that does not trust tp.media pending", () => {
      process.env.ESIM_MOROCCO_AFFILIATE_URL = "https://yesim.tp.st/AbCd1234";
      const esim = getPartnerCatalogue().find((partner) => partner.id === "esim-morocco");
      expect(esim?.status).toBe("pending");
    });
  });

  describe("Travelpayouts partners with a short link (Airalo, Yesim, KKday, Klook)", () => {
    const original = { ...process.env };
    afterEach(() => { process.env = { ...original }; });

    const partners = [
      { id: "airalo", envVar: "AIRALO_AFFILIATE_URL", category: "esim", url: "https://airalo.tp.st/AbCd1234" },
      { id: "yesim", envVar: "YESIM_AFFILIATE_URL", category: "esim", url: "https://yesim.tp.st/AbCd1234" },
      { id: "kkday", envVar: "KKDAY_AFFILIATE_URL", category: "experiences", url: "https://kkday.tp.st/AbCd1234" },
      { id: "klook", envVar: "KLOOK_AFFILIATE_URL", category: "experiences", url: "https://klook.tp.st/AbCd1234" },
    ] as const;

    it.each(partners)("$id is in the catalogue and stays pending without a link", ({ id, envVar, category }) => {
      delete process.env[envVar];
      const partner = getPartnerCatalogue().find((entry) => entry.id === id);
      expect(partner).toMatchObject({ id, category, envVar, status: "pending" });
      expect(partner?.affiliateUrl).toBeUndefined();
    });

    it.each(partners)("$id becomes active with its tp.st short link", ({ id, envVar, url }) => {
      process.env[envVar] = url;
      expect(getPartnerCatalogue().find((entry) => entry.id === id)).toMatchObject({ status: "active", affiliateUrl: url });
    });

    it.each(partners)("$id refuses a link that is not https, has credentials or points elsewhere", ({ id, envVar }) => {
      for (const bad of ["http://airalo.tp.st/AbCd1234", "https://user:pw@airalo.tp.st/x", "https://evil.example/AbCd1234", "https://airalo.tp.st.evil.example/x"]) {
        process.env[envVar] = bad;
        expect(getPartnerCatalogue().find((entry) => entry.id === id)?.status).toBe("pending");
      }
    });
  });

  it("never marks a partner active without a validated affiliate URL", () => {
    const catalogue = getPartnerCatalogue();

    expect(
      catalogue
        .filter((partner) => partner.status === "active")
        .every((partner) => Boolean(partner.affiliateUrl)),
    ).toBe(true);
  });
});
