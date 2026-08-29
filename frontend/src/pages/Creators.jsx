import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, User } from 'lucide-react'
import firebaseHelpers from '../lib/firebase'
import PageMeta from '../components/PageMeta'

const PLATFORM_ACCOUNT_EMAILS = ['threedsharespace@gmail.com']
const PLATFORM_ACCOUNT_IDS = ['Bit2fGqznKheFgEg2dTEPCIIKw32']

const getUserId = (user) => user.uid || user.id

const isPlatformAccount = (user) => {
  const email = (user?.email || '').toLowerCase()
  const id = getUserId(user)
  const username = (user?.username || '').toLowerCase()
  const displayName = (user?.displayName || '').toLowerCase()

  return PLATFORM_ACCOUNT_EMAILS.includes(email) ||
    PLATFORM_ACCOUNT_IDS.includes(id) ||
    username === 'admin' ||
    displayName === 'admin' ||
    user?.isPlatformAccount === true ||
    user?.isAdmin === true ||
    user?.role === 'admin' ||
    user?.role === 'super_admin'
}

const toNumber = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const getModelOwnerId = (model) => model.userId || model.user_id || model.ownerId

const getDateValue = (value) => {
  if (!value) return 0
  if (typeof value?.toDate === 'function') return value.toDate().getTime()
  const time = new Date(value).getTime()
  return Number.isFinite(time) ? time : 0
}

const calculateCreatorScore = (creator, creatorModels) => {
  const publishedModels = creatorModels.filter((model) => {
    const status = String(model.status || 'published').toLowerCase()
    const isPrivate = model.is_private === true || model.isPublic === false
    return !isPrivate && status !== 'draft' && status !== 'archived' && status !== 'rejected'
  })

  const modelCount = publishedModels.length
  const downloads = publishedModels.reduce((sum, model) => sum + toNumber(model.downloads || model.downloads_count), 0)
  const likes = publishedModels.reduce((sum, model) => sum + toNumber(model.likes || model.likes_count), 0)
  const views = publishedModels.reduce((sum, model) => sum + toNumber(model.views || model.view_count), 0)
  const followers = Array.isArray(creator.followers_list)
    ? creator.followers_list.length
    : toNumber(creator.followersCount || creator.followers)
  const latestUploadAt = Math.max(...publishedModels.map((model) => getDateValue(model.createdAt || model.created_at)), 0)
  const daysSinceUpload = latestUploadAt ? Math.max(0, (Date.now() - latestUploadAt) / 86400000) : 365
  const recencyBoost = Math.max(0, 20 - Math.floor(daysSinceUpload / 7))
  const verifiedBoost = creator.isVerified || creator.verified ? 15 : 0

  const score =
    modelCount * 18 +
    Math.log10(downloads + 1) * 32 +
    Math.log10(likes + 1) * 24 +
    Math.log10(views + 1) * 12 +
    Math.log10(followers + 1) * 20 +
    recencyBoost +
    verifiedBoost

  return {
    score: Math.round(score),
    modelCount,
    downloads,
    likes,
    views,
    followers,
    latestUploadAt
  }
}

const Creators = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [users, setUsers] = useState([])
  const [models, setModels] = useState([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [usersResult, modelsResult] = await Promise.all([
          firebaseHelpers.getUsers(),
          firebaseHelpers.getModels({})
        ])

        if (!usersResult?.success) throw new Error(usersResult?.error || 'Failed to load users')
        if (!modelsResult?.success) throw new Error(modelsResult?.error || 'Failed to load models')

        setUsers(usersResult.users || [])
        setModels(modelsResult.models || [])
      } catch (e) {
        setError(e?.message || 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const rankedCreators = useMemo(() => {
    const modelsByCreator = new Map()

    models.forEach((model) => {
      const ownerId = getModelOwnerId(model)
      if (!ownerId) return
      const existing = modelsByCreator.get(ownerId) || []
      existing.push(model)
      modelsByCreator.set(ownerId, existing)
    })

    return users
      .filter((user) => !isPlatformAccount(user))
      .map((user) => {
        const id = getUserId(user)
        const creatorModels = modelsByCreator.get(id) || []
        const stats = calculateCreatorScore(user, creatorModels)
        return { ...user, creatorRankStats: stats }
      })
      .filter((user) => {
        const stats = user.creatorRankStats
        return stats.modelCount > 0 || user.role === 'creator' || user.isVerified || user.verified
      })
      .sort((a, b) => {
        const scoreDiff = b.creatorRankStats.score - a.creatorRankStats.score
        if (scoreDiff !== 0) return scoreDiff
        const uploadDiff = b.creatorRankStats.latestUploadAt - a.creatorRankStats.latestUploadAt
        if (uploadDiff !== 0) return uploadDiff
        return (a.displayName || a.username || '').localeCompare(b.displayName || b.username || '')
      })
  }, [users, models])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rankedCreators
    return rankedCreators.filter((user) => {
      const username = (user.username || '').toLowerCase()
      const displayName = (user.displayName || '').toLowerCase()
      const email = (user.email || '').toLowerCase()
      return username.includes(q) || displayName.includes(q) || email.includes(q)
    })
  }, [rankedCreators, query])

  return (
    <div className="studio-page creators-page">
      <PageMeta
        title="Creators - 3D ShareSpace"
        description="Search creators and view their uploaded 3D models."
        url="/creators"
      />

      <div className="studio-page__inner">
        <div className="studio-page__header">
          <div>
            <p className="studio-kicker">Creators</p>
            <h1>Creator directory</h1>
            <p>Browse artists and studios publishing public 3D assets.</p>
          </div>
        </div>

        <div className="studio-filter-panel creators-toolbar">
          <label className="studio-search-field">
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by username, name, or email"
            />
          </label>
          <span>{loading ? 'Loading' : `${filtered.length} creators`}</span>
        </div>

        {error && <div className="studio-alert studio-alert--error">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="studio-empty">
            <h2>No creators found</h2>
            <p>Try a different name or username.</p>
          </div>
        )}

        <div className="creators-grid">
          {filtered.map((creator, index) => {
            const id = creator.uid || creator.id
            const title = creator.displayName || creator.username || (creator.email ? creator.email.split('@')[0] : 'User')
            const subtitle = creator.username ? `@${creator.username}` : (creator.email || '')
            const stats = creator.creatorRankStats

            return (
              <article key={id} className="creator-card">
                <div className="creator-card__top">
                  <div className="creator-card__avatar">
                    {creator.avatar ? (
                      <img src={creator.avatar} alt={title} />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="creator-card__identity">
                    <h2>{title}</h2>
                    <p>{subtitle}</p>
                  </div>
                  <span className="creator-card__rank">#{index + 1}</span>
                </div>

                <div className="creator-card__stats">
                  <div><strong>{stats.modelCount}</strong><span>Models</span></div>
                  <div><strong>{stats.downloads}</strong><span>Downloads</span></div>
                  <div><strong>{stats.likes}</strong><span>Likes</span></div>
                  <div><strong>{stats.views}</strong><span>Views</span></div>
                  <div><strong>{stats.followers}</strong><span>Followers</span></div>
                  <div><strong>{stats.score}</strong><span>Score</span></div>
                </div>

                <div className="creator-card__actions">
                  <Link to={`/profile/${encodeURIComponent(id)}`}>View profile</Link>
                  {id && <Link to={`/store/${encodeURIComponent(id)}`}>Storefront</Link>}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Creators
