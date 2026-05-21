import { useEffect } from 'react'

const PageMeta = ({ 
  title, 
  description, 
  keywords = '', 
  image = '/favicon.svg',
  url = '',
  type = 'website',
  author = '3DShareSpace',
  publishedTime = '',
  modifiedTime = '',
  section = '',
  tags = [],
  jsonLd = null
}) => {
  const siteName = '3DShareSpace'
  const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : 'https://3dsharespace.com'
  const fullUrl = url ? `${origin}${url}` : origin
  const fullImage = image.startsWith('http') ? image : `${origin}${image}`
  const jsonLdItems = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : []

  useEffect(() => {
    if (typeof document === 'undefined') return

    document.title = title

    const managedKeys = new Set()
    const upsertElement = (key, tagName, selector, attributes) => {
      managedKeys.add(key)
      let element = document.head.querySelector(`[data-page-meta-key="${key}"]`) ||
        document.head.querySelector(selector)

      if (!element) {
        element = document.createElement(tagName)
        document.head.appendChild(element)
      }

      Object.entries(attributes).forEach(([name, value]) => {
        if (value === undefined || value === null || value === '') {
          element.removeAttribute(name)
        } else {
          element.setAttribute(name, String(value))
        }
      })

      element.setAttribute('data-page-meta', 'true')
      element.setAttribute('data-page-meta-key', key)
    }

    const metaItems = [
      ['description', 'meta', 'meta[name="description"]', { name: 'description', content: description }],
      ['keywords', 'meta', 'meta[name="keywords"]', { name: 'keywords', content: keywords }],
      ['author', 'meta', 'meta[name="author"]', { name: 'author', content: author }],
      ['robots', 'meta', 'meta[name="robots"]', { name: 'robots', content: 'index, follow' }],
      ['language', 'meta', 'meta[name="language"]', { name: 'language', content: 'English' }],
      ['revisit-after', 'meta', 'meta[name="revisit-after"]', { name: 'revisit-after', content: '7 days' }],
      ['canonical', 'link', 'link[rel="canonical"]', { rel: 'canonical', href: fullUrl }],
      ['og-type', 'meta', 'meta[property="og:type"]', { property: 'og:type', content: type }],
      ['og-url', 'meta', 'meta[property="og:url"]', { property: 'og:url', content: fullUrl }],
      ['og-title', 'meta', 'meta[property="og:title"]', { property: 'og:title', content: title }],
      ['og-description', 'meta', 'meta[property="og:description"]', { property: 'og:description', content: description }],
      ['og-image', 'meta', 'meta[property="og:image"]', { property: 'og:image', content: fullImage }],
      ['og-site-name', 'meta', 'meta[property="og:site_name"]', { property: 'og:site_name', content: siteName }],
      ['og-locale', 'meta', 'meta[property="og:locale"]', { property: 'og:locale', content: 'en_US' }],
      ['twitter-card', 'meta', 'meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' }],
      ['twitter-site', 'meta', 'meta[name="twitter:site"]', { name: 'twitter:site', content: '@3dsharespace' }],
      ['twitter-title', 'meta', 'meta[name="twitter:title"]', { name: 'twitter:title', content: title }],
      ['twitter-description', 'meta', 'meta[name="twitter:description"]', { name: 'twitter:description', content: description }],
      ['twitter-image', 'meta', 'meta[name="twitter:image"]', { name: 'twitter:image', content: fullImage }]
    ]

    if (type === 'article') {
      if (publishedTime) {
        metaItems.push(['article-published-time', 'meta', 'meta[property="article:published_time"]', { property: 'article:published_time', content: publishedTime }])
      }

      if (modifiedTime) {
        metaItems.push(['article-modified-time', 'meta', 'meta[property="article:modified_time"]', { property: 'article:modified_time', content: modifiedTime }])
      }

      if (section) {
        metaItems.push(['article-section', 'meta', 'meta[property="article:section"]', { property: 'article:section', content: section }])
      }

      tags.forEach((tag, index) => {
        metaItems.push([
          `article-tag-${index}`,
          'meta',
          `meta[data-page-meta-key="article-tag-${index}"]`,
          { property: 'article:tag', content: tag }
        ])
      })
    }

    metaItems.forEach(([key, tagName, selector, attributes]) => {
      upsertElement(key, tagName, selector, attributes)
    })

    document.head.querySelectorAll('[data-page-meta="true"]').forEach((element) => {
      const key = element.getAttribute('data-page-meta-key')
      if (key && !managedKeys.has(key)) {
        element.remove()
      }
    })

    document.head.querySelectorAll('script[data-page-meta-json="true"]').forEach((element) => element.remove())

    const structuredData = [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": siteName,
        "url": origin,
        "logo": `${origin}/favicon.svg`,
        "description": "Free 3D model sharing platform for creators worldwide",
        "sameAs": [
          "https://twitter.com/3dsharespace",
          "https://facebook.com/3dsharespace"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "email": "support@3dsharespace.com",
          "contactType": "customer service"
        }
      },
      ...jsonLdItems
    ]

    structuredData.forEach((item) => {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.setAttribute('data-page-meta-json', 'true')
      script.textContent = JSON.stringify(item)
      document.head.appendChild(script)
    })
  }, [
    author,
    description,
    fullImage,
    fullUrl,
    jsonLdItems,
    keywords,
    modifiedTime,
    origin,
    publishedTime,
    section,
    siteName,
    tags,
    title,
    type
  ])

  return null
}

export default PageMeta
