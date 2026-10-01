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
};

function canonicalize(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonicalize).join(",") + "]";
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return "{" + Object.keys(record).sort()
      .map((key) => JSON.stringify(key) + ":" + canonicalize(record[key]))
      .join(",") + "}";
  }
  return JSON.stringify(value);
}

export function fingerprint(input: unknown): string {
  return createHash("sha256").update(canonicalize(input)).digest("hex");
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
  return {
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
}

export function replayDecision(
  capsule: DecisionCapsule,
  input: unknown,
  engineVersions: Record<string, string>,
  configurationVersion: string,
): { status: "REPLAY_MATCH"; fingerprint: string } | {
  status: "REPLAY_MISMATCH";
  reason: "INPUT" | "ENGINE" | "CONFIGURATION";
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
  return { status: "REPLAY_MATCH", fingerprint: capsule.inputFingerprint };
}
