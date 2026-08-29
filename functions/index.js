const { onRequest, onCall, HttpsError } = require('firebase-functions/v2/https')
const logger = require('firebase-functions/logger')
const { defineSecret } = require('firebase-functions/params')
const admin = require('firebase-admin')
const crypto = require('crypto')

if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()
const { FieldValue } = admin.firestore

const RAZORPAY_KEY_ID = defineSecret('RAZORPAY_KEY_ID')
const RAZORPAY_KEY_SECRET = defineSecret('RAZORPAY_KEY_SECRET')
const RAZORPAY_TEST_KEY_ID = defineSecret('RAZORPAY_TEST_KEY_ID')
const RAZORPAY_TEST_KEY_SECRET = defineSecret('RAZORPAY_TEST_KEY_SECRET')

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
    if (!upstreamResponse.ok) {
      logger.warn('Upload assist upstream unavailable', {
        status: upstreamResponse.status,
        upstream: AI_ASSIST_URL
      })
      res.status(502).json({ error: 'Auto-fill is not available right now.' })
      return
    }

    const contentType = upstreamResponse.headers.get('content-type') || 'application/json; charset=utf-8'
    res.status(upstreamResponse.status)
    res.set('Content-Type', contentType)
    res.send(body)
  } catch (error) {
    logger.error('Upload assist proxy failed', error)
    res.status(502).json({ error: 'Auto-fill is not available right now.' })
  }
})

const TIP_FEE_RATE = 0.15
const MIN_TIP_AMOUNT = 10
const MAX_TIP_AMOUNT = 100000

const cleanString = (value, maxLength = 500) => String(value || '').trim().slice(0, maxLength)

const getAmount = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return 0
  return Math.round(amount * 100) / 100
}

const SUPPORT_TYPES = new Set([
  'support',
  'account',
  'upload',
  'download',
  'bug',
  'feedback',
  'ip_infringement',
  'inappropriate',
  'other'
])

const getTipBreakdown = (amount) => {
  const platformFee = Math.round(amount * TIP_FEE_RATE * 100) / 100
  return {
    amount,
    platformFee,
    creatorAmount: Math.round((amount - platformFee) * 100) / 100
  }
}

const requireSignedIn = (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Please log in to send tips.')
  }

  return request.auth
}

const getProfileName = async (uid, fallback = 'Creator') => {
  if (!uid) return fallback

  try {
    const snap = await db.collection('users').doc(uid).get()
    if (!snap.exists) return fallback
    const data = snap.data() || {}
    return cleanString(data.displayName || data.username || data.name || fallback, 80)
  } catch (error) {
    logger.warn('Unable to read profile name', { uid, error: error.message })
    return fallback
  }
}

const getAdminUsers = async () => {
  const adminMap = new Map()
  const queries = [
    db.collection('users').where('role', 'in', ['admin', 'super_admin', 'administrator']).limit(50).get(),
    db.collection('users').where('isAdmin', '==', true).limit(50).get()
  ]

  const snapshots = await Promise.allSettled(queries)
  snapshots.forEach((result) => {
    if (result.status !== 'fulfilled') return
    result.value.forEach((doc) => {
      adminMap.set(doc.id, { uid: doc.id, ...(doc.data() || {}) })
    })
  })

  return Array.from(adminMap.values())
}

const notifyAdmins = async ({ type, message, actionUrl, ticketId, priority = 'medium' }) => {
  const admins = await getAdminUsers()
  if (!admins.length) {
    logger.warn('No admin users found for support notification', { ticketId })
    return 0
  }

  const now = FieldValue.serverTimestamp()
  const batch = db.batch()

  admins.forEach((adminUser) => {
    const notificationRef = db.collection('notifications').doc()
    batch.set(notificationRef, {
      id: notificationRef.id,
      recipientId: adminUser.uid,
      user_id: adminUser.uid,
      actorId: null,
      actorName: '3D ShareSpace Support',
      type,
      priority,
      reportId: ticketId,
      message,
      read: false,
      actionUrl,
      createdAt: now,
      created_at: now
    })
  })

  await batch.commit()
  return admins.length
}

