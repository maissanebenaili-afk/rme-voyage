import fs from 'node:fs/promises';
import type { Alert, Feedback } from '../types.js';
import { alertsFile, feedbackFile, getDataDir } from './paths.js';

export async function loadAlerts(): Promise<Alert[]> {
  try {
    const raw = await fs.readFile(alertsFile(), 'utf-8');
    return JSON.parse(raw) as Alert[];
  } catch {
    return [];
  }
}

export async function appendAlerts(newAlerts: Alert[]): Promise<void> {
  if (newAlerts.length === 0) return;
  await fs.mkdir(getDataDir(), { recursive: true });
  const existing = await loadAlerts();
  await fs.writeFile(alertsFile(), JSON.stringify([...existing, ...newAlerts], null, 2));
}

export async function loadFeedback(): Promise<Feedback[]> {
  try {
    const raw = await fs.readFile(feedbackFile(), 'utf-8');
    return JSON.parse(raw) as Feedback[];
  } catch {
    return [];
  }
}

export async function appendFeedback(entry: Feedback): Promise<void> {
  await fs.mkdir(getDataDir(), { recursive: true });
  const existing = await loadFeedback();
  await fs.writeFile(feedbackFile(), JSON.stringify([...existing, entry], null, 2));
}
