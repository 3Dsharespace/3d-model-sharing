import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'
import firebaseHelpers from '../lib/firebase'
import { motion, AnimatePresence } from 'framer-motion'
import ModelManagementTab from '../components/admin/ModelManagementTab'
import UserManagementTab from '../components/admin/UserManagementTab'
import { 
  // Core Icons
  Users, User, File, Download, Eye, Heart, TrendingUp, BarChart3, Shield, 
  AlertTriangle, AlertCircle, CheckCircle, XCircle, Search, Filter, 
  MoreVertical, Edit3, Trash2, Ban, UserCheck, Activity, Calendar,
  Loader2, ChevronDown, ChevronUp, RefreshCw, LineChart, DollarSign,
  Target, TrendingDown, Clock, PieChart, Globe, Zap, Plus, FileText,
  MessageSquare, Tag, Package, Settings, Crown, Code, Star, StarOff,
  UploadCloud, Info, Award, Sparkles, Database, ServerCog, 
  // New Icons for better UI
  Home, Layout, Gauge, Wallet, Upload, FileSpreadsheet, 
  Bell, Mail, Lock, UserCog, MonitorPlay, Briefcase, Monitor,
  ArrowRight, ExternalLink, Copy, Power, Wifi, HardDrive,
  Cpu, MemoryStick, Network, Layers, Folder, Image,
  PlayCircle, PauseCircle, StopCircle, RotateCcw,
  ChevronLeft, ChevronRight, Maximize2, Minimize2,
  Sun, Moon, Palette, Languages, Volume2, VolumeX
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import PageMeta from '../components/PageMeta'
import AnalyticsChart from '../components/ui/AnalyticsChart'
import { getModelUrl } from '../lib/modelLinks'

const AdminDashboard = () => {
  const { user, profile, loading: authLoading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  
  // Main Dashboard Data
  const [dashboardData, setDashboardData] = useState({
    stats: {
    totalUsers: 0,
    totalModels: 0,
    totalDownloads: 0,
      totalRevenue: 0,
      activeUsers: 0,
    pendingModels: 0,
      pendingReports: 0,
      bannedUsers: 0,
      recentUploads: 0,
      platformModels: 0
    },
    charts: {
      userGrowth: [],
      revenueGrowth: [],
      downloadTrends: [],
      categoryDistribution: []
    },
    recentActivities: [],
    systemHealth: {
      uptime: '99.9%',
      responseTime: '120ms',
      errorRate: '0.1%',
      storage: '67%'
    }
  })
  
  const [users, setUsers] = useState([])
  const [models, setModels] = useState([])
  const [selectedItems, setSelectedItems] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterOptions, setFilterOptions] = useState({})
  
  // Derived chart datasets
  const userGrowthData = useMemo(() => {
    // Last 14 days new users per day
    const days = 14
    const map = new Map()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      map.set(key, 0)
    }
    users.forEach(u => {
      const key = (u.createdAt ? new Date(u.createdAt) : null)
      if (!key) return
      const k = new Date(key).toISOString().slice(0, 10)
      if (map.has(k)) map.set(k, (map.get(k) || 0) + 1)
    })
    return Array.from(map.entries()).map(([date, value]) => ({ date, value }))
  }, [users])

  const uploadTrendsData = useMemo(() => {
    // Last 14 days new models per day
    const days = 14
    const map = new Map()
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      map.set(key, 0)
    }
    models.forEach(m => {
      const key = (m.createdAt ? new Date(m.createdAt) : null)
      if (!key) return
      const k = new Date(key).toISOString().slice(0, 10)
      if (map.has(k)) map.set(k, (map.get(k) || 0) + 1)
    })
    return Array.from(map.entries()).map(([date, value]) => ({ date, value }))
  }, [models])

  const downloadsByCategoryData = useMemo(() => {
    const agg = new Map()
    models.forEach(m => {
      const cat = (m.category || 'Uncategorized')
      agg.set(cat, (agg.get(cat) || 0) + (m.downloads || 0))
    })
    // Top 8 categories
    return Array.from(agg.entries())
      .sort((a,b)=>b[1]-a[1])
      .slice(0,8)
      .map(([name, value]) => ({ name, value }))
  }, [models])

  const topDownloadsBarData = useMemo(() => {
    const trim = (s) => {
      const str = String(s || '')
      return str.length > 14 ? str.slice(0, 12) + '…' : str
    }
    return [...models]
      .sort((a,b)=> (b.downloads||0) - (a.downloads||0))
      .slice(0,10)
      .map(m => ({ label: trim(m.title), value: m.downloads || 0 }))
  }, [models])
  
  // Global search across users/models
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users
    const q = searchQuery.toLowerCase()
    return users.filter(u => (
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q)
    ))
  }, [users, searchQuery])
  
  const filteredModels = useMemo(() => {
    if (!searchQuery) return models
    const q = searchQuery.toLowerCase()
    return models.filter(m => (
      (m.title || '').toLowerCase().includes(q) ||
      (m.description || '').toLowerCase().includes(q) ||
      (m.category || '').toLowerCase().includes(q) ||
      (m.author?.username || '').toLowerCase().includes(q) ||
      (Array.isArray(m.tags) && m.tags.some(t => (t || '').toLowerCase().includes(q)))
    ))
  }, [models, searchQuery])

  // Sidebar Navigation Structure
  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      color: 'blue',
      description: 'Overview and key metrics'
    },
    {
      id: 'content',
      label: 'Content Management',
      icon: Package,
      color: 'green',
      children: [
        { id: 'models', label: 'Models', icon: File, path: '/admin/models' },
        { id: 'bulk-upload', label: 'Bulk Upload', icon: UploadCloud, path: '/admin/bulk-upload' },
        { id: 'categories', label: 'Categories', icon: Folder, path: '/admin/categories' },
        { id: 'tags', label: 'Tags', icon: Tag, path: '/admin/tags' }
      ]
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      color: 'purple',
      children: [
        { id: 'all-users', label: 'All Users', icon: Users },
        { id: 'admins', label: 'Administrators', icon: Crown },
        { id: 'creators', label: 'Creators', icon: Star },
        { id: 'banned', label: 'Banned Users', icon: Ban }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      color: 'indigo',
      children: [
        { id: 'overview', label: 'Overview', icon: Gauge },
        { id: 'revenue', label: 'Revenue', icon: DollarSign, path: '/admin/revenue' },
        { id: 'downloads', label: 'Downloads', icon: Download },
        { id: 'engagement', label: 'User Engagement', icon: Heart }
      ]
    },
    {
      id: 'system',
      label: 'System',
      icon: Settings,
      color: 'gray',
      children: [
        { id: 'health', label: 'System Health', icon: Activity },
        { id: 'logs', label: 'Activity Logs', icon: FileText },
        { id: 'backups', label: 'Backups', icon: Database },
        { id: 'maintenance', label: 'Maintenance', icon: ServerCog }
      ]
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      color: 'red',
      children: [
        { id: 'access-control', label: 'Access Control', icon: Lock },
        { id: 'audit-logs', label: 'Audit Logs', icon: Search },
        { id: 'reports', label: 'Security Reports', icon: AlertTriangle },
        { id: 'sessions', label: 'Active Sessions', icon: Monitor }
      ]
    },
    {
      id: 'communications',
      label: 'Communications',
      icon: MessageSquare,
      color: 'orange',
      children: [
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'emails', label: 'Email Templates', icon: Mail },
        { id: 'announcements', label: 'Announcements', icon: Sparkles },
        { id: 'support', label: 'Support Tickets', icon: Info }
      ]
    }
  ]

  useEffect(() => {
    if (authLoading) return
    checkAdminStatus()
  }, [user, profile, authLoading])

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData()
      // Real-time sessions: subscribe to user list updates
      const unsubscribe = firebaseHelpers.subscribeToUsers((liveUsers) => {
        setUsers(liveUsers)
      })
      return () => unsubscribe && unsubscribe()
    }
  }, [isAdmin])

  const checkAdminStatus = async () => {
    if (authLoading) return
    if (!user || !profile) {
        setLoading(false)
      return
    }

    try {
      console.log('🔍 Checking admin status for user:', user.uid)
      console.log('📋 Profile data:', profile)
      
      const isAdminUser = profile.isAdmin === true || 
                         profile.role === 'admin' || 
                         profile.role === 'super_admin' ||
                         profile.role === 'administrator'
      
      console.log('🔒 Is admin user?', isAdminUser)
      setIsAdmin(isAdminUser)
      } catch (error) {
      console.error('Error checking admin status:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load users
      const usersResult = await firebaseHelpers.getUsers()
      const allUsers = usersResult.users || []
      setUsers(allUsers)

      // Load models
      const modelsResult = await firebaseHelpers.getModels({})
      const allModels = modelsResult.models || []
      setModels(allModels)

      // Calculate dashboard statistics
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

      const activeUsers = allUsers.filter(u => 
        new Date(u.lastLogin || u.createdAt) > last30Days
      ).length

      const recentUploads = allModels.filter(m => 
        new Date(m.createdAt) > startOfDay
      ).length

      const platformModels = allModels.filter(m => m.isPlatformModel).length

      const totalRevenue = allModels.reduce((sum, m) => 
        sum + (m.platformEarnings || 0) + (m.creatorEarnings || 0), 0
      )

      const pendingModels = allModels.filter(m => m.status === 'pending').length
      const bannedUsers = allUsers.filter(u => u.status === 'banned').length
      const moderationResult = await firebaseHelpers.getModerationStats()
      const pendingReports = moderationResult.success ? moderationResult.stats.pending : 0

      setDashboardData(prev => ({
        ...prev,
        stats: {
          totalUsers: allUsers.length,
          totalModels: allModels.length,
          totalDownloads: allModels.reduce((sum, m) => sum + (m.downloads || 0), 0),
          totalRevenue,
          activeUsers,
          pendingModels,
          pendingReports,
          bannedUsers,
          recentUploads,
          platformModels
        },
        recentActivities: [
          ...allModels.slice(0, 5).map(model => ({
            id: model.uid,
            type: 'upload',
            message: `New model uploaded: ${model.title}`,
            timestamp: model.createdAt,
            user: model.author?.username || 'Unknown',
            icon: Upload
          })),
          ...allUsers.slice(0, 3).map(user => ({
            id: user.uid,
            type: 'user',
            message: `New user registered: ${user.username || user.email}`,
            timestamp: user.createdAt,
            user: user.username || user.email,
            icon: UserCheck
          }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10)
      }))

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = (action, items) => {
    console.log(`Performing ${action} on`, items)
    // Implement bulk actions
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <Crown className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading Admin Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Gathering platform insights...</p>
        </motion.div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900/20 dark:to-orange-900/20 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Access Restricted</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You need administrator privileges to access this dashboard. Please contact a system administrator if you believe this is an error.
          </p>
          <Button onClick={() => window.location.href = '/'} className="px-6 py-3">
            <Home className="w-4 h-4 mr-2" />
            Return to Home
          </Button>
        </motion.div>
      </div>
    )
  }

  const StatCard = ({ title, value, change, icon: Icon, color, trend }) => (
    <motion.div 
      whileHover={{ y: -2, shadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden group"
    >
          <div className="flex items-center justify-between">
            <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : 
               trend === 'down' ? <TrendingDown className="w-4 h-4 mr-1" /> : 
               <Activity className="w-4 h-4 mr-1" />}
              {change}
            </div>
          )}
              </div>
        <div className={`p-3 rounded-lg bg-${color}-100 dark:bg-${color}-900/20 group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`w-6 h-6 text-${color}-600 dark:text-${color}-400`} />
            </div>
          </div>
      <div className={`absolute top-0 right-0 w-20 h-20 bg-${color}-500/5 rounded-full -mr-10 -mt-10`}></div>
    </motion.div>
  )

  const SidebarItem = ({ item, level = 0, isCollapsed }) => {
    const [isOpen, setIsOpen] = useState(false)
    const hasChildren = item.children && item.children.length > 0
    const isActive = activeTab === item.id

              return (
      <div className="mb-1">
        <motion.button
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            if (hasChildren) {
              setIsOpen(!isOpen)
            } else {
              setActiveTab(item.id)
              if (item.path) {
                window.open(item.path, '_blank')
              }
            }
          }}
          className={`w-full flex items-center px-3 py-2.5 rounded-lg text-left transition-all duration-200 group ${
            isActive 
              ? `bg-${item.color}-100 dark:bg-${item.color}-900/20 text-${item.color}-700 dark:text-${item.color}-300 border-r-2 border-${item.color}-500` 
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          style={{ paddingLeft: `${12 + level * 16}px` }}
        >
          <item.icon className={`w-5 h-5 ${isCollapsed ? 'mr-0' : 'mr-3'} flex-shrink-0`} />
          {!isCollapsed && (
            <>
              <span className="font-medium flex-1">{item.label}</span>
              {hasChildren && (
                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
              )}
            </>
          )}
        </motion.button>
        
        {hasChildren && isOpen && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1"
          >
            {item.children.map((child) => (
              <SidebarItem key={child.id} item={child} level={level + 1} isCollapsed={isCollapsed} />
            ))}
          </motion.div>
        )}
      </div>
    )
  }

  const DashboardContent = () => (
          <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-8 text-white relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex items-center justify-between">
                  <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, Admin! 👋</h1>
              <p className="text-blue-100 text-lg">
                Here's what's happening with your 3D platform today
              </p>
                  </div>
            <div className="hidden md:flex items-center space-x-4">
                  <Button
                onClick={() => window.open('/admin/bulk-upload', '_blank')}
                className="bg-white/20 hover:bg-white/30 border border-white/30 text-white"
                  >
                <UploadCloud className="w-4 h-4 mr-2" />
                Bulk Upload
                  </Button>
                  <Button
                onClick={loadDashboardData}
                className="bg-white/20 hover:bg-white/30 border border-white/30 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
                  </Button>
                </div>
              </div>
            </div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Total Users"
          value={formatNumber(dashboardData.stats.totalUsers)}
          change="+12% from last month"
          icon={Users}
          color="blue"
          trend="up"
        />
        <StatCard
          title="Total Models"
          value={formatNumber(dashboardData.stats.totalModels)}
          change="+8% from last month"
          icon={Package}
          color="green"
          trend="up"
        />
        <StatCard
          title="Total Downloads"
          value={formatNumber(dashboardData.stats.totalDownloads)}
          change="+23% from last month"
          icon={Download}
          color="purple"
          trend="up"
        />
        <StatCard
                      title="Revenue"
          value={formatCurrency(dashboardData.stats.totalRevenue)}
          change="+15% from last month"
          icon={DollarSign}
          color="orange"
          trend="up"
        />
      </motion.div>

      {/* Secondary Metrics */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Active Users (30d)"
          value={formatNumber(dashboardData.stats.activeUsers)}
          change="Daily active users"
          icon={Activity}
          color="indigo"
          trend="up"
        />
        <StatCard
          title="Platform Models"
          value={formatNumber(dashboardData.stats.platformModels)}
          change="Admin uploaded"
          icon={Crown}
          color="yellow"
          trend="neutral"
        />
        <StatCard
          title="Pending Reviews"
          value={formatNumber(dashboardData.stats.pendingModels + dashboardData.stats.pendingReports)}
          change="Needs attention"
          icon={AlertTriangle}
          color="red"
          trend="neutral"
        />
        <StatCard
          title="Today's Uploads"
          value={formatNumber(dashboardData.stats.recentUploads)}
          change="New content today"
          icon={Upload}
          color="teal"
          trend="up"
        />
      </motion.div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-blue-600" />
              Quick Actions
            </h3>
                    <div className="space-y-3">
              <Button 
                onClick={() => window.open('/admin/bulk-upload', '_blank')}
                className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <UploadCloud className="w-4 h-4 mr-3" />
                Bulk Upload Models
              </Button>
                  <Button
                onClick={() => setActiveTab('all-users')}
                variant="outline" 
                className="w-full justify-start border-green-200 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400"
              >
                <Users className="w-4 h-4 mr-3" />
                Manage Users
                  </Button>
              <Button 
                onClick={() => window.open('/admin/revenue', '_blank')}
                variant="outline" 
                className="w-full justify-start border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400"
              >
                <DollarSign className="w-4 h-4 mr-3" />
                View Revenue
                            </Button>
              <Button 
                onClick={() => setActiveTab('health')}
                variant="outline" 
                className="w-full justify-start border-orange-200 text-orange-700 hover:bg-orange-50 dark:border-orange-700 dark:text-orange-400"
              >
                <Activity className="w-4 h-4 mr-3" />
                System Health
                </Button>
              </div>
                    </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              Recent Activity
            </h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {dashboardData.recentActivities.map((activity, index) => (
                <motion.div 
                      key={activity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                      <activity.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                            </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activity.user} • {new Date(activity.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                </motion.div>
                  ))}
              </div>
            </div>
        </motion.div>
              </div>

      {/* System Health */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <ServerCog className="w-5 h-5 mr-2 text-blue-600" />
          System Health
        </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Wifi className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">Online</p>
                  </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <Gauge className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Reports</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{dashboardData.stats.pendingReports}</p>
              </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending Models</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{dashboardData.stats.pendingModels}</p>
                  </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <HardDrive className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Banned Users</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">{dashboardData.stats.bannedUsers}</p>
              </div>
                  </div>
      </motion.div>
                  </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <PageMeta
        title="Admin Dashboard – 3D ShareSpace"
        description="Comprehensive admin dashboard for managing your 3D model platform"
        keywords="admin dashboard, platform management, analytics, content management"
        url="/admin"
        type="website"
      />

      <div className="flex h-screen">
        {/* Sidebar */}
        <motion.aside 
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ease-in-out`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">3D ShareSpace</p>
                  </div>
                  </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1"
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
                            </div>
                              </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {sidebarItems.map((item) => (
              <SidebarItem key={item.id} item={item} isCollapsed={sidebarCollapsed} />
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                          </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {profile?.username || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Administrator</p>
              </div>
            </div>
          )}
                  </div>
        </motion.aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {activeTab.replace('-', ' ')}
                </h1>
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                  Live
                              </span>
                  </div>
              <div className="flex items-center space-x-3">
                {/* Global Search */}
                <div className="relative hidden md:block">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users, models..."
                    className="pl-9 pr-3 py-2 w-72 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Bell className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => window.location.href = '/'}
                  variant="outline" 
                  size="sm"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Site
                </Button>
                </div>
              </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && <DashboardContent />}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"><div className="text-sm text-gray-500 dark:text-gray-400">Users</div><div className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</div></div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"><div className="text-sm text-gray-500 dark:text-gray-400">Models</div><div className="text-2xl font-bold text-gray-900 dark:text-white">{models.length}</div></div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"><div className="text-sm text-gray-500 dark:text-gray-400">Downloads</div><div className="text-2xl font-bold text-gray-900 dark:text-white">{models.reduce((a,b)=>a+(b.downloads||0),0)}</div></div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"><div className="text-sm text-gray-500 dark:text-gray-400">Views</div><div className="text-2xl font-bold text-gray-900 dark:text-white">{models.reduce((a,b)=>a+(b.views||0),0)}</div></div>
                  </div>
                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"><Users className="w-5 h-5 mr-2 text-blue-600"/>User signups (14d)</h3>
                      <AnalyticsChart data={userGrowthData} type="line" title="Signups" color="#3b82f6" height={260} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"><Upload className="w-5 h-5 mr-2 text-teal-600"/>Model uploads (14d)</h3>
                      <AnalyticsChart data={uploadTrendsData} type="bar" title="Uploads" color="#14b8a6" height={260} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"><Download className="w-5 h-5 mr-2 text-purple-600"/>Downloads by category</h3>
                      <AnalyticsChart data={downloadsByCategoryData} type="pie" title="Downloads" height={260} />
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center"><BarChart3 className="w-5 h-5 mr-2 text-indigo-600"/>Top downloads</h3>
                      <AnalyticsChart data={topDownloadsBarData} type="bar" title="Downloads" color="#6366f1" height={260} />
                    </div>
                  </div>
                  {/* Merged quick lists: Downloads + Users */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Downloads</h3>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {[...models].sort((a,b)=> (b.downloads||0)-(a.downloads||0)).slice(0,12).map((m) => (
                          <div key={m.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{m.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Downloads {m.downloads||0} • Views {m.views||0}</div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => window.open(getModelUrl(m), '_blank')}>Open</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Newest Users</h3>
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {[...users].sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt)).slice(0,12).map((u) => (
                          <div key={u.uid} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{u.username || u.displayName || u.email}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => window.open(`/profile/${u.uid}`, '_blank')}>Open</Button>
                              <Button size="sm" variant="outline" onClick={async ()=>{ const makeAdmin = !(u.isAdmin || u.role==='admin'); await firebaseHelpers.setUserAsAdmin(u.uid, makeAdmin); const res = await firebaseHelpers.getUsers(); setUsers(res.users||[]) }}>{(u.isAdmin || u.role==='admin') ? 'Revoke' : 'Make Admin'}</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {dashboardData.recentActivities.map(a => (
                        <div key={a.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                          <div className="text-sm text-gray-900 dark:text-white">{a.message}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(a.timestamp).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
              {searchQuery && (
                <motion.div
                  key="global-search"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Search className="w-5 h-5 mr-2" />
                      Search Results
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Users ({filteredUsers.length})</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {filteredUsers.slice(0, 20).map(u => (
                            <div key={u.uid} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{u.username || u.displayName || u.email}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                              </div>
                              <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{u.role || (u.isAdmin ? 'admin' : 'user')}</span>
                            </div>
                          ))}
                          {filteredUsers.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-400">No users found</div>}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Models ({filteredModels.length})</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {filteredModels.slice(0, 20).map(m => (
                            <div key={m.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">{m.title}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{m.category} • {(m.author?.username) || 'Unknown'}</div>
                              </div>
                              <Button size="sm" variant="outline" onClick={() => window.open(getModelUrl(m), '_blank')}>Open</Button>
                            </div>
                          ))}
                          {filteredModels.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-400">No models found</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
        {activeTab === 'models' && (
                <motion.div 
                  key="models"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <ModelManagementTab />
                </motion.div>
              )}
              
              {activeTab === 'all-users' && (
                <motion.div 
                  key="all-users"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <UserManagementTab />
                </motion.div>
              )}
              
              {activeTab === 'bulk-upload' && (
                <motion.div 
                  key="bulk-upload"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-20"
                >
                  <UploadCloud className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Bulk Upload Models</h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Upload multiple 3D models efficiently</p>
                  <Button onClick={() => window.open('/admin/bulk-upload', '_blank')}>
                    <UploadCloud className="w-4 h-4 mr-2" />
                    Open Bulk Upload Tool
                  </Button>
                </motion.div>
              )}
              
              {activeTab === 'health' && (
                <motion.div 
                  key="health"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                      <Activity className="w-6 h-6 mr-2 text-green-600" />
                      System Health Monitoring
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Wifi className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Server Uptime</h3>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">99.9%</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</p>
              </div>
              
                      <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <Gauge className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Response Time</h3>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">120ms</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Average</p>
              </div>
              
                      <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <HardDrive className="w-12 h-12 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Storage Used</h3>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">67%</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Of total capacity</p>
              </div>
              
                      <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                        <AlertTriangle className="w-12 h-12 text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error Rate</h3>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">0.1%</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Last 24 hours</p>
                  </div>
                  </div>
                </div>
                </motion.div>
              )}
              
              {activeTab === 'downloads' && (
                <motion.div key="downloads" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Downloads</h3>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                      {[...models].sort((a,b)=> (b.downloads||0)-(a.downloads||0)).map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{m.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Downloads {m.downloads||0} • Views {m.views||0}</div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => window.open(getModelUrl(m), '_blank')}>Open</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'engagement' && (
                <motion.div key="engagement" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Most Liked</h3>
                    <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                      {[...models].sort((a,b)=> (b.likes||0)-(a.likes||0)).map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{m.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Likes {m.likes||0} • Views {m.views||0}</div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => window.open(getModelUrl(m), '_blank')}>Open</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'maintenance' && (
                <motion.div key="maintenance" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Maintenance Tools</h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.reload(); }}>Clear Cache & Reload</Button>
                      <Button variant="outline" onClick={() => loadDashboardData()}>Refresh Data</Button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">These client-side tools help quickly resolve view issues. Server-side tasks should be run via Firebase Console.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reports' && (
                <motion.div key="reports" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"><div className="text-sm text-gray-500 dark:text-gray-400">Admins</div><div className="text-2xl font-bold text-gray-900 dark:text-white">{users.filter(u => u.isAdmin || u.role === 'admin').length}</div></div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"><div className="text-sm text-gray-500 dark:text-gray-400">New Users (30d)</div><div className="text-2xl font-bold text-gray-900 dark:text-white">{users.filter(u=> new Date(u.createdAt) > new Date(Date.now()-30*24*60*60*1000)).length}</div></div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"><div className="text-sm text-gray-500 dark:text-gray-400">Models (Platform)</div><div className="text-2xl font-bold text-gray-900 dark:text-white">{models.filter(m=>m.isPlatformModel).length}</div></div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Potential Security Items</h3>
                    <ul className="list-disc pl-5 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                      <li>Review admin accounts regularly.</li>
                      <li>Enable Firebase App Check enforcement for Firestore/Storage/Functions.</li>
                      <li>Audit rules in `firestore.rules` and `storage.rules` after each release.</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              {activeTab === 'admins' && (
                <motion.div key="admins" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Administrators</h3>
                  <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                    {filteredUsers.filter(u => u.isAdmin || u.role === 'admin').map(u => (
                      <div key={u.uid} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="text-sm text-gray-900 dark:text-white">{u.username || u.displayName || u.email}</div>
                        <Button size="sm" variant="outline" onClick={async ()=>{ await firebaseHelpers.setUserAsAdmin(u.uid,false); const res=await firebaseHelpers.getUsers(); setUsers(res.users||[])}}>Revoke</Button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'creators' && (
                <motion.div key="creators" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Creators</h3>
                  <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                    {filteredUsers.filter(u => (u.role||'').includes('creator')).map(u => (
                      <div key={u.uid} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="text-sm text-gray-900 dark:text-white">{u.username || u.displayName || u.email}</div>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{u.role || 'creator'}</span>
                      </div>
                    ))}
                    {filteredUsers.filter(u => (u.role||'').includes('creator')).length === 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">No creators found</div>
                    )}
                  </div>
                </motion.div>
              )}
              
              {activeTab === 'analytics' && (
                <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"><div className="text-sm text-gray-500 dark:text-gray-400">Users</div><div className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</div></div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"><div className="text-sm text-gray-500 dark:text-gray-400">Models</div><div className="text-2xl font-bold text-gray-900 dark:text-white">{models.length}</div></div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"><div className="text-sm text-gray-500 dark:text-gray-400">Downloads</div><div className="text-2xl font-bold text-gray-900 dark:text-white">{models.reduce((a,b)=>a+(b.downloads||0),0)}</div></div>
                    <div className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700"><div className="text-sm text-gray-500 dark:text-gray-400">Views</div><div className="text-2xl font-bold text-gray-900 dark:text-white">{models.reduce((a,b)=>a+(b.views||0),0)}</div></div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Models</h3>
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {[...models].sort((a,b)=> (b.downloads||0)-(a.downloads||0)).slice(0,15).map(m => (
                        <div key={m.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{m.title}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">DL {m.downloads||0} • Views {m.views||0}</div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => window.open(getModelUrl(m), '_blank')}>Open</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'logs' && (
                <motion.div key="logs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Logs</h3>
                  <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                    {dashboardData.recentActivities.map((a) => (
                      <div key={a.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="text-sm text-gray-900 dark:text-white">{a.type}: {a.message}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(a.timestamp).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'backups' && (
                <motion.div key="backups" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Backups</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Download a quick JSON backup of current users and models.</p>
                  <Button onClick={() => { const blob = new Blob([JSON.stringify({ users, models }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `backup-${new Date().toISOString()}.json`; a.click(); URL.revokeObjectURL(url); }}>Download Backup</Button>
                </motion.div>
              )}

              {activeTab === 'access-control' && (
                <motion.div key="access-control" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Access Control</h3>
                  <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                    {filteredUsers.map(u => (
                      <div key={u.uid} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{u.username || u.displayName || u.email}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">{u.role || (u.isAdmin ? 'admin' : 'user')}</span>
                          <Button size="sm" variant="outline" onClick={async () => { const makeAdmin = !(u.isAdmin || u.role === 'admin'); await firebaseHelpers.setUserAsAdmin(u.uid, makeAdmin); const res = await firebaseHelpers.getUsers(); setUsers(res.users || []); }}>{(u.isAdmin || u.role === 'admin') ? 'Revoke Admin' : 'Make Admin'}</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'audit-logs' && (
                <motion.div key="audit-logs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Audit Logs</h3>
                  <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                    {[...dashboardData.recentActivities].map(a => (
                      <div key={a.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="text-sm text-gray-900 dark:text-white">{a.type}: {a.message}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(a.timestamp).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'sessions' && (
                <motion.div key="sessions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Sessions</h3>
                  <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                    {filteredUsers.map(u => (
                      <div key={u.uid} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                        <div className="text-sm text-gray-900 dark:text-white">{u.username || u.displayName || u.email}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Last login: {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'N/A'}</div>
                      </div>
                    ))}
                    {filteredUsers.length === 0 && <div className="text-sm text-gray-500 dark:text-gray-400">No users</div>}
                  </div>
                </motion.div>
              )}
              
              {/* Default fallback for any other tabs */}
              {!['dashboard', 'models', 'all-users', 'bulk-upload', 'health', 'analytics', 'logs', 'backups', 'access-control', 'audit-logs', 'sessions', 'overview', 'downloads', 'engagement', 'maintenance', 'admins', 'creators', 'reports'].includes(activeTab) && (
                <motion.div 
                  key="default"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-center py-20"
                >
                  <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
                </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    This feature is coming soon!
                  </p>
                  <Button onClick={() => setActiveTab('dashboard')}>
                    <Home className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
            </div>
      </div>
    </div>
  )
}

export default AdminDashboard
