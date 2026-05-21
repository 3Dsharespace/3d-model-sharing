import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getAbsoluteUrl,
  getModelImagePageUrl,
  getModelAltText,
  getModelFileFormat,
  getModelSeoDescription,
  getModelSeoTitle,
  getModelUrl,
  SITE_ORIGIN,
  slugify,
  toIsoDate
} from '../src/lib/modelLinks.js'
import { modelCategoryNames } from '../src/data/modelCategories.js'

const firebaseConfig = {
  apiKey: 'AIzaSyCtaQ7-1Hd5e_OgQ5eLT94-WVYodWcJ6mM',
  projectId: 'dsharespace-v2'
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const distDir = join(scriptDir, '..', 'dist')
const hiddenStatuses = new Set(['archived', 'deleted', 'draft', 'pending', 'private', 'rejected'])

const escapeHtml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const escapeAttr = escapeHtml

const decodeFirestoreValue = (value) => {
  if (!value || typeof value !== 'object') return undefined
  if ('stringValue' in value) return value.stringValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('booleanValue' in value) return value.booleanValue
  if ('timestampValue' in value) return value.timestampValue
  if ('nullValue' in value) return null
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decodeFirestoreValue)
  if ('mapValue' in value) return decodeFirestoreFields(value.mapValue.fields || {})
  return undefined
}

const decodeFirestoreFields = (fields) => Object.fromEntries(
  Object.entries(fields).map(([key, value]) => [key, decodeFirestoreValue(value)])
)

const fetchJson = async (url) => {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`Firestore returned ${response.status}`)
    return response.json()
  } finally {
    clearTimeout(timeout)
  }
}

