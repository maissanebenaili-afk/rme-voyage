import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA_DIR = path.resolve(HERE, '../../data');

/** Resolved lazily (not cached) so tests can redirect storage via SENTINEL_DATA_DIR. */
export function getDataDir(): string {
  return process.env.SENTINEL_DATA_DIR || DEFAULT_DATA_DIR;
}

export function devicesFile(): string {
  return path.join(getDataDir(), 'devices.json');
}

export function alertsFile(): string {
  return path.join(getDataDir(), 'alerts.json');
}

export function feedbackFile(): string {
  return path.join(getDataDir(), 'feedback.json');
}
