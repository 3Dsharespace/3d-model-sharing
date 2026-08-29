import React, { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { firebaseHelpers } from '../../lib/firebase'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db } from '../../lib/firebase'

const NotificationDropdown = () => {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const ref = useRef(null)

  // Real-time notification listener
  useEffect(() => {
    if (!user) return

    setLoading(true)
    
    // Create real-time listener for notifications
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('recipientId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      console.log('🔔 Real-time notification update received:', snapshot.size, 'notifications')
      const notifications = []
      let unreadCount = 0

      snapshot.forEach((doc) => {
        const data = doc.data()
        const notification = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt)
        }
        notifications.push(notification)
        if (!notification.read) unreadCount++
        console.log('🔔 Notification:', {
          id: doc.id,
          type: data.type,
          message: data.message,
          read: data.read,
          recipientId: data.recipientId
        })
      })

      console.log('🔔 Total notifications:', notifications.length, 'Unread:', unreadCount)
      setItems(notifications)
      setUnread(unreadCount)
      setLoading(false)
    }, (error) => {
      console.error('❌ Error listening to notifications:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    
    if (open && typeof document !== 'undefined') {
      try {
        document.addEventListener('mousedown', onClick)
        return () => {
          try {
            document.removeEventListener('mousedown', onClick)
          } catch (error) {
            console.warn('Error removing notification click listener:', error)
          }
        }
      } catch (error) {
        console.warn('Error setting up notification click listener:', error)
      }
    }
  }, [open])

  const markAllRead = async () => {
    if (!user) return
    try {
      await firebaseHelpers.markAllNotificationsRead(user.uid)
      setUnread(0)
      setItems(prev => prev.map(it => ({ ...it, read: true })))
    } catch (e) {}
  }

  const markAsRead = async (notificationId) => {
    try {
      await firebaseHelpers.markNotificationRead(notificationId)
    } catch (e) {
      console.error('Error marking notification as read:', e)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow':
        return '👥'
      case 'like':
        return '❤️'
      case 'comment':
        return '💬'
      case 'download':
        return '⬇️'
      case 'tip':
        return '💰'
      case 'favorite':
        return '⭐'
      case 'view_milestone':
        return '👁️'
      case 'collection_add':
        return '📁'
      case 'achievement':
        return '🏆'
      case 'featured':
        return '⭐'
      case 'review':
        return '⭐'
      case 'share':
        return '📤'
      case 'collaboration':
        return '🤝'
      case 'system':
        return '⚙️'
      case 'security':
        return '🔒'
      default:
        return '🔔'
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'follow':
        return 'text-blue-600'
      case 'like':
        return 'text-red-600'
      case 'comment':
        return 'text-green-600'
      case 'download':
        return 'text-purple-600'
      case 'tip':
        return 'text-yellow-600'
      case 'favorite':
        return 'text-orange-600'
      case 'view_milestone':
        return 'text-yellow-500'
      case 'collection_add':
        return 'text-indigo-600'
      case 'achievement':
        return 'text-yellow-600'
      case 'featured':
        return 'text-yellow-500'
      case 'review':
        return 'text-yellow-500'
      case 'share':
        return 'text-blue-500'
      case 'collaboration':
        return 'text-purple-600'
      case 'system':
        return 'text-gray-600'
      case 'security':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const filteredItems = activeCategory === 'all' 
    ? items 
    : items.filter(item => item.type === activeCategory)

  const categories = [
    { id: 'all', label: 'All', count: items.length },
    { id: 'follow', label: 'Follows', count: items.filter(i => i.type === 'follow').length },
    { id: 'like', label: 'Likes', count: items.filter(i => i.type === 'like').length },
    { id: 'comment', label: 'Comments', count: items.filter(i => i.type === 'comment').length },
    { id: 'download', label: 'Downloads', count: items.filter(i => i.type === 'download').length },
    { id: 'tip', label: 'Tips', count: items.filter(i => i.type === 'tip').length },
    { id: 'view_milestone', label: 'Milestones', count: items.filter(i => i.type === 'view_milestone').length },
    { id: 'achievement', label: 'Achievements', count: items.filter(i => i.type === 'achievement').length },
    { id: 'collection_add', label: 'Collections', count: items.filter(i => i.type === 'collection_add').length }
  ]

  if (!user) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1.5 py-0.5">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 max-h-[500px] overflow-hidden card shadow-2xl z-50 border border-luxury-border-light dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-luxury-border-light dark:border-gray-700 bg-luxury-bg-secondary dark:bg-gray-800">
            <span className="font-semibold text-luxury-text-primary dark:text-white">Notifications</span>
            <button onClick={markAllRead} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Mark all read
            </button>
          </div>

          {/* Categories */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {category.label}
                {category.count > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 rounded-full">
                    {category.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Loading notifications...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🔔</div>
                No {activeCategory === 'all' ? '' : activeCategory} notifications
              </div>
            ) : (
              filteredItems.map((n) => (
                <div 
                  key={n.id} 
                  className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
                    !n.read ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-lg ${getNotificationColor(n.type)}`}>
                      {getNotificationIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                        {n.message || n.type}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown


