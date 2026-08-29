const http = require('http')

const PORT = Number(process.env.AI_ASSIST_PORT || 8787)
const OLLAMA_URL = (process.env.OLLAMA_URL || 'http://localhost:11434').replace(/\/+$/, '')
const MAX_BODY_BYTES = Number(process.env.AI_ASSIST_MAX_BODY_BYTES || 12 * 1024 * 1024)

const allowedOrigins = new Set([
  'https://3dsharespace.com',
  'https://www.3dsharespace.com',
  'https://dsharespace-v2.web.app',
  'http://localhost:3000',
  'http://localhost:5173'
])

const requestLog = new Map()

const sendJson = (res, status, value, origin) => {
  const body = JSON.stringify(value)
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  }

  if (allowedOrigins.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers.Vary = 'Origin'
  }

  res.writeHead(status, headers)
  res.end(body)
}

const sendCors = (res, origin) => {
  const headers = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, ngrok-skip-browser-warning',
    'Access-Control-Max-Age': '86400'
  }

  if (allowedOrigins.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
    headers.Vary = 'Origin'
  }

  res.writeHead(204, headers)
  res.end()
}

const readJsonBody = (req) => new Promise((resolve, reject) => {
  let size = 0
  const chunks = []

  req.on('data', (chunk) => {
    size += chunk.length
    if (size > MAX_BODY_BYTES) {
      reject(new Error('Payload too large.'))
      req.destroy()
      return
    }
    chunks.push(chunk)
  })

  req.on('end', () => {
    try {
      const raw = Buffer.concat(chunks).toString('utf8')
      resolve(raw ? JSON.parse(raw) : {})
    } catch {
      reject(new Error('Invalid request.'))
    }
  })

  req.on('error', reject)
})

const isRateLimited = (ip) => {
  const now = Date.now()
  const windowMs = 60 * 1000
  const current = requestLog.get(ip) || []
  const recent = current.filter((time) => now - time < windowMs)
  recent.push(now)
  requestLog.set(ip, recent)
  return recent.length > 20
}

const extractJson = (value) => {
  if (!value) throw new Error('Empty response.')

  try {
    return JSON.parse(value)
  } catch {
    const match = String(value).match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Invalid response.')
    return JSON.parse(match[0])
  }
}

const pickModel = (models, wantsVision) => {
  const available = (models || []).filter((model) => model && model.name)
  const visionModel = available.find((model) => {
    const name = String(model.name).toLowerCase()
    const details = JSON.stringify(model.details || {}).toLowerCase()
    return details.includes('clip') ||
      name.includes('vision') ||
      name.includes('llava') ||
      name.includes('minicpm')
  })

  if (wantsVision && visionModel) return visionModel.name

  const preferredText =
    available.find((model) => String(model.name).toLowerCase().includes('llama3.2')) ||
    available.find((model) => String(model.name).toLowerCase().includes('llama')) ||
    available.find((model) => String(model.name).toLowerCase().includes('qwen')) ||
    available.find((model) => String(model.name).toLowerCase().includes('mistral'))

  return (preferredText || available[0] || {}).name || ''
}

const normalizeList = (value, limit = 10) => {
  const list = Array.isArray(value) ? value : String(value || '').split(',')
  return [...new Set(list.map((item) => String(item).trim()).filter(Boolean))].slice(0, limit)
}

const countWords = (value) => String(value || '').trim().split(/\s+/).filter(Boolean).length

const ensureDetailedDescription = (description, title, category) => {
  const base = String(description || '')
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !/\b(key|hotkey|shortcut|keyboard|press|control)\b/i.test(sentence))
    .join(' ')
    .trim()
  const assetName = String(title || 'This 3D model').trim()
  const assetCategory = String(category || '3D asset').trim().toLowerCase()

  if (countWords(base) >= 100) return base.slice(0, 2000)

  const extension = [
    `${assetName} can be useful for scene building, layout planning, visual previews, real-time projects, portfolio renders, and design presentations where a clear ${assetCategory} element is needed.`,
    'Creators can review the included file in their preferred 3D software, then adjust scale, orientation, materials, lighting, and surrounding objects to match the final project.',
    'It can work as a standalone asset or as part of a larger environment, product visualization, game level, architectural scene, animation blockout, or creative render.',
    'For the best result, combine it with matching props, surfaces, lighting setups, and camera angles so the model feels integrated naturally into the scene.'
  ].join(' ')

  return `${base} ${extension}`.trim().slice(0, 2000)
}

const normalizeSuggestions = (suggestions, categories, features, fields = {}, hasPreviewImage = false) => {
  const allowedCategories = Array.isArray(categories) ? categories : []
  const allowedFeatures = Array.isArray(features) ? features : []
  const requestedCategory = String(fields.category || '').trim()
  const suggestedCategory = String(suggestions.category || '').trim()
  const category = allowedCategories.includes(suggestedCategory) && suggestedCategory !== 'Other'
    ? suggestedCategory
    : allowedCategories.includes(requestedCategory)
      ? requestedCategory
      : allowedCategories.includes('Other')
        ? 'Other'
        : allowedCategories[0] || 'Other'
  const title = String(suggestions.title || '').trim().slice(0, 100)

  return {
    title,
    category,
    description: ensureDetailedDescription(suggestions.description, title, category),
    tags: normalizeList(suggestions.tags).map((tag) => tag.toLowerCase()),
    features: hasPreviewImage
      ? normalizeList(suggestions.features).filter((feature) => allowedFeatures.includes(feature))
      : []
  }
}

