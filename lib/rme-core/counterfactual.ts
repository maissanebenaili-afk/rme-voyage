export type CounterfactualDecision = {
  totalMinutes: number;
  riskScore: number;
  ecoScore: number;
  viable: boolean;
  critical: boolean;
  reasonCode: string;
};

export type CounterfactualMutation = {
  id: string;
  totalMinutesDelta: number;
  riskScoreDelta: number;
  ecoScoreDelta: number;
  viable?: boolean;
  critical?: boolean;
  reasonCode?: string;
};

export type CounterfactualResult = {
  base: CounterfactualDecision;
  alternative: CounterfactualDecision;
  delta: { totalMinutes: number; riskScore: number; ecoScore: number };
  mutationId: string;
};

function assertFinite(value: number, code: string): void {
  if (!Number.isFinite(value)) throw new Error(code);
}

function validateDecision(decision: CounterfactualDecision): void {
  assertFinite(decision.totalMinutes, "COUNTERFACTUAL_NON_FINITE");
  assertFinite(decision.riskScore, "COUNTERFACTUAL_NON_FINITE");
  assertFinite(decision.ecoScore, "COUNTERFACTUAL_NON_FINITE");
  if (decision.totalMinutes < 0) throw new Error("COUNTERFACTUAL_TOTAL_MINUTES_INVALID");
  if (decision.riskScore < 0 || decision.riskScore > 1) {
    throw new Error("COUNTERFACTUAL_RISK_INVALID");
  }
}

export function runCounterfactual(
  base: CounterfactualDecision,
  mutation: CounterfactualMutation,
): CounterfactualResult {
  if (!mutation.id.trim()) throw new Error("MUTATION_ID_REQUIRED");

  assertFinite(mutation.totalMinutesDelta, "COUNTERFACTUAL_NON_FINITE");
  assertFinite(mutation.riskScoreDelta, "COUNTERFACTUAL_NON_FINITE");
  assertFinite(mutation.ecoScoreDelta, "COUNTERFACTUAL_NON_FINITE");

  validateDecision(base);

  const alternative: CounterfactualDecision = {
    totalMinutes: base.totalMinutes + mutation.totalMinutesDelta,
    riskScore: base.riskScore + mutation.riskScoreDelta,
    ecoScore: base.ecoScore + mutation.ecoScoreDelta,
    viable: mutation.critical === true ? false : mutation.viable ?? base.viable,
    critical: mutation.critical ?? base.critical,
    reasonCode: mutation.reasonCode ?? base.reasonCode,
  };

  if (alternative.critical) alternative.viable = false;
  validateDecision(alternative);

  return {
    base: structuredClone(base),
    alternative,
    delta: {
      totalMinutes: mutation.totalMinutesDelta,
      riskScore: mutation.riskScoreDelta,
      ecoScore: mutation.ecoScoreDelta,
    },
    mutationId: mutation.id,
  };
}
