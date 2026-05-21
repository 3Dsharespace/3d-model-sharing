import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'

const primaryLinks = [
  { label: 'Explore', to: '/explore' },
  { label: 'Categories', to: '/collections' },
  { label: 'Upload', to: '/upload' },
  { label: 'Dashboard', to: '/dashboard' }
]

const secondaryLinks = [
  { label: 'Creators', to: '/creators' },
  { label: 'Guides', to: '/getting-started' },
  { label: 'Images', to: '/free-3d-model-images' }
]

const LeftStudioHeader = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    let active = true

    const loadAccount = async () => {
      if (!user) {
        setProfile(null)
        setIsAdmin(false)
        return
      }

      try {
        const [profileResult, adminResult] = await Promise.all([
          firebaseHelpers.getUserProfile(user.uid),
          firebaseHelpers.checkAdminStatus(user.uid)
        ])

        if (!active) return
        setProfile(profileResult.success ? profileResult.profile : null)
        setIsAdmin(Boolean(adminResult?.isAdmin))
      } catch (error) {
        if (!active) return
        setProfile(null)
        setIsAdmin(false)
      }
    }

    loadAccount()
    return () => {
      active = false
    }
  }, [user])

  const displayName = profile?.displayName || profile?.username || user?.displayName || user?.email || 'Account'
  const avatarFallback = displayName?.charAt(0)?.toUpperCase() || 'A'

  const submitSearch = (event) => {
    event.preventDefault()
    const value = query.trim()
    navigate(value ? `/explore?q=${encodeURIComponent(value)}` : '/explore')
  }

  const activeClass = (path) => {
    if (path === '/') return location.pathname === path
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <aside className="studio-header">
      <div className="studio-header__cap">
        <Link to="/" className="studio-brand" aria-label="3D ShareSpace home">
          <span className="studio-brand__mark">3D</span>
          <span>
            <span className="studio-brand__name">ShareSpace</span>
            <span className="studio-brand__label">Asset Library</span>
          </span>
        </Link>
      </div>

      <div className="studio-header__rail">
        <div className="studio-status">
          <span>Free 3D assets</span>
          <span>Studio dock</span>
        </div>

        <form onSubmit={submitSearch} className="studio-search">
          <Search className="studio-search__icon" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search models"
            aria-label="Search 3D models"
          />
        </form>

        <nav className="studio-nav" aria-label="Primary navigation">
          <Link className={activeClass('/') ? 'is-active' : ''} to="/">Library Home</Link>
          {primaryLinks.map((link) => (
            <Link key={link.to} className={activeClass(link.to) ? 'is-active' : ''} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="studio-divider" />

        <nav className="studio-nav studio-nav--quiet" aria-label="Secondary navigation">
          {secondaryLinks.map((link) => (
            <Link key={link.to} className={activeClass(link.to) ? 'is-active' : ''} to={link.to}>
              {link.label}
            </Link>
          ))}
          {isAdmin && <Link className={activeClass('/admin') ? 'is-active' : ''} to="/admin">Admin</Link>}
        </nav>

        <div className="studio-header__bottom">
          {user ? (
            <div className="studio-account">
              <Link to={`/profile/${user.uid}`} className="studio-account__identity">
                <span className="studio-account__avatar">
                  {profile?.avatar ? <img src={profile.avatar} alt="" /> : avatarFallback}
                </span>
                <span className="min-w-0">
                  <span className="studio-account__name">{displayName}</span>
                  <span className="studio-account__meta">Creator account</span>
                </span>
              </Link>
              <div className="studio-account__actions">
                <Link to="/profile/edit">Settings</Link>
                <button type="button" onClick={logout}>Sign out</button>
              </div>
            </div>
          ) : (
            <div className="studio-account studio-account--guest">
              <p>Browse free assets or sign in to upload your own models.</p>
              <div className="studio-account__actions">
                <Link to="/login">Log in</Link>
                <Link to="/signup">Create account</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default LeftStudioHeader
