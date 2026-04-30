import type { Metadata, Viewport } from 'next'
import './globals.css'
import { getSiteUrl } from '@/lib/site-url'
import { baseOpenGraph, baseTwitter, siteDescription, siteKeywords, siteName, siteTitle } from '@/lib/seo'

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
  openGraph: baseOpenGraph('/', siteTitle, siteDescription),
  twitter: baseTwitter(siteTitle, siteDescription),
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
