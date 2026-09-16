import type { AlertKind, Feedback, ReliabilityStats, Severity } from '../types.js';

/** Below this many confirmations, we trust the rule's designed-in default severity. */
const MIN_SAMPLES = 5;
/** Below this confirmed-true rate (once we have enough samples), demote severity. */
const DEMOTE_THRESHOLD = 0.3;
/** Above this confirmed-true rate, a rule earns promotion back to full severity. */
const PROMOTE_THRESHOLD = 0.7;

const DEFAULT_SEVERITY: Record<AlertKind, Severity> = {
  new_device: 'warning',
  mac_churn: 'alert',
  device_returned: 'info',
};

function demote(severity: Severity): Severity {
  if (severity === 'alert') return 'warning';
  if (severity === 'warning') return 'info';
  return 'info';
}

/**
 * "Verified by experience" made rigorous: every alert kind accumulates a
 * track record of human confirmations. A pattern that keeps firing on
 * things the user dismisses gets automatically quieted; one that keeps
 * getting confirmed keeps (or regains) its full severity. No calibration
 * happens until there's enough evidence to trust it.
 */
export function computeReliability(kind: AlertKind, feedback: Feedback[]): ReliabilityStats {
  const relevant = feedback.filter((f) => f.alertKind === kind);
  const totalFeedback = relevant.length;
  const confirmedCount = relevant.filter((f) => f.confirmed).length;
  const confirmedRate = totalFeedback > 0 ? confirmedCount / totalFeedback : 1;

  let calibratedSeverity = DEFAULT_SEVERITY[kind];
  if (totalFeedback >= MIN_SAMPLES) {
    if (confirmedRate < DEMOTE_THRESHOLD) {
      calibratedSeverity = demote(DEFAULT_SEVERITY[kind]);
    } else if (confirmedRate >= PROMOTE_THRESHOLD) {
      calibratedSeverity = DEFAULT_SEVERITY[kind];
    } else {
      calibratedSeverity = DEFAULT_SEVERITY[kind];
    }
  }

  return { kind, totalFeedback, confirmedCount, confirmedRate, calibratedSeverity };
}

export function computeAllReliability(feedback: Feedback[]): ReliabilityStats[] {
  return (Object.keys(DEFAULT_SEVERITY) as AlertKind[]).map((kind) => computeReliability(kind, feedback));
}

export function defaultSeverity(kind: AlertKind): Severity {
  return DEFAULT_SEVERITY[kind];
}
