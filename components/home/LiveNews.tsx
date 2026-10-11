'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Newspaper } from 'lucide-react';
import { useHomeText } from '@/lib/LanguageContext';
import type { NewsItem } from '@/lib/newsFeed';

type State = { status: 'loading' } | { status: 'ready'; items: NewsItem[] } | { status: 'error' };

const SOURCE_COLORS: Record<string, string> = {
  Yabiladi: 'bg-[#c2410c]',
  Hespress: 'bg-[#0369a1]',
  TelQuel: 'bg-[#be123c]',
};

/**
 * « À la une » : les derniers titres de médias marocains (lib/newsFeed.ts),
 * en cartes qui défilent sur le côté. Un clic ouvre l'article chez le média.
 */
export default function LiveNews() {
  const h = useHomeText();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/news', { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { items?: NewsItem[] }) => {
        setNow(Date.now());
        setState({ status: 'ready', items: Array.isArray(data.items) ? data.items : [] });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.warn('[news] chargement impossible', error);
        setState({ status: 'error' });
      });
    return () => controller.abort();
  }, []);

  if (state.status === 'ready' && state.items.length === 0) return null;

  return (
    <section aria-labelledby="news-title" className="mx-auto mt-10 max-w-2xl">
      <div className="flex items-end justify-between gap-3 px-5">
        <div>
          <h2 id="news-title" className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-[#0f1f3d]">
            <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ef4444] opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
            </span>
            {h.newsTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-600">{h.newsSubtitle}</p>
        </div>
      </div>

      {state.status === 'error' && <p className="mx-5 mt-4 rounded-2xl bg-white p-4 text-sm text-slate-600 ring-1 ring-black/5">{h.newsUnavailable}</p>}

      <ul
        aria-busy={state.status === 'loading'}
        className="mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {state.status === 'loading' &&
          [0, 1, 2].map((i) => (
            <li key={i} aria-hidden="true" className="h-64 w-64 shrink-0 animate-pulse rounded-3xl bg-white ring-1 ring-black/5" />
          ))}
        {state.status === 'ready' &&
          state.items.map((item) => {
            const minutes = Math.round((now - Date.parse(item.publishedAt)) / 60_000);
            return (
              <li key={item.url} className="w-64 shrink-0 snap-start">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.title} — ${h.newsOpen} ${item.source}`}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59e0b]"
                >
                  <div className="relative h-32 w-full bg-gradient-to-br from-[#13254d] to-[#1e2f5c]">
                    {item.image ? (
                      // Vignette fournie par le flux du média : pas de next/image (domaines variables).
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                    ) : (
                      <Newspaper aria-hidden="true" className="absolute inset-0 m-auto h-10 w-10 text-white/30" />
                    )}
                    <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold text-white shadow ${SOURCE_COLORS[item.source] ?? 'bg-[#0f1f3d]'}`}>
                      {item.source}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <p className="line-clamp-3 text-[15px] font-semibold leading-snug text-[#0f1f3d]">{item.title}</p>
                    <p className="mt-auto flex items-center justify-between pt-3 text-xs font-medium text-slate-500">
                      <time dateTime={item.publishedAt}>{h.newsAgo(minutes)}</time>
                      <ExternalLink size={14} aria-hidden="true" className="text-slate-400 transition group-hover:text-[#0f1f3d]" />
                    </p>
                  </div>
                </a>
              </li>
            );
          })}
      </ul>
    </section>
  );
}
