// Single source of truth for the site's public URL.
// Override per-environment with NEXT_PUBLIC_SITE_URL (e.g. set it to
// https://asaed.me once the custom domain is live on Vercel).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://asaed.vercel.app'

// Bare host (no protocol), e.g. "asaed.vercel.app" — used for display labels.
export const SITE_HOST = new URL(SITE_URL).host

// OG image cache-buster. Social platforms (LinkedIn, WhatsApp, etc.) cache the
// preview image by its URL and won't refetch the same URL. BUMP THIS whenever
// the /og card design changes so platforms pull the new image.
export const OG_VERSION = '2'
