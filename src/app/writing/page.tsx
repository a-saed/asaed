import type { Metadata } from 'next'
import { SITE_URL } from '@/utils/site'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { WritingList } from '@/components/writing-list'

const title = 'Writing — Abdulrhman Elsaed'
const description =
  'Articles on software engineering and things I learn along the way.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/writing`,
    title,
    description,
    images: ['/og?title=Writing&sub=I%20write%20here%20when%20something%20won%E2%80%99t%20stop%20bothering%20me.'],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/og?title=Writing&sub=I%20write%20here%20when%20something%20won%E2%80%99t%20stop%20bothering%20me.'],
  },
}

export default function WritingPage() {
  return (
    <div className="max-w-[680px] mx-auto px-6">
      <Nav />
      <div className="py-12">
        <h1 className="text-lg font-semibold text-white mb-2">Writing</h1>
        <p className="text-sm text-neutral-500 mb-10">
          Articles on software engineering and things I learn along the way.
        </p>
        <WritingList />
      </div>
      <Footer />
    </div>
  )
}
