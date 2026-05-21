import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, Eye, MousePointer, BarChart3, Settings, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { ADSENSE_CONFIG } from '../../config/adsense'

const AdSenseDashboard = () => {
  const [metrics, setMetrics] = useState({
    revenue: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    rpm: 0
  })
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Mock data for demonstration - replace with actual AdSense API calls
  const mockMetrics = {
    revenue: 45.67,
    impressions: 12500,
    clicks: 89,
    ctr: 0.71,
    rpm: 3.65
  }

  useEffect(() => {
    loadMetrics()
  }, [])

  const loadMetrics = async () => {
    setLoading(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setMetrics(mockMetrics)
    setLastUpdated(new Date())
    setLoading(false)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              AdSense Dashboard
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor your ad performance and revenue
            </p>
          </div>
        </div>
        
        <Button onClick={loadMetrics} disabled={loading} variant="outline" className="h-9 px-4 inline-flex items-center">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Revenue</p>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {formatCurrency(metrics.revenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Impressions</p>
              <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                {formatNumber(metrics.impressions)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
          <div className="flex items-center">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                  <MousePointer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Clicks</p>
              <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                {formatNumber(metrics.clicks)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-600 dark:text-orange-400">CTR</p>
              <p className="text-lg font-semibold text-orange-900 dark:text-orange-100">
                {metrics.ctr}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400">RPM</p>
              <p className="text-lg font-semibold text-indigo-900 dark:text-indigo-100">
                ${metrics.rpm}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Status */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Configuration Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Publisher ID</span>
              <span className={`text-sm font-medium ${ADSENSE_CONFIG.PUBLISHER_ID !== 'ca-pub-XXXXXXXXXX' ? 'text-green-600' : 'text-red-600'}`}>
                {ADSENSE_CONFIG.PUBLISHER_ID !== 'ca-pub-XXXXXXXXXX' ? 'Configured' : 'Not Configured'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Auto Ads</span>
              <span className={`text-sm font-medium ${ADSENSE_CONFIG.AUTO_ADS.enabled ? 'text-green-600' : 'text-red-600'}`}>
                {ADSENSE_CONFIG.AUTO_ADS.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Manual Ads</span>
              <span className={`text-sm font-medium ${Object.values(ADSENSE_CONFIG.MANUAL_ADS).some(ad => ad.enabled) ? 'text-green-600' : 'text-red-600'}`}>
                {Object.values(ADSENSE_CONFIG.MANUAL_ADS).some(ad => ad.enabled) ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Test Mode</span>
              <span className={`text-sm font-medium ${ADSENSE_CONFIG.TESTING.testMode ? 'text-yellow-600' : 'text-green-600'}`}>
                {ADSENSE_CONFIG.TESTING.testMode ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      )}

      {/* Settings Link */}
      <div className="mt-6 text-center">
        <Button variant="outline" className="h-9 px-4 inline-flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Configure AdSense
        </Button>
      </div>
    </div>
  )
}

export default AdSenseDashboard
