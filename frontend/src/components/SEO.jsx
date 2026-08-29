import React, { useEffect } from 'react'
import { Helmet } from 'react-helmet-async'

const SEO = ({ 
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

  useEffect(() => {
    // Update document title
    document.title = title
  }, [title])

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@3dsharespace" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      
      {/* Additional Open Graph tags for articles */}
      {type === 'article' && (
        <>
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Structured Data for Organization (default) */}
      <script type="application/ld+json">
        {JSON.stringify({
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
        })}
      </script>
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}

export default SEO
