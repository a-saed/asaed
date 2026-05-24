import Link from 'next/link'
import Image from 'next/image'
import { social } from '@/_data/social'

export function Nav() {
  return (
    <nav className="flex items-center justify-between py-5">
      <Link href="/" className="opacity-90 hover:opacity-100 transition-opacity">
        <Image src="/logo.png" width={52} height={52} alt="asaed logo" priority />
      </Link>
      <div className="flex items-center gap-3 sm:gap-5">
        <Link href="/writing" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
          Writing
        </Link>
        <Link href="/#projects" className="hidden sm:block text-sm text-neutral-500 hover:text-neutral-300 transition-colors">
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
            className="text-xs text-neutral-400 border border-neutral-800 rounded px-2.5 py-1 sm:px-3 sm:py-1.5 hover:border-neutral-600 hover:text-neutral-300 transition-colors"
          >
            Resume ↗
          </a>
        )}
      </div>
    </nav>
  )
}
