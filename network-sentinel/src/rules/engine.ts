import { computeReliability } from '../calibration/reliability.js';
import type { Alert, AlertKind, Device, Feedback, ScanSnapshot } from '../types.js';

let counter = 0;
function nextId(): string {
  counter += 1;
  return `alert-${Date.now()}-${counter}`;
}

function severityFor(kind: AlertKind, feedback: Feedback[]): Alert['severity'] {
  return computeReliability(kind, feedback).calibratedSeverity;
}

/**
 * Diffs one fresh scan against the known-device registry and emits alerts
 * for anything worth a human's attention. Returns both the alerts and the
 * updated registry (never mutates its inputs).
 */
export function evaluateScan(
  snapshot: ScanSnapshot,
  knownDevices: Device[],
  feedback: Feedback[],
): { alerts: Alert[]; devices: Device[] } {
  const alerts: Alert[] = [];
  const byMac = new Map(knownDevices.map((d) => [d.mac, { ...d }]));
  const macByIpInSnapshot = new Map<string, string>();

  for (const { ip, mac } of snapshot.entries) {
    const existing = byMac.get(mac);

    if (!existing) {
      byMac.set(mac, { mac, ip, firstSeen: snapshot.timestamp, lastSeen: snapshot.timestamp, present: true });
      alerts.push({
        id: nextId(),
        kind: 'new_device',
        timestamp: snapshot.timestamp,
        severity: severityFor('new_device', feedback),
        message: `New device joined the network: ${mac} (${ip})`,
        details: { mac, ip },
      });
    } else {
      if (!existing.present) {
        alerts.push({
          id: nextId(),
          kind: 'device_returned',
          timestamp: snapshot.timestamp,
          severity: severityFor('device_returned', feedback),
          message: `Device reappeared on the network: ${mac} (${ip})`,
          details: { mac, ip },
        });
      }
      existing.ip = ip;
      existing.lastSeen = snapshot.timestamp;
      existing.present = true;
    }

    // Same IP claimed by a different MAC within this scan than another entry we already
    // processed — a live sign of ARP spoofing / MAC churn, not just a new device.
    const priorMacForIp = macByIpInSnapshot.get(ip);
    if (priorMacForIp && priorMacForIp !== mac) {
      alerts.push({
        id: nextId(),
        kind: 'mac_churn',
        timestamp: snapshot.timestamp,
        severity: severityFor('mac_churn', feedback),
        message: `IP ${ip} answered from two different MAC addresses in the same scan: ${priorMacForIp} and ${mac}`,
        details: { ip, macA: priorMacForIp, macB: mac },
      });
    }
    macByIpInSnapshot.set(ip, mac);
  }

  const seenMacs = new Set(snapshot.entries.map((e) => e.mac));
  for (const device of byMac.values()) {
    if (!seenMacs.has(device.mac) && device.present) {
      device.present = false;
    }
  }

  return { alerts, devices: Array.from(byMac.values()) };
}
