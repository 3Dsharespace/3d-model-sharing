import React from 'react'
import { Link } from 'react-router-dom'

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  actionLink, 
  actionOnClick,
  className = '' 
}) => {
  return (
    <div className={`text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl ${className}`}>
      {Icon && (
        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
      )}
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {(actionText && actionLink) && (
        <Link
          to={actionLink}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {actionText}
        </Link>
      )}
      
      {(actionText && actionOnClick) && (
        <button
          onClick={actionOnClick}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}

export default EmptyState
