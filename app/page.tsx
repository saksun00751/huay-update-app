import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import LotteryApp from './lottery-client'
import { fetchLotteryByDate, todayBangkok, type LotteryByDateResponse } from '@/lib/lottery-api'
import { DICT, LANG_LOCALE, isLang, type Lang } from '@/lib/i18n'

export const revalidate = 60
const siteName = 'Huay Update'
const siteTitle = 'ตรวจหวย Huay Update | ผลหวยไทย ต่างประเทศ หุ้น รายวัน ล่าสุดวันนี้'
const siteDescription = 'ศูนย์รวมผลหวยครบทุกประเภท หวยไทย หวยต่างประเทศ หวยหุ้น หวยรายวัน อัปเดตทันทีที่ออกผล รวดเร็ว แม่นยำ ฟรี ไม่มีค่าใช้จ่าย'
const siteKeywords = [
  'ตรวจหวย',
  'ผลหวย',
  'หวยไทย',
  'หวยต่างประเทศ',
  'หวยหุ้น',
  'หวยรายวัน',
  'สลากกินแบ่งรัฐบาล',
  'หวยลาว',
  'หวยฮานอย',
  'หวยยี่กี',
]

async function getLang(): Promise<Lang> {
  const c = await cookies()
  const v = c.get('lang')?.value
  return isLang(v) ? v : 'th'
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: siteTitle,
    description: siteDescription,
    keywords: siteKeywords,
    alternates: { canonical: '/' },
    openGraph: {
      title: siteTitle,
      description: siteDescription,
      type: 'website',
      siteName,
      images: '/logo.png',
    },
    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDescription,
      images: '/logo.png',
    },
    robots: { index: true, follow: true },
  }
}

export default async function Page() {
  const lang = await getLang()
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
  const dateText = new Date(date + 'T12:00:00').toLocaleDateString(LANG_LOCALE[lang], {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    alternateName: 'ตรวจหวย',
    url: 'https://huayupdate.live/',
    inLanguage: LANG_LOCALE[lang],
    description: `${t.todayResults} — ${dateText}`,
    datePublished: date,
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

      <h1 style={{
        position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
        overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0,
      }}>
        {t.brand} {dateText}
      </h1>
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

      <LotteryApp initialData={initialData} initialDate={date} initialLang={lang} />
    </>
  )
}
