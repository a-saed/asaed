import { ImageResponse } from 'next/og'
import { SITE_HOST } from '@/utils/site'

export const runtime = 'edge'

// Brand accent — pulled from the teal "AE" monogram so the card reads as one piece.
const ACCENT = '#2dd4bf'
const ABOUT =
  'Rabbit-hole enthusiast by nature. I write here when something won’t stop bothering me.'

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  const subtitle = searchParams.get('sub')
  const logoSrc = new URL('/logo.png', request.url).href

  // Article card: the post title is the hero, with a small logo + name byline.
  if (title) {
    return new ImageResponse(
      (
        <div
          style={{
            backgroundColor: '#0a0a0a',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px 72px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              color: '#555',
              fontSize: '16px',
              letterSpacing: '1px',
              marginBottom: '24px',
            }}
          >
            {SITE_HOST}
          </div>
          <div
            style={{
              color: '#e5e5e5',
              fontSize: '52px',
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: '960px',
            }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              style={{
                color: '#a3a3a3',
                fontSize: '26px',
                lineHeight: 1.4,
                marginTop: '20px',
                maxWidth: '880px',
              }}
            >
              {subtitle}
            </div>
          ) : null}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginTop: '44px',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoSrc} width={40} height={40} alt="" />
            <div style={{ color: '#9a9a9a', fontSize: '24px' }}>
              Abdulrhman Elsaed
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }

  // Brand card (home): logo beside the name, role line, concise about text.
  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '28px',
            marginBottom: '32px',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={104} height={104} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                color: '#fafafa',
                fontSize: '62px',
                fontWeight: 700,
                lineHeight: 1.05,
              }}
            >
              Abdulrhman Elsaed
            </div>
            <div
              style={{
                color: ACCENT,
                fontSize: '30px',
                fontWeight: 500,
                marginTop: '8px',
              }}
            >
              Full-Stack Engineer
            </div>
          </div>
        </div>
        <div
          style={{
            color: '#a3a3a3',
            fontSize: '27px',
            lineHeight: 1.45,
            maxWidth: '920px',
          }}
        >
          {ABOUT}
        </div>
        <div
          style={{
            color: '#555',
            fontSize: '18px',
            letterSpacing: '1px',
            marginTop: '44px',
          }}
        >
          {SITE_HOST}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
