import { z, defineCollection } from 'astro:content'

// frontmatter 只写日期（如 `2026-09-19`）时，js-yaml 解析为 UTC 午夜（00:00:00Z）。
// 归一到 UTC 正午（12:00:00Z）：字面即「默认 12:00」，且跨构建/查看时区稳定
// （用本地时区会在本机 UTC+8 与 Vercel UTC 产物里产生不同 instant）。
const noonDefaultDate = z.date().transform((d) => {
  if (
    d.getUTCHours() === 0 &&
    d.getUTCMinutes() === 0 &&
    d.getUTCSeconds() === 0 &&
    d.getUTCMilliseconds() === 0
  ) {
    const normalized = new Date(d)
    normalized.setUTCHours(12, 0, 0, 0)
    return normalized
  }
  return d
})

const postsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: noonDefaultDate,
    lastMod: noonDefaultDate.optional(),
    summary: z.string().optional(),
    cover: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    comments: z.boolean().default(true),
    draft: z.boolean().default(false),
    sticky: z.number().default(0),
  }),
})

const specCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    comments: z.boolean().default(true),
  }),
})

const galleriesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    draft: z.boolean().default(false),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
})

export const collections = {
  posts: postsCollection,
  spec: specCollection,

  galleries: galleriesCollection,
}
