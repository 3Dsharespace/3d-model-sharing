import React, { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowRight, Image as ImageIcon, Search } from 'lucide-react'
import PageMeta from '../components/PageMeta'
import firebaseHelpers from '../lib/firebase'
import { modelCategoryNames } from '../data/modelCategories'
import {
  getAbsoluteUrl,
  getModelAltText,
  getModelImagePageUrl,
  getModelSeoDescription,
  getModelUrl,
  SITE_ORIGIN,
  slugify
} from '../lib/modelLinks'

const hiddenStatuses = new Set(['archived', 'deleted', 'draft', 'pending', 'private', 'rejected'])

const isPublicModel = (model) => {
  const status = String(model.status || '').toLowerCase()
  return Boolean(model.id && model.title) &&
    model.isPublic !== false &&
    model.is_private !== true &&
    model.isDraft !== true &&
    !hiddenStatuses.has(status)
}

const getModelImages = (model = {}) => {
  const previewImages = Array.isArray(model.previewImages) ? model.previewImages : []
  const imageFields = [
    model.thumbnail,
    model.thumbnail_path,
    model.thumbnailUrl,
    model.previewImage,
    model.image,
    model.imageUrl,
    ...previewImages.map((image) => (
      typeof image === 'string'
        ? image
        : image?.url || image?.downloadURL || image?.src || image?.path
    ))
  ]

  return Array.from(new Set(imageFields.filter((image) => typeof image === 'string' && image.startsWith('http'))))
}

const buildImageItems = (models) => models.flatMap((model) => (
  getModelImages(model).map((image, imageIndex) => ({
    model,
    image,
    imageIndex,
    imagePage: getModelImagePageUrl(model, imageIndex),
    modelPage: getModelUrl(model)
  }))
))

const getCategoryFromSlug = (categorySlug) => {
  if (!categorySlug) return null
  return modelCategoryNames.find((category) => slugify(category) === categorySlug)
}

const ImageGalleryPage = () => {
  const { categorySlug } = useParams()
  const selectedCategory = getCategoryFromSlug(categorySlug)
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const loadModels = async () => {
      const result = await firebaseHelpers.getModels()
      if (!mounted) return

      if (result.success) {
        setModels(result.models.filter(isPublicModel))
      }

      setLoading(false)
    }

    loadModels()

    return () => {
      mounted = false
    }
  }, [])

  const filteredModels = useMemo(() => (
    selectedCategory
      ? models.filter((model) => model.category === selectedCategory)
      : models
  ), [models, selectedCategory])

  const imageItems = useMemo(() => buildImageItems(filteredModels).slice(0, 240), [filteredModels])
  const categoryLinks = useMemo(() => (
    modelCategoryNames
      .map((category) => ({
        category,
        count: buildImageItems(models.filter((model) => model.category === category)).length
      }))
      .filter((item) => item.count > 0)
      .slice(0, 28)
  ), [models])

  if (categorySlug && !selectedCategory) {
    return <Navigate to="/free-3d-model-images" replace />
  }

  const pageTitle = selectedCategory
    ? `Free ${selectedCategory} 3D Model Images and Renders`
    : 'Free 3D Model Images and Renders'
  const pageDescription = selectedCategory
    ? `Browse free ${selectedCategory.toLowerCase()} 3D model renders, preview images, categories, tags, and download pages on 3D ShareSpace.`
    : 'Browse free 3D model renders and preview images from public uploads on 3D ShareSpace. Explore image pages, model details, tags, and download links.'
  const pagePath = selectedCategory
    ? `/free-3d-model-images/${slugify(selectedCategory)}`
    : '/free-3d-model-images'
  const origin = typeof window !== 'undefined' ? window.location.origin : SITE_ORIGIN
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'ImageGallery',
      name: pageTitle,
      description: pageDescription,
      url: `${origin}${pagePath}`,
      image: imageItems.slice(0, 20).map((item) => item.image)
    },
    {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: pageTitle,
      itemListElement: imageItems.slice(0, 50).map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: getAbsoluteUrl(item.imagePage, origin),
        item: {
          '@type': 'ImageObject',
          contentUrl: item.image,
          caption: getModelAltText(item.model, `render image ${item.imageIndex + 1}`),
          acquireLicensePage: getAbsoluteUrl(item.modelPage, origin)
        }
      }))
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <PageMeta
        title={pageTitle}
        description={pageDescription}
        keywords={['free 3D model images', '3D model renders', selectedCategory, 'CG assets', 'download 3D models'].filter(Boolean).join(', ')}
        url={pagePath}
        image={imageItems[0]?.image || '/favicon.svg'}
        jsonLd={jsonLd}
      />

      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl">
          <div className="inline-flex items-center gap-2 border border-gray-800 bg-gray-950 px-3 py-1 text-sm text-gray-300">
            <Search className="h-4 w-4" />
            Image discovery
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
            {pageTitle}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-300">
            {pageDescription}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/explore" className="inline-flex items-center gap-2 bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-gray-200">
              Explore models
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/free-3d-models" className="inline-flex items-center gap-2 border border-gray-700 px-5 py-3 text-sm font-semibold text-white hover:border-white">
              Free 3D model pages
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-7xl border-t border-gray-900 pt-6">
          <h2 className="text-lg font-semibold">Popular image categories</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/free-3d-model-images"
              className={`border px-3 py-2 text-sm ${!selectedCategory ? 'border-white bg-white text-black' : 'border-gray-800 text-gray-300 hover:border-white hover:text-white'}`}
            >
              All images
            </Link>
            {categoryLinks.map(({ category, count }) => (
              <Link
                key={category}
                to={`/free-3d-model-images/${slugify(category)}`}
                className={`border px-3 py-2 text-sm ${selectedCategory === category ? 'border-white bg-white text-black' : 'border-gray-800 text-gray-300 hover:border-white hover:text-white'}`}
              >
                {category} ({count})
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-7xl">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 15 }).map((_, index) => (
                <div key={index} className="aspect-[4/3] animate-pulse border border-gray-900 bg-gray-950" />
              ))}
            </div>
          ) : imageItems.length ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-5">
              {imageItems.map((item) => (
                <Link
                  key={`${item.model.id}-${item.imageIndex}`}
                  to={item.imagePage}
                  className="group block overflow-hidden border border-gray-900 bg-gray-950 hover:border-gray-600"
                >
                  <img
                    src={item.image}
                    alt={getModelAltText(item.model, `gallery render ${item.imageIndex + 1}`)}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold">{item.model.title || 'Free 3D Model'}</p>
                    <p className="mt-1 truncate text-xs text-gray-500">
                      {item.model.category || '3D Model'} render {item.imageIndex + 1}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-gray-900 bg-gray-950 p-10 text-center">
              <ImageIcon className="mx-auto h-10 w-10 text-gray-600" />
              <h2 className="mt-4 text-xl font-semibold">No images found yet</h2>
              <p className="mt-2 text-gray-400">New public uploads with preview renders will appear here.</p>
            </div>
          )}
        </section>

        <section className="mx-auto mt-10 max-w-7xl border-t border-gray-900 pt-8">
          <h2 className="text-2xl font-semibold">Why these image pages help discovery</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              ['Dedicated image URLs', 'Each render has a crawlable page with its own title, text, and model link.'],
              ['Model context', 'Images are grouped with category, license, tags, and download pages.'],
              ['Internal linking', 'Gallery, category, image, and model pages all connect together.']
            ].map(([heading, copy]) => (
              <article key={heading} className="border border-gray-900 bg-gray-950 p-5">
                <h3 className="font-semibold">{heading}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-400">{copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default ImageGalleryPage
