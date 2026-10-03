import Link from 'next/link';
import { ExternalLink, Globe2, MapPinned, Newspaper, RefreshCw, Ship, Sparkles } from 'lucide-react';

type Story = { title: string; url: string; source: string; date?: string; description?: string };
type Section = { id: string; label: string; emoji: string; stories: Story[]; sourceUrl: string };

const feeds = [
  { id: 'maroc', label: 'Maroc', emoji: '🇲🇦', query: 'Maroc actualités', sourceUrl: 'https://www.maroc.ma/fr/actualites' },
  { id: 'france', label: 'France', emoji: '🇫🇷', query: 'France actualités', sourceUrl: 'https://www.lemonde.fr/france/' },
  { id: 'maghreb', label: 'Maghreb', emoji: '🌍', query: 'Maghreb Algérie Tunisie Libye actualités', sourceUrl: 'https://maghrebemergent.news/fr/category/actualites/' },
  { id: 'moyen-orient', label: 'Moyen-Orient', emoji: '🕌', query: 'Moyen Orient actualités', sourceUrl: 'https://www.lemonde.fr/moyen-orient/' },
  { id: 'etats-unis', label: 'États-Unis', emoji: '🇺🇸', query: 'États-Unis actualités', sourceUrl: 'https://www.lemonde.fr/etats-unis/' },
  { id: 'monde', label: 'Monde', emoji: '🌐', query: 'monde actualités', sourceUrl: 'https://www.lemonde.fr/international/' },
];

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
}

function safeStoryUrl(value: string, fallback: string) {
  try {
    const url = new URL(value || fallback);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

async function getStories(query: string, sourceUrl: string): Promise<Story[]> {
  const rss = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=fr&gl=FR&ceid=FR:fr`;
  try {
    const response = await fetch(rss, { next: { revalidate: 300 }, signal: AbortSignal.timeout(6000) });
    if (!response.ok) throw new Error('RSS unavailable');
    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 8);
    return items.map((match) => {
      const item = match[1];
      const get = (tag: string) => {
        const found = item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
        return found ? stripHtml(found[1]) : '';
      };
      const title = get('title');
      const link = get('link');
      const description = get('description');
      const pubDate = get('pubDate');
      const source = get('source') || 'Actualités';
      return { title, url: safeStoryUrl(link, sourceUrl), source, date: pubDate, description };
    }).filter((story) => story.title && story.url);
  } catch {
    return [];
  }
}

export const revalidate = 300;

export default async function ActualitesPage() {
  const sections: Section[] = await Promise.all(feeds.map(async (feed) => ({
    id: feed.id,
    label: feed.label,
    emoji: feed.emoji,
    stories: await getStories(feed.query, feed.sourceUrl),
    sourceUrl: feed.sourceUrl,
  })));

  return (
    <main className="min-h-screen bg-[#f5f1e8] text-[#172033]">
      <header className="border-b border-[#d9d0bd] bg-[#10213f] text-white">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 font-black">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f59e0b] text-[#10213f]">R</span>
              <span>RME Voyage</span>
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 text-white/75"><RefreshCw size={14} /> Mise à jour toutes les 5 min</span>
              <Link href="/#planifier" className="rounded-full bg-[#f59e0b] px-4 py-2 font-extrabold text-[#10213f]">Préparer mon voyage</Link>
            </div>
          </div>
        </div>
      </header>

      <section className="border-b border-[#d9d0bd] bg-gradient-to-b from-[#10213f] to-[#1d365d] text-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="max-w-3xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider">
              <Newspaper size={14} /> RME Actu
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl">Le monde bouge.<br /><span className="text-[#fbbf24]">Reste au courant.</span></h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              Une page pensée pour les MRE qui aiment comprendre ce qui se passe : Maroc, France, Maghreb, Moyen-Orient, États-Unis et monde.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              {sections.map((section) => <a key={section.id} href={`#${section.id}`} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15">{section.emoji} {section.label}</a>)}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#d9d0bd] bg-white p-5"><MapPinned className="text-[#b7791f]" /><p className="mt-3 font-black">Pensé pour le MRE</p><p className="mt-1 text-sm text-slate-600">Ce qui peut toucher le voyage, la famille, l'économie et la vie entre les deux rives.</p></div>
          <div className="rounded-2xl border border-[#d9d0bd] bg-white p-5"><Globe2 className="text-[#b7791f]" /><p className="mt-3 font-black">Plusieurs regards</p><p className="mt-1 text-sm text-slate-600">RME agrège les titres ; l'article original reste la source à consulter.</p></div>
          <div className="rounded-2xl border border-[#d9d0bd] bg-white p-5"><Sparkles className="text-[#b7791f]" /><p className="mt-3 font-black">Pas seulement politique</p><p className="mt-1 text-sm text-slate-600">Économie, société, sport, technologie, culture, voyage et faits marquants.</p></div>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <section id={section.id} key={section.id} className="scroll-mt-6">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#a16207]">RME Actu</p><h2 className="mt-1 text-2xl font-black sm:text-3xl">{section.emoji} {section.label}</h2></div>
                <a href={section.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#10213f]">Source <ExternalLink size={13} /></a>
              </div>
              {section.stories.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {section.stories.map((story, index) => (
                    <article key={`${story.url}-${index}`} className="group rounded-2xl border border-[#d9d0bd] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                      <div className="flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        <span>{story.source}</span><span>{story.date ? new Date(story.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : 'Récent'}</span>
                      </div>
                      <h3 className="mt-3 text-lg font-extrabold leading-snug group-hover:text-[#9a6700]">{story.title}</h3>
                      {story.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{story.description}</p>}
                      <a href={story.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#10213f]">Lire l'article <ExternalLink size={14} /></a>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#cfc4ae] bg-white/70 p-6 text-sm text-slate-600">Le flux est temporairement indisponible. Consulte la source de la rubrique pour les dernières publications.</div>
              )}
            </section>
          ))}
        </div>

        <aside className="mt-12 rounded-3xl bg-[#10213f] p-6 text-white sm:p-8">
          <div className="flex items-start gap-4"><Ship className="mt-1 shrink-0 text-[#f59e0b]" /><div><h2 className="text-xl font-black">Une actualité te donne envie de rentrer ?</h2><p className="mt-2 text-sm leading-6 text-white/75">Passe directement de la lecture à l'action : trajet, ferry, avion et budget dans RME.</p><Link href="/#planifier" className="mt-4 inline-flex rounded-full bg-[#f59e0b] px-5 py-2.5 text-sm font-black text-[#10213f]">Préparer mon retour au Maroc</Link></div></div>
        </aside>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">Les titres et contenus sont fournis par les sources citées. RME n'en est pas l'éditeur et ne garantit pas l'exactitude des articles. Les liens ouvrent les publications originales.</p>
      </div>
    </main>
  );
}
