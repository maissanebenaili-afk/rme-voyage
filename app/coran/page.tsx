import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Download, ShieldCheck } from 'lucide-react';
import QuranReader from '@/components/QuranReader';

export const metadata: Metadata = {
  title: 'Coran — Lecture et accès hors connexion',
  description: 'Lire le Coran, choisir une sourate et préparer une copie pour la lecture hors connexion pendant le voyage.',
};

export default function QuranPage() {
  return (
    <main className="min-h-screen bg-[#f4f1e8] text-[#172033]">
      <header className="border-b border-emerald-100 bg-[#0f1f3d] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-white/80 hover:text-white">
            <ArrowLeft size={17} /> RME Voyage
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black"><BookOpen size={14} /> CORAN</span>
        </div>
      </header>

      <section className="bg-gradient-to-b from-[#0f1f3d] to-[#17395a] px-5 py-12 text-white sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">RME · rubrique spirituelle</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-6xl">Le Coran, accessible même pendant le voyage.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
            Choisis directement une sourate, lis-la confortablement et prépare le contenu avant de passer en mode avion.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"><BookOpen size={15} /> 114 sourates</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"><Download size={15} /> Lecture hors connexion</span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2"><ShieldCheck size={15} /> Texte non modifié</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
        <QuranReader />
      </div>

      <footer className="border-t border-slate-200 bg-white px-5 py-8 text-center text-xs text-slate-500">
        RME Voyage ne modifie pas le texte du Coran. Source numérique : Tanzil / édition quran-uthmani distribuée par AlQuran Cloud.
      </footer>
    </main>
  );
}
