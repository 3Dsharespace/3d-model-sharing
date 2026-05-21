import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAbsoluteUrl, getModelImagePageUrl, getModelUrl, SITE_ORIGIN, slugify, toIsoDate } from '../src/lib/modelLinks.js'

const firebaseConfig = {
  apiKey: 'AIzaSyCtaQ7-1Hd5e_OgQ5eLT94-WVYodWcJ6mM',
  projectId: 'dsharespace-v2'
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const distDir = join(scriptDir, '..', 'dist')
const hiddenStatuses = new Set(['archived', 'deleted', 'draft', 'pending', 'private', 'rejected'])

const escapeXml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const decodeFirestoreValue = (value) => {
  if (!value || typeof value !== 'object') return undefined
  if ('stringValue' in value) return value.stringValue
  if ('integerValue' in value) return Number(value.integerValue)
  if ('doubleValue' in value) return Number(value.doubleValue)
  if ('booleanValue' in value) return value.booleanValue
  if ('timestampValue' in value) return value.timestampValue
  if ('nullValue' in value) return null
  if ('arrayValue' in value) {
    return (value.arrayValue.values || []).map(decodeFirestoreValue)
  }
  if ('mapValue' in value) {
    return decodeFirestoreFields(value.mapValue.fields || {})
  }

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
    if (!response.ok) {
      throw new Error(`Firestore returned ${response.status}`)
    }
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

      records.push({
        id,
        ...decodeFirestoreFields(document.fields || {})
      })
    }

    pageToken = payload.nextPageToken || ''
  } while (pageToken)

  return records
}

const fetchModels = () => fetchCollection('models')
const fetchUsers = () => fetchCollection('users')

const isPublicModel = (model) => {
  const status = String(model.status || '').toLowerCase()

  return Boolean(model.id && model.title) &&
    model.isPublic !== false &&
    model.is_private !== true &&
    model.isDraft !== true &&
    !hiddenStatuses.has(status)
}

const getModelLastModified = (model) => (
  toIsoDate(model.updatedAt || model.updated_at || model.createdAt || model.created_at)
)

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

const isPublicCreator = (creator) => (
  Boolean(creator.id && (creator.displayName || creator.username)) &&
  creator.isPublic !== false &&
  creator.profileVisibility !== 'private' &&
  creator.visibility !== 'private'
)

const renderModelSitemap = (models) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${models.map((model) => {
  const lastmod = getModelLastModified(model)

  return `  <url>
    <loc>${escapeXml(getAbsoluteUrl(getModelUrl(model), SITE_ORIGIN))}</loc>${lastmod ? `
    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''}
  </url>`
}).join('\n')}
</urlset>
`

const renderImageSitemap = (models) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${models.map((model) => {
  const images = getModelImages(model)
  if (!images.length) return ''
  const lastmod = getModelLastModified(model)

  return images.map((image, index) => {
    const imagePageUrl = getAbsoluteUrl(getModelImagePageUrl(model, index), SITE_ORIGIN)

    return `  <url>
    <loc>${escapeXml(imagePageUrl)}</loc>${lastmod ? `
    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''}
    <image:image>
      <image:loc>${escapeXml(image)}</image:loc>
    </image:image>
  </url>`
  }).join('\n')
}).filter(Boolean).join('\n')}
</urlset>
`

const renderImagePageSitemap = (models) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${models.flatMap((model) => {
  const images = getModelImages(model)
  const lastmod = getModelLastModified(model)

  return images.map((_image, index) => `  <url>
    <loc>${escapeXml(getAbsoluteUrl(getModelImagePageUrl(model, index), SITE_ORIGIN))}</loc>${lastmod ? `
    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''}
  </url>`)
}).join('\n')}
</urlset>
`

const renderImageGallerySitemap = (models) => {
  const categoriesWithImages = Array.from(new Set(
    models
      .filter((model) => getModelImages(model).length > 0 && model.category)
      .map((model) => model.category)
  ))

  const pages = [
    { path: '/free-3d-model-images', priority: '0.85' },
    ...categoriesWithImages.map((category) => ({
      path: `/free-3d-model-images/${slugify(category)}`,
      priority: '0.75'
    }))
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>
    <loc>${escapeXml(`${SITE_ORIGIN}${page.path}`)}</loc>
    <lastmod>${escapeXml(new Date().toISOString())}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>
`
}

const renderCreatorSitemap = (creators) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${creators.map((creator) => {
  const lastmod = toIsoDate(creator.updatedAt || creator.updated_at || creator.createdAt || creator.created_at)

  return `  <url>
    <loc>${escapeXml(`${SITE_ORIGIN}/profile/${encodeURIComponent(creator.id)}`)}</loc>${lastmod ? `
    <lastmod>${escapeXml(lastmod)}</lastmod>` : ''}
  </url>`
}).join('\n')}
</urlset>
`

try {
  await mkdir(distDir, { recursive: true })
  const [models, creators] = await Promise.all([
    fetchModels().then((items) => items.filter(isPublicModel)),
    fetchUsers().then((items) => items.filter(isPublicCreator))
  ])

  await Promise.all([
    writeFile(join(distDir, 'model-sitemap.xml'), renderModelSitemap(models)),
    writeFile(join(distDir, 'image-sitemap.xml'), renderImageSitemap(models)),
    writeFile(join(distDir, 'image-page-sitemap.xml'), renderImagePageSitemap(models)),
    writeFile(join(distDir, 'image-gallery-sitemap.xml'), renderImageGallerySitemap(models)),
    writeFile(join(distDir, 'creator-sitemap.xml'), renderCreatorSitemap(creators))
  ])

  console.log(`Generated model, image, image page, image gallery, and creator sitemaps for ${models.length} public models and ${creators.length} creators.`)
} catch (error) {
  console.warn(`Skipping dynamic model/creator sitemaps: ${error.message}`)
}
