import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Loader2, MessageCircle, Search, Send } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'

const getUserName = (profile = {}, fallback = 'Creator') => (
  profile.displayName || profile.username || profile.email || fallback
)

const getUserAvatar = (profile = {}) => profile.avatar || profile.photoURL || profile.photo || null

const formatMessageTime = (value) => {
  if (!value) return ''
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

const formatConversationTime = (value) => {
  if (!value) return ''
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const diff = Date.now() - date.getTime()
  if (diff < 60 * 1000) return 'Now'
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m`
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const resolveOtherUserId = (conversation, currentUserId) => (
  (conversation?.participants || []).find((id) => id !== currentUserId) || ''
)

export default function Messages() {
  const { user, profile } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [people, setPeople] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState(searchParams.get('conversation') || '')
  const [selectedRecipient, setSelectedRecipient] = useState(null)
  const [peopleQuery, setPeopleQuery] = useState('')
  const [messageText, setMessageText] = useState('')
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const threadEndRef = useRef(null)

  useEffect(() => {
    if (!user) {
      setLoadingConversations(false)
      return undefined
    }

    setLoadingConversations(true)
    const unsubscribe = firebaseHelpers.subscribeToConversations(user.uid, (result) => {
      setLoadingConversations(false)
      if (result.success) {
        setConversations(result.conversations || [])
      } else {
        setError(result.error || 'Could not load messages')
      }
    })

    return unsubscribe
  }, [user])

  useEffect(() => {
    if (!user) return

    let active = true
    firebaseHelpers.getUsers({ limit: 120 }).then((result) => {
      if (!active) return
      setPeople((result.success ? result.users : []).filter((item) => item.uid !== user.uid))
    })

    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    const directRecipientId = searchParams.get('to')
    const directConversationId = searchParams.get('conversation')

    if (directConversationId) {
      setSelectedConversationId(directConversationId)
      return
    }

    if (!directRecipientId || directRecipientId === user.uid) return

    let active = true
    const conversationId = firebaseHelpers.getConversationId(user.uid, directRecipientId)
    setSelectedConversationId(conversationId)

    firebaseHelpers.getUserProfile(directRecipientId).then((result) => {
      if (!active) return
      setSelectedRecipient({
        uid: directRecipientId,
        ...(result.success ? result.profile : {}),
        id: directRecipientId
      })
    })

    return () => {
      active = false
    }
  }, [searchParams, user])

  useEffect(() => {
    if (!user || !selectedConversationId) {
      setMessages([])
      return undefined
    }

    setLoadingMessages(true)
    const unsubscribe = firebaseHelpers.subscribeToMessages(selectedConversationId, (result) => {
      setLoadingMessages(false)
      if (result.success) {
        setMessages(result.messages || [])
        firebaseHelpers.markConversationRead({ conversationId: selectedConversationId, userId: user.uid }).catch(() => {})
      } else {
        setError(result.error || 'Could not load the thread')
      }
    })

    return unsubscribe
  }, [selectedConversationId, user])

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, selectedConversationId])

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId),
    [conversations, selectedConversationId]
  )

  const activeRecipient = useMemo(() => {
    if (selectedRecipient) return selectedRecipient
    if (!selectedConversation || !user) return null

    const otherUserId = resolveOtherUserId(selectedConversation, user.uid)
    return {
      uid: otherUserId,
      displayName: selectedConversation.participantNames?.[otherUserId] || 'Creator',
      avatar: selectedConversation.participantAvatars?.[otherUserId] || null
    }
  }, [selectedConversation, selectedRecipient, user])

  const filteredPeople = useMemo(() => {
    const query = peopleQuery.trim().toLowerCase()
    if (!query) return people.slice(0, 8)

    return people.filter((person) => {
      const haystack = [
        person.displayName,
        person.username,
        person.email
      ].filter(Boolean).join(' ').toLowerCase()

      return haystack.includes(query)
    }).slice(0, 8)
  }, [people, peopleQuery])

  const selectConversation = (conversation) => {
    const otherUserId = resolveOtherUserId(conversation, user.uid)
    setSelectedConversationId(conversation.id)
    setSelectedRecipient({
      uid: otherUserId,
      displayName: conversation.participantNames?.[otherUserId] || 'Creator',
      avatar: conversation.participantAvatars?.[otherUserId] || null
    })
    setSearchParams({ conversation: conversation.id })
  }

  const selectPerson = (person) => {
    const recipientId = person.uid || person.id
    const conversationId = firebaseHelpers.getConversationId(user.uid, recipientId)
    setSelectedConversationId(conversationId)
    setSelectedRecipient({ ...person, uid: recipientId })
    setSearchParams({ to: recipientId })
    setPeopleQuery('')
  }

  const sendMessage = async (event) => {
    event.preventDefault()
    if (!user || !activeRecipient || sending) return

    setSending(true)
    setError('')

    const result = await firebaseHelpers.sendChatMessage({
      senderId: user.uid,
      recipientId: activeRecipient.uid || activeRecipient.id,
      text: messageText
    })

    if (result.success) {
      setMessageText('')
      setSelectedConversationId(result.conversationId)
      setSearchParams({ conversation: result.conversationId })
    } else {
      setError(result.error || 'Message could not be sent')
    }

    setSending(false)
  }

  if (!user) {
    return (
      <main className="studio-page messages-page">
        <div className="studio-container">
          <section className="studio-empty messages-auth">
            <MessageCircle size={34} />
            <h1>Sign in to message creators</h1>
            <p>Messages are available for signed-in 3D ShareSpace accounts.</p>
            <Link to="/login" className="studio-primary-button mt-5">Log in</Link>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="studio-page messages-page">
      <div className="studio-container">
        <section className="messages-shell">
          <aside className="messages-sidebar">
            <div className="messages-panel-header">
              <div>
                <p className="studio-kicker">Account</p>
                <h1>Messages</h1>
              </div>
              {loadingConversations && <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />}
            </div>

            <label className="messages-search">
              <Search size={15} />
              <input
                value={peopleQuery}
                onChange={(event) => setPeopleQuery(event.target.value)}
                placeholder="Find a creator"
              />
            </label>

            {peopleQuery.trim() && (
              <div className="messages-people-results">
                {filteredPeople.length === 0 ? (
                  <p>No creators found.</p>
                ) : filteredPeople.map((person) => (
                  <button key={person.uid || person.id} type="button" onClick={() => selectPerson(person)}>
                    <span className="messages-avatar">
                      {getUserAvatar(person) ? <img src={getUserAvatar(person)} alt="" /> : getUserName(person).charAt(0)}
                    </span>
                    <span>{getUserName(person)}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="messages-thread-list">
              {conversations.length === 0 && !loadingConversations ? (
                <div className="messages-empty-list">
                  <p>No conversations yet.</p>
                  <span>Open a creator profile and choose Message to start.</span>
                </div>
              ) : conversations.map((conversation) => {
                const otherUserId = resolveOtherUserId(conversation, user.uid)
                const unread = Number(conversation.unreadCounts?.[user.uid] || 0)
                const name = conversation.participantNames?.[otherUserId] || 'Creator'

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    className={conversation.id === selectedConversationId ? 'is-active' : ''}
                    onClick={() => selectConversation(conversation)}
                  >
                    <span className="messages-avatar">
                      {conversation.participantAvatars?.[otherUserId]
                        ? <img src={conversation.participantAvatars[otherUserId]} alt="" />
                        : name.charAt(0)}
                    </span>
                    <span className="messages-thread-preview">
                      <span>
                        <strong>{name}</strong>
                        <time>{formatConversationTime(conversation.lastMessageAt || conversation.updatedAt)}</time>
                      </span>
                      <small>{conversation.lastMessage || 'New conversation'}</small>
                    </span>
                    {unread > 0 && <em>{unread}</em>}
                  </button>
                )
              })}
            </div>
          </aside>

          <section className="messages-thread">
            {activeRecipient ? (
              <>
                <header className="messages-thread-header">
                  <div className="messages-recipient">
                    <span className="messages-avatar messages-avatar--large">
                      {getUserAvatar(activeRecipient)
                        ? <img src={getUserAvatar(activeRecipient)} alt="" />
                        : getUserName(activeRecipient).charAt(0)}
                    </span>
                    <div>
                      <h2>{getUserName(activeRecipient)}</h2>
                      <Link to={`/profile/${activeRecipient.uid || activeRecipient.id}`}>View profile</Link>
                    </div>
                  </div>
                  <p>Private creator conversation</p>
                </header>

                <div className="messages-body">
                  {loadingMessages ? (
                    <div className="messages-loading">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading thread</span>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="messages-empty-thread">
                      <MessageCircle size={28} />
                      <h3>Start the conversation</h3>
                      <p>Ask about file details, licensing, missing previews, or project usage.</p>
                    </div>
                  ) : messages.map((message) => {
                    const isMine = message.senderId === user.uid
                    const senderProfile = isMine ? profile : activeRecipient

                    return (
                      <article key={message.id} className={`message-bubble ${isMine ? 'is-mine' : ''}`}>
                        <span className="messages-avatar">
                          {getUserAvatar(senderProfile)
                            ? <img src={getUserAvatar(senderProfile)} alt="" />
                            : getUserName(senderProfile, isMine ? 'You' : 'Creator').charAt(0)}
                        </span>
                        <div>
                          <p>{message.text}</p>
                          <time>{formatMessageTime(message.createdAt)}</time>
                        </div>
                      </article>
                    )
                  })}
                  <div ref={threadEndRef} />
                </div>

                {error && <p className="messages-error">{error}</p>}

                <form className="messages-compose" onSubmit={sendMessage}>
                  <textarea
                    value={messageText}
                    onChange={(event) => setMessageText(event.target.value)}
                    placeholder="Write a message"
                    maxLength={2000}
                    rows={2}
                  />
                  <button type="submit" disabled={sending || !messageText.trim()}>
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send size={15} />}
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="messages-thread-placeholder">
                <MessageCircle size={34} />
                <h2>Select a conversation</h2>
                <p>Choose an existing thread or search for a creator to start a new message.</p>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  )
}
