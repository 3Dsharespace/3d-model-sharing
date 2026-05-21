import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import firebaseHelpers from '../lib/firebase'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Eye, 
  Heart, 
  Users, 
  File, 
  BarChart3, 
  PieChart, 
  Calendar,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  Target,
  Zap,
  Crown,
  Award,
  Activity,
  Globe,
  Package,
  Settings
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import PageMeta from '../components/PageMeta'

const PlatformRevenue = () => {
  const { user, profile } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    platformModels: 0,
    totalDownloads: 0,
    totalViews: 0,
    totalLikes: 0,
    averageRevenuePerModel: 0,
    topEarningModels: [],
    revenueByCategory: {},
    monthlyTrend: [],
    platformEarnings: 0,
    creatorEarnings: 0,
    adRevenue: 0,
    tipRevenue: 0
  })
  const [timeRange, setTimeRange] = useState('30d')
  const [models, setModels] = useState([])
  const [users, setUsers] = useState([])

  useEffect(() => {
    checkAdminStatus()
  }, [user, profile])

  useEffect(() => {
    if (isAdmin) {
      loadRevenueData()
    }
  }, [isAdmin, timeRange])

  const checkAdminStatus = async () => {
    if (!user || !profile) {
      setLoading(false)
      return
    }

    try {
      const isAdminUser = profile.isAdmin || profile.role === 'admin' || profile.role === 'super_admin'
      setIsAdmin(isAdminUser)
    } catch (error) {
      console.error('Error checking admin status:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRevenueData = async () => {
    try {
      setLoading(true)
      
      // Load models
      const modelsResult = await firebaseHelpers.getModels({})
      const allModels = modelsResult.models || []
      setModels(allModels)

      // Load users
      const usersResult = await firebaseHelpers.getUsers()
      const allUsers = usersResult.users || []
      setUsers(allUsers)

      // Calculate revenue data
      const platformModels = allModels.filter(m => m.isPlatformModel)
      const userModels = allModels.filter(m => !m.isPlatformModel)
      
      // Calculate platform revenue (100% from platform models + 70% from user models)
      const platformModelRevenue = platformModels.reduce((sum, m) => sum + (m.platformEarnings || 0), 0)
      const userModelPlatformShare = userModels.reduce((sum, m) => sum + (m.platformEarnings || 0), 0)
      const totalPlatformRevenue = platformModelRevenue + userModelPlatformShare
      
      // Calculate creator earnings (30% from user models)
      const creatorEarnings = userModels.reduce((sum, m) => sum + (m.creatorEarnings || 0), 0)
      
      // Calculate other revenue streams
      const adRevenue = allModels.reduce((sum, m) => sum + (m.adRevenue || 0), 0)
      const tipRevenue = allModels.reduce((sum, m) => sum + (m.tipRevenue || 0), 0)
      
      // Calculate monthly revenue
      const currentMonth = new Date().toISOString().slice(0, 7)
      const monthlyRevenue = allModels
        .filter(m => m.createdAt && m.createdAt.startsWith(currentMonth))
        .reduce((sum, m) => sum + (m.platformEarnings || 0), 0)

      // Top earning models
      const topEarningModels = allModels
        .filter(m => m.isPlatformModel)
        .sort((a, b) => (b.platformEarnings || 0) - (a.platformEarnings || 0))
        .slice(0, 10)

      // Revenue by category
      const revenueByCategory = {}
      platformModels.forEach(model => {
        const category = model.category || 'Other'
        revenueByCategory[category] = (revenueByCategory[category] || 0) + (model.platformEarnings || 0)
      })

      // Monthly trend (last 12 months)
      const monthlyTrend = []
      for (let i = 11; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = date.toISOString().slice(0, 7)
        
        const monthRevenue = allModels
          .filter(m => m.createdAt && m.createdAt.startsWith(monthKey))
          .reduce((sum, m) => sum + (m.platformEarnings || 0), 0)
        
        monthlyTrend.push({
          month: monthKey,
          revenue: monthRevenue
        })
      }

      setRevenueData({
        totalRevenue: totalPlatformRevenue,
        monthlyRevenue,
        platformModels: platformModels.length,
        totalDownloads: allModels.reduce((sum, m) => sum + (m.downloads || 0), 0),
        totalViews: allModels.reduce((sum, m) => sum + (m.views || 0), 0),
        totalLikes: allModels.reduce((sum, m) => sum + (m.likes || 0), 0),
        averageRevenuePerModel: platformModels.length > 0 ? totalPlatformRevenue / platformModels.length : 0,
        topEarningModels,
        revenueByCategory,
        monthlyTrend,
        platformEarnings: totalPlatformRevenue,
        creatorEarnings,
        adRevenue,
        tipRevenue
      })
    } catch (error) {
      console.error('Error loading revenue data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading revenue data...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <PageMeta
        title="Platform Revenue Dashboard – 3D ShareSpace"
        description="Track platform revenue, earnings, and financial performance."
        keywords="platform revenue, earnings, financial dashboard, admin"
        url="/admin/revenue"
        type="website"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <DollarSign className="h-8 w-8 mr-3 text-green-600" />
                Platform Revenue Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Track platform earnings, revenue streams, and financial performance
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>
              <Button onClick={loadRevenueData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(revenueData.totalRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(revenueData.monthlyRevenue)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Platform Models</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(revenueData.platformModels)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Revenue/Model</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(revenueData.averageRevenuePerModel)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Streams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-blue-600" />
              Revenue Streams
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Platform Models</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(revenueData.platformEarnings)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">User Model Share (70%)</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(revenueData.creatorEarnings * 0.7)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Ad Revenue</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(revenueData.adRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Tips & Donations</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(revenueData.tipRevenue)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-green-600" />
              Platform Statistics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Downloads</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatNumber(revenueData.totalDownloads)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Views</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatNumber(revenueData.totalViews)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Likes</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatNumber(revenueData.totalLikes)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Platform Models</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatNumber(revenueData.platformModels)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Earning Models */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Award className="h-5 w-5 mr-2 text-yellow-600" />
            Top Earning Platform Models
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Downloads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {revenueData.topEarningModels.map((model, index) => (
                  <tr key={model.uid}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <File className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {model.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(model.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                        {model.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatNumber(model.downloads || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(model.platformEarnings || 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
            Revenue by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(revenueData.revenueByCategory)
              .sort(([,a], [,b]) => b - a)
              .map(([category, revenue]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">{category}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                        style={{ 
                          width: `${(revenue / Math.max(...Object.values(revenueData.revenueByCategory))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white w-20 text-right">
                      {formatCurrency(revenue)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlatformRevenue

