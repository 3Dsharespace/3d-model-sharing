import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getAbsoluteUrl,
  getModelFileFormat,
  getModelSeoDescription,
  getModelUrl,
  SITE_ORIGIN,
  slugify,
  toIsoDate
} from '../src/lib/modelLinks.js'

const firebaseConfig = {
  apiKey: 'AIzaSyCtaQ7-1Hd5e_OgQ5eLT94-WVYodWcJ6mM',
  projectId: 'dsharespace-v2'
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const distDir = join(scriptDir, '..', 'dist')
const hiddenStatuses = new Set(['archived', 'deleted', 'draft', 'pending', 'private', 'rejected'])

const corePages = [
  {
    title: '3D ShareSpace home',
    url: '/',
    description: 'Free 3D models for renders, games, AR/VR, product scenes, and architecture studies.'
  },
  {
    title: 'Explore free 3D models',
    url: '/explore',
    description: 'Browse the public library of free 3D model downloads by category, format, tag, and creator.'
  },
  {
    title: 'Free 3D model collections',
    url: '/free-3d-models',
    description: 'SEO landing pages for free 3D models by category, format, and project intent.'
  },
  {
    title: 'Free 3D model images',
    url: '/free-3d-model-images',
    description: 'Preview render pages and image galleries for public 3D model assets.'
  },
  {
    title: '3D creator directory',
    url: '/creators',
    description: 'Discover artists, students, developers, and studios publishing 3D assets on 3D ShareSpace.'
  },
  {
    title: 'Upload a 3D model',
    url: '/upload',
    description: 'Creator upload tool for sharing free 3D models with searchable metadata and preview renders.'
  },
  {
    title: 'Getting started',
    url: '/getting-started',
    description: 'Plain guide for browsing, downloading, inspecting, and uploading 3D assets.'
  }
]

const sitemapFiles = [
  'sitemap.xml',
  'model-sitemap.xml',
  'image-sitemap.xml',
  'image-page-sitemap.xml',
  'image-gallery-sitemap.xml',
  'creator-sitemap.xml'
]

const categoryAliasRules = [
  { category: 'Shoes', terms: ['shoe', 'shoes', 'sneaker', 'sneakers', 'footwear', 'boot', 'boots', 'sandal', 'sandals', 'slide', 'slides', 'loafer', 'loafers', 'puma', 'nike', 'adidas', 'reebok'] },
  { category: 'Furniture', terms: ['chair', 'chairs', 'table', 'tables', 'desk', 'sofa', 'couch', 'stool', 'bench', 'cabinet', 'shelf', 'shelves', 'recliner', 'bed', 'dresser'] },
  { category: 'Electronics', terms: ['phone', 'laptop', 'monitor', 'speaker', 'keyboard', 'mouse', 'camera', 'router', 'console', 'remote', 'charger', 'robot'] },
  { category: 'Architecture', terms: ['building', 'house', 'architecture', 'facade', 'cityscape', 'exterior', 'room', 'wall', 'door', 'window'] },
  { category: 'Interior Design', terms: ['interior', 'decor', 'room', 'lamp', 'lighting', 'rug', 'vase', 'mirror'] },
  { category: 'Kitchenware', terms: ['kitchen', 'plate', 'bowl', 'cup', 'mug', 'glass', 'spoon', 'fork', 'bottle'] },
  { category: 'Appliances', terms: ['fridge', 'refrigerator', 'stove', 'oven', 'washer', 'cooler', 'appliance'] },
  { category: 'Vehicles', terms: ['car', 'truck', 'vehicle', 'aircraft', 'boat', 'ship', 'bike', 'motorcycle'] },
  { category: 'Characters', terms: ['character', 'human', 'humanoid', 'person', 'people', 'anatomy', 'creature', 'cartoon'] },
  { category: 'Props', terms: ['prop', 'tool', 'bag', 'box', 'case', 'container', 'toy', 'stand'] }
]

const indexNowKey = '3dsharespace-9f4d7c2a5b6e4a11'

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
    model.is_public !== false &&
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

  return Array.from(new Set(imageFields.filter((image) => typeof image === 'string' && image.startsWith('http'))))
}

