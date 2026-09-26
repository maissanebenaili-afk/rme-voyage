// Les pronostics Hadak sur les mêmes équipes, dans la même langue, sont
// réutilisés pendant une heure : sans ce cache, chaque « Wydad ou Raja ? »
// déclenchait un nouvel appel payant à Anthropic, alors que les données de
// forme ne changent pas d'une minute à l'autre.
const TTL_MS = 60 * 60 * 1000;
const MAX_ENTRIES = 200;
const cache = new Map<string, { text: string; expires: number }>();

export function footballCacheKey(lang: string, teams: string[]): string {
  return `${lang}:${[...teams].sort().join('|')}`;
}

export function getCachedFootballAnswer(key: string, now = Date.now()): string | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (hit.expires <= now) {
    cache.delete(key);
    return null;
  }
  return hit.text;
}

export function cacheFootballAnswer(key: string, text: string, now = Date.now()) {
  if (cache.size >= MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { text, expires: now + TTL_MS });
}

export function resetFootballCacheForTests() {
  cache.clear();
}
