import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl().replace(/\/$/, '')

  return [
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
  ]
}
