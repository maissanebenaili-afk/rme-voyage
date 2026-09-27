import type { RadioSearchQuery, RadioStation } from "./radioTypes";

const ENDPOINTS = [
  "https://de1.api.radio-browser.info",
  "https://fr1.api.radio-browser.info",
  "https://nl1.api.radio-browser.info",
] as const;

type RadioBrowserStation = {
  stationuuid?: string;
  name?: string;
  url_resolved?: string;
  url?: string;
  homepage?: string;
  favicon?: string;
  countrycode?: string;
  languagecodes?: string;
  tags?: string;
  codec?: string;
  bitrate?: number;
  hls?: number;
  lastcheckok?: number;
};

function normalize(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function mapStation(raw: RadioBrowserStation): RadioStation | null {
  const streamUrl = raw.url_resolved || raw.url;
  if (!raw.stationuuid || !raw.name || !streamUrl) return null;

  return {
    id: raw.stationuuid,
    name: raw.name.trim(),
    streamUrl,
    homepageUrl: raw.homepage || undefined,
    faviconUrl: raw.favicon || undefined,
    countryCode: raw.countrycode?.toUpperCase() || undefined,
    languageCodes: normalize(raw.languagecodes),
    tags: normalize(raw.tags),
    codec: raw.codec || undefined,
    bitrateKbps:
      typeof raw.bitrate === "number" && raw.bitrate > 0
        ? raw.bitrate
        : undefined,
    hls: raw.hls === 1,
    lastCheckOk: raw.lastcheckok === 1,
    source: "RADIO_BROWSER",
    truthLevel: "COMMUNITY",
  };
}

function buildUrl(endpoint: string, query: RadioSearchQuery): string {
  const url = new URL("/json/stations/search", endpoint);
  url.searchParams.set("hidebroken", "true");
  url.searchParams.set("order", "votes");
  url.searchParams.set("reverse", "true");
  url.searchParams.set("limit", String(Math.min(Math.max(query.limit ?? 12, 1), 50)));
  url.searchParams.set("offset", String(Math.max(query.offset ?? 0, 0)));

  if (query.countryCode) url.searchParams.set("countrycode", query.countryCode);
  if (query.language) url.searchParams.set("language", query.language);
  if (query.tag) url.searchParams.set("tag", query.tag);
  if (query.name) url.searchParams.set("name", query.name);

  return url.toString();
}

export async function searchRadioStations(
  query: RadioSearchQuery,
  options: { fetchImpl?: typeof fetch; timeoutMs?: number } = {},
): Promise<RadioStation[]> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? 4500;

  for (const endpoint of ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(buildUrl(endpoint, query), {
        headers: {
          Accept: "application/json",
          "User-Agent": "RME-Voyage/1.0 (radio discovery)",
        },
        signal: controller.signal,
      });

      if (!response.ok) continue;

      const payload = (await response.json()) as RadioBrowserStation[];
      if (!Array.isArray(payload)) continue;

      return payload
        .map(mapStation)
        .filter((station): station is RadioStation => station !== null)
        .filter((station) => station.lastCheckOk);
    } catch {
      // Try the next Radio Browser mirror.
    } finally {
      clearTimeout(timer);
    }
  }

  return [];
}