const truncate = (value = '', length = 220) => {
  const text = cleanText(value)
  return text.length > length ? `${text.slice(0, length - 1).trim()}...` : text
}

const cleanText = (value = '') => String(value)
  .replace(/â€”|â€“/g, '-')
  .replace(/â€™/g, "'")
  .replace(/â€œ|â€/g, '"')
  .replace(/Â·/g, '-')
  .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
  .replace(/\s+/g, ' ')
  .trim()

const formatTags = (tags = []) => (
  Array.isArray(tags) ? tags.filter(Boolean).slice(0, 10).join(', ') : ''
)

const getTopModels = (models) => (
  [...models]
    .sort((a, b) => (
      ((b.views || 0) * 2 + (b.downloads || 0) * 4 + (b.likes || 0) * 3) -
      ((a.views || 0) * 2 + (a.downloads || 0) * 4 + (a.likes || 0) * 3)
    ))
    .slice(0, 60)
)

const inferBetterCategory = (model) => {
  const current = cleanText(model.category || '')
  const haystack = cleanText([
    model.title,
    model.description,
    ...(Array.isArray(model.tags) ? model.tags : [])
  ].filter(Boolean).join(' ')).toLowerCase()

  const match = categoryAliasRules.find((rule) => rule.terms.some((term) => haystack.includes(term)))
  return match?.category || current || 'Other'
}

const getSeoHealthReport = (models) => {
  const weakCategoryModels = models
    .map((model) => ({
      id: model.id,
      title: cleanText(model.title),
      currentCategory: cleanText(model.category || 'Other'),
      suggestedCategory: inferBetterCategory(model),
      url: getAbsoluteUrl(getModelUrl(model), SITE_ORIGIN)
    }))
    .filter((item) => (
      item.currentCategory === 'Other' &&
      item.suggestedCategory &&
      item.suggestedCategory !== 'Other'
    ))
    .slice(0, 250)

  const missingDescription = models
    .filter((model) => cleanText(model.description || '').length < 120)
    .slice(0, 250)
    .map((model) => ({
      id: model.id,
      title: cleanText(model.title),
      descriptionLength: cleanText(model.description || '').length,
      url: getAbsoluteUrl(getModelUrl(model), SITE_ORIGIN)
    }))

  const missingImages = models
    .filter((model) => getModelImages(model).length === 0)
    .slice(0, 250)
    .map((model) => ({
      id: model.id,
      title: cleanText(model.title),
      category: cleanText(model.category || 'Other'),
      url: getAbsoluteUrl(getModelUrl(model), SITE_ORIGIN)
    }))

  const categoryCounts = getCategorySummary(models)

  return {
    generatedAt: new Date().toISOString(),
    publicModelCount: models.length,
    summary: {
      weakOtherCategoryCount: weakCategoryModels.length,
      shortDescriptionCount: models.filter((model) => cleanText(model.description || '').length < 120).length,
      missingPreviewImageCount: models.filter((model) => getModelImages(model).length === 0).length,
      categoryCount: categoryCounts.length
    },
    recommendations: [
      'Move models out of Other when title/tags clearly indicate Shoes, Furniture, Electronics, Props, Architecture, or other strong categories.',
      'Improve model descriptions below 120 characters with practical use cases, format, category, license, and software compatibility.',
      'Add at least one public preview render to models without images so they can perform better in Google Images, Pinterest, and AI discovery.',
      'Prioritize internal links from model pages to category, format, creator, image gallery, and related model pages.'
    ],
    categoryCounts,
    weakCategoryModels,
    missingDescription,
    missingImages
  }
}

