import { ImageResponse } from 'next/og'
import { siteDescription, siteName } from '@/lib/seo'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#080810',
          color: '#ede9df',
          padding: 72,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 20,
              background: '#d4af37',
              color: '#1a1000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 52,
              fontWeight: 800,
            }}
          >
            H
          </div>
          <div style={{ fontSize: 42, fontWeight: 800, color: '#f5d060' }}>{siteName}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.08 }}>
            ตรวจหวยล่าสุด
          </div>
          <div style={{ marginTop: 24, maxWidth: 940, fontSize: 32, lineHeight: 1.45, color: '#c9c4b6' }}>
            {siteDescription}
          </div>
        </div>

        <div style={{ fontSize: 28, color: '#d4af37' }}>
          huayupdate.live
        </div>
      </div>
    ),
    size,
  )
}
