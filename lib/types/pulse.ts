export type EarlySignalTrend = 'NORMAL' | 'ACCELERATION' | 'BREAK';
export type TensionLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type PulseNodeId = 'paris' | 'barcelona' | 'algeciras' | 'tarifa' | 'tanger_med' | 'marrakech';

export interface PulseMetrics {
  tension: number;
  tensionVelocity: number;
  earlySignal: EarlySignalTrend;
  confidence: number;
  agreement: number;
  freshness: number;
  sourceDiversity: number;
  sampleAdequacy: number;
  anomaly: boolean;
  anomalyReason?: string;
}

export interface NodePulseSnapshot {
  nodeId: string;
  sampleSize: number;
  computedAt: number;
  metrics: PulseMetrics;
}

export interface CorridorPulsePayload {
  corridorId: string;
  globalPulseScore: number;
  nodes: Record<string, NodePulseSnapshot>;
  generatedAt: number;
  methodologyVersion: string;
}
