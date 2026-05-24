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
          readingTime: Math.ceil((data.content.raw ?? '').split(/\s+/).length / 200),
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
