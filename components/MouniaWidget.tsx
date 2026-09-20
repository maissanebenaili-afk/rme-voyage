import Link from 'next/link';
import { CalendarCheck, ArrowRight, Sparkles } from 'lucide-react';

const ACCOMPAGNEMENTS = [
  { label: 'Bioénergie', desc: 'Libérer les tensions et les blocages' },
  { label: 'Reiki', desc: 'Apaiser les blessures émotionnelles' },
  { label: 'Géobiologie', desc: 'Harmoniser les lieux de vie' },
];

export default function MouniaWidget() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#dfe3da] bg-[#f7f6f2] p-6 shadow-sm">
      <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-[#40634f]/10 blur-3xl" />

      <div className="relative flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-[#dde5dd]">
          <Sparkles size={18} className="text-[#40634f]" />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold tracking-tight text-[#2f3a33]">
            Belisamae
          </h2>
          <p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#8a9589]">
            Énergéticienne · Reiki · Géobiologie
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-full border border-[#40634f]/25 bg-[#40634f]/10 px-2.5 py-1 text-[10px] font-bold text-[#40634f]">
          Partenaire
        </span>
      </div>

      <p className="relative mt-5 font-display text-2xl font-normal italic leading-8 tracking-tight text-[#3d4a41]">
        Se libérer. Comprendre. Avancer.
      </p>

      <p className="relative mt-3 text-sm leading-6 text-[#5d6a60]">
        Un accompagnement énergétique personnalisé pour traverser les moments de mal-être,
        apaiser les blessures émotionnelles et retrouver un équilibre intérieur.
      </p>

      <ul className="relative mt-4 space-y-1.5">
        {ACCOMPAGNEMENTS.map(a => (
          <li
            key={a.label}
            className="flex items-baseline gap-2 rounded-xl border border-[#e6e9e2] bg-white/60 px-3 py-2"
          >
            <span className="text-[13px] font-semibold text-[#2f3a33]">{a.label}</span>
            <span className="text-[11px] text-[#8a9589]">— {a.desc}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/belisamae"
        className="relative mt-5 flex items-center justify-center gap-2 rounded-full bg-[#40634f] py-3.5 text-sm font-bold text-white transition hover:bg-[#33513f]"
      >
        <CalendarCheck size={15} /> Découvrir &amp; prendre rendez-vous <ArrowRight size={14} />
      </Link>
    </div>
  );
}
