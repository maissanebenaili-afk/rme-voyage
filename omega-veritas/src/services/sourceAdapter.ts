export type SourceEventType = "publication" | "emission" | "update" | "deadline" | "start";

export interface NormalizedSourcePayload {
  sourceName: string;
  externalId: string;
  title: string;
  description: string;
  rawValueCents: number;
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

export function throttle(ms: number): Promise<void> {
  if (typeof ms !== "number" || !Number.isSafeInteger(ms) || ms < 0) {
    return Promise.reject(new Error("THROTTLE_INVALID_MS"));
  }
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// [SCHEMA_SYNTHETIQUE_TEST] — fields below are fixtures only until real source schemas are certified.
const SOURCE_EXTRACTORS_REGISTRY: Record<string, PropertyExtractor> = {
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
