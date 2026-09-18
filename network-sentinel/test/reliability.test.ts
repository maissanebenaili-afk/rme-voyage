import { describe, expect, it } from 'vitest';
import { computeReliability } from '../src/calibration/reliability.js';
import type { Feedback } from '../src/types.js';

function feedback(kind: Feedback['alertKind'], confirmed: boolean): Feedback {
  return { alertId: Math.random().toString(), alertKind: kind, confirmed, timestamp: 't' };
}

describe('computeReliability', () => {
  it('keeps the default severity when there is not enough feedback yet', () => {
    const stats = computeReliability('mac_churn', [feedback('mac_churn', false), feedback('mac_churn', false)]);
    expect(stats.calibratedSeverity).toBe('alert'); // default, below MIN_SAMPLES
  });

  it('demotes severity once enough feedback shows a low confirmation rate', () => {
    const history = [
      feedback('new_device', false),
      feedback('new_device', false),
      feedback('new_device', false),
      feedback('new_device', false),
      feedback('new_device', true),
    ];
    const stats = computeReliability('new_device', history);
    expect(stats.totalFeedback).toBe(5);
    expect(stats.confirmedRate).toBeCloseTo(0.2);
    expect(stats.calibratedSeverity).toBe('info'); // demoted from 'warning'
  });

  it('keeps full severity when confirmation rate stays high', () => {
    const history = Array.from({ length: 5 }, () => feedback('mac_churn', true));
    const stats = computeReliability('mac_churn', history);
    expect(stats.calibratedSeverity).toBe('alert');
  });

  it('is unaffected by feedback for a different alert kind', () => {
    const history = Array.from({ length: 5 }, () => feedback('device_returned', false));
    const stats = computeReliability('new_device', history);
    expect(stats.totalFeedback).toBe(0);
    expect(stats.calibratedSeverity).toBe('warning');
  });

  it('demotes by one level (not fully) in the mixed-reliability middle band', () => {
    const history = [
      feedback('mac_churn', true),
      feedback('mac_churn', true),
      feedback('mac_churn', false),
      feedback('mac_churn', false),
      feedback('mac_churn', false),
    ];
    const stats = computeReliability('mac_churn', history);
    expect(stats.confirmedRate).toBeCloseTo(0.4);
    expect(stats.calibratedSeverity).toBe('warning'); // one step down from 'alert', not fully muted to 'info'
  });

  it('demotes by two levels when confirmation rate is low, bottoming out at info', () => {
    const history = [
      feedback('mac_churn', true),
      feedback('mac_churn', false),
      feedback('mac_churn', false),
      feedback('mac_churn', false),
      feedback('mac_churn', false),
    ];
    const stats = computeReliability('mac_churn', history);
    expect(stats.confirmedRate).toBeCloseTo(0.2);
    expect(stats.calibratedSeverity).toBe('info');
  });
});