exports.submitSupportRequest = onCall({
  region: 'us-central1',
  timeoutSeconds: 30,
  memory: '256MiB'
}, async (request) => {
  const data = request.data || {}
  const type = cleanString(data.type || 'support', 40)
  const name = cleanString(data.name, 120)
  const email = cleanString(data.email, 200).toLowerCase()
  const subject = cleanString(data.subject || data.reason || 'Support request', 160)
  const details = cleanString(data.message || data.details, 4000)
  const url = cleanString(data.url, 600)
  const modelId = cleanString(data.modelId, 180)
  const priority = ['low', 'medium', 'high'].includes(data.priority) ? data.priority : (
    type === 'ip_infringement' ? 'high' : 'medium'
  )

  if (!SUPPORT_TYPES.has(type)) {
    throw new HttpsError('invalid-argument', 'Choose a valid support type.')
  }

  if (!email || email.length < 5 || !email.includes('@')) {
    throw new HttpsError('invalid-argument', 'Enter a valid contact email.')
  }

  if (!details || details.length < 10) {
    throw new HttpsError('invalid-argument', 'Add at least 10 characters of detail.')
  }

  const now = FieldValue.serverTimestamp()
  const ticketRef = db.collection('reports').doc()
  const ticket = {
    id: ticketRef.id,
    type,
    name,
    subject,
    email,
    details,
    message: details,
    modelId,
    url,
    status: 'pending',
    priority,
    source: type === 'support' || type === 'account' || type === 'upload' || type === 'download' || type === 'bug' || type === 'feedback'
      ? 'contact'
      : 'report',
    reporterId: request.auth?.uid || null,
    createdAt: now,
    updatedAt: now
  }

  await ticketRef.set(ticket)

  const label = type === 'support' ? 'Support request' : type.replace(/_/g, ' ')
  const adminCount = await notifyAdmins({
    type: 'support',
    ticketId: ticketRef.id,
    priority,
    actionUrl: `/admin?tab=${ticket.source === 'contact' ? 'support' : 'reports'}`,
    message: `${label}: ${subject || email}`
  })

  logger.info('Support request submitted', { ticketId: ticketRef.id, type, adminCount })

  return {
    success: true,
    ticketId: ticketRef.id,
    notifiedAdmins: adminCount
  }
})

const validateTipInput = (data, auth) => {
  const creatorId = cleanString(data.creatorId, 120)
  const amount = getAmount(data.amount)

  if (!creatorId) {
    throw new HttpsError('invalid-argument', 'Creator account is missing.')
  }

  if (creatorId === auth.uid) {
    throw new HttpsError('invalid-argument', 'You cannot tip your own account.')
  }

  if (amount < MIN_TIP_AMOUNT) {
    throw new HttpsError('invalid-argument', `Minimum tip amount is INR ${MIN_TIP_AMOUNT}.`)
  }

  if (amount > MAX_TIP_AMOUNT) {
    throw new HttpsError('invalid-argument', `Maximum tip amount is INR ${MAX_TIP_AMOUNT}.`)
  }

  return {
    creatorId,
    amount,
    currency: cleanString(data.currency || 'INR', 8).toUpperCase(),
    message: cleanString(data.message, 200),
    modelId: cleanString(data.modelId, 180),
    modelTitle: cleanString(data.modelTitle, 140),
    testMode: data.testMode === true
  }
}

const getRazorpayCredentials = (testMode = false) => {
  const readSecret = (secret, envName) => {
    if (process.env[envName]) return String(process.env[envName]).trim()
    try {
      return String(secret.value() || '').trim()
    } catch (error) {
      return ''
    }
  }

  const liveKeyId = readSecret(RAZORPAY_KEY_ID, 'RAZORPAY_KEY_ID')
  const liveKeySecret = readSecret(RAZORPAY_KEY_SECRET, 'RAZORPAY_KEY_SECRET')
  const testKeyId = readSecret(RAZORPAY_TEST_KEY_ID, 'RAZORPAY_TEST_KEY_ID')
  const testKeySecret = readSecret(RAZORPAY_TEST_KEY_SECRET, 'RAZORPAY_TEST_KEY_SECRET')
  const keyId = testMode ? (testKeyId || liveKeyId) : (liveKeyId || testKeyId)
  const keySecret = testMode ? (testKeySecret || liveKeySecret) : (liveKeySecret || testKeySecret)

  if (!keyId || !keySecret) {
    throw new HttpsError(
      'failed-precondition',
      testMode
        ? 'Razorpay test keys are not configured yet.'
        : 'Razorpay live keys are not configured yet.'
    )
  }

  return { keyId, keySecret }
}

