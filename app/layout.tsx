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
  title: "MRE Route – Europe ↔ Maroc",
  description: "Comparez voiture, ferry et avion et préparez votre voyage vers le Maroc.",
  applicationName: "MRE Route",
  manifest: "/manifest.webmanifest"
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
