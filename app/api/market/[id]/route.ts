import { NextResponse } from 'next/server'
import { isLang } from '@/lib/i18n'

export async function GET(req: Request, ctx: RouteContext<'/api/market/[id]'>) {
  const { id } = await ctx.params
  const { searchParams } = new URL(req.url)
  const langParam = searchParams.get('lang')
  const lang = isLang(langParam) ? langParam : 'th'

  const url = `https://api.1168lot.com/api/v1/lotto/markets/${encodeURIComponent(id)}/results`

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0',
        'X-Language': lang,
      },
    })
    if (!res.ok) {
      const text = await res.text().catch(() => null)
      return NextResponse.json({ error: `HTTP ${res.status}`, details: text }, { status: 500 })
    }
    return NextResponse.json(await res.json())
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
