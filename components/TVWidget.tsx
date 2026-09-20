'use client';

import { useState } from 'react';
import { Tv, Radio, ExternalLink, Signal } from 'lucide-react';

type Channel = {
  name: string;
  flag: string;
  desc: string;
  url: string;
  sport?: boolean;
  live?: boolean;
};

const CHANNELS: Record<string, Channel[]> = {
  maroc: [
    { name: 'Arryadia',       flag: '🇲🇦', desc: 'SNRT Sport — Botola Pro live',   url: 'https://www.snrt.ma/fr/live/arryadia',          sport: true,  live: true },
    { name: '2M Maroc',       flag: '🇲🇦', desc: 'Info, divertissement, sport',    url: 'https://www.2m.ma/fr/direct/',                  live: true },
    { name: 'Al Aoula',       flag: '🇲🇦', desc: 'SNRT 1 — chaîne nationale',      url: 'https://www.snrt.ma/fr/live/alaoulaHD',         live: true },
    { name: 'Medi1 TV',       flag: '🇲🇦', desc: 'News Maghreb & Afrique',         url: 'https://medi1tv.com/fr/live',                   live: true },
    { name: 'Al Maghribia',   flag: '🇲🇦', desc: 'SNRT diaspora MRE',             url: 'https://www.snrt.ma/fr/live/almaghribia',       live: true },
    { name: 'Chada TV',       flag: '🇲🇦', desc: 'Musique & culture marocaine',    url: 'https://www.youtube.com/@ChadaTVOfficiel/streams', live: true },
  ],
  sport: [
    { name: 'Arryadia',       flag: '⚽', desc: 'Botola Pro & sport marocain',    url: 'https://www.snrt.ma/fr/live/arryadia',          sport: true,  live: true },
    { name: 'beIN Sports',    flag: '⚽', desc: 'Champions League, Ligue 1…',     url: 'https://www.beinsports.com/fr-ma/',             sport: true,  live: false },
    { name: 'SSC Sport',      flag: '⚽', desc: 'Foot arabe, Saudi Pro League',   url: 'https://www.ssc.sa/ar/tv',                     sport: true,  live: true },
    { name: 'Al Kass Sport',  flag: '⚽', desc: 'Sport & football Qatar',         url: 'https://www.alkass.net/live',                  sport: true,  live: true },
    { name: 'Abu Dhabi Sport',flag: '⚽', desc: 'Foot & sports premium',          url: 'https://www.adtv.ae/live',                     sport: true,  live: false },
    { name: 'Eurosport',      flag: '⚽', desc: 'Tennis, cyclisme, JO',           url: 'https://www.eurosport.fr/',                    sport: true,  live: false },
  ],
  arabe: [
    { name: 'Al Jazeera',     flag: '🌍', desc: 'Info monde en arabe',            url: 'https://www.aljazeera.net/ajlive',              live: true },
    { name: 'Sky News Arabia',flag: '🌍', desc: 'Breaking news Moyen-Orient',     url: 'https://www.skynewsarabia.com/live-tv',         live: true },
    { name: 'MBC 1',          flag: '🌍', desc: 'Divertissement arabe n°1',       url: 'https://www.mbc.net/ar/programmes/live/mbc1',  live: false },
    { name: 'Rotana Khalijia',flag: '🌍', desc: 'Musique & variétés arabes',      url: 'https://www.rotana.net/rotanakhalijiain',      live: false },
    { name: 'DW عربي',        flag: '🌍', desc: 'Deutsche Welle en arabe',        url: 'https://www.dw.com/ar/live-tv',                live: true },
    { name: 'RT Arabic',      flag: '🌍', desc: 'Russia Today arabe',             url: 'https://arabic.rt.com/on_air/',                live: true },
  ],
  inter: [
    { name: 'France 24',      flag: '🌐', desc: 'Info internationale en français',url: 'https://www.france24.com/fr/direct/',           live: true },
    { name: 'Arte',           flag: '🌐', desc: 'Culture & documentaires FR/DE',  url: 'https://www.arte.tv/fr/direct/',               live: true },
    { name: 'TV5 Monde',      flag: '🌐', desc: 'Francophonie mondiale',          url: 'https://www.tv5monde.com/tv/direct',           live: true },
    { name: 'Al Jazeera EN',  flag: '🌐', desc: 'Al Jazeera en anglais',          url: 'https://www.aljazeera.com/live/',              live: true },
    { name: 'euronews FR',    flag: '🌐', desc: 'Europe & monde en direct',       url: 'https://fr.euronews.com/direct-live',          live: true },
    { name: 'BBC Arabic',     flag: '🌐', desc: 'BBC en arabe',                   url: 'https://www.bbc.com/arabic/media/av/tv',       live: true },
  ],
};

const TABS = [
  { key: 'maroc', label: '🇲🇦 Maroc' },
  { key: 'sport', label: '⚽ Sport' },
  { key: 'arabe', label: '🌍 Arabe' },
  { key: 'inter', label: '🌐 International' },
] as const;

type TabKey = typeof TABS[number]['key'];

function ChannelCard({ ch }: { ch: Channel }) {
  return (
    <a
      href={ch.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-2xl border border-[#e2e8f0] bg-white p-3.5 transition hover:border-[#f59e0b]/50 hover:shadow-md hover:shadow-[#f59e0b]/5"
    >
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f8fafc] text-xl border border-[#e2e8f0] group-hover:bg-[#fef3c7]">
        {ch.flag}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-sm text-[#0f1f3d] truncate">{ch.name}</span>
          {ch.live && (
            <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-600">
              <Signal size={8} className="animate-pulse" /> LIVE
            </span>
          )}
          {ch.sport && (
            <span className="shrink-0 rounded-full bg-[#fef3c7] border border-[#f59e0b]/30 px-1.5 py-0.5 text-[9px] font-black text-[#b45309]">
              FOOT
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-[#64748b] truncate">{ch.desc}</p>
      </div>
      <ExternalLink size={13} className="shrink-0 text-[#94a3b8] group-hover:text-[#f59e0b]" />
    </a>
  );
}

export default function TVWidget() {
  const [tab, setTab] = useState<TabKey>('sport');

  return (
    <div className="rounded-3xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#e2e8f0] bg-[#0f1f3d] px-5 py-4">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f59e0b]">
          <Tv size={18} className="text-[#0f1f3d]" />
        </div>
        <div>
          <h2 className="font-black text-white text-base tracking-tight">TV Gratuite</h2>
          <p className="text-xs text-[#fde68a]/80 font-semibold flex items-center gap-1">
            <Radio size={10} className="animate-pulse" /> Chaînes en direct — officielles &amp; gratuites
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-[#e2e8f0] bg-[#f8fafc]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 whitespace-nowrap px-4 py-3 text-xs font-bold transition ${
              tab === t.key
                ? 'border-b-2 border-[#f59e0b] text-[#b45309] bg-white'
                : 'text-[#64748b] hover:text-[#0f1f3d]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Channel grid */}
      <div className="p-4 grid gap-2.5 sm:grid-cols-2">
        {CHANNELS[tab].map((ch) => (
          <ChannelCard key={ch.name + ch.url} ch={ch} />
        ))}
      </div>

      <p className="px-5 pb-4 text-center text-[10px] text-[#94a3b8]">
        Liens vers les sites officiels — aucun stream hébergé sur RME Voyage
      </p>
    </div>
  );
}
