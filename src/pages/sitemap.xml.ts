import type { APIRoute } from 'astro'
import { site, posts as postsConfig } from '@/config.json'
import { getSortedPosts, getPostUrl, getAllCategories, getAllTags } from '@/utils/content'

async function generateSitemap(): Promise<string> {
  const url = site.url.replace(/\/$/, '')
  const posts = await getSortedPosts()
  const categories = await getAllCategories()
  const tags = await getAllTags()
  const { perPage } = postsConfig
  const totalPages = Math.ceil(posts.length / perPage)

  const loc = (path: string) => `${url}${path}`
  const today = new Date().toISOString().split('T')[0]

  const urls: string[] = []

  const add = (path: string, priority: string, changefreq = 'monthly', lastmod?: string) => {
    urls.push(`  <url>
    <loc>${loc(path)}</loc>
    <lastmod>${lastmod || today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`)
  }

  add('/', '1.0', 'daily')
  add('/about/', '0.8')
  add('/archives/', '0.6')
  add('/galleries/', '0.5')
  add('/galleries/cloud-photography/', '0.5')
  add('/galleries/scenery-cartoon/', '0.5')
  add('/galleries/tree-photo/', '0.5')
  add('/links/', '0.6')
  add('/links/apply/', '0.3')
  add('/links/fcircle/', '0.3')
  add('/projects/', '0.6')
  add('/tools/', '0.5')
  add('/tags/', '0.5')
  add('/categories/', '0.5')

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1) continue
    add(`/page/${i}/`, '0.6', 'weekly')
  }

  for (const cat of categories) {
    add(`/categories/${cat.slug}/`, '0.6')
  }

  for (const tag of tags) {
    add(`/tags/${tag.slug}/`, '0.5')
  }

  for (const post of posts) {
    const lastmod = (post.data.lastMod || post.data.date).toISOString().split('T')[0]
    add(getPostUrl(post), '0.7', 'monthly', lastmod)
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`
}

export const GET: APIRoute = async () => {
  const xml = await generateSitemap()
  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  })
}
