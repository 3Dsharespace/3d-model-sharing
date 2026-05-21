import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { Link } from 'react-router-dom'
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Download, 
  Eye, 
  X, 
  Check, 
  CheckCheck,
  Loader2,
  Trash2,
  ExternalLink,
  FolderPlus,
  Trophy,
  Star,
  Share,
  DollarSign,
  Users,
  Settings,
  Shield,
  Cog
} from 'lucide-react'
import { Button } from '../components/ui/Button'

const Notifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [markingAsRead, setMarkingAsRead] = useState(false)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      fetchUnreadCount()
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const result = await firebaseHelpers.getUserNotifications(user.uid)
      
      if (result.success) {
        setNotifications(result.notifications)
      } else {
        setError('Failed to load notifications')
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const result = await firebaseHelpers.getUnreadNotificationCount(user.uid)
      if (result.success) {
        setUnreadCount(result.count)
      }
    } catch (err) {
      console.error('Error fetching unread count:', err)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      console.log('🔔 markAsRead called with notificationId:', notificationId);
      console.log('🔔 notificationId type:', typeof notificationId);
      console.log('🔔 notificationId value:', notificationId);
      
      if (!notificationId) {
        console.error('❌ No notification ID provided to markAsRead');
        return;
      }
      
      const result = await firebaseHelpers.markNotificationAsRead(notificationId)
      if (result.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, read: true, readAt: new Date() }
              : notif
          )
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      setMarkingAsRead(true)
      const result = await firebaseHelpers.markAllNotificationsAsRead(user.uid)
      if (result.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true, readAt: new Date() }))
        )
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    } finally {
      setMarkingAsRead(false)
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      console.log('🔔 deleteNotification called with notificationId:', notificationId);
      console.log('🔔 notificationId type:', typeof notificationId);
      console.log('🔔 notificationId value:', notificationId);
      
      if (!notificationId) {
        console.error('❌ No notification ID provided to deleteNotification');
        return;
      }
      
      const result = await firebaseHelpers.deleteNotification(notificationId)
      if (result.success) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
        // Check if the deleted notification was unread
        const deletedNotif = notifications.find(notif => notif.id === notificationId)
        if (deletedNotif && !deletedNotif.read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="h-5 w-5 text-red-500" />
      case 'comment':
        return <MessageCircle className="h-5 w-5 text-blue-500" />
      case 'follow':
        return <UserPlus className="h-5 w-5 text-green-500" />
      case 'download':
        return <Download className="h-5 w-5 text-purple-500" />
      case 'view':
        return <Eye className="h-5 w-5 text-orange-500" />
      case 'view_milestone':
        return <Eye className="h-5 w-5 text-yellow-500" />
      case 'collection_add':
        return <FolderPlus className="h-5 w-5 text-indigo-500" />
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-600" />
      case 'featured':
        return <Star className="h-5 w-5 text-yellow-500" />
      case 'review':
        return <Star className="h-5 w-5 text-yellow-500" />
      case 'share':
        return <Share className="h-5 w-5 text-blue-500" />
      case 'tip':
        return <DollarSign className="h-5 w-5 text-green-600" />
      case 'collaboration':
        return <Users className="h-5 w-5 text-purple-500" />
      case 'system':
        return <Settings className="h-5 w-5 text-gray-500" />
      case 'security':
        return <Shield className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationMessage = (notification) => {
    const { type, actorName, actorId, modelTitle, modelId, collectionName, collectionId, milestone } = notification
    
    switch (type) {
      case 'like':
        return (
          <>
            <Link 
              to={`/profile/${actorId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {actorName}
            </Link>
            {' '}liked your model{' '}
            <Link 
              to={`/model/${modelId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {modelTitle}
            </Link>
          </>
        )
      case 'comment':
        return (
          <>
            <Link 
              to={`/profile/${actorId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {actorName}
            </Link>
            {' '}commented on your model{' '}
            <Link 
              to={`/model/${modelId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {modelTitle}
            </Link>
          </>
        )
      case 'follow':
        return (
          <>
            <Link 
              to={`/profile/${actorId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {actorName}
            </Link>
            {' '}started following you
          </>
        )
      case 'download':
        return (
          <>
            <Link 
              to={`/profile/${actorId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {actorName}
            </Link>
            {' '}downloaded your model{' '}
            <Link 
              to={`/model/${modelId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {modelTitle}
            </Link>
          </>
        )
      case 'view_milestone':
        return (
          <>
            Your model{' '}
            <Link 
              to={`/model/${modelId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {modelTitle}
            </Link>
            {' '}reached {milestone?.toLocaleString()} views! 🎉
          </>
        )
      case 'collection_add':
        return (
          <>
            <Link 
              to={`/profile/${actorId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {actorName}
            </Link>
            {' '}added your model{' '}
            <Link 
              to={`/model/${modelId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {modelTitle}
            </Link>
            {' '}to their collection{' '}
            <Link 
              to={`/collection/${collectionId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {collectionName}
            </Link>
          </>
        )
      case 'achievement':
        return (
          <>
            <span className="font-medium text-yellow-600 dark:text-yellow-400">
              {notification.message}
            </span>
          </>
        )
      case 'featured':
        return (
          <>
            Your model{' '}
            <Link 
              to={`/model/${modelId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {modelTitle}
            </Link>
            {' '}is now featured on our homepage! ⭐
          </>
        )
      case 'review':
        return (
          <>
            <Link 
              to={`/profile/${actorId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {actorName}
            </Link>
            {' '}reviewed your model{' '}
            <Link 
              to={`/model/${modelId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {modelTitle}
            </Link>
          </>
        )
      case 'share':
        return (
          <>
            <Link 
              to={`/profile/${actorId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {actorName}
            </Link>
            {' '}shared your model{' '}
            <Link 
              to={`/model/${modelId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {modelTitle}
            </Link>
          </>
        )
      case 'tip':
        return (
          <>
            <Link 
              to={`/profile/${actorId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {actorName}
            </Link>
            {' '}sent you a tip for your model{' '}
            <Link 
              to={`/model/${modelId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {modelTitle}
            </Link>
          </>
        )
      case 'collaboration':
        return (
          <>
            <Link 
              to={`/profile/${actorId}`} 
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {actorName}
            </Link>
            {' '}wants to collaborate with you
          </>
        )
      case 'system':
        return (
          <>
            <span className="font-medium text-gray-600 dark:text-gray-400">
              {notification.message}
            </span>
          </>
        )
      case 'security':
        return (
          <>
            <span className="font-medium text-red-600 dark:text-red-400">
              {notification.message}
            </span>
          </>
        )
      default:
        return notification.message || 'You have a new notification'
    }
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></Loader2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading notifications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error Loading Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={fetchNotifications}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-luxury-bg-primary dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
            </div>
            
            <Link to="/settings/notifications">
              <Button variant="outline" className="h-9 px-4 inline-flex items-center"><Cog className="h-4 w-4 mr-2" />Settings</Button>
            </Link>
            
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} disabled={markingAsRead} className="h-9 px-4 inline-flex items-center">
                {markingAsRead ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4 mr-2" />
                )}
                Mark All Read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No notifications yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              You'll see notifications here when people interact with your content
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => {
              console.log('🔔 Rendering notification:', {
                id: notification.id,
                type: notification.type,
                message: notification.message,
                read: notification.read
              });
              
              return (
              <div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all duration-200 ${
                  !notification.read 
                    ? 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    {/* Actor Avatar */}
                    {notification.actorAvatar && (
                      <img 
                        src={notification.actorAvatar} 
                        alt={notification.actorName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    
                    {/* Model Thumbnail */}
                    {notification.modelThumbnail && (
                      <img 
                        src={notification.modelThumbnail} 
                        alt={notification.modelTitle}
                        className="h-8 w-8 rounded object-cover"
                      />
                    )}
                    
                    {/* Notification Icon */}
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {getNotificationMessage(notification)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            variant="ghost"
                            className="p-1 h-auto text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => deleteNotification(notification.id)}
                          variant="ghost"
                          className="p-1 h-auto text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Delete notification"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications

