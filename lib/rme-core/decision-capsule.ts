import { createHash } from "node:crypto";

export type DecisionCapsule = {
  capsuleId: string;
  createdAt: string;
  inputFingerprint: string;
  engineVersions: Record<string, string>;
  configurationVersion: string;
  evidenceRefs: string[];
  riskAssessment: Record<string, unknown>;
  decision: Record<string, unknown>;
  explanationReasonCode: string;
  commercialState: string;
  integrityFingerprint: string;
};

function canonicalize(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string" || typeof value === "boolean") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("CANONICAL_JSON_VALUE_INVALID");
    return JSON.stringify(value);
  }
  if (typeof value === "undefined") throw new Error("CANONICAL_JSON_VALUE_INVALID");
  if (Array.isArray(value)) return "[" + value.map(canonicalize).join(",") + "]";
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    return "{" + Object.keys(record).sort()
      .map((key) => JSON.stringify(key) + ":" + canonicalize(record[key]))
      .join(",") + "}";
  }
  throw new Error("CANONICAL_JSON_VALUE_INVALID");
}

export function fingerprint(input: unknown): string {
  return createHash("sha256").update(canonicalize(input)).digest("hex");
}

function capsuleIntegrityPayload(capsule: Omit<DecisionCapsule, "integrityFingerprint">) {
  return {
    capsuleId: capsule.capsuleId,
    createdAt: capsule.createdAt,
    inputFingerprint: capsule.inputFingerprint,
    engineVersions: capsule.engineVersions,
    configurationVersion: capsule.configurationVersion,
    evidenceRefs: capsule.evidenceRefs,
    riskAssessment: capsule.riskAssessment,
    decision: capsule.decision,
    explanationReasonCode: capsule.explanationReasonCode,
    commercialState: capsule.commercialState,
  };
}

export function createDecisionCapsule(input: {
  capsuleId: string;
  createdAt: string;
  input: unknown;
  engineVersions: Record<string, string>;
  configurationVersion: string;
  evidenceRefs: string[];
  riskAssessment: Record<string, unknown>;
  decision: Record<string, unknown>;
  explanationReasonCode: string;
  commercialState: string;
}): DecisionCapsule {
  const capsule = {
    capsuleId: input.capsuleId,
    createdAt: input.createdAt,
    inputFingerprint: fingerprint(input.input),
    engineVersions: { ...input.engineVersions },
    configurationVersion: input.configurationVersion,
    evidenceRefs: [...input.evidenceRefs],
    riskAssessment: structuredClone(input.riskAssessment),
    decision: structuredClone(input.decision),
    explanationReasonCode: input.explanationReasonCode,
    commercialState: input.commercialState,
  };
  return {
    ...capsule,
    integrityFingerprint: fingerprint(capsuleIntegrityPayload(capsule)),
  };
}

export function replayDecision(
  capsule: DecisionCapsule,
  input: unknown,
  engineVersions: Record<string, string>,
  configurationVersion: string,
): { status: "REPLAY_MATCH"; fingerprint: string } | {
  status: "REPLAY_MISMATCH";
  reason: "INPUT" | "ENGINE" | "CONFIGURATION" | "INTEGRITY";
} {
  if (capsule.inputFingerprint !== fingerprint(input)) {
    return { status: "REPLAY_MISMATCH", reason: "INPUT" };
  }
  if (canonicalize(capsule.engineVersions) !== canonicalize(engineVersions)) {
    return { status: "REPLAY_MISMATCH", reason: "ENGINE" };
  }
  if (capsule.configurationVersion !== configurationVersion) {
    return { status: "REPLAY_MISMATCH", reason: "CONFIGURATION" };
  }
  const { integrityFingerprint: storedIntegrity, ...unsignedCapsule } = capsule;
  if (storedIntegrity !== fingerprint(capsuleIntegrityPayload(unsignedCapsule))) {
    return { status: "REPLAY_MISMATCH", reason: "INTEGRITY" };
  }
  return { status: "REPLAY_MATCH", fingerprint: capsule.inputFingerprint };
}
