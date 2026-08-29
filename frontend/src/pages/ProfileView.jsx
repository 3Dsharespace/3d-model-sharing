import React, { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  Calendar,
  Download,
  ExternalLink,
  Heart,
  Loader2,
  Mail,
  MessageCircle,
  MapPin,
  Settings,
  UserPlus,
  UserMinus,
  Users
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { getModelUrl } from '../lib/modelLinks'
import ModelCard from '../components/ModelCard'
import PageMeta from '../components/PageMeta'
import TipButton from '../components/ui/TipButton'

const PLATFORM_ACCOUNT_EMAILS = ['threedsharespace@gmail.com']
const PLATFORM_ACCOUNT_IDS = ['Bit2fGqznKheFgEg2dTEPCIIKw32']

const isPlatformAccount = (profile) => {
  const email = (profile?.email || '').toLowerCase()
  const id = profile?.uid || profile?.id
  const username = (profile?.username || '').toLowerCase()
  const displayName = (profile?.displayName || '').toLowerCase()

  return PLATFORM_ACCOUNT_EMAILS.includes(email) ||
    PLATFORM_ACCOUNT_IDS.includes(id) ||
    username === 'admin' ||
    displayName === 'admin' ||
    profile?.isPlatformAccount === true
}

const isPublicModel = (model) => (
  model.is_private !== true &&
  model.isPublic !== false &&
  model.is_public !== false &&
  model.status !== 'draft' &&
  model.isDraft !== true
)

const getDate = (value) => {
  if (!value) return 'Not listed'
  const date = value?.toDate ? value.toDate() : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not listed'
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const getSocialLinks = (profile) => {
  const links = profile?.socialLinks || {}
  const keys = ['website', 'artstation', 'behance', 'instagram', 'youtube', 'linkedin', 'github', 'facebook', 'twitter']

  return keys
    .map((key) => {
      const value = links[key] || profile?.[key]
      if (!value) return null
      const href = String(value).startsWith('http') ? value : `https://${value}`
      return { key, label: key.charAt(0).toUpperCase() + key.slice(1), href }
    })
    .filter(Boolean)
}

export default function ProfileView() {
  const { userId } = useParams()
  const { user: currentUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [models, setModels] = useState([])
  const [likedModels, setLikedModels] = useState([])
  const [followStats, setFollowStats] = useState({ followers: 0, following: 0 })
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('models')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) return undefined

    let active = true

    const loadProfile = async () => {
      setLoading(true)
      setError('')

      try {
        const [profileResult, modelsResult, likedResult] = await Promise.all([
          firebaseHelpers.getUserProfile(userId),
          firebaseHelpers.getModels({ userId }),
          firebaseHelpers.getLikedModels(userId).catch(() => ({ success: false, models: [] }))
        ])

        if (!active) return

        if (profileResult.success) {
          setProfile(profileResult.profile)
        } else {
          setProfile({
            uid: userId,
            username: userId,
            displayName: userId,
            bio: '3D model creator',
            socialLinks: {}
          })
        }

        const visibleModels = (modelsResult.success ? modelsResult.models || [] : []).filter(isPublicModel)
        const visibleLikedModels = (likedResult.success ? likedResult.models || [] : []).filter(isPublicModel)

        setModels(visibleModels)
        setLikedModels(visibleLikedModels)
      } catch (err) {
        if (!active) return
        setError('Failed to load profile')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [userId])

  const profileUid = profile?.uid || profile?.id || userId
  const isOwnProfile = Boolean(currentUser?.uid && profileUid && currentUser.uid === profileUid)
  const isPlatformProfile = isPlatformAccount(profile)
  const displayName = isPlatformProfile ? '3D ShareSpace' : (profile?.displayName || profile?.username || userId)
  const username = isPlatformProfile ? 'platform' : (profile?.username || userId)
  const bio = isPlatformProfile ? 'Official platform library for free 3D models.' : (profile?.bio || profile?.tagline || '3D model creator')
  const socialLinks = useMemo(() => getSocialLinks(profile), [profile])

  const totals = useMemo(() => ({
    downloads: models.reduce((sum, model) => sum + Number(model.downloads || model.downloads_count || 0), 0),
    likes: models.reduce((sum, model) => sum + Number(model.likes || 0), 0),
    views: models.reduce((sum, model) => sum + Number(model.views || model.view_count || 0), 0)
  }), [models])

  useEffect(() => {
    if (!profileUid) return

    let active = true

    const loadFollowData = async () => {
      try {
        const [statsResult, followResult] = await Promise.all([
          firebaseHelpers.getFollowStats(profileUid).catch(() => ({ success: false })),
          currentUser && !isOwnProfile
            ? firebaseHelpers.checkFollowStatus(profileUid).catch(() => ({ success: false }))
            : Promise.resolve({ success: false })
        ])

        if (!active) return
        if (statsResult.success) setFollowStats(statsResult)
        if (followResult.success) setIsFollowing(Boolean(followResult.isFollowing))
      } catch (err) {
        if (active) setFollowStats({ followers: 0, following: 0 })
      }
    }

    loadFollowData()

    return () => {
      active = false
    }
  }, [currentUser, isOwnProfile, profileUid])

  const handleFollow = async () => {
    if (!profileUid || !currentUser || isOwnProfile) return

    setFollowLoading(true)
    try {
      if (isFollowing) {
        const result = await firebaseHelpers.unfollowUser(profileUid)
        if (result.success) {
          setIsFollowing(false)
          setFollowStats((prev) => ({ ...prev, followers: Math.max(0, (prev.followers || 0) - 1) }))
        }
      } else {
        const result = await firebaseHelpers.followUser(profileUid)
        if (result.success) {
          setIsFollowing(true)
          setFollowStats((prev) => ({ ...prev, followers: (prev.followers || 0) + 1 }))
        }
      }
    } finally {
      setFollowLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="studio-page profile-view-page">
        <div className="studio-container">
          <div className="studio-panel profile-view-loading">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading profile</span>
          </div>
        </div>
      </main>
    )
  }

  if (error || !profile) {
    return (
      <main className="studio-page profile-view-page">
        <div className="studio-container">
          <section className="studio-empty">
            <h3>Profile not found</h3>
            <p>{error || 'This creator profile is not available.'}</p>
            <Link to="/explore" className="studio-primary-button mt-5">Back to library</Link>
          </section>
        </div>
      </main>
    )
  }

  const activeModels = activeTab === 'likes' ? likedModels : models

  return (
    <main className="studio-page profile-view-page">
      <PageMeta
        title={`${displayName} 3D Models | 3D ShareSpace`}
        description={`${displayName} shares ${models.length} free 3D models on 3D ShareSpace.`}
        url={`/profile/${userId}`}
        type="profile"
      />

      <div className="studio-container">
        <section className="profile-view-hero">
          <div className="profile-view-identity">
            <div className="profile-view-avatar">
              {profile.avatar ? <img src={profile.avatar} alt="" /> : <span>{displayName.charAt(0)}</span>}
            </div>
            <div className="min-w-0">
              <p className="studio-kicker">Creator profile</p>
              <h1>{displayName}</h1>
              <p className="profile-view-username">@{username}</p>
              <p className="profile-view-bio">{bio}</p>
            </div>
          </div>

          <div className="profile-view-actions">
            {isOwnProfile ? (
              <Link to="/profile/edit" className="studio-secondary-button">
                <Settings className="mr-2 h-4 w-4" />
                Edit profile
              </Link>
            ) : currentUser ? (
              <>
                <Link to={`/messages?to=${encodeURIComponent(profileUid)}`} className="studio-primary-button">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message
                </Link>
                <button type="button" onClick={handleFollow} disabled={followLoading} className="studio-secondary-button">
                  {isFollowing ? <UserMinus className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  {followLoading ? 'Updating' : isFollowing ? 'Following' : 'Follow'}
                </button>
              </>
            ) : (
              <Link to="/login" className="studio-secondary-button">Log in to follow</Link>
            )}
            {!isOwnProfile && profileUid && <TipButton creatorId={profileUid} creatorName={displayName} variant="small" />}
          </div>
        </section>

        <section className="profile-view-stats">
          {[
            ['Models', models.length],
            ['Followers', followStats.followers || 0],
            ['Following', followStats.following || 0],
            ['Downloads', totals.downloads],
            ['Likes', totals.likes],
            ['Views', totals.views]
          ].map(([label, value]) => (
            <div key={label}>
              <strong>{Number(value || 0).toLocaleString()}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="profile-view-layout">
          <aside className="profile-view-side">
            <div className="profile-view-panel">
              <h2>Contact</h2>
              <div className="profile-view-info">
                {profile.email && (
                  <p><Mail size={15} /> <span>{profile.email}</span></p>
                )}
                {profile.location && (
                  <p><MapPin size={15} /> <span>{profile.location}</span></p>
                )}
                <p><Calendar size={15} /> <span>Joined {getDate(profile.createdAt || profile.joinDate)}</span></p>
              </div>
            </div>

            {socialLinks.length > 0 && (
              <div className="profile-view-panel">
                <h2>Links</h2>
                <div className="profile-view-links">
                  {socialLinks.map((link) => (
                    <a key={link.key} href={link.href} target="_blank" rel="noreferrer">
                      {link.label}
                      <ExternalLink size={13} />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>

          <section className="profile-view-library">
            <div className="profile-view-tabs">
              <button type="button" onClick={() => setActiveTab('models')} className={activeTab === 'models' ? 'is-active' : ''}>
                Models ({models.length})
              </button>
              <button type="button" onClick={() => setActiveTab('likes')} className={activeTab === 'likes' ? 'is-active' : ''}>
                Liked models ({likedModels.length})
              </button>
            </div>

            {activeModels.length > 0 ? (
              <div className="asset-grid profile-view-grid">
                {activeModels.map((model) => (
                  <ModelCard key={model.id || model.uid} model={model} />
                ))}
              </div>
            ) : (
              <div className="studio-empty profile-view-empty">
                <h3>{activeTab === 'likes' ? 'No liked models yet' : 'No public models yet'}</h3>
                <p>{activeTab === 'likes' ? 'Liked public assets will appear here.' : 'Published public models from this creator will appear here.'}</p>
                {isOwnProfile && activeTab === 'models' && <Link to="/upload" className="studio-primary-button mt-5">Upload model</Link>}
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  )
}
