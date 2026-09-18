import type { GlobalDataFact } from '../types.js';

/**
 * A pluggable feed of "global data" the agent uses to check whether its own
 * knowledge is still accurate. Implement this for anything: a public API,
 * an RSS/news feed, a scraper, or a table of manually curated facts.
 */
export interface GlobalDataSource {
  name: string;
  fetch(): Promise<GlobalDataFact[]>;
}
