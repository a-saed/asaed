# Portfolio Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild asaed.me as a clean, editorial dark-mode portfolio where writing and projects are equally prominent — professional for recruiters, writer-first for building an audience.

**Architecture:** Full UI rebuild using Tailwind CSS in place of CSS Modules, Velite replacing deprecated Contentlayer, and Geist as the single font family. Data files (markdown articles, projects.json) are preserved with minor frontmatter updates. All pages share a 680px centered container layout.

**Tech Stack:** Next.js 14, Velite, Tailwind CSS v3, @tailwindcss/typography, rehype-pretty-code, Geist font, @vercel/og

---

## File Map

**Create:**
- `velite.config.ts` — blog content schema (replaces contentlayer.config.ts)
- `tailwind.config.ts` — design tokens and typography plugin
- `postcss.config.js` — required by Tailwind
- `src/_data/social.ts` — social link constants
- `src/components/mdx-content.tsx` — client component for rendering compiled MDX
- `src/components/nav.tsx` — top navigation bar
- `src/components/hero.tsx` — homepage bio section
- `src/components/writing-list.tsx` — article list (used on homepage + /writing)
- `src/components/project-grid.tsx` — project cards grid
- `src/components/footer.tsx` — footer with socials + RSS + terminal link
- `src/app/writing/page.tsx` — full article list page
- `src/app/writing/[slug]/page.tsx` — individual article page
- `src/app/og/route.tsx` — dynamic OG image generation
- `src/app/rss.xml/route.ts` — RSS feed

**Modify:**
- `package.json` — add Velite, Tailwind, remove Contentlayer/date-fns
- `next.config.js` — remove withContentlayer, add Velite webpack integration + /blog redirects
- `tsconfig.json` — update path aliases for Velite output
- `src/app/globals.css` — replace with Tailwind directives + minimal resets
- `src/app/layout.tsx` — switch to Geist font, update metadata
- `src/app/page.tsx` — assemble homepage from new components
- `src/_data/blog/*.md` — update frontmatter (add description + hashnodeSlug, remove onhashnode)
- `src/_data/projects.json` — fix typo, add featured flag, clean up entries
- `.gitignore` — add .velite/ and .superpowers/

**Delete:**
- `contentlayer.config.ts`
- `src/app/blog/` (entire directory)
- `src/app/layout.module.css`
- `src/components/Blog/`
- `src/components/Header/`
- `src/components/Info/`
- `src/components/Projects/`
- `global.d.ts` (contentlayer type reference, no longer needed)

---

## Task 1: Install dependencies and remove deprecated packages

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove deprecated packages and install new ones**

```bash
cd /path/to/portfolio
npm uninstall contentlayer next-contentlayer date-fns
npm install next@14 velite@latest tailwindcss@3 postcss autoprefixer @tailwindcss/typography rehype-pretty-code shiki
npm install --save-dev @types/node@20
```

- [ ] **Step 2: Verify installation**

```bash
npx tsc --version
node -e "require('velite'); console.log('velite ok')"
```

Expected: no errors, velite resolves.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: replace contentlayer with velite, add tailwind"
```

---

## Task 2: Configure Velite (replaces Contentlayer)

**Files:**
- Create: `velite.config.ts`
- Delete: `contentlayer.config.ts`

- [ ] **Step 1: Create `velite.config.ts`**

```ts
import { defineConfig, s } from 'velite'
import rehypePrettyCode from 'rehype-pretty-code'

export default defineConfig({
  root: 'src/_data',
  output: {
    data: '.velite',
    clean: true,
  },
  collections: {
    posts: {
      name: 'Post',
      pattern: 'blog/**/*.{md,mdx}',
      schema: s
        .object({
          title: s.string(),
          date: s.isodate(),
          description: s.string(),
          hashnodeSlug: s.string().optional(),
          tags: s.array(s.string()).optional().default([]),
          slug: s.path(),
          content: s.mdx(),
        })
        .transform((data) => ({
          ...data,
          readingTime: Math.ceil(data.content.raw.split(/\s+/).length / 200),
          slugParam: data.slug.replace('blog/', ''),
          url: `/writing/${data.slug.replace('blog/', '')}`,
        })),
    },
  },
  mdx: {
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: 'github-dark-dimmed',
          keepBackground: false,
        },
      ],
    ],
  },
})
```

- [ ] **Step 2: Delete contentlayer.config.ts**

```bash
rm contentlayer.config.ts
```

- [ ] **Step 3: Run Velite to verify it builds**

```bash
npx velite build
```

Expected: `.velite/` directory created. Will fail if blog frontmatter is missing `description` — that's fine, we fix frontmatter in Task 4.

- [ ] **Step 4: Commit**

```bash
git add velite.config.ts
git rm contentlayer.config.ts
git commit -m "feat: add velite config, remove contentlayer"
```

---

## Task 3: Configure Tailwind CSS

**Files:**
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`

