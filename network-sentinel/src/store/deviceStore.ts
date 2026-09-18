import fs from 'node:fs/promises';
import type { Device } from '../types.js';
import { devicesFile, getDataDir } from './paths.js';

export async function loadDevices(): Promise<Device[]> {
  try {
    const raw = await fs.readFile(devicesFile(), 'utf-8');
    return JSON.parse(raw) as Device[];
  } catch {
    return [];
  }
}

export async function saveDevices(devices: Device[]): Promise<void> {
  await fs.mkdir(getDataDir(), { recursive: true });
  await fs.writeFile(devicesFile(), JSON.stringify(devices, null, 2));
}
