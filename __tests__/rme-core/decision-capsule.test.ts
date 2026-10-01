import {
  createDecisionCapsule,
  fingerprint,
  replayDecision,
} from "@/lib/rme-core/decision-capsule";

describe("RME Decision Capsule", () => {
  const input = { route: "CDG-CMN", price: 540, facts: { totalMinutes: 365 } };
  const engines = { time: "1.0.0", risk: "1.0.0", decision: "1.0.0" };

  test("fingerprint is canonical and key-order independent", () => {
    expect(fingerprint({ b: 2, a: 1 })).toBe(fingerprint({ a: 1, b: 2 }));
  });

  test("replays exactly with identical input and versions", () => {
    const capsule = createDecisionCapsule({
      capsuleId: "cap-1",
      createdAt: "2026-10-01T00:00:00Z",
      input,
      engineVersions: engines,
      configurationVersion: "rme-1",
      evidenceRefs: ["ev-1"],
      riskAssessment: { score: 0.1, confidence: 1 },
      decision: { viable: true },
      explanationReasonCode: "OK",
      commercialState: "UNPROVEN",
    });
    expect(replayDecision(capsule, input, engines, "rme-1")).toEqual({
      status: "REPLAY_MATCH",
      fingerprint: capsule.inputFingerprint,
    });
  });

  test("version changes are explicit mismatches, never silently reconciled", () => {
    const capsule = createDecisionCapsule({
      capsuleId: "cap-2",
      createdAt: "2026-10-01T00:00:00Z",
      input,
      engineVersions: engines,
      configurationVersion: "rme-1",
      evidenceRefs: [],
      riskAssessment: {},
      decision: {},
      explanationReasonCode: "OK",
      commercialState: "UNPROVEN",
    });
    expect(replayDecision(capsule, input, engines, "rme-2")).toEqual({
      status: "REPLAY_MISMATCH",
      reason: "CONFIGURATION",
    });
  });
});
