import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/site-url'
import { fetchLotteryByDate, todayBangkok } from '@/lib/lottery-api'
import { localizedPath, lotteryGroups, seoLangs } from '@/lib/seo'

function addDays(date: string, amount: number): string {
  const d = new Date(`${date}T12:00:00`)
  d.setDate(d.getDate() + amount)
  return d.toISOString().slice(0, 10)
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl().replace(/\/$/, '')
  const today = todayBangkok()
  const dailyUrls = Array.from({ length: 90 }, (_, index) => {
    const date = addDays(today, -index)
    return {
      path: `/lottery/${date}`,
      url: `${siteUrl}/th/lottery/${date}`,
      lastModified: date,
      changeFrequency: 'daily' as const,
      priority: index === 0 ? 0.95 : 0.8,
    }
  })
  const languageHomeUrls = seoLangs.map(lang => ({
    url: `${siteUrl}${localizedPath('/', lang)}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: lang === 'th' ? 0.98 : 0.86,
  }))
  const languageDailyUrls = seoLangs.flatMap(lang => (
    dailyUrls.slice(0, 30).map(item => {
      return {
        url: `${siteUrl}${localizedPath(item.path, lang)}`,
        lastModified: item.lastModified,
        changeFrequency: 'daily' as const,
        priority: lang === 'th' ? 0.82 : 0.68,
      }
    })
  ))
  const groupUrls = seoLangs.flatMap(lang => lotteryGroups.map(group => ({
    url: `${siteUrl}${localizedPath(`/lottery/group/${group.code}`, lang)}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: lang === 'th' ? 0.9 : 0.76,
  })))
  const groupDailyUrls = seoLangs.flatMap(lang => lotteryGroups.flatMap(group => (
    dailyUrls.slice(0, 30).map(item => ({
      url: `${siteUrl}${localizedPath(item.path.replace('/lottery/', `/lottery/group/${group.code}/`), lang)}`,
      lastModified: item.lastModified,
      changeFrequency: 'daily' as const,
      priority: lang === 'th' ? 0.72 : 0.58,
    }))
  )))
  let marketUrls: MetadataRoute.Sitemap = []
  try {
    const response = await fetchLotteryByDate(today, 'th')
    const markets = response.data?.groups.flatMap(group => group.markets) ?? []
    marketUrls = seoLangs.flatMap(lang => markets.map(market => ({
      url: `${siteUrl}${localizedPath(`/market/${market.market_id}`, lang)}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: lang === 'th' ? 0.82 : 0.66,
    })))
  } catch {
    marketUrls = []
  }

  return [
    ...languageHomeUrls,
    ...groupUrls,
    ...marketUrls,
    ...languageDailyUrls,
    ...groupDailyUrls,
  ]
}
