import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import ModelCard from '../components/ModelCard'
import PageMeta from '../components/PageMeta'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, profile, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [models, setModels] = useState([])
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    totalLikes: 0,
    totalDownloads: 0,
    totalViews: 0
  })
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      navigate('/login', { replace: true, state: { from: { pathname: '/dashboard' } } })
      return
    }

    let active = true

    const loadDashboardData = async () => {
      try {
        setLoading(true)
        const [followStats, modelsResult, followersResult, followingResult] = await Promise.all([
          firebaseHelpers.getFollowStats(user.uid),
          firebaseHelpers.getModels({ userId: user.uid }),
          firebaseHelpers.getFollowersList(user.uid),
          firebaseHelpers.getFollowingList(user.uid)
        ])

        if (!active) return

        const userModels = modelsResult.success ? modelsResult.models || [] : []
        setModels(userModels)

        setStats({
          followers: followStats.success ? followStats.followers || 0 : 0,
          following: followStats.success ? followStats.following || 0 : 0,
          totalLikes: userModels.reduce((total, model) => total + (Number(model.likes) || 0), 0),
          totalDownloads: userModels.reduce((total, model) => total + (Number(model.downloads || model.downloads_count) || 0), 0),
          totalViews: userModels.reduce((total, model) => total + (Number(model.views || model.view_count) || 0), 0)
        })

        const followers = followersResult.success ? followersResult.followers || [] : []
        const following = followingResult.success ? followingResult.following || [] : []
        setRecentActivity([
          ...followers.slice(0, 4).map((item) => ({
            label: `${item.displayName || item.username || 'Someone'} followed you`,
            type: 'Follower'
          })),
          ...following.slice(0, 3).map((item) => ({
            label: `You followed ${item.displayName || item.username || 'a creator'}`,
            type: 'Following'
          }))
        ].slice(0, 6))
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboardData()
    return () => {
      active = false
    }
  }, [authLoading, user, navigate])

  const recentModels = useMemo(() => (
    [...models].sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0)).slice(0, 8)
  ), [models])

  if (authLoading || !user) return null

  return (
    <div className="studio-page">
      <PageMeta
        title="Dashboard - 3D ShareSpace"
        description="Manage your 3D models, uploads, and creator activity."
        keywords="dashboard, 3D models, creator tools"
        url="/dashboard"
        type="website"
      />

      <div className="studio-container">
        <header className="border-b border-[#242424] pb-6">
          <p className="studio-kicker">Creator dashboard</p>
          <div className="mt-2 flex items-end justify-between gap-8">
            <div>
              <h1 className="studio-page-title">Your workspace</h1>
              <p className="studio-page-subtitle">
                Manage uploads, check real engagement, and keep your profile ready for downloaders.
              </p>
            </div>
            <div className="flex gap-2">
              <Link to="/upload" className="studio-primary-button">Upload model</Link>
              <Link to="/profile/edit" className="studio-secondary-button">Profile settings</Link>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="studio-card h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <section className="mt-6 grid gap-4 lg:grid-cols-5">
              {[
                { label: 'Uploads', value: models.length },
                { label: 'Downloads', value: stats.totalDownloads },
                { label: 'Views', value: stats.totalViews },
                { label: 'Likes', value: stats.totalLikes },
                { label: 'Followers', value: stats.followers }
              ].map((item) => (
                <div key={item.label} className="studio-panel">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#737373]">{item.label}</p>
                  <p className="mt-4 text-3xl font-semibold text-[#f5f5f5]">{item.value}</p>
                </div>
              ))}
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                <div className="studio-section-title mt-0">
                  <div>
                    <h2>Recent models</h2>
                    <p>Your latest public or private uploads.</p>
                  </div>
                  <Link to="/manage">Manage all</Link>
                </div>

                {recentModels.length ? (
                  <div className="asset-grid">
                    {recentModels.map((model) => (
                      <ModelCard key={model.id || model.uid} model={model} compact />
                    ))}
                  </div>
                ) : (
                  <div className="studio-empty">
                    <h3>No uploads yet</h3>
                    <p>Upload your first model to start building your creator library.</p>
                    <Link to="/upload" className="studio-primary-button mt-5">Upload model</Link>
                  </div>
                )}
              </div>

              <aside className="space-y-4">
                <div className="studio-panel">
                  <h2 className="text-lg font-semibold text-[#f5f5f5]">Account</h2>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4 border-b border-[#1b1b1b] pb-3">
                      <span className="text-[#737373]">Name</span>
                      <span className="text-right text-[#f5f5f5]">{profile?.displayName || profile?.username || user.email}</span>
                    </div>
                    <div className="flex justify-between gap-4 border-b border-[#1b1b1b] pb-3">
                      <span className="text-[#737373]">Following</span>
                      <span className="text-[#f5f5f5]">{stats.following}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-[#737373]">Creator page</span>
                      <Link to={`/profile/${user.uid}`} className="text-[#a3a3a3] hover:text-[#f5f5f5]">View profile</Link>
                    </div>
                  </div>
                </div>

                <div className="studio-panel">
                  <h2 className="text-lg font-semibold text-[#f5f5f5]">Recent activity</h2>
                  {recentActivity.length ? (
                    <div className="mt-4 space-y-2">
                      {recentActivity.map((item, index) => (
                        <div key={`${item.label}-${index}`} className="border border-[#1f1f1f] bg-[#0b0b0b] p-3">
                          <p className="text-sm text-[#d4d4d4]">{item.label}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#737373]">{item.type}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm leading-6 text-[#737373]">No recent social activity yet.</p>
                  )}
                </div>

                <div className="studio-panel">
                  <h2 className="text-lg font-semibold text-[#f5f5f5]">Quick actions</h2>
                  <div className="mt-4 grid gap-2">
                    <Link to="/upload" className="studio-secondary-button justify-start">Upload model</Link>
                    <Link to="/manage" className="studio-secondary-button justify-start">Manage models</Link>
                    <Link to="/tips" className="studio-secondary-button justify-start">Tips and earnings</Link>
                  </div>
                </div>
              </aside>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
