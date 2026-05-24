import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { WritingList } from '@/components/writing-list'

export const metadata: Metadata = {
  title: 'Writing — Abdulrhman Elsaed',
  description: 'Articles on software engineering and things I learn along the way.',
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
