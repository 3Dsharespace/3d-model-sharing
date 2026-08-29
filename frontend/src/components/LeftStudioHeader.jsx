import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Bell, Menu, Upload, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'

const primaryNav = [
  { label: 'Library', to: '/explore' },
  { label: 'Method', to: '/getting-started' },
  { label: 'Creators', to: '/creators' }
]

const menuLinks = [
  { label: 'Home', to: '/' },
  { label: 'Categories', to: '/collections' },
  { label: 'Upload', to: '/upload' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Creator Tier', to: '/creator-tier' },
  { label: 'Images', to: '/free-3d-model-images' },
  { label: 'Notifications', to: '/notifications', authOnly: true },
  { label: 'Messages', to: '/messages', authOnly: true }
]

const LeftStudioHeader = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)

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

  useEffect(() => {
    setMenuOpen(false)
    setAccountOpen(false)
  }, [location.pathname])

  const displayName = profile?.displayName || profile?.username || user?.displayName || user?.email || 'Account'
  const avatarFallback = displayName?.charAt(0)?.toUpperCase() || 'A'

  const activeClass = (path) => {
    if (path === '/') return location.pathname === path
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  return (
    <>
      <header className="sharespace-header">
        <div className="sharespace-header__inner">
          <Link to="/" className="sharespace-brand" aria-label="Share Space home">
            <span className="sharespace-brand__mark studio-logo-mark" aria-hidden="true">
              <svg viewBox="0 0 42 42" role="img">
                <path className="studio-logo-mark__frame" d="M7 10.5 21 3l14 7.5v21L21 39 7 31.5v-21Z" />
                <path className="studio-logo-mark__facet" d="M21 3v15.2L7 10.5M21 18.2l14-7.7M21 18.2V39M7 31.5l14-7.7 14 7.7" />
                <path className="studio-logo-mark__core" d="M14.2 14.3h8.1c3.8 0 6.2 2.1 6.2 5.2 0 2.1-1 3.6-2.9 4.5l3.6 5.1h-5.3l-2.9-4.3h-2.1v4.3h-4.7V14.3Zm4.7 3.8v3.1h3c1.2 0 1.9-.6 1.9-1.6 0-1-.7-1.5-1.9-1.5h-3Z" />
              </svg>
            </span>
            <span className="sharespace-brand__name">Share Space</span>
          </Link>

          <nav className="sharespace-nav" aria-label="Primary navigation">
            {primaryNav.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={activeClass(link.to) ? 'is-active' : ''}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="sharespace-header__actions">
            <Link to={user ? '/upload' : '/login'} className="sharespace-publish">
              <Upload size={14} />
              Publish asset
            </Link>

            {user && (
              <Link
                to="/notifications"
                className={`sharespace-icon-button ${activeClass('/notifications') ? 'is-active' : ''}`}
                aria-label="Notifications"
              >
                <Bell size={16} />
              </Link>
            )}

            {user ? (
              <div className={`sharespace-account ${accountOpen ? 'is-open' : ''}`}>
                <button
                  type="button"
                  className="sharespace-account__trigger"
                  aria-label="Open profile menu"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((open) => !open)}
                >
                  <span className="studio-account__avatar">
                    {profile?.avatar ? <img src={profile.avatar} alt="" /> : avatarFallback}
                  </span>
                </button>
                <div className="sharespace-account__popover">
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
              </div>
            ) : (
              <Link to="/login" className="sharespace-account__trigger sharespace-account__trigger--guest">
                {avatarFallback}
              </Link>
            )}

            <button
              type="button"
              className="sharespace-menu-toggle"
              aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`sharespace-nav-scrim ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(false)} />

      <section className={`sharespace-mobile-nav ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="sharespace-mobile-nav__header">
          <p>Navigation</p>
          <button type="button" onClick={() => setMenuOpen(false)} aria-label="Close navigation">
            <X size={16} />
          </button>
        </div>

        <nav className="studio-nav" aria-label="Mobile navigation">
          {menuLinks
            .filter((link) => !link.authOnly || user)
            .map((link) => (
              <Link key={link.to} className={activeClass(link.to) ? 'is-active' : ''} to={link.to}>
                {link.label}
              </Link>
            ))}
          {isAdmin && <Link className={activeClass('/admin') ? 'is-active' : ''} to="/admin">Admin</Link>}
          {isAdmin && (
            <Link className={activeClass('/admin/export-pinterest-csv') ? 'is-active' : ''} to="/admin/export-pinterest-csv">
              Pinterest CSV
            </Link>
          )}
        </nav>

        {!user && (
          <div className="sharespace-mobile-nav__auth">
            <Link to="/login" className="studio-button studio-button--primary">Log in</Link>
            <Link to="/signup" className="studio-button">Create account</Link>
          </div>
        )}
      </section>
    </>
  )
}

export default LeftStudioHeader
