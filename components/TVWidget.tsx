'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { Tv, Radio, ExternalLink, Signal, MapPin } from 'lucide-react';

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
    { name: 'Arryadia / SNRT', flag: '🇲🇦', desc: 'Sport marocain — page officielle SNRT', url: 'https://www.snrt.ma/fr/arryadia', sport: true, live: true },
    { name: 'SNRT', flag: '🇲🇦', desc: 'Portail officiel des chaînes marocaines', url: 'https://www.snrt.ma/', live: true },
    { name: '2M', flag: '🇲🇦', desc: 'Chaîne marocaine — site officiel', url: 'https://www.2m.ma/', live: true },
    { name: 'Medi1TV', flag: '🇲🇦', desc: 'Information Maroc, Maghreb & Afrique', url: 'https://www.medi1tv.com/', live: true },
    { name: 'SNRTnews', flag: '🇲🇦', desc: 'Actualités et directs SNRT', url: 'https://snrtnews.com/live', live: true },
    { name: 'Chada TV', flag: '🇲🇦', desc: 'Musique & culture marocaine', url: 'https://www.youtube.com/@ChadaTVOfficiel/streams', live: true },
  ],
  sport: [
    { name: '🇲🇦 Maroc–Gabon · Arryadia TNT', flag: '⚽', desc: 'Diffusion officielle au Maroc — TNT', url: 'https://www.snrt.ma/fr/node/4070', sport: true, live: true },
    { name: 'beIN SPORTS · Maroc–Gabon', flag: '⚽', desc: 'Page officielle du match — diffusion selon territoire', url: 'https://www.beinsports.com/en-mena/football/africa-cup-of-nations-qualification/morocco-vs-gabon-2026-09-25', sport: true, live: true },
    { name: 'beIN SPORTS France', flag: '⚽', desc: 'Scores, directs et programme officiel', url: 'https://www.beinsports.com/fr-fr/scores', sport: true, live: true },
    { name: 'Arryadia / SNRT', flag: '⚽', desc: 'Programme sport officiel SNRT', url: 'https://www.snrt.ma/fr/arryadia', sport: true, live: true },
    { name: 'SSC Sport', flag: '⚽', desc: 'Sport arabe — site officiel', url: 'https://www.ssc.sa/ar/tv', sport: true },
    { name: 'Al Kass Sport', flag: '⚽', desc: 'Sport & football Qatar — site officiel', url: 'https://www.alkass.net/live', sport: true },
  ],
  arabe: [
    { name: 'Al Jazeera', flag: '🌍', desc: 'Info monde en arabe', url: 'https://www.aljazeera.net/', live: true },
    { name: 'Sky News Arabia', flag: '🌍', desc: 'Information en arabe', url: 'https://www.skynewsarabia.com/', live: true },
    { name: 'MBC', flag: '🌍', desc: 'Télévision et divertissement arabe', url: 'https://www.mbc.net/', live: true },
    { name: 'DW عربية', flag: '🌍', desc: 'Deutsche Welle en arabe', url: 'https://www.dw.com/ar', live: true },
  ],
  inter: [
    { name: 'France 24', flag: '🌐', desc: 'Info internationale en français', url: 'https://www.france24.com/fr/direct/', live: true },
    { name: 'Arte', flag: '🌐', desc: 'Culture & documentaires FR/DE', url: 'https://www.arte.tv/fr/direct/', live: true },
    { name: 'TV5 Monde', flag: '🌐', desc: 'Francophonie mondiale', url: 'https://www.tv5monde.com/tv/direct', live: true },
    { name: 'Al Jazeera English', flag: '🌐', desc: 'Information internationale', url: 'https://www.aljazeera.com/live/', live: true },
    { name: 'Euronews', flag: '🌐', desc: 'Europe & monde en direct', url: 'https://fr.euronews.com/direct-live', live: true },
  ],
};

const TABS = [
  { key: 'maroc', label: '🇲🇦 Maroc' },
  { key: 'sport', label: '⚽ Sport' },
  { key: 'arabe', label: '🌍 Arabe' },
  { key: 'inter', label: '🌐 International' },
] as const;

type TabKey = typeof TABS[number]['key'];

function isTonightMatchDay() {
  return new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()) === '25/09/2026';
}

function ChannelCard({ ch }: { ch: Channel }) {
  return (
    <a
      href={ch.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => void openExternal(ch.url, event)}
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
  const [isNativeApp, setIsNativeApp] = useState(false);

  const openExternal = async (url: string, event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isNativeApp) return;
    event.preventDefault();
    await Browser.open({ url });
  };

  useEffect(() => {
    setIsNativeApp(Capacitor.isNativePlatform());
  }, []);
  const showTonight = isTonightMatchDay();

  return (
    <div className="rounded-3xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[#e2e8f0] bg-[#0f1f3d] px-5 py-4">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f59e0b]">
          <Tv size={18} className="text-[#0f1f3d]" />
        </div>
        <div>
          <h2 className="font-black text-white text-base tracking-tight">RME TV</h2>
          <p className="text-xs text-[#fde68a]/80 font-semibold flex items-center gap-1">
            <Radio size={10} className="animate-pulse" /> Diffusions officielles — disponibilité selon pays
          </p>
        </div>
      </div>

      {showTonight && (
        <div className="border-b border-emerald-100 bg-emerald-50 px-5 py-4">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-emerald-700" />
            <div>
              <p className="text-sm font-black text-emerald-900">🇲🇦 Maroc–Gabon · ce soir</p>
              <p className="mt-1 text-xs leading-5 text-emerald-800">
                La SNRT annonce le match sur <strong>Arryadia TNT au Maroc</strong>. En France, les sources de diffusion indiquent beIN SPORTS. L'accès dépend du territoire et des droits.
              </p>
            </div>
          </div>
        </div>
      )}

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
        Les droits et la disponibilité peuvent changer selon le pays. RME ouvre uniquement les pages officielles des diffuseurs.
      </p>
    </div>
  );
}
