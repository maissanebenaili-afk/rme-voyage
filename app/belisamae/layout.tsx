import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Belisamae — Énergéticienne, Reiki & Géobiologie | RME Voyage',
  description:
    'Un accompagnement énergétique personnalisé pour traverser les moments de mal-être, apaiser les blessures émotionnelles et retrouver un équilibre intérieur. En cabinet ou à distance.',
  keywords: ['Belisamae', 'Reiki', 'énergéticienne', 'géobiologie', 'bioénergie', 'bien-être'],
  openGraph: {
    title: 'Belisamae — Se libérer. Comprendre. Avancer.',
    description:
      'Bioénergie, Reiki et géobiologie. Un accompagnement personnalisé, en cabinet ou à distance.',
    type: 'website',
  },
};

export default function BelisamaeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
