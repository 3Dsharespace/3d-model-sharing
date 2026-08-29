import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildPinterestRssFeeds,
  getPinterestSkippedUnsafeCount,
  PUBLIC_SITE_URL
} from '../src/lib/pinterestCsv.js'

const firebaseConfig = {
  apiKey: 'AIzaSyCtaQ7-1Hd5e_OgQ5eLT94-WVYodWcJ6mM',
  projectId: 'dsharespace-v2'
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const distDir = join(scriptDir, '..', 'dist')

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

const main = async () => {
  const models = await fetchCollection('models')
  const feeds = buildPinterestRssFeeds(models, PUBLIC_SITE_URL)
  const outputDir = join(distDir, 'rss', 'pinterest')

  await mkdir(outputDir, { recursive: true })
  await Promise.all(feeds.map((feed) => writeFile(join(outputDir, `${feed.slug}.xml`), feed.xml)))

  console.log(`Generated ${feeds.length} Pinterest RSS feeds. Skipped ${getPinterestSkippedUnsafeCount(models)} unsafe model records.`)
}

main().catch((error) => {
  console.warn(`Skipping Pinterest RSS generation: ${error.message}`)
})
