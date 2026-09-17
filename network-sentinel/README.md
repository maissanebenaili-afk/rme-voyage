# Network Sentinel

A free, local, zero-dependency network security watcher that **learns which
of its own alerts to trust from your confirmations over time** instead of
staying static.

Standalone project — unrelated to the RME Voyage app or to
`ai-agent-auto-improvement` elsewhere in this repo. Own directory, own
`package.json`, no shared code.

## What it does

1. Reads your machine's own ARP cache (`arp -a`) — the devices your computer
   has already talked to on the local network. This is passive and
   read-only: no packets are sent to other hosts, so it's safe to run on any
   network you're a normal member of (home Wi-Fi, office LAN).
2. Diffs that against a registry of previously seen devices and raises
   alerts for things worth noticing:
   - **`new_device`** — a MAC address never seen before joins the network.
   - **`mac_churn`** — the same IP answers from two different MAC addresses
     in one scan, a live sign of ARP spoofing / a MITM attempt.
   - **`device_returned`** — a device that had gone quiet reappears.
3. **Self-calibrates.** Every alert kind accumulates a track record of your
   `confirm ... true|false` feedback. Once there's enough evidence (5+
   confirmations), a kind that you keep dismissing gets automatically
   demoted from `alert`/`warning` to `info`; one you keep confirming keeps
   its full severity. No calibration happens before there's evidence to
   justify it, and nothing is ever silently deleted — `npm run report` shows
   the full track record behind every current severity.

That third point is the actual point of the project: not "alerts based on
a hunch," but a system whose confidence in its own patterns is *earned*,
transparently, from your own accumulated feedback — no cloud, no account, no
model weights, nothing paid.

## Quickstart

```bash
npm install
npm run scan               # read the ARP cache, diff it, print + persist alerts
npm run alerts              # list recent alerts
npm run confirm -- <alertId> true    # or false — tell it whether an alert was real
npm run report               # see calibrated severity per alert kind
npm test                     # unit tests — fully offline, no network/arp needed
```

Run `npm run scan` periodically (a cron job, a `while true; do ...; sleep`
loop, a login-time hook — your choice, no infrastructure required) to build
up a real history.

Note: `arp` isn't available in every sandboxed/CI environment (this repo's
own dev container doesn't have it) — that's expected, it's a tool for your
actual machine's real network, not for CI. `npm test` never touches `arp`.

## Project layout

```
src/
  types.ts                     Device, ScanSnapshot, Alert, Feedback, ReliabilityStats
  discovery/
    parser.ts                   Pure `arp -a` output parser (Linux/macOS/Windows) — unit-tested
    arpScan.ts                   Runs `arp -a` and parses it into a ScanSnapshot
  rules/engine.ts               Diffs a scan against the known-device registry -> alerts
  calibration/reliability.ts     Turns confirm/deny feedback history into calibrated severities
  store/                         File-based persistence (data/devices.json, alerts.json, feedback.json)
  cli.ts                         scan / alerts / confirm / report commands
test/                            Vitest suite — parser fixtures, rule engine, calibration logic
```

## Extending it

- **More rules**: add a case to `evaluateScan` in `rules/engine.ts` and a
  default severity entry in `calibration/reliability.ts`.
- **Richer discovery**: swap `arpScan.ts` for anything that returns a
  `ScanSnapshot` — a router's DHCP lease list, `ip neigh` on Linux, a
  `nmap -sn` self-scan of your own subnet. The engine and calibration layer
  don't change.
- **Notifications**: `runScan()` in `cli.ts` is the single place alerts get
  produced — pipe them to a desktop notification, a webhook, a log file.
- **Tune the calibration curve**: `MIN_SAMPLES`, `DEMOTE_THRESHOLD`, and
  `PROMOTE_THRESHOLD` in `calibration/reliability.ts` control how much
  evidence is needed and how aggressively severity moves.