const createRemoteRazorpayOrder = async ({ amount, currency, creatorId, modelId, modelTitle, message, auth, testMode }) => {
  const { keyId, keySecret } = getRazorpayCredentials(testMode)
  const receipt = `tip_${auth.uid.slice(0, 12)}_${Date.now()}`
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: Math.round(amount * 100),
      currency,
      receipt,
      notes: {
        creatorId,
        supporterId: auth.uid,
        modelId: modelId || '',
        modelTitle: modelTitle || '',
        message: message || ''
      }
    })
  })

  const body = await response.json().catch(() => ({}))
  if (!response.ok) {
    logger.error('Razorpay order creation failed', { status: response.status, body })
    const description = body?.error?.description || 'Could not create Razorpay order.'
    const isAuthError = /authentication failed/i.test(description)
    throw new HttpsError(
      isAuthError ? 'failed-precondition' : 'internal',
      isAuthError
        ? 'Razorpay credentials failed. Please check the live key ID and key secret in Firebase secrets.'
        : description
    )
  }

  return { body, keyId }
}

const recordTip = async ({ auth, tip, paymentId, orderId, provider = 'razorpay', status = 'completed' }) => {
  const senderName = cleanString(auth.token?.name || auth.token?.email?.split('@')[0] || 'A supporter', 80)
  const recipientName = await getProfileName(tip.creatorId, 'Creator')
  const breakdown = getTipBreakdown(tip.amount)
  const tipId = cleanString(paymentId || `tip_${auth.uid}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, 220)
  const tipRef = db.collection('tips').doc(tipId)
  const existingTip = await tipRef.get()

  if (existingTip.exists) {
    return { id: existingTip.id, ...existingTip.data() }
  }

  const now = FieldValue.serverTimestamp()
  const publicTip = {
    fromUserId: auth.uid,
    toUserId: tip.creatorId,
    creatorId: tip.creatorId,
    senderName,
    recipientName,
    amount: breakdown.amount,
    platformFee: breakdown.platformFee,
    creatorAmount: breakdown.creatorAmount,
    currency: tip.currency,
    message: tip.message,
    modelId: tip.modelId || null,
    modelTitle: tip.modelTitle || null,
    provider,
    paymentId,
    orderId,
    status,
    testMode: tip.testMode,
    createdAt: now,
    created_at: now
  }

  await tipRef.set(publicTip)

  const notificationRef = db.collection('notifications').doc()
  const modelText = tip.modelTitle ? ` for ${tip.modelTitle}` : ''
  await notificationRef.set({
    id: notificationRef.id,
    recipientId: tip.creatorId,
    user_id: tip.creatorId,
    actorId: auth.uid,
    actorName: senderName,
    type: 'tip',
    amount: breakdown.amount,
    currency: tip.currency,
    modelId: tip.modelId || null,
    modelTitle: tip.modelTitle || null,
    message: `${senderName} sent you INR ${breakdown.amount.toFixed(2)}${modelText}.`,
    tipMessage: tip.message || '',
    read: false,
    actionUrl: tip.modelId ? `/model/${tip.modelId}` : `/profile/${auth.uid}`,
    createdAt: now,
    created_at: now
  })

  await db.collection('users').doc(tip.creatorId).set({
    tipStats: {
      totalReceived: FieldValue.increment(breakdown.creatorAmount),
      totalTips: FieldValue.increment(1),
      lastTipAt: now
    }
  }, { merge: true })

  return { id: tipRef.id, ...publicTip }
}

exports.createRazorpayOrder = onCall({
  region: 'us-central1',
  timeoutSeconds: 30,
  memory: '256MiB',
  secrets: [RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, RAZORPAY_TEST_KEY_ID, RAZORPAY_TEST_KEY_SECRET]
}, async (request) => {
  const auth = requireSignedIn(request)
  const tip = validateTipInput(request.data || {}, auth)

  if (tip.testMode) {
    const orderId = `order_test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    return {
      success: true,
      testMode: true,
      key: 'rzp_test_mock',
      keyId: 'rzp_test_mock',
      orderId,
      amount: Math.round(tip.amount * 100),
      currency: tip.currency
    }
  }

  const { body, keyId } = await createRemoteRazorpayOrder({ ...tip, auth })

  return {
    success: true,
    testMode: false,
    key: keyId,
    keyId,
    orderId: body.id,
    amount: body.amount,
    currency: body.currency,
    receipt: body.receipt
  }
})

