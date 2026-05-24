import { social } from '@/_data/social'

export function Hero() {
  return (
    <div className="py-14">
      <h1 className="text-2xl font-bold text-white tracking-tight leading-snug mb-4">
        I build GIS software —
        <br />
        <span className="text-neutral-500">turning messy coordinates into products people actually use.</span>
      </h1>
      <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
        I still google basic things, and I write here when something takes too long to figure out
        so the next person doesn&apos;t have to.
      </p>
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
