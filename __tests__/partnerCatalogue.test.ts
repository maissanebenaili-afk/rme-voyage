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

  it("never marks a partner active without a validated affiliate URL", () => {
    const catalogue = getPartnerCatalogue();

    expect(
      catalogue
        .filter((partner) => partner.status === "active")
        .every((partner) => Boolean(partner.affiliateUrl)),
    ).toBe(true);
  });
});
