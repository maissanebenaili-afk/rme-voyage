import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  Bed,
  Bath,
  Square,
  DollarSign,
  MessageCircle,
  ArrowLeft,
  MapPin,
  Building2,
} from 'lucide-react';
import { MARWA_WHATSAPP, whatsappLink } from '@/lib/partners';
import { PROPERTIES, getProperty, similarProperties, PROPERTY_TYPES } from '@/lib/properties';
import { defaultOgImage } from '@/lib/seo';

export async function generateStaticParams() {
  return PROPERTIES.map(p => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = getProperty(id);

  if (!property) return {};

  return {
    title: property.title,
    description: property.description,
    alternates: { canonical: `/taza-immobilier/${property.id}` },
    openGraph: {
      title: property.title,
      description: property.description,
      type: 'website', images: [defaultOgImage],
    },
  };
}

export default async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = getProperty(id);

  if (!property) {
    notFound();
  }

  const similar = similarProperties(property);
  const primaryMode = property.modes[0];
  const primaryPrice = primaryMode === 'vente' ? property.price_sale : property.price_month;
  const priceLabel = primaryMode === 'vente' ? `${primaryPrice?.toLocaleString()} DH` : `${primaryPrice?.toLocaleString()} DH/mois`;

  const whatsapp = whatsappLink(
    MARWA_WHATSAPP,
    `Bonjour, je suis intéressé(e) par la propriété: ${property.title} à ${property.location}. Pouvez-vous me donner plus de détails?`
  );

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-[#fdf8f2]">
      {/* Hero with breadcrumb */}
      <section className="relative overflow-hidden bg-[#0f1f3d]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=60 height=60 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Crect width=10 height=10 fill=%22%23c9903a%22 opacity=%220.2%22/%3E%3C/svg%3E')] opacity-40" />
        <div className="relative mx-auto max-w-5xl px-5 py-8 sm:px-8">
          <Link
            href="/taza-immobilier"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white mb-6 transition"
          >
            <ArrowLeft size={14} /> Retour
          </Link>
        </div>
      </section>

      {/* Main content */}
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        {/* Image */}
        <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#8a6a3c] to-[#c9903a] h-96 mb-8" />

        {/* Title & location */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-black text-[#0f1f3d] mb-2">{property.title}</h1>
              <p className="text-[#64748b] flex items-center gap-2">
                <MapPin size={16} /> {property.location}, {property.district}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-[#8a5a14]">{priceLabel}</p>
              <p className="text-xs text-[#64748b] mt-1">{PROPERTY_TYPES[property.type]}</p>
            </div>
          </div>

          {/* Specs grid */}
          <div className="grid grid-cols-4 gap-3">
            {property.bedrooms > 0 && (
              <div className="rounded-2xl bg-[#fdf8f2] border border-[#e2d5c0] p-3 text-center">
                <Bed size={20} className="mx-auto mb-1 text-[#c9903a]" />
                <p className="text-sm font-bold text-[#0f1f3d]">{property.bedrooms}</p>
                <p className="text-xs text-[#64748b]">Chambres</p>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="rounded-2xl bg-[#fdf8f2] border border-[#e2d5c0] p-3 text-center">
                <Bath size={20} className="mx-auto mb-1 text-[#c9903a]" />
                <p className="text-sm font-bold text-[#0f1f3d]">{property.bathrooms}</p>
                <p className="text-xs text-[#64748b]">Salles de bain</p>
              </div>
            )}
            <div className="rounded-2xl bg-[#fdf8f2] border border-[#e2d5c0] p-3 text-center">
              <Square size={20} className="mx-auto mb-1 text-[#c9903a]" />
              <p className="text-sm font-bold text-[#0f1f3d]">{property.area}</p>
              <p className="text-xs text-[#64748b]">m²</p>
            </div>
            <div className="rounded-2xl bg-[#fdf8f2] border border-[#e2d5c0] p-3 text-center">
              <p className="text-sm font-bold text-[#0f1f3d] capitalize">{property.furnish}</p>
              <p className="text-xs text-[#64748b]">État</p>
            </div>
          </div>
        </div>

        {/* Description section */}
        <div className="grid gap-8 lg:grid-cols-3 mb-12">
          <div className="lg:col-span-2">
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-black text-[#0f1f3d] mb-4">Description</h2>
              <p className="text-[#475569] leading-7">{property.description}</p>
            </div>

            {/* Features */}
            <div className="mb-8">
              <h2 className="text-xl font-black text-[#0f1f3d] mb-4">Caractéristiques</h2>
              <div className="grid grid-cols-2 gap-3">
                {property.features.map(f => (
                  <div key={f} className="flex items-center gap-2 p-3 rounded-2xl bg-[#fdf8f2] border border-[#e2d5c0]">
                    <span className="text-[#c9903a] font-bold">✓</span>
                    <span className="text-sm text-[#475569]">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Available modes */}
            <div>
              <h2 className="text-xl font-black text-[#0f1f3d] mb-4">Disponible en</h2>
              <div className="flex flex-wrap gap-2">
                {property.modes.map(m => (
                  <span
                    key={m}
                    className="rounded-full bg-[#fef3c7] px-4 py-2 text-sm font-semibold text-[#b45309]"
                  >
                    {m === 'location' ? 'Location' : m === 'vente' ? 'Vente' : 'Location meublée'}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Contact card */}
          <div>
            <div className="rounded-3xl border border-[#c9903a]/30 bg-[#0f1f3d] p-6 sticky top-4">
              <h3 className="font-black text-white mb-4">Obtenir plus d'informations</h3>
              <p className="text-sm text-white/70 mb-4">
                Contactez-nous pour découvrir cette propriété, obtenir des photos supplémentaires ou discuter des conditions.
              </p>
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25d366] py-3.5 text-sm font-extrabold text-[#0f1f3d] transition hover:bg-[#1da851] mb-4"
              >
                <MessageCircle size={16} /> Contacter
              </a>
              <p className="text-xs text-white/50 text-center">
                Par WhatsApp — Réponse rapide
              </p>
            </div>
          </div>
        </div>

        {/* Similar properties */}
        {similar.length > 0 && (
          <section>
            <h2 className="text-2xl font-black text-[#0f1f3d] mb-6">Propriétés similaires</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map(p => (
                <Link
                  key={p.id}
                  href={`/taza-immobilier/${p.id}`}
                  className="group relative rounded-3xl border border-[#e2d5c0] overflow-hidden transition hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image */}
                  <div className="relative h-56 bg-gradient-to-br from-[#8a6a3c] to-[#c9903a]" />

                  {/* Info */}
                  <div className="bg-white p-4">
                    <h3 className="font-black text-[#0f1f3d] text-sm line-clamp-2 mb-1">{p.title}</h3>
                    <p className="text-xs text-[#64748b] flex items-center gap-1 mb-3">
                      <MapPin size={12} /> {p.location}
                    </p>
                    <p className="font-bold text-[#0f1f3d] text-sm">
                      {p.modes[0] === 'vente' ? `${p.price_sale?.toLocaleString()} DH` : `${p.price_month?.toLocaleString()} DH/mois`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </section>

      {/* Footer */}
      <div className="bg-[#0f1f3d] px-5 py-6 text-center text-xs text-white/75 mt-12">
        Idour Immobilier — Taza · Immobilier{' '}
        <Link href="/" className="text-[#c9903a] underline hover:no-underline">
          RME Voyage
        </Link>
      </div>
    </main>
  );
}
