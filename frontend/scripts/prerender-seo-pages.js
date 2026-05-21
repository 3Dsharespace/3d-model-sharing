import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getAllProgrammaticSeoPages,
  popularSeoLinks,
} from '../src/data/programmaticSeo.js'

const SITE_ORIGIN = 'https://3dsharespace.com'
const scriptDir = dirname(fileURLToPath(import.meta.url))
const distDir = join(scriptDir, '..', 'dist')

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const escapeAttr = escapeHtml

const relatedLinks = (page) => popularSeoLinks
  .filter((link) => link.path !== page.canonical)
  .map((link) => (
    `<a href="${escapeAttr(link.path)}">${escapeHtml(link.label)}</a>`
  ))
  .join('')

const jsonLdForPage = (page) => [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page.heading,
    description: page.description,
    url: `${SITE_ORIGIN}${page.canonical}`,
    isPartOf: {
      '@type': 'WebSite',
      name: '3D ShareSpace',
      url: SITE_ORIGIN
    }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_ORIGIN
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Explore',
        item: `${SITE_ORIGIN}/explore`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: page.heading,
        item: `${SITE_ORIGIN}${page.canonical}`
      }
    ]
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Are ${page.name} 3D models free to download?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: '3D ShareSpace focuses on free 3D model discovery. Check each model page for its license, format, and creator notes before using it in a project.'
        }
      },
      {
        '@type': 'Question',
        name: `Which formats are useful for ${page.name} models?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Common formats include ${page.formats.join(', ')}. Availability depends on the creator upload.`
        }
      }
    ]
  },
  {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: page.collectionItems ? `${page.name} links` : `${page.name} search ideas`,
    itemListElement: (page.collectionItems || page.searchIdeas || page.examples || []).slice(0, 8).map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label || item,
      url: item.path ? `${SITE_ORIGIN}${item.path}` : `${SITE_ORIGIN}/explore?q=${encodeURIComponent(item)}`
    }))
  }
]

const renderStaticPage = (page) => `
  <main class="discovery-prerender">
    <section class="discovery-hero">
      <p class="discovery-kicker">Free 3D Models</p>
      <h1>${escapeHtml(page.heading)}</h1>
      <p>${escapeHtml(page.intro)}</p>
      <div class="discovery-actions">
        <a class="discovery-primary" href="${escapeAttr(page.ctaUrl)}">${escapeHtml(page.ctaLabel)}</a>
        <a href="/explore">Explore all models</a>
      </div>
    </section>
    <section class="discovery-grid">
      <article>
        <h2>Best For</h2>
        <p>${escapeHtml(page.description)}</p>
      </article>
      <article>
        <h2>Common Uses</h2>
        <ul>
          ${page.examples.map((example) => `<li>${escapeHtml(example)}</li>`).join('')}
        </ul>
      </article>
      <article>
        <h2>Popular Formats</h2>
        <p>${page.formats.map(escapeHtml).join(', ')}</p>
      </article>
    </section>
    <section class="discovery-related">
      ${page.collectionItems ? `<h2>Collection Links</h2><div class="discovery-collection-links">${page.collectionItems.map((item) => (
        `<a href="${escapeAttr(item.path)}">${escapeHtml(item.label)}</a>`
      )).join('')}</div>` : ''}
      <h2>Related Searches</h2>
      ${page.searchIdeas ? `<div class="discovery-ideas">${page.searchIdeas.map((idea) => (
        `<a href="/explore?q=${encodeURIComponent(idea)}">${escapeHtml(idea)}</a>`
      )).join('')}</div>` : ''}
      <div>${relatedLinks(page)}</div>
    </section>
  </main>
`

const pageHead = (page) => `
    <title>${escapeHtml(page.title)}</title>
    <meta name="description" content="${escapeAttr(page.description)}" />
    <meta name="keywords" content="${escapeAttr(page.keywords)}" />
    <link rel="canonical" href="${SITE_ORIGIN}${escapeAttr(page.canonical)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${SITE_ORIGIN}${escapeAttr(page.canonical)}" />
    <meta property="og:title" content="${escapeAttr(page.title)}" />
    <meta property="og:description" content="${escapeAttr(page.description)}" />
    <meta property="og:image" content="${SITE_ORIGIN}/favicon.svg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(page.title)}" />
    <meta name="twitter:description" content="${escapeAttr(page.description)}" />
    <meta name="twitter:image" content="${SITE_ORIGIN}/favicon.svg" />
    <script type="application/ld+json">${JSON.stringify(jsonLdForPage(page))}</script>
    <style>
      .discovery-prerender{min-height:100vh;background:#050505;color:#fff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:64px 24px}
      .discovery-prerender a{color:#fff}
      .discovery-hero,.discovery-grid,.discovery-related{max-width:1120px;margin:0 auto}
      .discovery-kicker{margin:0 0 16px;color:#bdbdbd;text-transform:uppercase;letter-spacing:.08em;font-size:13px}
      .discovery-hero h1{margin:0 0 18px;font-size:clamp(36px,7vw,72px);line-height:1;font-weight:800;letter-spacing:0}
      .discovery-hero p{max-width:760px;color:#d4d4d4;font-size:18px;line-height:1.7}
      .discovery-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
      .discovery-actions a{border:1px solid #555;padding:12px 18px;text-decoration:none;font-weight:700}
      .discovery-actions .discovery-primary{background:#fff;color:#000;border-color:#fff}
      .discovery-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:48px}
      .discovery-grid article{border:1px solid #262626;background:#0d0d0d;padding:24px}
      .discovery-grid h2,.discovery-related h2{margin:0 0 12px;font-size:22px}
      .discovery-grid p,.discovery-grid li{color:#d4d4d4;line-height:1.65}
      .discovery-related{border-top:1px solid #262626;margin-top:42px;padding-top:28px}
      .discovery-related div{display:flex;flex-wrap:wrap;gap:10px}
      .discovery-ideas{margin-bottom:16px}
      .discovery-ideas a{background:#fff;color:#000!important;border-color:#fff!important}
      .discovery-related a{border:1px solid #333;padding:10px 14px;text-decoration:none;color:#d4d4d4}
      @media (max-width:800px){.discovery-grid{grid-template-columns:1fr}.discovery-prerender{padding:44px 18px}}
    </style>
`

const prepareHtml = (template, page) => {
  const withoutRouteHead = template
    .replace(/<title>[\s\S]*?<\/title>\s*/gi, '')
    .replace(/<meta\s+name=["']description["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+name=["']keywords["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+property=["']og:type["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+property=["']og:url["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+property=["']og:title["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+property=["']og:description["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+property=["']og:image["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+name=["']twitter:card["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+name=["']twitter:title["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+name=["']twitter:description["'][^>]*>\s*/gi, '')
    .replace(/<meta\s+name=["']twitter:image["'][^>]*>\s*/gi, '')

  return withoutRouteHead
    .replace(/<head>/i, `<head>\n${pageHead(page)}`)
    .replace('<div id="root"></div>', `<div id="root">${renderStaticPage(page)}</div>`)
}

const pages = getAllProgrammaticSeoPages()

const template = await readFile(join(distDir, 'index.html'), 'utf8')

await Promise.all(pages.map(async (page) => {
  const outputDir = join(distDir, page.canonical)
  await mkdir(outputDir, { recursive: true })
  await writeFile(join(outputDir, 'index.html'), prepareHtml(template, page))
}))

console.log(`Prerendered ${pages.length} discovery pages.`)
