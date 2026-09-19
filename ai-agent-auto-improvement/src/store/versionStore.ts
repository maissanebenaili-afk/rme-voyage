import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AgentVersion, CycleLogEntry } from '../types.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA_DIR = path.resolve(HERE, '../../data');

/** Resolved lazily (not cached) so tests can redirect storage via AI_AGENT_DATA_DIR. */
function getDataDir(): string {
  return process.env.AI_AGENT_DATA_DIR || DEFAULT_DATA_DIR;
}

function versionsDir(): string {
  return path.join(getDataDir(), 'versions');
}

function headFile(): string {
  return path.join(getDataDir(), 'HEAD.json');
}

function historyFile(): string {
  return path.join(getDataDir(), 'history.json');
}

function validateId(id: string): void {
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error('Invalid version ID');
  }
}

async function ensureDirs(): Promise<void> {
  await fs.mkdir(versionsDir(), { recursive: true });
}

export async function saveVersion(version: AgentVersion): Promise<void> {
  await ensureDirs();
  await fs.writeFile(path.join(versionsDir(), `${version.id}.json`), JSON.stringify(version, null, 2));
}

export async function loadVersion(id: string): Promise<AgentVersion> {
  validateId(id);
  const raw = await fs.readFile(path.join(versionsDir(), `${id}.json`), 'utf-8');
  return JSON.parse(raw) as AgentVersion;
}

export async function setHead(id: string): Promise<void> {
  validateId(id);
  await ensureDirs();
  await fs.writeFile(headFile(), JSON.stringify({ id }, null, 2));
}

export async function getHeadId(): Promise<string | null> {
  try {
    const raw = await fs.readFile(headFile(), 'utf-8');
    return (JSON.parse(raw) as { id: string }).id;
  } catch {
    return null;
  }
}

export async function appendHistory(entry: CycleLogEntry): Promise<void> {
  await ensureDirs();
  const history = await loadHistory();
  history.push(entry);
  await fs.writeFile(historyFile(), JSON.stringify(history, null, 2));
}

export async function loadHistory(): Promise<CycleLogEntry[]> {
  try {
    const raw = await fs.readFile(historyFile(), 'utf-8');
    return JSON.parse(raw) as CycleLogEntry[];
  } catch {
    return [];
  }
}
