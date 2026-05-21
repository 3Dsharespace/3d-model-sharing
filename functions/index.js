const { onRequest } = require('firebase-functions/v2/https')
const logger = require('firebase-functions/logger')

const AI_ASSIST_URL = (process.env.AI_ASSIST_URL || 'https://tank-skintight-gamma.ngrok-free.dev').replace(/\/+$/, '')

const allowedOrigins = new Set([
  'https://3dsharespace.com',
  'https://www.3dsharespace.com',
  'https://3dsharespace-com.web.app',
  'https://dsharespace-v2.web.app',
  'http://localhost:3000',
  'http://localhost:5173'
])

const setCorsHeaders = (req, res) => {
  const origin = req.get('origin')

  if (allowedOrigins.has(origin)) {
    res.set('Access-Control-Allow-Origin', origin)
    res.set('Vary', 'Origin')
  }

  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.set('Access-Control-Max-Age', '3600')
}

const getRequestBody = (req) => {
  if (req.rawBody) return req.rawBody.toString('utf8')
  if (typeof req.body === 'string') return req.body
  return JSON.stringify(req.body || {})
}

exports.uploadAssistProxy = onRequest({
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '256MiB',
  cors: false
}, async (req, res) => {
  setCorsHeaders(req, res)

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed.' })
    return
  }

  const origin = req.get('origin')
  if (origin && !allowedOrigins.has(origin)) {
    res.status(403).json({ error: 'Request blocked.' })
    return
  }

  try {
    const upstreamResponse = await fetch(`${AI_ASSIST_URL}/api/upload-assist`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: getRequestBody(req)
    })

    const body = await upstreamResponse.text()
    const contentType = upstreamResponse.headers.get('content-type') || 'application/json; charset=utf-8'

    res.status(upstreamResponse.status)
    res.set('Content-Type', contentType)
    res.send(body)
  } catch (error) {
    logger.error('Upload assist proxy failed', error)
    res.status(502).json({ error: 'Auto-fill is not available right now.' })
  }
})
