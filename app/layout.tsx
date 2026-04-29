import type { Metadata, Viewport } from 'next'
import './globals.css'
import { getSiteUrl } from '@/lib/site-url'

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

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  category: 'lottery',
  keywords: siteKeywords,
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  formatDetection: { telephone: false, email: false, address: false },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'th_TH',
    url: '/',
    siteName,
    title: siteTitle,
    description: siteDescription,
    images: '/logo.png',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteTitle,
    description: siteDescription,
    images: '/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#080810',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        {children}
      </body>
    </html>
  )
}
