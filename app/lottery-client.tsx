'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  RefreshCw, ChevronLeft, ChevronRight,
  TrendingUp, Globe, Flag, Clock, LayoutGrid, X,
} from 'lucide-react'
import { DICT, LANGS, LANG_LABEL, LANG_FLAG, isLang, type Lang, type Dict } from '@/lib/i18n'

/* ─── Types matching the 1168lot API ─── */
interface ResultNumber {
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
interface MarketResult {
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
interface Market {
  market_id: number
  market_name: string
  market_logo: string
  market_icon: string
  result: MarketResult | null
}
interface Group {
  group_id: number
  group_code: string
  group_name: string
  markets: Market[]
}
interface ApiResponse {
  success: boolean
  data?: {
    draw_date: string
    groups: Group[]
    summary?: { group_count: number; market_count: number; result_count: number }
  }
  message?: string
  error?: string
}
interface MarketDetailResponse {
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

/* ─── Group meta — keyed by group_code ─── */
const GROUP_META: Record<string, { icon: React.ReactNode; color: string; cls: string }> = {
  'lotto-thai':          { icon: <Flag size={13} />,       color: '#d4af37', cls: 'gt-thai' },
  'lotto-international': { icon: <Globe size={13} />,      color: '#60a5fa', cls: 'gt-foreign' },
  'lotto-stock':         { icon: <TrendingUp size={13} />,  color: '#4ade80', cls: 'gt-stock' },
  'lotto-daily':         { icon: <Clock size={13} />,       color: '#a78bfa', cls: 'gt-daily' },
}
const FALLBACK_META = { icon: <LayoutGrid size={13} />, color: '#d4af37', cls: 'gt-thai' }
const metaFor = (code: string) => GROUP_META[code] ?? FALLBACK_META
const GROUP_EMOJI: Record<string, string> = {
  'lotto-thai': '🇹🇭',
  'lotto-international': '🌍',
  'lotto-stock': '📈',
  'lotto-daily': '🕘',
}
const emojiForGroup = (code: string) => GROUP_EMOJI[code] ?? '🎲'

const DATE_LABELS: Record<Lang, { monthsShort: string[]; monthsLong: string[]; weekdays: string[]; weekdaysShort: string[]; buddhistYear?: boolean }> = {
  th: {
    monthsShort: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
    monthsLong: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
    weekdays: ['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'],
    weekdaysShort: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
    buddhistYear: true,
  },
  en: {
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    monthsLong: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  },
  la: {
    monthsShort: ['ມ.ກ.', 'ກ.ພ.', 'ມ.ນ.', 'ມ.ສ.', 'ພ.ພ.', 'ມິ.ຖ.', 'ກ.ລ.', 'ສ.ຫ.', 'ກ.ຍ.', 'ຕ.ລ.', 'ພ.ຈ.', 'ທ.ວ.'],
    monthsLong: ['ມັງກອນ', 'ກຸມພາ', 'ມີນາ', 'ເມສາ', 'ພຶດສະພາ', 'ມິຖຸນາ', 'ກໍລະກົດ', 'ສິງຫາ', 'ກັນຍາ', 'ຕຸລາ', 'ພະຈິກ', 'ທັນວາ'],
    weekdays: ['ວັນອາທິດ', 'ວັນຈັນ', 'ວັນອັງຄານ', 'ວັນພຸດ', 'ວັນພະຫັດ', 'ວັນສຸກ', 'ວັນເສົາ'],
    weekdaysShort: ['ອາ', 'ຈ', 'ອັ', 'ພ', 'ພຫ', 'ສຸ', 'ສ'],
  },
  kh: {
    monthsShort: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'],
    monthsLong: ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'],
    weekdays: ['ថ្ងៃអាទិត្យ', 'ថ្ងៃចន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍'],
    weekdaysShort: ['អា', 'ច', 'អ', 'ពុ', 'ព្រ', 'សុ', 'សៅ'],
  },
}

/* ─── Helpers ─── */
function toLocalDateStr(d: Date) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
function addDays(s: string, n: number) {
  const d = new Date(s + 'T12:00:00'); d.setDate(d.getDate() + n); return toLocalDateStr(d)
}
function addMonths(s: string, n: number) {
  const d = new Date(s + 'T12:00:00'); d.setMonth(d.getMonth() + n, 1); return toLocalDateStr(d)
}
function dateParts(s: string) {
  const d = new Date(s + 'T12:00:00')
  return { date: d, day: d.getDate(), month: d.getMonth(), year: d.getFullYear() }
}
function shortDate(s: string, lang: Lang) {
  const { day, month, year } = dateParts(s)
  const labels = DATE_LABELS[lang]
  const displayYear = labels.buddhistYear ? year + 543 : year
  const shortYear = String(displayYear).slice(-2)
  return lang === 'en'
    ? `${labels.monthsShort[month]} ${day}, ${shortYear}`
    : `${day} ${labels.monthsShort[month]} ${shortYear}`
}
function fullDate(s: string, lang: Lang) {
  const { date, day, month, year } = dateParts(s)
  const labels = DATE_LABELS[lang]
  const displayYear = labels.buddhistYear ? year + 543 : year
  if (lang === 'en') return `${labels.weekdays[date.getDay()]}, ${labels.monthsLong[month]} ${day}, ${displayYear}`
  if (lang === 'th') return `${labels.weekdays[date.getDay()]}ที่ ${day} ${labels.monthsLong[month]} ${displayYear}`
  return `${labels.weekdays[date.getDay()]} ${day} ${labels.monthsLong[month]} ${displayYear}`
}
function fmtTime(s: string | null, lang: Lang) {
  if (!s) return ''
  const match = s.match(/\b(\d{2}):(\d{2})/)
  if (!match) return ''
  const [, hour, minute] = match
  return lang === 'en' ? `${hour}:${minute}` : `${hour}:${minute}`
}

/* ──────────────────────────────────────────── */
export default function LotteryApp({ initialData, initialDate, initialLang }: {
  initialData?: ApiResponse | null
  initialDate?: string
  initialLang?: Lang
} = {}) {
  const [today, setToday] = useState(() => initialDate ?? toLocalDateStr(new Date()))
  const [date, setDate] = useState(today)
  const [lang, setLang] = useState<Lang>(initialLang ?? 'th')
  const t: Dict = DICT[lang]

  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = window.localStorage.getItem('lang')
    if (isLang(stored) && stored !== lang) {
      setLang(stored)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeLang = useCallback((l: Lang) => {
    setLang(l)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('lang', l)
      document.cookie = `lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}`
    }
  }, [])

  useEffect(() => {
    const tick = () => {
      const now = toLocalDateStr(new Date())
      setToday(prev => (prev === now ? prev : now))
    }
    const id = setInterval(tick, 30_000)
    const onVisible = () => { if (document.visibilityState === 'visible') tick() }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])
  const [activeGroupCode, setActiveGroupCode] = useState<string>('all')
  const [data, setData] = useState<ApiResponse | null>(initialData ?? null)
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const skipFirstFetchRef = useRef(!!initialData)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date(today + 'T12:00:00')
    return toLocalDateStr(new Date(d.getFullYear(), d.getMonth(), 1, 12))
  })

  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null)
  const [detail, setDetail] = useState<MarketDetailResponse | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const detailAbortRef = useRef<AbortController | null>(null)

