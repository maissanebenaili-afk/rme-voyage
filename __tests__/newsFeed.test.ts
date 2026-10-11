/** @jest-environment node */
import { decodeText, mergeNews, parseRss, safeUrl, NEWS_SOURCES, NEWS_USER_AGENT, type NewsItem } from '@/lib/newsFeed';
import { GET } from '@/app/api/news/route';

const yabiladi = NEWS_SOURCES.find((s) => s.id === 'yabiladi')!;
const hespress = NEWS_SOURCES.find((s) => s.id === 'hespress')!;

// Extraits réels (11/10/2026), raccourcis.
const YABILADI_XML = `<?xml version="1.0"?><rss><channel>
<item><title><![CDATA[Tanger Med : plus de trois tonnes de cannabis saisies dans un camion]]></title>
<link>https://www.yabiladi.com/articles/details/204690/tanger-plus-trois-tonnes-cannabis.html</link>
<pubDate>2026-10-11T13:20:00+02:00</pubDate>
<enclosure url="https://static.yabiladi.com/files/articles/a.jpg" type="image/jpeg"/></item>
<item><title><![CDATA[Lien piégé]]></title><link>javascript:alert(1)</link><pubDate>2026-10-11T13:00:00+02:00</pubDate></item>
<item><title><![CDATA[Lien vers un autre site]]></title><link>https://evil.example/yabiladi.com</link><pubDate>2026-10-11T13:00:00+02:00</pubDate></item>
<item><title></title><link>https://www.yabiladi.com/x</link><pubDate>2026-10-11T13:00:00+02:00</pubDate></item>
<item><title>Sans date</title><link>https://www.yabiladi.com/y</link></item>
</channel></rss>`;

const HESPRESS_XML = `<rss><channel><item>
<title>Le 1er Joumada I de l&#039;an 1448 de l&#039;Hégire correspondra au mardi 13 octobre</title>
<link>https://fr.hespress.com/491827-le-1er-joumada.html</link>
<pubDate>Sun, 11 Oct 2026 19:57:55 +0000</pubDate>
<media:content url="https://f2.hespress.com/wp-content/uploads/2020/12/a.jpg" medium="image"/>
</item></channel></rss>`;

describe('lecture des flux RSS', () => {
  it('garde titre, lien, date et vignette ; rejette liens piégés, autres sites, titres vides et sans date', () => {
    const items = parseRss(YABILADI_XML, yabiladi);
    expect(items).toEqual([
      {
        title: 'Tanger Med : plus de trois tonnes de cannabis saisies dans un camion',
        url: 'https://www.yabiladi.com/articles/details/204690/tanger-plus-trois-tonnes-cannabis.html',
        source: 'Yabiladi',
        publishedAt: '2026-10-11T11:20:00.000Z',
        image: 'https://static.yabiladi.com/files/articles/a.jpg',
      },
    ]);
  });

  it('décode les entités (apostrophes de Hespress) et lit media:content', () => {
    const [item] = parseRss(HESPRESS_XML, hespress);
    expect(item.title).toBe("Le 1er Joumada I de l'an 1448 de l'Hégire correspondra au mardi 13 octobre");
    expect(item.image).toBe('https://f2.hespress.com/wp-content/uploads/2020/12/a.jpg');
    expect(item.source).toBe('Hespress');
  });

  it('retire le HTML glissé dans un titre', () => {
    expect(decodeText('<![CDATA[<b>Titre</b> <script>x</script>]]>')).toBe('Titre x');
  });

  // Alerte CodeQL du 11/10/2026 : décoder après avoir retiré les balises
  // laissait passer « &lt;script&gt; » sous forme de vraie balise.
  it('ne laisse aucune balise ressortir des entités encodées', () => {
    expect(decodeText('&lt;script&gt;alert(1)&lt;/script&gt;Titre')).toBe('alert(1)Titre');
    expect(decodeText('&#60;img src=x onerror=1&#62;Titre')).toBe('Titre');
    expect(decodeText('<<script>script>x')).not.toMatch(/[<>]/);
  });

  it("n'accepte que des liens https du bon domaine", () => {
    expect(safeUrl('http://fr.hespress.com/a', 'hespress.com')).toBeNull();
    expect(safeUrl('https://hespress.com.evil.io/a', 'hespress.com')).toBeNull();
    expect(safeUrl('https://user:pw@fr.hespress.com/a', 'hespress.com')).toBeNull();
    expect(safeUrl('https://fr.hespress.com/a', 'hespress.com')).toBe('https://fr.hespress.com/a');
  });
});

describe('mélange des sources', () => {
  const now = new Date('2026-10-11T20:00:00Z');
  const at = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 3_600_000).toISOString();
  const item = (title: string, source: string, hoursAgo: number): NewsItem => ({
    title, source, url: `https://x.ma/${encodeURIComponent(title)}`, publishedAt: at(hoursAgo),
  });

  it('du plus récent au plus ancien, sans doublon ni titre trop vieux ou daté du futur', () => {
    const merged = mergeNews([
      [item('A', 'Yabiladi', 5), item('Vieux', 'Yabiladi', 100), item('Futur', 'Yabiladi', -5)],
      [item('B', 'Hespress', 1), item('a', 'Hespress', 2)],
    ], now);
    // « a » et « A » sont le même titre : seul le plus récent reste.
    expect(merged.map((i) => i.title)).toEqual(['B', 'a']);
  });

  it('au plus 5 titres par média', () => {
    const many = Array.from({ length: 20 }, (_, i) => item(`T${i}`, 'TelQuel', i * 0.1));
    const merged = mergeNews([many, [item('Y', 'Yabiladi', 10)]], now);
    expect(merged.filter((i) => i.source === 'TelQuel')).toHaveLength(5);
    expect(merged.map((i) => i.title)).toContain('Y');
  });
});

describe('GET /api/news', () => {
  // 11/10/2026 : un « ’ » dans le user-agent faisait échouer chaque fetch() en vrai
  // (en-têtes HTTP en Latin-1 seulement), et la liste restait vide en ligne.
  it('envoie des en-têtes que fetch() accepte vraiment', () => {
    expect(() => new Headers({ 'user-agent': NEWS_USER_AGENT })).not.toThrow();
    expect(NEWS_USER_AGENT).toMatch(/^[\x20-\x7e]+$/);
  });

  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('affiche les titres des sources qui répondent quand une autre est en panne', async () => {
    jest.useFakeTimers({ now: new Date('2026-10-11T21:00:00Z'), doNotFake: ['setTimeout', 'clearTimeout', 'setImmediate', 'queueMicrotask', 'nextTick'] });
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes('yabiladi')) return new Response(YABILADI_XML, { status: 200 });
      if (url.includes('hespress')) return new Response(HESPRESS_XML, { status: 200 });
      return new Response('down', { status: 503 });
    }) as unknown as typeof fetch;

    const res = await GET();
    const body = await res.json();
    jest.useRealTimers();
    expect(res.status).toBe(200);
    expect(body.items.map((i: NewsItem) => i.source)).toEqual(['Hespress', 'Yabiladi']);
    expect(console.warn).toHaveBeenCalledWith('[news] source indisponible', 'telquel', expect.any(String));
  });
});
