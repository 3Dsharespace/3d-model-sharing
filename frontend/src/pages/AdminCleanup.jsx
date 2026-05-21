import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { cleanupUsers } from '../lib/cleanupUsers'
import { firebaseHelpers } from '../lib/firebase'
import { 
  Trash2, 
  Users, 
  File, 
  Download, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  Search,
  Shield,
  Database,
  HardDrive
} from 'lucide-react'
import { Button } from '../components/ui/Button'

const AdminCleanup = () => {
  const { user, profile } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalModels: 0,
    totalDownloads: 0
  })
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [cleanupProgress, setCleanupProgress] = useState('')
  const [cleanupResults, setCleanupResults] = useState([])

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return
      
      try {
        if (profile?.role === 'admin' || profile?.isAdmin === true) {
          setIsAdmin(true)
        } else {
          const adminEmails = ['threedsharespace@gmail.com', 'admin@3dsharespace.com']
          setIsAdmin(adminEmails.includes(user.email))
        }
      } catch (err) {
        console.error('Error checking admin status:', err)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user, profile])

  // Fetch cleanup statistics
  useEffect(() => {
    if (!isAdmin) return

    const fetchStats = async () => {
      try {
        const result = await cleanupUsers.getCleanupStats()
        if (result.success) {
          setStats(result.stats)
        }
      } catch (err) {
        console.error('Error fetching stats:', err)
      }
    }

    fetchStats()
  }, [isAdmin])

  // Handle user selection
  const handleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  // Handle select all users
  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(user => user.id))
    }
  }

  // Delete selected users
  const handleDeleteSelected = async () => {
    if (selectedUsers.length === 0) return
    
    const confirmed = window.confirm(
      `⚠️ WARNING: This will permanently delete ${selectedUsers.length} users and ALL their data!\n\n` +
      `This action cannot be undone. Are you sure you want to continue?`
    )
    
    if (!confirmed) return

    try {
      setCleanupProgress('Starting user deletion...')
      setCleanupResults([])
      
      const result = await cleanupUsers.bulkDeleteUsers(selectedUsers)
      
      if (result.success) {
        setCleanupResults(result.results)
        setSelectedUsers([])
        setCleanupProgress('✅ User deletion completed successfully!')
        
        // Refresh stats
        const newStats = await cleanupUsers.getCleanupStats()
        if (newStats.success) {
          setStats(newStats.stats)
        }
      } else {
        setCleanupProgress(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error deleting users:', error)
      setCleanupProgress(`❌ Error: ${error.message}`)
    }
  }

  // Clean up orphaned data
  const handleCleanupOrphaned = async () => {
    const confirmed = window.confirm(
      'This will clean up orphaned data (data without corresponding users).\n\n' +
      'This action cannot be undone. Continue?'
    )
    
    if (!confirmed) return

    try {
      setCleanupProgress('Cleaning up orphaned data...')
      
      const result = await cleanupUsers.cleanupOrphanedData()
      
      if (result.success) {
        setCleanupProgress(
          `✅ Orphaned data cleanup completed!\n` +
          `Deleted ${result.orphanedModels} orphaned models\n` +
          `Deleted ${result.orphanedDownloads} orphaned download records`
        )
        
        // Refresh stats
        const newStats = await cleanupUsers.getCleanupStats()
        if (newStats.success) {
          setStats(newStats.stats)
        }
      } else {
        setCleanupProgress(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error cleaning up orphaned data:', error)
      setCleanupProgress(`❌ Error: ${error.message}`)
    }
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
            You don't have permission to access the cleanup tools
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
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading cleanup tools...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Cleanup Tools
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                ⚠️ Advanced data management - Use with extreme caution!
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-red-500 dark:text-red-400">
                <Shield className="h-4 w-4" />
                <span>Admin Access Required</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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
        </div>
      </div>

      {/* Cleanup Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Data Cleanup Actions
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              These actions will permanently delete data. Use with extreme caution!
            </p>
          </div>
          
          <div className="p-6 space-y-4">
            {/* Orphaned Data Cleanup */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                <Database className="h-4 w-4 inline mr-2" />
                Clean Up Orphaned Data
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Remove models and download records that don't have corresponding users
              </p>
              <Button onClick={handleCleanupOrphaned} className="h-9 px-4 bg-orange-600 hover:bg-orange-700">Clean Up Orphaned Data</Button>
            </div>

            {/* Bulk User Deletion */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                <Users className="h-4 w-4 inline mr-2" />
                Bulk User Deletion
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Delete multiple users and all their associated data
              </p>
              <Button onClick={handleDeleteSelected} disabled={selectedUsers.length === 0} className="h-9 px-4 bg-red-600 hover:bg-red-700">Delete {selectedUsers.length} Selected Users</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Results */}
      {cleanupProgress && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`rounded-lg p-4 ${
            cleanupProgress.includes('✅') 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
              : cleanupProgress.includes('❌')
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
          }`}>
            <div className="flex items-center">
              {cleanupProgress.includes('✅') ? (
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              ) : cleanupProgress.includes('❌') ? (
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              ) : (
                <Loader2 className="animate-spin h-5 w-5 text-blue-400 mr-2" />
              )}
              <p className={`text-sm ${
                cleanupProgress.includes('✅') 
                  ? 'text-green-800 dark:text-green-200' 
                  : cleanupProgress.includes('❌')
                  ? 'text-red-800 dark:text-red-200'
                  : 'text-blue-800 dark:text-blue-200'
              }`}>
                {cleanupProgress}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cleanup Results */}
      {cleanupResults.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Cleanup Results
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {cleanupResults.map((result, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded ${
                    result.success 
                      ? 'bg-green-50 dark:bg-green-900/20' 
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <span className="text-sm font-medium">
                      User: {result.userId}
                    </span>
                    <span className={`text-sm ${
                      result.success 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {result.success ? '✅ Success' : `❌ ${result.error}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User List for Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                User Management
              </h2>
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <Button variant="ghost" className="h-9 px-3 text-blue-600 dark:text-blue-300" onClick={handleSelectAll}>
                  {selectedUsers.length === users.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mr-3" />
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                  Advanced User Management Interface
                </h3>
              </div>
              <p className="text-yellow-700 dark:text-yellow-300 mb-4">
                We're currently developing a comprehensive user management interface that will provide advanced tools for user administration, data cleanup, and account management.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700 dark:text-yellow-300">
                <div>• Bulk user operations and management</div>
                <div>• Advanced user search and filtering</div>
                <div>• User activity monitoring and analytics</div>
                <div>• Automated cleanup and maintenance tools</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">User Management</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Comprehensive tools for managing user accounts, permissions, and access controls across the platform.
                </p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <div>• User account administration</div>
                  <div>• Role and permission management</div>
                  <div>• Account status monitoring</div>
                  <div>• User communication tools</div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Database className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Data Cleanup</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Advanced data management tools for cleaning up user data, removing inactive accounts, and maintaining database integrity.
                </p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <div>• Inactive account identification</div>
                  <div>• Data integrity verification</div>
                  <div>• Automated cleanup processes</div>
                  <div>• Backup and recovery tools</div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-3" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Security Tools</h4>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Security-focused administration tools for monitoring user behavior, detecting suspicious activity, and maintaining platform security.
                </p>
                <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                  <div>• Security monitoring and alerts</div>
                  <div>• Suspicious activity detection</div>
                  <div>• Account security management</div>
                  <div>• Compliance and audit tools</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Available Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Basic Cleanup Operations</h5>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Remove inactive user accounts</li>
                    <li>• Clean up orphaned data and files</li>
                    <li>• Database optimization and maintenance</li>
                    <li>• Storage space management</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">User Statistics</h5>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Total user count: {stats.totalUsers}</li>
                    <li>• Total models: {stats.totalModels}</li>
                    <li>• Total downloads: {stats.totalDownloads}</li>
                    <li>• Platform usage metrics</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminCleanup
