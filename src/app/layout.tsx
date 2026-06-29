import './globals.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { SITE_URL, OG_VERSION } from '@/utils/site'

const ogImage = `/og?v=${OG_VERSION}`

const title = 'Abdulrhman Elsaed — Full-Stack Engineer'
const description =
  'Full-stack engineer and team lead. I build open-source projects in Go, TypeScript, and spatial systems, and write about the problems behind them.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  authors: [{ name: 'Abdulrhman Elsaed', url: SITE_URL }],
  creator: 'Abdulrhman Elsaed',
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Abdulrhman Elsaed',
    title,
    description,
    locale: 'en_US',
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        type: 'image/png',
        alt: title,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [ogImage],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans bg-[#0a0a0a] text-neutral-200 min-h-screen">
        {children}
      </body>
    </html>
  )
}
