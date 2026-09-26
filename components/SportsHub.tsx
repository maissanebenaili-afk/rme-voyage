'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { Share } from '@capacitor/share';
import { ExternalLink, Radio, Trophy, BarChart3, ShieldCheck } from 'lucide-react';
import { FALLBACK_ANALYSIS_SOURCES, getSportsPartners } from '@/lib/sportsPartners';

const MATCH = {
  home: 'Maroc',
  away: 'Gabon',
  date: '25 septembre 2026',
  kickoff: '20:00',
  venue: 'Rabat · Stade Prince Moulay Abdellah',
  competition: 'Qualifications CAN 2027',
};

const CHANNELS = [
  { name: 'Arryadia TNT', country: '🇲🇦 Maroc', url: 'https://www.snrt.ma/fr/arryadia', note: 'Diffusion publique au Maroc' },
  { name: 'beIN SPORTS', country: '🇫🇷 France / MENA', url: 'https://www.beinsports.com/', note: 'Disponibilité selon abonnement et territoire' },
  { name: 'SNRT', country: '🇲🇦 Maroc', url: 'https://www.snrt.ma/', note: 'Portail officiel du diffuseur' },
];

export default function SportsHub() {
  const [today, setToday] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);

  const openExternal = async (url: string, event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isNativeApp) return;
    event.preventDefault();
    await Browser.open({ url });
  };

  const shareMatch = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://rme-route.vercel.app';
    await Share.share({
      title: 'RME Sport — Maroc–Gabon',
      text: 'Retrouve les diffuseurs officiels et les informations du match sur RME Voyage.',
      url,
      dialogTitle: 'Partager RME Sport',
    });
  };

  useEffect(() => {
    setIsNativeApp(Capacitor.isNativePlatform());
    const d = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    setToday(d === '25/09/2026');
  }, []);

  return (
    <section className="overflow-hidden rounded-3xl border border-[#0f1f3d]/10 bg-[#0f1f3d] shadow-xl">
      <div className="border-b border-white/10 bg-gradient-to-r from-[#0f1f3d] to-[#17345f] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.18em] text-[#fde68a]">RME Sport</p>
            <h2 className="mt-1 text-2xl font-black text-white sm:text-3xl">Le match, les chaînes, les analyses.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">Un point d'entrée unique vers les diffuseurs officiels, les analyses disponibles et les opérateurs partenaires.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2"><button type="button" onClick={shareMatch} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-white/80 hover:border-[#f59e0b]/40 hover:text-white">Partager</button><div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-200"><Radio size={12} className="animate-pulse" /> Direct officiel</div></div>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.25fr_.75fr]">
        <article className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-[#f59e0b]/15 px-2.5 py-1 text-[10px] font-black uppercase text-[#fde68a]">{MATCH.competition}</span>
            {today && <span className="rounded-full bg-red-500/15 px-2.5 py-1 text-[10px] font-black uppercase text-red-200">Ce soir</span>}
          </div>
          <div className="mt-6 flex items-center justify-between gap-3 text-center">
            <div className="flex-1"><div className="text-3xl">🇲🇦</div><p className="mt-2 text-lg font-black text-white">{MATCH.home}</p></div>
            <div className="shrink-0"><p className="text-xs font-bold text-white/40">COUP D'ENVOI</p><p className="mt-1 text-2xl font-black text-[#f59e0b]">{MATCH.kickoff}</p></div>
            <div className="flex-1"><div className="text-3xl">🇬🇦</div><p className="mt-2 text-lg font-black text-white">{MATCH.away}</p></div>
          </div>
          <p className="mt-4 text-center text-xs text-white/50">{MATCH.date} · {MATCH.venue}</p>
          <div className="mt-5 grid gap-2 sm:grid-cols-3">
            {CHANNELS.map((channel) => (
              <a key={channel.name} href={channel.url} target="_blank" rel="noopener noreferrer" onClick={(event) => void openExternal(channel.url, event)} className="rounded-xl border border-white/10 bg-black/10 p-3 transition hover:border-[#f59e0b]/40">
                <div className="flex items-center justify-between gap-2"><span className="text-xs font-black text-white">{channel.name}</span><ExternalLink size={12} className="text-[#f59e0b]" /></div>
                <p className="mt-1 text-[10px] text-white/40">{channel.country}</p><p className="mt-1 text-[10px] leading-4 text-white/50">{channel.note}</p>
              </a>
            ))}
          </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2"><BarChart3 size={16} className="text-[#f59e0b]" /><h3 className="text-sm font-black text-white">Analyses alternatives</h3></div>
            <p className="mt-2 text-xs leading-5 text-white/50">Si Faical ne publie rien, ces sources permettent de continuer la lecture du match.</p>
            <div className="mt-3 space-y-2">{FALLBACK_ANALYSIS_SOURCES.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer" onClick={(event) => void openExternal(source.url, event)} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 p-3 text-xs font-bold text-white hover:border-[#f59e0b]/40">{source.name}<ExternalLink size={12} className="text-[#f59e0b]" /></a>)}</div>
          </div>

          {!isNativeApp && <div className="rounded-2xl border border-[#f59e0b]/20 bg-[#f59e0b]/5 p-5">
            <div className="flex items-center gap-2"><Trophy size={16} className="text-[#f59e0b]" /><h3 className="text-sm font-black text-white">Opérateurs sportifs</h3></div>
            <p className="mt-2 text-xs leading-5 text-white/50">Les liens affiliés ne sont activés que lorsqu'une URL partenaire réelle est configurée.</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">{getSportsPartners().map((partner) => <a key={partner.id} href={partner.url} target="_blank" rel={partner.affiliateUrl ? 'sponsored noopener noreferrer' : 'noopener noreferrer'} onClick={(event) => void openExternal(partner.url, event)} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/10 p-3 text-xs font-bold text-white hover:border-[#f59e0b]/40">{partner.name}<span className="text-[9px] uppercase text-[#fde68a]">{partner.status === 'active' ? 'Partenaire' : 'Site'}</span></a>)}</div>
          </div>}
        </aside>
      </div>

      <div className="flex items-start gap-2 border-t border-white/10 px-5 py-4"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-[#f59e0b]" /><p className="text-[10px] leading-4 text-white/40">RME ne reproduit pas les flux protégés. Les droits et la disponibilité varient selon le pays.{!isNativeApp && ' Les liens de paris sportifs sont réservés aux adultes et le jeu comporte des risques.'}</p></div>
    </section>
  );
}
