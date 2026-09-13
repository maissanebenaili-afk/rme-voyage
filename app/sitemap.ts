import { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/siteUrl';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteUrl;
  const lastModified = new Date();

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
  ];
}
