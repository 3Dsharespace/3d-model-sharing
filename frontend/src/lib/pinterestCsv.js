import {
  getAbsoluteUrl,
  getModelFileFormat,
  getModelImagePageUrl,
  SITE_ORIGIN
} from './modelLinks.js'

export const PINTEREST_CSV_COLUMNS = [
  'Title',
  'Media URL',
  'Pinterest board',
  'Thumbnail',
  'Description',
  'Link',
  'Publish date',
  'Keywords'
]

export const PINTEREST_BATCH_SIZE = 200
export const PINTEREST_RSS_LIMIT = 200
export const PUBLIC_SITE_URL = import.meta.env?.VITE_PUBLIC_SITE_URL || SITE_ORIGIN

export const PINTEREST_ALLOWED_BOARDS = [
  'Free 3D Models',
  'Free 3D Furniture Models',
  'Free 3D Architecture Models',
  'Free 3D Household Models',
  'Free 3D Props'
]

export const PINTEREST_REJECTED_COLUMNS = [
  'row number',
  'title',
  'reason skipped'
]

export const PINTEREST_UNSAFE_TERMS = [
  'firearm',
  'gun',
  'rifle',
  'pistol',
  'ammunition',
  'ammo',
  'explosive',
  'bomb',
  'grenade',
  'weapon'
]

export const PINTEREST_FEEDS = [
  { slug: 'all', label: 'All Pinterest-safe renders', board: 'Free 3D Models' },
  { slug: 'shoes', label: 'Shoes, sneakers, and footwear', board: 'Free 3D Shoe Models' },
  { slug: 'architecture', label: 'Architecture, buildings, cityscape, exterior', board: 'Free 3D Architecture Models' },
  { slug: 'interior-design', label: 'Interior design, room, decor', board: 'Free 3D Interior Design Models' },
  { slug: 'characters', label: 'Characters, people, anatomy, fantasy, cartoons, creatures', board: 'Free 3D Character Models' },
  { slug: 'vehicles', label: 'Vehicles, cars, aircraft, watercraft, space', board: 'Free 3D Vehicle Models' },
  { slug: 'furniture', label: 'Furniture, furnishings, office', board: 'Free 3D Furniture Models' },
  { slug: 'household', label: 'Household, kitchenware, appliances, lighting, tableware', board: 'Free 3D Household Models' },
  { slug: 'electronics', label: 'Electronics, technology, robots', board: 'Free 3D Electronics Models' },
  { slug: 'nature', label: 'Nature, plants, trees, landscapes', board: 'Free 3D Nature Models' },
  { slug: 'animals', label: 'Animals', board: 'Free 3D Animal Models' },
  { slug: 'props', label: 'Props and tools', board: 'Free 3D Prop Models' }
]

export const PINTEREST_BOARD_MAPPINGS = PINTEREST_FEEDS.slice(1).map((feed) => ({
  board: feed.board,
  matches: feed.label
}))

const blockedLocalLinkPatterns = ['localhost', '127.0.0.1', 'http://localhost', 'http://127.0.0.1']
const hiddenStatuses = new Set(['archived', 'deleted', 'draft', 'pending', 'private', 'rejected'])

