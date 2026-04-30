import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Breadcrumbs from '@/app/breadcrumbs'
import LotteryApp from '@/app/lottery-client'
import LotterySeoContent, { faqJsonLd } from '@/app/lottery-seo-content'
import { fetchLotteryByDate, todayBangkok, type LotteryByDateResponse } from '@/lib/lottery-api'
import { DICT, LANG_LOCALE, type Lang } from '@/lib/i18n'
import {
  absoluteUrl,
  baseOpenGraph,
  baseTwitter,
  isIsoDate,
  isSeoLang,
  languageAlternates,
  localizedPath,
  lotteryPageDescription,
  lotteryPageTitle,
  siteKeywords,
  siteName,
} from '@/lib/seo'

export const revalidate = 60

type PageProps = {
  params: Promise<{ lang: string; date: string }>
}

function isFutureDate(date: string): boolean {
  return date > todayBangkok()
}

function datePath(date: string) {
  return `/lottery/${date}`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, date } = await params
  if (!isSeoLang(lang) || !isIsoDate(date) || isFutureDate(date)) {
    return {
      title: 'Not found',
      robots: { index: false, follow: false },
    }
  }

  const path = localizedPath(datePath(date), lang)
  const title = lotteryPageTitle(date, lang)
  const description = lotteryPageDescription(date, lang)

  return {
    title,
    description,
    keywords: siteKeywords,
    alternates: {
      canonical: path,
      languages: languageAlternates(datePath(date)),
    },
    openGraph: baseOpenGraph(path, title, description),
    twitter: baseTwitter(title, description),
    robots: { index: true, follow: true },
  }
}

export default async function LangLotteryDatePage({ params }: PageProps) {
  const { lang, date } = await params
  if (!isSeoLang(lang) || !isIsoDate(date) || isFutureDate(date)) notFound()

  const currentLang = lang as Lang
  const t = DICT[currentLang]
  let initialData: LotteryByDateResponse | null = null
  try {
    initialData = await fetchLotteryByDate(date, currentLang)
  } catch {
    initialData = null
  }

  const groups = initialData?.data?.groups ?? []
  const allMarkets = groups.flatMap(g => g.markets)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: lotteryPageTitle(date, currentLang),
    url: absoluteUrl(localizedPath(datePath(date), currentLang)),
    inLanguage: LANG_LOCALE[currentLang],
    description: lotteryPageDescription(date, currentLang),
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: absoluteUrl('/'),
      alternateName: 'ตรวจหวย',
    },
    dateModified: date,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: allMarkets.length,
      itemListElement: allMarkets.map((m, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: m.market_name,
        item: {
          '@type': 'Thing',
          name: m.market_name,
          identifier: m.market_id,
          description: m.result?.result_number?.no_result
            ? t.noResult
            : `${t.top3} ${m.result?.result_top_3 ?? '-'} · ${t.top2} ${m.result?.result_top_2 ?? '-'} · ${t.bottom2} ${m.result?.result_bottom_2 ?? '-'}`,
        },
      })),
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      <Breadcrumbs items={[
        { href: localizedPath('/', currentLang), label: 'หน้าแรก' },
        { label: lotteryPageTitle(date, currentLang) },
      ]} />
      <LotteryApp
        initialData={initialData}
        initialDate={date}
        initialLang={currentLang}
        langPrefix={`/${currentLang}`}
      />
      <LotterySeoContent currentDate={date} lang={currentLang} />
    </>
  )
}
