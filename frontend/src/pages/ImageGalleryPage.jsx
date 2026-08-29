import React, { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowRight, Image as ImageIcon, Search } from 'lucide-react'
import PageMeta from '../components/PageMeta'
import ExploreHighlight from '../components/ui/ExploreHighlight'
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
    <div className="studio-page image-gallery-page">
      <PageMeta
        title={pageTitle}
        description={pageDescription}
        keywords={['free 3D model images', '3D model renders', selectedCategory, 'CG assets', 'download 3D models'].filter(Boolean).join(', ')}
        url={pagePath}
        image={imageItems[0]?.image || '/favicon.svg'}
        jsonLd={jsonLd}
      />

      <main className="studio-page__inner">
        <section className="studio-page__header">
          <div>
            <p className="studio-kicker">Image discovery</p>
            <h1>{pageTitle}</h1>
            <p>{pageDescription}</p>
          </div>
          <div className="studio-header-actions">
            <ExploreHighlight>
              <Link to="/explore" className="studio-button studio-button--primary">
                Explore models
                <ArrowRight size={14} />
              </Link>
            </ExploreHighlight>
            <Link to="/free-3d-models" className="studio-button studio-button--secondary">
              Model pages
            </Link>
          </div>
        </section>

        <section className="studio-filter-panel image-category-panel">
          <div className="studio-filter-panel__title">
            <Search size={14} />
            <span>Image categories</span>
          </div>
          <div className="image-category-list">
            <Link
              to="/free-3d-model-images"
              className={!selectedCategory ? 'is-active' : ''}
            >
              All images
            </Link>
            {categoryLinks.map(({ category, count }) => (
              <Link
                key={category}
                to={`/free-3d-model-images/${slugify(category)}`}
                className={selectedCategory === category ? 'is-active' : ''}
              >
                {category} ({count})
              </Link>
            ))}
          </div>
        </section>

        <section className="image-gallery-results">
          {loading ? (
            <div className="image-gallery-grid">
              {Array.from({ length: 15 }).map((_, index) => (
                <div key={index} className="image-gallery-skeleton" />
              ))}
            </div>
          ) : imageItems.length ? (
            <div className="image-gallery-grid">
              {imageItems.map((item) => (
                <Link
                  key={`${item.model.id}-${item.imageIndex}`}
                  to={item.imagePage}
                  className="image-gallery-card"
                >
                  <img
                    src={item.image}
                    alt={getModelAltText(item.model, `gallery render ${item.imageIndex + 1}`)}
                    loading="lazy"
                  />
                  <div>
                    <p>{item.model.title || 'Free 3D Model'}</p>
                    <span>
                      {item.model.category || '3D Model'} render {item.imageIndex + 1}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="studio-empty">
              <ImageIcon size={34} />
              <h2>No images found yet</h2>
              <p>New public uploads with preview renders will appear here.</p>
            </div>
          )}
        </section>

        <section className="image-gallery-notes">
          <h2>Discovery details</h2>
          <div>
            {[
              ['Dedicated image URLs', 'Each render has a crawlable page with its own title, text, and model link.'],
              ['Model context', 'Images are grouped with category, license, tags, and download pages.'],
              ['Internal linking', 'Gallery, category, image, and model pages all connect together.']
            ].map(([heading, copy]) => (
              <article key={heading}>
                <h3>{heading}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default ImageGalleryPage