  const fetchData = useCallback(async (d: string, l: Lang) => {
    abortRef.current?.abort()
    const ctrl = new AbortController(); abortRef.current = ctrl
    setLoading(true)
    try {
      const res = await fetch(`/api/lottery?date=${d}&lang=${l}`, { signal: ctrl.signal })
      const json: ApiResponse = await res.json()
      if (abortRef.current === ctrl) setData(json)
    } catch (e: unknown) {
      if (abortRef.current === ctrl && (e as Error).name !== 'AbortError') {
        setData({ success: false, error: t.loadFail })
      }
    } finally {
      if (abortRef.current === ctrl) {
        abortRef.current = null
        setLoading(false)
      }
    }
  }, [t.loadFail])

  useEffect(() => {
    if (skipFirstFetchRef.current) { skipFirstFetchRef.current = false; return }
    fetchData(date, lang)
  }, [date, lang, fetchData])

  const openMarket = useCallback((market: Market) => {
    setSelectedMarket(market)
    setDetail(null)
    detailAbortRef.current?.abort()
    const ctrl = new AbortController(); detailAbortRef.current = ctrl
    setDetailLoading(true)
    fetch(`/api/market/${market.market_id}?lang=${lang}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then((j: MarketDetailResponse) => {
        if (detailAbortRef.current === ctrl) setDetail(j)
      })
      .catch((e: unknown) => {
        if (detailAbortRef.current === ctrl && (e as Error).name !== 'AbortError') {
          setDetail({ success: false, error: t.loadFail })
        }
      })
      .finally(() => {
        if (detailAbortRef.current === ctrl) {
          detailAbortRef.current = null
          setDetailLoading(false)
        }
      })
  }, [lang, t.loadFail])

  const closeMarket = useCallback(() => {
    detailAbortRef.current?.abort()
    setSelectedMarket(null)
    setDetail(null)
  }, [])

  useEffect(() => {
    if (!selectedMarket) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMarket() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [selectedMarket, closeMarket])

  const isToday = date === today
  const groups = data?.data?.groups ?? []
  const visibleGroups = activeGroupCode === 'all' ? groups : groups.filter(g => g.group_code === activeGroupCode)
  const totalMarkets = groups.reduce((s, g) => s + g.markets.length, 0)
  const resultCount = groups.reduce(
    (s, g) => s + g.markets.filter(m => m.result?.result_number && !m.result.result_number.no_result).length,
    0,
  )

  const calendar = useMemo(() => {
    const base = new Date(calendarMonth + 'T12:00:00')
    const year = base.getFullYear()
    const month = base.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells: (string | null)[] = Array(firstDay).fill(null)

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(toLocalDateStr(new Date(year, month, day, 12)))
    }

    while (cells.length % 7 !== 0) cells.push(null)

    return {
      cells,
      title: `${DATE_LABELS[lang].monthsLong[month]} ${DATE_LABELS[lang].buddhistYear ? year + 543 : year}`,
      canGoNext: addMonths(calendarMonth, 1) <= toLocalDateStr(new Date(new Date(today + 'T12:00:00').getFullYear(), new Date(today + 'T12:00:00').getMonth(), 1, 12)),
    }
  }, [calendarMonth, lang, today])

  const openCalendar = useCallback(() => {
    const d = new Date(date + 'T12:00:00')
    setCalendarMonth(toLocalDateStr(new Date(d.getFullYear(), d.getMonth(), 1, 12)))
    setDatePickerOpen(open => !open)
  }, [date])

  const closeCalendar = useCallback(() => {
    setDatePickerOpen(false)
  }, [])

  const selectCalendarDate = useCallback((value: string) => {
    setDate(value)
    setDatePickerOpen(false)
  }, [])

  const dateDisplay = shortDate(date, lang)

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* HEADER */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,8,16,0.94)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212,175,55,0.1)',
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 16px' }}>
          <div className="header-bar">

            <div className="header-brand" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: 'rgba(212,175,55,0.08)',
                border: '1px solid rgba(212,175,55,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logo.png"
                  alt="Huay Update"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
              <div>
                <div className="font-th" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f5d060', lineHeight: 1.1 }}>{t.brand}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-3)', lineHeight: 1 }}>
                  {t.tagline}
                </div>
              </div>

            </div>

            <div className="header-date" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="header-lang-desktop">
                <LangSwitcher lang={lang} onChange={changeLang} />
              </div>
              <div className="date-group">
                <button className="date-nav-btn" onClick={() => setDate(d => addDays(d, -1))}><ChevronLeft size={14} /></button>
                <div style={{ cursor: 'pointer', position: 'relative', display: 'block' }}>
                  <button
                    type="button"
                    onClick={openCalendar}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '6px 11px',
                      cursor: 'pointer',
                    }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-2)', fontFamily: 'Sarabun,sans-serif', userSelect: 'none', whiteSpace: 'nowrap' }}>
                      {dateDisplay}
                    </span>
                  </button>
                </div>
                <button className="date-nav-btn" onClick={() => setDate(d => addDays(d, 1))} disabled={isToday}><ChevronRight size={14} /></button>
              </div>

              <button
                className="refresh-btn"
                onClick={() => fetchData(date, lang)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)',
                }}
              ><RefreshCw size={13} className={loading ? 'spinning' : ''} /></button>
            </div>
          </div>

          {/* group tabs */}
          <div style={{ display: 'flex', gap: 4, paddingBottom: 8, overflowX: 'auto' }}>
            <button
              className={`group-tab gt-thai ${activeGroupCode === 'all' ? 'active' : ''}`}
              onClick={() => setActiveGroupCode('all')}
              style={activeGroupCode === 'all' ? { color: '#d4af37' } : {}}
            >
              <LayoutGrid size={13} /> {t.all}
            </button>
            {groups.map(g => {
              const m = metaFor(g.group_code)
              const isActive = activeGroupCode === g.group_code
              return (
                <button key={g.group_code}
                  className={`group-tab ${m.cls} ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveGroupCode(g.group_code)}
                  style={isActive ? { color: m.color } : {}}
                >
                  <span style={{ color: isActive ? m.color : undefined }}>{m.icon}</span>
                  {g.group_name}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {datePickerOpen && (
        <div className="calendar-overlay" onClick={closeCalendar}>
          <div className="calendar-popover" onClick={e => e.stopPropagation()}>
            <div className="calendar-head">
              <button type="button" className="date-nav-btn" onClick={() => setCalendarMonth(m => addMonths(m, -1))}>
                <ChevronLeft size={14} />
              </button>
              <div className="calendar-title">{calendar.title}</div>
              <button
                type="button"
                className="date-nav-btn"
                onClick={() => setCalendarMonth(m => addMonths(m, 1))}
                disabled={!calendar.canGoNext}
              >
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="calendar-grid calendar-weekdays">
              {DATE_LABELS[lang].weekdaysShort.map(day => (
                <div key={day}>{day}</div>
              ))}
            </div>
            <div className="calendar-grid">
              {calendar.cells.map((cell, index) => {
                const disabled = !cell || cell > today
                return (
                  <button
                    key={cell ?? `blank-${index}`}
                    type="button"
                    className={`calendar-day ${cell === date ? 'active' : ''}`}
                    disabled={disabled}
                    onClick={() => cell && selectCalendarDate(cell)}
                  >
                    {cell ? new Date(cell + 'T12:00:00').getDate() : ''}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* BODY */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 16px', flex: 1, width: '100%' }}>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h2 className="font-th" style={{ fontSize: '1.3rem', fontWeight: 700, lineHeight: 1.1 }}>
              {t.todayResults}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', marginTop: 3 }}>📅 {fullDate(date, lang)}</p>
          </div>
          {loading ? (
            <div className="skeleton" style={{ width: 112, height: 28, borderRadius: 20, flexShrink: 0 }} />
          ) : totalMarkets > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 20, flexShrink: 0,
              background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.18)',
              fontSize: '0.875rem', fontWeight: 500, color: 'var(--green)',
            }}>
              <div className="pulse-dot" style={{ background: 'var(--green)' }} />
              {resultCount} / {totalMarkets} {t.hasResult}
            </div>
          )}
        </div>

        {loading && (
          <ResultsSkeleton />
        )}

        {!loading && data && !data.success && (
          <div style={{ padding: '40px 24px', textAlign: 'center', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 16 }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>⚠️</div>
            <p className="font-th" style={{ color: '#f87171' }}>{data.error ?? data.message ?? t.loadFail}</p>
          </div>
        )}

        {!loading && data?.success && visibleGroups.length === 0 && (
          <div style={{ padding: '64px 24px', textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 18 }}>
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
            <p className="font-th" style={{ fontSize: '1.05rem', color: 'var(--text-2)' }}>{t.notFound}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', marginTop: 6 }}>{t.tryOther}</p>
          </div>
        )}

        {!loading && data?.success && visibleGroups.map(g => {
          const m = metaFor(g.group_code)
          return (
            <div key={g.group_code} style={{ marginBottom: 36 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 12px', borderRadius: 12,
                  background: `linear-gradient(135deg, ${m.color}18, ${m.color}06)`,
                  border: `1px solid ${m.color}40`,
                }}>
                  <h3 className="font-th" style={{
                    fontSize: '1.5rem', fontWeight: 700,
                    lineHeight: 1,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span>{emojiForGroup(g.group_code)}</span>
                    <span style={{ color: m.color }}>{g.group_name}</span>
                  </h3>
                </div>
                <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${m.color}50, transparent)`, borderRadius: 1 }} />
                <span style={{
                  fontSize: '0.95rem', color: m.color, fontFamily: 'Kanit,sans-serif', fontWeight: 600,
                  padding: '4px 10px', borderRadius: 8,
                  background: `${m.color}12`, border: `1px solid ${m.color}30`,
                }}>
                  {g.markets.filter(mk => mk.result?.result_number && !mk.result.result_number.no_result).length}/{g.markets.length}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
                {g.markets.map((mk, idx) => (
                  <MarketCard key={mk.market_id} market={mk} accentColor={m.color} index={idx} t={t} lang={lang} onClick={() => openMarket(mk)} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selectedMarket && (
        <MarketDetailModal
          market={selectedMarket}
          accentColor={metaFor(groups.find(g => g.markets.some(mk => mk.market_id === selectedMarket.market_id))?.group_code ?? '').color}
          detail={detail}
          loading={detailLoading}
          onClose={closeMarket}
          t={t}
          lang={lang}
        />
      )}
    </div>
  )
}

/* ─── Language Switcher (single button + popover) ─── */
function LangSwitcher({ lang, onChange }: { lang: Lang; onChange: (l: Lang) => void }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} style={{ position: 'relative', marginLeft: 'auto' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '6px 10px', borderRadius: 8,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text-2)', cursor: 'pointer',
          fontSize: '0.875rem', fontWeight: 600,
          fontFamily: 'Sarabun,sans-serif',
        }}
      >
        <span style={{ fontSize: '1rem' }}>{LANG_FLAG[lang]}</span>
        <span>{LANG_LABEL[lang]}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div role="listbox" style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 60,
          minWidth: 160,
          background: 'rgba(15,15,25,0.98)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--border)', borderRadius: 10,
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          animation: 'fadeIn 0.12s ease',
        }}>
          {LANGS.map(l => (
            <button
              key={l}
              role="option"
              aria-selected={l === lang}
              onClick={() => { onChange(l); setOpen(false) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', textAlign: 'left',
                background: l === lang ? 'rgba(212,175,55,0.12)' : 'transparent',
                color: l === lang ? '#f5d060' : 'var(--text-2)',
                border: 'none', borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: '0.95rem', fontWeight: 600,
                fontFamily: 'Sarabun,sans-serif',
              }}
              onMouseEnter={e => { if (l !== lang) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (l !== lang) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ fontSize: '1.1rem' }}>{LANG_FLAG[l]}</span>
              <span style={{ flex: 1 }}>{LANG_LABEL[l]}</span>
              {l === lang && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Market Card ─── */
function ResultsSkeleton() {
  return (
    <div aria-hidden="true">
      {Array.from({ length: 3 }).map((_, groupIndex) => (
        <div key={groupIndex} style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div className="skeleton" style={{ width: 168, height: 42, borderRadius: 12 }} />
            <div className="skeleton" style={{ flex: 1, height: 2, borderRadius: 1 }} />
            <div className="skeleton" style={{ width: 54, height: 30, borderRadius: 8 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {Array.from({ length: 6 }).map((__, cardIndex) => (
              <div
                key={cardIndex}
                style={{
                  minHeight: 166,
                  borderRadius: 14,
                  padding: '14px 16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="skeleton" style={{ width: '68%', height: 16, borderRadius: 6, marginBottom: 8 }} />
                    <div className="skeleton" style={{ width: 74, height: 13, borderRadius: 6 }} />
                  </div>
                  <div className="skeleton" style={{ width: 92, height: 26, borderRadius: 8, flexShrink: 0 }} />
                </div>

                <div className="skeleton" style={{ height: 40, borderRadius: 9, marginBottom: 12 }} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                  <div className="skeleton" style={{ height: 78, borderRadius: 10 }} />
                  <div className="skeleton" style={{ height: 78, borderRadius: 10 }} />
                  <div className="skeleton" style={{ height: 78, borderRadius: 10 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function MarketCard({ market, accentColor, index, t, lang, onClick }: { market: Market; accentColor: string; index: number; t: Dict; lang: Lang; onClick: () => void }) {
  const r = market.result
  const rn = r?.result_number
  const noResult = rn?.no_result === true
  const hasResult = !!rn && !noResult
  const top3 = r?.result_top_3 || rn?.top_3 || ''
  const top2 = r?.result_top_2 || rn?.top_2 || ''
  const bottom2 = r?.result_bottom_2 || rn?.bottom_2 || ''
  const firstPrize = r?.first_prize || rn?.first_prize || ''

  return (
    <div
      style={{
        background: hasResult
          ? `linear-gradient(135deg, ${accentColor}0e 0%, rgba(8,8,16,0.95) 70%)`
          : 'var(--bg-card)',
        border: `1px solid ${hasResult ? accentColor + '25' : 'var(--border)'}`,
        borderRadius: 14, padding: '14px 16px',
        animation: `slideUp 0.3s ease ${index * 0.02}s both`,
        position: 'relative', overflow: 'hidden',
        textAlign: 'left', width: '100%', color: 'inherit',
        transition: 'all 0.18s ease',
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = `0 6px 20px ${accentColor}18`
        el.style.borderColor = accentColor + '45'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
        el.style.borderColor = hasResult ? accentColor + '25' : 'var(--border)'
      }}
    >
      <button
        type="button"
        onClick={onClick}
        style={{
          position: 'absolute', top: 10, right: 10, zIndex: 2,
          width: 30, height: 30, borderRadius: 8,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          padding: 0,
          background: `${accentColor}14`,
          border: `1px solid ${accentColor}35`,
          color: accentColor,
          cursor: 'pointer',
          fontSize: '1rem',
        }}
        aria-label={`ดูผลย้อนหลัง ${market.market_name}`}
        title="ดูผลย้อนหลัง"
      >
        🕘
      </button>

      {/* header: logo + name + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingRight: 38 }}>
        {market.market_logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={market.market_logo} alt="" style={{
            width: 36, height: 36, borderRadius: 9, objectFit: 'cover',
            border: '1px solid var(--border)', flexShrink: 0,
          }} />
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="font-th" style={{
            fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{market.market_name}</div>
          {r?.result_at && (
            <div style={{ fontSize: '0.875rem', color: 'var(--text-3)', marginTop: 3 }}>
              {fmtTime(r.result_at, lang)} {t.hourSuffix}
            </div>
          )}
        </div>
      </div>

      {/* body */}
      {noResult ? (
        <div style={{
          padding: '16px 10px', textAlign: 'center',
          color: '#f87171', fontSize: '0.95rem', fontFamily: 'Kanit,sans-serif', fontWeight: 600,
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10,
          marginTop: 'auto',
        }}>
          {rn?.label ?? t.noResult}
        </div>
      ) : hasResult ? (
        <div style={{ marginTop: 'auto' }}>
          {firstPrize && firstPrize.length > 3 && (
            <div style={{
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8,
              padding: '8px 12px', marginBottom: 12,
              background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 9,
            }}>
              <span style={{
                fontSize: '0.875rem', color: 'var(--text-3)', fontFamily: 'Kanit,sans-serif',
                fontWeight: 600, letterSpacing: '0.06em',
              }}>{t.firstPrize}</span>
              <span style={{
                fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: '1.15rem',
                color: 'var(--text)', letterSpacing: '0.06em',
              }}>{firstPrize}</span>
            </div>
          )}

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            alignItems: 'stretch', gap: 8,
          }}>
            <NumberCell label={t.top3} value={top3} accentColor={accentColor} variant="primary" />
            <NumberCell label={t.top2Short} value={top2} accentColor={accentColor} />
            <NumberCell label={t.bottom2Short} value={bottom2} accentColor={accentColor} />
          </div>
        </div>
      ) : (
        <div style={{
          fontSize: '0.95rem', color: 'var(--text-3)',
          fontStyle: 'italic', padding: '18px 4px', textAlign: 'center',
          marginTop: 'auto',
        }}>— {t.notYet} —</div>
      )}
    </div>
  )
}

function NumberCell({ label, value, accentColor, variant }: {
  label: string; value: string; accentColor: string; variant?: 'primary'
}) {
  const isPrimary = variant === 'primary'
  return (
    <div style={{
      padding: '10px 8px 12px',
      background: isPrimary ? `${accentColor}10` : 'rgba(255,255,255,0.025)',
      border: `1px solid ${isPrimary ? accentColor + '30' : 'var(--border)'}`,
      borderRadius: 10, textAlign: 'center',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      minHeight: 78,
    }}>
      <div style={{
        fontSize: '0.875rem', color: 'var(--text-3)', fontFamily: 'Kanit,sans-serif',
        fontWeight: 600, letterSpacing: '0.06em',
      }}>{label}</div>
      <div style={{
        fontFamily: 'Kanit,sans-serif',
        fontWeight: 800,
        fontSize: '1.6rem',
        lineHeight: 1, letterSpacing: '0.05em',
        ...(isPrimary ? {
          background: `linear-gradient(130deg, #f5d060, ${accentColor})`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          filter: `drop-shadow(0 0 8px ${accentColor}30)`,
        } : { color: 'var(--text)' }),
      }}>{value || '—'}</div>
    </div>
  )
}

/* ─── Market Detail Modal ─── */
function MarketDetailModal({ market, accentColor, detail, loading, onClose, t, lang }: {
  market: Market
  accentColor: string
  detail: MarketDetailResponse | null
  loading: boolean
  onClose: () => void
  t: Dict
  lang: Lang
}) {
  const m = detail?.data?.market
  const latest = detail?.data?.latest_result
  const history = detail?.data?.history ?? []

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '40px 16px', overflowY: 'auto',
        animation: 'fadeIn 0.18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 720,
          background: `linear-gradient(180deg, ${accentColor}0a 0%, var(--bg) 60%)`,
          border: `1px solid ${accentColor}30`,
          borderRadius: 18, overflow: 'hidden',
          boxShadow: `0 20px 60px ${accentColor}25`,
        }}
      >
        {/* header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(8,8,16,0.6)',
        }}>
          {market.market_logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={market.market_logo} alt="" style={{
              width: 44, height: 44, borderRadius: 10, objectFit: 'cover',
              border: '1px solid var(--border)',
            }} />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="font-th" style={{
              fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2,
            }}>{m?.name ?? market.market_name}</h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-3)', marginTop: 2 }}>
              {m?.group_name ?? ''}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8,
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-2)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><X size={14} /></button>
        </div>

        {/* body */}
        <div style={{ padding: 20 }}>
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="skeleton" style={{ height: 140 }} />
              <div className="skeleton" style={{ height: 24, width: 120 }} />
              {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 56 }} />)}
            </div>
          )}

          {!loading && detail && !detail.success && (
            <div style={{ padding: '24px', textAlign: 'center', color: '#f87171' }}>
              ⚠️ {detail.error ?? detail.message ?? t.loadFail}
            </div>
          )}

          {!loading && detail?.success && (
            <>
              {/* latest big block */}
              {latest && <LatestResultBlock result={latest} accentColor={accentColor} t={t} lang={lang} />}

              {/* history */}
              <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <h3 className="font-th" style={{ fontSize: '0.875rem', fontWeight: 600, color: accentColor }}>
                    {t.history}
                  </h3>
                  <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${accentColor}30, transparent)` }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>
                    {history.length} {t.draws}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {history.map(h => <HistoryRow key={h.draw_id} result={h} accentColor={accentColor} t={t} lang={lang} />)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function LatestResultBlock({ result, accentColor, t, lang }: { result: MarketResult; accentColor: string; t: Dict; lang: Lang }) {
  const rn = result.result_number
  const noResult = rn?.no_result === true
  const top3 = result.result_top_3 || rn?.top_3 || ''
  const top2 = result.result_top_2 || rn?.top_2 || ''
  const bottom2 = result.result_bottom_2 || rn?.bottom_2 || ''
  const firstPrize = result.first_prize || rn?.first_prize || ''

  return (
    <div style={{
      padding: '20px 18px',
      background: `linear-gradient(135deg, ${accentColor}10 0%, rgba(8,8,16,0.5) 70%)`,
      border: `1px solid ${accentColor}25`,
      borderRadius: 14,
    }}>
      <div style={{
        fontSize: '0.875rem', fontWeight: 700, color: accentColor, opacity: 0.8,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        fontFamily: 'Kanit,sans-serif', marginBottom: 4,
      }}>{t.latest}</div>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: 14 }}>
        {result.draw_date} <span style={{ color: 'var(--text-3)' }}>· {fmtTime(result.result_at, lang)} {t.hourSuffix}</span>
      </div>

      {noResult ? (
        <div style={{
          padding: '20px', textAlign: 'center',
          color: '#f87171', fontSize: '1rem', fontFamily: 'Kanit,sans-serif', fontWeight: 600,
          background: 'rgba(239,68,68,0.06)', borderRadius: 10,
        }}>
          {rn?.label ?? t.noResult}
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'flex-end' }}>
          {firstPrize && firstPrize.length > 3 && (
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-3)', fontFamily: 'Kanit,sans-serif', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>{t.firstPrize}</div>
              <div style={{
                fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: '1.6rem',
                color: 'var(--text)', letterSpacing: '0.05em',
              }}>{firstPrize}</div>
            </div>
          )}
          {top3 && (
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-3)', fontFamily: 'Kanit,sans-serif', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>{t.top3}</div>
              <div style={{
                fontFamily: 'Kanit,sans-serif', fontWeight: 800, fontSize: '2.6rem', lineHeight: 1,
                background: `linear-gradient(130deg, #f5d060, ${accentColor})`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                filter: `drop-shadow(0 0 10px ${accentColor}35)`,
                letterSpacing: '0.06em',
              }}>{top3}</div>
            </div>
          )}
          {top2 && (
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-3)', fontFamily: 'Kanit,sans-serif', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>{t.top2}</div>
              <div style={{
                fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: '1.6rem',
                color: 'var(--text)', letterSpacing: '0.05em',
              }}>{top2}</div>
            </div>
          )}
          {bottom2 && (
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-3)', fontFamily: 'Kanit,sans-serif', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 4 }}>{t.bottom2}</div>
              <div style={{
                fontFamily: 'Kanit,sans-serif', fontWeight: 700, fontSize: '1.6rem',
                color: '#c9c4b6', letterSpacing: '0.05em',
              }}>{bottom2}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function HistoryRow({ result, accentColor, t, lang }: { result: MarketResult; accentColor: string; t: Dict; lang: Lang }) {
  const rn = result.result_number
  const noResult = rn?.no_result === true
  const top3 = result.result_top_3 || rn?.top_3 || ''
  const top2 = result.result_top_2 || rn?.top_2 || ''
  const bottom2 = result.result_bottom_2 || rn?.bottom_2 || ''

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto auto auto',
      alignItems: 'center', gap: 14,
      padding: '10px 14px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
    }}>
      <div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text)', fontFamily: 'Sarabun,sans-serif' }}>
          {result.draw_date}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>
          {fmtTime(result.result_at, lang)} {t.hourSuffix}
        </div>
      </div>
      {noResult ? (
        <div style={{
          gridColumn: '2 / -1', textAlign: 'right',
          color: '#f87171', fontSize: '0.875rem', fontFamily: 'Kanit,sans-serif', fontWeight: 600,
        }}>{rn?.label ?? t.noResult}</div>
      ) : (
        <>
          <HistoryCell label={t.top3Short} value={top3} accentColor={accentColor} large />
          <HistoryCell label={t.top2Short} value={top2} />
          <HistoryCell label={t.bottom2Short} value={bottom2} />
        </>
      )}
    </div>
  )
}

function HistoryCell({ label, value, accentColor, large }: { label: string; value: string; accentColor?: string; large?: boolean }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 50 }}>
      <div style={{ fontSize: '0.875rem', color: 'var(--text-3)', fontFamily: 'Kanit,sans-serif', fontWeight: 600, letterSpacing: '0.08em' }}>{label}</div>
      <div style={{
        fontFamily: 'Kanit,sans-serif',
        fontWeight: large ? 800 : 600,
        fontSize: large ? '1.15rem' : '0.95rem',
        color: large && accentColor ? '#f5d060' : 'var(--text-2)',
        letterSpacing: '0.05em',
        marginTop: 1,
      }}>{value || '—'}</div>
    </div>
  )
}
