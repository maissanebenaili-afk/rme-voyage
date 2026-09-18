import { describe, expect, it } from 'vitest';
import { evaluateScan } from '../src/rules/engine.js';
import type { Device, Feedback, ScanSnapshot } from '../src/types.js';

function snapshot(entries: { ip: string; mac: string }[], timestamp = '2026-01-01T00:00:00.000Z'): ScanSnapshot {
  return { timestamp, entries };
}

describe('evaluateScan', () => {
  it('flags every device as new on the very first scan', () => {
    const { alerts, devices } = evaluateScan(
      snapshot([{ ip: '192.168.1.2', mac: 'aa:bb:cc:dd:ee:01' }]),
      [],
      [],
    );
    expect(alerts).toHaveLength(1);
    expect(alerts[0].kind).toBe('new_device');
    expect(devices).toHaveLength(1);
    expect(devices[0].present).toBe(true);
  });

  it('does not re-flag a device that is still present in a later scan', () => {
    const known: Device[] = [
      { mac: 'aa:bb:cc:dd:ee:01', ip: '192.168.1.2', firstSeen: 't0', lastSeen: 't0', present: true },
    ];
    const { alerts } = evaluateScan(
      snapshot([{ ip: '192.168.1.2', mac: 'aa:bb:cc:dd:ee:01' }]),
      known,
      [],
    );
    expect(alerts).toHaveLength(0);
  });

  it('marks an absent device as not present, then flags device_returned when it comes back', () => {
    const known: Device[] = [
      { mac: 'aa:bb:cc:dd:ee:01', ip: '192.168.1.2', firstSeen: 't0', lastSeen: 't0', present: true },
    ];
    const gone = evaluateScan(snapshot([]), known, []);
    expect(gone.devices[0].present).toBe(false);

    const back = evaluateScan(
      snapshot([{ ip: '192.168.1.2', mac: 'aa:bb:cc:dd:ee:01' }]),
      gone.devices,
      [],
    );
    expect(back.alerts).toHaveLength(1);
    expect(back.alerts[0].kind).toBe('device_returned');
  });

  it('flags mac_churn when the same IP answers from two MACs within one scan', () => {
    const { alerts } = evaluateScan(
      snapshot([
        { ip: '192.168.1.2', mac: 'aa:bb:cc:dd:ee:01' },
        { ip: '192.168.1.2', mac: 'aa:bb:cc:dd:ee:99' },
      ]),
      [],
      [],
    );
    const churn = alerts.filter((a) => a.kind === 'mac_churn');
    expect(churn).toHaveLength(1);
  });

  it('applies calibrated severity from feedback history to new alerts', () => {
    const noisyFeedback: Feedback[] = Array.from({ length: 6 }, (_, i) => ({
      alertId: `old-${i}`,
      alertKind: 'new_device' as const,
      confirmed: false,
      timestamp: 't0',
    }));
    const { alerts } = evaluateScan(
      snapshot([{ ip: '192.168.1.2', mac: 'aa:bb:cc:dd:ee:01' }]),
      [],
      noisyFeedback,
    );
    // new_device defaults to 'warning'; 6/6 unconfirmed should demote it to 'info'.
    expect(alerts[0].severity).toBe('info');
  });
});
