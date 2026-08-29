// Advanced Service Worker for instant page loading
const CACHE_NAME = '3d-model-sharing-v4'
const STATIC_CACHE = 'static-v4'
const DYNAMIC_CACHE = 'dynamic-v4'
const API_CACHE = 'api-v4'
const IMAGE_CACHE = 'images-v4'
const FONT_CACHE = 'fonts-v4'

// Critical routes to precache
const CRITICAL_ROUTES = [
  '/',
  '/explore',
  '/dashboard',
  '/login',
  '/signup'
]

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/favicon.svg',
  '/manifest.json'
]

// Cache strategies
const CACHE_STRATEGIES = {
  // Instant loading for pages
  pages: 'cache-first-then-network',
  // Fresh API data but with fallback
  api: 'network-first-then-cache',
  // Static assets with long cache
  static: 'cache-first',
  // Images with progressive loading
  images: 'cache-first-with-refresh'
}

// Install event - precache critical resources
self.addEventListener('install', (event) => {
  console.log('🚀 Advanced SW: Installing...')
  
  event.waitUntil(
    Promise.all([
      // Cache critical routes
      caches.open(CACHE_NAME).then(cache => {
        return cache.addAll(CRITICAL_ROUTES)
      }),
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        return cache.addAll(STATIC_ASSETS.filter(url => url !== '/'))
      })
    ]).then(() => {
      console.log('✅ Advanced SW: Precaching complete')
      return self.skipWaiting()
    })
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('🔄 Advanced SW: Activating...')
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE &&
              cacheName !== API_CACHE) {
            console.log('🗑️ Advanced SW: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      console.log('✅ Advanced SW: Activation complete')
      return self.clients.claim()
    })
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') return
  
  // Skip Chrome extension requests
  if (url.protocol === 'chrome-extension:') return
  
  // Skip external analytics/tracking requests (let them fail gracefully)
  if (url.hostname.includes('google-analytics.com') || 
      url.hostname.includes('googletagmanager.com') ||
      url.hostname.includes('firebaselogging-pa.googleapis.com')) {
    return // Don't handle these requests
  }
  
  // Skip external domains that shouldn't be cached as SPA routes
  if (url.origin !== self.location.origin && 
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('fonts.gstatic.com')) {
    return // Let external requests handle naturally
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - network first with cache fallback
    event.respondWith(handleApiRequest(request))
  } else if (url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif)$/)) {
    // Images - cache first with background refresh
    event.respondWith(handleImageRequest(request))
  } else if (url.pathname.match(/\.(js|css|woff|woff2|ttf)$/)) {
    // Static assets - cache first
    event.respondWith(handleStaticRequest(request))
  } else {
    // Pages - cache first with network fallback
    event.respondWith(handlePageRequest(request))
  }
})

// API request handler - fresh data with fallback
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    
    throw new Error('Network response not ok')
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      console.log('📱 Advanced SW: Serving API from cache:', request.url)
      return cachedResponse
    }
    
    // Return offline page for API failures
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Image request handler - cache first with background refresh
async function handleImageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    // Serve from cache immediately
    console.log('🖼️ Advanced SW: Serving image from cache:', request.url)
    
    // Background refresh for next time
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
    }).catch(() => {})
    
    return cachedResponse
  }
  
  // Not in cache - fetch and cache
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    // Return placeholder image for offline
    return new Response(
      `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">Image Offline</text>
      </svg>`,
      { headers: { 'Content-Type': 'image/svg+xml' } }
    )
  }
}

// Static asset handler - long term cache
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    console.log('📦 Advanced SW: Serving static from cache:', request.url)
    return cachedResponse
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    throw error
  }
}