- [ ] **Step 1: Create `tailwind.config.ts`**

```ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        surface: '#111111',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config
```

- [ ] **Step 2: Create `postcss.config.js`**

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts postcss.config.js
git commit -m "feat: add tailwind config"
```

---

## Task 4: Update Next.js and TypeScript config

**Files:**
- Modify: `next.config.js`
- Modify: `tsconfig.json`
- Delete: `global.d.ts`

- [ ] **Step 1: Replace `next.config.js`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/blog/:slug',
        destination: '/writing/:slug',
        permanent: true,
      },
    ]
  },
  webpack(config) {
    config.plugins.push(new VeliteWebpackPlugin())
    return config
  },
}

class VeliteWebpackPlugin {
  static started = false
  apply(compiler) {
    compiler.hooks.beforeCompile.tapPromise('VeliteWebpackPlugin', async () => {
      if (VeliteWebpackPlugin.started) return
      VeliteWebpackPlugin.started = true
      const dev = compiler.options.mode === 'development'
      const { build } = await import('velite')
      await build({ watch: dev, clean: !dev })
    })
  }
}

module.exports = nextConfig
```

- [ ] **Step 2: Update `tsconfig.json`**

Replace the `paths` and `include` sections:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/.velite": ["./.velite"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".velite"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Delete `global.d.ts`**

```bash
rm global.d.ts
```

- [ ] **Step 4: Commit**

```bash
git add next.config.js tsconfig.json
git rm global.d.ts
git commit -m "chore: update next and ts config for velite, add /blog redirects"
```

---

## Task 5: Migrate content data

**Files:**
- Modify: `src/_data/blog/the-observer-pattern.md`
- Modify: `src/_data/blog/avoid-unleashing-zalgo-in-nodejs.md`
- Modify: `src/_data/blog/sliding-window-technique-in-javascript.md`
- Create: `src/_data/social.ts`
- Modify: `src/_data/projects.json`

- [ ] **Step 1: Update blog frontmatter — the-observer-pattern.md**

```md
---
title: The Observer Pattern
date: 2022-5-19
description: A behavioral design pattern that defines a one-to-many dependency between objects — when one changes state, all its dependents are notified automatically.
hashnodeSlug: the-observer-pattern
---
```

- [ ] **Step 2: Update blog frontmatter — avoid-unleashing-zalgo-in-nodejs.md**

```md
---
title: Avoid Unleashing Zalgo in Node.js
date: 2022-5-3
description: Why mixing synchronous and asynchronous callbacks in Node.js is dangerous and how to keep your APIs predictably async.
hashnodeSlug: avoid-unleashing-zalgo-in-nodejs
---
```

- [ ] **Step 3: Update blog frontmatter — sliding-window-technique-in-javascript.md**

```md
---
title: Sliding Window Technique in JavaScript
date: 2022-5-21
description: An efficient approach to solving subarray and substring problems by maintaining a window that slides through the data structure.
hashnodeSlug: sliding-window-technique-in-javascript
---
```

- [ ] **Step 4: Create `src/_data/social.ts`**

```ts
export const social = {
  github: 'https://github.com/AbdoElsaed',
  twitter: '', // fill in: 'https://x.com/yourhandle'
  linkedin: '', // fill in: 'https://linkedin.com/in/yourhandle'
} as const
```

- [ ] **Step 5: Replace `src/_data/projects.json`**

```json
[
  {
    "id": "1",
    "title": "Navigo",
    "description": "Delivery telematics platform with real-time tracking and route optimization for logistics operations.",
    "tools": ["Next.js", "TypeScript"],
    "repo": "",
    "url": "",
    "featured": true
  },
  {
    "id": "2",
    "title": "Toder",
    "description": "All-in-one task management with project hierarchy and drag-and-drop task organization.",
    "tools": ["React", "TypeScript", "Vite", "PouchDB"],
    "repo": "",
    "url": "",
    "featured": true
  },
  {
    "id": "3",
    "title": "FutureMe",
    "description": "Send a letter to your future self — scheduled email delivery on any date you choose.",
    "tools": ["Next.js", "Node.js", "MongoDB", "Bull", "Redis"],
    "repo": "",
    "url": "",
    "featured": true
  },
  {
    "id": "4",
    "title": "linkedin-dl",
    "description": "CLI tool to download courses from LinkedIn Learning for offline viewing.",
    "tools": ["Python", "ffmpeg"],
    "repo": "https://github.com/AbdoElsaed/linkedin-dl",
    "url": "",
    "featured": true
  },
  {
    "id": "5",
    "title": "UFD",
    "description": "Download videos from popular platforms via a clean web interface.",
    "tools": ["Next.js", "MUI", "youtube-dl", "ffmpeg"],
    "repo": "",
    "url": "",
    "featured": false
  }
]
```

