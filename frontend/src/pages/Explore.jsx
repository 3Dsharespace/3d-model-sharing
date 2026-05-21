import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import firebaseHelpers from '../lib/firebase'
import ModelCard from '../components/ModelCard'
import PageMeta from '../components/PageMeta'
import { modelCategoryNames } from '../data/modelCategories'

const availableFormats = [
  'Blender',
  'Maya',
  '3ds Max',
  'Cinema 4D',
  'OBJ',
  'FBX',
  'GLTF',
  'USDZ',
  'STL',
  'PLY',
  'ZIP'
]

const sortOptions = [
  { value: 'best-match', label: 'Best match' },
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Most downloaded' },
  { value: 'trending', label: 'Most viewed' },
  { value: 'liked', label: 'Most liked' }
]

const getFormat = (model) => model.fileFormat || model.format || model.file_type || model.fileExtension || ''

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('best-match')
  const [fileFormat, setFileFormat] = useState('')
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 40

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '')
    setSelectedCategory(searchParams.get('category') || '')
    setSortBy(searchParams.get('sort') || 'best-match')
    setFileFormat(searchParams.get('format') || '')
  }, [searchParams])

  const updateURL = useCallback((updates) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value)
      else newParams.delete(key)
    })
    setSearchParams(newParams)
  }, [searchParams, setSearchParams])

  useEffect(() => {
    let active = true

    const fetchModels = async () => {
      try {
        setLoading(true)
        setError('')
        const filters = {}
        if (selectedCategory && selectedCategory !== 'All') filters.category = selectedCategory

        const result = await firebaseHelpers.getModels(filters)
        if (!active) return

        if (result.success) {
          setModels(result.models || [])
        } else {
          setModels([])
          setError(result.error || 'Failed to load models.')
        }
      } catch (err) {
        if (!active) return
        setModels([])
        setError('Failed to load models. Please try again.')
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchModels()
    return () => {
      active = false
    }
  }, [selectedCategory])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory, sortBy, fileFormat])

  const filteredModels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return models.filter((model) => {
      if (model.is_private === true || model.isPublic === false || model.status === 'draft') return false

      if (query) {
        const creator = model.creator?.username || model.author?.username || model.username || model.creatorName || ''
        const haystack = [
          model.title,
          model.description,
          model.category,
          creator,
          ...(Array.isArray(model.tags) ? model.tags : [])
        ].filter(Boolean).join(' ').toLowerCase()
        if (!haystack.includes(query)) return false
      }

      if (fileFormat) {
        const format = String(getFormat(model)).toLowerCase()
        if (!format.includes(fileFormat.toLowerCase())) return false
      }

      return true
    })
  }, [models, searchQuery, fileFormat])

  const sortedModels = useMemo(() => {
    return [...filteredModels].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0)
      }
      if (sortBy === 'popular') return (b.downloads || b.downloads_count || 0) - (a.downloads || a.downloads_count || 0)
      if (sortBy === 'trending') return (b.views || b.view_count || 0) - (a.views || a.view_count || 0)
      if (sortBy === 'liked') return (b.likes || 0) - (a.likes || 0)
      return (
        (b.isFeatured ? 100000 : 0) + (b.downloads || 0) * 2 + (b.views || 0) + (b.likes || 0) * 3
      ) - (
        (a.isFeatured ? 100000 : 0) + (a.downloads || 0) * 2 + (a.views || 0) + (a.likes || 0) * 3
      )
    })
  }, [filteredModels, sortBy])

  const totalPages = Math.max(1, Math.ceil(sortedModels.length / pageSize))
  const pageModels = sortedModels.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleSearch = (event) => {
    event.preventDefault()
    updateURL({ q: searchQuery.trim() })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('')
    setFileFormat('')
    setSortBy('best-match')
    setSearchParams(new URLSearchParams())
  }

  return (
    <div className="studio-page">
      <PageMeta
        title="Explore Free 3D Models | 3D ShareSpace"
        description="Browse free 3D models by category, format, tags, and creator."
        keywords="explore 3D models, free 3D model library, 3D assets"
        url="/explore"
        type="website"
      />

      <div className="studio-container">
        <header className="border-b border-[#242424] pb-6">
          <p className="studio-kicker">Explore</p>
          <div className="mt-2 flex items-end justify-between gap-8">
            <div>
              <h1 className="studio-page-title">Professional asset library</h1>
              <p className="studio-page-subtitle">
                Browse public 3D models by category, format, creator, and project fit. The grid stays compact so you can scan quickly.
              </p>
            </div>
            <Link to="/upload" className="studio-secondary-button shrink-0">Upload model</Link>
          </div>
        </header>

        <section className="studio-panel mt-5">
          <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[minmax(240px,1fr)_170px_160px_150px_auto]">
            <div>
              <label htmlFor="explore-search" className="studio-label">Search</label>
              <input
                id="explore-search"
                className="studio-input"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Title, tag, category, creator"
              />
            </div>
            <div>
              <label htmlFor="explore-category" className="studio-label">Category</label>
              <select
                id="explore-category"
                className="studio-select"
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value)
                  updateURL({ category: event.target.value === 'All' ? '' : event.target.value })
                }}
              >
                <option value="">All categories</option>
                {modelCategoryNames.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="explore-format" className="studio-label">Format</label>
              <select
                id="explore-format"
                className="studio-select"
                value={fileFormat}
                onChange={(event) => {
                  setFileFormat(event.target.value)
                  updateURL({ format: event.target.value })
                }}
              >
                <option value="">Any format</option>
                {availableFormats.map((format) => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="explore-sort" className="studio-label">Sort</label>
              <select
                id="explore-sort"
                className="studio-select"
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value)
                  updateURL({ sort: event.target.value })
                }}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="studio-primary-button">Apply</button>
              <button type="button" onClick={clearFilters} className="studio-secondary-button">Clear</button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {modelCategoryNames.slice(0, 18).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setSelectedCategory(category)
                  updateURL({ category })
                }}
                className={`studio-chip ${selectedCategory === category ? 'is-active' : ''}`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        <div className="studio-section-title">
          <div>
            <h2>{loading ? 'Loading models' : `${sortedModels.length} public models`}</h2>
            <p>{selectedCategory || searchQuery || fileFormat ? 'Filtered results' : 'All available public assets'}</p>
          </div>
          <p>Page {currentPage} of {totalPages}</p>
        </div>

        {error && (
          <div className="mb-4 border border-red-950 bg-red-950/20 p-4 text-sm text-red-200">{error}</div>
        )}

        {loading ? (
          <div className="asset-grid">
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="studio-card h-64 animate-pulse bg-[#101010]" />
            ))}
          </div>
        ) : pageModels.length ? (
          <div className="asset-grid">
            {pageModels.map((model) => (
              <ModelCard key={model.id || model.uid} model={model} />
            ))}
          </div>
        ) : (
          <div className="studio-empty">
            <h3>No models match this view</h3>
            <p>Try a broader search, remove a format filter, or browse all categories.</p>
          </div>
        )}

        {sortedModels.length > pageSize && (
          <div className="mt-6 flex items-center justify-between border-t border-[#242424] pt-4">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              className="studio-secondary-button disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-[#737373]">
              Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, sortedModels.length)} of {sortedModels.length}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              className="studio-secondary-button disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Explore
