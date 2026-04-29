import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl().replace(/\/$/, '')

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/'] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
