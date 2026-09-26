import type { Metadata } from 'next';
import { defaultOgImage } from '@/lib/seo';

export const metadata: Metadata = {
  title: {
    default: 'Taza Immobilier — Biens à vendre et à louer à Taza',
    template: '%s | Taza Immobilier · RME Voyage',
  },
  description:
    'Sélection de biens immobiliers à Taza et dans sa région, présentée par notre partenaire local : appartements, maisons et terrains, avec contact direct.',
  alternates: { canonical: '/taza-immobilier' },
  openGraph: {
    title: {
    default: 'Taza Immobilier — Biens à vendre et à louer à Taza',
    template: '%s | Taza Immobilier · RME Voyage',
  },
    description: 'Appartements, maisons et terrains à Taza et dans sa région, avec contact direct.',
    type: 'website', images: [defaultOgImage],
  },
};

export default function TazaImmobilierLayout({ children }: { children: React.ReactNode }) {
  return children;
}
