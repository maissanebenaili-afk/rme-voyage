import Link from 'next/link';
import { Compass, Home, MapPin, Calendar, FileText, ArrowLeft } from 'lucide-react';
import MoroccoFlag from '@/components/MoroccoFlag';

export default function NotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="flex min-h-screen flex-col items-center justify-center bg-[#f6f3ec] px-5 py-16 text-[#0f1f3d]">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0f1f3d] text-white shadow-lg">
          <Compass size={40} className="text-[#f59e0b] animate-pulse" />
        </div>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-900">
          <span>Erreur 404</span>
          <span>·</span>
          <span>Route introuvable</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Vous avez pris un mauvais virage
        </h1>
        <p className="mt-3 text-base leading-relaxed text-[#475569]">
          La page que vous cherchez n&apos;existe pas ou a été déplacée. Pas d&apos;inquiétude, le chemin du retour est tout tracé.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#0f1f3d] px-6 text-base font-extrabold text-white transition hover:bg-[#1b345f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f59e0b]"
          >
            <Home size={18} />
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/trajet"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-base font-bold text-[#0f1f3d] ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            <MapPin size={18} className="text-[#f59e0b]" />
            Voir les trajets
          </Link>
        </div>

        <div className="mt-10 rounded-2xl border border-black/5 bg-white p-5 text-left shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-[#64748b]">Accès rapides</h2>
          <ul className="mt-3 divide-y divide-slate-100 text-sm">
            <li>
              <Link href="/quand-partir" className="flex items-center justify-between py-2.5 font-semibold text-[#0f1f3d] hover:text-[#b45309]">
                <span className="flex items-center gap-2">
                  <Calendar size={16} className="text-amber-600" />
                  Quand partir ? (jours calmes & affluence)
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
            <li>
              <Link href="/outils-papiers" className="flex items-center justify-between py-2.5 font-semibold text-[#0f1f3d] hover:text-[#b45309]">
                <span className="flex items-center gap-2">
                  <FileText size={16} className="text-amber-600" />
                  Papiers, procuration & formalités douane
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
            <li>
              <Link href="/guide" className="flex items-center justify-between py-2.5 font-semibold text-[#0f1f3d] hover:text-[#b45309]">
                <span className="flex items-center gap-2">
                  <Compass size={16} className="text-amber-600" />
                  Guide complet Europe ↔ Maroc
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#94a3b8]">
          <span>RME Voyage</span>
          <span>·</span>
          <MoroccoFlag className="inline-block h-3.5 w-5" />
          <span>Le compagnon des Marocains du monde</span>
        </div>
      </div>
    </main>
  );
}
