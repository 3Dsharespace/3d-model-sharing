import React from 'react'
import { Link } from 'react-router-dom'
import { Download, Eye, Calendar, User, Tag } from 'lucide-react'

const ModelCard = ({ model }) => {
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <Link to={`/model/${model.id}`}>
        {/* Thumbnail */}
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center overflow-hidden">
          {model.thumbnail_path ? (
            <img
              src={model.thumbnail_path}
              alt={model.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="text-center text-gray-400 dark:text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium">No Preview</p>
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {model.title}
          </h3>
          
          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm leading-relaxed">
            {model.description || 'No description available'}
          </p>
          
          {/* Tags */}
          {model.tags && model.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {model.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
              {model.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                  +{model.tags.length - 3}
                </span>
              )}
            </div>
          )}
          
          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Download className="w-4 h-4 mr-1.5" />
                {model.downloads_count || 0}
              </span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1.5" />
                {model.view_count || 0}
              </span>
            </div>
            <span className="capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs font-medium">
              {model.category || 'other'}
            </span>
          </div>
          
          {/* Creator & Date */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
              <User className="w-3 h-3 mr-1" />
              {model.creator?.username || 'Unknown'}
            </div>
            <div className="text-xs text-gray-400 dark:text-gray-500">
              {formatDate(model.created_at)}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default ModelCard
