import Link from 'next/link'
import { posts } from '@/.velite'

interface WritingListProps {
  limit?: number
}

export function WritingList({ limit }: WritingListProps) {
  const sorted = [...posts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit ?? posts.length)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xs uppercase tracking-widest text-neutral-500">Writing</h2>
        {limit && (
          <Link
            href="/writing"
            className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            All articles →
          </Link>
        )}
      </div>
      <div className="divide-y divide-neutral-900">
        {sorted.map((post) => (
          <Link
            key={post.slugParam}
            href={post.hashnodeSlug ? `https://apdoelsaed.hashnode.dev/${post.hashnodeSlug}` : post.url}
            target={post.hashnodeSlug ? '_blank' : undefined}
            rel={post.hashnodeSlug ? 'noopener noreferrer' : undefined}
            className="flex justify-between items-baseline py-3 group"
          >
            <span className="text-sm text-neutral-300 group-hover:text-white transition-colors">
              {post.title}
            </span>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              {post.hashnodeSlug && (
                <span className="text-xs text-neutral-700">↗</span>
              )}
              <span className="text-xs text-neutral-600 font-mono">
                {new Date(post.date).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
