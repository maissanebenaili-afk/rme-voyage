export type SourceEventType = "publication" | "emission" | "update" | "deadline" | "start";

export interface NormalizedSourcePayload {
  sourceName: string;
  externalId: string;
  title: string;
  description: string;
  /** null when the source carries no monetary amount (distinct from an explicit 0). */
  rawValueCents: number | null;
  sourceEventTimestamp: number;
  sourceEventType: SourceEventType;
  payloadUrl: string;
}

type UnknownRecord = Record<string, unknown>;

type ExtractedSourcePayload = Omit<NormalizedSourcePayload, "sourceName">;
type PropertyExtractor = (rawData: UnknownRecord) => ExtractedSourcePayload;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertNonNegativeInteger(value: unknown, name: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${name}_INVALID_INTEGER`);
  }
  return value;
}

function assertValidString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${name}_INVALID_STRING`);
  }
  return value.trim();
}

function assertValidUrl(value: unknown, name: string): string {
  const str = assertValidString(value, name);
  try {
    const url = new URL(str);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("protocol");
    return str;
  } catch {
    throw new Error(`${name}_INVALID_URL`);
  }
}

function optionalDescription(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// Language preference for multilingual maps ({ "fr": "...", "en": "..." }):
// fr, then en, then the smallest remaining language code. Deterministic.
const LANGUAGE_PREFERENCE = ["fr", "en"] as const;

function pickLocalized(value: unknown, name: string): string {
  if (!isRecord(value)) throw new Error(`${name}_INVALID_LOCALIZED`);
  const languages = Object.keys(value).filter(
    (lang) => typeof value[lang] === "string" && (value[lang] as string).trim() !== "",
  );
  const preferred = LANGUAGE_PREFERENCE.find((lang) => languages.includes(lang));
  const chosen = preferred ?? languages.sort()[0];
  if (chosen === undefined) throw new Error(`${name}_INVALID_LOCALIZED`);
  return (value[chosen] as string).trim();
}

function optionalLocalized(value: unknown, name: string): string {
  if (value === undefined || value === null) return "";
  return pickLocalized(value, name);
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(Z|[+-]\d{2}:\d{2})?)?$/;

/**
 * ISO 8601 date or date-time → epoch milliseconds.
 * A value without offset ("2015-07-27", "2020-12-23T14:16:31.403") is read as UTC:
 * this is an explicit assumption, the source does not state its timezone.
 * Impossible calendar dates (2021-02-30) are rejected.
 */
function assertIsoDateUtc(value: unknown, name: string): number {
  const str = assertValidString(value, name);
  const m = ISO_DATE.exec(str);
  if (!m) throw new Error(`${name}_INVALID_DATE`);
  const [, y, mo, d, h = "00", mi = "00", sec = "00", ms = "0", offset] = m;
  const utc = Date.UTC(+y, +mo - 1, +d, +h, +mi, +sec, +ms.padEnd(3, "0"));
  const check = new Date(utc);
  if (check.getUTCFullYear() !== +y || check.getUTCMonth() !== +mo - 1 || check.getUTCDate() !== +d
    || check.getUTCHours() !== +h || check.getUTCMinutes() !== +mi || check.getUTCSeconds() !== +sec) {
    throw new Error(`${name}_INVALID_DATE`);
  }
  let offsetMs = 0;
  if (offset && offset !== "Z") {
    const sign = offset[0] === "-" ? -1 : 1;
    const [oh, om] = offset.slice(1).split(":").map(Number);
    if (oh > 23 || om > 59) throw new Error(`${name}_INVALID_DATE`);
    offsetMs = sign * (oh * 60 + om) * 60_000;
  }
  return assertNonNegativeInteger(utc - offsetMs, name);
}

function firstLandingPage(value: unknown): unknown {
  if (!Array.isArray(value)) return undefined;
  const first: unknown = value[0];
  return isRecord(first) ? first.resource : undefined;
}

export function throttle(ms: number): Promise<void> {
  if (typeof ms !== "number" || !Number.isSafeInteger(ms) || ms < 0) {
    return Promise.reject(new Error("THROTTLE_INVALID_MS"));
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type SourceSchemaStatus = "SYNTHETIC_TEST" | "REAL_FIXTURE";

/**
 * Schema provenance per adapter. REAL_FIXTURE means the extractor was written against
 * real captured responses (fixtures/real/); it is NOT a certified network integration.
 */
export const SOURCE_SCHEMA_STATUS: Readonly<Record<string, SourceSchemaStatus>> = {
  AIDES_TERRITOIRES: "SYNTHETIC_TEST",
  ADEME: "SYNTHETIC_TEST",
  BOAMP: "SYNTHETIC_TEST",
  DATA_EUROPA: "SYNTHETIC_TEST",
  CORDIS: "SYNTHETIC_TEST",
  FUNDING_TENDERS: "SYNTHETIC_TEST",
  AIDES_ENTREPRISES: "SYNTHETIC_TEST",
  DATA_EUROPA_HUB: "REAL_FIXTURE",
};

const SOURCE_EXTRACTORS_REGISTRY: Record<string, PropertyExtractor> = {
  // [SCHEMA_SYNTHETIQUE_TEST] — the seven entries below are fixtures only until real source schemas are certified.
  AIDES_TERRITOIRES: (raw) => ({
    externalId: assertValidString(raw.id, "AIDES_TERRITOIRES_ID"),
    title: assertValidString(raw.nom, "AIDES_TERRITOIRES_TITLE"),
    description: optionalDescription(raw.description),
    rawValueCents: raw.montant === undefined ? 0 : assertNonNegativeInteger(raw.montant, "montant"),
    sourceEventTimestamp: assertNonNegativeInteger(raw.date_publication, "date_publication"),
    sourceEventType: "publication",
    payloadUrl: assertValidUrl(raw.url_aide, "url_aide"),
  }),
  ADEME: (raw) => ({
    externalId: assertValidString(raw.reference, "ADEME_ID"),
    title: assertValidString(raw.intitule, "ADEME_TITLE"),
    description: optionalDescription(raw.resume),
    rawValueCents: raw.budget_cents === undefined ? 0 : assertNonNegativeInteger(raw.budget_cents, "budget_cents"),
    sourceEventTimestamp: assertNonNegativeInteger(raw.timestamp_creation, "timestamp_creation"),
    sourceEventType: "publication",
    payloadUrl: assertValidUrl(raw.lien_appel, "lien_appel"),
  }),
  BOAMP: (raw) => {
    const objet = isRecord(raw.objet) ? raw.objet : undefined;
    const nestedTitle = objet?.titre;
    const nestedDescription = objet?.description;
    return {
      externalId: assertValidString(raw.idweb, "BOAMP_ID"),
      title: assertValidString(nestedTitle === undefined ? raw.titre : nestedTitle, "BOAMP_TITLE"),
      description: optionalDescription(nestedDescription),
      rawValueCents: raw.prix_cents === undefined ? 0 : assertNonNegativeInteger(raw.prix_cents, "prix_cents"),
      sourceEventTimestamp: assertNonNegativeInteger(raw.date_emission, "date_emission"),
      sourceEventType: "emission",
      payloadUrl: assertValidUrl(raw.url_avis, "url_avis"),
    };
  },
  DATA_EUROPA: (raw) => ({
    externalId: assertValidString(raw.identifier, "DATA_EUROPA_ID"),
    title: assertValidString(raw.title, "DATA_EUROPA_TITLE"),
    description: optionalDescription(raw.description),
    rawValueCents: raw.value_cents === undefined ? 0 : assertNonNegativeInteger(raw.value_cents, "value_cents"),
    sourceEventTimestamp: assertNonNegativeInteger(raw.issued_timestamp, "issued_timestamp"),
    sourceEventType: "publication",
    payloadUrl: assertValidUrl(raw.landing_page, "landing_page"),
  }),
  CORDIS: (raw) => ({
    externalId: assertValidString(raw.projectRcn, "CORDIS_ID"),
    title: assertValidString(raw.title, "CORDIS_TITLE"),
    description: optionalDescription(raw.teaser),
    rawValueCents: raw.ecMaxContributionCents === undefined ? 0 : assertNonNegativeInteger(raw.ecMaxContributionCents, "ecMaxContributionCents"),
    sourceEventTimestamp: assertNonNegativeInteger(raw.startDateTimestamp, "startDateTimestamp"),
    sourceEventType: "start",
    payloadUrl: assertValidUrl(raw.projectUrl, "projectUrl"),
  }),
  FUNDING_TENDERS: (raw) => ({
    externalId: assertValidString(raw.grantId, "FUNDING_TENDERS_ID"),
    title: assertValidString(raw.callTitle, "FUNDING_TENDERS_TITLE"),
    description: optionalDescription(raw.objective),
    rawValueCents: raw.budget_allocated_cents === undefined ? 0 : assertNonNegativeInteger(raw.budget_allocated_cents, "budget_allocated_cents"),
    sourceEventTimestamp: assertNonNegativeInteger(raw.deadline_timestamp, "deadline_timestamp"),
    sourceEventType: "deadline",
    payloadUrl: assertValidUrl(raw.portal_url, "portal_url"),
  }),
  AIDES_ENTREPRISES: (raw) => ({
    externalId: assertValidString(raw.code_dispositif, "AIDES_ENTREPRISES_ID"),
    title: assertValidString(raw.libelle, "AIDES_ENTREPRISES_TITLE"),
    description: optionalDescription(raw.presentation),
    rawValueCents: raw.plafond_cents === undefined ? 0 : assertNonNegativeInteger(raw.plafond_cents, "plafond_cents"),
    sourceEventTimestamp: assertNonNegativeInteger(raw.date_maj, "date_maj"),
    sourceEventType: "update",
    payloadUrl: assertValidUrl(raw.url_fiche, "url_fiche"),
  }),
  // [SCHEMA_REEL_FIXTURE] — written against real responses of
  // https://data.europa.eu/api/hub/search/datasets/{id} captured 2026-09-23 (fixtures/real/data-europa/).
  // Dataset records carry no monetary amount: rawValueCents is null, never 0.
  DATA_EUROPA_HUB: (envelope) => {
    const raw = envelope.result;
    if (!isRecord(raw)) throw new Error("DATA_EUROPA_HUB_RESULT_INVALID");
    const landingPage = firstLandingPage(raw.landing_page);
    return {
      externalId: assertValidString(raw.id, "DATA_EUROPA_HUB_ID"),
      title: pickLocalized(raw.title, "DATA_EUROPA_HUB_TITLE"),
      description: optionalLocalized(raw.description, "DATA_EUROPA_HUB_DESCRIPTION"),
      rawValueCents: null,
      sourceEventTimestamp: assertIsoDateUtc(raw.issued, "DATA_EUROPA_HUB_ISSUED"),
      sourceEventType: "publication",
      payloadUrl: assertValidUrl(landingPage ?? raw.resource, "DATA_EUROPA_HUB_URL"),
    };
  },
};

export function normalizeSourcePayload(sourceType: string, rawData: unknown): NormalizedSourcePayload {
  const sourceName = assertValidString(sourceType, "SOURCE_TYPE");
  if (!isRecord(rawData)) throw new Error("INVALID_RAW_DATA_OBJECT");

  // Own-property lookup: "constructor", "__proto__", "toString"... are not extractors.
  const extractor = Object.hasOwn(SOURCE_EXTRACTORS_REGISTRY, sourceName)
    ? SOURCE_EXTRACTORS_REGISTRY[sourceName]
    : undefined;
  if (!extractor) throw new Error(`UNSUPPORTED_SOURCE_TYPE_${sourceName}`);

  const extracted = extractor(rawData);
  return { sourceName, ...extracted };
}
