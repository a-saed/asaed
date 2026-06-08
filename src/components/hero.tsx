import { social } from '@/_data/social'

export function Hero() {
  return (
    <div className="py-10 sm:py-14">
      <h1 className="text-2xl font-bold text-white tracking-tight leading-snug mb-4">
        Engineer by trade, rabbit-hole enthusiast by nature.
        <br />
        <span className="text-neutral-500">I write here when something won&apos;t stop bothering me.</span>
      </h1>
      <div className="flex gap-4 mt-6">
        <a
          href={social.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          GitHub ↗
        </a>
        {social.twitter && (
          <a
            href={social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            X ↗
          </a>
        )}
        {social.linkedin && (
          <a
            href={social.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            LinkedIn ↗
          </a>
        )}
      </div>
    </div>
  )
}