- [ ] **Step 6: Run Velite to verify frontmatter is valid**

```bash
npx velite build
```

Expected: `.velite/` generated with no errors. If you get a schema validation error, check which field is missing in which .md file.

- [ ] **Step 7: Commit**

```bash
git add src/_data/
git commit -m "feat: migrate blog frontmatter and project data to new schema"
```

---

## Task 6: Design system — globals and layout

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Delete: `src/app/layout.module.css`

- [ ] **Step 1: Replace `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html, body {
    background-color: #0a0a0a;
    color: #e5e5e5;
    -webkit-font-smoothing: antialiased;
  }

  * {
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ::-webkit-scrollbar { width: 3px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #333; }
  ::-webkit-scrollbar-thumb:hover { background: #444; }
}

/* rehype-pretty-code code block styles */
[data-rehype-pretty-code-fragment] {
  position: relative;
}

code {
  font-family: var(--font-geist-mono), ui-monospace, monospace;
  font-size: 0.875em;
}

pre {
  overflow-x: auto;
  border-radius: 6px;
  border: 1px solid #1e1e1e;
  padding: 1rem 1.25rem;
  background: #111 !important;
}

pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.825rem;
}
```

- [ ] **Step 2: Replace `src/app/layout.tsx`**

```tsx
import './globals.css'
import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

export const metadata: Metadata = {
  title: 'Abdulrhman Elsaed',
  description: 'Full-stack engineer. I build things and write about them.',
  authors: [{ name: 'Abdulrhman Elsaed', url: 'https://asaed.me' }],
  creator: 'Abdulrhman Elsaed',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans bg-[#0a0a0a] text-neutral-200 min-h-screen">
        {children}
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Install Geist font package**

```bash
npm install geist
```

- [ ] **Step 4: Delete layout.module.css**

```bash
rm src/app/layout.module.css
```

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors (or only errors about missing components we haven't created yet — those are fine).

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git rm src/app/layout.module.css
git commit -m "feat: design system — tailwind globals and geist font"
```

---

## Task 7: Nav and Footer components

**Files:**
- Create: `src/components/nav.tsx`
- Create: `src/components/footer.tsx`
- Delete: `src/components/Header/` (entire directory)

- [ ] **Step 1: Create `src/components/nav.tsx`**

```tsx
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
```

- [ ] **Step 2: Create `src/components/footer.tsx`**

```tsx
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
```

- [ ] **Step 3: Delete old Header component**

```bash
rm -rf src/components/Header
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

Expected: no errors in nav.tsx or footer.tsx.

- [ ] **Step 5: Commit**

```bash
git add src/components/nav.tsx src/components/footer.tsx
git rm -r src/components/Header
git commit -m "feat: nav and footer components"
```

---

## Task 8: Hero and WritingList components

**Files:**
- Create: `src/components/hero.tsx`
- Create: `src/components/writing-list.tsx`
- Delete: `src/components/Info/` (entire directory)
- Delete: `src/components/Blog/` (entire directory)

- [ ] **Step 1: Create `src/components/hero.tsx`**

```tsx
import { social } from '@/_data/social'

