/**
 * Actualités fraîches de l'accueil : les titres publiés par des médias
 * marocains dans leur flux RSS public. RME n'affiche que le titre, la source,
 * l'heure et la vignette fournies par le flux, et renvoie vers l'article
 * d'origine : aucun texte d'article n'est recopié.
 */

export type NewsSource = {
  id: string;
  name: string;
  feedUrl: string;
  /** Les liens d'articles doivent rester sur ce domaine (ou un sous-domaine). */
  host: string;
};

export const NEWS_SOURCES: readonly NewsSource[] = [
  // Yabiladi : le média des Marocains de l'étranger.
  { id: 'yabiladi', name: 'Yabiladi', feedUrl: 'https://www.yabiladi.com/rss/news.xml', host: 'yabiladi.com' },
  { id: 'hespress', name: 'Hespress', feedUrl: 'https://fr.hespress.com/feed', host: 'hespress.com' },
  { id: 'telquel', name: 'TelQuel', feedUrl: 'https://telquel.ma/feed', host: 'telquel.ma' },
];

/** ASCII seulement : un caractère accentué dans un en-tête fait échouer fetch(). */
export const NEWS_USER_AGENT = 'RME-Voyage/1.0 (+https://rme-voyage.netlify.app; headlines link to the source article)';

export type NewsItem = {
  title: string;
  url: string;
  source: string;
  /** Date ISO de publication. */
  publishedAt: string;
  image?: string;
};

/** Au-delà, un titre n'est plus une « nouvelle fraîche ». */
export const MAX_NEWS_AGE_HOURS = 72;
const MAX_TITLE_CHARS = 200;

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function decodeText(raw: string): string {
  // Entités décodées d'abord, balises retirées ensuite : dans l'autre ordre,
  // « &lt;script&gt; » redevenait « <script> » après le nettoyage.
  const decoded = raw
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n: string) => safeCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => safeCodePoint(parseInt(h, 16)))
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m);
  // Un titre n'a jamais besoin de chevrons : ceux qui restent après les balises partent aussi.
  return decoded.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim();
}

function safeCodePoint(code: number): string {
  return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : '';
}

function tag(item: string, name: string): string | null {
  const match = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return match ? match[1] : null;
}

/** Lien https sur le domaine attendu, sinon rien : un flux piraté ne doit pas envoyer ailleurs. */
export function safeUrl(raw: string | null | undefined, host?: string): string | null {
  if (!raw) return null;
  try {
    const url = new URL(decodeText(raw));
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    if (host && url.hostname !== host && !url.hostname.endsWith(`.${host}`)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function imageOf(item: string): string | null {
  const attr = item.match(/<(?:enclosure|media:content|media:thumbnail)\b[^>]*\burl="([^"]+)"/i);
  if (attr) return safeUrl(attr[1]);
  const inline = item.match(/<img\b[^>]*\bsrc="([^"]+)"/i);
  return inline ? safeUrl(inline[1]) : null;
}

/** Les titres d'un flux RSS, sans ce qui est mal formé ou hors du domaine de la source. */
export function parseRss(xml: string, source: NewsSource): NewsItem[] {
  const items: NewsItem[] = [];
  for (const [, body] of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)) {
    const title = decodeText(tag(body, 'title') ?? '').slice(0, MAX_TITLE_CHARS);
    const url = safeUrl(tag(body, 'link'), source.host);
    const date = new Date(decodeText(tag(body, 'pubDate') ?? tag(body, 'dc:date') ?? ''));
    if (!title || !url || Number.isNaN(date.getTime())) continue;
    const image = imageOf(body);
    items.push({ title, url, source: source.name, publishedAt: date.toISOString(), ...(image ? { image } : {}) });
  }
  return items;
}

/**
 * Mélange les sources : les plus récents d'abord, sans doublon, sans titre
 * trop ancien ni daté dans le futur, et au plus `perSource` titres par média
 * pour qu'un flux très bavard (TelQuel : 100 titres) n'écrase pas les autres.
 */
export function mergeNews(lists: NewsItem[][], now: Date, limit = 12, perSource = 5): NewsItem[] {
  const oldest = now.getTime() - MAX_NEWS_AGE_HOURS * 3_600_000;
  const latest = now.getTime() + 3_600_000;
  const seen = new Set<string>();
  const perSourceCount = new Map<string, number>();
  return lists
    .flat()
    .filter((item) => {
      const t = Date.parse(item.publishedAt);
      return t >= oldest && t <= latest;
    })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .filter((item) => {
      const key = item.title.toLowerCase();
      if (seen.has(item.url) || seen.has(key)) return false;
      const count = perSourceCount.get(item.source) ?? 0;
      if (count >= perSource) return false;
      seen.add(item.url);
      seen.add(key);
      perSourceCount.set(item.source, count + 1);
      return true;
    })
    .slice(0, limit);
}
