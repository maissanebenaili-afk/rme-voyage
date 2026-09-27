/**
 * Provenance shared by every RME domain (sports, route, weather, education…),
 * shown to users by the Trust Layer.
 * OFFICIAL: published by the organiser or an authority. MEASURED: read live
 * from a data source. COMMUNITY: reported by users. INFERRED: deduced by RME
 * or an AI. UNKNOWN: origin not established.
 */
export type TruthLevel = 'OFFICIAL' | 'MEASURED' | 'COMMUNITY' | 'INFERRED' | 'UNKNOWN';

export function isPrimaryTruth(level: TruthLevel): boolean {
  return level === 'OFFICIAL' || level === 'MEASURED';
}

/** Only http(s) links may be shown as a source. */
export function isHttpUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}
