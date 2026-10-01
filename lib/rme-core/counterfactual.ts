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

export function runCounterfactual(
  base: CounterfactualDecision,
  mutation: CounterfactualMutation,
): CounterfactualResult {
  if (!mutation.id.trim()) throw new Error("MUTATION_ID_REQUIRED");
  const alternative: CounterfactualDecision = {
    totalMinutes: base.totalMinutes + mutation.totalMinutesDelta,
    riskScore: base.riskScore + mutation.riskScoreDelta,
    ecoScore: base.ecoScore + mutation.ecoScoreDelta,
    viable: mutation.critical === true ? false : mutation.viable ?? base.viable,
    critical: mutation.critical ?? base.critical,
    reasonCode: mutation.reasonCode ?? base.reasonCode,
  };
  if (alternative.critical) alternative.viable = false;
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
