'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, Star } from 'lucide-react';

const PREVIEWS = [
  { name: 'Zahia',  gradient: 'from-[#6b1a2e] to-[#a0344a]', prix: 150 },
  { name: 'Nour',   gradient: 'from-[#bfa882] to-[#e8dcc8]', prix: 200 },
  { name: 'Malika', gradient: 'from-[#1a5c3a] to-[#2d9d62]', prix: 180 },
];

export default function MarwaCaftanWidget() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#0f1f3d] border border-[#c9903a]/25 p-6 shadow-xl">
      {/* Background zellige pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-5"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #c9903a 0, #c9903a 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />

      {/* Glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#c9903a]/15 blur-3xl" />

      {/* Header */}
      <div className="relative flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#c9903a] shadow-lg shadow-[#c9903a]/30 text-2xl">
            👗
          </div>
          <div>
            <h2 className="font-black text-white text-base tracking-tight">Marwa Caftan</h2>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={9} fill="#c9903a" className="text-[#c9903a]" />
              ))}
              <span className="text-[10px] text-white/40 ml-1">Collection exclusive</span>
            </div>
          </div>
        </div>
        <span className="rounded-full bg-[#c9903a]/15 border border-[#c9903a]/30 px-2.5 py-1 text-[10px] font-bold text-[#c9903a]">
          Partenaire
        </span>
      </div>

      <p className="relative text-sm text-white/65 mb-4 leading-5">
        Caftans marocains authentiques pour votre mariage, fiançailles ou soirée. Location avec livraison en 48h · Caution sécurisée.
      </p>

      {/* Preview swatches */}
      <div className="relative flex gap-2.5 mb-5">
        {PREVIEWS.map(p => (
          <div key={p.name} className="flex-1">
            <div className={`h-20 rounded-2xl bg-gradient-to-br ${p.gradient}`} />
            <p className="mt-1.5 text-center text-[11px] font-bold text-white/70">{p.name}</p>
            <p className="text-center text-[11px] text-[#c9903a] font-black">{p.prix}€/sem</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="relative flex gap-2.5">
        <Link href="/marwa-caftan"
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#c9903a] py-3 text-sm font-extrabold text-[#0f1f3d] transition hover:bg-[#fde68a]">
          Voir la collection <ArrowRight size={14} />
        </Link>
        <Link href="/marwa-caftan"
          className="flex items-center gap-1.5 rounded-2xl border border-white/10 px-4 py-3 text-xs font-bold text-white/60 hover:text-white transition">
          <Sparkles size={12} />
          Conseil IA
        </Link>
      </div>
    </div>
  );
}
