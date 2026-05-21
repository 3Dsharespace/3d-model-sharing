import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { seoGuides } from '../src/data/seoGuides.js'

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

const jsonLdForGuide = (guide) => [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.heading,
    description: guide.description,
    url: `${SITE_ORIGIN}/guides/${guide.slug}`,
    author: {
      '@type': 'Organization',
      name: '3D ShareSpace'
    },
    publisher: {
      '@type': 'Organization',
      name: '3D ShareSpace',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_ORIGIN}/favicon.svg`
      }
    }
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: guide.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
]

const pageHead = (guide) => `
    <title>${escapeHtml(guide.title)}</title>
    <meta name="description" content="${escapeAttr(guide.description)}" />
    <meta name="keywords" content="${escapeAttr(guide.keywords)}" />
    <link rel="canonical" href="${SITE_ORIGIN}/guides/${escapeAttr(guide.slug)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${SITE_ORIGIN}/guides/${escapeAttr(guide.slug)}" />
    <meta property="og:title" content="${escapeAttr(guide.title)}" />
    <meta property="og:description" content="${escapeAttr(guide.description)}" />
    <meta property="og:image" content="${SITE_ORIGIN}/favicon.svg" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(guide.title)}" />
    <meta name="twitter:description" content="${escapeAttr(guide.description)}" />
    <meta name="twitter:image" content="${SITE_ORIGIN}/favicon.svg" />
    <script type="application/ld+json">${JSON.stringify(jsonLdForGuide(guide))}</script>
    <style>
      .guide-prerender{min-height:100vh;background:#050505;color:#fff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:64px 24px}
      .guide-prerender article{max-width:880px;margin:0 auto}
      .guide-prerender h1{margin:0 0 18px;font-size:clamp(36px,7vw,64px);line-height:1;font-weight:800;letter-spacing:0}
      .guide-prerender h2{margin:0 0 12px;font-size:26px}
      .guide-prerender p{color:#d4d4d4;line-height:1.75;font-size:17px}
      .guide-kicker{display:inline-block;border:1px solid #333;padding:6px 10px;color:#d4d4d4;font-size:13px;margin-bottom:20px}
      .guide-actions{display:flex;flex-wrap:wrap;gap:12px;margin:28px 0 40px}
      .guide-actions a{border:1px solid #555;padding:12px 18px;text-decoration:none;font-weight:700;color:#fff}
      .guide-actions .guide-primary{background:#fff;color:#000;border-color:#fff}
      .guide-section,.guide-faq{border-top:1px solid #262626;padding-top:24px;margin-top:24px}
      .guide-faq div{border:1px solid #262626;padding:18px;margin-top:12px}
      .guide-faq h3{margin:0 0 8px}
    </style>
`

const renderGuide = (guide) => `
  <main class="guide-prerender">
    <article>
      <span class="guide-kicker">3D Guide</span>
      <h1>${escapeHtml(guide.heading)}</h1>
      <p>${escapeHtml(guide.description)}</p>
      <div class="guide-actions">
        <a class="guide-primary" href="${escapeAttr(guide.relatedCta.path)}">${escapeHtml(guide.relatedCta.label)}</a>
        <a href="/explore">Explore all models</a>
      </div>
      ${guide.sections.map((section) => `
        <section class="guide-section">
          <h2>${escapeHtml(section.heading)}</h2>
          <p>${escapeHtml(section.body)}</p>
        </section>
      `).join('')}
      <section class="guide-faq">
        <h2>Quick Answers</h2>
        ${guide.faqs.map((faq) => `
          <div>
            <h3>${escapeHtml(faq.question)}</h3>
            <p>${escapeHtml(faq.answer)}</p>
          </div>
        `).join('')}
      </section>
    </article>
  </main>
`

const prepareHtml = (template, guide) => {
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
    .replace(/<head>/i, `<head>\n${pageHead(guide)}`)
    .replace('<div id="root"></div>', `<div id="root">${renderGuide(guide)}</div>`)
}

const template = await readFile(join(distDir, 'index.html'), 'utf8')

await Promise.all(seoGuides.map(async (guide) => {
  const outputDir = join(distDir, 'guides', guide.slug)
  await mkdir(outputDir, { recursive: true })
  await writeFile(join(outputDir, 'index.html'), prepareHtml(template, guide))
}))

console.log(`Prerendered ${seoGuides.length} guide pages.`)