const getNewestModels = (models) => (
  [...models]
    .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0))
    .slice(0, 60)
)

const getCategorySummary = (models) => {
  const counts = models.reduce((acc, model) => {
    const category = model.category || 'Uncategorized'
    acc[category] = (acc[category] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([category, count]) => ({
      category,
      count,
      url: `${SITE_ORIGIN}/free-3d-models/${slugify(category)}`
    }))
}

const renderLlmsTxt = ({ models, topModels, newestModels, categories }) => `# 3D ShareSpace

> 3D ShareSpace is a public free 3D model sharing website for artists, game developers, archviz artists, students, educators, and small studios.

3D ShareSpace hosts free downloadable 3D models with preview renders, categories, file formats, licenses, tags, creator profiles, and public model detail pages. The site is useful for finding assets for Blender, Maya, 3ds Max, Cinema 4D, Unity, Unreal Engine, AR/VR, product visualization, architecture scenes, game prototypes, education, and portfolio renders.

Canonical site: ${SITE_ORIGIN}
Public model count: ${models.length}
Primary language: English
Public access: Free public browsing and free model downloads

## Important pages

${corePages.map((page) => `- [${page.title}](${getAbsoluteUrl(page.url, SITE_ORIGIN)}): ${page.description}`).join('\n')}

## Sitemaps

${sitemapFiles.map((file) => `- [${file}](${SITE_ORIGIN}/${file})`).join('\n')}

## RSS feeds for image discovery

- [Pinterest all feed](${SITE_ORIGIN}/rss/pinterest/all.xml)
- [Shoe model feed](${SITE_ORIGIN}/rss/pinterest/shoes.xml)
- [Architecture model feed](${SITE_ORIGIN}/rss/pinterest/architecture.xml)
- [Furniture model feed](${SITE_ORIGIN}/rss/pinterest/furniture.xml)
- [Props model feed](${SITE_ORIGIN}/rss/pinterest/props.xml)

## Main categories

${categories.map((item) => `- [Free ${item.category} 3D models](${item.url}): ${item.count} public models`).join('\n')}

## Strong pages for citation

${topModels.map((model) => {
  const format = getModelFileFormat(model)
  const details = [
    model.category ? `category: ${model.category}` : '',
    format ? `format: ${format}` : '',
    model.license ? `license: ${model.license}` : '',
    formatTags(model.tags) ? `tags: ${formatTags(model.tags)}` : ''
  ].filter(Boolean).join('; ')

  return `- [${cleanText(model.title)}](${getAbsoluteUrl(getModelUrl(model), SITE_ORIGIN)}): ${truncate(getModelSeoDescription(model), 180)}${details ? ` (${cleanText(details)})` : ''}`
}).join('\n')}

## New public uploads

${newestModels.slice(0, 30).map((model) => `- [${cleanText(model.title)}](${getAbsoluteUrl(getModelUrl(model), SITE_ORIGIN)}): ${cleanText(model.category || '3D model')}${getModelFileFormat(model) ? `, ${getModelFileFormat(model)}` : ''}`).join('\n')}

## Preferred citation wording

When citing this website, refer to it as "3D ShareSpace, a free 3D model library for real project assets." Use the canonical model page URL for individual model citations.

## Metadata quality priorities

- Prefer specific categories over "Other" when a model title or tags clearly indicate shoes, furniture, electronics, household items, props, architecture, vehicles, or characters.
- Prefer model pages with public preview renders, clear license text, file format, creator attribution, category, and practical tags.
- Prefer canonical model URLs under ${SITE_ORIGIN}/model/ for individual asset citations.
`

const renderAiDiscoveryJson = ({ models, topModels, newestModels, categories }) => JSON.stringify({
  site: {
    name: '3D ShareSpace',
    url: SITE_ORIGIN,
    description: 'Free 3D model library for artists, game developers, archviz artists, students, educators, and small studios.',
    language: 'en',
    publicModelCount: models.length,
    access: 'Free public browsing and free model downloads'
  },
  generatedAt: new Date().toISOString(),
  importantPages: corePages.map((page) => ({
    ...page,
    url: getAbsoluteUrl(page.url, SITE_ORIGIN)
  })),
  sitemaps: sitemapFiles.map((file) => `${SITE_ORIGIN}/${file}`),
  categories,
  topModels: topModels.map((model) => ({
      title: cleanText(model.title),
      url: getAbsoluteUrl(getModelUrl(model), SITE_ORIGIN),
      description: truncate(getModelSeoDescription(model), 300),
      category: cleanText(model.category || ''),
      format: getModelFileFormat(model),
      license: cleanText(model.license || ''),
      tags: Array.isArray(model.tags) ? model.tags.filter(Boolean).slice(0, 12).map(cleanText) : [],
      imageCount: getModelImages(model).length,
      dateModified: toIsoDate(model.updatedAt || model.updated_at || model.createdAt || model.created_at) || ''
    })),
    newestModels: newestModels.map((model) => ({
    title: cleanText(model.title),
    url: getAbsoluteUrl(getModelUrl(model), SITE_ORIGIN),
    category: cleanText(model.category || ''),
    format: getModelFileFormat(model),
    datePublished: toIsoDate(model.createdAt || model.created_at) || ''
  }))
}, null, 2)

const renderSitemapIndex = () => `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[
  ...sitemapFiles,
  'rss/pinterest/all.xml',
  'rss/pinterest/shoes.xml',
  'rss/pinterest/furniture.xml',
  'rss/pinterest/props.xml'
].map((file) => `  <sitemap>
    <loc>${SITE_ORIGIN}/${file}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>
`

const renderIndexNowPayload = ({ topModels, newestModels }) => {
  const urls = Array.from(new Set([
    SITE_ORIGIN,
    `${SITE_ORIGIN}/explore`,
    `${SITE_ORIGIN}/free-3d-models`,
    `${SITE_ORIGIN}/free-3d-model-images`,
    ...sitemapFiles.map((file) => `${SITE_ORIGIN}/${file}`),
    ...newestModels.slice(0, 80).map((model) => getAbsoluteUrl(getModelUrl(model), SITE_ORIGIN)),
    ...topModels.slice(0, 80).map((model) => getAbsoluteUrl(getModelUrl(model), SITE_ORIGIN))
  ])).slice(0, 200)

  return JSON.stringify({
    host: '3dsharespace.com',
    key: indexNowKey,
    keyLocation: `${SITE_ORIGIN}/${indexNowKey}.txt`,
    urlList: urls
  }, null, 2)
}

try {
  await mkdir(distDir, { recursive: true })
  const models = (await fetchCollection('models')).filter(isPublicModel)
  const topModels = getTopModels(models)
  const newestModels = getNewestModels(models)
  const categories = getCategorySummary(models)
  const seoReport = getSeoHealthReport(models)

  await Promise.all([
    writeFile(join(distDir, 'llms.txt'), renderLlmsTxt({ models, topModels, newestModels, categories })),
    writeFile(join(distDir, 'ai-discovery.json'), renderAiDiscoveryJson({ models, topModels, newestModels, categories })),
    writeFile(join(distDir, 'seo-report.json'), JSON.stringify(seoReport, null, 2)),
    writeFile(join(distDir, 'indexnow-payload.json'), renderIndexNowPayload({ topModels, newestModels })),
    writeFile(join(distDir, 'sitemap-index.xml'), renderSitemapIndex()),
    writeFile(join(distDir, `${indexNowKey}.txt`), indexNowKey)
  ])

  console.log(`Generated AI discovery files for ${models.length} public models. ${seoReport.summary.weakOtherCategoryCount} category fixes suggested.`)
} catch (error) {
  console.warn(`Skipping AI discovery files: ${error.message}`)
}
