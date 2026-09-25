import { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/siteUrl';
import { CAFTANS } from '@/lib/caftans';
import { PROPERTIES } from '@/lib/properties';
import { ROUTE_PAGES } from '@/lib/routePages';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrl;
  // Date réelle de la dernière mise à jour connue des données. `new Date()`
  // annonçait à chaque build que tout le site venait de changer.
  const lastModified = new Date(`${ROUTE_PAGES.generatedAt}T00:00:00Z`);

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/guide`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/decouvrir`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/telecharger`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/boutique`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/soutenir`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/marwa-caftan`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/belisamae`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/afarah-nassim`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/taza-immobilier`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trajet`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    ...ROUTE_PAGES.routes.map(route => ({
      url: `${baseUrl}/trajet/${route.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...CAFTANS.map(c => ({
      url: `${baseUrl}/marwa-caftan/${c.id}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    ...PROPERTIES.map(p => ({
      url: `${baseUrl}/taza-immobilier/${p.id}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
