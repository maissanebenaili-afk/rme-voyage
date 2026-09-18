import { runArpScan } from './discovery/arpScan.js';
import { evaluateScan } from './rules/engine.js';
import { computeAllReliability } from './calibration/reliability.js';
import { appendAlerts, appendFeedback, loadAlerts, loadFeedback } from './store/alertStore.js';
import { loadDevices, saveDevices } from './store/deviceStore.js';

async function runScan() {
  const snapshot = await runArpScan();
  const knownDevices = await loadDevices();
  const feedback = await loadFeedback();

  const { alerts, devices } = evaluateScan(snapshot, knownDevices, feedback);

  await saveDevices(devices);
  await appendAlerts(alerts);

  console.log(`Scanned ${snapshot.entries.length} device(s) at ${snapshot.timestamp}`);
  if (alerts.length === 0) {
    console.log('No new alerts.');
    return;
  }
  console.log(`\n${alerts.length} new alert(s):`);
  for (const a of alerts) {
    console.log(`  [${a.severity.toUpperCase()}] ${a.id} — ${a.message}`);
  }
  console.log('\nConfirm alerts with: npm run confirm -- <alertId> true|false');
}

async function listAlerts() {
  const alerts = await loadAlerts();
  const feedback = await loadFeedback();
  const confirmedIds = new Set(feedback.map((f) => f.alertId));
  const pending = alerts.filter((a) => !confirmedIds.has(a.id));

  if (alerts.length === 0) {
    console.log('No alerts recorded yet. Run `npm run scan` first.');
    return;
  }
  console.log(`${alerts.length} total alert(s), ${pending.length} awaiting feedback:\n`);
  for (const a of alerts.slice(-30)) {
    const status = confirmedIds.has(a.id) ? '' : ' (unconfirmed)';
    console.log(`  [${a.severity.toUpperCase()}] ${a.timestamp} ${a.id} — ${a.message}${status}`);
  }
}

async function confirmAlert(alertId: string | undefined, verdict: string | undefined) {
  if (!alertId || (verdict !== 'true' && verdict !== 'false')) {
    console.error('Usage: npm run confirm -- <alertId> true|false');
    process.exit(1);
  }
  const alerts = await loadAlerts();
  const alert = alerts.find((a) => a.id === alertId);
  if (!alert) {
    console.error(`No alert found with id "${alertId}"`);
    process.exit(1);
  }
  await appendFeedback({
    alertId: alert.id,
    alertKind: alert.kind,
    confirmed: verdict === 'true',
    timestamp: new Date().toISOString(),
  });
  console.log(`Recorded feedback: "${alert.kind}" alert ${alertId} confirmed=${verdict}`);
}

async function report() {
  const feedback = await loadFeedback();
  const stats = computeAllReliability(feedback);
  console.log('Rule reliability (calibrated from confirmed feedback):\n');
  for (const s of stats) {
    console.log(
      `  ${s.kind.padEnd(16)} feedback=${s.totalFeedback}  confirmed=${(s.confirmedRate * 100).toFixed(0)}%  ` +
        `severity=${s.calibratedSeverity}`,
    );
  }
}

async function main() {
  const [command, ...args] = process.argv.slice(2);

  if (command === 'scan') return runScan();
  if (command === 'alerts') return listAlerts();
  if (command === 'confirm') return confirmAlert(args[0], args[1]);
  if (command === 'report') return report();

  console.error('Usage: npm run <scan|alerts|confirm|report>');
  process.exit(1);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
