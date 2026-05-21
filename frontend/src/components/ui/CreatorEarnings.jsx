import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { firebaseHelpers } from '../../lib/firebase'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Users, 
  Heart,
  Loader2,
  ExternalLink,
  Download
} from 'lucide-react'

const CreatorEarnings = () => {
  const { user } = useAuth()
  const [earnings, setEarnings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState('30d') // '7d', '30d', '90d', 'all'

  useEffect(() => {
    if (user) {
      fetchEarnings()
    }
  }, [user, timeRange])

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      const result = await firebaseHelpers.getCreatorEarnings(user.uid, timeRange)
      
      if (result.success) {
        setEarnings(result.earnings)
      } else {
        setError(result.error || 'Failed to load earnings')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Earnings error:', err)
    } finally {
      setLoading(false)
    }
  }

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '7d': return 'Last 7 days'
      case '30d': return 'Last 30 days'
      case '90d': return 'Last 90 days'
      case 'all': return 'All time'
      default: return 'Last 30 days'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600 dark:text-gray-400">Loading earnings...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchEarnings}
          className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!earnings) {
    return (
      <div className="text-center py-8">
        <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No earnings data available
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Start creating amazing 3D models to earn tips!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Creator Earnings
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {getTimeRangeLabel()}
          </p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">Total Earnings</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                ${earnings.totalEarnings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Tips Received</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {earnings.totalTips}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-800 dark:text-purple-200">Avg. Tip</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                ${earnings.averageTip.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tips */}
      {earnings.recentTips && earnings.recentTips.length > 0 && (
        <div>
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            Recent Tips
          </h4>
          <div className="space-y-3">
            {earnings.recentTips.slice(0, 5).map((tip) => (
              <div
                key={tip.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-pink-100 dark:bg-pink-900/20 rounded-lg">
                      <Heart className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        From {tip.senderName}
                      </p>
                      {tip.modelTitle && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          for "{tip.modelTitle}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${tip.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(tip.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {tip.message && (
                  <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                    <p className="text-sm text-gray-700 dark:text-gray-300">"{tip.message}"</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Withdrawal Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <ExternalLink className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Withdraw Your Earnings
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
              You can withdraw your earnings once you reach ₹100. Set up your payment method in your profile settings.
            </p>
            <button 
              onClick={() => window.location.href = '/profile/edit'}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Set up payment method →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatorEarnings
