'use client';

import { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Zap, ExternalLink } from 'lucide-react';

type FormEntry = { w: number; d: number; l: number; last5: string };

type FaicalPick = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  league: string;
  prediction: string;
  homeForm: FormEntry;
  awayForm: FormEntry;
};

const AFFILIATE_URL = 'https://www.inamax.com/'; // placeholder — swap for real affiliate link

const LABELS = {
  fr: {
    title: 'Les pronos de Faical',
    sub: 'Votre expert foot Botola Pro',
    cta: '🎰 Parier malin avec Faical →',
    noData: 'Prochains matchs bientôt disponibles.',
    form: 'Forme',
    vs: 'vs',
    sponsored: 'Sponsorisé',
  },
  da: {
    title: 'Pronosticat dyali Faical',
    sub: 'Khabir dyalek f Botola Pro',
    cta: '🎰 Dir l\'bet m3a Faical →',
    noData: 'Matchat jaya bzzf.',
    form: 'Forma',
    vs: 'vs',
    sponsored: 'Sponsorisa',
  },
  ar: {
    title: 'تنبؤات فيصل',
    sub: 'خبيرك في البطولة المغربية',
    cta: '🎰 راهن بذكاء مع فيصل ←',
    noData: 'المباريات القادمة ستظهر قريباً.',
    form: 'الشكل',
    vs: 'ضد',
    sponsored: 'برعاية',
  },
  es: {
    title: 'Los pronos de Faical',
    sub: 'Tu experto Botola Pro',
    cta: '🎰 Apuesta con Faical →',
    noData: 'Próximos partidos disponibles pronto.',
    form: 'Forma',
    vs: 'vs',
    sponsored: 'Patrocinado',
  },
  en: {
    title: "Faical's Picks",
    sub: 'Your Botola Pro tipster',
    cta: '🎰 Bet smart with Faical →',
    noData: 'Upcoming fixtures coming soon.',
    form: 'Form',
    vs: 'vs',
    sponsored: 'Sponsored',
  },
};

type Lang = keyof typeof LABELS;

function detectLang(): Lang {
  if (typeof navigator === 'undefined') return 'fr';
  const l = navigator.language?.slice(0, 2).toLowerCase();
  if (l === 'ar') return 'ar';
  if (l === 'es') return 'es';
  if (l === 'en') return 'en';
  return 'fr';
}

function FormPips({ form }: { form: FormEntry }) {
  const letters = form.last5.split('');
  if (!letters.length) return null;
  return (
    <span className="flex gap-0.5">
      {letters.map((c, i) => (
        <span
          key={i}
          className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black ${
            c === 'W' ? 'bg-emerald-500 text-white' : c === 'D' ? 'bg-amber-400 text-black' : 'bg-red-500 text-white'
          }`}
        >
          {c}
        </span>
      ))}
    </span>
  );
}

function MatchCard({ pick, lang, labels }: { pick: FaicalPick; lang: Lang; labels: typeof LABELS.fr }) {
  const date = pick.date ? new Date(pick.date).toLocaleDateString(lang === 'ar' ? 'ar-MA' : 'fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : '';

  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 flex flex-col gap-3">
      {/* Teams row */}
      <div className="flex items-center justify-between gap-2 text-sm font-bold text-white">
        <div className="flex flex-col items-start gap-1 min-w-0">
          <span className="truncate max-w-[110px]">{pick.homeTeam}</span>
          <FormPips form={pick.homeForm} />
        </div>
        <span className="shrink-0 rounded-full bg-[#f59e0b] px-2 py-0.5 text-[10px] font-black text-[#0f1f3d]">
          {labels.vs}
        </span>
        <div className="flex flex-col items-end gap-1 min-w-0">
          <span className="truncate max-w-[110px] text-right">{pick.awayTeam}</span>
          <FormPips form={pick.awayForm} />
        </div>
      </div>

      {/* Date */}
      <p className="text-[11px] text-white/50 text-center">{date}{pick.time ? ` · ${pick.time}` : ''}</p>

      {/* Faical's prediction */}
      {pick.prediction ? (
        <div className="rounded-xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={12} className="text-[#f59e0b]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#fde68a]">Faical dit</span>
          </div>
          <p className="text-sm text-white leading-5">{pick.prediction}</p>
        </div>
      ) : (
        <div className="rounded-xl bg-white/5 p-3 text-center text-xs text-white/40">
          Analyse en cours…
        </div>
      )}
    </div>
  );
}

export default function FaicalWidget() {
  const [picks, setPicks] = useState<FaicalPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang] = useState<Lang>(() => (typeof window !== 'undefined' ? detectLang() : 'fr'));
  const labels = LABELS[lang];

  useEffect(() => {
    let cancelled = false;
    fetch('/api/faical')
      .then((r) => r.json())
      .then((d) => { if (!cancelled) { setPicks(d.picks ?? []); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#0a1628] border border-[#f59e0b]/20 p-6 shadow-2xl">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-16 right-8 h-48 w-48 rounded-full bg-[#f59e0b]/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl" />

      {/* Header */}
      <div className="relative flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f59e0b] shadow-lg shadow-[#f59e0b]/30">
            <Trophy size={20} className="text-[#0f1f3d]" />
          </div>
          <div>
            <h2 className="text-base font-black text-white tracking-tight">{labels.title}</h2>
            <p className="text-xs text-[#fde68a]/80 font-semibold">{labels.sub}</p>
          </div>
        </div>
        <span className="rounded-full bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-white/40">
          {labels.sponsored}
        </span>
      </div>

      {/* Picks */}
      <div className="relative space-y-3">
        {loading && (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && picks.length === 0 && (
          <p className="text-sm text-white/50 text-center py-6">{labels.noData}</p>
        )}

        {!loading && picks.map((pick) => (
          <MatchCard key={pick.id} pick={pick} lang={lang} labels={labels} />
        ))}
      </div>

      {/* Affiliate CTA */}
      <div className="relative mt-5">
        <a
          href={AFFILIATE_URL}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#f59e0b] to-[#f97316] px-4 py-3.5 text-sm font-extrabold text-[#0f1f3d] shadow-lg shadow-[#f59e0b]/20 transition hover:brightness-110 active:scale-[.98]"
        >
          <TrendingUp size={16} />
          {labels.cta}
          <ExternalLink size={13} className="opacity-60" />
        </a>
        <p className="mt-2 text-center text-[10px] text-white/25">
          Pari responsable · 18+ · Lien affilié
        </p>
      </div>
    </section>
  );
}
