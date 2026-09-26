import type { Metadata } from 'next';
import { defaultOgImage } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Afarah Nassim — Traiteur franco-marocain',
  description:
    'Traiteur marocain pour mariages, fiançailles, baptêmes et réceptions. Cuisine faite maison, viande halal certifiée, devis gratuit sous 24 h. Île-de-France et déplacements France entière.',
  keywords: [
    'traiteur marocain',
    'traiteur mariage marocain',
    'couscous mariage',
    'pastilla',
    'traiteur halal Île-de-France',
  ],
  openGraph: {
    title: 'Afarah Nassim — Traiteur franco-marocain',
    description:
      'Mariages, fiançailles, baptêmes et réceptions. Une cuisine marocaine faite maison, dès 24 € par personne.',
    type: 'website', images: [defaultOgImage],
  },
};

export default function AfarahNassimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
