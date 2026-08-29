import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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
const getOwnerId = (model) => model.userId || model.user_id || model.creatorId || model.authorId || model.ownerId || ''
const pageSizeOptions = [40, 80, 160]
const isPublicModel = (model) => (
  model.is_private !== true &&
  model.isPublic !== false &&
  model.is_public !== false &&
  model.status !== 'draft' &&
  model.isDraft !== true
)

const Explore = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('best-match')
  const [fileFormat, setFileFormat] = useState('')
  const [showMine, setShowMine] = useState(false)
  const [showAllRecords, setShowAllRecords] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSizeSetting, setPageSizeSetting] = useState('40')

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '')
    setSelectedCategory(searchParams.get('category') || '')
    setSortBy(searchParams.get('sort') || 'best-match')
    setFileFormat(searchParams.get('format') || '')
    setShowMine(searchParams.get('mine') === '1')
    setShowAllRecords(searchParams.get('records') === 'all')
    setPageSizeSetting(searchParams.get('limit') || '40')
  }, [searchParams])

  useEffect(() => {
    let active = true

    const loadAdminStatus = async () => {
      if (!user?.uid) {
        setIsAdmin(false)
        return
      }

      try {
        const result = await firebaseHelpers.checkAdminStatus(user.uid)
        if (!active) return

        const nextIsAdmin = Boolean(result?.isAdmin)
        setIsAdmin(nextIsAdmin)
        if (nextIsAdmin && !searchParams.has('records') && !searchParams.has('mine')) {
          setShowAllRecords(true)
        }
      } catch (error) {
        if (active) setIsAdmin(false)
      }
    }

    loadAdminStatus()
    return () => {
      active = false
    }
  }, [searchParams, user?.uid])

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
  }, [searchQuery, selectedCategory, sortBy, fileFormat, showMine, showAllRecords, pageSizeSetting])

  const filteredModels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return models.filter((model) => {
      const isOwnModel = Boolean(user?.uid && getOwnerId(model) === user.uid)
      if (showMine && !isOwnModel) return false
      if (!showMine && !(isAdmin && showAllRecords) && !isPublicModel(model)) return false

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
  }, [models, searchQuery, fileFormat, showMine, showAllRecords, isAdmin, user?.uid])

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

  const totalRecords = models.length
  const publicRecords = useMemo(() => models.filter(isPublicModel).length, [models])
  const hiddenRecords = Math.max(0, totalRecords - publicRecords)
  const isAdminAllRecords = isAdmin && showAllRecords
  const pageSize = pageSizeSetting === 'all' ? Math.max(1, sortedModels.length) : Number(pageSizeSetting) || 40
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
    setShowMine(false)
    setShowAllRecords(false)
    setPageSizeSetting('40')
    setSearchParams(new URLSearchParams())
  }

  const shownStart = sortedModels.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const shownEnd = Math.min(currentPage * pageSize, sortedModels.length)

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
        <section className="studio-panel explore-filter-panel">
          {(user || isAdmin) && (
            <div className="mb-4 flex flex-wrap justify-end gap-2">
              {user && (
                <button
                  type="button"
                  onClick={() => {
                    const nextValue = !showMine
                    setShowMine(nextValue)
                    if (nextValue) setShowAllRecords(false)
                    updateURL({ mine: nextValue ? '1' : '', records: '' })
                  }}
                  className={`studio-chip ${showMine ? 'is-active' : ''}`}
                >
                  My uploads
                </button>
              )}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    const nextValue = !showAllRecords
                    setShowAllRecords(nextValue)
                    if (nextValue) setShowMine(false)
                    updateURL({ records: nextValue ? 'all' : 'public', mine: '' })
                  }}
                  className={`studio-chip ${showAllRecords ? 'is-active' : ''}`}
                >
                  All records
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSearch} className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-[minmax(220px,1fr)_160px_150px_140px_110px_auto]">
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
            <div>
              <label htmlFor="explore-limit" className="studio-label">Show</label>
              <select
                id="explore-limit"
                className="studio-select"
                value={pageSizeSetting}
                onChange={(event) => {
                  setPageSizeSetting(event.target.value)
                  updateURL({ limit: event.target.value === '40' ? '' : event.target.value })
                }}
              >
                {pageSizeOptions.map((option) => (
                  <option key={option} value={String(option)}>{option}</option>
                ))}
                <option value="all">All matching</option>
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

        {isAdmin && !isAdminAllRecords && hiddenRecords > 0 && (
          <div className="mt-4 border border-[#242424] bg-[#0a0a0a] px-4 py-3 text-sm text-[#a3a3a3]">
            Admin note: {hiddenRecords} uploaded records are private or drafts. Use <span className="text-[#f5f5f5]">All records</span> to review the complete Firestore library.
          </div>
        )}

        <div className="studio-section-title">
            <div>
              <h2>{loading ? 'Loading models' : isAdminAllRecords ? `${sortedModels.length} total records` : showMine ? `${sortedModels.length} of your uploads` : `${sortedModels.length} public models`}</h2>
              <p>{isAdminAllRecords ? `Admin view includes public, private, and draft records from ${totalRecords} Firestore documents.` : showMine ? 'Your uploaded models, including non-public records visible to you.' : selectedCategory || searchQuery || fileFormat ? 'Filtered results' : 'All available public assets'}</p>
            </div>
          <p>Page {currentPage} of {totalPages}</p>
        </div>

        {error && (
          <div className="mb-4 border border-red-950 bg-red-950/20 p-4 text-sm text-red-200">{error}</div>
        )}

        {loading ? (
          <div className="asset-grid">
            {Array.from({ length: 20 }).map((_, index) => (
              <div key={index} className="studio-skeleton-card" />
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
              Showing {shownStart}-{shownEnd} of {sortedModels.length}
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
