import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'La Boutique — Partenaires MRE de la France au Maroc | RME Voyage',
  description:
    'Caftans marocains en location, bien-être et Reiki, traiteurs, envoi de colis et groupage vers le Maroc, garages et mobilité. Des partenaires vérifiés pour les Marocains d\'Europe.',
  keywords: [
    'caftan location',
    'colis Maroc',
    'groupage Maroc',
    'traiteur marocain',
    'Reiki',
    'MRE services',
  ],
  openGraph: {
    title: 'La Boutique RME Voyage — nos partenaires de la France au Maroc',
    description:
      'Caftans, bien-être, traiteurs, colis et mobilité : le carnet d\'adresses des Marocains d\'Europe.',
    type: 'website',
  },
};

export default function BoutiqueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
