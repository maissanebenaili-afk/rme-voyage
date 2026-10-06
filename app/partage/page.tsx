import type { Metadata } from 'next';
import HomeClient from '../HomeClient';
import { shareCardFromQuery } from '@/lib/shareCard';

// Atteinte uniquement par réécriture de /?from=…&to=… (voir next.config.mjs) :
// même accueil, mais avec un aperçu de partage (WhatsApp, Facebook) propre au
// trajet. L'accueil sans paramètres reste statique.
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const card = shareCardFromQuery(await searchParams);
  if (!card) return { alternates: { canonical: '/' } };
  const og = `/partage/og?${new URLSearchParams({ from: card.from, to: card.to }).toString()}`;
  const title = `${card.from} → ${card.to} · RME Voyage`;
  const description = 'Itinéraire, budget, ferry et étapes de ce trajet, sur RME Voyage.';
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: '/' },
    robots: { index: false, follow: true },
    openGraph: { title, description, images: [{ url: og, width: 1200, height: 630, alt: title }] },
    twitter: { card: 'summary_large_image', title, description, images: [og] },
  };
}

export default function SharedHome() {
  return <HomeClient />;
}
