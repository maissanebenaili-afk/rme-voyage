import type { Metadata } from 'next';
import { defaultOgImage } from '@/lib/seo';

// Only what RME can stand behind (issue #227): no price, delivery time,
// guarantee or quality claim that the business has not published itself.
export const metadata: Metadata = {
  title: 'Afarah Nassim — traiteur',
  description: 'Contact du traiteur Afarah Nassim, référencé gratuitement sur RME Voyage. Menu, prix et conditions à demander directement.',
  openGraph: { title: 'Afarah Nassim — traiteur', description: 'Contact du traiteur Afarah Nassim, référencé gratuitement sur RME Voyage. Menu, prix et conditions à demander directement.', type: 'website', images: [defaultOgImage] },
};

export default function AfarahNassimLayout({ children }: { children: React.ReactNode }) {
  return children;
}
