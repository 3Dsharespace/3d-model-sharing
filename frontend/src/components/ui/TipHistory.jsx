import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { firebaseHelpers } from '../../lib/firebase'
import { 
  Heart, 
  Coffee, 
  Gift, 
  Star, 
  Calendar, 
  MessageCircle,
  ExternalLink,
  Loader2
} from 'lucide-react'

const TipHistory = ({ userId = null, showReceived = false }) => {
  const { user } = useAuth()
  const [tips, setTips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('sent') // 'sent' or 'received'

  useEffect(() => {
    fetchTips()
  }, [userId, activeTab])

  const fetchTips = async () => {
    try {
      setLoading(true)
      const targetUserId = userId || user?.uid
      
      if (!targetUserId) {
        setError('User not found')
        return
      }

      const result = await firebaseHelpers.getTipHistory(targetUserId, activeTab)
      
      if (result.success) {
        setTips(result.tips || [])
      } else {
        setError(result.error || 'Failed to load tip history')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Tip history error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTipIcon = (amount) => {
    if (amount >= 50) return Star
    if (amount >= 25) return Gift
    if (amount >= 10) return Heart
    return Coffee
  }

  const getTipColor = (amount) => {
    if (amount >= 50) return 'text-yellow-500'
    if (amount >= 25) return 'text-purple-500'
    if (amount >= 10) return 'text-pink-500'
    return 'text-green-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading tip history...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchTips}
          className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      {!userId && (
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('sent')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'sent'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Tips Sent
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'received'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Tips Received
          </button>
        </div>
      )}

      {/* Tips List */}
      {tips.length === 0 ? (
        <div className="text-center py-8">
          <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tips {activeTab === 'sent' ? 'sent' : 'received'} yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {activeTab === 'sent' 
              ? 'Tips you send to creators will appear here'
              : 'Tips you receive from supporters will appear here'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tips.map((tip) => {
            const Icon = getTipIcon(tip.amount)
            const iconColor = getTipColor(tip.amount)
            
            return (
              <div
                key={tip.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                      <Icon className={`h-5 w-5 ${iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {activeTab === 'sent' ? 'To' : 'From'}: {tip.recipientName || tip.senderName}
                        </h4>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${tip.amount.toFixed(2)}
                        </span>
                      </div>
                      
                      {tip.modelTitle && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          for "{tip.modelTitle}"
                        </p>
                      )}
                      
                      {tip.message && (
                        <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                          <div className="flex items-start space-x-2">
                            <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">{tip.message}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(tip.timestamp).toLocaleDateString()}</span>
                        </div>
                        {tip.modelId && (
                          <a
                            href={`/model/${tip.modelId}`}
                            className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span>View Model</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TipHistory
