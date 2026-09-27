import { buildRadioMoment, createRadioMoment, radioQueryForContext } from "../lib/radioMoments";
import { searchRadioStations } from "../lib/radioBrowser";

const station = {
  stationuuid: "abc",
  name: "RME Test",
  url_resolved: "https://example.com/live.mp3",
  countrycode: "MA",
  languagecodes: "ara,fre",
  tags: "news,music",
  codec: "MP3",
  bitrate: 128,
  hls: 0,
  lastcheckok: 1,
};

describe("RME Radio foundation", () => {
  it("normalizes a station and keeps the source truth level explicit", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [station],
    });

    const result = await searchRadioStations(
      { countryCode: "MA", limit: 5 },
      { fetchImpl },
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "abc",
      countryCode: "MA",
      languageCodes: ["ara", "fre"],
      truthLevel: "COMMUNITY",
      source: "RADIO_BROWSER",
    });
  });

  it("fails over to another mirror", async () => {
    const fetchImpl = jest
      .fn()
      .mockRejectedValueOnce(new Error("mirror down"))
      .mockResolvedValueOnce({ ok: true, json: async () => [station] });

    const result = await searchRadioStations({}, { fetchImpl });

    expect(result).toHaveLength(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("limits a Radio Moment to one next useful choice set", () => {
    const stations = Array.from({ length: 5 }, (_, index) => ({
      id: String(index),
      name: `Station ${index}`,
      streamUrl: `https://example.com/${index}.mp3`,
      languageCodes: ["fra"],
      tags: ["music"],
      hls: false,
      lastCheckOk: true,
      source: "RADIO_BROWSER" as const,
      truthLevel: "COMMUNITY" as const,
    }));

    expect(createRadioMoment(stations).stations).toHaveLength(3);
  });

  it("maps driving context to news without changing the factual data layer", () => {
    expect(radioQueryForContext({ countryCode: "MA", activity: "DRIVING" })).toEqual({
      countryCode: "MA",
      tag: "news",
      limit: 12,
    });
  });

  it("builds an empty moment safely when the provider is unavailable", async () => {
    const original = global.fetch;
    global.fetch = jest.fn().mockRejectedValue(new Error("offline")) as typeof fetch;

    try {
      const result = await buildRadioMoment({ countryCode: "MA" });
      expect(result.kind).toBe("RADIO");
      expect(result.stations).toEqual([]);
    } finally {
      global.fetch = original;
    }
  });
});
