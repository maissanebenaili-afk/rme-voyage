import type { Metadata } from 'next';
import { defaultOgImage } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'La Boutique — Partenaires MRE de la France au Maroc',
  description:
    'Caftans marocains en location, traiteurs, envoi de colis et groupage vers le Maroc, garages et mobilité. Des professionnels référencés gratuitement pour les Marocains d\'Europe.',
  keywords: [
    'caftan location',
    'colis Maroc',
    'groupage Maroc',
    'traiteur marocain',
    'MRE services',
  ],
  openGraph: {
    title: 'La Boutique RME Voyage — nos partenaires de la France au Maroc',
    description:
      'Caftans, traiteurs, colis et mobilité : le carnet d\'adresses des Marocains d\'Europe.',
    type: 'website', images: [defaultOgImage],
  },
};

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
