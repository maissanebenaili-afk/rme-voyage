export interface Device {
  mac: string;
  ip: string;
  firstSeen: string;
  lastSeen: string;
  /** Set to false once a device stops appearing in scans, true again if it returns. */
  present: boolean;
}

export interface ScanSnapshot {
  timestamp: string;
  /** ip -> mac, exactly as seen in this one scan. */
  entries: { ip: string; mac: string }[];
}

export type AlertKind = 'new_device' | 'mac_churn' | 'device_returned';

export type Severity = 'info' | 'warning' | 'alert';

export interface Alert {
  id: string;
  kind: AlertKind;
  timestamp: string;
  severity: Severity;
  message: string;
  details: Record<string, string>;
}

export interface Feedback {
  alertId: string;
  alertKind: AlertKind;
  /** Did the human confirm this alert represented something genuinely worth flagging? */
  confirmed: boolean;
  timestamp: string;
}

export interface ReliabilityStats {
  kind: AlertKind;
  totalFeedback: number;
  confirmedCount: number;
  confirmedRate: number;
  calibratedSeverity: Severity;
}