export function Hero() {
  return (
    <div className="py-14">
      <h1 className="text-2xl font-bold text-white tracking-tight leading-snug mb-4">
        Full-stack engineer.
        <br />
        <span className="text-neutral-500">I build things and write about them.</span>
      </h1>
      <p className="text-sm text-neutral-400 leading-relaxed max-w-md">
        I work at GeoTech building GIS-driven applications. Outside of work I ship side projects
        and write about what I learn along the way.
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
```

- [ ] **Step 2: Create `src/components/writing-list.tsx`**

```tsx
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
```

- [ ] **Step 3: Delete old Info and Blog components**

```bash
rm -rf src/components/Info src/components/Blog
```

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/hero.tsx src/components/writing-list.tsx
git rm -r src/components/Info src/components/Blog
git commit -m "feat: hero and writing list components"
```

---

## Task 9: ProjectGrid component

**Files:**
- Create: `src/components/project-grid.tsx`
- Delete: `src/components/Projects/` (entire directory)

- [ ] **Step 1: Create `src/components/project-grid.tsx`**

```tsx
import projects from '@/_data/projects.json'

interface Project {
  id: string
  title: string
  description: string
  tools?: string[]
  repo?: string
  url?: string
  featured?: boolean
}

export function ProjectGrid() {
  const featured = (projects as Project[]).filter((p) => p.featured)

  return (
    <div>
      <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-5">Projects</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {featured.map((project) => (
          <div
            key={project.id}
            className="border border-neutral-900 rounded-md p-4 hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-medium text-neutral-200">{project.title}</p>
              <div className="flex gap-3">
                {project.repo && (
                  <a
                    href={project.repo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-600 hover:text-neutral-300 transition-colors"
                  >
                    repo ↗
                  </a>
                )}
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-neutral-600 hover:text-neutral-300 transition-colors"
                  >
                    live ↗
                  </a>
                )}
              </div>
            </div>
            <p className="text-xs text-neutral-500 leading-relaxed mb-3">
              {project.description}
            </p>
            {project.tools && project.tools.length > 0 && (
              <div className="flex flex-wrap gap-x-3 gap-y-1">
                {project.tools.map((tool) => (
                  <span key={tool} className="text-xs text-neutral-700 font-mono">
                    {tool}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Delete old Projects component**

```bash
rm -rf src/components/Projects
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/project-grid.tsx
git rm -r src/components/Projects
git commit -m "feat: project grid component"
```

---

## Task 10: Assemble homepage

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace `src/app/page.tsx`**

```tsx
import { Nav } from '@/components/nav'
import { Hero } from '@/components/hero'
import { WritingList } from '@/components/writing-list'
import { ProjectGrid } from '@/components/project-grid'
import { Footer } from '@/components/footer'

export default function Home() {
  return (
    <div className="max-w-[680px] mx-auto px-6">
      <Nav />
      <Hero />
      <div className="space-y-16">
        <WritingList limit={5} />
        <div id="projects">
          <ProjectGrid />
        </div>
      </div>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: Start dev server and verify homepage renders**

```bash
npm run dev
```

Open `http://localhost:3000`. You should see: nav, hero text, 3 articles listed, 4 project cards, footer. If you get import errors, check that the Velite webpack plugin ran (look for `.velite/` directory).

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: assemble homepage"
```

---

## Task 11: MDX content renderer

**Files:**
- Create: `src/components/mdx-content.tsx`

- [ ] **Step 1: Create `src/components/mdx-content.tsx`**

```tsx
'use client'

import { useMemo } from 'react'
import * as runtime from 'react/jsx-runtime'

interface MDXContentProps {
  code: string
}

function useMDXComponent(code: string) {
  const fn = new Function(code)
  return fn({ ...runtime }).default
}

export function MDXContent({ code }: MDXContentProps) {
  const Component = useMemo(() => useMDXComponent(code), [code])
  return <Component />
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/mdx-content.tsx
git commit -m "feat: mdx content renderer component"
```

---

## Task 12: Writing list page and article page

**Files:**
- Create: `src/app/writing/page.tsx`
- Create: `src/app/writing/[slug]/page.tsx`
- Delete: `src/app/blog/` (entire directory)

- [ ] **Step 1: Create `src/app/writing/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { WritingList } from '@/components/writing-list'

export const metadata: Metadata = {
  title: 'Writing — Abdulrhman Elsaed',
  description: 'Articles on software engineering and things I learn along the way.',
}

export default function WritingPage() {
  return (
    <div className="max-w-[680px] mx-auto px-6">
      <Nav />
      <div className="py-12">
        <h1 className="text-lg font-semibold text-white mb-2">Writing</h1>
        <p className="text-sm text-neutral-500 mb-10">
          Articles on software engineering and things I learn along the way.
        </p>
        <WritingList />
      </div>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: Create `src/app/writing/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { posts } from '@/.velite'
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
  return {
    title: `${post.title} — Abdulrhman Elsaed`,
    description: post.description,
    openGraph: {
      images: [`/og?title=${encodeURIComponent(post.title)}`],
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
          <MDXContent code={post.content.code} />
        </div>
      </article>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 3: Delete old blog route**

```bash
rm -rf src/app/blog
```

- [ ] **Step 4: Verify TypeScript and check dev server**

```bash
npx tsc --noEmit
```

Open `http://localhost:3000/writing` — should show the article list. Clicking an article should redirect to Hashnode (since all 3 existing articles have `hashnodeSlug`).

- [ ] **Step 5: Commit**

```bash
git add src/app/writing/
git rm -r src/app/blog
git commit -m "feat: writing list page and article page"
```

---

## Task 13: RSS feed

**Files:**
- Create: `src/app/rss.xml/route.ts`

- [ ] **Step 1: Create `src/app/rss.xml/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { posts } from '@/.velite'

const SITE_URL = 'https://asaed.me'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function GET() {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const items = sorted
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}${post.url}</link>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid isPermaLink="true">${SITE_URL}${post.url}</guid>
    </item>`
    )
    .join('')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Abdulrhman Elsaed</title>
    <link>${SITE_URL}</link>
    <description>Articles on software engineering and things I learn along the way.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`

  return new NextResponse(rss, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
```

- [ ] **Step 2: Verify RSS at dev server**

Open `http://localhost:3000/rss.xml` — should return valid XML with 3 items.

- [ ] **Step 3: Commit**

```bash
git add src/app/rss.xml/route.ts
git commit -m "feat: rss feed at /rss.xml"
```

---

## Task 14: Dynamic OG images

**Files:**
- Create: `src/app/og/route.tsx`

- [ ] **Step 1: Create `src/app/og/route.tsx`**

```tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') ?? 'Abdulrhman Elsaed'

  return new ImageResponse(
    (
      <div
        style={{
          backgroundColor: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 72px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            color: '#555',
            fontSize: '16px',
            letterSpacing: '1px',
            marginBottom: '20px',
          }}
        >
          asaed.me
        </div>
        <div
          style={{
            color: '#e5e5e5',
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: '900px',
          }}
        >
          {title}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

- [ ] **Step 2: Verify OG image**

Open `http://localhost:3000/og?title=Hello+World` — should render a dark image with the title text.

- [ ] **Step 3: Commit**

```bash
git add src/app/og/route.tsx
git commit -m "feat: dynamic og image generation"
```

---

## Task 15: Update .gitignore and delete utils

**Files:**
- Modify: `.gitignore`
- Delete: `src/utils/general.util.ts` (if no longer needed — check terminal page import)

- [ ] **Step 1: Check if general.util.ts is still used**

```bash
grep -r "general.util" src/
```

If terminal page still imports it, keep it. If not, delete it.

- [ ] **Step 2: Update `.gitignore`**

Add to `.gitignore`:

```
# Velite generated output
.velite/

# Brainstorming sessions
.superpowers/
```

- [ ] **Step 3: Verify the terminal page still works**

Open `http://localhost:3000/terminal` — should show the terminal emulator unchanged.

- [ ] **Step 4: Run final build**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors. Static pages generated for `/`, `/writing`, `/writing/[slug]` for each post.

- [ ] **Step 5: Commit**

```bash
git add .gitignore
git commit -m "chore: update gitignore for velite and superpowers"
```

---

## Task 16: Writing a new local article (workflow verification)

This task verifies the new writing workflow end-to-end. A new article written locally (no Hashnode) should render fully on the site.

- [ ] **Step 1: Create a new article**

Create `src/_data/blog/hello-world.md`:

```md
---
title: Hello, World
date: 2026-05-24
description: My first article written directly on asaed.me — kicking off a new writing habit.
---

## Why I'm writing

This is the first article I'm publishing directly on my own site. No Hashnode, no third-party platform — just markdown in a git repo.

## A code example

```js
function greet(name) {
  return `Hello, ${name}!`
}
```

Short, but that's the point.
```

- [ ] **Step 2: Verify it appears on the site**

With the dev server running, open `http://localhost:3000` — the new article should appear at the top of the writing list (most recent date). Click it — it should render the full article with syntax-highlighted code, NOT redirect to Hashnode.

- [ ] **Step 3: Delete the test article**

```bash
rm src/_data/blog/hello-world.md
```

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "chore: verify new article workflow (test article removed)"
```

---

## Done

The portfolio is rebuilt. To write a new article:

1. Create `src/_data/blog/your-article-title.md`
2. Add frontmatter: `title`, `date`, `description`
3. Write content in MDX below the frontmatter
4. Run `npm run dev` to preview
5. Deploy

Articles on Hashnode are still accessible via `/writing/[slug]` redirects. New articles live fully on the site.
