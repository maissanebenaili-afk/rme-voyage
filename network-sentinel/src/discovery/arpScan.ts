import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { parseArpOutput } from './parser.js';
import type { ScanSnapshot } from '../types.js';

const execAsync = promisify(exec);

/**
 * Reads the OS's own ARP cache — devices your machine has already talked to
 * on the local network. Passive and read-only: no packets are sent to other
 * hosts, so this is safe to run on any network you're a normal member of.
 */
export async function runArpScan(): Promise<ScanSnapshot> {
  const { stdout } = await execAsync('arp -a');
  return {
    timestamp: new Date().toISOString(),
    entries: parseArpOutput(stdout),
  };
}
