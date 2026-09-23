import { HASH_DOMAINS, domainHash, isSha256Hex } from "./cryptoIngestion";

/**
 * opportunityId identifies the business entity: stable across content updates,
 * normalizer changes, URL changes and capture time.
 * versionId identifies one precise version of that entity (double provenance).
 * Neither ever depends on capturedAt, Date.now(), randomness or insertion order.
 */
export interface OpportunityIdentity {
  identityHash: string;
  opportunityId: string;
}

export interface VersionIdentity {
  versionHash: string;
  versionId: string;
}

function assertIdentityKey(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim() === "" || value !== value.trim()) {
    throw new Error(`${name}_INVALID_IDENTITY_KEY`);
  }
  return value;
}

export async function computeOpportunityIdentity(
  sourceName: string,
  externalId: string,
): Promise<OpportunityIdentity> {
  const identityHash = await domainHash(HASH_DOMAINS.opportunityId, {
    sourceName: assertIdentityKey(sourceName, "SOURCE_NAME"),
    externalId: assertIdentityKey(externalId, "EXTERNAL_ID"),
  });
  return { identityHash, opportunityId: `opp_${identityHash.slice(0, 32)}` };
}

export async function computeVersionIdentity(
  sourceName: string,
  externalId: string,
  h_source_semantic: string,
  h_normalized_semantic: string,
): Promise<VersionIdentity> {
  if (!isSha256Hex(h_source_semantic)) throw new Error("H_SOURCE_SEMANTIC_INVALID");
  if (!isSha256Hex(h_normalized_semantic)) throw new Error("H_NORMALIZED_SEMANTIC_INVALID");
  const versionHash = await domainHash(HASH_DOMAINS.versionId, {
    sourceName: assertIdentityKey(sourceName, "SOURCE_NAME"),
    externalId: assertIdentityKey(externalId, "EXTERNAL_ID"),
    h_source_semantic,
    h_normalized_semantic,
  });
  return { versionHash, versionId: `ver_${versionHash.slice(0, 32)}` };
}