const matcherConfig = [
  {
    slug: 'shoes',
    board: 'Free 3D Shoe Models',
    terms: ['shoes', 'shoe', 'sneaker', 'sneakers', 'footwear', 'boot', 'boots', 'sandal', 'sandals', 'puma', 'nike', 'adidas', 'reebok', 'running shoe']
  },
  {
    slug: 'architecture',
    board: 'Free 3D Architecture Models',
    terms: ['architecture', 'architectural', 'building', 'buildings', 'cityscape', 'exterior']
  },
  {
    slug: 'interior-design',
    board: 'Free 3D Interior Design Models',
    terms: ['interior design', 'interior', 'room', 'decor']
  },
  {
    slug: 'characters',
    board: 'Free 3D Character Models',
    terms: ['characters', 'character', 'people', 'person', 'anatomy', 'fantasy', 'cartoons', 'cartoon', 'creatures', 'creature']
  },
  {
    slug: 'vehicles',
    board: 'Free 3D Vehicle Models',
    terms: ['vehicles', 'vehicle', 'cars', 'car', 'aircraft', 'watercraft', 'space']
  },
  {
    slug: 'furniture',
    board: 'Free 3D Furniture Models',
    terms: ['furniture', 'furnishings', 'furnishing', 'office']
  },
  {
    slug: 'household',
    board: 'Free 3D Household Models',
    terms: ['household', 'kitchenware', 'appliances', 'appliance', 'lighting', 'tableware']
  },
  {
    slug: 'electronics',
    board: 'Free 3D Electronics Models',
    terms: ['electronics', 'electronic', 'technology', 'robots', 'robot']
  },
  {
    slug: 'nature',
    board: 'Free 3D Nature Models',
    terms: ['nature', 'plants', 'plant', 'trees', 'tree', 'landscapes', 'landscape']
  },
  {
    slug: 'animals',
    board: 'Free 3D Animal Models',
    terms: ['animals', 'animal']
  },
  {
    slug: 'props',
    board: 'Free 3D Props',
    terms: ['props', 'prop', 'tools', 'tool', 'product design', 'product']
  }
]

const truncate = (value = '', maxLength = 100) => {
  const text = String(value).replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 1).trim()
}

const unique = (items) => Array.from(new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean)))

const trimValue = (value = '') => String(value ?? '').replace(/\s+/g, ' ').trim()

