import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import firebaseHelpers from '../../lib/firebase'
import { useAuth } from '../../contexts/AuthContext'
import { 
  Search, Filter, MoreVertical, Edit3, Trash2, Eye, Ban, UserCheck,
  User, Crown, Star, Mail, Calendar, Activity, Shield, Award,
  AlertTriangle, CheckCircle, Clock, ExternalLink, Copy, Users
} from 'lucide-react'
import { Button } from '../ui/Button'

const UserManagementTab = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState('')
  const [actionError, setActionError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [viewMode, setViewMode] = useState('table')

  const roleOptions = [
    { value: 'all', label: 'All Roles', color: 'gray' },
    { value: 'user', label: 'Users', color: 'blue' },
    { value: 'creator', label: 'Creators', color: 'green' },
    { value: 'admin', label: 'Admins', color: 'purple' },
    { value: 'super_admin', label: 'Super Admins', color: 'red' }
  ]

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'active', label: 'Active', color: 'green' },
    { value: 'inactive', label: 'Inactive', color: 'yellow' },
    { value: 'banned', label: 'Banned', color: 'red' },
    { value: 'pending', label: 'Pending Verification', color: 'orange' }
  ]

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const result = await firebaseHelpers.getUsers()
      setUsers(result.users || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const role = user.role || (user.isAdmin ? 'admin' : 'user')
    const matchesRole = selectedRole === 'all' || role === selectedRole
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus

    return matchesSearch && matchesRole && matchesStatus
  }).sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt)
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt)
      case 'username':
        return (a.username || a.email).localeCompare(b.username || b.email)
      case 'lastActive':
        return new Date(b.lastLogin || b.createdAt) - new Date(a.lastLogin || a.createdAt)
      default:
        return 0
    }
  })

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0 || actionLoading) return

    const safeSelection = selectedUsers.filter(uid => uid !== currentUser?.uid)
    if (safeSelection.length === 0) {
      setActionError('You cannot run this action on your own admin account.')
      return
    }

    const destructive = action === 'delete' || action === 'ban'
    if (destructive && !window.confirm(`Apply "${action}" to ${safeSelection.length} selected user(s)?`)) {
      return
    }

    setActionLoading(true)
    setActionError('')
    setActionMessage('')

    try {
      for (const userId of safeSelection) {
        await handleUserAction(userId, action, { silent: true })
      }
      setSelectedUsers([])
      setActionMessage(`Updated ${safeSelection.length} user(s).`)
      await loadUsers()
    } catch (error) {
      setActionError(error.message || 'Bulk action failed')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUserAction = async (userId, action, options = {}) => {
    if (userId === currentUser?.uid && ['removeAdmin', 'ban', 'delete'].includes(action)) {
      setActionError('You cannot remove or block your own admin account.')
      return
    }

    try {
      setActionError('')
      setActionMessage('')
      switch (action) {
        case 'makeAdmin':
          {
            const result = await firebaseHelpers.setUserAsAdmin(userId, true)
            if (!result.success) throw new Error(result.error)
          }
          break
        case 'removeAdmin':
          {
            const result = await firebaseHelpers.setUserAsAdmin(userId, false)
            if (!result.success) throw new Error(result.error)
          }
          break
        case 'ban':
          {
            const result = await firebaseHelpers.updateUserStatus(userId, 'banned')
            if (!result.success) throw new Error(result.error)
          }
          break
        case 'unban':
          {
            const result = await firebaseHelpers.updateUserStatus(userId, 'active')
            if (!result.success) throw new Error(result.error)
          }
          break
        case 'delete':
          if (options.silent || window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            const result = await firebaseHelpers.deleteUser(userId)
            if (!result.success) throw new Error(result.error)
          }
          break
        default:
          break
      }
      if (!options.silent) {
        setActionMessage('User updated.')
        loadUsers()
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error)
      if (!options.silent) {
        setActionError(error.message || `Could not perform ${action}`)
      } else {
        throw error
      }
    }
  }

  const UserCard = ({ user }) => (
    <motion.div
      whileHover={{ y: -2, shadow: "0 10px 25px rgba(0,0,0,0.1)" }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group"
    >
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username || user.email}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
              {user.username || user.displayName || user.email?.split('@')[0]}
              {user.isAdmin && <Crown className="w-4 h-4 ml-2 text-yellow-500" />}
              {user.isVerified && <CheckCircle className="w-4 h-4 ml-1 text-blue-500" />}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Role:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              user.role === 'admin' || user.role === 'super_admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
              user.role === 'creator' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
            }`}>
              {user.role || 'user'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs ${
              user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
              user.status === 'banned' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            }`}>
              {user.status || 'active'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Joined:</span>
            <span className="text-gray-900 dark:text-white">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
          <div className="flex space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{user.modelCount || 0} models</span>
            <span>{user.downloadCount || 0} downloads</span>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm">
              <Eye className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm">
              <Mail className="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit3 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )

  const TableRow = ({ user, index }) => (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700"
    >
      <td className="px-6 py-4">
        <input
          type="checkbox"
          checked={selectedUsers.includes(user.uid)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedUsers([...selectedUsers, user.uid])
            } else {
              setSelectedUsers(selectedUsers.filter(id => id !== user.uid))
            }
          }}
          className="rounded border-gray-300"
        />
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username || user.email}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            {user.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white flex items-center">
              {user.username || user.displayName || user.email?.split('@')[0]}
              {user.isAdmin && <Crown className="w-4 h-4 ml-2 text-yellow-500" />}
              {user.isVerified && <CheckCircle className="w-4 h-4 ml-1 text-blue-500" />}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-xs rounded-full ${
          user.role === 'admin' || user.role === 'super_admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
          user.role === 'creator' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
          'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {user.role || 'user'}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-xs rounded-full ${
          user.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
          user.status === 'banned' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        }`}>
          {user.status || 'active'}
        </span>
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {user.modelCount || 0}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {user.downloadCount || 0}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.open(`/profile/${user.uid}`, '_blank')}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {!user.isAdmin ? (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleUserAction(user.uid, 'makeAdmin')}
            >
              <Crown className="w-4 h-4 text-yellow-500" />
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleUserAction(user.uid, 'removeAdmin')}
            >
              <User className="w-4 h-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleUserAction(user.uid, user.status === 'banned' ? 'unban' : 'ban')}
          >
            {user.status === 'banned' ? (
              <UserCheck className="w-4 h-4 text-green-500" />
            ) : (
              <Ban className="w-4 h-4 text-red-500" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => handleUserAction(user.uid, 'delete')}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </td>
    </motion.tr>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all {filteredUsers.length} users on your platform
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
          >
            {viewMode === 'grid' ? 'Table View' : 'Grid View'}
          </Button>
          <Button onClick={loadUsers}>
            <Users className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.status === 'active' || !u.status).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Administrators</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.isAdmin || u.role === 'admin' || u.role === 'super_admin').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Ban className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Banned Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {users.filter(u => u.status === 'banned').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        {actionMessage && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-200">
            {actionMessage}
          </div>
        )}
        {actionError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200">
            {actionError}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {roleOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="username">Username A-Z</option>
              <option value="lastActive">Last Active</option>
            </select>
          </div>
        </div>

        {selectedUsers.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex space-x-2">
              <Button size="sm" onClick={() => handleBulkAction('makeAdmin')} disabled={actionLoading}>
                Make Admin
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('ban')} disabled={actionLoading}>
                Ban Users
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkAction('delete')} disabled={actionLoading}>
                Delete Users
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Users Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard key={user.uid} user={user} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(filteredUsers.map(u => u.uid))
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Models
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Downloads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user, index) => (
                  <TableRow key={user.uid} user={user} index={index} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredUsers.length === 0 && (
        <div className="text-center py-20">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No users found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || selectedRole !== 'all' || selectedStatus !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'No users have joined your platform yet.'}
          </p>
        </div>
      )}
    </div>
  )
}

export default UserManagementTab

