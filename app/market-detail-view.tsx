import Link from 'next/link'
import { ChevronLeft, X } from 'lucide-react'
import { type Dict, LANG_LOCALE, LANGS, LANG_FLAG, LANG_LABEL, type Lang } from '@/lib/i18n'
import type { MarketDetailResponse, MarketResult } from '@/lib/lottery-api'

type MarketShell = {
  market_id?: number
  market_name: string
  market_logo?: string
}

function fullDate(s: string, lang: Lang) {
  return new Date(`${s}T12:00:00`).toLocaleDateString(LANG_LOCALE[lang], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function fmtTime(s: string | null) {
  const match = s?.match(/\b(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : ''
}

export function MarketDetailPanel({
  market,
  detail,
  loading = false,
  accentColor,
  accentHighlight,
  t,
  lang,
  onClose,
  asModal = false,
  backHref,
}: {
  market: MarketShell
  detail: MarketDetailResponse | null
  loading?: boolean
  accentColor: string
  accentHighlight: string
  t: Dict
  lang: Lang
  onClose?: () => void
  asModal?: boolean
  backHref?: string
}) {
  const m = detail?.data?.market
  const latest = detail?.data?.latest_result
  const history = detail?.data?.history ?? []

  return (
    <div
      className={asModal ? 'market-detail-card modal-mode' : 'market-detail-card page-mode'}
      style={{
        background: `linear-gradient(180deg, ${accentColor}0a 0%, var(--bg) 60%)`,
        borderColor: `${accentColor}30`,
        boxShadow: asModal ? `0 20px 60px ${accentColor}25` : `0 20px 60px ${accentColor}18`,
      }}
    >
      <div className="market-detail-head">
        {backHref && (
          <Link href={backHref} className="market-detail-back" aria-label="กลับหน้าแรก">
            <ChevronLeft size={16} />
          </Link>
        )}
        {market.market_logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={market.market_logo} alt="" className="market-detail-logo" />
        )}
        <div className="market-detail-title">
          <h1>{m?.name ?? market.market_name}</h1>
          <p>{m?.group_name ?? ''}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="market-detail-close" aria-label="ปิด">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="market-detail-body">
        {loading && (
          <div className="market-detail-loading">
            <div className="skeleton" style={{ height: 140 }} />
            <div className="skeleton" style={{ height: 24, width: 120 }} />
            {Array(5).fill(0).map((_, i) => <div key={i} className="skeleton" style={{ height: 56 }} />)}
          </div>
        )}

        {!loading && detail && !detail.success && (
          <div className="market-detail-error">
            ⚠️ {detail.error ?? detail.message ?? t.loadFail}
          </div>
        )}

        {!loading && detail?.success && (
          <>
            {latest && (
              <LatestResultBlock
                result={latest}
                accentColor={accentColor}
                accentHighlight={accentHighlight}
                t={t}
                lang={lang}
              />
            )}

            <div className="market-detail-history">
              <div className="market-detail-history-head">
                <h2 style={{ color: accentColor }}>{t.history}</h2>
                <div style={{ background: `linear-gradient(90deg, ${accentColor}30, transparent)` }} />
                <span>{history.length} {t.draws}</span>
              </div>
              <div className="market-detail-history-list">
                {history.map(h => (
                  <HistoryRow
                    key={h.draw_id}
                    result={h}
                    accentColor={accentColor}
                    accentHighlight={accentHighlight}
                    t={t}
                    lang={lang}
                    card={!asModal}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function LatestResultBlock({ result, accentColor, accentHighlight, t, lang }: { result: MarketResult; accentColor: string; accentHighlight: string; t: Dict; lang: Lang }) {
  const rn = result.result_number
  const noResult = rn?.no_result === true
  const firstPrize = result.first_prize || rn?.first_prize || ''
  const top3 = result.result_top_3 || rn?.top_3 || ''
  const top2 = result.result_top_2 || rn?.top_2 || ''
  const bottom2 = result.result_bottom_2 || rn?.bottom_2 || ''

  return (
    <div className="market-detail-latest" style={{
      background: `linear-gradient(135deg, ${accentColor}10 0%, rgba(8,8,16,0.5) 70%)`,
      borderColor: `${accentColor}25`,
    }}>
      <div className="market-detail-kicker" style={{ color: accentColor }}>{t.latest}</div>
      <div className="market-detail-date">
        📅 {fullDate(result.draw_date, lang)}
        <span> · {fmtTime(result.result_at)} {t.hourSuffix}</span>
      </div>

      {noResult ? (
        <div className="market-detail-no-result">
          {rn?.label ?? t.noResult}
        </div>
      ) : (
        <div className="market-detail-history-card-body">
          {firstPrize && firstPrize.length > 3 && (
            <div className="market-detail-history-first-prize">
              <span>{t.firstPrize}</span>
              <strong style={{
                background: `linear-gradient(130deg, #f5d060, ${accentColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>{firstPrize}</strong>
            </div>
          )}
          <div className="market-detail-history-card-numbers">
            <HistoryCell label={t.top3} value={top3} accentColor={accentColor} accentHighlight={accentHighlight} boxed />
            <HistoryCell label={t.top2Short} value={top2} accentColor={accentColor} accentHighlight={accentHighlight} boxed />
            <HistoryCell label={t.bottom2Short} value={bottom2} accentColor={accentColor} accentHighlight={accentHighlight} boxed />
          </div>
        </div>
      )}
    </div>
  )
}

function HistoryRow({ result, accentColor, accentHighlight, t, lang, card = false }: { result: MarketResult; accentColor: string; accentHighlight: string; t: Dict; lang: Lang; card?: boolean }) {
  const rn = result.result_number
  const noResult = rn?.no_result === true
  const firstPrize = result.first_prize || rn?.first_prize || ''
  const top3 = result.result_top_3 || rn?.top_3 || ''
  const top2 = result.result_top_2 || rn?.top_2 || ''
  const bottom2 = result.result_bottom_2 || rn?.bottom_2 || ''

  return (
    <div className={card ? 'market-detail-history-card' : 'market-detail-history-row'}>
      <div className={card ? 'market-detail-history-card-head' : undefined}>
        <div className="market-detail-history-date">{fullDate(result.draw_date, lang)}</div>
        <div className="market-detail-history-time">{fmtTime(result.result_at)} {t.hourSuffix}</div>
      </div>
      {noResult ? (
        <div className="market-detail-history-empty">{rn?.label ?? t.noResult}</div>
      ) : (
        <div className={card ? 'market-detail-history-card-body' : 'market-detail-history-row-numbers'}>
          {card && firstPrize && firstPrize.length > 3 && (
            <div className="market-detail-history-first-prize">
              <span>{t.firstPrize}</span>
              <strong style={{
                background: `linear-gradient(130deg, #f5d060, ${accentColor})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>{firstPrize}</strong>
            </div>
          )}
          <div className={card ? 'market-detail-history-card-numbers' : 'market-detail-history-row-numbers-inner'}>
            <HistoryCell label={card ? t.top3 : t.top3Short} value={top3} accentColor={accentColor} accentHighlight={accentHighlight} boxed={card} />
            <HistoryCell label={card ? t.top2Short : t.top2Short} value={top2} accentColor={accentColor} accentHighlight={accentHighlight} boxed={card} />
            <HistoryCell label={card ? t.bottom2Short : t.bottom2Short} value={bottom2} accentColor={accentColor} accentHighlight={accentHighlight} boxed={card} />
          </div>
        </div>
      )}
    </div>
  )
}

function HistoryCell({ label, value, accentColor, accentHighlight, boxed = false }: { label: string; value: string; accentColor: string; accentHighlight: string; boxed?: boolean }) {
  return (
    <div className={boxed ? 'market-detail-history-cell boxed' : 'market-detail-history-cell'}>
      <div>{label}</div>
      <strong style={{
        background: `linear-gradient(130deg, #f5d060, ${accentColor})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>{value || '—'}</strong>
    </div>
  )
}
