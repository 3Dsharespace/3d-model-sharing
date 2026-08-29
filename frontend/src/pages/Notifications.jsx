import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell,
  Check,
  CheckCheck,
  Cog,
  DollarSign,
  Download,
  Eye,
  ExternalLink,
  FolderPlus,
  Heart,
  Loader2,
  MessageCircle,
  Settings,
  Share,
  Shield,
  Star,
  Trash2,
  Trophy,
  UserPlus,
  Users
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { Button } from '../components/ui/Button'

const notificationIconClass = 'h-4 w-4 text-neutral-400'

const Notifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [markingAsRead, setMarkingAsRead] = useState(false)
  const [conversations, setConversations] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectMode, setSelectMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [messageSummary, setMessageSummary] = useState({
    conversations: 0,
    unread: 0,
    latest: ''
  })

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    fetchNotifications()
    fetchUnreadCount()
  }, [user])

  useEffect(() => {
    if (!user) return undefined

    return firebaseHelpers.subscribeToConversations(user.uid, (result) => {
      if (!result.success) return

      const conversations = result.conversations || []
      setConversations(conversations)
      const unread = conversations.reduce((total, conversation) => {
        return total + Number(conversation.unreadCounts?.[user.uid] || 0)
      }, 0)
      const latest = conversations[0]?.lastMessage || ''

      setMessageSummary({
        conversations: conversations.length,
        unread,
        latest
      })
    })
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
      if (result.success) setUnreadCount(result.count)
    } catch (err) {
      console.error('Error fetching unread count:', err)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      if (!notificationId) return

      const result = await firebaseHelpers.markNotificationAsRead(notificationId)
      if (result.success) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true, readAt: new Date() }
              : notification
          )
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
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
        setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true, readAt: new Date() })))
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    } finally {
      setMarkingAsRead(false)
    }
  }

  const clearReadNotifications = async () => {
    const readNotifications = notifications.filter((notification) => notification.read)

    for (const notification of readNotifications) {
      await deleteNotification(notification.id)
    }
  }

  const deleteSelectedNotifications = async () => {
    for (const notificationId of selectedIds) {
      await deleteNotification(notificationId)
    }

    setSelectedIds([])
    setSelectMode(false)
  }

  const deleteNotification = async (notificationId) => {
    try {
      if (!notificationId) return

      const result = await firebaseHelpers.deleteNotification(notificationId)
      if (result.success) {
        const deletedNotification = notifications.find((notification) => notification.id === notificationId)
        setNotifications((prev) => prev.filter((notification) => notification.id !== notificationId))
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1))
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className={notificationIconClass} />
      case 'comment':
      case 'message':
        return <MessageCircle className={notificationIconClass} />
      case 'follow':
        return <UserPlus className={notificationIconClass} />
      case 'download':
        return <Download className={notificationIconClass} />
      case 'view':
      case 'view_milestone':
        return <Eye className={notificationIconClass} />
      case 'collection_add':
        return <FolderPlus className={notificationIconClass} />
      case 'achievement':
        return <Trophy className={notificationIconClass} />
      case 'featured':
      case 'review':
        return <Star className={notificationIconClass} />
      case 'share':
        return <Share className={notificationIconClass} />
      case 'tip':
        return <DollarSign className={notificationIconClass} />
      case 'collaboration':
        return <Users className={notificationIconClass} />
      case 'system':
        return <Settings className={notificationIconClass} />
      case 'security':
        return <Shield className={notificationIconClass} />
      default:
        return <Bell className={notificationIconClass} />
    }
  }

  const modelLink = (modelId, children) => (
    <Link to={`/model/${modelId}`} className="studio-inline-link">
      {children}
    </Link>
  )

  const profileLink = (actorId, children) => (
    <Link to={`/profile/${actorId}`} className="studio-inline-link">
      {children}
    </Link>
  )

  const getNotificationMessage = (notification) => {
    const { type, actorName, actorId, modelTitle, modelId, collectionName, collectionId, milestone } = notification

    switch (type) {
      case 'like':
        return <>{profileLink(actorId, actorName)} liked your model {modelLink(modelId, modelTitle)}</>
      case 'comment':
        return <>{profileLink(actorId, actorName)} commented on your model {modelLink(modelId, modelTitle)}</>
      case 'message':
        return <>{profileLink(actorId, actorName || 'A creator')} sent you a message</>
      case 'follow':
        return <>{profileLink(actorId, actorName)} started following you</>
      case 'download':
        return <>{profileLink(actorId, actorName)} downloaded your model {modelLink(modelId, modelTitle)}</>
      case 'view_milestone':
        return <>Your model {modelLink(modelId, modelTitle)} reached {milestone?.toLocaleString()} views.</>
      case 'collection_add':
        return (
          <>
            {profileLink(actorId, actorName)} added your model {modelLink(modelId, modelTitle)} to their collection{' '}
            <Link to={`/collection/${collectionId}`} className="studio-inline-link">{collectionName}</Link>
          </>
        )
      case 'achievement':
      case 'system':
      case 'security':
        return <>{notification.message}</>
      case 'featured':
        return <>Your model {modelLink(modelId, modelTitle)} is now featured.</>
      case 'review':
        return <>{profileLink(actorId, actorName)} reviewed your model {modelLink(modelId, modelTitle)}</>
      case 'share':
        return <>{profileLink(actorId, actorName)} shared your model {modelLink(modelId, modelTitle)}</>
      case 'tip':
        return <>{profileLink(actorId, actorName)} sent you a tip for your model {modelLink(modelId, modelTitle)}</>
      case 'collaboration':
        return <>{profileLink(actorId, actorName)} wants to collaborate with you</>
      default:
        return notification.message || 'You have a new notification'
    }
  }

  const formatTimeAgo = (value) => {
    const date = value?.toDate ? value.toDate() : new Date(value)
    const diffInSeconds = Math.floor((new Date() - date) / 1000)

    if (!Number.isFinite(diffInSeconds)) return ''
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString()
  }

  const getTimestamp = (value) => {
    const date = value?.toDate ? value.toDate() : new Date(value)
    const time = date.getTime()
    return Number.isFinite(time) ? time : 0
  }

  const getNotificationCategory = (type) => {
    if (type === 'message') return 'messages'
    if (type === 'download') return 'downloads'
    if (type === 'like') return 'likes'
    if (type === 'comment' || type === 'review') return 'comments'
    if (type === 'tip') return 'tips'
    if (type === 'system' || type === 'security' || type === 'achievement') return 'system'
    return 'activity'
  }

  const getNotificationLabel = (notification) => {
    const labels = {
      like: 'Like',
      comment: 'Comment',
      message: 'Message',
      follow: 'Follow',
      download: 'Download',
      view_milestone: 'Views',
      collection_add: 'Collection',
      achievement: 'Achievement',
      featured: 'Featured',
      review: 'Review',
      share: 'Share',
      tip: 'Tip',
      collaboration: 'Collaboration',
      system: 'System',
      security: 'Security'
    }

    return labels[notification.type] || 'Activity'
  }

  const getNotificationAction = (notification) => {
    if (notification.type === 'message') return { label: 'Reply', to: notification.actionUrl || '/messages' }
    if (notification.modelId) return { label: 'View model', to: `/model/${notification.modelId}` }
    if (notification.actorId) return { label: 'View profile', to: `/profile/${notification.actorId}` }
    if (notification.actionUrl) return { label: 'Open', to: notification.actionUrl }
    return null
  }

  const getSectionName = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const weekStart = todayStart - (6 * 24 * 60 * 60 * 1000)

    if (timestamp >= todayStart) return 'Today'
    if (timestamp >= weekStart) return 'This week'
    return 'Older'
  }

  const getConversationPeer = (conversation) => {
    const peerId = conversation.participants?.find((participantId) => participantId !== user.uid)

    return {
      id: peerId,
      name: conversation.participantNames?.[peerId] || 'Creator',
      avatar: conversation.participantAvatars?.[peerId] || null,
      unread: Number(conversation.unreadCounts?.[user.uid] || 0)
    }
  }

  const filterOptions = useMemo(() => {
    const counts = notifications.reduce((acc, notification) => {
      const category = getNotificationCategory(notification.type)
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})

    return [
      { id: 'all', label: 'All', count: notifications.length },
      { id: 'unread', label: 'Unread', count: notifications.filter((notification) => !notification.read).length },
      { id: 'messages', label: 'Messages', count: counts.messages || 0 },
      { id: 'downloads', label: 'Downloads', count: counts.downloads || 0 },
      { id: 'likes', label: 'Likes', count: counts.likes || 0 },
      { id: 'comments', label: 'Comments', count: counts.comments || 0 },
      { id: 'tips', label: 'Tips', count: counts.tips || 0 },
      { id: 'system', label: 'System', count: counts.system || 0 }
    ]
  }, [notifications])

  const groupedSections = useMemo(() => {
    const filtered = notifications
      .filter((notification) => {
        if (activeFilter === 'all') return true
        if (activeFilter === 'unread') return !notification.read
        return getNotificationCategory(notification.type) === activeFilter
      })
      .sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt))

    const groups = []
    const groupMap = new Map()

    filtered.forEach((notification) => {
      const groupKey = [
        notification.type,
        notification.actorId || notification.actorName || 'system',
        notification.modelId || notification.modelTitle || '',
        notification.collectionId || ''
      ].join('|')

      const shouldGroup = ['download', 'like', 'comment', 'message'].includes(notification.type)
      const key = shouldGroup ? groupKey : notification.id
      const existing = groupMap.get(key)

      if (existing) {
        existing.count += 1
        existing.ids.push(notification.id)
        existing.read = existing.read && notification.read
        existing.latestTime = Math.max(existing.latestTime, getTimestamp(notification.createdAt))
        return
      }

      const group = {
        id: key,
        notification,
        count: 1,
        ids: [notification.id],
        read: Boolean(notification.read),
        latestTime: getTimestamp(notification.createdAt)
      }

      groupMap.set(key, group)
      groups.push(group)
    })

    return groups
      .sort((a, b) => b.latestTime - a.latestTime)
      .reduce((sections, group) => {
        const sectionName = getSectionName(group.latestTime)
        if (!sections[sectionName]) sections[sectionName] = []
        sections[sectionName].push(group)
        return sections
      }, {})
  }, [activeFilter, notifications])

  const selectedCount = selectedIds.length
  const visibleGroups = Object.values(groupedSections).flat()
  const readCount = notifications.filter((notification) => notification.read).length

  const toggleSelectedGroup = (group) => {
    setSelectedIds((current) => {
      const allSelected = group.ids.every((id) => current.includes(id))

      if (allSelected) {
        return current.filter((id) => !group.ids.includes(id))
      }

      return Array.from(new Set([...current, ...group.ids]))
    })
  }

  const markGroupAsRead = async (group) => {
    for (const notificationId of group.ids) {
      await markAsRead(notificationId)
    }
  }

  const deleteGroupNotifications = async (group) => {
    for (const notificationId of group.ids) {
      await deleteNotification(notificationId)
    }
  }

  if (loading) {
    return (
      <div className="studio-page notifications-page">
        <div className="studio-page__inner">
          <div className="studio-empty">
            <Loader2 className="mx-auto animate-spin" size={30} />
            <p>Loading notifications...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="studio-page notifications-page">
        <div className="studio-page__inner">
          <div className="studio-empty">
            <h1>Error loading notifications</h1>
            <p>{error}</p>
            <Button onClick={fetchNotifications}>Try again</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="studio-page notifications-page">
        <div className="studio-page__inner">
          <div className="studio-empty">
            <Bell className="mx-auto" size={34} />
            <h1>Sign in to view notifications</h1>
            <p>Messages and account notifications are only available for signed-in creator accounts.</p>
            <div className="studio-empty__actions">
              <Link to="/login" className="studio-button studio-button--primary">Log in</Link>
              <Link to="/signup" className="studio-button studio-button--secondary">Create account</Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="studio-page notifications-page">
      <div className="studio-page__inner">
        <div className="studio-page__header">
          <div>
            <p className="studio-kicker">Account</p>
            <h1>Activity inbox</h1>
            <p>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All activity is read'}
              {messageSummary.unread > 0 ? ` · ${messageSummary.unread} unread message${messageSummary.unread === 1 ? '' : 's'}` : ''}
            </p>
          </div>
          <div className="studio-header-actions">
            <Link to="/settings/notifications" className="studio-button studio-button--secondary">
              <Cog size={14} /> Settings
            </Link>
            <button type="button" onClick={() => setSelectMode((enabled) => !enabled)} className="studio-button studio-button--secondary">
              {selectMode ? 'Cancel select' : 'Select'}
            </button>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} disabled={markingAsRead} className="studio-button studio-button--primary">
                {markingAsRead ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCheck className="h-4 w-4" />}
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <section className="activity-command-bar" aria-label="Activity filters">
          <div className="activity-filter-tabs">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                type="button"
                className={activeFilter === filter.id ? 'is-active' : ''}
                onClick={() => setActiveFilter(filter.id)}
              >
                <span>{filter.label}</span>
                <em>{filter.count}</em>
              </button>
            ))}
          </div>

          <div className="activity-bulk-actions">
            {selectMode && (
              <button type="button" disabled={selectedCount === 0} onClick={deleteSelectedNotifications}>
                Delete selected {selectedCount > 0 ? `(${selectedCount})` : ''}
              </button>
            )}
            <button type="button" disabled={readCount === 0} onClick={clearReadNotifications}>
              Clear read
            </button>
          </div>
        </section>

        <section className="activity-summary-grid" aria-label="Activity summary">
          <div className="activity-summary-card">
            <span className="notification-overview-card__icon">
              <Bell size={18} />
            </span>
            <span>
              <strong>Account activity</strong>
              <small>{unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}</small>
              <em>Likes, downloads, comments, follows, tips, and system updates.</em>
            </span>
          </div>
          <div className="activity-summary-card">
            <span className="notification-overview-card__icon">
              <MessageCircle size={18} />
            </span>
            <span>
              <strong>Messages</strong>
              <small>
                {messageSummary.unread > 0
                  ? `${messageSummary.unread} unread`
                  : `${messageSummary.conversations} conversation${messageSummary.conversations === 1 ? '' : 's'}`}
              </small>
              <em>{messageSummary.latest || 'Creator conversations appear here.'}</em>
            </span>
          </div>
        </section>

        {conversations.length > 0 && (
        <section className="notification-message-panel" aria-label="Messages">
          <div className="notification-message-panel__header">
            <div>
              <p className="studio-kicker">Messages</p>
              <h2>Recent conversations</h2>
              <p>
                {messageSummary.unread > 0
                  ? `${messageSummary.unread} unread message${messageSummary.unread === 1 ? '' : 's'}`
                  : `${messageSummary.conversations} conversation${messageSummary.conversations === 1 ? '' : 's'}`}
              </p>
            </div>
            <Link to="/messages" className="studio-button studio-button--secondary">Open inbox</Link>
          </div>

          {conversations.length === 0 ? (
            <div className="notification-message-empty">
              <MessageCircle size={18} />
              <span>No messages yet</span>
            </div>
          ) : (
            <div className="notification-message-list">
              {conversations.slice(0, 4).map((conversation) => {
                const peer = getConversationPeer(conversation)

                return (
                  <Link
                    key={conversation.id}
                    to={`/messages?conversation=${conversation.id}`}
                    className={`notification-message-row ${peer.unread > 0 ? 'is-unread' : ''}`}
                  >
                    <span className="notification-message-row__avatar">
                      {peer.avatar ? <img src={peer.avatar} alt="" /> : peer.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="notification-message-row__body">
                      <strong>{peer.name}</strong>
                      <small>{conversation.lastMessage || 'Open conversation'}</small>
                    </span>
                    <span className="notification-message-row__meta">
                      {peer.unread > 0 && <em>{peer.unread}</em>}
                      <small>{formatTimeAgo(conversation.lastMessageAt || conversation.updatedAt)}</small>
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
        )}

        {visibleGroups.length === 0 ? (
          <div className="studio-empty">
            <Bell className="mx-auto" size={34} />
            <h3>No activity in this view</h3>
            <p>Try another filter or check back when new model activity arrives.</p>
          </div>
        ) : (
          <div className="activity-section-stack">
            {['Today', 'This week', 'Older'].map((sectionName) => {
              const sectionGroups = groupedSections[sectionName] || []
              if (sectionGroups.length === 0) return null

              return (
                <section key={sectionName} className="activity-section">
                  <div className="activity-section__header">
                    <h2>{sectionName}</h2>
                    <span>{sectionGroups.length} item{sectionGroups.length === 1 ? '' : 's'}</span>
                  </div>
                  <div className="notification-list">
                    {sectionGroups.map((group) => {
                      const notification = group.notification
                      const action = getNotificationAction(notification)
                      const selected = group.ids.some((id) => selectedIds.includes(id))

                      return (
                        <article key={group.id} className={`notification-card ${selectMode ? 'has-select' : ''} ${!group.read ? 'is-unread' : ''}`}>
                          {selectMode && (
                            <label className="notification-card__select">
                              <input type="checkbox" checked={selected} onChange={() => toggleSelectedGroup(group)} />
                            </label>
                          )}

                          <div className="notification-card__media">
                            {notification.actorAvatar && <img src={notification.actorAvatar} alt={notification.actorName || 'User'} />}
                            {notification.modelThumbnail && <img src={notification.modelThumbnail} alt={notification.modelTitle || 'Model'} />}
                            <span>{getNotificationIcon(notification.type)}</span>
                          </div>

                          <div className="notification-card__body">
                            <div className="notification-card__meta-row">
                              <span>{getNotificationLabel(notification)}</span>
                              {!group.read && <em>Unread</em>}
                              {group.count > 1 && <em>{group.count} times</em>}
                            </div>
                            <p>{getNotificationMessage(notification)}</p>
                            <span>{formatTimeAgo(notification.createdAt)}</span>
                          </div>

                          <div className="notification-card__actions">
                            {action && (
                              <Link to={action.to} title={action.label}>
                                <ExternalLink size={14} />
                              </Link>
                            )}
                            {!group.read && (
                              <button onClick={() => markGroupAsRead(group)} title="Mark as read">
                                <Check size={14} />
                              </button>
                            )}
                            <button onClick={() => deleteGroupNotifications(group)} title="Delete notification">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications
