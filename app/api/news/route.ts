import { NextResponse } from 'next/server';
import { NEWS_SOURCES, NEWS_USER_AGENT, mergeNews, parseRss, type NewsItem, type NewsSource } from '@/lib/newsFeed';

// Titres rafraîchis toutes les 15 minutes au plus : les médias ne sont pas
// sollicités à chaque visite.
export const revalidate = 900;

const FEED_TIMEOUT_MS = 6_000;

async function fetchSource(source: NewsSource): Promise<NewsItem[]> {
  const res = await fetch(source.feedUrl, {
    // En-têtes en ASCII seulement : un caractère accentué fait échouer fetch() avant tout envoi.
    headers: { 'user-agent': NEWS_USER_AGENT, accept: 'application/rss+xml, application/xml, text/xml' },
    signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`${source.id} ${res.status}`);
  return parseRss(await res.text(), source);
}

export async function GET() {
  const results = await Promise.allSettled(NEWS_SOURCES.map(fetchSource));
  const lists: NewsItem[][] = [];
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') lists.push(result.value);
    // Une source en panne n'empêche pas les autres de s'afficher.
    else console.warn('[news] source indisponible', NEWS_SOURCES[i].id, String(result.reason));
  });
  const items = mergeNews(lists, new Date());
  return NextResponse.json(
    { items, updatedAt: new Date().toISOString() },
    { headers: { 'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600' } },
  );
}
