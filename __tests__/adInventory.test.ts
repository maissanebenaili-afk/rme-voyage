import { getAdSlots } from "../lib/adInventory";

describe("RME ad inventory", () => {
  it("provides one clearly labelled sponsor slot around Radio Now", () => {
    const slots = getAdSlots({ placement: "RADIO_NOW", countryCode: "MA" });
    expect(slots).toHaveLength(1);
    expect(slots[0]).toMatchObject({
      id: "radio-now-sponsor",
      format: "SPONSOR_CARD",
      label: "SPONSORISÉ",
      maxItems: 1,
    });
  });

  it("keeps video ads separate from the playback layer", () => {
    const slots = getAdSlots({ placement: "VIDEO_NOW" });
    expect(slots[0]?.placement).toBe("VIDEO_NOW");
    expect(slots[0]?.format).toBe("NATIVE");
  });

  it("does not expose disabled placements", () => {
    const slots = getAdSlots({ placement: "RESULTS" });
    expect(slots).toEqual([]);
  });

  it("supports frequency caps without requiring user profiling", () => {
    const slots = getAdSlots({ placement: "FEED" });
    expect(slots[0]?.frequencyCap).toBeGreaterThan(0);
  });
});
