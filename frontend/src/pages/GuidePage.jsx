import React from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle } from 'lucide-react'
import PageMeta from '../components/PageMeta'
import { getSeoGuide, popularGuideLinks } from '../data/seoGuides'

const GuidePage = () => {
  const { slug } = useParams()
  const guide = getSeoGuide(slug)

  if (!guide) {
    return <Navigate to="/explore" replace />
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://3dsharespace.com'
  const canonical = `/guides/${guide.slug}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.heading,
      description: guide.description,
      url: `${origin}${canonical}`,
      author: {
        '@type': 'Organization',
        name: '3D ShareSpace'
      },
      publisher: {
        '@type': 'Organization',
        name: '3D ShareSpace',
        logo: {
          '@type': 'ImageObject',
          url: `${origin}/favicon.svg`
        }
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: origin },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${origin}/guides/${guide.slug}` },
        { '@type': 'ListItem', position: 3, name: guide.heading, item: `${origin}${canonical}` }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: guide.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }
  ]

  return (
    <div className="min-h-screen bg-white text-gray-950 dark:bg-black dark:text-white">
      <PageMeta
        title={guide.title}
        description={guide.description}
        keywords={guide.keywords}
        url={canonical}
        type="article"
        jsonLd={jsonLd}
      />

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 inline-flex items-center gap-2 border border-gray-300 px-3 py-1 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">
          <BookOpen className="h-4 w-4" />
          3D Guide
        </div>

        <h1 className="mb-5 text-4xl font-bold tracking-tight text-gray-950 dark:text-white sm:text-5xl">
          {guide.heading}
        </h1>
        <p className="mb-8 text-lg leading-8 text-gray-700 dark:text-gray-300">
          {guide.description}
        </p>

        <div className="mb-10 flex flex-wrap gap-3">
          <Link
            to={guide.relatedCta.path}
            className="inline-flex items-center gap-2 bg-gray-950 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {guide.relatedCta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-900"
          >
            Explore all models
          </Link>
        </div>

        <div className="space-y-6">
          {guide.sections.map((section) => (
            <section key={section.heading} className="border-t border-gray-200 pt-6 dark:border-gray-800">
              <h2 className="mb-3 text-2xl font-semibold text-gray-950 dark:text-white">
                {section.heading}
              </h2>
              <p className="leading-8 text-gray-700 dark:text-gray-300">
                {section.body}
              </p>
            </section>
          ))}
        </div>

        <section className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
          <h2 className="mb-4 text-2xl font-semibold text-gray-950 dark:text-white">Quick Answers</h2>
          <div className="space-y-4">
            {guide.faqs.map((faq) => (
              <div key={faq.question} className="border border-gray-200 p-5 dark:border-gray-800">
                <h3 className="mb-2 flex items-center gap-2 font-semibold text-gray-950 dark:text-white">
                  <CheckCircle className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  {faq.question}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 border-t border-gray-200 pt-6 dark:border-gray-800">
          <h2 className="mb-4 text-2xl font-semibold text-gray-950 dark:text-white">More Guides</h2>
          <div className="flex flex-wrap gap-3">
            {popularGuideLinks
              .filter((link) => link.path !== canonical)
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
        </section>
      </article>
    </div>
  )
}

export default GuidePage
