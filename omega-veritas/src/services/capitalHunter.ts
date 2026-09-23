import { canonicalJson, sha256Buffer } from "../core/cryptoIngestion";

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
  opportunityId: string;
  identityHash: string;
  capturedAt: number;
  source: string;
  sourceUrl: string;
  sourceContentHash: string;
  semanticHash: string;
  evidenceHash: string;
  moneyHunt: MoneyHuntMetrics;
  previousHash: string;
  currentHash?: string;
}

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

export async function scelleEnvelope(
  envelopeWithoutHash: Omit<OpportunityEnvelope, "currentHash">,
): Promise<OpportunityEnvelope> {
  const currentHash = await sha256Buffer(
    new TextEncoder().encode(canonicalJson(envelopeWithoutHash)),
  );
  return { ...envelopeWithoutHash, currentHash };
}

export async function ingestOpportunitySignal(
  rawSourceBytes: Uint8Array,
  meta: {
    source: string;
    url: string;
    previousHash: string;
    metrics: MoneyHuntMetrics;
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

  const sourceContentHash = await sha256Buffer(rawSourceBytes);
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(rawSourceBytes);
  const parsed = JSON.parse(decoded);
  const encoder = new TextEncoder();
  const semanticHash = await sha256Buffer(
    encoder.encode(canonicalJson(parsed)),
  );

  const evidenceHash = await sha256Buffer(
    encoder.encode(
      canonicalJson({
        sourceUrl: meta.url,
        sourceContentHash,
      }),
    ),
  );

  const identityHash = await sha256Buffer(
    encoder.encode(
      canonicalJson({
        sourceUrl: meta.url,
        sourceContentHash,
        semanticHash,
      }),
    ),
  );

  const opportunityId = `opp_${identityHash.slice(0, 32)}`;

  const envelopeCore: Omit<OpportunityEnvelope, "currentHash"> = {
    schemaVersion: "hunter-v1-canonical",
    opportunityId,
    identityHash,
    capturedAt: Date.now(),
    source: meta.source,
    sourceUrl: meta.url,
    sourceContentHash,
    semanticHash,
    evidenceHash,
    moneyHunt: meta.metrics,
    previousHash: meta.previousHash,
  };

  return scelleEnvelope(envelopeCore);
}
