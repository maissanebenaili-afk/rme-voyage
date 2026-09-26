import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { CAFTANS, getCaftan, similarCaftans } from '@/lib/caftans';
import CaftanVisual from '@/components/caftan/CaftanVisual';
import CaftanGallery from '@/components/caftan/CaftanGallery';
import CaftanBooking from '@/components/caftan/CaftanBooking';
import { defaultOgImage } from '@/lib/seo';

type Params = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return CAFTANS.map(c => ({ id: c.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params;
  const c = getCaftan(id);
  if (!c) return { title: 'Modèle introuvable | Marwa Caftan' };

  const title = `Caftan ${c.name} — ${c.style} | Marwa Caftan`;
  const description = `${c.description} Location dès ${c.prixLocation} € la semaine, caution ${c.caution} €. Livraison en 48 h.`;

  // Le layout parent fusionne openGraph champ par champ : sans ces deux lignes,
  // toutes les fiches partageraient la carte de la collection.
  return { title, description, openGraph: { title, description, type: 'website', images: [defaultOgImage] } };
}

export default async function CaftanPage({ params }: Params) {
  const { id } = await params;
  const caftan = getCaftan(id);
  if (!caftan) notFound();

  const similar = similarCaftans(caftan);

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#fdf8f2]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs font-semibold text-[#475569]">
          <Link href="/" className="hover:text-[#c9903a]">RME Voyage</Link>
          <span>/</span>
          <Link href="/marwa-caftan" className="hover:text-[#c9903a]">Marwa Caftan</Link>
          <span>/</span>
          <span className="text-[#0f1f3d]">Caftan {caftan.name}</span>
        </nav>

        <Link href="/marwa-caftan"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#64748b] transition hover:text-[#0f1f3d]">
          <ArrowLeft size={14} /> Toute la collection
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-start">
          <CaftanGallery caftan={caftan} />
          <CaftanBooking caftan={caftan} />
        </div>

        {similar.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[#0f1f3d]">
              Dans le même esprit
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-3">
              {similar.map(s => (
                <Link key={s.id} href={`/marwa-caftan/${s.id}`}
                  className="group overflow-hidden rounded-3xl border border-[#e2d5c0] bg-white transition hover:-translate-y-1 hover:shadow-lg">
                  <span className="block h-56 overflow-hidden bg-[#f4ece0]">
                    <CaftanVisual caftan={s} view="face" variant="card" />
                  </span>
                  <span className="block p-4">
                    <span className="block font-black text-[#0f1f3d]">Caftan {s.name}</span>
                    <span className="mt-0.5 block text-xs text-[#64748b]">{s.style}</span>
                    <span className="mt-1.5 block font-black text-[#8a5a14]">
                      {s.prixLocation} €<span className="text-xs font-semibold text-[#475569]">/sem</span>
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
