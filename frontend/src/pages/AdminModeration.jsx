import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import PageMeta from '../components/PageMeta'
import { 
  Flag, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  FileText, 
  MessageSquare,
  Shield,
  Eye,
  Trash2,
  Archive,
  Search,
  Filter
} from 'lucide-react'

const AdminModeration = () => {
  const { user, profile, loading: authLoading } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)
  const [filter, setFilter] = useState('all') // all, pending, resolved, high-priority
  const [searchTerm, setSearchTerm] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    highPriority: 0
  })

  useEffect(() => {
    const isAdmin = profile?.isAdmin === true || profile?.role === 'admin' || profile?.role === 'super_admin'
    if (user && isAdmin) {
      loadReports()
      loadStats()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, profile, authLoading])

  const loadReports = async () => {
    setLoading(true)
    try {
      const result = await firebaseHelpers.getReports()
      if (result.success) {
        setReports(result.reports || [])
      }
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await firebaseHelpers.getModerationStats()
      if (result.success) {
        setStats(result.stats)
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleReportAction = async (reportId, action, notes = '') => {
    try {
      const result = await firebaseHelpers.processReport(reportId, action, notes, user.uid)
      if (result.success) {
        loadReports()
        loadStats()
        setSelectedReport(null)
      }
    } catch (error) {
      console.error('Error processing report:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-gray-500" />
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === 'all' || 
      (filter === 'pending' && report.status === 'pending') ||
      (filter === 'resolved' && report.status === 'resolved') ||
      (filter === 'high-priority' && report.priority === 'high')
    
    const matchesSearch = !searchTerm || 
      report.contentTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.contentAuthor?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const isAdmin = profile?.isAdmin === true || profile?.role === 'admin' || profile?.role === 'super_admin'

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-700 dark:text-gray-300">Loading moderation tools...</div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-10 h-10 mx-auto mb-4 text-gray-500" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Restricted</h1>
          <p className="text-gray-600 dark:text-gray-400">Only admins can review reports.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageMeta 
        title="Content Moderation - Admin Dashboard"
        description="Admin dashboard for content moderation and community management"
        url="/admin/moderation"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Content Moderation
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Review reported content and manage community safety
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <Flag className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.highPriority}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="all">All Reports</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="high-priority">High Priority</option>
                  </select>
                </div>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm w-64"
                />
              </div>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reports ({filteredReports.length})
              </h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="p-8 text-center">
                <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No reports found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(report.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                            {report.priority} priority
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {report.reason?.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                          {report.contentTitle}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                          <span className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>By {report.contentAuthor}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FileText className="w-4 h-4" />
                            <span>{report.contentType}</span>
                          </span>
                          <span>
                            {new Date(report.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedReport(report)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report Detail Modal */}
          {selectedReport && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      Report Details
                    </h3>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Content Information</h4>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p><strong>Title:</strong> {selectedReport.contentTitle}</p>
                        <p><strong>Author:</strong> {selectedReport.contentAuthor}</p>
                        <p><strong>Type:</strong> {selectedReport.contentType}</p>
                        <p><strong>ID:</strong> {selectedReport.contentId}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Report Information</h4>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p><strong>Reason:</strong> {selectedReport.reason?.replace('_', ' ')}</p>
                        <p><strong>Priority:</strong> {selectedReport.priority}</p>
                        <p><strong>Status:</strong> {selectedReport.status}</p>
                        <p><strong>Reported by:</strong> {selectedReport.reporterEmail}</p>
                        <p><strong>Date:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {selectedReport.details && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Additional Details</h4>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                          <p>{selectedReport.details}</p>
                        </div>
                      </div>
                    )}

                    {selectedReport.status === 'pending' && (
                      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleReportAction(selectedReport.id, 'dismiss')}
                          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Dismiss</span>
                        </button>
                        <button
                          onClick={() => handleReportAction(selectedReport.id, 'remove_content')}
                          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Remove Content</span>
                        </button>
                        <button
                          onClick={() => handleReportAction(selectedReport.id, 'warning')}
                          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          <span>Send Warning</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  )
}

export default AdminModeration
