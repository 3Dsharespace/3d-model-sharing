import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import firebaseHelpers from '../lib/firebase'
import { getModelUrl } from '../lib/modelLinks'
import { Link } from 'react-router-dom'
import { 
  Upload, 
  Edit3, 
  Trash2, 
  Eye, 
  Download, 
  Heart, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Plus,
  AlertCircle,
  CheckCircle,
  Loader2,
  MoreVertical,
  File,
  Calendar,
  TrendingUp,
  BarChart3,
  Star,
  CheckSquare,
  Square,
  Settings,
  Tag,
  Clock,
  Users,
  Award
} from 'lucide-react'

const ModelManagement = () => {
  const { user, profile } = useAuth()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('table') // Changed default to table
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedFormat, setSelectedFormat] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [selectedModels, setSelectedModels] = useState([])
  const [bulkAction, setBulkAction] = useState('')
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30d')

  // Categories for filtering
  // Status options
  const statusOptions = [
    'All',
    'Published',
    'Draft',
    'Pending Review',
    'Archived'
  ]

  // Format options
  const formatOptions = [
    'All',
    'FBX',
    'OBJ',
    'STL',
    'BLEND',
    'MAX',
    'MA',
    'C4D',
    'Other'
  ]

  // Fetch user's models from Firebase
  useEffect(() => {
    const fetchUserModels = async () => {
      if (!user) return

      try {
        setLoading(true)
        setError('')
        
        const filters = { userId: user.uid }
        if (selectedCategory && selectedCategory !== 'All') {
          filters.category = selectedCategory
        }
        
        const result = await firebaseHelpers.getModels(filters)
        
        if (result.success) {
          setModels(result.models)
      } else {
          setError(result.error || 'Failed to fetch models')
          setModels([])
        }
      } catch (err) {
        console.error('Error fetching user models:', err)
        setError('Failed to load your models')
        setModels([])
    } finally {
        setLoading(false)
      }
    }

    fetchUserModels()
  }, [user, selectedCategory])

  // Filter and sort models
  const filteredModels = models.filter(model => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        model.title?.toLowerCase().includes(query) ||
        model.description?.toLowerCase().includes(query) ||
        (model.tags && model.tags.some(tag => tag.toLowerCase().includes(query)))
      )
    }
    if (selectedStatus && selectedStatus !== 'All') {
      if (selectedStatus === 'Published') return model.status === 'published'
      if (selectedStatus === 'Draft') return model.status === 'draft'
      if (selectedStatus === 'Pending Review') return model.status === 'pending'
      if (selectedStatus === 'Archived') return model.status === 'archived'
    }
    if (selectedFormat && selectedFormat !== 'All') {
      return model.fileFormat === selectedFormat
    }
    return true
  })

  const sortedModels = [...filteredModels].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'popular':
        return (b.downloads || 0) - (a.downloads || 0)
      case 'trending':
        return (b.views || 0) - (a.views || 0)
      case 'title':
        return (a.title || '').localeCompare(b.title || '')
        default:
        return 0
    }
  })

  // Handle model deletion
  const handleDeleteModel = async (modelId) => {
    try {
      setDeleting(true)
      
      const result = await firebaseHelpers.deleteModel(modelId)
      
      if (result.success) {
        // Remove from local state
        setModels(prev => prev.filter(model => model.id !== modelId))
        setDeleteConfirm(null)
        // Remove from selected models
        setSelectedModels(prev => prev.filter(id => id !== modelId))
      } else {
        setError(result.error || 'Failed to delete model')
      }
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete model')
    } finally {
      setDeleting(false)
    }
  }

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedModels.length === 0) return

    try {
      // Implement bulk actions here
      switch (bulkAction) {
        case 'delete':
          // Bulk delete
          for (const modelId of selectedModels) {
            await handleDeleteModel(modelId)
          }
          setSelectedModels([])
          break
        case 'archive':
          // Bulk archive
          // TODO: Implement archive functionality
          break
      }
      setBulkAction('')
    } catch (err) {
      setError('Failed to perform bulk action')
    }
  }

  // Select all models
  const selectAll = () => {
    if (selectedModels.length === sortedModels.length) {
      setSelectedModels([])
    } else {
      setSelectedModels(sortedModels.map(model => model.id))
    }
  }

  // Toggle individual model selection
  const toggleModelSelection = (modelId) => {
    setSelectedModels(prev => 
      prev.includes(modelId) 
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    )
  }

  // Analytics functions
  const getAnalyticsData = () => {
    const now = new Date()
    const periods = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    }
    
    const startDate = periods[analyticsPeriod]
    
    return {
      totalViews: models.reduce((sum, model) => sum + (model.views || 0), 0),
      periodViews: models.filter(m => new Date(m.createdAt) >= startDate)
        .reduce((sum, model) => sum + (model.views || 0), 0),
      totalDownloads: models.reduce((sum, model) => sum + (model.downloads || 0), 0),
      periodDownloads: models.filter(m => new Date(m.createdAt) >= startDate)
        .reduce((sum, model) => sum + (model.downloads || 0), 0),
      topPerforming: models
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5),
      categoryBreakdown: models.reduce((acc, model) => {
        const cat = model.category || 'Uncategorized'
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      }, {})
    }
  }

  // Calculate user statistics
  const userStats = {
    totalModels: models.length,
    publishedModels: models.filter(m => m.status === 'published').length,
    totalDownloads: models.reduce((sum, model) => sum + (model.downloads || 0), 0),
    totalLikes: models.reduce((sum, model) => sum + (model.likes || 0), 0),
    totalViews: models.reduce((sum, model) => sum + (model.views || 0), 0),
    averageRating: models.length > 0 
      ? (models.reduce((sum, model) => sum + (model.rating || 0), 0) / models.length).toFixed(1)
      : 0
  }

  // Real-time statistics updater
  useEffect(() => {
    if (!models.length) return;

    const updateModelStats = async () => {
      try {
        const updatedModels = await Promise.all(
          models.map(async (model) => {
            // Get real-time stats for each model
            const statsResult = await firebaseHelpers.getModelStats(model.id);
            if (statsResult.success) {
              return {
                ...model,
                likes: statsResult.stats.likes,
                downloads: statsResult.stats.downloads
              };
            }
            return model;
          })
        );
        
        setModels(updatedModels);
      } catch (error) {
        console.error('Error updating model stats:', error);
      }
    };

    // Update stats immediately
    updateModelStats();

    // Set up interval to update stats every 30 seconds
    const interval = setInterval(updateModelStats, 30000);

    return () => clearInterval(interval);
  }, [models.length]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to manage your models
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Models
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your uploaded 3D models
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                    showAnalytics 
                      ? 'border-blue-600 text-blue-600 bg-blue-50 dark:bg-blue-900/20' 
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </button>
              <Link
                to="/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload New Model
              </Link>
            </div>
          </div>
        </div>
      </div>
      </div>



      {/* Analytics Section */}
      {showAnalytics && (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analytics Overview</h2>
              <select
                value={analyticsPeriod}
                onChange={(e) => setAnalyticsPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
            
            {/* Main Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center">
                  <File className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Total Models</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{userStats.totalModels}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-3">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Published</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">{userStats.publishedModels}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Total Views</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{userStats.totalViews}</p>
                  </div>
              </div>
              </div>
            </div>

            {/* Period-specific Metrics */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center">
                    <Eye className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-3">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Period Views</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{(() => {
                        const analytics = getAnalyticsData()
                        return analytics.periodViews
                      })()}</p>
              </div>
              </div>
            </div>

                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center">
                    <Download className="h-8 w-8 text-green-600 dark:text-green-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">Period Downloads</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{(() => {
                        const analytics = getAnalyticsData()
                        return analytics.periodDownloads
                      })()}</p>
                    </div>
              </div>
              </div>
              </div>
            </div>

            {/* Top Performing Models */}
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Performing Models</h3>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                {(() => {
                  const analytics = getAnalyticsData()
                  return analytics.topPerforming.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.topPerforming.map((model, index) => (
                        <div key={model.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">#{index + 1}</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{model.title || 'Untitled'}</span>
              </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {model.views || 0}
                            </span>
                            <span className="flex items-center">
                              <Download className="h-4 w-4 mr-1" />
                              {model.downloads || 0}
                            </span>
              </div>
            </div>
                      ))}
              </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No models with views yet</p>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input
                type="text"
                  placeholder="Search by keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            
            {/* Filters and Controls */}
            <div className="flex items-center space-x-4">
              {/* Format Filter */}
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {formatOptions.map(format => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>

              {/* Status Filter */}
            <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
            </select>

              {/* Sort Dropdown */}
            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Most Viewed</option>
                <option value="title">Title A-Z</option>
            </select>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-2 ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
              </div>
          </div>
        </div>

          {/* Bulk Actions */}
          {selectedModels.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {selectedModels.length} Selected
                </span>
                <div className="flex items-center space-x-3">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value)}
                    className="px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md text-sm bg-white dark:bg-gray-700 text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Action</option>
                    <option value="delete">Delete Selected</option>
                    <option value="archive">Archive Selected</option>
                  </select>
                  
                  <button
                    onClick={handleBulkAction}
                    disabled={!bulkAction}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Showing {sortedModels.length} of {models.length} models
          </div>
        </div>
              </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
            </div>
          </div>
        )}

      {/* Models Display */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></Loader2>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your models...</p>
                </div>
        ) : sortedModels.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No models found' : 'No models uploaded yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery 
                ? 'Try adjusting your search or filters'
                : 'Start sharing your 3D models with the community!'
              }
            </p>
            {!searchQuery && (
                  <Link
                    to="/upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                <Plus className="h-4 w-4 mr-2" />
                    Upload Your First Model
                  </Link>
            )}
                </div>
        ) : viewMode === 'table' ? (
          // Table View
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <button
                        onClick={selectAll}
                        className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {selectedModels.length === sortedModels.length ? (
                          <CheckSquare className="h-4 w-4 text-blue-600" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date Added
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Views
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Downloads
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedModels.map((model) => (
                    <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleModelSelection(model.id)}
                          className="flex items-center"
                        >
                          {selectedModels.includes(model.id) ? (
                            <CheckSquare className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                          {model.previewImages && model.previewImages.length > 0 ? (
                            <>
                              <img
                                src={model.previewImages[0].url}
                                alt={model.title || '3D Model'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                              <div className="w-full h-full flex items-center justify-center hidden">
                                <span className="text-gray-500 dark:text-gray-400 text-xs">3D</span>
                              </div>
                            </>
                          ) : model.thumbnail ? (
                            <>
                              <img
                                src={model.thumbnail}
                                alt={model.title || '3D Model'}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                              <div className="w-full h-full flex items-center justify-center hidden">
                                <span className="text-gray-500 dark:text-gray-400 text-xs">3D</span>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-500 dark:text-gray-400 text-xs">3D</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {model.title || 'Untitled Model'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {model.fileFormat || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                          {model.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {model.createdAt ? new Date(model.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {model.updatedAt ? new Date(model.updatedAt).toLocaleDateString() : 
                         model.createdAt ? new Date(model.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {model.rating ? model.rating.toFixed(1) : '0.0'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {model.views || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {model.downloads || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          model.status === 'published' 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200'
                            : model.status === 'draft'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                        }`}>
                          {model.status === 'published' ? 'Published' : 
                           model.status === 'draft' ? 'Draft' : 
                           model.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            to={getModelUrl(model)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/model/${model.id}/edit`}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteConfirm(model.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          // Grid View (existing code)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedModels.map((model) => (
              <div
                key={model.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Thumbnail */}
                <div>
                  {model.previewImages && model.previewImages.length > 0 ? (
                    <>
                      <img
                        src={model.previewImages[0].url}
                        alt={model.title || '3D Model'}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center hidden">
                        <span className="text-gray-500 dark:text-gray-400 text-lg">3D Model</span>
                      </div>
                    </>
                  ) : model.thumbnail ? (
                    <>
                    <img
                      src={model.thumbnail}
                        alt={model.title || '3D Model'}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center hidden">
                        <span className="text-gray-500 dark:text-gray-400 text-lg">3D Model</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-lg">3D Model</span>
                                       </div>
                                     )}
                                   </div>

                {/* Content */}
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                        {model.title || 'Untitled Model'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {model.category || 'Uncategorized'}
                      </p>
                                     </div>
                    
                    {/* Action Menu */}
                                   <div className="relative">
                                     <button 
                        onClick={() => setDeleteConfirm(model.id)}
                        className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                                           </button>
                                         </div>
                                       </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {model.description || 'No description available'}
                  </p>

                  {/* Tags */}
                  {model.tags && model.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {model.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {model.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded">
                          +{model.tags.length - 3}
                        </span>
                                     )}
                                   </div>
                  )}

                  {/* Stats and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        {model.downloads || 0}
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {model.likes || 0}
                      </span>
                      <span className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        {model.views || 0}
                            </span>
                        </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={getModelUrl(model)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 text-sm font-medium"
                      >
                        View
                      </Link>
                      <Link
                        to={`/model/${model.id}/edit`}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium"
                      >
                        Edit
                      </Link>
                        </div>
                      </div>
                </div>
              </div>
            ))}
                    </div>
                  )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setDeleteConfirm(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Delete Model
              </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Are you sure you want to delete this model? This action cannot be undone.
                </p>
            <div className="flex justify-end space-x-3">
                  <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                onClick={() => handleDeleteModel(deleteConfirm)}
                disabled={deleting}
                className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
                  </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelManagement
