import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAllProgrammaticSeoPages } from '../src/data/programmaticSeo.js'
import { seoGuides } from '../src/data/seoGuides.js'
import { SITE_ORIGIN } from '../src/lib/modelLinks.js'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const distDir = join(scriptDir, '..', 'dist')
const today = new Date().toISOString().slice(0, 10)

const corePages = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/explore', changefreq: 'hourly', priority: '0.9' },
  { path: '/upload', changefreq: 'weekly', priority: '0.7' },
  { path: '/creators', changefreq: 'weekly', priority: '0.7' },
  { path: '/getting-started', changefreq: 'monthly', priority: '0.6' },
  { path: '/tips', changefreq: 'monthly', priority: '0.6' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
  { path: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' }
]

const escapeXml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const programmaticPages = getAllProgrammaticSeoPages().map((page) => ({
  path: page.canonical,
  changefreq: page.type === 'format' ? 'weekly' : 'daily',
  priority: page.type === 'hub' ? '0.95' : page.type === 'topic' ? '0.8' : '0.85'
}))

const guidePages = seoGuides.map((guide) => ({
  path: `/guides/${guide.slug}`,
  changefreq: 'monthly',
  priority: '0.65'
}))

const imageGalleryPages = [
  { path: '/free-3d-model-images', changefreq: 'daily', priority: '0.85' }
]

const pages = [...corePages, ...programmaticPages, ...imageGalleryPages, ...guidePages]

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>
    <loc>${escapeXml(`${SITE_ORIGIN}${page.path}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>
`

await mkdir(distDir, { recursive: true })
await writeFile(join(distDir, 'sitemap.xml'), sitemap)

console.log(`Generated sitemap.xml with ${pages.length} static URLs.`)
