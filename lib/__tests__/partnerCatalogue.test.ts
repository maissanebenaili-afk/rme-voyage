import { getPartnerCatalogue } from "@/lib/partnerCatalogue";

describe("getPartnerCatalogue", () => {
  it("covers the main travel monetization categories without activating unverified partners", () => {
    const catalogue = getPartnerCatalogue();
    const categories = new Set(catalogue.map((partner) => partner.category));

    expect(categories).toEqual(
      new Set(["ferry", "flight", "hotel", "esim", "luggage", "experiences", "transfer", "car_rental", "insurance"]),
    );
    expect(catalogue.some((partner) => partner.status === "pending")).toBe(true);
    expect(catalogue.every((partner) => partner.status !== "active" || Boolean(partner.affiliateUrl))).toBe(true);
  });
});
