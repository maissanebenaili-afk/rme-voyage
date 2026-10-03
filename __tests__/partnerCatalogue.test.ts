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

  it.each([
    ["airalo", "AIRALO_AFFILIATE_URL", "https://airalo.tp.st/AbCd1234"],
    ["yesim", "YESIM_AFFILIATE_URL", "https://yesim.tp.st/AbCd1234"],
    ["kkday", "KKDAY_AFFILIATE_URL", "https://kkday.tp.st/AbCd1234"],
    ["klook", "KLOOK_AFFILIATE_URL", "https://klook.tp.st/AbCd1234"],
  ])("%s activates only with its validated short link", (id, envVar, url) => {
    delete process.env[envVar];
    expect(getPartnerCatalogue().find((partner) => partner.id === id)?.status).toBe("pending");
    process.env[envVar] = url;
    expect(getPartnerCatalogue().find((partner) => partner.id === id)).toMatchObject({ status: "active", affiliateUrl: url });
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
