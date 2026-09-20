import { BookOpen, ArrowRight, Star } from 'lucide-react';
import { BOOK_URL } from '@/lib/partners';

function Cover({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-[#c8202c] shadow-2xl ring-1 ring-black/20 ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-x-0 top-0 h-2/3 opacity-30"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, #8b1520 0 2px, transparent 2px 9px)',
          borderBottomLeftRadius: '60% 40%',
          borderBottomRightRadius: '60% 40%',
        }}
      />
      <div className="absolute inset-x-[8%] top-[14%]">
        <p className="text-center text-[clamp(11px,2.9cqw,26px)] font-light leading-[1.05] tracking-tight text-white">
          L&apos;Équation
          <br />
          du Désir
        </p>
        <p className="mt-[6%] text-center text-[clamp(5px,1.1cqw,10px)] font-light tracking-wide text-white/90">
          Les Nombres Interdits — Tome 1
        </p>
      </div>
      <p className="absolute inset-x-[8%] bottom-[6%] text-right text-[clamp(6px,1.5cqw,13px)] font-light leading-[1.15] tracking-widest text-white">
        TAREK
        <br />
        BENAILI
      </p>
    </div>
  );
}

export default function BookBanner() {
  return (
    <section className="bg-[#0b1220] py-14" style={{ containerType: 'inline-size' }}>
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-[#c8202c]/25 bg-gradient-to-br from-[#16203a] via-[#121a2e] to-[#0f1524] p-6 shadow-2xl sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#c8202c]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-[#f59e0b]/10 blur-3xl" />

          <div className="relative flex flex-col items-center gap-7 sm:flex-row sm:items-stretch sm:gap-9">
            <a
              href={BOOK_URL}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="shrink-0 transition duration-300 hover:-translate-y-1 hover:rotate-1"
              aria-label="L'Équation du Désir sur Amazon"
            >
              <Cover className="h-[210px] w-[132px] sm:h-[248px] sm:w-[156px]" />
            </a>

            <div className="flex min-w-0 flex-col justify-center text-center sm:text-left">
              <div className="flex items-center justify-center gap-2 sm:justify-start">
                <span className="rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[#f59e0b]">
                  Roman
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  Publicité
                </span>
              </div>

              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                L&apos;Équation du Désir
              </h2>
              <p className="mt-1 text-sm font-semibold text-white/50">
                Les Nombres Interdits — Tome 1
              </p>

              <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={12} fill="#f59e0b" className="text-[#f59e0b]" />
                  ))}
                </div>
                <p className="text-sm font-bold text-[#f59e0b]">par Tarek Benaili</p>
              </div>

              <p className="mt-4 max-w-md text-sm leading-6 text-white/65">
                Le premier tome d&apos;une série où les chiffres cachent ce que les mots taisent.
                Disponible en Kindle et en broché.
              </p>

              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                <a
                  href={BOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex items-center gap-2 rounded-full bg-[#f59e0b] px-6 py-3 text-sm font-extrabold text-[#0f1f3d] transition hover:bg-[#fde68a]"
                >
                  <BookOpen size={15} /> Découvrir le livre <ArrowRight size={14} />
                </a>
                <a
                  href={BOOK_URL}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-5 py-3 text-sm font-bold text-white/60 transition hover:text-white"
                >
                  Lire un extrait
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
