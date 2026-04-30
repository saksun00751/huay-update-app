import type { Metadata } from 'next'
import LotteryApp from './lottery-client'
import LotterySeoContent, { faqJsonLd } from './lottery-seo-content'
import { fetchLotteryByDate, todayBangkok, type LotteryByDateResponse } from '@/lib/lottery-api'
import { DICT, LANG_LOCALE, type Lang } from '@/lib/i18n'
import {
  absoluteUrl,
  baseOpenGraph,
  baseTwitter,
  languageAlternates,
  lotteryPageDescription,
  lotteryPageTitle,
  siteKeywords,
  siteName,
} from '@/lib/seo'

export function homeMetadata(lang: Lang, canonical = '/'): Metadata {
  const date = todayBangkok()
  const title = lotteryPageTitle(date, lang)
  const description = lotteryPageDescription(date, lang)

  return {
    title,
    description,
    keywords: siteKeywords,
    alternates: {
      canonical,
      languages: languageAlternates('/'),
    },
    openGraph: baseOpenGraph(canonical, title, description),
    twitter: baseTwitter(title, description),
    robots: { index: true, follow: true },
  }
}

export default async function HomePage({ lang, canonical = '/' }: { lang: Lang; canonical?: string }) {
  const t = DICT[lang]
  const date = todayBangkok()
  let initialData: LotteryByDateResponse | null = null
  try {
    initialData = await fetchLotteryByDate(date, lang)
  } catch {
    initialData = null
  }

  const groups = initialData?.data?.groups ?? []
  const allMarkets = groups.flatMap(g => g.markets)
  const dateText = new Date(`${date}T12:00:00`).toLocaleDateString(LANG_LOCALE[lang], {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: lotteryPageTitle(date, lang),
    url: absoluteUrl(canonical),
    inLanguage: LANG_LOCALE[lang],
    description: lotteryPageDescription(date, lang),
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
      <noscript>
        <section style={{ padding: 24, maxWidth: 1280, margin: '0 auto' }}>
          <h2>{t.todayResults} {dateText}</h2>
          {groups.map(g => (
            <div key={g.group_code} style={{ marginTop: 24 }}>
              <h3>{g.group_name}</h3>
              <ul>
                {g.markets.map(m => (
                  <li key={m.market_id}>
                    <strong>{m.market_name}</strong>:{' '}
                    {m.result?.result_number?.no_result
                      ? t.noResult
                      : `${t.top3} ${m.result?.result_top_3 || '-'}, ${t.top2} ${m.result?.result_top_2 || '-'}, ${t.bottom2} ${m.result?.result_bottom_2 || '-'}`}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </noscript>

      <LotteryApp
        initialData={initialData}
        initialDate={date}
        initialLang={lang}
        langPrefix={`/${lang}`}
      />
      <LotterySeoContent currentDate={date} lang={lang} />
    </>
  )
}
