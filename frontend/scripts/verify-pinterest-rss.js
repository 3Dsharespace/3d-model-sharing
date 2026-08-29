import {
  buildPinterestRssFeeds,
  getPinterestSkippedUnsafeCount,
  PINTEREST_RSS_LIMIT,
  PINTEREST_UNSAFE_TERMS,
  validatePinterestRssFeeds
} from '../src/lib/pinterestCsv.js'
import { SITE_ORIGIN } from '../src/lib/modelLinks.js'

const sampleModels = [
  {
    id: 'shoe-model',
    title: 'Black Loafers',
    category: 'Shoes',
    fileFormat: 'ZIP',
    license: 'CC-BY-4.0',
    tags: ['black', 'loafers', 'footwear'],
    thumbnail: 'https://firebasestorage.googleapis.com/v0/b/example/o/black-loafers-render-1.jpg?alt=media',
    previewImages: [
      { url: 'https://firebasestorage.googleapis.com/v0/b/example/o/black-loafers-render-2.jpg?alt=media' }
    ],
    createdAt: '2026-05-25T12:00:00.000Z',
    isPublic: true
  },
  {
    id: 'furniture-model',
    title: 'Modern Studio Chair',
    category: 'Furniture',
    format: 'FBX',
    licenseType: 'Free',
    tags: ['chair', 'interior', 'archviz'],
    previewImages: Array.from({ length: 205 }, (_, index) => ({
      url: `https://firebasestorage.googleapis.com/v0/b/example/o/chair-render-${index + 1}.jpg?alt=media`
    })),
    createdAt: '2026-05-24T12:00:00.000Z',
    isPublic: true
  },
  {
    id: 'unsafe-model',
    title: 'Old Weapon Pack',
    category: 'Props',
    tags: ['weapon', 'game asset'],
    thumbnail: 'https://firebasestorage.googleapis.com/v0/b/example/o/unsafe-render-1.jpg?alt=media',
    createdAt: '2026-05-26T12:00:00.000Z',
    isPublic: true
  }
]

const forbiddenLinkFragments = ['localhost', '127.0.0.1', 'http://localhost', 'http://127.0.0.1']
const feeds = buildPinterestRssFeeds(sampleModels, 'https://3dsharespace.com')
const localhostFeeds = buildPinterestRssFeeds(sampleModels, 'http://localhost:3000')
const validation = validatePinterestRssFeeds(feeds)
const localhostValidation = validatePinterestRssFeeds(localhostFeeds)
const skippedUnsafeCount = getPinterestSkippedUnsafeCount(sampleModels)

const getTagValue = (itemXml, tag) => itemXml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1] || ''

const extraErrors = feeds.flatMap((feed) => {
  const errors = []
  const xml = feed.xml
  const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]

  if (!xml.trim().startsWith('<?xml version="1.0" encoding="UTF-8"?>')) errors.push(`${feed.slug}.xml missing valid XML declaration`)
  if (!/<rss\s+version="2\.0"\s+xmlns:media="http:\/\/search\.yahoo\.com\/mrss\/">/.test(xml)) errors.push(`${feed.slug}.xml missing RSS 2.0 media namespace`)
  if (!/<channel>[\s\S]*<title>[\s\S]*<\/title>[\s\S]*<link>[\s\S]*<\/link>[\s\S]*<description>[\s\S]*<\/description>/.test(xml)) errors.push(`${feed.slug}.xml missing channel fields`)
  if (itemMatches.length > PINTEREST_RSS_LIMIT) errors.push(`${feed.slug}.xml has more than ${PINTEREST_RSS_LIMIT} items`)

  itemMatches.forEach((match, index) => {
    const item = match[1]
    const title = getTagValue(item, 'title')
    const link = getTagValue(item, 'link')
    const description = getTagValue(item, 'description')
    const guid = getTagValue(item, 'guid')
    const pubDate = getTagValue(item, 'pubDate')
    const mediaUrl = item.match(/<media:content\s+url="([^"]+)"/)?.[1] || ''
    const safetyText = `${title} ${description}`.toLowerCase()

    if (!title) errors.push(`${feed.slug}.xml item ${index + 1} missing title`)
    if (!link) errors.push(`${feed.slug}.xml item ${index + 1} missing link`)
    if (!description) errors.push(`${feed.slug}.xml item ${index + 1} missing description`)
    if (!guid) errors.push(`${feed.slug}.xml item ${index + 1} missing guid`)
    if (!pubDate) errors.push(`${feed.slug}.xml item ${index + 1} missing pubDate`)
    if (!mediaUrl) errors.push(`${feed.slug}.xml item ${index + 1} missing media image URL`)
    if (forbiddenLinkFragments.some((fragment) => `${link} ${guid}`.toLowerCase().includes(fragment))) errors.push(`${feed.slug}.xml item ${index + 1} contains local link`)
    if (!link.startsWith(SITE_ORIGIN)) errors.push(`${feed.slug}.xml item ${index + 1} link does not start with ${SITE_ORIGIN}`)
    if (!guid.startsWith(SITE_ORIGIN)) errors.push(`${feed.slug}.xml item ${index + 1} guid does not start with ${SITE_ORIGIN}`)
    if (title.length > 100) errors.push(`${feed.slug}.xml item ${index + 1} title exceeds 100 characters`)
    if (description.length > 450) errors.push(`${feed.slug}.xml item ${index + 1} description exceeds 450 characters`)
    if (PINTEREST_UNSAFE_TERMS.some((term) => safetyText.includes(term))) errors.push(`${feed.slug}.xml item ${index + 1} contains unsafe term`)
  })

  return errors
})

const localhostFallbackErrors = localhostFeeds.flatMap((feed) => (
  [...feed.xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].flatMap((match, index) => {
    const item = match[1]
    const link = getTagValue(item, 'link')
    const guid = getTagValue(item, 'guid')
    const errors = []
    if (forbiddenLinkFragments.some((fragment) => `${link} ${guid}`.toLowerCase().includes(fragment))) errors.push(`${feed.slug}.xml item ${index + 1} localhost fallback failed`)
    if (!link.startsWith(SITE_ORIGIN)) errors.push(`${feed.slug}.xml item ${index + 1} localhost fallback link did not use ${SITE_ORIGIN}`)
    if (!guid.startsWith(SITE_ORIGIN)) errors.push(`${feed.slug}.xml item ${index + 1} localhost fallback guid did not use ${SITE_ORIGIN}`)
    return errors
  })
))

const errors = [
  ...validation.errors,
  ...localhostValidation.errors,
  ...extraErrors,
  ...localhostFallbackErrors
]

if (errors.length) {
  console.error('Pinterest RSS verification failed:')
  errors.forEach((error) => console.error(`- ${error}`))
  process.exit(1)
}

console.log(`Pinterest RSS verification passed: ${feeds.length} feeds. Skipped unsafe records: ${skippedUnsafeCount}.`)