exports.verifyRazorpayPayment = onCall({
  region: 'us-central1',
  timeoutSeconds: 30,
  memory: '256MiB',
  secrets: [RAZORPAY_KEY_SECRET, RAZORPAY_TEST_KEY_SECRET]
}, async (request) => {
  const auth = requireSignedIn(request)
  const tip = validateTipInput(request.data || {}, auth)
  const paymentId = cleanString(request.data?.paymentId, 180)
  const orderId = cleanString(request.data?.orderId, 180)
  const signature = cleanString(request.data?.signature, 220)

  if (!tip.testMode) {
    if (!paymentId || !orderId || !signature) {
      throw new HttpsError('invalid-argument', 'Payment verification details are missing.')
    }

    const { keySecret } = getRazorpayCredentials(tip.testMode)
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    if (expectedSignature !== signature) {
      throw new HttpsError('permission-denied', 'Payment signature verification failed.')
    }
  }

  const tipRecord = await recordTip({
    auth,
    tip,
    paymentId: paymentId || `test_payment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    orderId,
    provider: tip.testMode ? 'test' : 'razorpay'
  })

  return { success: true, tipId: tipRecord.id }
})

exports.sendTip = onCall({
  region: 'us-central1',
  timeoutSeconds: 30,
  memory: '256MiB'
}, async (request) => {
  const auth = requireSignedIn(request)
  const tip = validateTipInput({ ...(request.data || {}), testMode: true }, auth)
  const tipRecord = await recordTip({
    auth,
    tip,
    paymentId: `test_payment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    orderId: `order_test_${Date.now()}`,
    provider: 'test'
  })

  return { success: true, tipId: tipRecord.id }
})

exports.getTipHistory = onCall({
  region: 'us-central1',
  timeoutSeconds: 30,
  memory: '256MiB'
}, async (request) => {
  const auth = requireSignedIn(request)
  const userId = cleanString(request.data?.userId || auth.uid, 120)
  const type = request.data?.type === 'received' ? 'received' : 'sent'

  if (userId !== auth.uid) {
    throw new HttpsError('permission-denied', 'You can only view your own tips.')
  }

  const field = type === 'received' ? 'toUserId' : 'fromUserId'
  const snapshot = await db.collection('tips')
    .where(field, '==', userId)
    .orderBy('createdAt', 'desc')
    .limit(100)
    .get()

  const tips = snapshot.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      ...data,
      timestamp: data.createdAt?.toDate?.()?.toISOString?.() || null,
      createdAt: data.createdAt?.toDate?.()?.toISOString?.() || null
    }
  })

  return { success: true, tips }
})

exports.getCreatorEarnings = onCall({
  region: 'us-central1',
  timeoutSeconds: 30,
  memory: '256MiB'
}, async (request) => {
  const auth = requireSignedIn(request)
  const userId = cleanString(request.data?.userId || auth.uid, 120)
  const timeRange = cleanString(request.data?.timeRange || '30d', 12)

  if (userId !== auth.uid) {
    throw new HttpsError('permission-denied', 'You can only view your own earnings.')
  }

  const days = { '7d': 7, '30d': 30, '90d': 90 }[timeRange]
  let query = db.collection('tips').where('toUserId', '==', userId)

  if (days) {
    query = query.where('createdAt', '>=', admin.firestore.Timestamp.fromDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000)))
  }

  const snapshot = await query.orderBy('createdAt', 'desc').limit(500).get()
  const tips = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
  const totalEarnings = tips.reduce((sum, tip) => sum + Number(tip.creatorAmount || 0), 0)
  const totalTips = tips.length

  return {
    success: true,
    totalEarnings,
    totalTips,
    averageTip: totalTips ? totalEarnings / totalTips : 0,
    recentTips: tips.slice(0, 5).map((tip) => ({
      id: tip.id,
      amount: Number(tip.amount || 0),
      creatorAmount: Number(tip.creatorAmount || 0),
      senderName: tip.senderName || 'Supporter',
      modelId: tip.modelId || null,
      modelTitle: tip.modelTitle || null,
      message: tip.message || '',
      timestamp: tip.createdAt?.toDate?.()?.toISOString?.() || null
    }))
  }
})
