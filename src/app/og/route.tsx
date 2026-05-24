import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Abdulrhman Elsaed'

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
            marginBottom: '20px',
          }}
        >
          asaed.me
        </div>
        <div
          style={{
            color: '#e5e5e5',
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: '900px',
          }}
        >
          {title}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