const fetchCollection = async (collectionName) => {
  const records = []
  let pageToken = ''

  do {
    const params = new URLSearchParams({
      key: firebaseConfig.apiKey,
      pageSize: '1000'
    })
    if (pageToken) params.set('pageToken', pageToken)

    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${collectionName}?${params.toString()}`
    const payload = await fetchJson(url)

    for (const document of payload.documents || []) {
      const id = document.name?.split('/').pop()
      if (!id) continue
      records.push({ id, ...decodeFirestoreFields(document.fields || {}) })
    }

    pageToken = payload.nextPageToken || ''
  } while (pageToken)

  return records
}

const isPublicModel = (model) => {
  const status = String(model.status || '').toLowerCase()
  return Boolean(model.id && model.title) &&
    model.isPublic !== false &&
    model.is_private !== true &&
    model.isDraft !== true &&
    !hiddenStatuses.has(status)
}

const getModelImages = (model) => {
  const previewImages = Array.isArray(model.previewImages) ? model.previewImages : []
  const imageFields = [
    model.thumbnail,
    model.thumbnail_path,
    model.thumbnailUrl,
    model.previewImage,
    model.image,
    model.imageUrl,
    ...previewImages.map((image) => (
      typeof image === 'string'
        ? image
        : image?.url || image?.downloadURL || image?.src || image?.path
    ))
  ]

  return Array.from(new Set(imageFields.filter((image) => (
    typeof image === 'string' && image.startsWith('http')
  ))))
}

const buildImageItems = (models) => models.flatMap((model) => (
  getModelImages(model).map((image, imageIndex) => ({
    model,
    image,
    imageIndex,
    imagePage: getModelImagePageUrl(model, imageIndex),
    modelPage: getModelUrl(model)
  }))
))

const normalizeDate = (value) => {
  const iso = toIsoDate(value)
  return iso ? iso.slice(0, 10) : ''
}

const jsonLdForModel = (model, images, pageUrl, description) => {
  const title = model.title || 'Free 3D Model'
  const format = getModelFileFormat(model)
  const published = normalizeDate(model.createdAt || model.created_at)
  const modified = normalizeDate(model.updatedAt || model.updated_at || model.createdAt || model.created_at)
  const creatorName = model.isPlatformModel ? '3D ShareSpace' : (model.author?.username || model.creatorName || model.username || '3D Creator')
  const tags = Array.isArray(model.tags) ? model.tags.filter(Boolean) : []

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: title,
      headline: title,
      description,
      url: pageUrl,
      image: images,
      thumbnailUrl: images[0],
      creator: {
        '@type': model.isPlatformModel ? 'Organization' : 'Person',
        name: creatorName
      },
      author: {
        '@type': model.isPlatformModel ? 'Organization' : 'Person',
        name: creatorName
      },
      datePublished: published || undefined,
      dateModified: modified || undefined,
      keywords: tags.length ? tags.join(', ') : undefined,
      genre: model.category || undefined,
      encodingFormat: format || undefined,
      license: model.license || undefined,
      isAccessibleForFree: true
    },
    ...images.map((image, index) => ({
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      contentUrl: image,
      url: image,
      thumbnailUrl: image,
      name: `${title} render ${index + 1}`,
      caption: getModelAltText(model, `render image ${index + 1}`),
      representativeOfPage: index === 0,
      acquireLicensePage: pageUrl,
      creditText: '3D ShareSpace'
    })),
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: 'Explore', item: `${SITE_ORIGIN}/explore` },
        { '@type': 'ListItem', position: 3, name: title, item: pageUrl }
      ]
    }
  ]
}

const renderModelHtml = (model, images, pageUrl, description) => {
  const title = model.title || 'Free 3D Model'
  const format = getModelFileFormat(model)
  const category = model.category || '3D Model'
  const tags = Array.isArray(model.tags) ? model.tags.filter(Boolean).slice(0, 12) : []
  const license = model.license || 'Free download'
  const fileSize = model.fileSize ? `${(Number(model.fileSize) / 1024 / 1024).toFixed(2)} MB` : ''
  const imageGallery = images.map((image, index) => `
        <figure>
          <a href="${escapeAttr(getModelImagePageUrl(model, index))}">
            <img src="${escapeAttr(image)}" alt="${escapeAttr(getModelAltText(model, `render image ${index + 1}`))}" loading="${index === 0 ? 'eager' : 'lazy'}" />
          </a>
          <figcaption>${escapeHtml(title)} ${escapeHtml(category)} render image ${index + 1}</figcaption>
        </figure>`).join('')

  return `
    <main class="model-prerender">
      <section class="model-hero">
        <p class="model-kicker">Free 3D Model${format ? ` · ${escapeHtml(format)}` : ''}</p>
        <h1>${escapeHtml(title)}</h1>
        <p>${escapeHtml(description)}</p>
        <div class="model-actions">
          <a class="model-primary" href="${escapeAttr(pageUrl)}">View and download model</a>
          <a href="/explore">Explore more free 3D models</a>
        </div>
      </section>
      <section class="model-gallery" aria-label="${escapeAttr(title)} render images">
        ${imageGallery}
      </section>
      <section class="model-details">
        <h2>${escapeHtml(title)} images and details</h2>
        <p>Category: ${escapeHtml(category)}${format ? ` · Format: ${escapeHtml(format)}` : ''}${fileSize ? ` · File size: ${escapeHtml(fileSize)}` : ''}</p>
        <p>License: ${escapeHtml(license)} · Free to inspect and download from the model page.</p>
        ${tags.length ? `<p>Tags: ${tags.map(escapeHtml).join(', ')}</p>` : ''}
        <ul>
          <li>Preview renders are provided for visual inspection before download.</li>
          <li>Model metadata includes category, format, license, creator, and searchable tags.</li>
          <li>Related model links inside 3D ShareSpace help users discover similar assets.</li>
        </ul>
      </section>
    </main>
  `
}

const pageHead = (model, images, pageUrl, description) => {
  const title = getModelSeoTitle(model)
  const firstImage = images[0] || `${SITE_ORIGIN}/favicon.svg`

  return `
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeAttr(description)}" />
    <meta name="keywords" content="${escapeAttr(['free 3D model', model.title, model.category, getModelFileFormat(model), ...(Array.isArray(model.tags) ? model.tags : [])].filter(Boolean).join(', '))}" />
    <link rel="canonical" href="${escapeAttr(pageUrl)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${escapeAttr(pageUrl)}" />
    <meta property="og:title" content="${escapeAttr(title)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:image" content="${escapeAttr(firstImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(title)}" />
    <meta name="twitter:description" content="${escapeAttr(description)}" />
    <meta name="twitter:image" content="${escapeAttr(firstImage)}" />
    <script type="application/ld+json">${JSON.stringify(jsonLdForModel(model, images, pageUrl, description))}</script>
    <style>
      .model-prerender{min-height:100vh;background:#050505;color:#fff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:56px 24px}
      .model-prerender a{color:#fff}
      .model-hero,.model-gallery,.model-details{max-width:1120px;margin:0 auto}
      .model-kicker{margin:0 0 14px;color:#bdbdbd;text-transform:uppercase;letter-spacing:.08em;font-size:13px}
      .model-hero h1{margin:0 0 18px;font-size:clamp(34px,6vw,68px);line-height:1;font-weight:800;letter-spacing:0}
      .model-hero p,.model-details p{max-width:820px;color:#d4d4d4;font-size:18px;line-height:1.7}
      .model-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
      .model-actions a{border:1px solid #555;padding:12px 18px;text-decoration:none;font-weight:700}
      .model-actions .model-primary{background:#fff;color:#000;border-color:#fff}
      .model-gallery{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:42px}
      .model-gallery figure{margin:0;border:1px solid #262626;background:#0d0d0d}
      .model-gallery a{display:block}
      .model-gallery img{display:block;width:100%;height:auto;aspect-ratio:16/10;object-fit:cover}
      .model-gallery figcaption{padding:12px;color:#d4d4d4;font-size:14px}
      .model-details{border-top:1px solid #262626;margin-top:42px;padding-top:28px}
      .model-details h2{margin:0 0 12px;font-size:24px}
      .model-details ul{color:#d4d4d4;line-height:1.8}
      @media (max-width:800px){.model-gallery{grid-template-columns:1fr}.model-prerender{padding:40px 18px}}
    </style>
  `
}

const imagePageHead = (model, image, imageIndex, pageUrl, modelPageUrl, description) => {
  const title = `${model.title || 'Free 3D Model'} render ${imageIndex + 1} | Free 3D Model Image`
  const imageAlt = getModelAltText(model, `render image ${imageIndex + 1}`)
  const category = model.category || '3D model'

  return `
    <title>${escapeHtml(title)} | 3D ShareSpace</title>
    <meta name="description" content="${escapeAttr(`${imageAlt}. View the render, model details, category, tags, license, and download page on 3D ShareSpace.`)}" />
    <meta name="keywords" content="${escapeAttr(['free 3D model image', model.title, category, getModelFileFormat(model), ...(Array.isArray(model.tags) ? model.tags : [])].filter(Boolean).join(', '))}" />
    <link rel="canonical" href="${escapeAttr(pageUrl)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${escapeAttr(pageUrl)}" />
    <meta property="og:title" content="${escapeAttr(title)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:image" content="${escapeAttr(image)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(title)}" />
    <meta name="twitter:description" content="${escapeAttr(description)}" />
    <meta name="twitter:image" content="${escapeAttr(image)}" />
    <script type="application/ld+json">${JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        contentUrl: image,
        url: image,
        thumbnailUrl: image,
        name: title,
        caption: imageAlt,
        description,
        representativeOfPage: true,
        acquireLicensePage: modelPageUrl,
        creditText: '3D ShareSpace',
        creator: {
          '@type': model.isPlatformModel ? 'Organization' : 'Person',
          name: model.isPlatformModel ? '3D ShareSpace' : (model.creatorName || model.username || '3D Creator')
        },
        about: {
          '@type': 'CreativeWork',
          name: model.title || 'Free 3D Model',
          url: modelPageUrl,
          genre: model.category || undefined,
          encodingFormat: getModelFileFormat(model) || undefined,
          isAccessibleForFree: true
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
          { '@type': 'ListItem', position: 2, name: model.title || 'Free 3D Model', item: modelPageUrl },
          { '@type': 'ListItem', position: 3, name: `Render ${imageIndex + 1}`, item: pageUrl }
        ]
      }
    ])}</script>
    <style>
      .image-prerender{min-height:100vh;background:#050505;color:#fff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:40px 22px}
      .image-prerender a{color:#fff}
      .image-page-wrap{max-width:1180px;margin:0 auto}
      .image-kicker{margin:0 0 12px;color:#bdbdbd;text-transform:uppercase;letter-spacing:.08em;font-size:13px}
      .image-prerender h1{margin:0 0 18px;font-size:clamp(30px,5vw,58px);line-height:1;font-weight:800;letter-spacing:0}
      .image-stage{border:1px solid #262626;background:#0d0d0d;margin-top:28px}
      .image-stage img{display:block;width:100%;height:auto;max-height:78vh;object-fit:contain;background:#111}
      .image-copy{display:grid;grid-template-columns:minmax(0,2fr) minmax(240px,1fr);gap:24px;margin-top:24px;color:#d4d4d4;line-height:1.7}
      .image-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}
      .image-actions a{border:1px solid #555;padding:12px 18px;text-decoration:none;font-weight:700}
      .image-actions .primary{background:#fff;color:#000;border-color:#fff}
      @media (max-width:800px){.image-copy{grid-template-columns:1fr}.image-prerender{padding:32px 16px}}
    </style>
  `
}

const renderImageHtml = (model, image, imageIndex, pageUrl, modelPageUrl, description) => {
  const title = model.title || 'Free 3D Model'
  const category = model.category || '3D Model'
  const format = getModelFileFormat(model)
  const tags = Array.isArray(model.tags) ? model.tags.filter(Boolean).slice(0, 10) : []

  return `
    <main class="image-prerender">
      <div class="image-page-wrap">
        <p class="image-kicker">Free 3D Model Render${format ? ` &middot; ${escapeHtml(format)}` : ''}</p>
        <h1>${escapeHtml(title)} render ${imageIndex + 1}</h1>
        <section class="image-stage">
          <img src="${escapeAttr(image)}" alt="${escapeAttr(getModelAltText(model, `render image ${imageIndex + 1}`))}" loading="eager" />
        </section>
        <section class="image-copy">
          <div>
            <h2>${escapeHtml(title)} preview image</h2>
            <p>${escapeHtml(description)}</p>
            <p>This render helps users inspect the ${escapeHtml(category.toLowerCase())} 3D model before download.</p>
            <div class="image-actions">
              <a class="primary" href="${escapeAttr(modelPageUrl)}">View and download model</a>
              <a href="/explore">Explore related models</a>
            </div>
          </div>
          <aside>
            <p><strong>Category:</strong> ${escapeHtml(category)}</p>
            ${format ? `<p><strong>Format:</strong> ${escapeHtml(format)}</p>` : ''}
            ${model.license ? `<p><strong>License:</strong> ${escapeHtml(model.license)}</p>` : ''}
            ${tags.length ? `<p><strong>Tags:</strong> ${tags.map(escapeHtml).join(', ')}</p>` : ''}
          </aside>
        </section>
      </div>
    </main>
  `
}

const imageGalleryHead = ({ title, description, pagePath, imageItems }) => {
  const firstImage = imageItems[0]?.image || `${SITE_ORIGIN}/favicon.svg`
  const pageUrl = `${SITE_ORIGIN}${pagePath}`

  return `
    <title>${escapeHtml(title)} | 3D ShareSpace</title>
    <meta name="description" content="${escapeAttr(description)}" />
    <meta name="keywords" content="${escapeAttr(['free 3D model images', '3D model renders', 'CG assets', 'model preview images'].join(', '))}" />
    <link rel="canonical" href="${escapeAttr(pageUrl)}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${escapeAttr(pageUrl)}" />
    <meta property="og:title" content="${escapeAttr(title)}" />
    <meta property="og:description" content="${escapeAttr(description)}" />
    <meta property="og:image" content="${escapeAttr(firstImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(title)}" />
    <meta name="twitter:description" content="${escapeAttr(description)}" />
    <meta name="twitter:image" content="${escapeAttr(firstImage)}" />
    <script type="application/ld+json">${JSON.stringify([
      {
        '@context': 'https://schema.org',
        '@type': 'ImageGallery',
        name: title,
        description,
        url: pageUrl,
        image: imageItems.slice(0, 30).map((item) => item.image)
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: title,
        itemListElement: imageItems.slice(0, 50).map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${SITE_ORIGIN}${item.imagePage}`,
          item: {
            '@type': 'ImageObject',
            contentUrl: item.image,
            caption: getModelAltText(item.model, `render image ${item.imageIndex + 1}`),
            acquireLicensePage: `${SITE_ORIGIN}${item.modelPage}`
          }
        }))
      }
    ])}</script>
    <style>
      .image-gallery-prerender{min-height:100vh;background:#050505;color:#fff;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding:56px 24px}
      .image-gallery-prerender a{color:#fff;text-decoration:none}
      .gallery-wrap{max-width:1220px;margin:0 auto}
      .gallery-kicker{margin:0 0 14px;color:#bdbdbd;text-transform:uppercase;letter-spacing:.08em;font-size:13px}
      .image-gallery-prerender h1{margin:0 0 18px;font-size:clamp(34px,6vw,68px);line-height:1;font-weight:800;letter-spacing:0}
      .gallery-intro{max-width:800px;color:#d4d4d4;font-size:18px;line-height:1.7}
      .gallery-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px;margin-top:36px}
      .gallery-card{border:1px solid #262626;background:#0d0d0d;overflow:hidden}
      .gallery-card img{display:block;width:100%;height:auto;aspect-ratio:4/3;object-fit:cover}
      .gallery-card div{padding:12px}
      .gallery-card h2{margin:0;color:#fff;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .gallery-card p{margin:6px 0 0;color:#9ca3af;font-size:12px}
      .gallery-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}
      .gallery-links a{border:1px solid #333;padding:10px 14px;color:#d4d4d4}
      @media (max-width:1000px){.gallery-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media (max-width:640px){.gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.image-gallery-prerender{padding:42px 16px}}
    </style>
  `
}

const renderImageGalleryHtml = ({ title, description, imageItems, selectedCategory }) => {
  const categoryLinks = modelCategoryNames.slice(0, 36)
  const galleryCards = imageItems.slice(0, 240).map((item) => `
        <a class="gallery-card" href="${escapeAttr(item.imagePage)}">
          <img src="${escapeAttr(item.image)}" alt="${escapeAttr(getModelAltText(item.model, `gallery render ${item.imageIndex + 1}`))}" loading="lazy" />
          <div>
            <h2>${escapeHtml(item.model.title || 'Free 3D Model')}</h2>
            <p>${escapeHtml(item.model.category || '3D Model')} render ${item.imageIndex + 1}</p>
          </div>
        </a>`).join('')

  return `
    <main class="image-gallery-prerender">
      <div class="gallery-wrap">
        <p class="gallery-kicker">Image discovery</p>
        <h1>${escapeHtml(title)}</h1>
        <p class="gallery-intro">${escapeHtml(description)}</p>
        <div class="gallery-links">
          <a href="/free-3d-model-images">All images</a>
          ${categoryLinks.map((category) => `<a href="/free-3d-model-images/${slugify(category)}">${escapeHtml(category)}</a>`).join('')}
        </div>
        <section class="gallery-grid" aria-label="${escapeAttr(selectedCategory || 'Free 3D model')} image renders">
          ${galleryCards}
        </section>
      </div>
    </main>
  `
}

const stripRouteHead = (template) => template
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

const prepareHtml = (template, model, images) => {
  const modelPath = getModelUrl(model)
  const pageUrl = getAbsoluteUrl(modelPath, SITE_ORIGIN)
  const description = getModelSeoDescription(model)

  return stripRouteHead(template)
    .replace(/<head>/i, `<head>\n${pageHead(model, images, pageUrl, description)}`)
    .replace('<div id="root"></div>', `<div id="root">${renderModelHtml(model, images, pageUrl, description)}</div>`)
}

const prepareImageHtml = (template, model, images, imageIndex) => {
  const image = images[imageIndex]
  const modelPath = getModelUrl(model)
  const modelPageUrl = getAbsoluteUrl(modelPath, SITE_ORIGIN)
  const imagePath = getModelImagePageUrl(model, imageIndex)
  const pageUrl = getAbsoluteUrl(imagePath, SITE_ORIGIN)
  const description = getModelSeoDescription(model)

  return stripRouteHead(template)
    .replace(/<head>/i, `<head>\n${imagePageHead(model, image, imageIndex, pageUrl, modelPageUrl, description)}`)
    .replace('<div id="root"></div>', `<div id="root">${renderImageHtml(model, image, imageIndex, pageUrl, modelPageUrl, description)}</div>`)
}

const prepareImageGalleryHtml = (template, options) => stripRouteHead(template)
  .replace(/<head>/i, `<head>\n${imageGalleryHead(options)}`)
  .replace('<div id="root"></div>', `<div id="root">${renderImageGalleryHtml(options)}</div>`)

try {
  const template = await readFile(join(distDir, 'index.html'), 'utf8')
  const models = (await fetchCollection('models')).filter(isPublicModel)
  let rendered = 0
  let renderedImages = 0

  await Promise.all(models.map(async (model) => {
    const images = getModelImages(model)
    if (!images.length) return

    const outputDir = join(distDir, getModelUrl(model))
    await mkdir(outputDir, { recursive: true })
    await writeFile(join(outputDir, 'index.html'), prepareHtml(template, model, images))
    rendered += 1

    await Promise.all(images.map(async (_image, index) => {
      const imageOutputDir = join(distDir, getModelImagePageUrl(model, index))
      await mkdir(imageOutputDir, { recursive: true })
      await writeFile(join(imageOutputDir, 'index.html'), prepareImageHtml(template, model, images, index))
      renderedImages += 1
    }))
  }))

  const allImageItems = buildImageItems(models)
  const galleryPages = [
    {
      pagePath: '/free-3d-model-images',
      title: 'Free 3D Model Images and Renders',
      description: 'Browse free 3D model renders and preview images from public uploads on 3D ShareSpace. Explore image pages, model details, tags, and download links.',
      imageItems: allImageItems,
      selectedCategory: ''
    },
    ...modelCategoryNames.map((category) => ({
      pagePath: `/free-3d-model-images/${slugify(category)}`,
      title: `Free ${category} 3D Model Images and Renders`,
      description: `Browse free ${category.toLowerCase()} 3D model renders, preview images, categories, tags, and download pages on 3D ShareSpace.`,
      imageItems: allImageItems.filter((item) => item.model.category === category),
      selectedCategory: category
    })).filter((page) => page.imageItems.length > 0)
  ]

  await Promise.all(galleryPages.map(async (page) => {
    const outputDir = join(distDir, page.pagePath)
    await mkdir(outputDir, { recursive: true })
    await writeFile(join(outputDir, 'index.html'), prepareImageGalleryHtml(template, page))
  }))

  console.log(`Prerendered ${rendered} model pages, ${renderedImages} image landing pages, and ${galleryPages.length} image gallery pages.`)
} catch (error) {
  console.warn(`Skipping model page prerendering: ${error.message}`)
}
