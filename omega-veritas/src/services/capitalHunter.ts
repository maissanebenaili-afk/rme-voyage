import {
  HASH_DOMAINS,
  computeNormalizedSemanticHash,
  computeSourceContentHash,
  computeSourceSemanticHash,
  domainHash,
  isSha256Hex,
  parseSourceBytes,
} from "../core/cryptoIngestion";
import { computeOpportunityIdentity, computeVersionIdentity } from "../core/provenance";
import { normalizeSourcePayload, type NormalizedSourcePayload } from "./sourceAdapter";

export const ENVELOPE_SCHEMA_VERSION = "omega-veritas/envelope/v2";

/** previousHash of the first envelope of a chain. */
export const GENESIS_PREVIOUS_HASH = "0".repeat(64);

export interface MoneyHuntMetrics {
  whoPays: string;
  mechanism: string;
  acquisitionCostCents: number;
  initialCostCents: number;
  timeToRevenueDays: number;
  repeatability: boolean;
  legalConstraints: string[];
  confidenceLevel: "LOW" | "MEDIUM" | "HIGH";
  nextAction: string;
}

export interface OpportunityEnvelope {
  schemaVersion: string;

  /** Stable business identity: H(opportunity-id domain, sourceName, externalId). */
  opportunityId: string;
  identityHash: string;

  /** Precise version: H(version-id domain, sourceName, externalId, h_source_semantic, h_normalized_semantic). */
  versionId: string;
  versionHash: string;

  /** Temporal metadata only; never part of any identity. */
  capturedAt: number;

  source: string;
  externalId: string;
  /** Provenance only; never part of any identity. */
  sourceUrl: string;

  /** Level 1: plain SHA-256 of the exact bytes received. */
  sourceContentHash: string;
  /** Level 2: canonical source JSON, before any application translation. */
  h_source_semantic: string;
  /** Level 3: canonical application-normalized payload. */
  h_normalized_semantic: string;

  evidenceHash: string;

  moneyHunt: MoneyHuntMetrics;

  previousHash: string;
  currentHash?: string;
}

export type SourceNormalizer = (sourceType: string, rawData: unknown) => NormalizedSourcePayload;

export type ChainValidationResult =
  | { valid: true }
  | { valid: false; index: number; reason: "PREVIOUS_HASH_MISMATCH" | "CURRENT_HASH_MISMATCH" };

function assertNonNegativeInteger(value: number, name: string): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new Error(`${name}_INVALID`);
  }
  return value;
}

function assertFiniteNonNegative(value: number, name: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new Error(`${name}_INVALID`);
  }
  return value;
}

function computeEnvelopeSeal(envelope: Omit<OpportunityEnvelope, "currentHash">): Promise<string> {
  const { currentHash: _excluded, ...body } = envelope as OpportunityEnvelope;
  return domainHash(HASH_DOMAINS.envelopeSeal, body);
}

export async function scelleEnvelope(
  envelopeWithoutHash: Omit<OpportunityEnvelope, "currentHash">,
): Promise<OpportunityEnvelope> {
  const currentHash = await computeEnvelopeSeal(envelopeWithoutHash);
  return { ...envelopeWithoutHash, currentHash };
}

/**
 * Checks each seal against the recomputed canonical content and each previousHash
 * against the predecessor's currentHash (GENESIS_PREVIOUS_HASH for the first).
 * This proves internal consistency only: whoever controls the whole chain can
 * rewrite and reseal it. Immutability requires an external headHash anchor.
 */
export async function validateChain(
  chain: readonly OpportunityEnvelope[],
): Promise<ChainValidationResult> {
  let expectedPrevious = GENESIS_PREVIOUS_HASH;
  for (let index = 0; index < chain.length; index++) {
    const envelope = chain[index];
    if (envelope.previousHash !== expectedPrevious) {
      return { valid: false, index, reason: "PREVIOUS_HASH_MISMATCH" };
    }
    if (!isSha256Hex(envelope.currentHash) || (await computeEnvelopeSeal(envelope)) !== envelope.currentHash) {
      return { valid: false, index, reason: "CURRENT_HASH_MISMATCH" };
    }
    expectedPrevious = envelope.currentHash;
  }
  return { valid: true };
}

export async function ingestOpportunitySignal(
  rawSourceBytes: Uint8Array,
  meta: {
    source: string;
    url: string;
    previousHash: string;
    metrics: MoneyHuntMetrics;
    capturedAt?: number;
    normalizer?: SourceNormalizer;
  },
): Promise<OpportunityEnvelope | null> {
  const acqCost = assertNonNegativeInteger(
    meta.metrics.acquisitionCostCents,
    "ACQUISITION_COST",
  );
  const initCost = assertNonNegativeInteger(
    meta.metrics.initialCostCents,
    "INITIAL_COST",
  );
  assertFiniteNonNegative(meta.metrics.timeToRevenueDays, "TIME_TO_REVENUE_DAYS");

  if (acqCost !== 0 || initCost !== 0) return null;

  if (!(rawSourceBytes instanceof Uint8Array) || rawSourceBytes.byteLength === 0) {
    throw new Error("RAW_SOURCE_BYTES_INVALID");
  }
  if (!isSha256Hex(meta.previousHash)) throw new Error("PREVIOUS_HASH_INVALID");
  const capturedAt = assertNonNegativeInteger(meta.capturedAt ?? Date.now(), "CAPTURED_AT");

  const sourceContentHash = await computeSourceContentHash(rawSourceBytes);
  const parsedSource = parseSourceBytes(rawSourceBytes);
  const h_source_semantic = await computeSourceSemanticHash(parsedSource);

  const normalized = (meta.normalizer ?? normalizeSourcePayload)(meta.source, parsedSource);
  const h_normalized_semantic = await computeNormalizedSemanticHash(normalized);

  const { identityHash, opportunityId } = await computeOpportunityIdentity(
    normalized.sourceName,
    normalized.externalId,
  );
  const { versionHash, versionId } = await computeVersionIdentity(
    normalized.sourceName,
    normalized.externalId,
    h_source_semantic,
    h_normalized_semantic,
  );

  const evidenceHash = await domainHash(HASH_DOMAINS.evidence, {
    sourceUrl: meta.url,
    sourceContentHash,
  });

  const envelopeCore: Omit<OpportunityEnvelope, "currentHash"> = {
    schemaVersion: ENVELOPE_SCHEMA_VERSION,
    opportunityId,
    identityHash,
    versionId,
    versionHash,
    capturedAt,
    source: normalized.sourceName,
    externalId: normalized.externalId,
    sourceUrl: meta.url,
    sourceContentHash,
    h_source_semantic,
    h_normalized_semantic,
    evidenceHash,
    moneyHunt: meta.metrics,
    previousHash: meta.previousHash,
  };

  return scelleEnvelope(envelopeCore);
}
