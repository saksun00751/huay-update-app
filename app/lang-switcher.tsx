'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LANGS, LANG_LABEL, LANG_FLAG, type Lang } from '@/lib/i18n'

export default function LangSwitcher({ lang, onChange }: { lang: Lang; onChange?: (l: Lang) => void }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (!open || !btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    setCoords({ top: rect.bottom + 6, right: window.innerWidth - rect.right })
  }, [open])
  const languageHref = useCallback((nextLang: Lang) => {
    const pathWithoutLang = pathname.replace(/^\/(th|en|la|kh)(?=\/|$)/, '') || '/'
    const prefix = `/${nextLang}`
    if (
      /^\/lottery\/\d{4}-\d{2}-\d{2}$/.test(pathWithoutLang) ||
      /^\/lottery\/group\/[^/]+(?:\/\d{4}-\d{2}-\d{2})?$/.test(pathWithoutLang) ||
      /^\/market\/[^/]+$/.test(pathWithoutLang)
    ) {
      return `${prefix}${pathWithoutLang}`
    }
    if (pathWithoutLang === '/') return prefix
    return prefix
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node
      if (wrapRef.current?.contains(target) || popRef.current?.contains(target)) return
      setOpen(false)
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
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        ref={btnRef}
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
      {open && coords && typeof document !== 'undefined' && createPortal(
        <div ref={popRef} role="listbox" style={{
          position: 'fixed', top: coords.top, right: coords.right, zIndex: 9999,
          minWidth: 160,
          background: 'rgba(15,15,25,0.98)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--border)', borderRadius: 10,
          boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}>
          {LANGS.map(l => (
            <Link
              key={l}
              role="option"
              aria-selected={l === lang}
              href={languageHref(l)}
              onClick={() => { onChange?.(l); setOpen(false) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', textAlign: 'left',
                background: l === lang ? 'rgba(212,175,55,0.12)' : 'transparent',
                color: l === lang ? '#f5d060' : 'var(--text-2)',
                border: 'none', borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: '0.95rem', fontWeight: 600,
                fontFamily: 'Sarabun,sans-serif',
                textDecoration: 'none',
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
            </Link>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}
