import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CaftanNotFound() {
  return (
    <main id="main-content" tabIndex={-1} className="grid min-h-screen place-items-center bg-[#fdf8f2] px-5">
      <div className="text-center">
        <p className="text-5xl">👗</p>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-[#0f1f3d]">
          Ce modèle n&apos;existe pas.
        </h1>
        <p className="mt-2 text-[#64748b]">
          Il a peut-être quitté la collection. Le reste de la boutique vous attend.
        </p>
        <Link href="/marwa-caftan"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c9903a] px-6 py-3 font-extrabold text-[#0f1f3d] transition hover:bg-[#a8741e]">
          <ArrowLeft size={15} /> Voir la collection
        </Link>
      </div>
    </main>
  );
}
