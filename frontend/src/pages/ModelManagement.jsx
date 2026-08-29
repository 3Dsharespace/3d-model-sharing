import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  BarChart3,
  CheckSquare,
  Download,
  Edit3,
  Eye,
  Grid3X3,
  Heart,
  List,
  Loader2,
  Plus,
  Search,
  Square,
  Trash2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import firebaseHelpers from '../lib/firebase'
import { getModelUrl } from '../lib/modelLinks'
import PageMeta from '../components/PageMeta'

const statusOptions = ['All', 'Published', 'Draft', 'Pending Review', 'Archived']
const formatOptions = ['All', 'FBX', 'OBJ', 'STL', 'BLEND', 'MAX', 'MA', 'C4D', 'GLB', 'GLTF', 'ZIP', 'Other']

const getImageUrl = (model) => (
  model?.previewImages?.[0]?.url ||
  model?.images?.[0]?.url ||
  model?.renderImages?.[0]?.url ||
  model?.thumbnail ||
  model?.thumbnailUrl ||
  ''
)

const getModelFormat = (model) => {
  const direct = model?.fileFormat || model?.format || model?.file_type || model?.fileType
  if (direct) return String(direct).toUpperCase()
  const fileName = model?.fileName || model?.modelFileName || model?.downloadUrl || model?.fileUrl || ''
  const match = String(fileName).match(/\.([a-z0-9]+)(?:\?|#|$)/i)
  return match ? match[1].toUpperCase() : 'Other'
}

const getModelStatus = (model) => {
  const status = String(model?.status || '').toLowerCase()
  if (status) return status
  if (model?.isPublic || model?.is_public) return 'published'
  if (model?.isDraft || model?.draft) return 'draft'
  return 'published'
}

const statusLabel = (status) => {
  if (status === 'published') return 'Published'
  if (status === 'draft') return 'Draft'
  if (status === 'pending') return 'Pending review'
  if (status === 'archived') return 'Archived'
  return 'Unknown'
}

const statusClass = (status) => {
  if (status === 'published') return 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200'
  if (status === 'draft') return 'border-amber-500/25 bg-amber-500/10 text-amber-200'
  if (status === 'pending') return 'border-blue-500/25 bg-blue-500/10 text-blue-200'
  return 'border-[#303030] bg-[#171717] text-[#a3a3a3]'
}

const formatDate = (value) => {
  if (!value) return 'Not listed'
  const date = value?.toDate ? value.toDate() : new Date(value)
  return Number.isNaN(date.getTime())
    ? 'Not listed'
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const Metric = ({ label, value }) => (
  <div className="border border-[#242424] bg-[#101010] px-4 py-3">
    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#737373]">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-[#f5f5f5]">{value}</p>
  </div>
)

const ActionButton = ({ children, className = '', ...props }) => (
  <button
    type="button"
    className={`inline-flex h-9 items-center justify-center border border-[#303030] bg-[#101010] px-3 text-xs font-semibold text-[#d4d4d4] transition hover:border-[#525252] hover:bg-[#141414] ${className}`}
    {...props}
  >
    {children}
  </button>
)

const ModelManagement = () => {
  const { user } = useAuth()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('table')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedFormat, setSelectedFormat] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedModels, setSelectedModels] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30d')

  useEffect(() => {
    const fetchUserModels = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')
        const result = await firebaseHelpers.getModels({ userId: user.uid })
        if (result.success) {
          setModels(result.models || [])
        } else {
          setError(result.error || 'Failed to fetch models.')
          setModels([])
        }
      } catch (err) {
        console.error('Error fetching user models:', err)
        setError('Failed to load your models.')
        setModels([])
      } finally {
        setLoading(false)
      }
    }

    fetchUserModels()
  }, [user])

  useEffect(() => {
    if (!models.length) return undefined

    const updateModelStats = async () => {
      try {
        const updatedModels = await Promise.all(
          models.map(async (model) => {
            const statsResult = await firebaseHelpers.getModelStats(model.id)
            if (statsResult.success) {
              return {
                ...model,
                likes: statsResult.stats.likes,
                downloads: statsResult.stats.downloads
              }
            }
            return model
          })
        )
        setModels(updatedModels)
      } catch (err) {
        console.error('Error updating model stats:', err)
      }
    }

    const interval = setInterval(updateModelStats, 30000)
    return () => clearInterval(interval)
  }, [models.length])

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const query = searchQuery.trim().toLowerCase()
      const tags = Array.isArray(model.tags) ? model.tags : []
      const status = getModelStatus(model)
      const format = getModelFormat(model)

      if (query) {
        const matchesQuery =
          String(model.title || '').toLowerCase().includes(query) ||
          String(model.description || '').toLowerCase().includes(query) ||
          String(model.category || '').toLowerCase().includes(query) ||
          tags.some((tag) => String(tag).toLowerCase().includes(query))
        if (!matchesQuery) return false
      }

      if (selectedStatus !== 'All') {
        const selected = selectedStatus.toLowerCase()
        if (selected === 'published' && status !== 'published') return false
        if (selected === 'draft' && status !== 'draft') return false
        if (selected === 'pending review' && status !== 'pending') return false
        if (selected === 'archived' && status !== 'archived') return false
      }

      if (selectedFormat !== 'All' && format !== selectedFormat) return false
      return true
    })
  }, [models, searchQuery, selectedFormat, selectedStatus])

  const sortedModels = useMemo(() => {
    return [...filteredModels].sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      if (sortBy === 'popular') return (b.downloads || 0) - (a.downloads || 0)
      if (sortBy === 'trending') return (b.views || 0) - (a.views || 0)
      if (sortBy === 'title') return String(a.title || '').localeCompare(String(b.title || ''))
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    })
  }, [filteredModels, sortBy])

  const userStats = useMemo(() => ({
    totalModels: models.length,
    publishedModels: models.filter((model) => getModelStatus(model) === 'published').length,
    totalDownloads: models.reduce((sum, model) => sum + (model.downloads || 0), 0),
    totalLikes: models.reduce((sum, model) => sum + (model.likes || 0), 0),
    totalViews: models.reduce((sum, model) => sum + (model.views || 0), 0)
  }), [models])

  const analytics = useMemo(() => {
    const now = new Date()
    const periods = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    }
    const startDate = periods[analyticsPeriod]
    const recent = models.filter((model) => new Date(model.createdAt || 0) >= startDate)

    return {
      periodViews: recent.reduce((sum, model) => sum + (model.views || 0), 0),
      periodDownloads: recent.reduce((sum, model) => sum + (model.downloads || 0), 0),
      topPerforming: [...models].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5),
      categoryBreakdown: models.reduce((acc, model) => {
        const category = model.category || 'Uncategorized'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {})
    }
  }, [analyticsPeriod, models])

  const handleDeleteModel = async (modelId) => {
    try {
      setDeleting(true)
      const result = await firebaseHelpers.deleteModel(modelId)
      if (result.success) {
        setModels((prev) => prev.filter((model) => model.id !== modelId))
        setSelectedModels((prev) => prev.filter((id) => id !== modelId))
        setDeleteConfirm(null)
      } else {
        setError(result.error || 'Failed to delete model.')
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete model.')
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkAction = async () => {
    if (!bulkAction || selectedModels.length === 0) return
    try {
      if (bulkAction === 'delete') {
        for (const modelId of selectedModels) {
          // eslint-disable-next-line no-await-in-loop
          await handleDeleteModel(modelId)
        }
        setSelectedModels([])
      }
      setBulkAction('')
    } catch {
      setError('Failed to perform bulk action.')
    }
  }

  const selectAll = () => {
    setSelectedModels((prev) => (
      prev.length === sortedModels.length ? [] : sortedModels.map((model) => model.id)
    ))
  }

  const toggleModelSelection = (modelId) => {
    setSelectedModels((prev) => (
      prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
    ))
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedStatus('All')
    setSelectedFormat('All')
    setSortBy('newest')
  }

  if (!user) {
    return (
      <div className="studio-page flex min-h-screen items-center justify-center px-6">
        <PageMeta title="Manage Models | 3D ShareSpace" url="/manage" />
        <div className="w-full max-w-md border border-[#242424] bg-[#101010] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center border border-[#303030] bg-[#050505]">
            <AlertCircle className="h-5 w-5 text-[#a3a3a3]" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold text-[#f5f5f5]">Sign in required</h1>
          <p className="mt-2 text-sm leading-6 text-[#a3a3a3]">Use your creator account to manage uploaded models.</p>
          <Link to="/login" className="studio-primary-button mt-6 w-full">Sign in</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="studio-page min-h-screen">
      <PageMeta
        title="Manage Models | 3D ShareSpace"
        description="Manage your uploaded 3D models, review engagement, edit listings, and keep your asset library organized."
        url="/manage"
      />

      <main className="studio-container py-8">
        <header className="border-b border-[#242424] pb-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="studio-kicker">Creator library</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-normal text-[#f5f5f5]">Manage models</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#a3a3a3]">
                Review uploads, edit listing details, remove old assets, and track what downloaders are opening.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ActionButton onClick={() => setShowAnalytics((value) => !value)} className={showAnalytics ? 'border-[#8b5cf6] text-[#f5f5f5]' : ''}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Analytics
              </ActionButton>
              <Link to="/upload" className="studio-primary-button">
                <Plus className="mr-2 h-4 w-4" />
                Upload model
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Metric label="Models" value={userStats.totalModels} />
            <Metric label="Published" value={userStats.publishedModels} />
            <Metric label="Downloads" value={userStats.totalDownloads} />
            <Metric label="Likes" value={userStats.totalLikes} />
            <Metric label="Views" value={userStats.totalViews} />
          </div>
        </header>

        {showAnalytics && (
          <section className="mt-6 border border-[#242424] bg-[#101010] p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="studio-kicker">Performance</p>
                <h2 className="mt-2 text-xl font-semibold text-[#f5f5f5]">Activity overview</h2>
              </div>
              <select value={analyticsPeriod} onChange={(event) => setAnalyticsPeriod(event.target.value)} className="studio-input h-10 md:w-44">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[280px_1fr]">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Metric label="Period views" value={analytics.periodViews} />
                <Metric label="Period downloads" value={analytics.periodDownloads} />
              </div>
              <div className="border border-[#242424] bg-[#0a0a0a] p-4">
                <h3 className="text-sm font-semibold text-[#f5f5f5]">Top performing models</h3>
                <div className="mt-4 space-y-2">
                  {analytics.topPerforming.length ? analytics.topPerforming.map((model, index) => (
                    <div key={model.id} className="flex items-center justify-between gap-4 border border-[#1f1f1f] bg-[#101010] px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#f5f5f5]">{index + 1}. {model.title || 'Untitled model'}</p>
                        <p className="mt-1 text-xs text-[#737373]">{model.category || 'Uncategorized'}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4 text-xs text-[#a3a3a3]">
                        <span>{model.views || 0} views</span>
                        <span>{model.downloads || 0} downloads</span>
                      </div>
                    </div>
                  )) : (
                    <p className="border border-[#1f1f1f] bg-[#101010] px-3 py-5 text-center text-sm text-[#737373]">No model activity yet.</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mt-6 border border-[#242424] bg-[#101010] p-5">
          <div className="grid gap-3 xl:grid-cols-[minmax(280px,1fr)_140px_140px_170px_auto]">
            <label className="block">
              <span className="studio-label">Search</span>
              <span className="relative mt-2 block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
                <input
                  type="text"
                  placeholder="Title, category, tag"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="studio-input h-10 w-full pl-10"
                />
              </span>
            </label>

            <label className="block">
              <span className="studio-label">Status</span>
              <select value={selectedStatus} onChange={(event) => setSelectedStatus(event.target.value)} className="studio-input mt-2 h-10">
                {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="studio-label">Format</span>
              <select value={selectedFormat} onChange={(event) => setSelectedFormat(event.target.value)} className="studio-input mt-2 h-10">
                {formatOptions.map((format) => <option key={format} value={format}>{format}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="studio-label">Sort</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="studio-input mt-2 h-10">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="popular">Most downloaded</option>
                <option value="trending">Most viewed</option>
                <option value="title">Title A-Z</option>
              </select>
            </label>

            <div className="flex items-end gap-2">
              <div className="flex h-10 border border-[#303030] bg-[#050505]">
                <ActionButton onClick={() => setViewMode('table')} className={`h-full border-0 px-3 ${viewMode === 'table' ? 'bg-[#f5f5f5] text-[#050505]' : ''}`} aria-label="Table view">
                  <List className="h-4 w-4" />
                </ActionButton>
                <ActionButton onClick={() => setViewMode('grid')} className={`h-full border-0 border-l border-[#303030] px-3 ${viewMode === 'grid' ? 'bg-[#f5f5f5] text-[#050505]' : ''}`} aria-label="Grid view">
                  <Grid3X3 className="h-4 w-4" />
                </ActionButton>
              </div>
              <ActionButton onClick={clearFilters}>Clear</ActionButton>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-[#242424] pt-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-[#a3a3a3]">
              Showing <span className="font-semibold text-[#f5f5f5]">{sortedModels.length}</span> of {models.length} models
            </p>
            {selectedModels.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a3a3a3]">{selectedModels.length} selected</span>
                <select value={bulkAction} onChange={(event) => setBulkAction(event.target.value)} className="studio-input h-9 w-40">
                  <option value="">Bulk action</option>
                  <option value="delete">Delete selected</option>
                </select>
                <ActionButton onClick={handleBulkAction} disabled={!bulkAction} className="disabled:opacity-40">Apply</ActionButton>
              </div>
            )}
          </div>
        </section>

        {error && (
          <div className="mt-5 border border-red-900/60 bg-red-950/25 px-4 py-3 text-sm text-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          </div>
        )}

        <section className="mt-6">
          {loading ? (
            <div className="border border-[#242424] bg-[#101010] py-16 text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-[#a3a3a3]" />
              <p className="mt-4 text-sm text-[#a3a3a3]">Loading your models...</p>
            </div>
          ) : sortedModels.length === 0 ? (
            <div className="border border-[#242424] bg-[#101010] px-6 py-16 text-center">
              <h3 className="text-xl font-semibold text-[#f5f5f5]">{searchQuery ? 'No models match these filters' : 'No uploads yet'}</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#a3a3a3]">
                {searchQuery ? 'Clear the filters or search for another title, tag, category, or format.' : 'Upload a model to start building your creator library.'}
              </p>
              {!searchQuery && <Link to="/upload" className="studio-primary-button mt-6">Upload model</Link>}
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-hidden border border-[#242424] bg-[#101010]">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead className="border-b border-[#242424] bg-[#0a0a0a]">
                    <tr>
                      <th className="w-12 px-4 py-3">
                        <button type="button" onClick={selectAll} className="text-[#737373] hover:text-[#f5f5f5]" aria-label="Select all models">
                          {selectedModels.length === sortedModels.length ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                        </button>
                      </th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#737373]">Model</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#737373]">Category</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#737373]">Format</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#737373]">Activity</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#737373]">Status</th>
                      <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#737373]">Updated</th>
                      <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[#737373]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedModels.map((model) => {
                      const imageUrl = getImageUrl(model)
                      const status = getModelStatus(model)
                      return (
                        <tr key={model.id} className="border-b border-[#1f1f1f] transition hover:bg-[#141414]">
                          <td className="px-4 py-4">
                            <button type="button" onClick={() => toggleModelSelection(model.id)} className="text-[#737373] hover:text-[#f5f5f5]" aria-label={`Select ${model.title || 'model'}`}>
                              {selectedModels.includes(model.id) ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                            </button>
                          </td>
                          <td className="min-w-[280px] px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-16 w-20 shrink-0 overflow-hidden border border-[#242424] bg-[#050505]">
                                {imageUrl ? (
                                  <img src={imageUrl} alt={model.title || '3D model'} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-[#737373]">3D</div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#f5f5f5]">{model.title || 'Untitled model'}</p>
                                <p className="mt-1 line-clamp-1 text-xs text-[#737373]">{model.description || 'No description added'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-[#d4d4d4]">{model.category || 'Uncategorized'}</td>
                          <td className="px-4 py-4 text-sm text-[#a3a3a3]">{getModelFormat(model)}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3 text-xs text-[#a3a3a3]">
                              <span>{model.views || 0} views</span>
                              <span>{model.downloads || 0} downloads</span>
                              <span>{model.likes || 0} likes</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex border px-2 py-1 text-xs font-semibold ${statusClass(status)}`}>{statusLabel(status)}</span>
                          </td>
                          <td className="px-4 py-4 text-sm text-[#a3a3a3]">{formatDate(model.updatedAt || model.updated_at || model.createdAt || model.created_at)}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={getModelUrl(model)} className="inline-flex h-8 w-8 items-center justify-center border border-[#303030] text-[#a3a3a3] hover:border-[#525252] hover:text-[#f5f5f5]" aria-label="View model">
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link to={`/model/${model.id}/edit`} className="inline-flex h-8 w-8 items-center justify-center border border-[#303030] text-[#a3a3a3] hover:border-[#525252] hover:text-[#f5f5f5]" aria-label="Edit model">
                                <Edit3 className="h-4 w-4" />
                              </Link>
                              <button type="button" onClick={() => setDeleteConfirm(model.id)} className="inline-flex h-8 w-8 items-center justify-center border border-[#303030] text-red-300 hover:border-red-900 hover:bg-red-950/25" aria-label="Delete model">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {sortedModels.map((model) => {
                const imageUrl = getImageUrl(model)
                const status = getModelStatus(model)
                const tags = Array.isArray(model.tags) ? model.tags : []
                return (
                  <article key={model.id} className="group border border-[#242424] bg-[#101010] transition hover:border-[#3a3a3a]">
                    <div className="aspect-[4/3] border-b border-[#242424] bg-[#050505]">
                      {imageUrl ? (
                        <img src={imageUrl} alt={model.title || '3D model'} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold tracking-[0.18em] text-[#737373]">PREVIEW</div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#f5f5f5]">{model.title || 'Untitled model'}</p>
                          <p className="mt-1 text-xs text-[#737373]">{model.category || 'Uncategorized'} · {getModelFormat(model)}</p>
                        </div>
                        <span className={`shrink-0 border px-2 py-1 text-[10px] font-semibold ${statusClass(status)}`}>{statusLabel(status)}</span>
                      </div>
                      <p className="mt-3 line-clamp-2 min-h-10 text-xs leading-5 text-[#a3a3a3]">{model.description || 'No description added.'}</p>
                      {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {tags.slice(0, 4).map((tag) => (
                            <span key={tag} className="border border-[#242424] bg-[#0a0a0a] px-2 py-1 text-[10px] text-[#a3a3a3]">{tag}</span>
                          ))}
                        </div>
                      )}
                      <div className="mt-4 flex items-center justify-between border-t border-[#1f1f1f] pt-3">
                        <div className="flex items-center gap-3 text-xs text-[#737373]">
                          <span className="inline-flex items-center gap-1"><Download className="h-3.5 w-3.5" />{model.downloads || 0}</span>
                          <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{model.likes || 0}</span>
                          <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{model.views || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={getModelUrl(model)} className="text-xs font-semibold text-[#d4d4d4] hover:text-[#f5f5f5]">View</Link>
                          <Link to={`/model/${model.id}/edit`} className="text-xs font-semibold text-[#d4d4d4] hover:text-[#f5f5f5]">Edit</Link>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-md border border-[#303030] bg-[#101010] p-6" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-xl font-semibold text-[#f5f5f5]">Delete model</h3>
            <p className="mt-3 text-sm leading-6 text-[#a3a3a3]">
              This removes the listing from your library. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <ActionButton onClick={() => setDeleteConfirm(null)}>Cancel</ActionButton>
              <button
                type="button"
                onClick={() => handleDeleteModel(deleteConfirm)}
                disabled={deleting}
                className="inline-flex h-9 items-center justify-center border border-red-900 bg-red-950/30 px-4 text-xs font-semibold text-red-100 transition hover:bg-red-950 disabled:opacity-50"
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelManagement
