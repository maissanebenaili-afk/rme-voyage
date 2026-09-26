import type { Metadata } from 'next';
import { defaultOgImage } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Marwa Caftan — Location & vente de caftans marocains',
  description:
    'Caftans marocains authentiques en location ou à la vente pour mariage, fiançailles, soirée ou baptême. Livraison en 48h, caution sécurisée et conseil personnalisé par notre agent IA.',
  keywords: [
    'caftan marocain',
    'location caftan',
    'caftan mariage',
    'takchita',
    'caftan France',
    'Marwa Caftan',
  ],
  openGraph: {
    title: 'Marwa Caftan — Location & vente de caftans marocains',
    description:
      'Collection exclusive de caftans marocains. Location dès 120€ la semaine, livraison 48h, caution sécurisée.',
    type: 'website', images: [defaultOgImage],
  },
};

export default function MarwaCaftanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
