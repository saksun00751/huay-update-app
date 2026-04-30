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
  formatSeoDate,
  getLotteryGroup,
  isIsoDate,
  isSeoLang,
  languageAlternates,
  localizedPath,
  lotteryGroupDescription,
  lotteryGroupTitle,
  siteKeywords,
  siteName,
} from '@/lib/seo'

export const revalidate = 60

type PageProps = {
  params: Promise<{ lang: string; groupCode: string; date: string }>
}

function groupDatePath(groupCode: string, date: string) {
  return `/lottery/group/${groupCode}/${date}`
}

function isFutureDate(date: string): boolean {
  return date > todayBangkok()
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang, groupCode, date } = await params
  const group = getLotteryGroup(groupCode)
  if (!isSeoLang(lang) || !group || !isIsoDate(date) || isFutureDate(date)) {
    return { title: 'Not found', robots: { index: false, follow: false } }
  }

  const path = localizedPath(groupDatePath(groupCode, date), lang)
  const title = `${group.title} งวดวันที่ ${formatSeoDate(date, lang)}`
  const description = `${group.description} สำหรับงวดวันที่ ${formatSeoDate(date, lang)}`
  return {
    title,
    description,
    keywords: [...siteKeywords, ...group.keywords],
    alternates: { canonical: path, languages: languageAlternates(groupDatePath(groupCode, date)) },
    openGraph: baseOpenGraph(path, title, description),
    twitter: baseTwitter(title, description),
    robots: { index: true, follow: true },
  }
}

export default async function LangLotteryGroupDatePage({ params }: PageProps) {
  const { lang, groupCode, date } = await params
  if (!isSeoLang(lang) || !isIsoDate(date) || isFutureDate(date)) notFound()
  const currentLang = lang as Lang
  const groupMeta = getLotteryGroup(groupCode)
  if (!groupMeta) notFound()

  const t = DICT[currentLang]
  let initialData: LotteryByDateResponse | null = null
  try {
    const response = await fetchLotteryByDate(date, currentLang)
    initialData = {
      ...response,
      data: response.data ? {
        ...response.data,
        groups: response.data.groups.filter(group => group.group_code === groupCode),
      } : response.data,
    }
  } catch {
    initialData = null
  }

  const groups = initialData?.data?.groups ?? []
  const allMarkets = groups.flatMap(group => group.markets)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${lotteryGroupTitle(groupCode)} งวดวันที่ ${formatSeoDate(date, currentLang)}`,
    url: absoluteUrl(localizedPath(groupDatePath(groupCode, date), currentLang)),
    inLanguage: LANG_LOCALE[currentLang],
    description: `${lotteryGroupDescription(groupCode)} สำหรับงวดวันที่ ${formatSeoDate(date, currentLang)}`,
    isPartOf: { '@type': 'WebSite', name: siteName, url: absoluteUrl('/'), alternateName: 'ตรวจหวย' },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: allMarkets.length,
      itemListElement: allMarkets.map((market, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: market.market_name,
        item: {
          '@type': 'Thing',
          name: market.market_name,
          identifier: market.market_id,
          description: market.result?.result_number?.no_result
            ? t.noResult
            : `${t.top3} ${market.result?.result_top_3 ?? '-'} · ${t.top2} ${market.result?.result_top_2 ?? '-'} · ${t.bottom2} ${market.result?.result_bottom_2 ?? '-'}`,
        },
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }} />
      <Breadcrumbs items={[
        { href: localizedPath('/', currentLang), label: 'หน้าแรก' },
        { href: localizedPath(`/lottery/group/${groupCode}`, currentLang), label: groupMeta.name },
        { label: formatSeoDate(date, currentLang) },
      ]} />
      <LotteryApp
        initialData={initialData}
        initialDate={date}
        initialLang={currentLang}
        groupCode={groupCode}
        groupName={groupMeta.name}
        langPrefix={`/${currentLang}`}
      />
      <LotterySeoContent currentDate={date} lang={currentLang} />
    </>
  )
}
