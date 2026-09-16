/**
 * Parses `arp -a` output across the three OS formats we care about. Pure
 * function on purpose: it's the part of the discovery pipeline that's
 * actually worth unit-testing, since the OS call itself can't be exercised
 * reliably in CI/sandboxes.
 *
 * Linux (net-tools):   hostname (192.168.1.2) at aa:bb:cc:dd:ee:ff [ether] on eth0
 * macOS (BSD arp):      ? (192.168.1.2) at aa:bb:cc:dd:ee:ff on en0 ifscope [ethernet]
 * Windows:               192.168.1.2          aa-bb-cc-dd-ee-ff     dynamic
 */
export function parseArpOutput(raw: string): { ip: string; mac: string }[] {
  const entries: { ip: string; mac: string }[] = [];

  for (const line of raw.split('\n')) {
    const unixMatch = line.match(/\(([\d.]+)\)\s+at\s+([0-9a-fA-F:]{11,17})/);
    if (unixMatch) {
      entries.push({ ip: unixMatch[1], mac: normalizeMac(unixMatch[2]) });
      continue;
    }

    const windowsMatch = line.match(/^\s*([\d.]+)\s+([0-9a-fA-F-]{11,17})\s+\w+/);
    if (windowsMatch) {
      entries.push({ ip: windowsMatch[1], mac: normalizeMac(windowsMatch[2]) });
    }
  }

  return entries;
}

function normalizeMac(mac: string): string {
  return mac.replace(/-/g, ':').toLowerCase();
}
