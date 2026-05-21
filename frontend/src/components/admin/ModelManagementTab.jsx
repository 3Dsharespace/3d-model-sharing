import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import firebaseHelpers from '../../lib/firebase'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../lib/firebase'
import { 
  Search, Filter, MoreVertical, Edit3, Trash2, Eye, Download, 
  Star, Package, Image, Calendar, User, Tag, ChevronDown,
  AlertCircle, CheckCircle, Clock, ExternalLink, Copy, X,
  FileText, Folder, Archive, Globe, Lock, Settings,
  ThumbsUp, ThumbsDown, Upload, RefreshCw, Save,
  HardDrive, Layers, Play, Pause, BarChart3,
  DollarSign, Activity, Zap, Crown, Award,
  Info, AlertTriangle, Shield, Database, FileImage
} from 'lucide-react'
import { Button } from '../ui/Button'
import { modelCategoryNames, modelCategoriesWithAll } from '../../data/modelCategories'

// Helper functions moved to top to avoid hoisting issues
const getFileType = (fileName) => {
  if (!fileName) return 'unknown'
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension || 'unknown'
}

const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown'
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const getStatusColor = (status) => {
  switch (status) {
    case 'published': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    case 'pending': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
    case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    case 'featured': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
}

const ModelManagementTab = () => {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedModels, setSelectedModels] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [selectedModel, setSelectedModel] = useState(null)
  const [showModelDetails, setShowModelDetails] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingModel, setEditingModel] = useState(null)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState({})
  const [filters, setFilters] = useState({
    fileType: 'all',
    dateRange: 'all',
    isPlatformModel: 'all',
    isDraft: 'all'
  })

  const categories = modelCategoriesWithAll

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'published', label: 'Published', color: 'green' },
    { value: 'draft', label: 'Draft', color: 'yellow' },
    { value: 'pending', label: 'Pending Review', color: 'orange' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'featured', label: 'Featured', color: 'blue' },
    { value: 'archived', label: 'Archived', color: 'gray' }
  ]

  const fileTypeOptions = [
    { value: 'all', label: 'All Formats' },
    { value: 'glb', label: 'GLB' },
    { value: 'gltf', label: 'GLTF' },
    { value: 'obj', label: 'OBJ' },
    { value: 'fbx', label: 'FBX' },
    { value: 'zip', label: 'ZIP' },
    { value: 'stl', label: 'STL' },
    { value: 'ply', label: 'PLY' }
  ]

  useEffect(() => {
    loadModels()
  }, [])

  const loadModels = async () => {
    try {
      setLoading(true)
      const result = await firebaseHelpers.getModels({})
      setModels(result.models || [])
    } catch (error) {
      console.error('Error loading models:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredModels = models.filter(model => {
    const matchesSearch = model.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.author?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || model.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || model.status === selectedStatus
    
    const modelFileType = getFileType(model.fileName || model.fileURL)
    const matchesFileType = filters.fileType === 'all' || modelFileType === filters.fileType
    
    const matchesPlatformModel = filters.isPlatformModel === 'all' || 
      (filters.isPlatformModel === 'true' && model.isPlatformModel) ||
      (filters.isPlatformModel === 'false' && !model.isPlatformModel)
    
    const matchesDraft = filters.isDraft === 'all' ||
      (filters.isDraft === 'true' && (model.isDraft || model.status === 'draft')) ||
      (filters.isDraft === 'false' && !model.isDraft && model.status !== 'draft')

    return matchesSearch && matchesCategory && matchesStatus && matchesFileType && matchesPlatformModel && matchesDraft
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'downloads':
        return (b.downloads || 0) - (a.downloads || 0)
      case 'likes':
        return (b.likes || 0) - (a.likes || 0)
      case 'views':
        return (b.views || 0) - (a.views || 0)
      case 'title':
        return a.title.localeCompare(b.title)
      case 'size':
        return (b.fileSize || 0) - (a.fileSize || 0)
      default:
        return 0
    }
  })

  const handleBulkAction = async (action) => {
    if (selectedModels.length === 0) return
    
    setBulkActionLoading(true)
    try {
      for (const modelId of selectedModels) {
        await performModelAction(modelId, action)
      }
      await loadModels() // Refresh the list
      setSelectedModels([]) // Clear selection
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error)
    } finally {
      setBulkActionLoading(false)
    }
  }

  const performModelAction = async (modelId, action) => {
    setActionLoading(prev => ({ ...prev, [modelId]: action }))
    
    try {
      switch (action) {
        case 'publish':
          await firebaseHelpers.updateModel(modelId, { 
            status: 'published',
            isDraft: false,
            isPublic: true,
            updatedAt: new Date().toISOString()
          })
          break
        case 'draft':
          await firebaseHelpers.updateModel(modelId, { 
            status: 'draft',
            isDraft: true,
            isPublic: false,
            updatedAt: new Date().toISOString()
          })
          break
        case 'feature':
          await firebaseHelpers.updateModel(modelId, { 
            status: 'featured',
            isFeatured: true,
            updatedAt: new Date().toISOString()
          })
          break
        case 'unfeature':
          await firebaseHelpers.updateModel(modelId, { 
            status: 'published',
            isFeatured: false,
            updatedAt: new Date().toISOString()
          })
          break
        case 'archive':
          await firebaseHelpers.updateModel(modelId, { 
            status: 'archived',
            isPublic: false,
            updatedAt: new Date().toISOString()
          })
          break
        case 'delete':
          await firebaseHelpers.deleteModel(modelId)
          break
        default:
          throw new Error(`Unknown action: ${action}`)
      }
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev }
        delete newState[modelId]
        return newState
      })
    }
  }


  const ModelCard = ({ model }) => (
    <motion.div
      whileHover={{ y: -2, shadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group"
    >
      <div className="relative">
        <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
          {model.previewImages && model.previewImages.length > 0 ? (
            <img
              src={model.previewImages[0].url}
              alt={model.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-12 h-12 text-gray-400" />
          )}
        </div>
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(model.status || 'published')}`}>
            {model.status || 'published'}
          </span>
          {model.isPlatformModel && (
            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
              Platform
            </span>
          )}
          {model.isFeatured && (
            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 flex items-center">
              <Crown className="w-2 h-2 mr-1" />
              Featured
            </span>
          )}
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-white/90 hover:bg-white"
              onClick={() => {
                setSelectedModel(model)
                setShowModelDetails(true)
              }}
            >
              <Eye className="w-3 h-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="bg-white/90 hover:bg-white"
              onClick={() => {
                setEditingModel(model)
                setShowEditModal(true)
              }}
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">
          {model.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          by {model.isPlatformModel ? '3D ShareSpace' : (model.author?.username || 'Unknown')}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mb-3 line-clamp-2">
          {model.description}
        </p>
        
        <div className="grid grid-cols-3 gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span className="flex items-center">
            <Download className="w-3 h-3 mr-1" />
            {model.downloads || 0}
          </span>
          <span className="flex items-center">
            <Eye className="w-3 h-3 mr-1" />
            {model.views || 0}
          </span>
          <span className="flex items-center">
            <Star className="w-3 h-3 mr-1" />
            {model.likes || 0}
          </span>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 flex items-center justify-between">
          <span className="flex items-center">
            {getFileType(model.fileName || model.fileURL) === 'zip' ? (
              <Archive className="w-3 h-3 mr-1" />
            ) : (
              <FileText className="w-3 h-3 mr-1" />
            )}
            {getFileType(model.fileName || model.fileURL).toUpperCase()}
          </span>
          <span className="flex items-center">
            <HardDrive className="w-3 h-3 mr-1" />
            {formatFileSize(model.fileSize)}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {model.category}
          </span>
          <div className="flex space-x-1">
            {(model.status === 'draft' || model.isDraft) ? (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => performModelAction(model.id, 'publish')}
                disabled={actionLoading[model.id] === 'publish'}
                title="Publish Model"
              >
                {actionLoading[model.id] === 'publish' ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Upload className="w-3 h-3 text-green-600" />
                )}
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => performModelAction(model.id, 'draft')}
                disabled={actionLoading[model.id] === 'draft'}
                title="Convert to Draft"
              >
                {actionLoading[model.id] === 'draft' ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Pause className="w-3 h-3 text-yellow-600" />
                )}
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setEditingModel(model)
                setShowEditModal(true)
              }}
              title="Edit Model"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => performModelAction(model.id, 'delete')}
              disabled={actionLoading[model.id] === 'delete'}
              title="Delete Model"
            >
              {actionLoading[model.id] === 'delete' ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3 text-red-600" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const TableRow = ({ model, index }) => (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
    >
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selectedModels.includes(model.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedModels([...selectedModels, model.id])
            } else {
              setSelectedModels(selectedModels.filter(id => id !== model.id))
            }
          }}
          className="rounded border-gray-300"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
            {model.previewImages && model.previewImages.length > 0 ? (
              <img
                src={model.previewImages[0].url}
                alt={model.title}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <Package className="w-6 h-6 text-gray-400" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{model.title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {model.isPlatformModel ? '3D ShareSpace' : (model.author?.username || 'Unknown')}
            </p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600 dark:text-gray-400">{model.category}</span>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-col space-y-1">
          <span className={`px-2 py-1 text-xs rounded-full w-fit ${getStatusColor(model.status || 'published')}`}>
            {model.status || 'published'}
          </span>
          {model.isPlatformModel && (
            <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 w-fit">
              Platform
            </span>
          )}
          {model.isFeatured && (
            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 w-fit flex items-center">
              <Crown className="w-2 h-2 mr-1" />
              Featured
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center mb-1">
            <Download className="w-3 h-3 mr-1" />
            {model.downloads || 0}
          </div>
          <div className="text-xs text-gray-500">
            Views: {model.views || 0}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center mb-1">
            <Star className="w-3 h-3 mr-1" />
            {model.likes || 0}
          </div>
          <div className="text-xs text-gray-500">
            Rating: {model.rating || 0}/5
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center mb-1">
            {getFileType(model.fileName || model.fileURL) === 'zip' ? (
              <Archive className="w-3 h-3 mr-1" />
            ) : (
              <FileText className="w-3 h-3 mr-1" />
            )}
            {getFileType(model.fileName || model.fileURL).toUpperCase()}
          </div>
          <div className="text-xs text-gray-500">
            {formatFileSize(model.fileSize)}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div>{new Date(model.createdAt).toLocaleDateString()}</div>
          <div className="text-xs text-gray-500">
            {new Date(model.createdAt).toLocaleTimeString()}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSelectedModel(model)
              setShowModelDetails(true)
            }}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
          {(model.status === 'draft' || model.isDraft) ? (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => performModelAction(model.id, 'publish')}
              disabled={actionLoading[model.id] === 'publish'}
              title="Publish Model"
            >
              {actionLoading[model.id] === 'publish' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 text-green-600" />
              )}
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => performModelAction(model.id, 'draft')}
              disabled={actionLoading[model.id] === 'draft'}
              title="Convert to Draft"
            >
              {actionLoading[model.id] === 'draft' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Pause className="w-4 h-4 text-yellow-600" />
              )}
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setEditingModel(model)
              setShowEditModal(true)
            }}
            title="Edit Model"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => performModelAction(model.id, 'delete')}
            disabled={actionLoading[model.id] === 'delete'}
            title="Delete Model"
          >
            {actionLoading[model.id] === 'delete' ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 text-red-500" />
            )}
          </Button>
        </div>
      </td>
    </motion.tr>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading models...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Models Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all {filteredModels.length} models on your platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
          >
            {viewMode === 'grid' ? 'Table View' : 'Grid View'}
          </Button>
          <Button onClick={() => window.open('/admin/bulk-upload', '_blank')}>
            <Package className="w-4 h-4 mr-2" />
            Add Models
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map(category => (
                <option key={category} value={category === 'All' ? 'all' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="downloads">Most Downloaded</option>
              <option value="likes">Most Liked</option>
              <option value="views">Most Viewed</option>
              <option value="size">Largest Files</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              File Type
            </label>
            <select
              value={filters.fileType}
              onChange={(e) => setFilters(prev => ({ ...prev, fileType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {fileTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model Type
            </label>
            <select
              value={filters.isPlatformModel}
              onChange={(e) => setFilters(prev => ({ ...prev, isPlatformModel: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Models</option>
              <option value="true">Platform Models</option>
              <option value="false">User Models</option>
            </select>
          </div>
        </div>

        {selectedModels.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectedModels.length} model(s) selected
            </span>
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => handleBulkAction('publish')} disabled={bulkActionLoading}>
                {bulkActionLoading ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
                Publish
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('draft')} disabled={bulkActionLoading}>
                {bulkActionLoading ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Pause className="w-3 h-3 mr-1" />}
                Draft
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('feature')} disabled={bulkActionLoading}>
                {bulkActionLoading ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Crown className="w-3 h-3 mr-1" />}
                Feature
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')} disabled={bulkActionLoading}>
                {bulkActionLoading ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Models Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedModels(filteredModels.map(m => m.id))
                        } else {
                          setSelectedModels([])
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    File Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredModels.map((model, index) => (
                  <TableRow key={model.id} model={model} index={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredModels.length === 0 && (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No models found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'Start by uploading some models to your platform.'}
          </p>
          <Button onClick={() => window.open('/admin/bulk-upload', '_blank')}>
            <Package className="w-4 h-4 mr-2" />
            Upload Models
          </Button>
        </div>
      )}

      {/* Model Details Modal */}
      <AnimatePresence>
        {showModelDetails && selectedModel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowModelDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Model Details
                  </h3>
                  <button
                    onClick={() => setShowModelDetails(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Model Preview */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preview</h4>
                    <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                      {selectedModel.previewImages && selectedModel.previewImages.length > 0 ? (
                        <img
                          src={selectedModel.previewImages[0].url}
                          alt={selectedModel.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    {selectedModel.previewImages && selectedModel.previewImages.length > 1 && (
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {selectedModel.previewImages.slice(1, 5).map((img, index) => (
                          <img
                            key={index}
                            src={img.url}
                            alt={`Preview ${index + 2}`}
                            className="w-full aspect-square object-cover rounded"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Model Information */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Title</label>
                        <p className="text-gray-900 dark:text-white">{selectedModel.title}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</label>
                        <p className="text-gray-900 dark:text-white">{selectedModel.description || 'No description'}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</label>
                          <p className="text-gray-900 dark:text-white">{selectedModel.category}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(selectedModel.status || 'published')}`}>
                            {selectedModel.status || 'published'}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Tags</label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedModel.tags && selectedModel.tags.length > 0 ? (
                            selectedModel.tags.map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-500">No tags</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Author</label>
                          <p className="text-gray-900 dark:text-white">{selectedModel.isPlatformModel ? '3D ShareSpace' : (selectedModel.author?.username || 'Unknown')}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">License</label>
                          <p className="text-gray-900 dark:text-white">{selectedModel.license || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* File Information */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">File Information</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Format</span>
                      </div>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {getFileType(selectedModel.fileName || selectedModel.fileURL).toUpperCase()}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <HardDrive className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Size</span>
                      </div>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {formatFileSize(selectedModel.fileSize)}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created</span>
                      </div>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {new Date(selectedModel.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Activity className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Updated</span>
                      </div>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {new Date(selectedModel.updatedAt || selectedModel.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Eye className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Views</span>
                      </div>
                      <p className="text-blue-900 dark:text-blue-100 font-semibold text-lg">
                        {selectedModel.views || 0}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Download className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">Downloads</span>
                      </div>
                      <p className="text-green-900 dark:text-green-100 font-semibold text-lg">
                        {selectedModel.downloads || 0}
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <Star className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Likes</span>
                      </div>
                      <p className="text-yellow-900 dark:text-yellow-100 font-semibold text-lg">
                        {selectedModel.likes || 0}
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-1">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Rating</span>
                      </div>
                      <p className="text-purple-900 dark:text-purple-100 font-semibold text-lg">
                        {selectedModel.rating || 0}/5
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-3">
                    {(selectedModel.status === 'draft' || selectedModel.isDraft) ? (
                      <Button 
                        onClick={() => {
                          performModelAction(selectedModel.id, 'publish')
                          setShowModelDetails(false)
                        }}
                        disabled={actionLoading[selectedModel.id] === 'publish'}
                      >
                        {actionLoading[selectedModel.id] === 'publish' ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Publish Model
                      </Button>
                    ) : (
                      <Button 
                        variant="outline"
                        onClick={() => {
                          performModelAction(selectedModel.id, 'draft')
                          setShowModelDetails(false)
                        }}
                        disabled={actionLoading[selectedModel.id] === 'draft'}
                      >
                        {actionLoading[selectedModel.id] === 'draft' ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Pause className="w-4 h-4 mr-2" />
                        )}
                        Convert to Draft
                      </Button>
                    )}
                    
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setEditingModel(selectedModel)
                        setShowEditModal(true)
                        setShowModelDetails(false)
                      }}
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Model
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => window.open(`/model/${selectedModel.id}`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Public Page
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Model Modal */}
      <AnimatePresence>
        {showEditModal && editingModel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Edit Model
                  </h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <EditModelForm 
                  model={editingModel}
                  onSave={(updatedModel) => {
                    // Update the model in the list
                    setModels(prev => prev.map(m => m.id === updatedModel.id ? updatedModel : m))
                    setShowEditModal(false)
                    setEditingModel(null)
                  }}
                  onCancel={() => {
                    setShowEditModal(false)
                    setEditingModel(null)
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Edit Model Form Component
const EditModelForm = ({ model, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: model.title || '',
    description: model.description || '',
    category: model.category || 'Architecture',
    tags: model.tags ? model.tags.join(', ') : '',
    license: model.license || 'CC-BY-4.0',
    isPublic: model.isPublic || false,
    status: model.status || 'published',
    features: model.features || []
  })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [newImages, setNewImages] = useState([])
  const [existingImages, setExistingImages] = useState(model.previewImages || [])
  const [imageUploading, setImageUploading] = useState(false)
  const fileInputRef = React.useRef(null)

  const categories = modelCategoryNames

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = []
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        continue
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        continue
      }
      
      if (newImages.length + existingImages.length + validFiles.length >= 8) {
        break
      }
      
      validFiles.push({
        file,
        preview: URL.createObjectURL(file),
        id: Date.now() + Math.random()
      })
    }
    
    if (validFiles.length > 0) {
      setNewImages(prev => [...prev, ...validFiles])
    }
  }

  const removeNewImage = (id) => {
    setNewImages(prev => {
      const imageToRemove = prev.find(img => img.id === id)
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      return prev.filter(img => img.id !== id)
    })
  }

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const uploadNewImages = async () => {
    if (newImages.length === 0) return []
    
    setImageUploading(true)
    const uploadedImages = []
    
    try {
      for (let i = 0; i < newImages.length; i++) {
        const image = newImages[i]
        const imageRef = ref(storage, `models/${model.userId}/${model.id}/previews/${image.file.name}`)
        
        await uploadBytes(imageRef, image.file)
        const imageURL = await getDownloadURL(imageRef)
        
        uploadedImages.push({
          url: imageURL,
          name: image.file.name,
          order: existingImages.length + i
        })
      }
      
      return uploadedImages
    } catch (error) {
      console.error('Error uploading images:', error)
      return []
    } finally {
      setImageUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaveError('')
    setSaving(true)
    
    try {
      // Upload new images first
      const uploadedImages = await uploadNewImages()
      
      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedImages]
      
      const updatedData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        previewImages: allImages,
        updatedAt: new Date().toISOString()
      }
      
      const result = await firebaseHelpers.updateModel(model.id, updatedData)
      if (!result?.success) {
        throw new Error(result?.error || 'Failed to save model changes')
      }
      onSave({ ...model, ...updatedData })
    } catch (error) {
      console.error('Error updating model:', error)
      setSaveError(error.message || 'Failed to save model changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="featured">Featured</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="3d, model, architecture, building"
        />
      </div>
      
      {/* Preview Images Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Preview Images (Max 8)
        </label>
        
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Current Images</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {existingImages.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full aspect-square object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* New Images */}
        {newImages.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">New Images</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {newImages.map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.preview}
                    alt="New preview"
                    className="w-full aspect-square object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(img.id)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Upload New Images */}
        {(existingImages.length + newImages.length) < 8 && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <FileImage className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click to add preview images
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                JPG, PNG, WebP up to 5MB each
              </p>
            </button>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isPublic}
            onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
            className="rounded border-gray-300"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Public</span>
        </label>
      </div>

      {saveError && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-300">
          {saveError}
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving || imageUploading}>
          {saving || imageUploading ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              {imageUploading ? 'Uploading Images...' : 'Saving...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

export default ModelManagementTab
