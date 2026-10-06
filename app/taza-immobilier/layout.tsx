import type { Metadata } from 'next';
import { defaultOgImage } from '@/lib/seo';

// Only what RME can stand behind (issue #227): no price, delivery time,
// guarantee or quality claim that the business has not published itself.
export const metadata: Metadata = {
  title: 'HiDOUR Immobilier — biens à Taza',
  description: 'Contact de HiDOUR Immobilier à Taza, référencé gratuitement sur RME Voyage. Biens disponibles et prix à demander directement.',
  alternates: { canonical: '/taza-immobilier' },
  openGraph: { title: 'HiDOUR Immobilier — biens à Taza', description: 'Contact de HiDOUR Immobilier à Taza, référencé gratuitement sur RME Voyage. Biens disponibles et prix à demander directement.', type: 'website', images: [defaultOgImage] },
};

export default function TazaImmobilierLayout({ children }: { children: React.ReactNode }) {
  return children;
}