// Page request handler - instant loading
async function handlePageRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  const url = new URL(request.url)
  
  // Only handle same-origin requests for SPA routing
  const isExternal = url.origin !== self.location.origin
  if (isExternal) {
    // For external resources, use network-first strategy
    return fetch(request).catch(() => {
      console.log('🌐 Advanced SW: External resource failed, serving offline:', request.url)
      return new Response('/* Offline - External resource unavailable */', {
        headers: { 'Content-Type': 'text/css' }
      })
    })
  }
  
  // For SPA routes, serve the cached index.html (same-origin only)
  if (url.pathname !== '/' && !url.pathname.includes('.')) {
    const cachedIndex = await cache.match('/')
    if (cachedIndex) {
      console.log('⚡ Advanced SW: Serving SPA route from cache:', request.url)
      return cachedIndex
    }
  }
  
  // Try cache first for instant loading
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    console.log('🏃 Advanced SW: Serving page from cache:', request.url)
    
    // Background update for next time
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone())
      }
    }).catch(() => {})
    
    return cachedResponse
  }
  
  // Not cached - fetch and cache
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    // Return offline page
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Offline - 3D Model Sharing</title>
          <style>
            body { font-family: system-ui; text-align: center; padding: 50px; }
            .offline { color: #6b7280; }
          </style>
        </head>
        <body>
          <h1>You're Offline</h1>
          <p class="offline">Please check your internet connection</p>
          <button onclick="location.reload()">Try Again</button>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  }
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'retry-failed-requests') {
    event.waitUntil(retryFailedRequests())
  }
})

async function retryFailedRequests() {
  // Implementation for retrying failed requests when back online
  console.log('🔄 Advanced SW: Retrying failed requests...')
}

// Enhanced caching strategies for better performance
async function handleFontRequest(request) {
  const cache = await caches.open(FONT_CACHE)
  const cached = await cache.match(request)
  
  if (cached) {
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      // Cache fonts for a very long time
      const clonedResponse = response.clone()
      await cache.put(request, clonedResponse)
    }
    return response
  } catch (error) {
    console.warn('Font fetch failed:', error)
    return new Response('Font not available', { status: 404 })
  }
}

async function handleImageRequest(request) {
  const cache = await caches.open(IMAGE_CACHE)
  const cached = await cache.match(request)
  
  if (cached) {
    // Serve from cache immediately and refresh in background
    backgroundRefresh(request, cache)
    return cached
  }
  
  try {
    const response = await fetch(request)
    if (response.ok) {
      const clonedResponse = response.clone()
      await cache.put(request, clonedResponse)
    }
    return response
  } catch (error) {
    console.warn('Image fetch failed:', error)
    // Return SVG placeholder for failed images
    return new Response(createImagePlaceholder(), {
      headers: { 'Content-Type': 'image/svg+xml' }
    })
  }
}

function createImagePlaceholder() {
  return `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280" font-family="system-ui">Image not available</text>
  </svg>`
}

// Enhanced background refresh with smart invalidation
async function backgroundRefresh(request, cache) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      await cache.put(request, response.clone())
    }
  } catch (error) {
    // Silent fail for background refresh
  }
}

// Performance monitoring and cache statistics
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'GET_CACHE_STATS') {
    getCacheStats().then(stats => {
      event.ports[0].postMessage(stats)
    })
  } else if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true })
    })
  }
})

async function getCacheStats() {
  const cacheNames = await caches.keys()
  const stats = { totalCaches: cacheNames.length, caches: {} }
  
  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName)
      const keys = await cache.keys()
      stats.caches[cacheName] = {
        count: keys.length,
        size: await getCacheSize(cache, keys)
      }
    } catch (error) {
      stats.caches[cacheName] = { count: 0, size: 0, error: error.message }
    }
  }
  
  return stats
}

async function getCacheSize(cache, keys) {
  let totalSize = 0
  for (const request of keys.slice(0, 10)) { // Sample first 10 for performance
    try {
      const response = await cache.match(request)
      if (response) {
        const blob = await response.blob()
        totalSize += blob.size
      }
    } catch (error) {
      // Skip failed entries
    }
  }
  return totalSize
}

async function clearAllCaches() {
  const cacheNames = await caches.keys()
  const deletePromises = cacheNames.map(cacheName => caches.delete(cacheName))
  await Promise.all(deletePromises)
  console.log('🧹 All caches cleared')
}

// Smart cache warming based on user patterns
async function warmCriticalCaches() {
  const criticalAssets = [
    '/',
    '/static/css/main.css',
    '/static/js/main.js',
    '/favicon.svg'
  ]
  
  const cache = await caches.open(STATIC_CACHE)
  
  for (const asset of criticalAssets) {
    try {
      if (!(await cache.match(asset))) {
        const response = await fetch(asset)
        if (response.ok) {
          await cache.put(asset, response)
        }
      }
    } catch (error) {
      console.warn(`Failed to warm cache for ${asset}:`, error)
    }
  }
}

// Initialize cache warming
warmCriticalCaches()
