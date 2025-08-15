import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { 
  Download, 
  Calendar, 
  User, 
  Tag, 
  FileText, 
  ArrowLeft, 
  Eye, 
  Share2, 
  Heart, 
  Bookmark,
  ExternalLink,
  File,
  Image,
  Clock,
  Star,
  MessageCircle,
  MoreHorizontal
} from 'lucide-react'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ModelCard from '../components/ModelCard'
import EmptyState from '../components/ui/EmptyState'

const ModelDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [model, setModel] = useState(null)
  const [relatedModels, setRelatedModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    const fetchModelDetails = async () => {
      try {
        setLoading(true)
        const { model: modelData, error } = await firebaseHelpers.getModelById(id)
        if (error) {
          setError(error)
        } else {
          setModel(modelData)
          // Fetch related models (same category)
          if (modelData.category) {
            const { models } = await firebaseHelpers.getModels(4)
            const filtered = models.filter(m => m.id !== id && m.category === modelData.category)
            setRelatedModels(filtered.slice(0, 3))
          }
        }
      } catch (err) {
        setError('Failed to load model details')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchModelDetails()
    }
  }, [id])

  const handleDownload = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!model) return

    try {
      setDownloading(true)
      const result = await firebaseHelpers.recordDownload(user.uid, model.id)
      if (result.error) {
        throw new Error(result.error)
      }

      // Create download link
      const link = document.createElement('a')
      link.href = model.file_path
      link.download = model.title || '3d-model'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Update local state
      setModel(prev => ({ ...prev, downloads_count: (prev.downloads_count || 0) + 1 }))
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download model. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading model details..." />
      </div>
    )
  }

  if (error || !model) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          icon={File}
          title="Model Not Found"
          description={error || "The model you're looking for doesn't exist or has been removed."}
          actionText="Go Back Home"
          actionLink="/"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
            
            <div className="flex items-center space-x-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <Bookmark className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-8">
            {/* 3D Model Viewer */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                {model.thumbnail_path ? (
                  <img
                    src={model.thumbnail_path}
                    alt={model.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-gray-400 dark:text-gray-500">
                    <File className="w-24 h-24 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">3D Model Preview</p>
                    <p className="text-sm">No preview available</p>
                  </div>
                )}
              </div>
              
              {/* Model Controls */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      {model.view_count || 0} views
                    </span>
                    <span className="flex items-center">
                      <Download className="w-4 h-4 mr-2" />
                      {model.downloads_count || 0} downloads
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatDate(model.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatFileSize(model.file_size)}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium capitalize">
                      {model.category || 'other'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Model Information Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'details', label: 'Details', icon: FileText },
                    { id: 'comments', label: 'Comments', icon: MessageCircle },
                    { id: 'versions', label: 'Versions', icon: File }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      <tab.icon className="w-4 h-4 mr-2" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Description
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {model.description || 'No description available for this model.'}
                      </p>
                    </div>

                    {model.tags && model.tags.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          Tags
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {model.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        File Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center">
                          <File className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Type: {model.file_type || 'Unknown'}</span>
                        </div>
                        <div className="flex items-center">
                          <Download className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="text-gray-600 dark:text-gray-400">Size: {formatFileSize(model.file_size)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Comments feature coming soon!</p>
                  </div>
                )}

                {activeTab === 'versions' && (
                  <div className="text-center py-8">
                    <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">Version history coming soon!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Model Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {model.title}
              </h2>
              
              <div className="space-y-4">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5 mr-2" />
                      Download Model
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Free download • No registration required
                  </p>
                </div>
              </div>
            </div>

            {/* Creator Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Created by
              </h3>
              
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {model.creator?.username || 'Unknown Creator'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Member since {formatDate(model.creator?.created_at)}
                  </p>
                </div>
                <Link
                  to={`/profile/${model.creator?.username}`}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Related Models */}
            {relatedModels.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Related Models
                </h3>
                
                <div className="space-y-3">
                  {relatedModels.map((relatedModel) => (
                    <Link
                      key={relatedModel.id}
                      to={`/model/${relatedModel.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          {relatedModel.thumbnail_path ? (
                            <img
                              src={relatedModel.thumbnail_path}
                              alt={relatedModel.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <File className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {relatedModel.title}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {relatedModel.creator?.username || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelDetail
