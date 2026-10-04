import type { Metadata } from 'next';
import { defaultOgImage } from '@/lib/seo';

// Only what RME can stand behind (issue #227): no price, delivery time,
// guarantee or quality claim that the business has not published itself.
export const metadata: Metadata = {
  title: 'Marwa Caftan — caftans en location et à la vente',
  description: 'Contact de Marwa Caftan, référencé gratuitement sur RME Voyage. Modèles, prix et conditions à demander directement.',
  openGraph: { title: 'Marwa Caftan — caftans en location et à la vente', description: 'Contact de Marwa Caftan, référencé gratuitement sur RME Voyage. Modèles, prix et conditions à demander directement.', type: 'website', images: [defaultOgImage] },
};

export default function MarwaCaftanLayout({ children }: { children: React.ReactNode }) {
  return children;
}
