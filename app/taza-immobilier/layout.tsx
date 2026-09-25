import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Taza Immobilier — Biens à vendre et à louer à Taza',
  description:
    'Sélection de biens immobiliers à Taza et dans sa région, présentée par notre partenaire local : appartements, maisons et terrains, avec contact direct.',
  alternates: { canonical: '/taza-immobilier' },
  openGraph: {
    title: 'Taza Immobilier — Biens à vendre et à louer à Taza',
    description: 'Appartements, maisons et terrains à Taza et dans sa région, avec contact direct.',
    type: 'website',
  },
};

export default function TazaImmobilierLayout({ children }: { children: React.ReactNode }) {
  return children;
}
