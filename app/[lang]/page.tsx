import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import HomePage, { homeMetadata } from '@/app/home-page'
import { isSeoLang, localizedPath } from '@/lib/seo'
import type { Lang } from '@/lib/i18n'

export const revalidate = 60

type PageProps = {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lang } = await params
  if (!isSeoLang(lang)) {
    return {
      title: 'Not found',
      robots: { index: false, follow: false },
    }
  }

  return homeMetadata(lang, localizedPath('/', lang))
}

export default async function LangHomePage({ params }: PageProps) {
  const { lang } = await params
  if (!isSeoLang(lang)) notFound()

  return <HomePage lang={lang as Lang} canonical={localizedPath('/', lang)} />
}
