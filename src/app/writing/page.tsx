import type { Metadata } from 'next'
import { SITE_URL, OG_VERSION } from '@/utils/site'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { WritingList } from '@/components/writing-list'

const title = 'Writing — Abdulrhman Elsaed'
const description =
  'Articles on software engineering and things I learn along the way.'
const ogImage = `/og?title=Writing&sub=${encodeURIComponent(
  'I write here when something won’t stop bothering me.'
)}&v=${OG_VERSION}`

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    type: 'website',
    url: `${SITE_URL}/writing`,
    title,
    description,
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [ogImage],
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
