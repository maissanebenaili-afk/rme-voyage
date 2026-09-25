import type { CorridorPulsePayload } from '@/lib/types/pulse';

const now = Date.now();

export const pulseSnapshotDemo: CorridorPulsePayload = {
  corridorId: 'europe-maroc-axis',
  globalPulseScore: 78,
  methodologyVersion: 'v0.1-alpha-demo',
  generatedAt: now,
  nodes: {
    paris: { nodeId: 'paris', sampleSize: 34, computedAt: now - 120000, metrics: { tension: 12, tensionVelocity: 0, earlySignal: 'NORMAL', confidence: 94, agreement: 96, freshness: 98, sourceDiversity: 100, sampleAdequacy: 100, anomaly: false } },
    barcelona: { nodeId: 'barcelona', sampleSize: 19, computedAt: now - 840000, metrics: { tension: 42, tensionVelocity: 6, earlySignal: 'NORMAL', confidence: 81, agreement: 74, freshness: 88, sourceDiversity: 100, sampleAdequacy: 100, anomaly: false } },
    algeciras: { nodeId: 'algeciras', sampleSize: 42, computedAt: now - 240000, metrics: { tension: 85, tensionVelocity: 14, earlySignal: 'ACCELERATION', confidence: 91, agreement: 92, freshness: 96, sourceDiversity: 100, sampleAdequacy: 100, anomaly: false } },
    tanger_med: { nodeId: 'tanger_med', sampleSize: 3, computedAt: now - 1920000, metrics: { tension: 90, tensionVelocity: 18, earlySignal: 'BREAK', confidence: 38, agreement: 50, freshness: 40, sourceDiversity: 60, sampleAdequacy: 9, anomaly: false } },
    marrakech: { nodeId: 'marrakech', sampleSize: 65, computedAt: now - 60000, metrics: { tension: 5, tensionVelocity: -2, earlySignal: 'NORMAL', confidence: 99, agreement: 100, freshness: 99, sourceDiversity: 100, sampleAdequacy: 100, anomaly: false } },
  },
};