const createPrompt = ({ file, fields, allowedCategories, allowedFeatures, hasPreviewImage }) => [
  'You are filling public 3D model marketplace metadata.',
  'Return only valid compact JSON. Do not use markdown.',
  'Choose exactly one category from the allowed category list.',
  'Write practical SEO-friendly wording for creators, game developers, 3D artists, architects, and designers.',
  'Keep title under 70 characters and tags lowercase.',
  'Never return empty title, category, description, or tags.',
  'Description must be detailed, natural, and useful for a 3D asset listing.',
  'The description must be 5 to 7 complete sentences and at least 100 words.',
  'Write 120 to 180 words when enough information is available.',
  'Mention what the model appears to be, likely use cases, scene/project fit, material or style clues, and practical creator notes.',
  'Do not invent exact technical details like polygon count, texture resolution, rigging, software, keyboard shortcuts, hotkeys, hidden controls, or editing instructions unless already provided.',
  'If the current category is in the allowed category list and fits the file/title, keep that category.',
  'If no preview image is provided, use the file name and current fields only; avoid visual specifics that are not present in that text.',
  'Only include features when they are directly supported by the preview image or current fields. Do not infer PBR, normal maps, rigging, animation, or texture status from the file name alone.',
  'Tags must contain 5 to 10 helpful lowercase search tags.',
  'Features can be empty only when you cannot confidently choose from the allowed feature list.',
  '',
  `Allowed categories: ${(allowedCategories || []).join(', ')}`,
  `Allowed features: ${(allowedFeatures || []).join(', ')}`,
  '',
  `Preview image provided: ${hasPreviewImage ? 'yes' : 'no'}`,
  `Model file name: ${file?.name || 'not provided'}`,
  `Model file type: ${file?.type || 'not provided'}`,
  `Model file size: ${file?.size ? `${Math.round(file.size / 1024)} KB` : 'not provided'}`,
  `Current title: ${fields?.title || 'not provided'}`,
  `Current category: ${fields?.category || 'not selected'}`,
  `Current description: ${fields?.description || 'not provided'}`,
  `Current tags: ${fields?.tags || 'not provided'}`,
  '',
  'Return this JSON shape:',
  '{"title":"...","category":"...","description":"...","tags":["..."],"features":["..."]}'
].join('\n')

const askModel = async (payload) => {
  const tagsResponse = await fetch(`${OLLAMA_URL}/api/tags`)
  if (!tagsResponse.ok) throw new Error('Metadata service is unavailable.')

  const tagsData = await tagsResponse.json()
  const previewImage = (payload.previewImages || [])[0]
  const wantsVision = Boolean(previewImage?.data)
  const model = pickModel(tagsData.models, wantsVision)
  if (!model) throw new Error('Metadata service is not ready.')

  const requestBody = {
    model,
    prompt: createPrompt({
      file: payload.file || {},
      fields: payload.fields || {},
      allowedCategories: payload.allowedCategories || [],
      allowedFeatures: payload.allowedFeatures || [],
      hasPreviewImage: wantsVision
    }),
    stream: false,
    format: 'json',
    options: {
      temperature: 0.2,
      num_ctx: 2048,
      num_predict: 450
    }
  }

  if (wantsVision) {
    requestBody.images = [previewImage.data]
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 45000)

  const response = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
    signal: controller.signal
  })
  clearTimeout(timeout)

  if (!response.ok) throw new Error('Metadata generation failed.')

  const data = await response.json()
  return normalizeSuggestions(
    extractJson(data.response),
    payload.allowedCategories,
    payload.allowedFeatures,
    payload.fields || {},
    Boolean((payload.previewImages || [])[0]?.data)
  )
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin

  if (req.method === 'OPTIONS') {
    sendCors(res, origin)
    return
  }

  if (req.method === 'GET' && req.url === '/health') {
    sendJson(res, 200, { ok: true }, origin)
    return
  }

  if (req.method !== 'POST' || req.url !== '/api/upload-assist') {
    sendJson(res, 404, { error: 'Not found.' }, origin)
    return
  }

  if (origin && !allowedOrigins.has(origin)) {
    sendJson(res, 403, { error: 'Request blocked.' }, origin)
    return
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown'
  if (isRateLimited(String(ip))) {
    sendJson(res, 429, { error: 'Too many requests. Try again later.' }, origin)
    return
  }

  try {
    const payload = await readJsonBody(req)
    const suggestions = await askModel(payload)
    sendJson(res, 200, { suggestions }, origin)
  } catch (error) {
    console.warn(error.message)
    sendJson(res, 500, { error: 'Auto-fill is not available right now.' }, origin)
  }
})

server.listen(PORT, () => {
  console.log(`Upload metadata helper running on http://localhost:${PORT}`)
})
