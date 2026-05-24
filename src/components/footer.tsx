import Link from 'next/link'
import { social } from '@/_data/social'

export function Footer() {
  return (
    <footer className="py-10 mt-16 border-t border-neutral-900">
      <div className="flex items-center justify-between">
        <div className="flex gap-5">
          <a
            href={social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            GitHub
          </a>
          {social.twitter && (
            <a
              href={social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              X
            </a>
          )}
          {social.linkedin && (
            <a
              href={social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
            >
              LinkedIn
            </a>
          )}
          <a
            href="/rss.xml"
            className="text-xs text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            RSS
          </a>
        </div>
        <Link
          href="/terminal"
          className="font-mono text-xs text-neutral-700 hover:text-neutral-500 transition-colors"
        >
          [terminal]
        </Link>
      </div>
    </footer>
  )
}
