import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/app/breadcrumbs'
import { MarketDetailPanel } from '@/app/market-detail-view'
import LotterySeoContent, { faqJsonLd } from '@/app/lottery-seo-content'
import { fetchMarketResults, todayBangkok, type MarketResult } from '@/lib/lottery-api'
import { LANG_LOCALE, type Lang } from '@/lib/i18n'
import LangSwitcher from '@/app/lang-switcher'
import {
  absoluteUrl,
  baseOpenGraph,
  baseTwitter,
  formatSeoDate,
  isSeoLang,
  languageAlternates,
  localizedPath,
  siteKeywords,
  siteName,
} from '@/lib/seo'
import { DICT } from '@/lib/i18n'

export const revalidate = 60

type PageProps = {
  params: Promise<{ lang: string; id: string }>
}

function marketPath(id: string) {
  return `/market/${id}`
}

function resultSummary(result: MarketResult | null, lang: Lang) {
  if (!result?.result_number || result.result_number.no_result) return lang === 'en' ? 'No result yet' : 'ยังไม่มีผล'
  const top3 = result.result_top_3 || result.result_number.top_3 || '-'
  const top2 = result.result_top_2 || result.result_number.top_2 || '-'
  const bottom2 = result.result_bottom_2 || result.result_number.bottom_2 || '-'
  if (lang === 'en') return `3 Top ${top3} · 2 Top ${top2} · 2 Bottom ${bottom2}`
  return `3 ตัวบน ${top3} · 2 ตัวบน ${top2} · 2 ตัวล่าง ${bottom2}`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, id } = await params
  if (!isSeoLang(lang)) return { title: 'Not found', robots: { index: false, follow: false } }

  try {
    const detail = await fetchMarketResults(id, lang)
    const market = detail.data?.market
    if (!market) throw new Error('Market not found')

    const title = lang === 'en' ? `${market.name} latest results and history` : `ผล${market.name}ล่าสุดและย้อนหลัง`
    const description = lang === 'en'
      ? `Check latest ${market.name} lottery results and history.`
      : `ตรวจผล${market.name}ล่าสุด พร้อมผลย้อนหลัง รายละเอียดเลข 3 ตัวบน 2 ตัวบน และ 2 ตัวล่าง`
    const path = localizedPath(marketPath(id), lang)

    return {
      title,
      description,
      keywords: [...siteKeywords, `ผล${market.name}`, `${market.name}ย้อนหลัง`, `ตรวจ${market.name}`],
      alternates: { canonical: path, languages: languageAlternates(marketPath(id)) },
      openGraph: baseOpenGraph(path, title, description),
      twitter: baseTwitter(title, description),
      robots: { index: true, follow: true },
    }
  } catch {
    return { title: 'ผลหวยย้อนหลัง', description: 'ตรวจผลหวยล่าสุดและย้อนหลัง', robots: { index: true, follow: true } }
  }
}

export default async function LangMarketPage({ params }: PageProps) {
  const { lang, id } = await params
  if (!isSeoLang(lang)) notFound()
  const currentLang = lang as Lang
  let detail
  try {
    detail = await fetchMarketResults(id, currentLang)
  } catch {
    notFound()
  }

  const market = detail.data?.market
  if (!market) notFound()

  const history = detail.data?.history ?? []
  const t = DICT[currentLang]
  const title = currentLang === 'en' ? `${market.name} latest results and history` : `ผล${market.name}ล่าสุดและย้อนหลัง`
  const description = currentLang === 'en'
    ? `Check latest ${market.name} lottery results and history from ${market.group_name}.`
    : `ตรวจผล${market.name}ล่าสุด พร้อมผลย้อนหลังของ ${market.group_name}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    url: absoluteUrl(localizedPath(marketPath(id), currentLang)),
    inLanguage: LANG_LOCALE[currentLang],
    description,
    isPartOf: { '@type': 'WebSite', name: siteName, url: absoluteUrl('/'), alternateName: 'ตรวจหวย' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: history.length,
      itemListElement: history.map((result, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: `${market.name} ${formatSeoDate(result.draw_date, currentLang)}`,
        description: resultSummary(result, currentLang),
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }} />
      <div className="breadcrumbs-row">
        <Breadcrumbs items={[
          { href: localizedPath('/', currentLang), label: 'หน้าแรก' },
          { label: market.group_name },
          { label: market.name },
        ]} />
        <LangSwitcher lang={currentLang} />
      </div>

      <main className="market-page">
        <MarketDetailPanel
          market={{
            market_id: market.id,
            market_name: title,
            market_logo: market.logo,
          }}
          detail={detail}
          accentColor="#d4af37"
          accentHighlight="#f5d060"
          t={t}
          lang={currentLang}
          backHref={localizedPath('/', currentLang)}
        />
      </main>

      <LotterySeoContent currentDate={todayBangkok()} lang={currentLang} />
    </>
  )
}
