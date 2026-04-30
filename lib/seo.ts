import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/site-url'
import { LANG_LOCALE, type Lang } from '@/lib/i18n'

export const seoLangs: Lang[] = ['th', 'en', 'la', 'kh']
export const siteName = 'Huay Update'
export const siteTitle = 'ตรวจหวย Huay Update | ผลหวยไทย ต่างประเทศ หุ้น รายวัน ล่าสุดวันนี้'
export const siteDescription = 'ศูนย์รวมผลหวยครบทุกประเภท หวยไทย หวยต่างประเทศ หวยหุ้น หวยรายวัน อัปเดตทันทีที่ออกผล รวดเร็ว แม่นยำ ฟรี ไม่มีค่าใช้จ่าย'
export const siteKeywords = [
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

export const lotteryGroups = [
  {
    code: 'lotto-thai',
    name: 'หวยไทย',
    title: 'ผลหวยไทยล่าสุด',
    description: 'ตรวจผลหวยไทยล่าสุดและผลย้อนหลัง พร้อมเลขรางวัลสำคัญตามวันที่ อัปเดตผลหวยไทยในหน้าเดียว',
    keywords: ['ผลหวยไทย', 'ตรวจหวยไทย', 'สลากกินแบ่งรัฐบาล', 'หวยไทยย้อนหลัง'],
  },
  {
    code: 'lotto-foreign',
    name: 'หวยต่างประเทศ',
    title: 'ผลหวยต่างประเทศล่าสุด',
    description: 'รวมผลหวยต่างประเทศล่าสุดและย้อนหลังตามวันที่ ตรวจผลหวยลาว หวยฮานอย และตลาดหวยต่างประเทศที่มีข้อมูลในระบบ',
    keywords: ['ผลหวยต่างประเทศ', 'หวยลาว', 'หวยฮานอย', 'หวยต่างประเทศย้อนหลัง'],
  },
  {
    code: 'lotto-stock',
    name: 'หวยหุ้น',
    title: 'ผลหวยหุ้นล่าสุด',
    description: 'ตรวจผลหวยหุ้นล่าสุดและย้อนหลัง แยกตามวันที่ พร้อมเลข 3 ตัวบน 2 ตัวบน และ 2 ตัวล่างของตลาดหวยหุ้น',
    keywords: ['ผลหวยหุ้น', 'หวยหุ้นวันนี้', 'หวยหุ้นย้อนหลัง', 'ตรวจหวยหุ้น'],
  },
  {
    code: 'lotto-daily',
    name: 'หวยรายวัน',
    title: 'ผลหวยรายวันล่าสุด',
    description: 'รวมผลหวยรายวันล่าสุดและย้อนหลังตามวันที่ ตรวจผลหวยที่ออกประจำวันได้จากหน้าเดียว',
    keywords: ['ผลหวยรายวัน', 'หวยรายวันวันนี้', 'หวยรายวันย้อนหลัง', 'ตรวจหวยรายวัน'],
  },
] as const

export type LotteryGroupCode = typeof lotteryGroups[number]['code']

export function getLotteryGroup(code: string) {
  return lotteryGroups.find(group => group.code === code)
}

export function absoluteUrl(path = '/'): string {
  const siteUrl = getSiteUrl().replace(/\/$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${siteUrl}${normalizedPath}`
}

export function isSeoLang(value: string): value is Lang {
  return (seoLangs as string[]).includes(value)
}

export function localizedPath(path: string, lang: Lang): string {
  const normalizedPath = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`
  return `/${lang}${normalizedPath}`
}

export function languageAlternates(path: string): NonNullable<Metadata['alternates']>['languages'] {
  return {
    'x-default': localizedPath(path, 'th'),
    ...Object.fromEntries(
      seoLangs.map(lang => [LANG_LOCALE[lang], localizedPath(path, lang)]),
    ),
  }
}

export function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00`)
  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10)
}

export function formatSeoDate(date: string, lang: Lang = 'th'): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(LANG_LOCALE[lang], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function lotteryPageTitle(date: string, lang: Lang = 'th'): string {
  if (lang === 'en') return `Lottery results for ${formatSeoDate(date, lang)}`
  if (lang === 'la') return `ຜົນຫວຍວັນທີ ${formatSeoDate(date, lang)}`
  if (lang === 'kh') return `លទ្ធផលឆ្នោតថ្ងៃទី ${formatSeoDate(date, lang)}`
  return `ผลหวยประจำวันที่ ${formatSeoDate(date, lang)}`
}

export function lotteryPageDescription(date: string, lang: Lang = 'th'): string {
  if (lang === 'en') return `Check lottery results for ${formatSeoDate(date, lang)}, including Thai lottery, foreign lottery, stock lottery, daily lottery, 3 top, 2 top, and 2 bottom results.`
  if (lang === 'la') return `ກວດຜົນຫວຍວັນທີ ${formatSeoDate(date, lang)} ລວມຫວຍໄທ ຫວຍຕ່າງປະເທດ ຫວຍຫຸ້ນ ແລະຫວຍລາຍວັນ`
  if (lang === 'kh') return `ពិនិត្យលទ្ធផលឆ្នោតថ្ងៃទី ${formatSeoDate(date, lang)} រួមមានឆ្នោតថៃ ឆ្នោតបរទេស ឆ្នោតហ៊ុន និងឆ្នោតប្រចាំថ្ងៃ`
  return `ตรวจผลหวยประจำวันที่ ${formatSeoDate(date, lang)} ครบทั้งหวยไทย หวยต่างประเทศ หวยหุ้น และหวยรายวัน พร้อมเลข 3 ตัวบน 2 ตัวบน และ 2 ตัวล่าง`
}

export function lotteryGroupTitle(code: string): string {
  return getLotteryGroup(code)?.title ?? 'ผลหวยล่าสุด'
}

export function lotteryGroupDescription(code: string): string {
  return getLotteryGroup(code)?.description ?? siteDescription
}

export function baseOpenGraph(path: string, title: string, description: string): Metadata['openGraph'] {
  return {
    type: 'website',
    locale: 'th_TH',
    url: path,
    siteName,
    title,
    description,
    images: '/opengraph-image',
  }
}

export function baseTwitter(title: string, description: string): Metadata['twitter'] {
  return {
    card: 'summary_large_image',
    title,
    description,
    images: '/opengraph-image',
  }
}
