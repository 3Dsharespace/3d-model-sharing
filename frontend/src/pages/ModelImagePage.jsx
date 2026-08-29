import React, { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Download, Image as ImageIcon, Tag } from 'lucide-react'
import PageMeta from '../components/PageMeta'
import firebaseHelpers from '../lib/firebase'
import {
  getAbsoluteUrl,
  getModelAltText,
  getModelFileFormat,
  getModelImagePageUrl,
  getModelImageSeoSlug,
  getModelSeoDescription,
  getModelUrl,
  SITE_ORIGIN
} from '../lib/modelLinks'

const getModelImages = (model) => {
  const safeModel = model || {}
  const previewImages = Array.isArray(safeModel.previewImages) ? safeModel.previewImages : []
  const imageFields = [
    safeModel.thumbnail,
    safeModel.thumbnail_path,
    safeModel.thumbnailUrl,
    safeModel.previewImage,
    safeModel.image,
    safeModel.imageUrl,
    ...previewImages.map((image) => (
      typeof image === 'string'
        ? image
        : image?.url || image?.downloadURL || image?.src || image?.path
    ))
  ]

  return Array.from(new Set(imageFields.filter((image) => typeof image === 'string' && image.startsWith('http'))))
}

const getImageIndexFromSlug = (model, imageSlug, imageCount) => {
  const exactIndex = Array.from({ length: imageCount }).findIndex((_, index) => (
    getModelImageSeoSlug(model, index) === imageSlug
  ))

  if (exactIndex >= 0) return exactIndex

  const match = String(imageSlug || '').match(/render-(\d+)$/)
  if (match) {
    return Math.max(0, Math.min(imageCount - 1, Number(match[1]) - 1))
  }

  return 0
}

const ModelImagePage = () => {
  const { modelId, imageSlug } = useParams()
  const [model, setModel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const loadModel = async () => {
      if (!modelId) return

      setLoading(true)
      const result = await firebaseHelpers.getModel(modelId)

      if (!mounted) return

      if (result.success) {
        setModel({ id: modelId, ...result.model })
        setError('')
      } else {
        setError(result.error || 'Image page not found')
      }

      setLoading(false)
    }

    loadModel()

    return () => {
      mounted = false
    }
  }, [modelId])

  const images = useMemo(() => getModelImages(model), [model])
  const imageIndex = model ? getImageIndexFromSlug(model, imageSlug, images.length) : 0
  const imageUrl = images[imageIndex]
  const modelUrl = model ? getModelUrl(model) : '/explore'
  const pagePath = model ? getModelImagePageUrl(model, imageIndex) : ''
  const title = model?.title || 'Free 3D Model'
  const format = model ? getModelFileFormat(model) : ''
  const category = model?.category || '3D Model'
  const description = model ? getModelSeoDescription(model) : ''
  const tags = Array.isArray(model?.tags) ? model.tags.filter(Boolean).slice(0, 12) : []
  const imageAlt = model ? getModelAltText(model, `render image ${imageIndex + 1}`) : 'Free 3D model render image'
  const absolutePageUrl = pagePath ? getAbsoluteUrl(pagePath, SITE_ORIGIN) : ''
  const absoluteModelUrl = getAbsoluteUrl(modelUrl, SITE_ORIGIN)

  if (!loading && (!model || error || !imageUrl)) {
    return <Navigate to="/explore" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black px-4 py-24 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="h-80 animate-pulse border border-gray-800 bg-gray-950" />
        </div>
      </div>
    )
  }

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      name: `${title} render ${imageIndex + 1}`,
      caption: imageAlt,
      description,
      contentUrl: imageUrl,
      url: imageUrl,
      thumbnailUrl: imageUrl,
      representativeOfPage: true,
      acquireLicensePage: absoluteModelUrl,
      creditText: '3D ShareSpace',
      about: {
        '@type': 'CreativeWork',
        name: title,
        url: absoluteModelUrl,
        genre: category,
        encodingFormat: format || undefined,
        isAccessibleForFree: true
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_ORIGIN },
        { '@type': 'ListItem', position: 2, name: title, item: absoluteModelUrl },
        { '@type': 'ListItem', position: 3, name: `Render ${imageIndex + 1}`, item: absolutePageUrl }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <PageMeta
        title={`${title} Render ${imageIndex + 1} - Free 3D Model Image`}
        description={`${imageAlt}. View the render, model details, tags, license, and free download page on 3D ShareSpace.`}
        keywords={['free 3D model image', title, category, format, ...tags].filter(Boolean).join(', ')}
        url={pagePath}
        image={imageUrl}
        type="article"
        jsonLd={jsonLd}
      />

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link to={modelUrl} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to model
          </Link>

          <section className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Free 3D Model Render{format ? ` / ${format}` : ''}
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
                {title} render {imageIndex + 1}
              </h1>

              <div className="mt-6 border border-gray-800 bg-gray-950">
                <img
                  src={imageUrl}
                  alt={imageAlt}
                  loading="eager"
                  className="block max-h-[78vh] w-full object-contain"
                />
              </div>
            </div>

            <aside className="lg:pt-20">
              <div className="border border-gray-800 bg-gray-950 p-5">
                <ImageIcon className="h-6 w-6 text-gray-400" />
                <h2 className="mt-4 text-xl font-semibold">Image details</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">{description}</p>

                <dl className="mt-5 space-y-3 text-sm">
                  <div>
                    <dt className="text-gray-500">Category</dt>
                    <dd className="font-medium">{category}</dd>
                  </div>
                  {format && (
                    <div>
                      <dt className="text-gray-500">Format</dt>
                      <dd className="font-medium">{format}</dd>
                    </div>
                  )}
                  {model.license && (
                    <div>
                      <dt className="text-gray-500">License</dt>
                      <dd className="font-medium">{model.license}</dd>
                    </div>
                  )}
                </dl>

                {tags.length > 0 && (
                  <div className="mt-5">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                      <Tag className="h-4 w-4" />
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <Link
                          key={tag}
                          to={`/explore?q=${encodeURIComponent(tag)}`}
                          className="border border-gray-700 px-2.5 py-1 text-xs text-gray-300 hover:border-white hover:text-white"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                  <Link
                    to={modelUrl}
                    className="inline-flex items-center justify-center gap-2 bg-white px-4 py-3 text-sm font-semibold text-black hover:bg-gray-200"
                  >
                    <Download className="h-4 w-4" />
                    View and download model
                  </Link>
                  <Link
                    to="/free-3d-model-images"
                    className="inline-flex items-center justify-center gap-2 border border-gray-700 px-4 py-3 text-sm font-semibold text-white hover:border-white"
                  >
                    Browse model images
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </aside>
          </section>

          {images.length > 1 && (
            <section className="mt-10 border-t border-gray-900 pt-8">
              <h2 className="text-2xl font-semibold">More renders from this model</h2>
              <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                {images.map((image, index) => (
                  <Link
                    key={image}
                    to={getModelImagePageUrl(model, index)}
                    className={`block border ${index === imageIndex ? 'border-white' : 'border-gray-800'} bg-gray-950`}
                  >
                    <img
                      src={image}
                      alt={getModelAltText(model, `render image ${index + 1}`)}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default ModelImagePage
