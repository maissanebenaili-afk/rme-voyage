import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Plus_Jakarta_Sans, Amiri } from 'next/font/google';
import PWAInstall from '@/components/PWAInstall';
import Accessibility from '@/components/Accessibility';
import RegisterSW from './register-sw';
import { siteUrl } from '@/lib/siteUrl';

// Fallback fonts (kept for RTL Arabic + safety net); primary display/body
// identity fonts (Boska + General Sans) load via Fontshare <link> below.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap', weight: ['400', '500', '600', '700', '800'] });
const amiri = Amiri({ subsets: ['arabic', 'latin'], variable: '--font-amiri', display: 'swap', weight: ['400', '700'] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'RME Voyage — Préparez votre voyage Europe ↔ Maroc',
    template: '%s | RME Voyage',
  },
  description:
    'RME Voyage aide les Marocains du monde entier à préparer, organiser et simplifier leurs voyages entre l\'Europe et le Maroc. Itinéraire, budget, ferry, vol, prières et services sur la route.',
  keywords: [
    'voyage Maroc', 'MRE', 'RME', 'ferry Maroc', 'vol Maroc',
    'itinéraire Europe Maroc', 'budget voyage Maroc', 'horaires prière',
    'route Maroc', 'diaspora marocaine', 'Tarifa Tanger', 'Algeciras Tanger',
  ],
  authors: [{ name: 'Nova Presta' }],
  creator: 'Nova Presta',
  publisher: 'Nova Presta',
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: 'RME Voyage',
    title: 'RME Voyage — Le voyage Europe ↔ Maroc, mieux préparé',
    description: 'Itinéraire, budget, ferry, vol, horaires de prière et services sur votre route. Le compagnon de voyage des Marocains du monde.',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'RME Voyage — Europe ↔ Maroc',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RME Voyage — Europe ↔ Maroc',
    description: 'Préparez votre voyage entre l\'Europe et le Maroc : itinéraire, budget, ferry, vol, prières et services.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  category: 'travel',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0d3f38' },
    { media: '(prefers-color-scheme: dark)', color: '#0a2e28' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${inter.variable} ${jakarta.variable} ${amiri.variable}`}>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://cdn.fontshare.com" crossOrigin="" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=boska@500,600,700&f[]=general-sans@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'RME Voyage',
              description: 'Compagnon de voyage pour les Marocains résidant à l\'étranger. Préparez votre trajet Europe ↔ Maroc.',
              url: siteUrl,
              applicationCategory: 'TravelApplication',
              operatingSystem: 'Web, iOS, Android',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'EUR',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Nova Presta',
              },
            }),
          }}
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <link rel="apple-touch-icon" href="/icon-192.svg" />
        <meta name="theme-color" content="#0d3f38" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
                { '@type': 'ListItem', position: 2, name: 'Guide', item: `${siteUrl}/guide` },
                { '@type': 'ListItem', position: 3, name: 'Découvrir', item: `${siteUrl}/decouvrir` },
              ],
            }),
          }}
        />
      </head>
      <body>
        <RegisterSW />
        <PWAInstall />
        <Accessibility />
        {children}
      </body>
    </html>
  );
}
