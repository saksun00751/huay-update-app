export interface ResultNumber {
  no_result?: boolean
  status?: string
  label?: string
  no_result_reason?: string
  manual_cancelled_all_tickets?: boolean
  first_prize?: string
  last_2_digits?: string
  top_3?: string
  top_2?: string
  bottom_2?: string
}
export interface MarketResult {
  draw_id: number
  draw_date: string
  result_at: string | null
  status: string
  result_number: ResultNumber | null
  result_top_3: string
  result_top_2: string
  result_bottom_2: string
  first_prize: string
  last_2_digits: string
}
export interface Market {
  market_id: number
  market_name: string
  market_logo: string
  market_icon: string
  result: MarketResult | null
}
export interface Group {
  group_id: number
  group_code: string
  group_name: string
  markets: Market[]
}
export interface MarketDetailResponse {
  success: boolean
  data?: {
    market: { id: number; name: string; group_id: number; group_name: string; logo: string; icon: string }
    latest_result: MarketResult | null
    history: MarketResult[]
    pagination?: { page: number; limit: number; count: number; total: number; has_more: boolean }
  }
  message?: string
  error?: string
}
export interface LotteryByDateResponse {
  success: boolean
  data?: {
    draw_date: string
    groups: Group[]
    summary?: { group_count: number; market_count: number; result_count: number }
  }
  message?: string
  error?: string
}

export function todayBangkok(): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit',
  })
  return fmt.format(new Date())
}

export async function fetchLotteryByDate(date: string, lang: string = 'th'): Promise<LotteryByDateResponse> {
  const url = `https://api.1168lot.com/api/v1/lotto/results/by-date?date=${encodeURIComponent(date)}`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0',
      'X-Language': lang,
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export async function fetchMarketResults(id: string, lang: string = 'th'): Promise<MarketDetailResponse> {
  const url = `https://api.1168lot.com/api/v1/lotto/markets/${encodeURIComponent(id)}/results`
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0',
      'X-Language': lang,
    },
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
