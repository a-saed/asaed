import Link from 'next/link'
import { social } from '@/_data/social'

export function Nav() {
  return (
    <nav className="flex items-center justify-between py-7">
      <Link
        href="/"
        className="text-sm font-medium text-white hover:text-neutral-300 transition-colors"
      >
        Abdulrhman Elsaed
      </Link>
      <div className="flex items-center gap-5">
        <Link href="/writing" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
          Writing
        </Link>
        <Link href="/#projects" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
          Projects
        </Link>
        <a
          href={social.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          GitHub
        </a>
        {process.env.NEXT_PUBLIC_RESUME_LINK && (
          <a
            href={process.env.NEXT_PUBLIC_RESUME_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-400 border border-neutral-800 rounded px-3 py-1.5 hover:border-neutral-600 hover:text-neutral-300 transition-colors"
          >
            Resume ↗
          </a>
        )}
      </div>
    </nav>
  )
}
