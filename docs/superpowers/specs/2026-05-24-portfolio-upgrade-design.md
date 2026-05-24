# Portfolio Upgrade Design Spec
**Date:** 2026-05-24  
**Author:** Abdulrhman Elsaed  
**Status:** Approved

---

## Overview

Full UI rebuild of `asaed.me` — a developer portfolio with dual goals: professional credibility (jobs/opportunities) and writing audience (personal brand, dev community). The data layer (markdown articles, projects JSON) is preserved. Everything visual and the blog infrastructure is replaced.

---

## Goals

1. Clean, professional impression for recruiters and hiring managers
2. Writing as a first-class citizen — articles prominent, reading experience excellent
3. Simple enough to maintain: adding a new article or project should take under 2 minutes
4. Own the content platform — no third-party dependency as source of truth

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js (App Router, latest) | Keep existing, upgrade version |
| Blog engine | **Velite** | Replaces deprecated Contentlayer; maintained, similar API, supports MDX |
| Styling | **Tailwind CSS** | Replaces inconsistent CSS Modules; enforces design system |
| Font | **Geist** (sans + mono) | Single family for both prose and code; replaces mixed font stack |
| Code highlighting | **Shiki** | Best-in-class, theme-aware, used via Velite/rehype |
| OG images | **Next.js `@vercel/og`** | Dynamic OG image generation per article |
| Terminal easter egg | `react-console-emulator` (keep) | No change needed |
| TypeScript | Keep | No change |

---

## Architecture

### Pages

```
/                    → Homepage (single scroll)
/writing             → All articles list
/writing/[slug]      → Individual article
/terminal            → Terminal easter egg (keep as-is)
```

### Homepage sections (in order, single scroll)

1. **Nav** — Name left, links right (Writing, Projects, GitHub). Resume button.
2. **Hero/Bio** — Short, punchy (2–3 lines). Not corporate. Role + what you build + what you write about.
3. **Writing** — Recent 3–5 articles. Title + date. "All writing →" link.
4. **Projects** — Featured 4 projects in a 2-col grid. Title, short description, tech stack tags, link icons (repo + live).
5. **Footer** — Social links (GitHub, X/Twitter, LinkedIn), RSS link, terminal easter egg link.

### Writing (`/writing`)

- Full list of all articles, sorted newest first
- Each entry: title, date, reading time estimate, short excerpt
- No pagination needed until 20+ articles

### Article (`/writing/[slug]`)

- Proper reading typography (max ~65ch line width, `prose` Tailwind class)
- Title, date, reading time at top
- Syntax-highlighted code blocks via Shiki
- Dynamic OG image (title + site name rendered as image)
- Back link to `/writing`

---

## Content

### Articles

- Source: `src/_data/blog/*.md` (keep existing files)
- Format: MDX (supports embedded components in future)
- Frontmatter fields: `title`, `date`, `description` (new — used for excerpt + OG), `tags` (optional)
- Remove `onhashnode` field — all articles live here now; syndication to Hashnode is manual
- Local articles render at `/writing/[slug]`

### Projects

- Source: `src/_data/projects.json` (keep, clean up content)
- Fix typo: `desciption` → `description`
- Add missing fields: `url`, `repo` where available
- Remove placeholder entries (`Nagda: "..."`)
- Schema: `id`, `title`, `description`, `tools[]`, `repo?`, `url?`, `featured?`

---

## Design System

### Colors (dark by default, no toggle)

```
background:     #0a0a0a
surface:        #111111
border:         #1e1e1e
text-primary:   #e5e5e5
text-secondary: #888888
text-muted:     #444444
accent:         #ffffff (subtle, for hover states)
```

### Typography

- Font: Geist Sans + Geist Mono (single import from `next/font/google`)
- Body: 15px / 1.7 line height
- Article body: `prose` Tailwind class, ~65ch max width
- No serif fonts anywhere — Geist only throughout, including article headings

### Spacing

- Container max-width: 680px centered (tight, editorial feel)
- Section gap: 64px
- Consistent 24px internal padding

---

## Features

### RSS Feed

- Route: `/rss.xml`
- Generated at build time from all articles
- Standard RSS 2.0 format with `description` field from frontmatter

### Dynamic OG Images

- Route: `/og?title=...` using `@vercel/og`
- Articles link to this with their title
- Simple layout: dark background, article title, site name

### Reading Time

- Computed at build time by Velite (words / 200 wpm)
- Displayed on article list and article page

### Social Links

- GitHub: `https://github.com/AbdoElsaed`
- X/Twitter: configured via `src/_data/social.ts` (fill in handle during implementation)
- LinkedIn: configured via `src/_data/social.ts` (fill in URL during implementation)
- All in footer + homepage hero area

### Resume

- Env var: `NEXT_PUBLIC_RESUME_LINK` (already exists)
- Visible on homepage nav as a button, not just terminal command

### Terminal Easter Egg

- Keep `/terminal` route exactly as-is
- Add subtle link in footer: `[terminal]` in monospace
- Optionally: keyboard shortcut `Ctrl+\`` triggers redirect to `/terminal`

---

## What We're Not Building (yet)

- Comments (Giscus) — add when there are readers
- Newsletter signup — add when writing cadence is established
- Light mode toggle — dark only for now
- Search — add when article count justifies it
- Tags/category filtering — add later

---

## Migration Notes

- **Contentlayer → Velite**: frontmatter schema changes slightly; `onhashnode` field removed, `description` added
- **CSS Modules → Tailwind**: all component styles rewritten; globals.css simplified to base resets only
- **`src/_data/blog/`**: files stay in place, just frontmatter updated
- **`src/_data/projects.json`**: cleaned up, typo fixed, schema finalized
- **Terminal page**: no changes needed
- **`.gitignore`**: add `.superpowers/` and `.velite/`
