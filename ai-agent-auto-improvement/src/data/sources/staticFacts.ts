import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { GlobalDataSource } from '../globalData.js';
import type { GlobalDataFact } from '../../types.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_PATH = path.resolve(HERE, '../../../fixtures/facts.sample.json');

/**
 * Stand-in for any "global data" feed that isn't a live API: a government
 * open-data export, an RSS digest, a nightly scrape, a spreadsheet a human
 * curates. Swap `filePath` for a real ingestion pipeline in production —
 * the analyzer doesn't care where facts come from, only their shape.
 */
export class StaticFactsSource implements GlobalDataSource {
  name = 'static-facts-file';
  private readonly filePath: string;

  constructor(filePath: string = DEFAULT_PATH) {
    const resolvedPath = path.resolve(filePath);
    const defaultResolved = path.resolve(DEFAULT_PATH);
    if (!resolvedPath.startsWith(path.dirname(defaultResolved))) {
      throw new Error('Invalid facts source path');
    }
    this.filePath = resolvedPath;
  }

  async fetch(): Promise<GlobalDataFact[]> {
    const raw = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(raw) as GlobalDataFact[];
  }
}
