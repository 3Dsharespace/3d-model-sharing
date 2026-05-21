import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import firebaseHelpers from '../lib/firebase'
import PageMeta from '../components/PageMeta'
import { Button } from '../components/ui/Button'
import { Search, User, Trophy, Upload, Download, Heart, Eye, Users } from 'lucide-react'

const PLATFORM_ACCOUNT_EMAILS = ['threedsharespace@gmail.com']
const PLATFORM_ACCOUNT_IDS = ['Bit2fGqznKheFgEg2dTEPCIIKw32']

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

const getUserId = (user) => user.uid || user.id

const getModelOwnerId = (model) => model.userId || model.user_id || model.ownerId

const getDateValue = (value) => {
  if (!value) return 0
  if (typeof value?.toDate === 'function') return value.toDate().getTime()
  const time = new Date(value).getTime()
  return Number.isFinite(time) ? time : 0
}

const calculateCreatorScore = (creator, creatorModels) => {
  const publishedModels = creatorModels.filter((model) => {
    const isPrivate = model.is_private === true || model.isPublic === false
    const status = model.status || 'published'
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
    return rankedCreators.filter(u => {
      const username = (u.username || '').toLowerCase()
      const displayName = (u.displayName || '').toLowerCase()
      const email = (u.email || '').toLowerCase()
      return username.includes(q) || displayName.includes(q) || email.includes(q)
    })
  }, [rankedCreators, query])

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <PageMeta
        title="Creators – 3D ShareSpace"
        description="Search creators and view their uploaded 3D models."
        url="/creators"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Creators</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Ranked by uploads, downloads, likes, views, followers, verification, and recent activity.
            </p>
          </div>

          <div className="flex items-center gap-3 border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-950 px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by username, name, or email…"
              className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-200 placeholder:text-gray-500"
            />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {loading ? 'Loading…' : `${filtered.length} result(s)`}
            </div>
          </div>

          {error && (
            <div className="border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm dark:border-red-700/50 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              No users found.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((u, index) => {
              const id = u.uid || u.id
              const title = u.displayName || u.username || (u.email ? u.email.split('@')[0] : 'User')
              const subtitle = u.username ? `@${u.username}` : (u.email || '')
              const stats = u.creatorRankStats
              return (
                <div
                  key={id}
                  className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-950 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {u.avatar ? (
                        <img src={u.avatar} alt={title} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{title}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{subtitle}</div>
                    </div>
                    <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-800 px-2 py-1 text-xs font-semibold text-gray-900 dark:text-white">
                      <Trophy className="w-3 h-3" />
                      #{index + 1}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="border border-gray-200 dark:border-gray-800 p-2">
                      <div className="flex items-center gap-1 text-gray-900 dark:text-white"><Upload className="w-3 h-3" /> {stats.modelCount}</div>
                      <div>models</div>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-800 p-2">
                      <div className="flex items-center gap-1 text-gray-900 dark:text-white"><Download className="w-3 h-3" /> {stats.downloads}</div>
                      <div>downloads</div>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-800 p-2">
                      <div className="flex items-center gap-1 text-gray-900 dark:text-white"><Heart className="w-3 h-3" /> {stats.likes}</div>
                      <div>likes</div>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-800 p-2">
                      <div className="flex items-center gap-1 text-gray-900 dark:text-white"><Eye className="w-3 h-3" /> {stats.views}</div>
                      <div>views</div>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-800 p-2">
                      <div className="flex items-center gap-1 text-gray-900 dark:text-white"><Users className="w-3 h-3" /> {stats.followers}</div>
                      <div>followers</div>
                    </div>
                    <div className="border border-gray-200 dark:border-gray-800 p-2">
                      <div className="text-gray-900 dark:text-white">{stats.score}</div>
                      <div>score</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <Link to={`/profile/${encodeURIComponent(id)}`} className="flex-1">
                      <Button className="w-full" variant="outline">
                        View profile
                      </Button>
                    </Link>
                    {id && (
                      <Link to={`/store/${encodeURIComponent(id)}`} className="flex-1">
                        <Button className="w-full" variant="outline">
                          Storefront
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Creators

