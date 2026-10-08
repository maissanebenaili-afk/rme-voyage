export type RadioTruthLevel = "OFFICIAL" | "COMMUNITY";

export interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
  homepageUrl?: string;
  faviconUrl?: string;
  countryCode?: string;
  languageCodes: string[];
  tags: string[];
  codec?: string;
  bitrateKbps?: number;
  hls: boolean;
  lastCheckOk: boolean;
  source: "RADIO_BROWSER";
  truthLevel: RadioTruthLevel;
}

export interface RadioSearchQuery {
  countryCode?: string;
  language?: string;
  tag?: string;
  name?: string;
  limit?: number;
  offset?: number;
}

export interface RadioMoment {
  kind: "RADIO";
  title: string;
  reason: string;
  stations: RadioStation[];
}