const isValidHttpUrl = (value = '') => {
  const text = trimValue(value)
  if (!text) return false

  try {
    const url = new URL(text)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const includesAnyTerm = (text, terms) => {
  const normalized = ` ${String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ')} `
  return terms.some((term) => normalized.includes(` ${term.toLowerCase()} `))
}

const getPublicOrigin = (origin = PUBLIC_SITE_URL) => {
  const value = String(origin || PUBLIC_SITE_URL).trim().replace(/\/+$/, '')
  const isLocal = blockedLocalLinkPatterns.some((pattern) => value.toLowerCase().includes(pattern))
  return isLocal ? SITE_ORIGIN : value || SITE_ORIGIN
}

const getTags = (model = {}) => {
  if (Array.isArray(model.tags)) return model.tags
  if (typeof model.tags === 'string') return model.tags.split(',').map((tag) => tag.trim())
  return []
}

const getLicense = (model = {}) => model.license || model.licenseType || model.usageLicense || ''

const getSearchText = (model = {}) => unique([
  model.category,
  model.title,
  model.name,
  model.description,
  ...getTags(model)
]).join(' ')

const getMappingText = (model = {}) => unique([
  model.category,
  model.title,
  model.name,
  ...getTags(model)
]).join(' ')

const getCreatedTime = (model = {}) => {
  const value = model.publishedAt || model.published_at || model.createdAt || model.created_at || model.updatedAt || model.updated_at
  if (!value) return 0
  if (typeof value?.toDate === 'function') return value.toDate().getTime()
  if (typeof value === 'object' && typeof value.seconds === 'number') return value.seconds * 1000
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 0 : date.getTime()
}

export const getPinterestPubDate = (model = {}) => {
  const time = getCreatedTime(model)
  return new Date(time || Date.now()).toUTCString()
}

export const isPinterestUnsafeModel = (model = {}) => includesAnyTerm(getSearchText(model), PINTEREST_UNSAFE_TERMS)

export const isPinterestBaseExportModel = (model = {}) => {
  const status = String(model.status || '').toLowerCase()
  const price = Number(model.price || model.amount || model.cost || 0)

  return Boolean(model.id && (model.title || model.name)) &&
    model.isPublic !== false &&
    model.is_public !== false &&
    model.is_private !== true &&
    model.isDraft !== true &&
    price <= 0 &&
    !hiddenStatuses.has(status)
}

export const isPinterestExportModel = (model = {}) => (
  isPinterestBaseExportModel(model) && !isPinterestUnsafeModel(model)
)

export const getPinterestSkippedUnsafeCount = (models = []) => (
  models.filter((model) => isPinterestBaseExportModel(model) && isPinterestUnsafeModel(model)).length
)

export const getPinterestModelImages = (model = {}) => {
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

  return unique(imageFields).filter((image) => image.startsWith('http'))
}

export const getPinterestCategoryMatch = (model = {}) => {
  const category = String(model.category || '').toLowerCase()
  const directCategoryMatch = matcherConfig.find((matcher) => matcher.terms.includes(category))

  if (directCategoryMatch) return directCategoryMatch

  const text = getMappingText(model)
  return matcherConfig.find((matcher) => includesAnyTerm(text, matcher.terms)) || null
}

export const getPinterestBoard = (model = {}) => (
  PINTEREST_ALLOWED_BOARDS.includes(getPinterestCategoryMatch(model)?.board)
    ? getPinterestCategoryMatch(model).board
    : 'Free 3D Models'
)

export const getPinterestFeedSlugs = (model = {}) => {
  const match = getPinterestCategoryMatch(model)
  return ['all', ...(match ? [match.slug] : [])]
}

export const buildPinterestDescription = (model = {}) => {
  const modelName = model.title || model.name || '3D model'
  const category = model.category || '3D Models'
  const format = getModelFileFormat(model)
  const license = getLicense(model)
  const formatText = format ? ` in ${format} format` : ''
  const licenseText = license ? ` License: ${license}.` : ''

  return truncate(
    `Download the free 3D model ${modelName}${formatText} from the ${category} category on 3D ShareSpace. Use this render to preview the asset for Blender scenes, games, product visuals, AR/VR, archviz, and student projects.${licenseText}`,
    450
  )
}

export const buildPinterestKeywords = (model = {}) => {
  const format = getModelFileFormat(model)
  const license = getLicense(model)

  return unique([
    'free 3d model',
    '3d model download',
    '3d render',
    'blender asset',
    model.category,
    format,
    license,
    ...getTags(model)
  ]).join(', ')
}

const buildPinterestTitle = (model = {}, imageIndex = 0) => {
  const modelName = model.title || model.name || '3D Model'
  return truncate(`Free ${modelName} 3D Model Render ${imageIndex + 1}`, 100)
}

export const buildPinterestItems = (models = [], origin = PUBLIC_SITE_URL) => {
  const publicOrigin = getPublicOrigin(origin)

  return models
    .filter(isPinterestExportModel)
    .flatMap((model) => {
      const images = getPinterestModelImages(model)
      const thumbnail = images[0] || ''

      return images.map((image, imageIndex) => ({
        model,
        modelId: model.id,
        imageIndex,
        title: buildPinterestTitle(model, imageIndex),
        mediaUrl: image,
        board: getPinterestBoard(model),
        thumbnail,
        description: buildPinterestDescription(model),
        link: getAbsoluteUrl(getModelImagePageUrl(model, imageIndex), publicOrigin),
        guid: getAbsoluteUrl(getModelImagePageUrl(model, imageIndex), publicOrigin),
        pubDate: getPinterestPubDate(model),
        createdTime: getCreatedTime(model),
        keywords: buildPinterestKeywords(model),
        feedSlugs: getPinterestFeedSlugs(model)
      }))
    })
    .filter((item) => item.mediaUrl && item.link && item.link.startsWith(SITE_ORIGIN))
    .sort((a, b) => b.createdTime - a.createdTime)
}

export const validatePinterestItem = (item = {}, rowNumber = 0) => {
  const rowTitle = trimValue(item.title)
  const rowMediaUrl = trimValue(item.mediaUrl)
  const rowBoard = trimValue(item.board)
  const rowThumbnail = trimValue(item.thumbnail)
  const rowDescription = trimValue(item.description)
  const rowLink = trimValue(item.link)
  const safetyText = `${rowTitle} ${rowDescription} ${trimValue(item.keywords)} ${rowBoard}`
  const reasons = []

  if (!rowTitle) reasons.push('Missing title')
  if (!rowMediaUrl) reasons.push('Missing media URL')
  if (!rowBoard) reasons.push('Missing Pinterest board')
  if (!rowDescription) reasons.push('Missing description')
  if (!rowLink) reasons.push('Missing link')
  if (rowMediaUrl && !isValidHttpUrl(rowMediaUrl)) reasons.push('Invalid media URL')
  if (rowThumbnail && !isValidHttpUrl(rowThumbnail)) reasons.push('Invalid thumbnail URL')
  if (rowLink && !isValidHttpUrl(rowLink)) reasons.push('Invalid link URL')
  if (rowLink && blockedLocalLinkPatterns.some((pattern) => rowLink.toLowerCase().includes(pattern))) reasons.push('Localhost link is not allowed')
  if (rowLink && !rowLink.startsWith(SITE_ORIGIN)) reasons.push(`Link must start with ${SITE_ORIGIN}`)
  if (rowBoard && !PINTEREST_ALLOWED_BOARDS.includes(rowBoard)) reasons.push(`Pinterest board is not allowed: ${rowBoard}`)
  if (rowTitle.length > 100) reasons.push('Title exceeds 100 characters')
  if (rowDescription.length > 450) reasons.push('Description exceeds 450 characters')
  if (includesAnyTerm(safetyText, PINTEREST_UNSAFE_TERMS)) reasons.push('Pinterest unsafe term')

  return {
    success: reasons.length === 0,
    rejectedRow: reasons.length
      ? {
          'row number': rowNumber,
          title: rowTitle || trimValue(item.model?.title || item.model?.name || ''),
          'reason skipped': reasons.join('; ')
        }
      : null
  }
}

export const buildPinterestRows = (models = [], origin = PUBLIC_SITE_URL) => (
  buildPinterestItems(models, origin)
    .map((item, index) => ({ item, validation: validatePinterestItem(item, index + 1) }))
    .filter(({ validation }) => validation.success)
    .map(({ item }) => ({
      Title: trimValue(item.title),
      'Media URL': trimValue(item.mediaUrl),
      'Pinterest board': trimValue(item.board),
      Thumbnail: trimValue(item.thumbnail),
      Description: trimValue(item.description),
      Link: trimValue(item.link),
      'Publish date': '',
      Keywords: trimValue(item.keywords)
    }))
)

export const buildPinterestRejectedRows = (models = [], origin = PUBLIC_SITE_URL) => (
  buildPinterestItems(models, origin)
    .map((item, index) => validatePinterestItem(item, index + 1).rejectedRow)
    .filter(Boolean)
)

export const splitPinterestRows = (rows = [], batchSize = PINTEREST_BATCH_SIZE) => {
  const batches = []

  for (let index = 0; index < rows.length; index += batchSize) {
    batches.push(rows.slice(index, index + batchSize))
  }

  return batches
}

const escapeCsvCell = (value = '') => {
  const text = String(value ?? '')
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`
  return text
}

export const rowsToPinterestCsv = (rows = []) => [
  PINTEREST_CSV_COLUMNS.join(','),
  ...rows.map((row) => PINTEREST_CSV_COLUMNS.map((column) => escapeCsvCell(row[column])).join(','))
].join('\r\n')

export const rejectedRowsToCsv = (rows = []) => [
  PINTEREST_REJECTED_COLUMNS.join(','),
  ...rows.map((row) => PINTEREST_REJECTED_COLUMNS.map((column) => escapeCsvCell(row[column])).join(','))
].join('\r\n')

export const buildPinterestCsvBatches = (models = [], origin = PUBLIC_SITE_URL) => {
  const rows = buildPinterestRows(models, origin)
  const batches = splitPinterestRows(rows)
  const rejectedRows = buildPinterestRejectedRows(models, origin)

  if (typeof console !== 'undefined') {
    console.info(`Pinterest CSV export summary: total rows found=${rows.length + rejectedRows.length}, rows exported=${rows.length}, rows rejected=${rejectedRows.length}`)
  }

  return batches.map((batchRows, index) => ({
    index: index + 1,
    filename: `pinterest_upload_${String(index + 1).padStart(3, '0')}.csv`,
    rowCount: batchRows.length,
    rows: batchRows,
    csv: rowsToPinterestCsv(batchRows)
  }))
}

export const buildPinterestRejectedRowsCsv = (models = [], origin = PUBLIC_SITE_URL) => (
  rejectedRowsToCsv(buildPinterestRejectedRows(models, origin))
)

const escapeXml = (value = '') => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

export const buildPinterestRssFeed = ({ slug = 'all', items = [], origin = PUBLIC_SITE_URL } = {}) => {
  const publicOrigin = getPublicOrigin(origin)
  const feed = PINTEREST_FEEDS.find((item) => item.slug === slug) || PINTEREST_FEEDS[0]
  const feedItems = items
    .filter((item) => slug === 'all' || item.feedSlugs.includes(slug))
    .slice(0, PINTEREST_RSS_LIMIT)

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(`3D ShareSpace Pinterest - ${feed.board}`)}</title>
    <link>${escapeXml(publicOrigin)}</link>
    <description>${escapeXml(`Latest Pinterest-safe free 3D model render images for ${feed.board}.`)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${feedItems.map((item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <description>${escapeXml(item.description)}</description>
      <guid>${escapeXml(item.guid)}</guid>
      <pubDate>${escapeXml(item.pubDate)}</pubDate>
      <media:content url="${escapeXml(item.mediaUrl)}" medium="image" />
    </item>`).join('\n')}
  </channel>
</rss>
`
}

export const buildPinterestRssFeeds = (models = [], origin = PUBLIC_SITE_URL) => {
  const items = buildPinterestItems(models, origin)
  return PINTEREST_FEEDS.map((feed) => ({
    ...feed,
    path: `/rss/pinterest/${feed.slug}.xml`,
    url: `${SITE_ORIGIN}/rss/pinterest/${feed.slug}.xml`,
    itemCount: items.filter((item) => feed.slug === 'all' || item.feedSlugs.includes(feed.slug)).slice(0, PINTEREST_RSS_LIMIT).length,
    xml: buildPinterestRssFeed({ slug: feed.slug, items, origin })
  }))
}

export const validatePinterestBatches = (batches = []) => {
  const errors = []

  batches.forEach((batch) => {
    if (batch.rows.length > PINTEREST_BATCH_SIZE) {
      errors.push(`${batch.filename} has more than ${PINTEREST_BATCH_SIZE} rows`)
    }

    batch.rows.forEach((row, rowIndex) => {
      const rowColumns = Object.keys(row)
      const missingColumns = PINTEREST_CSV_COLUMNS.filter((column) => !(column in row))
      const extraColumns = rowColumns.filter((column) => !PINTEREST_CSV_COLUMNS.includes(column))
      const hasWrongColumnOrder = rowColumns.some((column, columnIndex) => column !== PINTEREST_CSV_COLUMNS[columnIndex])
      const safetyText = `${row.Title || ''} ${row.Description || ''} ${row.Keywords || ''} ${row['Pinterest board'] || ''}`

      if (missingColumns.length) errors.push(`${batch.filename} row ${rowIndex + 1} missing columns: ${missingColumns.join(', ')}`)
      if (extraColumns.length) errors.push(`${batch.filename} row ${rowIndex + 1} has extra columns: ${extraColumns.join(', ')}`)
      if (hasWrongColumnOrder) errors.push(`${batch.filename} row ${rowIndex + 1} columns are not in Pinterest order`)
      if (!trimValue(row.Title)) errors.push(`${batch.filename} row ${rowIndex + 1} is missing Title`)
      if (!row['Media URL']) errors.push(`${batch.filename} row ${rowIndex + 1} is missing Media URL`)
      if (!trimValue(row['Pinterest board'])) errors.push(`${batch.filename} row ${rowIndex + 1} is missing Pinterest board`)
      if (!trimValue(row.Description)) errors.push(`${batch.filename} row ${rowIndex + 1} is missing Description`)
      if (!row.Link) errors.push(`${batch.filename} row ${rowIndex + 1} is missing Link`)
      if (row['Media URL'] && !isValidHttpUrl(row['Media URL'])) errors.push(`${batch.filename} row ${rowIndex + 1} has invalid Media URL`)
      if (row.Thumbnail && !isValidHttpUrl(row.Thumbnail)) errors.push(`${batch.filename} row ${rowIndex + 1} has invalid Thumbnail URL`)
      if (row.Link && !isValidHttpUrl(row.Link)) errors.push(`${batch.filename} row ${rowIndex + 1} has invalid Link URL`)
      if (blockedLocalLinkPatterns.some((pattern) => String(row.Link || '').toLowerCase().includes(pattern))) errors.push(`${batch.filename} row ${rowIndex + 1} contains a local Link`)
      if (row.Link && !String(row.Link).startsWith(SITE_ORIGIN)) errors.push(`${batch.filename} row ${rowIndex + 1} Link must start with ${SITE_ORIGIN}`)
      if (row['Pinterest board'] && !PINTEREST_ALLOWED_BOARDS.includes(trimValue(row['Pinterest board']))) errors.push(`${batch.filename} row ${rowIndex + 1} Pinterest board is not allowed`)
      if (String(row.Title || '').length > 100) errors.push(`${batch.filename} row ${rowIndex + 1} title exceeds 100 characters`)
      if (String(row.Description || '').length > 450) errors.push(`${batch.filename} row ${rowIndex + 1} description exceeds 450 characters`)
      if (includesAnyTerm(safetyText, PINTEREST_UNSAFE_TERMS)) errors.push(`${batch.filename} row ${rowIndex + 1} contains unsafe Pinterest terms`)
    })
  })

  return { success: errors.length === 0, errors }
}

export const validatePinterestRssFeeds = (feeds = []) => {
  const errors = []

  feeds.forEach((feed) => {
    const xml = feed.xml || ''
    if (!xml.trim().startsWith('<?xml')) errors.push(`${feed.slug}.xml is missing XML declaration`)
    if (!/<rss\s+version="2\.0"\s+xmlns:media="http:\/\/search\.yahoo\.com\/mrss\/"/.test(xml)) errors.push(`${feed.slug}.xml is not RSS 2.0 with media namespace`)
    if (!/<channel>[\s\S]*<title>[\s\S]*<\/title>[\s\S]*<link>[\s\S]*<\/link>[\s\S]*<description>[\s\S]*<\/description>/.test(xml)) errors.push(`${feed.slug}.xml is missing required channel fields`)

    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    if (itemMatches.length > PINTEREST_RSS_LIMIT) errors.push(`${feed.slug}.xml has more than ${PINTEREST_RSS_LIMIT} items`)

    itemMatches.forEach((match, index) => {
      const item = match[1]
      const readTag = (tag) => item.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1] || ''
      const title = readTag('title')
      const link = readTag('link')
      const description = readTag('description')
      const guid = readTag('guid')
      const pubDate = readTag('pubDate')
      const mediaUrl = item.match(/<media:content\s+url="([^"]+)"/)?.[1] || ''
      const safetyText = `${title} ${description}`

      if (!title) errors.push(`${feed.slug}.xml item ${index + 1} missing title`)
      if (!link) errors.push(`${feed.slug}.xml item ${index + 1} missing link`)
      if (!description) errors.push(`${feed.slug}.xml item ${index + 1} missing description`)
      if (!guid) errors.push(`${feed.slug}.xml item ${index + 1} missing guid`)
      if (!pubDate) errors.push(`${feed.slug}.xml item ${index + 1} missing pubDate`)
      if (!mediaUrl) errors.push(`${feed.slug}.xml item ${index + 1} missing media:content URL`)
      if (blockedLocalLinkPatterns.some((pattern) => `${link} ${guid}`.toLowerCase().includes(pattern))) errors.push(`${feed.slug}.xml item ${index + 1} contains a local link`)
      if (link && !link.startsWith(SITE_ORIGIN)) errors.push(`${feed.slug}.xml item ${index + 1} link must start with ${SITE_ORIGIN}`)
      if (guid && !guid.startsWith(SITE_ORIGIN)) errors.push(`${feed.slug}.xml item ${index + 1} guid must start with ${SITE_ORIGIN}`)
      if (title.length > 100) errors.push(`${feed.slug}.xml item ${index + 1} title exceeds 100 characters`)
      if (description.length > 450) errors.push(`${feed.slug}.xml item ${index + 1} description exceeds 450 characters`)
      if (includesAnyTerm(safetyText, PINTEREST_UNSAFE_TERMS)) errors.push(`${feed.slug}.xml item ${index + 1} contains unsafe Pinterest terms`)
    })
  })

  return { success: errors.length === 0, errors }
}
