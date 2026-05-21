import React from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'
import { ArrowRight, Box, CheckCircle, Download, Search } from 'lucide-react'
import PageMeta from '../components/PageMeta'
import {
  getCategorySeoPage,
  getCollectionSeoPage,
  getDirectSeoPage,
  getFormatSeoPage,
  getTopicSeoPage,
  popularSeoLinks,
  seoHubPage
} from '../data/programmaticSeo'

const SearchLandingPage = () => {
  const { slug } = useParams()
  const location = useLocation()
  const isHubPage = location.pathname === '/free-3d-models'
  const isFormatPage = location.pathname.startsWith('/free-3d-model-formats/')
  const isTopicPage = location.pathname.startsWith('/free-3d-model-topics/')
  const isCollectionPage = location.pathname === '/collections' || location.pathname.startsWith('/collections/')
  const directPage = getDirectSeoPage(location.pathname)
  const page = directPage || (isHubPage
    ? seoHubPage
    : isCollectionPage
    ? getCollectionSeoPage(slug)
    : isTopicPage
    ? getTopicSeoPage(slug)
    : isFormatPage
      ? getFormatSeoPage(slug)
      : getCategorySeoPage(slug))

  if (!page) {
    return <Navigate to="/explore" replace />
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://3dsharespace.com'
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: page.heading,
      description: page.description,
      url: `${origin}${page.canonical}`,
      isPartOf: {
        '@type': 'WebSite',
        name: '3D ShareSpace',
        url: origin
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: origin
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Explore',
          item: `${origin}/explore`
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: page.heading,
          item: `${origin}${page.canonical}`
        }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: `Are ${page.name} 3D models free to download?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `3D ShareSpace focuses on free 3D model discovery. Check each model page for its license, format, and creator notes before using it in a project.`
          }
        },
        {
          '@type': 'Question',
          name: `Which formats are useful for ${page.name} models?`,
          acceptedAnswer: {
            '@type': 'Answer',
            text: `Common formats include ${page.formats.join(', ')}. Availability depends on the creator upload.`
          }
        }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: page.collectionItems ? `${page.name} links` : `${page.name} search ideas`,
      itemListElement: (page.collectionItems || page.searchIdeas || page.examples || []).slice(0, 8).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.label || item,
        url: item.path ? `${origin}${item.path}` : `${origin}/explore?q=${encodeURIComponent(item)}`
      }))
    }
  ]

  return (
    <div className="min-h-screen bg-luxury-bg-primary dark:bg-black">
      <PageMeta
        title={page.title}
        description={page.description}
        keywords={page.keywords}
        url={page.canonical}
        jsonLd={jsonLd}
      />

      <section className="luxury-dark-hero border-b border-luxury-border-light dark:border-gray-800 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <div className="mb-4 inline-flex items-center gap-2 border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              <Search className="h-4 w-4" />
              Model discovery
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-5xl">
              {page.heading}
            </h1>
            <p className="max-w-3xl text-lg text-gray-700 dark:text-gray-300">
              {page.intro}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={page.ctaUrl}
                className="inline-flex items-center gap-2 bg-gray-950 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {page.ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-900"
              >
                Explore all models
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          <div className="premium-dark-surface border border-luxury-border-light bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <Box className="mb-4 h-6 w-6 text-gray-700 dark:text-gray-300" />
            <h2 className="mb-3 text-xl font-semibold text-gray-950 dark:text-white">Best For</h2>
            <p className="text-gray-700 dark:text-gray-300">{page.description}</p>
          </div>

          <div className="premium-dark-surface border border-luxury-border-light bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <CheckCircle className="mb-4 h-6 w-6 text-gray-700 dark:text-gray-300" />
            <h2 className="mb-3 text-xl font-semibold text-gray-950 dark:text-white">Common Uses</h2>
            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
              {page.examples.map((example) => (
                <li key={example} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 bg-gray-500 dark:bg-gray-400" />
                  {example}
                </li>
              ))}
            </ul>
          </div>

          <div className="premium-dark-surface border border-luxury-border-light bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <Download className="mb-4 h-6 w-6 text-gray-700 dark:text-gray-300" />
            <h2 className="mb-3 text-xl font-semibold text-gray-950 dark:text-white">Popular Formats</h2>
            <div className="flex flex-wrap gap-2">
              {page.formats.map((format) => (
                <span key={format} className="border border-gray-300 px-3 py-1 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
                  {format}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl border-t border-luxury-border-light pt-8 dark:border-gray-800">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              {page.collectionItems && (
                <div className="mb-8">
                  <h2 className="mb-4 text-2xl font-semibold text-gray-950 dark:text-white">Collection Links</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {page.collectionItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="border border-gray-300 bg-white p-4 text-sm font-semibold text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:border-white"
                      >
                        <span>{item.label}</span>
                        <ArrowRight className="mt-3 h-4 w-4 text-gray-500" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              <h2 className="mb-4 text-2xl font-semibold text-gray-950 dark:text-white">Related Searches</h2>
              {page.searchIdeas && (
                <div className="mb-5 flex flex-wrap gap-3">
                  {page.searchIdeas.map((idea) => (
                    <Link
                      key={idea}
                      to={`/explore?q=${encodeURIComponent(idea)}`}
                      className="border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-gray-300 dark:hover:bg-gray-900"
                    >
                      {idea}
                    </Link>
                  ))}
                </div>
              )}
          <div className="flex flex-wrap gap-3">
            {popularSeoLinks
              .filter((link) => link.path !== page.canonical)
              .slice(0, 18)
              .map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="border border-gray-300 px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-900"
                >
                  {link.label}
                </Link>
              ))}
          </div>
            </div>
            <aside className="border border-gray-300 bg-white p-5 dark:border-gray-800 dark:bg-black">
              <h2 className="text-lg font-semibold text-gray-950 dark:text-white">What Google can understand</h2>
              <ul className="mt-4 space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li>Focused title and description for this search.</li>
                <li>Clear links into matching models and image pages.</li>
                <li>Structured data for collection, FAQ, and search ideas.</li>
                <li>Internal links to related category and format pages.</li>
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SearchLandingPage
