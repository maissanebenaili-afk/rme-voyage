import type { Metadata } from 'next';
import { defaultOgImage } from '@/lib/seo';

// Only what RME can stand behind (issue #227): no price, delivery time,
// guarantee or quality claim that the business has not published itself.
export const metadata: Metadata = {
  title: 'Belisamae — Reiki et géobiologie',
  description: 'Contact de Belisamae, référencé gratuitement sur RME Voyage. Séances et tarifs sur son site.',
  openGraph: { title: 'Belisamae — Reiki et géobiologie', description: 'Contact de Belisamae, référencé gratuitement sur RME Voyage. Séances et tarifs sur son site.', type: 'website', images: [defaultOgImage] },
};

export default function BelisamaeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
