import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { posts } from '@/.velite'
import { SITE_URL } from '@/utils/site'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { MDXContent } from '@/components/mdx-content'

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slugParam }))
}

export function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Metadata {
  const post = posts.find((p) => p.slugParam === params.slug)
  if (!post) return {}
  const url = `${SITE_URL}/writing/${post.slugParam}`
  const ogImage = `/og?title=${encodeURIComponent(post.title)}`
  return {
    title: `${post.title} — Abdulrhman Elsaed`,
    description: post.description,
    openGraph: {
      type: 'article',
      url,
      title: post.title,
      description: post.description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  }
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const post = posts.find((p) => p.slugParam === params.slug)
  if (!post) notFound()

  if (post.hashnodeSlug) {
    redirect(`https://apdoelsaed.hashnode.dev/${post.hashnodeSlug}`)
  }

  return (
    <div className="max-w-[680px] mx-auto px-6">
      <Nav />
      <article className="py-12">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white leading-snug mb-3">
            {post.title}
          </h1>
          <div className="flex gap-3 text-xs text-neutral-500 font-mono">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
        <div className="prose prose-invert prose-neutral max-w-none prose-sm prose-headings:font-sans prose-code:font-mono">
          <MDXContent code={post.content} />
        </div>
      </article>
      <Footer />
    </div>
  )
}
