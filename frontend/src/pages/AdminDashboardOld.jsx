import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import firebaseHelpers from '../lib/firebase'
import AnalyticsChart from '../components/ui/AnalyticsChart'
import { 
  Users, 
  User,
  File, 
  Download, 
  Eye, 
  Heart, 
  TrendingUp, 
  BarChart3, 
  Shield, 
  AlertTriangle, 
  AlertCircle,
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Ban, 
  UserCheck, 
  Activity, 
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  LineChart,
  DollarSign,
  Target,
  TrendingDown,
  Clock,
  PieChart,
  Globe,
  Zap,
  Plus,
  FileText,
  MessageSquare,
  Tag,
  Package,
  Settings,
  TreePine,
  Lightbulb,
  Palette,
  Crown,
  Code,
  Star,
  StarOff,
  UploadCloud
} from 'lucide-react'
import { Button } from '../components/ui/Button'

const AdminDashboard = () => {
  const { user, profile } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalModels: 0,
    totalDownloads: 0,
    totalViews: 0,
    totalLikes: 0,
    pendingModels: 0,
    reportedModels: 0,
    activeUsers: 0
  })
  const [users, setUsers] = useState([])
  const [models, setModels] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  
  // Reports state
  const [reports, setReports] = useState({
    templates: [
      { id: 'user_summary', name: 'User Summary Report', description: 'Complete user analytics and statistics' },
      { id: 'model_performance', name: 'Model Performance Report', description: 'Model downloads, views, and engagement' },
      { id: 'revenue_report', name: 'Revenue Report', description: 'Financial performance and earnings' },
      { id: 'system_health', name: 'System Health Report', description: 'Server performance and uptime metrics' },
      { id: 'custom', name: 'Custom Report', description: 'Create your own report with selected data' }
    ],
    scheduledReports: [
      { id: 1, name: 'Weekly User Report', template: 'user_summary', frequency: 'weekly', lastRun: '2024-01-15', nextRun: '2024-01-22', status: 'active' },
      { id: 2, name: 'Monthly Revenue Report', template: 'revenue_report', frequency: 'monthly', lastRun: '2024-01-01', nextRun: '2024-02-01', status: 'active' },
      { id: 3, name: 'Daily System Health', template: 'system_health', frequency: 'daily', lastRun: '2024-01-20', nextRun: '2024-01-21', status: 'paused' }
    ],
    reportHistory: [
      { id: 1, name: 'User Summary Report', type: 'user_summary', generatedAt: '2024-01-20 10:30', size: '2.3 MB', format: 'PDF', status: 'completed' },
      { id: 2, name: 'Model Performance Report', type: 'model_performance', generatedAt: '2024-01-19 15:45', size: '1.8 MB', format: 'CSV', status: 'completed' },
      { id: 3, name: 'Revenue Report', type: 'revenue_report', generatedAt: '2024-01-18 09:15', size: '3.1 MB', format: 'PDF', status: 'completed' }
    ]
  })
  const [reportFilters, setReportFilters] = useState({
    dateRange: '30d',
    format: 'pdf',
    template: 'user_summary',
    includeCharts: true,
    includeRawData: false
  })
  const [reportLoading, setReportLoading] = useState(false)
  const [showReportBuilder, setShowReportBuilder] = useState(false)
  
  // Alerts state
  const [alerts, setAlerts] = useState({
    activeAlerts: [
      { id: 1, type: 'user_registration', message: 'New user registered: john_doe', timestamp: '2024-01-20 14:30', severity: 'info', read: false },
      { id: 2, type: 'model_upload', message: 'New model uploaded: "Modern House" by artist_123', timestamp: '2024-01-20 14:25', severity: 'info', read: false },
      { id: 3, type: 'suspicious_activity', message: 'Multiple failed login attempts from IP: 192.168.1.100', timestamp: '2024-01-20 14:20', severity: 'warning', read: false },
      { id: 4, type: 'system_error', message: 'Database connection timeout detected', timestamp: '2024-01-20 14:15', severity: 'error', read: true },
      { id: 5, type: 'revenue_milestone', message: 'Monthly revenue target reached: ₹50,000', timestamp: '2024-01-20 14:10', severity: 'success', read: true }
    ],
    alertRules: [
      { id: 1, name: 'New User Registration', type: 'user_registration', enabled: true, email: true, dashboard: true },
      { id: 2, name: 'Model Upload', type: 'model_upload', enabled: true, email: false, dashboard: true },
      { id: 3, name: 'Suspicious Activity', type: 'suspicious_activity', enabled: true, email: true, dashboard: true },
      { id: 4, name: 'System Errors', type: 'system_error', enabled: true, email: true, dashboard: true },
      { id: 5, name: 'Revenue Milestones', type: 'revenue_milestone', enabled: true, email: true, dashboard: false }
    ],
    alertStats: {
      totalAlerts: 156,
      unreadAlerts: 3,
      alertsToday: 12,
      criticalAlerts: 1
    }
  })
  const [alertFilters, setAlertFilters] = useState({
    type: 'all',
    severity: 'all',
    read: 'all',
    dateRange: '24h'
  })
  const [showAlertSettings, setShowAlertSettings] = useState(false)
  
  // Email Management state
  const [emailManagement, setEmailManagement] = useState({
    campaigns: [
      { id: 1, name: 'Welcome New Users', subject: 'Welcome to 3DShareSpace!', status: 'active', recipients: 1250, sent: 1200, opened: 850, clicked: 320, createdAt: '2024-01-15' },
      { id: 2, name: 'Weekly Newsletter', subject: 'This Week in 3D Design', status: 'scheduled', recipients: 5000, sent: 0, opened: 0, clicked: 0, createdAt: '2024-01-20' },
      { id: 3, name: 'Model Upload Reminder', subject: 'Share Your Latest Creation', status: 'draft', recipients: 0, sent: 0, opened: 0, clicked: 0, createdAt: '2024-01-18' }
    ],
    templates: [
      { id: 1, name: 'Welcome Email', subject: 'Welcome to 3DShareSpace!', type: 'welcome', lastUsed: '2024-01-20' },
      { id: 2, name: 'Newsletter Template', subject: 'Weekly 3D Design News', type: 'newsletter', lastUsed: '2024-01-15' },
      { id: 3, name: 'Promotional Email', subject: 'Special Offer Inside!', type: 'promotional', lastUsed: '2024-01-10' },
      { id: 4, name: 'System Notification', subject: 'Important Update', type: 'system', lastUsed: '2024-01-05' }
    ],
    emailStats: {
      totalSent: 15420,
      totalOpened: 12350,
      totalClicked: 4560,
      openRate: 80.1,
      clickRate: 29.6,
      bounceRate: 2.3
    },
    userSegments: [
      { id: 1, name: 'New Users (30 days)', count: 1250, description: 'Users registered in the last 30 days' },
      { id: 2, name: 'Active Creators', count: 850, description: 'Users who uploaded models in the last 7 days' },
      { id: 3, name: 'Premium Users', count: 320, description: 'Users with premium subscriptions' },
      { id: 4, name: 'Inactive Users', count: 2100, description: 'Users not active in the last 90 days' }
    ]
  })
  const [emailFilters, setEmailFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: '30d'
  })
  const [showEmailComposer, setShowEmailComposer] = useState(false)
  const [showTemplateEditor, setShowTemplateEditor] = useState(false)
  
  // Security Features state
  const [security, setSecurity] = useState({
    ipBlocks: [
      { id: 1, ip: '192.168.1.100', reason: 'Multiple failed login attempts', type: 'blocked', addedAt: '2024-01-20 14:30', addedBy: 'admin' },
      { id: 2, ip: '10.0.0.50', reason: 'Suspicious activity detected', type: 'blocked', addedAt: '2024-01-19 09:15', addedBy: 'system' },
      { id: 3, ip: '203.0.113.0/24', reason: 'Known malicious network', type: 'blocked', addedAt: '2024-01-18 16:45', addedBy: 'admin' }
    ],
    ipWhitelist: [
      { id: 1, ip: '192.168.1.0/24', description: 'Office network', addedAt: '2024-01-15 10:00', addedBy: 'admin' },
      { id: 2, ip: '203.0.113.1', description: 'Admin workstation', addedAt: '2024-01-10 14:20', addedBy: 'admin' }
    ],
    suspiciousActivities: [
      { id: 1, type: 'multiple_failed_logins', ip: '192.168.1.100', user: 'unknown', timestamp: '2024-01-20 14:30', severity: 'high', status: 'investigating' },
      { id: 2, type: 'unusual_download_pattern', ip: '10.0.0.50', user: 'user123', timestamp: '2024-01-20 13:45', severity: 'medium', status: 'resolved' },
      { id: 3, type: 'rapid_api_calls', ip: '203.0.113.5', user: 'unknown', timestamp: '2024-01-20 12:20', severity: 'high', status: 'blocked' },
      { id: 4, type: 'suspicious_upload', ip: '172.16.0.10', user: 'newuser456', timestamp: '2024-01-20 11:15', severity: 'low', status: 'monitoring' }
    ],
    userVerifications: [
      { id: 1, userId: 'user123', username: 'john_doe', email: 'john@example.com', status: 'pending', submittedAt: '2024-01-20 10:30', documents: ['id_front.jpg', 'id_back.jpg'] },
      { id: 2, userId: 'user456', username: 'jane_smith', email: 'jane@example.com', status: 'verified', submittedAt: '2024-01-19 15:20', verifiedAt: '2024-01-19 16:45', documents: ['passport.jpg'] },
      { id: 3, userId: 'user789', username: 'bob_wilson', email: 'bob@example.com', status: 'rejected', submittedAt: '2024-01-18 09:15', rejectedAt: '2024-01-18 14:30', reason: 'Invalid document', documents: ['license.jpg'] }
    ],
    securityRules: [
      { id: 1, name: 'Failed Login Protection', type: 'login_attempts', enabled: true, threshold: 5, action: 'temporary_block', duration: '1h' },
      { id: 2, name: 'API Rate Limiting', type: 'api_calls', enabled: true, threshold: 100, action: 'rate_limit', duration: '15m' },
      { id: 3, name: 'Suspicious Upload Detection', type: 'file_upload', enabled: true, threshold: 10, action: 'flag_for_review', duration: '24h' },
      { id: 4, name: 'Geographic Restrictions', type: 'location', enabled: false, threshold: 0, action: 'block', duration: 'permanent' }
    ],
    securityStats: {
      totalThreats: 156,
      blockedIPs: 23,
      verifiedUsers: 1250,
      pendingVerifications: 15,
      securityScore: 85
    }
  })
  const [securityFilters, setSecurityFilters] = useState({
    type: 'all',
    severity: 'all',
    status: 'all',
    dateRange: '7d'
  })
  const [showIPManager, setShowIPManager] = useState(false)
  const [showVerificationPanel, setShowVerificationPanel] = useState(false)
  
  // Enhanced User Management state
  const [userManagement, setUserManagement] = useState({
    selectedUsers: [],
    bulkActions: {
      suspend: false,
      unsuspend: false,
      delete: false,
      sendEmail: false,
      changeRole: false
    },
    userActivityLogs: [
      { id: 1, userId: 'user123', username: 'john_doe', action: 'login', timestamp: '2024-01-20 14:30', ip: '192.168.1.100', details: 'Successful login' },
      { id: 2, userId: 'user456', username: 'jane_smith', action: 'upload_model', timestamp: '2024-01-20 14:25', ip: '10.0.0.50', details: 'Uploaded model: Modern House' },
      { id: 3, userId: 'user789', username: 'bob_wilson', action: 'download', timestamp: '2024-01-20 14:20', ip: '203.0.113.5', details: 'Downloaded model: Car Design' },
      { id: 4, userId: 'user123', username: 'john_doe', action: 'profile_update', timestamp: '2024-01-20 14:15', ip: '192.168.1.100', details: 'Updated profile information' },
      { id: 5, userId: 'user456', username: 'jane_smith', action: 'comment', timestamp: '2024-01-20 14:10', ip: '10.0.0.50', details: 'Commented on model: Office Building' }
    ],
    userSessions: [
      { id: 1, userId: 'user123', username: 'john_doe', ip: '192.168.1.100', location: 'New York, US', loginTime: '2024-01-20 14:30', lastActivity: '2024-01-20 15:45', status: 'active' },
      { id: 2, userId: 'user456', username: 'jane_smith', ip: '10.0.0.50', location: 'London, UK', loginTime: '2024-01-20 13:45', lastActivity: '2024-01-20 14:20', status: 'idle' },
      { id: 3, userId: 'user789', username: 'bob_wilson', ip: '203.0.113.5', location: 'Tokyo, Japan', loginTime: '2024-01-20 12:30', lastActivity: '2024-01-20 12:35', status: 'offline' }
    ],
    impersonationHistory: [
      { id: 1, adminUser: 'admin', targetUser: 'john_doe', reason: 'Support request', startedAt: '2024-01-19 10:30', endedAt: '2024-01-19 11:15', duration: '45 minutes' },
      { id: 2, adminUser: 'admin', targetUser: 'jane_smith', reason: 'Bug investigation', startedAt: '2024-01-18 14:20', endedAt: '2024-01-18 15:00', duration: '40 minutes' }
    ]
  })
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showImpersonationModal, setShowImpersonationModal] = useState(false)
  const [showActivityLogs, setShowActivityLogs] = useState(false)
  const [selectedUserForImpersonation, setSelectedUserForImpersonation] = useState(null)
  
  // Content Management state
  const [contentManagement, setContentManagement] = useState({
    featuredModels: [
      { id: 1, modelId: 'model123', title: 'Modern House Design', author: 'john_doe', views: 15420, downloads: 1250, featured: true, featuredAt: '2024-01-20 10:30' },
      { id: 2, modelId: 'model456', title: 'Car Model V2', author: 'jane_smith', views: 12100, downloads: 980, featured: true, featuredAt: '2024-01-19 14:20' },
      { id: 3, modelId: 'model789', title: 'Office Building', author: 'bob_wilson', views: 8500, downloads: 650, featured: true, featuredAt: '2024-01-18 16:45' }
    ],
    categories: [
      { id: 1, name: 'Architecture', description: 'Buildings, houses, and structures', modelCount: 145, isActive: true, createdAt: '2024-01-15 10:00' },
      { id: 2, name: 'Vehicles', description: 'Cars, trucks, motorcycles', modelCount: 89, isActive: true, createdAt: '2024-01-14 15:30' },
      { id: 3, name: 'Characters', description: 'People, animals, creatures', modelCount: 67, isActive: true, createdAt: '2024-01-13 09:45' },
      { id: 4, name: 'Electronics', description: 'Gadgets, devices, tech items', modelCount: 34, isActive: false, createdAt: '2024-01-12 11:20' },
      { id: 5, name: 'Furniture', description: 'Chairs, tables, home items', modelCount: 78, isActive: true, createdAt: '2024-01-11 14:15' }
    ],
    bulkOperations: {
      selectedModels: [],
      operations: ['feature', 'unfeature', 'approve', 'reject', 'delete', 'change_category']
    },
    contentStats: {
      totalModels: 413,
      featuredModels: 3,
      pendingApproval: 12,
      totalCategories: 5,
      activeCategories: 4
    }
  })
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showBulkModelActions, setShowBulkModelActions] = useState(false)
  const [showFeaturedManager, setShowFeaturedManager] = useState(false)
  
  // Tag & Category Management state
  const [tagManagement, setTagManagement] = useState({
    tags: [
      { id: 1, name: 'modern', usage: 234, category: 'Architecture', trending: true, createdAt: '2024-01-20 10:30', color: '#3B82F6' },
      { id: 2, name: 'realistic', usage: 189, category: 'General', trending: true, createdAt: '2024-01-19 14:20', color: '#10B981' },
      { id: 3, name: 'low-poly', usage: 156, category: 'Style', trending: false, createdAt: '2024-01-18 16:45', color: '#F59E0B' },
      { id: 4, name: 'textured', usage: 143, category: 'Quality', trending: false, createdAt: '2024-01-17 09:15', color: '#EF4444' },
      { id: 5, name: 'animated', usage: 98, category: 'Type', trending: true, createdAt: '2024-01-16 11:30', color: '#8B5CF6' },
      { id: 6, name: 'game-ready', usage: 87, category: 'Quality', trending: false, createdAt: '2024-01-15 13:45', color: '#06B6D4' }
    ],
    categoryHierarchy: [
      {
        id: 1, name: 'Architecture', parent: null, level: 0, children: [
          { id: 11, name: 'Buildings', parent: 1, level: 1, modelCount: 89 },
          { id: 12, name: 'Houses', parent: 1, level: 1, modelCount: 56 }
        ], modelCount: 145
      },
      {
        id: 2, name: 'Vehicles', parent: null, level: 0, children: [
          { id: 21, name: 'Cars', parent: 2, level: 1, modelCount: 45 },
          { id: 22, name: 'Motorcycles', parent: 2, level: 1, modelCount: 23 },
          { id: 23, name: 'Trucks', parent: 2, level: 1, modelCount: 21 }
        ], modelCount: 89
      },
      {
        id: 3, name: 'Characters', parent: null, level: 0, children: [
          { id: 31, name: 'Humans', parent: 3, level: 1, modelCount: 34 },
          { id: 32, name: 'Animals', parent: 3, level: 1, modelCount: 33 }
        ], modelCount: 67
      }
    ],
    tagAnalytics: {
      totalTags: 6,
      trendingTags: 3,
      mostUsedTag: 'modern',
      recentlyCreated: 2,
      unusedTags: 0
    },
    tagSuggestions: [
      { tag: 'minimalist', confidence: 0.85, category: 'Style' },
      { tag: 'industrial', confidence: 0.78, category: 'Style' },
      { tag: 'vintage', confidence: 0.72, category: 'Style' },
      { tag: 'futuristic', confidence: 0.69, category: 'Style' }
    ]
  })
  const [showTagAnalytics, setShowTagAnalytics] = useState(false)
  const [showCategoryHierarchy, setShowCategoryHierarchy] = useState(false)
  const [showTagSuggestions, setShowTagSuggestions] = useState(false)
  
  // System Settings state
  const [systemSettings, setSystemSettings] = useState({
    siteConfiguration: {
      siteName: '3D Share Space',
      siteDescription: 'Share and discover amazing 3D models',
      maxFileSize: '50MB',
      allowedFormats: ['.obj', '.fbx', '.dae', '.3ds', '.blend'],
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true
    },
    featureToggles: {
      commentsEnabled: true,
      ratingsEnabled: true,
      downloadsEnabled: true,
      uploadEnabled: true,
      searchEnabled: true,
      analyticsEnabled: true,
      adsenseEnabled: true,
      notificationsEnabled: true
    },
    performanceSettings: {
      cacheEnabled: true,
      cdnEnabled: true,
      compressionEnabled: true,
      lazyLoadingEnabled: true,
      imageCacheExpiry: '7d',
      modelCacheExpiry: '30d'
    },
    systemHealth: {
      status: 'healthy',
      uptime: '99.9%',
      lastRestart: '2024-01-15 10:30',
      version: 'v2.1.0',
      environment: 'production'
    }
  })
  const [showMaintenanceSettings, setShowMaintenanceSettings] = useState(false)
  const [showFeatureToggles, setShowFeatureToggles] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  
  // User Management Filters
  const [userFilters, setUserFilters] = useState({
    role: 'all', // all, user, admin, super_admin
    status: 'all', // all, active, inactive, verified, unverified
    dateRange: 'all', // all, today, week, month, year
    search: ''
  })
  
  // Model Management Filters
  const [modelFilters, setModelFilters] = useState({
    category: 'all', // all, architecture, characters, vehicles, etc.
    status: 'all', // all, approved, pending, rejected
    dateRange: 'all', // all, today, week, month, year
    search: ''
  })
  
  // Analytics state
  const [analytics, setAnalytics] = useState({
    userGrowth: [],
    modelUploads: [],
    downloads: [],
    revenue: [],
    topCategories: [],
    topModels: [],
    userActivity: [],
    systemHealth: {
      uptime: '99.9%',
      responseTime: '120ms',
      errorRate: '0.1%',
      activeConnections: 0
    },
    // Advanced Analytics
    revenueAnalytics: {
      totalRevenue: 0,
      monthlyRevenue: 0,
      revenueGrowth: 0,
      topEarners: [],
      revenueByCategory: []
    },
    userEngagement: {
      averageSessionDuration: 0,
      pageViews: 0,
      bounceRate: 0,
      returningUsers: 0,
      newUsers: 0
    },
    modelPerformance: {
      totalDownloads: 0,
      averageDownloadsPerModel: 0,
      topPerformingModels: [],
      categoryPerformance: [],
      downloadTrends: []
    },
    geographicData: {
      topCountries: [],
      userDistribution: [],
      regionalGrowth: []
    },
    realTimeActivity: [],
    kpis: {
      conversionRate: 0,
      userRetention: 0,
      modelApprovalRate: 0,
      averageRevenuePerUser: 0
    }
  })
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('7d') // 7d, 30d, 90d, 1y
  const [analyticsView, setAnalyticsView] = useState('overview') // overview, revenue, engagement, performance

  // Report generation functions
  const generateReport = async (template, format = 'pdf') => {
    setReportLoading(true)
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create report data based on template
      let reportData = {}
      switch (template) {
        case 'user_summary':
          reportData = {
            totalUsers: users.length,
            newUsers: users.filter(u => {
              const userDate = new Date(u.createdAt)
              const thirtyDaysAgo = new Date()
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
              return userDate > thirtyDaysAgo
            }).length,
            activeUsers: users.filter(u => {
              const lastActive = new Date(u.updatedAt || u.createdAt)
              const sevenDaysAgo = new Date()
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
              return lastActive > sevenDaysAgo
            }).length,
            userGrowth: analytics.userGrowth,
            topCountries: analytics.geographicData?.topCountries || []
          }
          break
        case 'model_performance':
          reportData = {
            totalModels: models.length,
            totalDownloads: models.reduce((sum, model) => sum + (model.downloads || 0), 0),
            averageDownloads: models.length > 0 ? Math.round(models.reduce((sum, model) => sum + (model.downloads || 0), 0) / models.length) : 0,
            topModels: analytics.topModels,
            categoryPerformance: analytics.topCategories
          }
          break
        case 'revenue_report':
          reportData = {
            totalRevenue: analytics.revenueAnalytics?.totalRevenue || 0,
            monthlyRevenue: analytics.revenueAnalytics?.monthlyRevenue || 0,
            revenueGrowth: analytics.revenueAnalytics?.revenueGrowth || 0,
            topEarners: analytics.revenueAnalytics?.topEarners || [],
            revenueByCategory: analytics.revenueAnalytics?.revenueByCategory || []
          }
          break
        case 'system_health':
          reportData = {
            uptime: analytics.systemHealth?.uptime || '99.9%',
            responseTime: analytics.systemHealth?.responseTime || '120ms',
            errorRate: analytics.systemHealth?.errorRate || '0.1%',
            activeConnections: analytics.systemHealth?.activeConnections || 0,
            systemMetrics: {
              cpu: Math.floor(Math.random() * 20 + 30),
              memory: Math.floor(Math.random() * 15 + 45),
              disk: Math.floor(Math.random() * 10 + 60)
            }
          }
          break
      }
      
      // Generate file based on format
      if (format === 'csv') {
        generateCSVReport(reportData, template)
      } else {
        generatePDFReport(reportData, template)
      }
      
      // Add to report history
      const newReport = {
        id: Date.now(),
        name: reports.templates.find(t => t.id === template)?.name || 'Custom Report',
        type: template,
        generatedAt: new Date().toLocaleString(),
        size: `${(Math.random() * 3 + 1).toFixed(1)} MB`,
        format: format.toUpperCase(),
        status: 'completed'
      }
      
      setReports(prev => ({
        ...prev,
        reportHistory: [newReport, ...prev.reportHistory]
      }))
      
      console.log('✅ Report generated successfully:', newReport)
      
    } catch (error) {
      console.error('❌ Error generating report:', error)
    } finally {
      setReportLoading(false)
    }
  }
  
  const generateCSVReport = (data, template) => {
    let csvContent = ''
    
    switch (template) {
      case 'user_summary':
        csvContent = 'Metric,Value\n'
        csvContent += `Total Users,${data.totalUsers}\n`
        csvContent += `New Users (30d),${data.newUsers}\n`
        csvContent += `Active Users (7d),${data.activeUsers}\n`
        break
      case 'model_performance':
        csvContent = 'Metric,Value\n'
        csvContent += `Total Models,${data.totalModels}\n`
        csvContent += `Total Downloads,${data.totalDownloads}\n`
        csvContent += `Average Downloads,${data.averageDownloads}\n`
        break
      case 'revenue_report':
        csvContent = 'Metric,Value\n'
        csvContent += `Total Revenue,${data.totalRevenue}\n`
        csvContent += `Monthly Revenue,${data.monthlyRevenue}\n`
        csvContent += `Revenue Growth,${data.revenueGrowth}%\n`
        break
    }
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template}_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }
  
  const generatePDFReport = (data, template) => {
    // For now, we'll create a simple text-based report
    // In a real implementation, you'd use a PDF library like jsPDF
    let reportContent = `\n=== ${reports.templates.find(t => t.id === template)?.name || 'Report'} ===\n`
    reportContent += `Generated: ${new Date().toLocaleString()}\n\n`
    
    switch (template) {
      case 'user_summary':
        reportContent += `Total Users: ${data.totalUsers}\n`
        reportContent += `New Users (30 days): ${data.newUsers}\n`
        reportContent += `Active Users (7 days): ${data.activeUsers}\n\n`
        reportContent += `User Growth Trend:\n`
        data.userGrowth?.forEach(item => {
          reportContent += `${item.date}: ${item.value} users\n`
        })
        break
      case 'model_performance':
        reportContent += `Total Models: ${data.totalModels}\n`
        reportContent += `Total Downloads: ${data.totalDownloads}\n`
        reportContent += `Average Downloads per Model: ${data.averageDownloads}\n\n`
        reportContent += `Top Performing Models:\n`
        data.topModels?.slice(0, 5).forEach((model, index) => {
          reportContent += `${index + 1}. ${model.title}: ${model.downloads} downloads\n`
        })
        break
      case 'revenue_report':
        reportContent += `Total Revenue: ₹${data.totalRevenue}\n`
        reportContent += `Monthly Revenue: ₹${data.monthlyRevenue}\n`
        reportContent += `Revenue Growth: ${data.revenueGrowth}%\n\n`
        reportContent += `Top Earners:\n`
        data.topEarners?.forEach((earner, index) => {
          reportContent += `${index + 1}. ${earner.username}: ₹${earner.revenue}\n`
        })
        break
      case 'system_health':
        reportContent += `System Uptime: ${data.uptime}\n`
        reportContent += `Response Time: ${data.responseTime}\n`
        reportContent += `Error Rate: ${data.errorRate}\n`
        reportContent += `Active Connections: ${data.activeConnections}\n\n`
        reportContent += `System Resources:\n`
        reportContent += `CPU Usage: ${data.systemMetrics?.cpu}%\n`
        reportContent += `Memory Usage: ${data.systemMetrics?.memory}%\n`
        reportContent += `Disk Usage: ${data.systemMetrics?.disk}%\n`
        break
    }
    
    // Download as text file (simulating PDF)
    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${template}_report_${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Enhanced User Management Handlers
  const handleSuspendUser = async (userId, shouldSuspend) => {
    try {
      // Handle user suspension logic here
      console.log(`${shouldSuspend ? 'Suspending' : 'Unsuspending'} user:`, userId)
      // Update user status in state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status: shouldSuspend ? 'suspended' : 'active' } : u
      ))
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return
      
      try {
        // Use Firebase admin check instead of hardcoded emails
        const adminCheck = await firebaseHelpers.checkAdminStatus(user.uid)
        setIsAdmin(adminCheck.isAdmin)
      } catch (err) {
        console.error('Error checking admin status:', err)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user])

  // Fetch admin data
  useEffect(() => {
    if (!isAdmin) return

    const fetchAdminData = async () => {
      try {
        setLoading(true)
        
        // Fetch all users
        const usersResult = await firebaseHelpers.getAllUsers()
        if (usersResult.success) {
          setUsers(usersResult.users)
        }
        
        // Fetch all models
        const modelsResult = await firebaseHelpers.getModels({})
        if (modelsResult.success) {
          setModels(modelsResult.models)
        }

        // Calculate statistics
        const totalUsers = usersResult.success ? usersResult.users.length : 0
        const totalModels = modelsResult.success ? modelsResult.models.length : 0
        const totalDownloads = modelsResult.success 
          ? modelsResult.models.reduce((sum, model) => sum + (model.downloads || 0), 0) 
          : 0
        const totalViews = modelsResult.success 
          ? modelsResult.models.reduce((sum, model) => sum + (model.views || 0), 0) 
          : 0
        const totalLikes = modelsResult.success 
          ? modelsResult.models.reduce((sum, model) => sum + (model.likes || 0), 0) 
          : 0
        const pendingModels = modelsResult.success 
          ? modelsResult.models.filter(model => !model.isApproved).length 
          : 0
        const activeUsers = usersResult.success 
          ? usersResult.users.filter(user => {
              const lastActive = new Date(user.updatedAt || user.createdAt)
              const thirtyDaysAgo = new Date()
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
              return lastActive > thirtyDaysAgo
            }).length 
          : 0

        setStats({
          totalUsers,
          totalModels,
          totalDownloads,
          totalViews,
          totalLikes,
          pendingModels,
          reportedModels: 0,
          activeUsers
        })

      } catch (err) {
        console.error('Error fetching admin data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [isAdmin])

  // Fetch alerts data
  useEffect(() => {
    if (!isAdmin || activeTab !== 'alerts') return

    const fetchAlertsData = async () => {
      try {
        const result = await firebaseHelpers.getAlerts()
        if (result.success) {
          setAlerts({
            activeAlerts: result.data.activeAlerts || [],
            alertRules: result.data.alertRules || [],
            alertStats: result.data.alertStats || { total: 0, unread: 0, critical: 0, warning: 0 }
          })
        }
      } catch (error) {
        console.error('Error fetching alerts data:', error)
      }
    }

    fetchAlertsData()
  }, [isAdmin, activeTab])

  // Fetch email management data
  useEffect(() => {
    if (!isAdmin || activeTab !== 'email') return

    const fetchEmailData = async () => {
      try {
        const result = await firebaseHelpers.getEmailManagement()
        if (result.success) {
          setEmailManagement({
            campaigns: result.data.campaigns || [],
            templates: result.data.templates || [],
            emailStats: result.data.emailStats || { totalCampaigns: 0, activeCampaigns: 0, totalRecipients: 0, totalSent: 0 },
            userSegments: [
              { id: 1, name: 'New Users', criteria: 'registered_last_7_days', count: 45 },
              { id: 2, name: 'Active Users', criteria: 'active_last_30_days', count: 234 },
              { id: 3, name: 'Premium Users', criteria: 'has_premium_subscription', count: 12 },
              { id: 4, name: 'Inactive Users', criteria: 'inactive_90_days', count: 89 }
            ]
          })
        }
      } catch (error) {
        console.error('Error fetching email management data:', error)
      }
    }

    fetchEmailData()
  }, [isAdmin, activeTab])

  // Fetch security data
  useEffect(() => {
    if (!isAdmin || activeTab !== 'security') return

    const fetchSecurityData = async () => {
      try {
        const result = await firebaseHelpers.getSecurityData()
        if (result.success) {
          setSecurity({
            ipBlocks: result.data.ipBlocks || [],
            ipWhitelist: result.data.ipWhitelist || [],
            suspiciousActivities: result.data.suspiciousActivities || [],
            userVerifications: result.data.userVerifications || [],
            securityRules: result.data.securityRules || [
              { id: 1, name: 'Failed Login Attempts', description: 'Block IP after 5 failed login attempts', enabled: true, threshold: 5 },
              { id: 2, name: 'Suspicious Uploads', description: 'Flag models with suspicious file types', enabled: true, threshold: 1 },
              { id: 3, name: 'Rate Limiting', description: 'Limit API requests per IP', enabled: true, threshold: 100 },
              { id: 4, name: 'User Verification', description: 'Require email verification for new users', enabled: true, threshold: 1 }
            ],
            securityStats: result.data.securityStats || { totalThreats: 0, blockedIPs: 0, verifiedUsers: 0, pendingVerifications: 0, securityScore: 100 }
          })
        }
      } catch (error) {
        console.error('Error fetching security data:', error)
      }
    }

    fetchSecurityData()
  }, [isAdmin, activeTab])

  // Fetch analytics data
  useEffect(() => {
    if (!isAdmin || activeTab !== 'analytics') return

    const fetchAnalyticsData = async () => {
      try {
        setAnalyticsLoading(true)
        
        // Calculate real analytics from existing data
        console.log('📊 Calculating real analytics from existing data...')
        
        // Calculate date range
        const endDate = new Date()
        const startDate = new Date()
        
        switch (timeRange) {
          case '7d':
            startDate.setDate(endDate.getDate() - 7)
            break
          case '30d':
            startDate.setDate(endDate.getDate() - 30)
            break
          case '90d':
            startDate.setDate(endDate.getDate() - 90)
            break
          case '1y':
            startDate.setFullYear(endDate.getFullYear() - 1)
            break
          default:
            startDate.setDate(endDate.getDate() - 30)
        }

        // Generate time series data from real data
        const userGrowth = []
        const modelUploads = []
        const downloads = []
        const revenue = []

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0]
          
          // Count users created on this date
          const usersOnDate = users.filter(user => {
            const createdAt = user.createdAt
            if (!createdAt) return false
            const userDate = new Date(createdAt)
            return userDate.toISOString().split('T')[0] === dateStr
          }).length

          // Count models uploaded on this date
          const modelsOnDate = models.filter(model => {
            const createdAt = model.createdAt
            if (!createdAt) return false
            const modelDate = new Date(createdAt)
            return modelDate.toISOString().split('T')[0] === dateStr
          }).length

          // Count downloads on this date (simplified - using model downloads)
          const downloadsOnDate = modelsOnDate * Math.floor(Math.random() * 5 + 1) // Simulate downloads per model

          // Calculate revenue on this date (simplified)
          const revenueOnDate = downloadsOnDate * 0.1 // Simulate revenue per download

          userGrowth.push({ date: dateStr, value: usersOnDate })
          modelUploads.push({ date: dateStr, value: modelsOnDate })
          downloads.push({ date: dateStr, value: downloadsOnDate })
          revenue.push({ date: dateStr, value: revenueOnDate })
        }

        // Calculate top categories from real model data
        const categoryCount = {}
        models.forEach(model => {
          const category = model.category || 'Other'
          categoryCount[category] = (categoryCount[category] || 0) + 1
        })

        const totalModels = models.length
        const topCategories = Object.entries(categoryCount)
          .map(([name, count]) => ({
            name,
            count,
            percentage: totalModels > 0 ? Math.round((count / totalModels) * 100) : 0
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6)

        // Calculate top models from real data
        const topModels = models
          .map(model => ({
            id: model.id,
            title: model.title,
            downloads: model.downloads || 0,
            views: model.views || 0,
            likes: model.likes || 0
          }))
          .sort((a, b) => b.downloads - a.downloads)
          .slice(0, 10)

        // Calculate user activity (last 24 hours)
        const userActivity = []
        const now = new Date()
        for (let i = 23; i >= 0; i--) {
          const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
          const hourStr = hour.toISOString().split('T')[1].split(':')[0]
          
          // Count active users in this hour (simplified)
          const activeUsers = Math.floor(Math.random() * 10 + 5)
          userActivity.push({ hour: hourStr, value: activeUsers })
        }

        // Calculate advanced analytics
        const totalDownloads = models.reduce((sum, model) => sum + (model.downloads || 0), 0)
        const totalRevenue = models.reduce((sum, model) => sum + (model.downloads || 0) * 0.1, 0)
        const activeUsers = users.filter(user => {
          const lastActive = new Date(user.updatedAt || user.createdAt)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return lastActive > thirtyDaysAgo
        }).length

        // Revenue Analytics
        const revenueAnalytics = {
          totalRevenue: totalRevenue,
          monthlyRevenue: totalRevenue * 0.3, // Simulate monthly revenue
          revenueGrowth: 15.2, // Simulate growth percentage
          topEarners: users.slice(0, 5).map(user => ({
            id: user.id,
            username: user.username || user.displayName,
            revenue: Math.floor(Math.random() * 1000 + 100),
            models: models.filter(m => m.userId === user.id).length
          })),
          revenueByCategory: topCategories.map(cat => ({
            category: cat.name,
            revenue: cat.count * 2.5,
            percentage: cat.percentage
          }))
        }

        // User Engagement Analytics
        const userEngagement = {
          averageSessionDuration: Math.floor(Math.random() * 300 + 120), // 2-7 minutes
          pageViews: Math.floor(Math.random() * 10000 + 5000),
          bounceRate: Math.floor(Math.random() * 20 + 30), // 30-50%
          returningUsers: Math.floor(activeUsers * 0.7),
          newUsers: users.length - Math.floor(activeUsers * 0.7)
        }

        // Model Performance Analytics
        const modelPerformance = {
          totalDownloads: totalDownloads,
          averageDownloadsPerModel: models.length > 0 ? Math.round(totalDownloads / models.length) : 0,
          topPerformingModels: topModels.slice(0, 5),
          categoryPerformance: topCategories.map(cat => ({
            category: cat.name,
            downloads: cat.count * 15,
            models: cat.count,
            averageDownloads: 15
          })),
          downloadTrends: downloads
        }

        // Geographic Data (simulated)
        const geographicData = {
          topCountries: [
            { country: 'India', users: Math.floor(users.length * 0.45), percentage: 45 },
            { country: 'United States', users: Math.floor(users.length * 0.18), percentage: 18 },
            { country: 'United Kingdom', users: Math.floor(users.length * 0.15), percentage: 15 },
            { country: 'Canada', users: Math.floor(users.length * 0.10), percentage: 10 },
            { country: 'Germany', users: Math.floor(users.length * 0.08), percentage: 8 },
            { country: 'Others', users: Math.floor(users.length * 0.07), percentage: 7 }
          ],
          userDistribution: [
            { region: 'South Asia', users: Math.floor(users.length * 0.52) },
            { region: 'North America', users: Math.floor(users.length * 0.22) },
            { region: 'Asia', users: Math.floor(users.length * 0.20) },
            { region: 'Others', users: Math.floor(users.length * 0.10) }
          ],
          regionalGrowth: [
            { region: 'South Asia', growth: 18.7 },
            { region: 'North America', growth: 9.2 },
            { region: 'Asia', growth: 18.7 },
            { region: 'Others', growth: 5.2 }
          ]
        }

        // Real-time Activity (simulated)
        const realTimeActivity = [
          { id: 1, type: 'user_registration', message: 'New user registered', time: '2 minutes ago', user: 'john_doe' },
          { id: 2, type: 'model_upload', message: 'New model uploaded', time: '5 minutes ago', user: 'artist_123' },
          { id: 3, type: 'download', message: 'Model downloaded', time: '8 minutes ago', user: 'designer_456' },
          { id: 4, type: 'tip', message: 'Tip received', time: '12 minutes ago', user: 'creator_789' },
          { id: 5, type: 'comment', message: 'New comment posted', time: '15 minutes ago', user: 'reviewer_101' }
        ]

        // KPIs
        const kpis = {
          conversionRate: 3.2, // Percentage of visitors who register
          userRetention: 68.5, // Percentage of users who return
          modelApprovalRate: 92.3, // Percentage of models approved
          averageRevenuePerUser: totalRevenue / users.length || 0
        }

        const realAnalytics = {
          userGrowth,
          modelUploads,
          downloads,
          revenue,
          topCategories,
          topModels,
          userActivity,
          systemHealth: {
            uptime: '99.9%',
            responseTime: `${Math.floor(Math.random() * 50 + 100)}ms`,
            errorRate: `${(Math.random() * 0.5).toFixed(1)}%`,
            activeConnections: Math.floor(Math.random() * 500 + 100)
          },
          summary: {
            totalUsers: users.length,
            totalModels: models.length,
            totalDownloads: totalDownloads,
            totalRevenue: totalRevenue,
            activeUsers: activeUsers
          },
          // Advanced Analytics
          revenueAnalytics,
          userEngagement,
          modelPerformance,
          geographicData,
          realTimeActivity,
          kpis
        }
        
        setAnalytics(realAnalytics)
        console.log('✅ Real analytics calculated:', realAnalytics.summary)
        
      } catch (err) {
        console.error('Error calculating analytics data:', err)
      } finally {
        setAnalyticsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [isAdmin, activeTab, timeRange, models, users])

  // Helper function to generate mock time series data
  const generateTimeSeriesData = (days, min, max) => {
    const data = []
    const today = new Date()
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * (max - min) + min)
      })
    }
    
    return data
  }

  // Filter users based on current filters
  const getFilteredUsers = () => {
    let filtered = [...users]

    // Role filter
    if (userFilters.role !== 'all') {
      filtered = filtered.filter(user => user.role === userFilters.role)
    }

    // Status filter
    if (userFilters.status !== 'all') {
      switch (userFilters.status) {
        case 'active':
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          filtered = filtered.filter(user => {
            const lastActive = new Date(user.updatedAt || user.createdAt)
            return lastActive > thirtyDaysAgo
          })
          break
        case 'inactive':
          const thirtyDaysAgoInactive = new Date()
          thirtyDaysAgoInactive.setDate(thirtyDaysAgoInactive.getDate() - 30)
          filtered = filtered.filter(user => {
            const lastActive = new Date(user.updatedAt || user.createdAt)
            return lastActive <= thirtyDaysAgoInactive
          })
          break
        case 'verified':
          filtered = filtered.filter(user => user.isVerified === true)
          break
        case 'unverified':
          filtered = filtered.filter(user => user.isVerified !== true)
          break
      }
    }

    // Date range filter
    if (userFilters.dateRange !== 'all') {
      const now = new Date()
      let startDate = new Date()
      
      switch (userFilters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(user => {
        const userDate = new Date(user.createdAt)
        return userDate >= startDate
      })
    }

    // Search filter
    if (userFilters.search) {
      const searchLower = userFilters.search.toLowerCase()
      filtered = filtered.filter(user => 
        user.username?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.displayName?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }

  // Filter models based on current filters
  const getFilteredModels = () => {
    let filtered = [...models]

    // Category filter
    if (modelFilters.category !== 'all') {
      filtered = filtered.filter(model => model.category === modelFilters.category)
    }

    // Status filter
    if (modelFilters.status !== 'all') {
      switch (modelFilters.status) {
        case 'approved':
          filtered = filtered.filter(model => model.isApproved === true)
          break
        case 'pending':
          filtered = filtered.filter(model => model.isApproved !== true && !model.isRejected)
          break
        case 'rejected':
          filtered = filtered.filter(model => model.isRejected === true)
          break
      }
    }

    // Date range filter
    if (modelFilters.dateRange !== 'all') {
      const now = new Date()
      let startDate = new Date()
      
      switch (modelFilters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(model => {
        const modelDate = new Date(model.createdAt)
        return modelDate >= startDate
      })
    }

    // Search filter
    if (modelFilters.search) {
      const searchLower = modelFilters.search.toLowerCase()
      filtered = filtered.filter(model => 
        model.title?.toLowerCase().includes(searchLower) ||
        model.description?.toLowerCase().includes(searchLower) ||
        model.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    return filtered
  }

  // Access denied for non-admins
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You don't have permission to access the admin dashboard
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></Loader2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  // Admin actions
  const handleApproveModel = async (modelId) => {
    try {
      const result = await firebaseHelpers.updateModel(modelId, { isApproved: true })
      if (result.success) {
        // Update local state
        setModels(prev => prev.map(model => 
          model.id === modelId ? { ...model, isApproved: true } : model
        ))
        // Update stats
        setStats(prev => ({ ...prev, pendingModels: Math.max(0, prev.pendingModels - 1) }))
      } else {
        console.error('Failed to approve model:', result.error)
      }
    } catch (err) {
      console.error('Error approving model:', err)
    }
  }

  const handleRejectModel = async (modelId) => {
    try {
      const result = await firebaseHelpers.updateModel(modelId, { isApproved: false })
      if (result.success) {
        // Update local state
        setModels(prev => prev.map(model => 
          model.id === modelId ? { ...model, isApproved: false } : model
        ))
        // Update stats
        setStats(prev => ({ ...prev, pendingModels: prev.pendingModels + 1 }))
      } else {
        console.error('Failed to reject model:', result.error)
      }
    } catch (err) {
      console.error('Error rejecting model:', err)
    }
  }

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const result = await firebaseHelpers.updateUserRole(userId, newRole)
      if (result.success) {
        // Update local state
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        ))
        console.log(`User ${userId} role updated to ${newRole}`)
      } else {
        console.error('Failed to update user role:', result.error)
      }
    } catch (err) {
      console.error('Error updating user role:', err)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }
    
    try {
      const result = await firebaseHelpers.deleteUser(userId)
      if (result.success) {
        // Remove user from local state
        setUsers(prev => prev.filter(user => user.id !== userId))
        // Update stats
        setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }))
        console.log(`User ${userId} deleted successfully`)
      } else {
        console.error('Failed to delete user:', result.error)
      }
    } catch (err) {
      console.error('Error deleting user:', err)
    }
  }

  return (
    <div className="min-h-screen bg-luxury-bg-primary dark:bg-gray-900">
      {/* Header */}
      <div className="bg-luxury-bg-card dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Manage your 3DShareSpace platform
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Shield className="h-4 w-4" />
                <span>Admin Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow">
          <nav className="flex space-x-8 px-6 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'analytics', label: 'Analytics', icon: LineChart },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
              { id: 'email', label: 'Email', icon: MessageSquare },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'models', label: 'Models', icon: File },
              { id: 'bulk-upload', label: 'Bulk Upload', icon: UploadCloud },
              { id: 'revenue', label: 'Revenue', icon: DollarSign },
              { id: 'content', label: 'Content', icon: Package },
              { id: 'tags', label: 'Tags', icon: Tag },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'moderation', label: 'Moderation', icon: Shield }
            ].map(tab => {
              const Icon = tab.icon
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variant="ghost"
                  className={`py-4 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-4 w-4 inline mr-2" />
                  {tab.label}
                </Button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Bulk Upload Highlight */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2 flex items-center">
                    <UploadCloud className="h-6 w-6 mr-2" />
                    Bulk Upload Models
                  </h3>
                  <p className="text-blue-100 mb-4">
                    Upload multiple 3D models efficiently. All revenue goes to the platform.
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      onClick={() => window.open('/admin/bulk-upload', '_blank')}
                      className="bg-white text-blue-600 hover:bg-blue-50"
                    >
                      <UploadCloud className="h-4 w-4 mr-2" />
                      Open Bulk Upload
                    </Button>
                    <Button
                      onClick={() => setActiveTab('bulk-upload')}
                      variant="outline"
                      className="border-white text-white hover:bg-white hover:text-blue-600"
                    >
                      View Tab
                    </Button>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-2xl font-bold">{models.filter(m => m.isPlatformModel).length}</div>
                    <div className="text-sm text-blue-100">Platform Models</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <File className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Models</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalModels}</p>
                  </div>
                </div>
              </div>

              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Download className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Downloads</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalDownloads}</p>
                  </div>
                </div>
              </div>

              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Eye className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Views</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalViews}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Content Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Pending Models</span>
                    <span className="font-medium text-orange-600 dark:text-orange-400">{stats.pendingModels}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Reported Content</span>
                    <span className="font-medium text-red-600 dark:text-red-400">{stats.reportedModels}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                    <span className="font-medium text-green-600 dark:text-green-400">{stats.activeUsers}</span>
                  </div>
                </div>
              </div>

              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Engagement</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Likes</span>
                    <span className="font-medium text-red-600 dark:text-red-400">{stats.totalLikes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg Downloads/Model</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {stats.totalModels > 0 ? Math.round(stats.totalDownloads / stats.totalModels) : 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg Views/Model</span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      {stats.totalModels > 0 ? Math.round(stats.totalViews / stats.totalModels) : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    onClick={() => setActiveTab('moderation')}
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Review Pending Models
                  </Button>
                  <Button
                    onClick={() => setActiveTab('users')}
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    Manage Users
                  </Button>
                  <Button
                    onClick={() => setActiveTab('models')}
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    Browse All Models
                  </Button>
                  <Button
                    onClick={() => window.open('/admin/bulk-upload', '_blank')}
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                  >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Bulk Upload Models
                  </Button>
                  <Button
                    onClick={() => setActiveTab('bulk-upload')}
                    variant="ghost"
                    className="w-full justify-start px-3 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                  >
                    <UploadCloud className="h-4 w-4 mr-2" />
                    Bulk Upload Tab
                  </Button>
                  <a
                    href="/admin/cleanup"
                    className="w-full text-left px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded"
                  >
                    🗑️ Data Cleanup Tools
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Analytics Header */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Analytics Dashboard</h2>
                    <p className="text-gray-600 dark:text-gray-400">Comprehensive insights and performance metrics</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="90d">Last 90 days</option>
                      <option value="1y">Last year</option>
                    </select>
                    <Button onClick={() => window.location.reload()} className="px-4 py-2">
                      <RefreshCw className="h-4 w-4 inline mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
                
                {/* Analytics View Navigation */}
                <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <Button
                    onClick={() => setAnalyticsView('overview')}
                    variant={analyticsView === 'overview' ? 'secondary' : 'ghost'}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${analyticsView === 'overview' ? 'shadow-sm' : ''}`}
                  >
                    Overview
                  </Button>
                  <Button
                    onClick={() => setAnalyticsView('revenue')}
                    variant={analyticsView === 'revenue' ? 'secondary' : 'ghost'}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${analyticsView === 'revenue' ? 'shadow-sm' : ''}`}
                  >
                    Revenue
                  </Button>
                  <Button
                    onClick={() => setAnalyticsView('engagement')}
                    variant={analyticsView === 'engagement' ? 'secondary' : 'ghost'}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${analyticsView === 'engagement' ? 'shadow-sm' : ''}`}
                  >
                    Engagement
                  </Button>
                  <Button
                    onClick={() => setAnalyticsView('performance')}
                    variant={analyticsView === 'performance' ? 'secondary' : 'ghost'}
                    className={`px-4 py-2 rounded-md text-sm font-medium ${analyticsView === 'performance' ? 'shadow-sm' : ''}`}
                  >
                    Performance
                  </Button>
                </div>
              </div>
            </div>

            {/* Advanced Analytics Views */}
            {analyticsView === 'overview' && (
              <>
                {/* Analytics Summary Cards */}
                {analytics.summary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.summary.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <File className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Models</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.summary.totalModels}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Download className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Downloads</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.summary.totalDownloads}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                      <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{analytics.summary.totalRevenue}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.summary.activeUsers}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* System Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Uptime</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.systemHealth.uptime}</p>
                  </div>
                </div>
              </div>

              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Response Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.systemHealth.responseTime}</p>
                  </div>
                </div>
              </div>

              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Error Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.systemHealth.errorRate}</p>
                  </div>
                </div>
              </div>

              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Connections</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.systemHealth.activeConnections}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Growth Chart */}
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Growth</h3>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div className="h-64 p-4">
                  <AnalyticsChart 
                    data={analytics.userGrowth}
                    type="line"
                    title="New Users"
                    color="#10b981"
                    height={200}
                  />
                  <div className="text-center mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total: {analytics.userGrowth.reduce((sum, day) => sum + day.value, 0)} new users
                    </p>
                  </div>
                </div>
              </div>

              {/* Model Uploads Chart */}
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Model Uploads</h3>
                  <File className="h-5 w-5 text-blue-500" />
                </div>
                <div className="h-64 p-4">
                  <AnalyticsChart 
                    data={analytics.modelUploads}
                    type="bar"
                    title="Model Uploads"
                    color="#3b82f6"
                    height={200}
                  />
                  <div className="text-center mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total: {analytics.modelUploads.reduce((sum, day) => sum + day.value, 0)} uploads
                    </p>
                  </div>
                </div>
              </div>

              {/* Downloads Chart */}
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Downloads</h3>
                  <Download className="h-5 w-5 text-purple-500" />
                </div>
                <div className="h-64 p-4">
                  <AnalyticsChart 
                    data={analytics.downloads}
                    type="line"
                    title="Downloads"
                    color="#8b5cf6"
                    height={200}
                  />
                  <div className="text-center mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Total: {analytics.downloads.reduce((sum, day) => sum + day.value, 0)} downloads
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Categories */}
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Categories</h3>
                  <PieChart className="h-5 w-5 text-orange-500" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pie Chart */}
                  <div className="h-64">
                    <AnalyticsChart 
                      data={analytics.topCategories}
                      type="pie"
                      title="Categories"
                      height={200}
                    />
                  </div>
                  
                  {/* Category List */}
                  <div className="space-y-3">
                    {analytics.topCategories.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-3" style={{backgroundColor: `hsl(${index * 60}, 70%, 50%)`}}></div>
                          <span className="text-sm text-gray-900 dark:text-white">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{category.count}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">({category.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Top Models Table */}
            <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Top Performing Models</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Downloads</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Likes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {analytics.topModels.map((model) => (
                      <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {model.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {model.downloads}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {model.views}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {model.likes}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              </>
            )}

            {/* Revenue Analytics View */}
            {analyticsView === 'revenue' && (
              <div className="space-y-6">
                {/* Revenue KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{analytics.revenueAnalytics?.totalRevenue || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Revenue</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{analytics.revenueAnalytics?.monthlyRevenue || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue Growth</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">+{analytics.revenueAnalytics?.revenueGrowth || 0}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ARPU</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{analytics.kpis?.averageRevenuePerUser?.toFixed(2) || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Revenue Trends</h3>
                  <div className="h-64">
                    <AnalyticsChart 
                      data={analytics.revenue}
                      type="line"
                      title="Revenue"
                      color="#10b981"
                      height={200}
                    />
                  </div>
                </div>

                {/* Top Earners */}
                <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Earners</h3>
                  <div className="space-y-3">
                    {analytics.revenueAnalytics?.topEarners?.map((earner, index) => (
                      <div key={earner.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{earner.username}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{earner.models} models</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">₹{earner.revenue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Engagement Analytics View */}
            {analyticsView === 'engagement' && (
              <div className="space-y-6">
                {/* Engagement KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Session</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.userEngagement?.averageSessionDuration || 0}s</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Page Views</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{(analytics.userEngagement?.pageViews || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                        <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bounce Rate</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.userEngagement?.bounceRate || 0}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Returning Users</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.userEngagement?.returningUsers || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Activity Chart */}
                <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Activity (24h)</h3>
                  <div className="h-64">
                    <AnalyticsChart 
                      data={analytics.userActivity}
                      type="bar"
                      title="Active Users"
                      color="#3b82f6"
                      height={200}
                    />
                  </div>
                </div>

                {/* Real-time Activity Feed */}
                <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Real-time Activity</h3>
                  <div className="space-y-3">
                    {analytics.realTimeActivity?.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">by {activity.user}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Analytics View */}
            {analyticsView === 'performance' && (
              <div className="space-y-6">
                {/* Performance KPIs */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <Download className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Downloads</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{(analytics.modelPerformance?.totalDownloads || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Downloads/Model</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.modelPerformance?.averageDownloadsPerModel || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                        <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Conversion Rate</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.kpis?.conversionRate || 0}%</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                        <CheckCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Approval Rate</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.kpis?.modelApprovalRate || 0}%</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Downloads Chart */}
                <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Download Trends</h3>
                  <div className="h-64">
                    <AnalyticsChart 
                      data={analytics.downloads}
                      type="line"
                      title="Downloads"
                      color="#8b5cf6"
                      height={200}
                    />
                  </div>
                </div>

                {/* Geographic Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Countries</h3>
                    <div className="space-y-3">
                      {analytics.geographicData?.topCountries?.map((country, index) => (
                        <div key={country.country} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mr-3">
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{country.country}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{country.users}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{country.percentage}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Regional Growth</h3>
                    <div className="space-y-3">
                      {analytics.geographicData?.regionalGrowth?.map((region) => (
                        <div key={region.region} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{region.region}</span>
                          <div className="flex items-center">
                            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">+{region.growth}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Reports Header */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Reports</h2>
                  <p className="text-gray-600 dark:text-gray-400">Generate and schedule comprehensive reports</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button onClick={() => setShowReportBuilder(true)} className="px-4 py-2">
                    <FileText className="h-4 w-4 inline mr-2" />
                    Create Custom Report
                  </Button>
                </div>
              </div>
            </div>

            {/* Report Templates */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Report Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{template.description}</p>
                    <div className="flex space-x-2">
                      <Button onClick={() => generateReport(template.id, 'pdf')} disabled={reportLoading} className="flex-1 px-3 py-2 text-sm">
                        {reportLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'PDF'}
                      </Button>
                      <Button onClick={() => generateReport(template.id, 'csv')} disabled={reportLoading} variant="secondary" className="flex-1 px-3 py-2 text-sm">
                        {reportLoading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'CSV'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scheduled Reports */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Scheduled Reports</h3>
                <Button className="px-4 py-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Schedule New Report
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Report Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Template</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Frequency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Run</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Next Run</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {reports.scheduledReports.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {report.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {reports.templates.find(t => t.id === report.template)?.name || report.template}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full">
                            {report.frequency}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {report.lastRun}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {report.nextRun}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            report.status === 'active' 
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button variant="ghost" className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 h-auto p-1">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 h-auto p-1">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Report History */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Report History</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Report Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Generated</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Format</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {reports.reportHistory.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {report.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400 rounded-full">
                            {report.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {report.generatedAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {report.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full">
                            {report.format}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 rounded-full">
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button variant="ghost" className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 h-auto p-1">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 h-auto p-1">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Alerts Header */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Smart Alerts System</h2>
                  <p className="text-gray-600 dark:text-gray-400">Real-time notifications and system monitoring</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{alerts.alertStats.unreadAlerts} unread</span>
                  </div>
                  <Button onClick={() => setShowAlertSettings(true)} className="px-4 py-2">
                    <Settings className="h-4 w-4 inline mr-2" />
                    Alert Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Alert Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Alerts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.alertStats.totalAlerts}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unread Alerts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.alertStats.unreadAlerts}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Today's Alerts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.alertStats.alertsToday}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Critical Alerts</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{alerts.alertStats.criticalAlerts}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Filters */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Alerts</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={alertFilters.type}
                    onChange={(e) => setAlertFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="user_registration">User Registration</option>
                    <option value="model_upload">Model Upload</option>
                    <option value="suspicious_activity">Suspicious Activity</option>
                    <option value="system_error">System Error</option>
                    <option value="revenue_milestone">Revenue Milestone</option>
                  </select>
                  
                  <select
                    value={alertFilters.severity}
                    onChange={(e) => setAlertFilters(prev => ({ ...prev, severity: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Severities</option>
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="success">Success</option>
                  </select>
                  
                  <Button
                    onClick={() => setAlertFilters({ type: 'all', severity: 'all', read: 'all', dateRange: '24h' })}
                    variant="ghost"
                    className="px-3 py-2 text-sm"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
              
              {/* Alerts List */}
              <div className="space-y-3">
                {alerts.activeAlerts
                  .filter(alert => {
                    if (alertFilters.type !== 'all' && alert.type !== alertFilters.type) return false
                    if (alertFilters.severity !== 'all' && alert.severity !== alertFilters.severity) return false
                    if (alertFilters.read !== 'all') {
                      if (alertFilters.read === 'read' && !alert.read) return false
                      if (alertFilters.read === 'unread' && alert.read) return false
                    }
                    return true
                  })
                  .map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        alert.severity === 'error' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                        alert.severity === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                        alert.severity === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/10' :
                        'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                      } ${!alert.read ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-1 rounded-full ${
                            alert.severity === 'error' ? 'bg-red-100 dark:bg-red-900/20' :
                            alert.severity === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                            alert.severity === 'success' ? 'bg-green-100 dark:bg-green-900/20' :
                            'bg-blue-100 dark:bg-blue-900/20'
                          }`}>
                            <AlertTriangle className={`h-4 w-4 ${
                              alert.severity === 'error' ? 'text-red-600 dark:text-red-400' :
                              alert.severity === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                              alert.severity === 'success' ? 'text-green-600 dark:text-green-400' :
                              'text-blue-600 dark:text-blue-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.message}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{alert.timestamp}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {!alert.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                          <button
                            onClick={() => {
                              setAlerts(prev => ({
                                ...prev,
                                activeAlerts: prev.activeAlerts.map(a => 
                                  a.id === alert.id ? { ...a, read: !a.read } : a
                                )
                              }))
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {alert.read ? <Eye className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Alert Rules */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Alert Rules</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add New Rule
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rule Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dashboard</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {alerts.alertRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {rule.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400 rounded-full">
                            {rule.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            rule.enabled 
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                          }`}>
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            rule.email 
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                              : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                          }`}>
                            {rule.email ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            rule.dashboard 
                              ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                              : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                          }`}>
                            {rule.dashboard ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button variant="ghost" className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 h-auto p-1">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 h-auto p-1">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Email Management Tab */}
        {activeTab === 'email' && (
          <div className="space-y-6">
            {/* Email Management Header */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Email Management</h2>
                  <p className="text-gray-600 dark:text-gray-400">Bulk email campaigns and user communication</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button onClick={() => setShowEmailComposer(true)} className="px-4 py-2">
                    <MessageSquare className="h-4 w-4 inline mr-2" />
                    Compose Email
                  </Button>
                  <Button onClick={() => setShowTemplateEditor(true)} className="px-4 py-2">
                    <FileText className="h-4 w-4 inline mr-2" />
                    Manage Templates
                  </Button>
                </div>
              </div>
            </div>

            {/* Email Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sent</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{(emailManagement.emailStats?.totalSent || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Opened</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{(emailManagement.emailStats?.totalOpened || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Clicked</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{(emailManagement.emailStats?.totalClicked || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Open Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{emailManagement.emailStats.openRate}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Click Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{emailManagement.emailStats.clickRate}%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Bounce Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{emailManagement.emailStats.bounceRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Campaigns */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Campaigns</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={emailFilters.status}
                    onChange={(e) => setEmailFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    <Plus className="h-4 w-4 inline mr-2" />
                    New Campaign
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Campaign Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recipients</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Opened</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Clicked</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {emailManagement.campaigns
                      .filter(campaign => emailFilters.status === 'all' || campaign.status === emailFilters.status)
                      .map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {campaign.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {campaign.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              campaign.status === 'active' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                              campaign.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' :
                              campaign.status === 'draft' ? 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400' :
                              'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {(campaign.recipients || 0).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {(campaign.opened || 0).toLocaleString()}
                            {campaign.sent > 0 && (
                              <span className="text-xs text-gray-400 ml-1">
                                ({Math.round((campaign.opened / campaign.sent) * 100)}%)
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {(campaign.clicked || 0).toLocaleString()}
                            {campaign.opened > 0 && (
                              <span className="text-xs text-gray-400 ml-1">
                                ({Math.round((campaign.clicked / campaign.opened) * 100)}%)
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Email Templates */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Templates</h3>
                <Button className="px-4 py-2">
                  <Plus className="h-4 w-4 inline mr-2" />
                  Create Template
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {emailManagement.templates.map((template) => (
                  <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        template.type === 'welcome' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                        template.type === 'newsletter' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' :
                        template.type === 'promotional' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' :
                        'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                      }`}>
                        {template.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.subject}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Last used: {template.lastUsed}</p>
                    <div className="flex space-x-2">
                      <Button className="flex-1 px-3 py-2 text-sm">Edit</Button>
                      <Button variant="secondary" className="flex-1 px-3 py-2 text-sm">Use</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Segments */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Segments</h3>
                <Button className="px-4 py-2">
                  <Plus className="h-4 w-4 inline mr-2" />
                  Create Segment
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {emailManagement.userSegments.map((segment) => (
                  <div key={segment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{segment.name}</h4>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full">
                        {(segment.count || 0).toLocaleString()} users
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{segment.description}</p>
                    <div className="flex space-x-2">
                      <Button className="flex-1 px-3 py-2 text-sm">Send Email</Button>
                      <Button variant="secondary" className="flex-1 px-3 py-2 text-sm">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Security Header */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Management</h2>
                  <p className="text-gray-600 dark:text-gray-400">Advanced security controls and threat monitoring</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      security.securityStats.securityScore >= 80 ? 'bg-green-500' :
                      security.securityStats.securityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Security Score: {security.securityStats.securityScore}/100</span>
                  </div>
                  <button
                    onClick={() => setShowIPManager(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Shield className="h-4 w-4 inline mr-2" />
                    IP Manager
                  </button>
                </div>
              </div>
            </div>

            {/* Security Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Threats</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{security.securityStats.totalThreats}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Blocked IPs</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{security.securityStats.blockedIPs}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Verified Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{(security.securityStats?.verifiedUsers || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Verifications</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{security.securityStats.pendingVerifications}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${
                    security.securityStats.securityScore >= 80 ? 'bg-green-100 dark:bg-green-900/20' :
                    security.securityStats.securityScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-red-100 dark:bg-red-900/20'
                  }`}>
                    <Target className={`h-6 w-6 ${
                      security.securityStats.securityScore >= 80 ? 'text-green-600 dark:text-green-400' :
                      security.securityStats.securityScore >= 60 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'
                    }`} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Security Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{security.securityStats.securityScore}/100</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Suspicious Activities */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Suspicious Activities</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={securityFilters.severity}
                    onChange={(e) => setSecurityFilters(prev => ({ ...prev, severity: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Severities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <select
                    value={securityFilters.status}
                    onChange={(e) => setSecurityFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="all">All Status</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="blocked">Blocked</option>
                    <option value="monitoring">Monitoring</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                {security.suspiciousActivities
                  .filter(activity => {
                    if (securityFilters.severity !== 'all' && activity.severity !== securityFilters.severity) return false
                    if (securityFilters.status !== 'all' && activity.status !== securityFilters.status) return false
                    return true
                  })
                  .map((activity) => (
                    <div
                      key={activity.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        activity.severity === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                        activity.severity === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                        'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`p-1 rounded-full ${
                            activity.severity === 'high' ? 'bg-red-100 dark:bg-red-900/20' :
                            activity.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                            'bg-blue-100 dark:bg-blue-900/20'
                          }`}>
                            <AlertTriangle className={`h-4 w-4 ${
                              activity.severity === 'high' ? 'text-red-600 dark:text-red-400' :
                              activity.severity === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-blue-600 dark:text-blue-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {activity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                activity.status === 'investigating' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400' :
                                activity.status === 'resolved' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                                activity.status === 'blocked' ? 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400' :
                                'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400'
                              }`}>
                                {activity.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              IP: {activity.ip} | User: {activity.user} | {activity.timestamp}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Investigate
                          </button>
                          <button className="px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                            Block IP
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* IP Management */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Blocked IPs */}
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Blocked IPs</h3>
                  <button className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                    <Plus className="h-4 w-4 inline mr-1" />
                    Block IP
                  </button>
                </div>
                <div className="space-y-3">
                  {security.ipBlocks.map((block) => (
                    <div key={block.id} className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{block.ip}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{block.reason}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Added: {block.addedAt} by {block.addedBy}</p>
                        </div>
                        <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Whitelisted IPs */}
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">Whitelisted IPs</h3>
                  <button className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    <Plus className="h-4 w-4 inline mr-1" />
                    Whitelist IP
                  </button>
                </div>
                <div className="space-y-3">
                  {security.ipWhitelist.map((whitelist) => (
                    <div key={whitelist.id} className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{whitelist.ip}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{whitelist.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Added: {whitelist.addedAt} by {whitelist.addedBy}</p>
                        </div>
                        <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User Verifications */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Verifications</h3>
                <button
                  onClick={() => setShowVerificationPanel(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <UserCheck className="h-4 w-4 inline mr-2" />
                  Manage Verifications
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Submitted</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Documents</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {security.userVerifications.map((verification) => (
                      <tr key={verification.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {verification.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {verification.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            verification.status === 'verified' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                            verification.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                            'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                          }`}>
                            {verification.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {verification.submittedAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {verification.documents.length} files
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                              <Eye className="h-4 w-4" />
                            </button>
                            {verification.status === 'pending' && (
                              <>
                                <button className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Security Rules */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security Rules</h3>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add Rule
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rule Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Threshold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {security.securityRules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {rule.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400 rounded-full">
                            {rule.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {rule.threshold}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full">
                            {rule.action.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            rule.enabled 
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                          }`}>
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Enhanced User Management Header */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Enhanced User Management</h2>
                  <p className="text-gray-600 dark:text-gray-400">Advanced user operations, activity tracking, and account management</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowActivityLogs(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <Activity className="h-4 w-4 inline mr-2" />
                    Activity Logs
                  </button>
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Users className="h-4 w-4 inline mr-2" />
                    Bulk Actions
                  </button>
                </div>
              </div>
            </div>

            {/* User Management Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Sessions</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userManagement.userSessions.filter(s => s.status === 'active').length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Ban className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Suspended Users</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.filter(u => u.status === 'suspended').length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Recent Activity</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{userManagement.userActivityLogs.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Actions Panel */}
            {showBulkActions && (
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bulk Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Ban className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Suspend Users</p>
                  </button>
                  <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <UserCheck className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Unsuspend Users</p>
                  </button>
                  <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Send Email</p>
                  </button>
                  <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Crown className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Change Role</p>
                  </button>
                  <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Delete Users</p>
                  </button>
                </div>
              </div>
            )}

            {/* User Management Table */}
            <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      User Management ({getFilteredUsers().length} of {users.length} users)
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setUserFilters({ role: 'all', status: 'all', dateRange: 'all', search: '' })}
                        className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                
                {/* Advanced Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Username, email, name..."
                      value={userFilters.search}
                      onChange={(e) => setUserFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  {/* Role Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <select
                      value={userFilters.role}
                      onChange={(e) => setUserFilters(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Roles</option>
                      <option value="user">Users</option>
                      <option value="admin">Admins</option>
                      <option value="super_admin">Super Admins</option>
                    </select>
                  </div>
                  
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={userFilters.status}
                      onChange={(e) => setUserFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active (30 days)</option>
                      <option value="inactive">Inactive (30+ days)</option>
                      <option value="verified">Verified</option>
                      <option value="unverified">Unverified</option>
                    </select>
                  </div>
                  
                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date Range
                    </label>
                    <select
                      value={userFilters.dateRange}
                      onChange={(e) => setUserFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                      <option value="year">Last Year</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Models
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {getFilteredUsers().length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No users found</p>
                          <p className="text-sm mt-2">
                            {users.length === 0 
                              ? 'User data will appear here once users register'
                              : 'No users match the current filters'
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // Filtered user data
                    getFilteredUsers()
                      .sort((a, b) => {
                        switch (sortBy) {
                          case 'oldest':
                            return new Date(a.createdAt) - new Date(b.createdAt);
                          case 'name':
                            return (a.displayName || a.email || '').localeCompare(b.displayName || b.email || '');
                          case 'email':
                            return (a.email || '').localeCompare(b.email || '');
                          case 'newest':
                          default:
                            return new Date(b.createdAt) - new Date(a.createdAt);
                        }
                      })
                      .map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              {user.avatar ? (
                                <img src={user.avatar} alt="" className="h-10 w-10 rounded-full" />
                              ) : (
                                <span className="text-gray-600 dark:text-gray-400 font-medium">
                                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.displayName || 'No Name'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                @{user.username}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                            {user.role === 'admin' || user.role === 'super_admin' ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                                <Shield className="h-3 w-3 mr-1" />
                                {user.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                                <UserCheck className="h-3 w-3 mr-1" />
                                User
                              </span>
                            )}
                            {user.isVerified && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {models.filter(model => model.userId === user.id).length} models
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {/* Impersonation Button */}
                            <button
                              onClick={() => {
                                setSelectedUserForImpersonation(user)
                                setShowImpersonationModal(true)
                              }}
                              className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                              title="Impersonate User"
                            >
                              <User className="h-4 w-4" />
                            </button>
                            
                            {/* View Profile */}
                            <button
                              onClick={() => window.open(`/profile/${user.username || user.id}`, '_blank')}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                              title="View Profile"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            {/* Activity Logs */}
                            <button
                              onClick={() => setShowActivityLogs(true)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                              title="View Activity"
                            >
                              <Activity className="h-4 w-4" />
                            </button>
                            
                            {/* Role Management */}
                            {user.role !== 'admin' && user.role !== 'super_admin' && (
                              <button
                                onClick={() => handleUpdateUserRole(user.id, user.role === 'user' ? 'admin' : 'user')}
                                className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300"
                                title={user.role === 'user' ? 'Make Admin' : 'Make User'}
                              >
                                <Crown className="h-4 w-4" />
                              </button>
                            )}
                            
                            {/* Suspend/Unsuspend */}
                            <button
                              onClick={() => handleSuspendUser(user.id, user.status !== 'suspended')}
                              className={user.status === 'suspended' ? 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300' : 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300'}
                              title={user.status === 'suspended' ? 'Unsuspend User' : 'Suspend User'}
                            >
                              {user.status === 'suspended' ? <UserCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                            </button>
                            
                            {/* Delete User */}
                            {user.role !== 'admin' && user.role !== 'super_admin' && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Impersonation Modal */}
          {showImpersonationModal && selectedUserForImpersonation && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                <div className="mt-3">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900/20 rounded-full">
                    <User className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="mt-2 px-7 py-3">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center">Impersonate User</h3>
                    <div className="mt-2 px-7 py-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        You are about to impersonate <strong>{selectedUserForImpersonation.displayName || selectedUserForImpersonation.email}</strong>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
                        This action will log you in as this user for support purposes.
                      </p>
                    </div>
                  </div>
                  <div className="items-center px-4 py-3">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setShowImpersonationModal(false)
                          setSelectedUserForImpersonation(null)
                        }}
                        className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          // Handle impersonation logic here
                          console.log('Impersonating user:', selectedUserForImpersonation.id)
                          setShowImpersonationModal(false)
                          setSelectedUserForImpersonation(null)
                        }}
                        className="px-4 py-2 bg-purple-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300"
                      >
                        Impersonate
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activity Logs Modal */}
          {showActivityLogs && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white dark:bg-gray-800">
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Activity Logs</h3>
                    <button
                      onClick={() => setShowActivityLogs(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <XCircle className="h-6 w-6" />
                    </button>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Details</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {userManagement.userActivityLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {log.username}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full">
                                {log.action.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {log.details}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {log.ip}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {log.timestamp}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Sessions */}
                        <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active User Sessions</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Login Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {userManagement.userSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {session.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {session.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {session.ip}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {session.loginTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {session.lastActivity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          session.status === 'active' ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' :
                          session.status === 'idle' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' :
                          'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                        }`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                          <Ban className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Impersonation History */}
                        <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Impersonation History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Target User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Started</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {userManagement.impersonationHistory.map((impersonation) => (
                    <tr key={impersonation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {impersonation.adminUser}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {impersonation.targetUser}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {impersonation.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {impersonation.startedAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {impersonation.duration}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </div>
        )}

        {/* Models Tab */}
        {activeTab === 'models' && (
          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Model Management ({getFilteredModels().length} of {models.length} models)
                  </h2>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setModelFilters({ category: 'all', status: 'all', dateRange: 'all', search: '' })}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
                
                {/* Advanced Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Title, description, tags..."
                      value={modelFilters.search}
                      onChange={(e) => setModelFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={modelFilters.category}
                      onChange={(e) => setModelFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Categories</option>
                      <option value="Architecture">Architecture</option>
                      <option value="Characters">Characters</option>
                      <option value="Vehicles">Vehicles</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Nature">Nature</option>
                      <option value="Technology">Technology</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={modelFilters.status}
                      onChange={(e) => setModelFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  
                  {/* Date Range Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date Range
                    </label>
                    <select
                      value={modelFilters.dateRange}
                      onChange={(e) => setModelFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                      <option value="year">Last Year</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Model
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {getFilteredModels().length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <File className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No models found</p>
                          <p className="text-sm mt-2">
                            {models.length === 0 
                              ? 'Model data will appear here once users upload models'
                              : 'No models match the current filters'
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    getFilteredModels().map((model) => (
                      <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-12 w-12 rounded-lg bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              {model.thumbnail ? (
                                <img src={model.thumbnail} alt="" className="h-12 w-12 rounded-lg object-cover" />
                              ) : (
                                <span className="text-gray-600 dark:text-gray-400 text-lg">3D</span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {model.title || 'Untitled'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {model.category || 'Uncategorized'}
                              </div>
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                {model.createdAt ? new Date(model.createdAt).toLocaleDateString() : 'Unknown date'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {model.author?.username || 'Unknown'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {model.userId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {model.isApproved === false ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Approved
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <Download className="h-3 w-3 mr-1 text-green-500" />
                              {model.downloads || 0} downloads
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1 text-blue-500" />
                              {model.views || 0} views
                            </div>
                            <div className="flex items-center">
                              <Heart className="h-3 w-3 mr-1 text-red-500" />
                              {model.likes || 0} likes
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {model.isApproved === false ? (
                              <>
                                <button
                                  onClick={() => handleApproveModel(model.id)}
                                  className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectModel(model.id)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleRejectModel(model.id)}
                                className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-900 dark:hover:text-yellow-300"
                              >
                                Unapprove
                              </button>
                            )}
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bulk Upload Tab */}
        {activeTab === 'bulk-upload' && (
          <div className="space-y-6">
            <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-center">
                <UploadCloud className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Bulk Upload Models
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Upload multiple 3D models efficiently. All models will be attributed to the platform.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => window.open('/admin/bulk-upload', '_blank')}
                    className="px-6 py-3"
                  >
                    <UploadCloud className="h-5 w-5 mr-2" />
                    Open Bulk Upload Tool
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('/upload', '_blank')}
                  >
                    <File className="h-5 w-5 mr-2" />
                    Single Upload
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <File className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Platform Models</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {models.filter(m => m.isPlatformModel).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Download className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Downloads</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {models.reduce((sum, m) => sum + (m.downloads || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Platform Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{models.filter(m => m.isPlatformModel).reduce((sum, m) => sum + (m.platformRevenue || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                How to Use Bulk Upload
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">1. Prepare Your Models</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Supported formats: GLB, GLTF, OBJ, FBX, 3DS, DAE, STL, PLY</li>
                    <li>• Maximum file size: 250MB per model</li>
                    <li>• Organize files in a folder for easy selection</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">2. Configure Settings</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Set default category, license, and tags</li>
                    <li>• Choose model features and descriptions</li>
                    <li>• All models will be public by default</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">3. Upload Process</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Drag and drop multiple files or use file picker</li>
                    <li>• Edit titles before uploading</li>
                    <li>• Monitor progress and retry failed uploads</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">4. Revenue Management</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• All revenue goes to platform account</li>
                    <li>• Models are marked as platform content</li>
                    <li>• Track earnings in revenue dashboard</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === 'revenue' && (
          <div className="space-y-6">
            <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="text-center">
                <DollarSign className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Platform Revenue Management
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Track platform earnings, revenue streams, and financial performance.
                </p>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => window.open('/admin/revenue', '_blank')}
                    className="px-6 py-3"
                  >
                    <DollarSign className="h-5 w-5 mr-2" />
                    Open Revenue Dashboard
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open('/admin/bulk-upload', '_blank')}
                  >
                    <UploadCloud className="h-5 w-5 mr-2" />
                    Upload Models
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Revenue Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Platform Revenue</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{models.filter(m => m.isPlatformModel).reduce((sum, m) => sum + (m.platformEarnings || 0), 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Platform Models</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {models.filter(m => m.isPlatformModel).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Revenue/Model</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{models.filter(m => m.isPlatformModel).length > 0 
                        ? Math.round(models.filter(m => m.isPlatformModel).reduce((sum, m) => sum + (m.platformEarnings || 0), 0) / models.filter(m => m.isPlatformModel).length)
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Revenue Information */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2 text-green-600" />
                Revenue Model
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Platform Models (100% Revenue)</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• All revenue from platform-uploaded models</li>
                    <li>• No creator sharing required</li>
                    <li>• Full control over pricing and licensing</li>
                    <li>• Ideal for platform-owned content</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">User Models (70% Platform / 30% Creator)</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• 70% platform revenue share</li>
                    <li>• 30% creator earnings</li>
                    <li>• Encourages user participation</li>
                    <li>• Sustainable growth model</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content Management Tab */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Content Management Header */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Management</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage featured models, categories, and bulk operations</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowCategoryManager(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <Package className="h-4 w-4 inline mr-2" />
                    Manage Categories
                  </button>
                  <button
                    onClick={() => setShowBulkModelActions(!showBulkModelActions)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <File className="h-4 w-4 inline mr-2" />
                    Bulk Actions
                  </button>
                </div>
              </div>
            </div>

            {/* Content Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <File className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Models</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{contentManagement.contentStats.totalModels}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Featured Models</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{contentManagement.contentStats.featuredModels}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending Approval</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{contentManagement.contentStats.pendingApproval}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Package className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Categories</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{contentManagement.contentStats.totalCategories}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Categories</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{contentManagement.contentStats.activeCategories}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Model Actions Panel */}
            {showBulkModelActions && (
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Bulk Model Operations</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Feature Models</p>
                  </button>
                  <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <StarOff className="h-8 w-8 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Unfeature Models</p>
                  </button>
                  <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Approve Models</p>
                  </button>
                  <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Reject Models</p>
                  </button>
                  <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Package className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Change Category</p>
                  </button>
                  <button className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Delete Models</p>
                  </button>
                </div>
              </div>
            )}

            {/* Featured Models Management */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Featured Models</h3>
                <button
                  onClick={() => setShowFeaturedManager(true)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
                >
                  <Star className="h-4 w-4 inline mr-2" />
                  Manage Featured
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Downloads</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Featured Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {contentManagement.featuredModels.map((model) => (
                      <tr key={model.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {model.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {model.author}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {(model.views || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {(model.downloads || 0).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {model.featuredAt}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                              <StarOff className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category Management */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Content Categories</h3>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                  <Plus className="h-4 w-4 inline mr-2" />
                  Add Category
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contentManagement.categories.map((category) => (
                  <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-medium text-gray-900 dark:text-white">{category.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            category.isActive 
                              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400'
                          }`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{category.description}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <span>{category.modelCount} models</span>
                          <span>Created: {new Date(category.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className={category.isActive ? 'text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300' : 'text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300'}>
                          {category.isActive ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </button>
                        <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <button className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300">
                        <BarChart3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tag & Category Management Tab */}
        {activeTab === 'tags' && (
          <div className="space-y-6">
            {/* Tag Management Header */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tag & Category Management</h2>
                  <p className="text-gray-600 dark:text-gray-400">Manage tags, categories, and hierarchical organization</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowTagAnalytics(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <BarChart3 className="h-4 w-4 inline mr-2" />
                    Tag Analytics
                  </button>
                  <button
                    onClick={() => setShowCategoryHierarchy(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    <TreePine className="h-4 w-4 inline mr-2" />
                    Category Tree
                  </button>
                </div>
              </div>
            </div>

            {/* Tag Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Tag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Tags</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{tagManagement.tagAnalytics.totalTags}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Trending Tags</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{tagManagement.tagAnalytics.trendingTags}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <Crown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Most Used</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{tagManagement.tagAnalytics.mostUsedTag}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Recently Created</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{tagManagement.tagAnalytics.recentlyCreated}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-gray-100 dark:bg-gray-900/20 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unused Tags</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{tagManagement.tagAnalytics.unusedTags}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tag Management */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Tag Management</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowTagSuggestions(!showTagSuggestions)}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <Lightbulb className="h-4 w-4 inline mr-1" />
                    Suggestions
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    <Plus className="h-4 w-4 inline mr-2" />
                    Add Tag
                  </button>
                </div>
              </div>
              
              {/* Tag Suggestions Panel */}
              {showTagSuggestions && (
                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-green-900 dark:text-green-400 mb-3">Suggested Tags</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {tagManagement.tagSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{suggestion.tag}</span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {(suggestion.confidence * 100).toFixed(0)}% confidence • {suggestion.category}
                          </div>
                        </div>
                        <button className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tagManagement.tags.map((tag) => (
                  <div key={tag.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: tag.color }}
                          ></div>
                          <span className="font-medium text-gray-900 dark:text-white">#{tag.name}</span>
                          {tag.trending && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-full">
                              Trending
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p>Usage: <span className="font-medium">{tag.usage} models</span></p>
                          <p>Category: <span className="font-medium">{tag.category}</span></p>
                          <p>Created: <span className="font-medium">{new Date(tag.createdAt).toLocaleDateString()}</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300">
                          <Palette className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                        <BarChart3 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Hierarchy */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Category Hierarchy</h3>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors">
                  <TreePine className="h-4 w-4 inline mr-2" />
                  Manage Hierarchy
                </button>
              </div>
              <div className="space-y-4">
                {tagManagement.categoryHierarchy.map((category) => (
                  <div key={category.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <TreePine className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          <span className="font-medium text-gray-900 dark:text-white">{category.name}</span>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-400 rounded-full">
                            {category.modelCount} models
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                            <Plus className="h-4 w-4" />
                          </button>
                          <button className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300">
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Subcategories */}
                      {category.children && category.children.length > 0 && (
                        <div className="mt-3 ml-8 space-y-2">
                          {category.children.map((child) => (
                            <div key={child.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <span className="text-sm text-gray-700 dark:text-gray-300">{child.name}</span>
                                <span className="px-2 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
                                  {child.modelCount}
                                </span>
                              </div>
                              <div className="flex space-x-1">
                                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300">
                                  <Edit3 className="h-3 w-3" />
                                </button>
                                <button className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* System Settings Header */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">Configure site settings, features, and performance</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                    systemSettings.systemHealth.status === 'healthy' 
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      systemSettings.systemHealth.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium">{systemSettings.systemHealth.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Status</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{systemSettings.systemHealth.status}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Uptime</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{systemSettings.systemHealth.uptime}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Code className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Version</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{systemSettings.systemHealth.version}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <Globe className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Environment</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{systemSettings.systemHealth.environment}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Site Configuration */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Site Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Name</label>
                  <input
                    type="text"
                    value={systemSettings.siteConfiguration.siteName}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max File Size</label>
                  <input
                    type="text"
                    value={systemSettings.siteConfiguration.maxFileSize}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    readOnly
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Site Description</label>
                  <textarea
                    value={systemSettings.siteConfiguration.siteDescription}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows="3"
                    readOnly
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allowed Formats</label>
                  <div className="flex flex-wrap gap-2">
                    {systemSettings.siteConfiguration.allowedFormats.map((format, index) => (
                      <span key={index} className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 rounded-full">
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Toggles */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Feature Toggles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(systemSettings.featureToggles).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                    <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                      enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        enabled ? 'translate-x-4' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Settings */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Performance Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Cache Enabled</span>
                    <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                      systemSettings.performanceSettings.cacheEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        systemSettings.performanceSettings.cacheEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Image Cache: {systemSettings.performanceSettings.imageCacheExpiry}</p>
                    <p>Model Cache: {systemSettings.performanceSettings.modelCacheExpiry}</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">CDN Enabled</span>
                    <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                      systemSettings.performanceSettings.cdnEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        systemSettings.performanceSettings.cdnEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Content delivery optimization</p>
                    <p>Global edge locations</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Compression</span>
                    <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${
                      systemSettings.performanceSettings.compressionEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        systemSettings.performanceSettings.compressionEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Gzip compression</p>
                    <p>Reduced bandwidth usage</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Mode */}
                          <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Maintenance Mode</h3>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors">
                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                  {systemSettings.siteConfiguration.maintenanceMode ? 'Disable' : 'Enable'} Maintenance
                </button>
              </div>
              <div className={`p-4 rounded-lg border-l-4 ${
                systemSettings.siteConfiguration.maintenanceMode
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/10'
                  : 'border-green-500 bg-green-50 dark:bg-green-900/10'
              }`}>
                <p className={`text-sm font-medium ${
                  systemSettings.siteConfiguration.maintenanceMode
                    ? 'text-orange-800 dark:text-orange-400'
                    : 'text-green-800 dark:text-green-400'
                }`}>
                  {systemSettings.siteConfiguration.maintenanceMode
                    ? 'Site is currently in maintenance mode'
                    : 'Site is operational and accepting traffic'
                  }
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {systemSettings.siteConfiguration.maintenanceMode
                    ? 'Users will see a maintenance page instead of the regular site'
                    : 'All features are available to users'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Moderation Tab */}
        {activeTab === 'moderation' && (
          <div className="space-y-6">
            {/* Pending Models */}
            <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Pending Approval ({stats.pendingModels} models)
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Review and approve new model submissions
                </p>
              </div>
              
              {stats.pendingModels === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No models pending approval</p>
                  <p className="text-sm mt-2 text-gray-500 dark:text-gray-500">All models are approved and visible to users</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {models.filter(model => !model.isApproved).map((model) => (
                      <div key={model.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {model.title || 'Untitled Model'}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded">
                            {model.category || 'Uncategorized'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {model.description || 'No description available'}
                        </p>
                        
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <div className="flex items-center justify-between">
                            <span>By: {model.author?.username || 'Unknown'}</span>
                            <span>{new Date(model.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveModel(model.id)}
                            className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectModel(model.id)}
                            className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                          >
                            <XCircle className="h-4 w-4 inline mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Content Reporting System */}
            <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Content Reports ({stats.reportedModels} items)
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Review content that has been flagged by users
                </p>
              </div>
              
              {stats.reportedModels === 0 ? (
                <div className="p-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No content has been reported</p>
                  <p className="text-sm mt-2 text-gray-500 dark:text-gray-500">Your community is following the guidelines well!</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="text-center text-gray-600 dark:text-gray-400">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <p>Content reporting system ready for implementation</p>
                    <p className="text-sm mt-2">This will include detailed reporting reasons and moderation tools</p>
                  </div>
                </div>
              )}
            </div>

            {/* Moderation Actions */}
            <div className="bg-luxury-bg-card dark:bg-gray-800 rounded-lg shadow">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Quick Moderation Actions
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Common moderation tasks and bulk actions
                </p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Bulk Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                        Approve All Pending Models
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                        Reject All Pending Models
                      </button>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Content Filters</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                        Show Only Pending Models
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded">
                        Show Reported Content
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
