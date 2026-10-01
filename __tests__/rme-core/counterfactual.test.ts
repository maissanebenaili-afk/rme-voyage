import { runCounterfactual } from "@/lib/rme-core/counterfactual";

describe("RME Counterfactual Engine", () => {
  const base = {
    totalMinutes: 365,
    riskScore: 0.1,
    ecoScore: 1107.5,
    viable: true,
    critical: false,
    reasonCode: "OK",
  };

  test("computes deterministic deltas without mutating the base", () => {
    const result = runCounterfactual(base, {
      id: "hub-xpg",
      totalMinutesDelta: 30,
      riskScoreDelta: 0.1,
      ecoScoreDelta: 42,
    });
    expect(result.delta).toEqual({ totalMinutes: 30, riskScore: 0.1, ecoScore: 42 });
    expect(result.alternative.totalMinutes).toBe(395);
    expect(base.totalMinutes).toBe(365);
  });

  test("critical mutation dominates viability", () => {
    const result = runCounterfactual(base, {
      id: "negative-buffer",
      totalMinutesDelta: -15,
      riskScoreDelta: 0.2,
      ecoScoreDelta: 0,
      critical: true,
    });
    expect(result.alternative.critical).toBe(true);
    expect(result.alternative.viable).toBe(false);
  });
});
