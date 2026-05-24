import './globals.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

export const metadata: Metadata = {
  title: 'Abdulrhman Elsaed',
  description: 'Full-stack engineer. I build things and write about them.',
  authors: [{ name: 'Abdulrhman Elsaed', url: 'https://asaed.me' }],
  creator: 'Abdulrhman Elsaed',
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
