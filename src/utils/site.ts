// Single source of truth for the site's public URL.
// Override per-environment with NEXT_PUBLIC_SITE_URL (e.g. set it to
// https://asaed.me once the custom domain is live on Vercel).
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://asaed.vercel.app'

// Bare host (no protocol), e.g. "asaed.vercel.app" — used for display labels.
export const SITE_HOST = new URL(SITE_URL).host
