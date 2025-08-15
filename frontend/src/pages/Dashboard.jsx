import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { 
  Upload, 
  BarChart3, 
  TrendingUp, 
  Download, 
  Eye, 
  Star, 
  Settings, 
  User, 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  MoreHorizontal,
  ArrowUpRight,
  Activity,
  Bell,
  Search
} from 'lucide-react'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'

const Dashboard = () => {
  const { user, profile } = useAuth()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const { models: userModels, error: modelsError } = await firebaseHelpers.getUserModels(user.uid)
        if (modelsError) {
          console.error('Error fetching models:', modelsError)
          setError('Failed to load your models')
        } else {
          setModels(userModels || [])
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [user])

  const getTotalStats = () => {
    if (!models.length) return { downloads: 0, views: 0, likes: 0 }
    
    return models.reduce((acc, model) => ({
      downloads: acc.downloads + (model.downloads_count || 0),
      views: acc.views + (model.view_count || 0),
      likes: acc.likes + (model.likes_count || 0)
    }), { downloads: 0, views: 0, likes: 0 })
  }

  const getRecentActivity = () => {
    if (!models.length) return []
    
    return models
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(model => ({
        id: model.id,
        type: 'upload',
        title: model.title,
        date: model.created_at,
        icon: Package
      }))
  }

  const filteredModels = models.filter(model =>
    model.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    model.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const stats = getTotalStats()
  const recentActivity = getRecentActivity()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner text="Loading your dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <EmptyState
          icon={Activity}
          title="Error Loading Dashboard"
          description={error}
          actionText="Try Again"
          onAction={() => window.location.reload()}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {profile?.display_name || profile?.username || 'Creator'}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Here's what's happening with your 3D models today
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                <Bell className="w-4 h-4 mr-2 inline" />
                Notifications
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Upload className="w-4 h-4 mr-2 inline" />
                Upload Model
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Total Models */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Models</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{models.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400">+{models.length > 0 ? Math.floor(models.length / 2) : 0}</span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">this month</span>
            </div>
          </div>

          {/* Total Downloads */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Downloads</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.downloads}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400">+12%</span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">vs last month</span>
            </div>
          </div>

          {/* Total Views */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.views}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400">+8%</span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">vs last month</span>
            </div>
          </div>

          {/* Total Likes */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Likes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.likes}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <Star className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400">+15%</span>
              <span className="text-gray-600 dark:text-gray-400 ml-1">vs last month</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('models')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'models'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                My Models
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Recent Activity */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                    {recentActivity.length > 0 ? (
                      <div className="space-y-3">
                        {recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                              <activity.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Uploaded "{activity.title}"
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(activity.date)}
                              </p>
                            </div>
                            <ArrowUpRight className="w-4 h-4 text-gray-400" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Activity}
                        title="No Recent Activity"
                        description="Start uploading models to see your activity here"
                        actionText="Upload Your First Model"
                        onAction={() => setActiveTab('models')}
                      />
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105">
                      <Upload className="w-8 h-8 mb-2" />
                      <p className="font-semibold">Upload Model</p>
                      <p className="text-sm opacity-90">Share your 3D creation</p>
                    </button>
                    <button className="p-4 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl hover:from-green-600 hover:to-teal-700 transition-all transform hover:scale-105">
                      <BarChart3 className="w-8 h-8 mb-2" />
                      <p className="font-semibold">View Analytics</p>
                      <p className="text-sm opacity-90">Track your performance</p>
                    </button>
                    <button className="p-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all transform hover:scale-105">
                      <Settings className="w-8 h-8 mb-2" />
                      <p className="font-semibold">Account Settings</p>
                      <p className="text-sm opacity-90">Manage your profile</p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Models Tab */}
            {activeTab === 'models' && (
              <div className="space-y-6">
                {/* Search and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search your models..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload New Model
                  </button>
                </div>

                {/* Models Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Model
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Downloads
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Views
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Created
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredModels.length > 0 ? (
                          filteredModels.map((model) => (
                            <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                    <Package className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{model.title}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">{model.description?.substring(0, 50)}...</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Download className="w-4 h-4 text-green-500 mr-1" />
                                  <span className="text-sm text-gray-900 dark:text-white">{model.downloads_count || 0}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <Eye className="w-4 h-4 text-blue-500 mr-1" />
                                  <span className="text-sm text-gray-900 dark:text-white">{model.view_count || 0}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {formatFileSize(model.file_size)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(model.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex items-center space-x-2">
                                  <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-12">
                              <EmptyState
                                icon={Package}
                                title="No Models Found"
                                description={searchTerm ? `No models match "${searchTerm}"` : "You haven't uploaded any models yet"}
                                actionText="Upload Your First Model"
                                onAction={() => setActiveTab('overview')}
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Performance Chart Placeholder */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Download Trends</h3>
                    <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">Chart coming soon</p>
                      </div>
                    </div>
                  </div>

                  {/* Popular Models */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Performing Models</h3>
                    {models.length > 0 ? (
                      <div className="space-y-3">
                        {models
                          .sort((a, b) => (b.downloads_count || 0) - (a.downloads_count || 0))
                          .slice(0, 5)
                          .map((model, index) => (
                            <div key={model.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                              <div className="flex items-center">
                                    <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full flex items-center justify-center mr-3">
                                      {index + 1}
                                    </span>
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{model.title}</span>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <Download className="w-4 h-4 mr-1" />
                                    {model.downloads_count || 0}
                                  </div>
                                </div>
                              ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={TrendingUp}
                        title="No Analytics Data"
                        description="Upload models to start tracking performance"
                        actionText="Upload Model"
                        onAction={() => setActiveTab('models')}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Settings */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Settings</h3>
                    <div className="space-y-4">
                      <button className="w-full p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <User className="w-5 h-5 text-gray-500 mr-3" />
                            <span className="text-gray-900 dark:text-white">Edit Profile</span>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                      <button className="w-full p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Bell className="w-5 h-5 text-gray-500 mr-3" />
                            <span className="text-gray-900 dark:text-white">Notification Preferences</span>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Account Settings */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Settings</h3>
                    <div className="space-y-4">
                      <button className="w-full p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Settings className="w-5 h-5 text-gray-500 mr-3" />
                            <span className="text-gray-900 dark:text-white">Security Settings</span>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                      <button className="w-full p-3 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Package className="w-5 h-5 text-gray-500 mr-3" />
                            <span className="text-gray-900 dark:text-white">Model Settings</span>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
