import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import PrivacyPreferences from './PrivacyPreferences'
import TipButton from './ui/TipButton'
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Upload, 
  Download, 
  Search,
  Shield,
  Home,
  Compass,
  Plus,
  Heart,
  DollarSign,
  Award,
  Store,
  Users,
  TrendingUp
} from 'lucide-react'
import { Button } from './ui/Button'
import { popularCollectionLinks, popularSeoLinks } from '../data/programmaticSeo'
import { popularGuideLinks } from '../data/seoGuides'

const Layout = ({ children }) => {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [profile, setProfile] = useState(null)
  const location = useLocation()

  // Check admin status and fetch user profile
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false)
        setProfile(null)
        return
      }
      
      try {
        const adminCheck = await firebaseHelpers.checkAdminStatus(user.uid)
        setIsAdmin(adminCheck.isAdmin)
        
        // Fetch user profile for avatar
        const profileResult = await firebaseHelpers.getUserProfile(user.uid)
        if (profileResult.success) {
          setProfile(profileResult.profile)
        }

      } catch (err) {
        console.error('Error checking admin status or fetching profile:', err)
        setIsAdmin(false)
        setProfile(null)
      }
    }

    checkAdminStatus()
  }, [user])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }, [location.pathname])

  const handleLogout = async () => {
    try {
      await logout()
      setIsUserMenuOpen(false)
      setIsMobileMenuOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const isActive = (path) => location.pathname === path
  const displayName = profile?.displayName || profile?.username || user?.displayName || user?.email || 'User'
  const avatarFallback = displayName?.charAt(0) || 'U'
  const userMenuItemClass = 'flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors'
  const userMenuSectionClass = 'px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-500'
  const mobileMenuItemClass = 'flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:text-white dark:hover:bg-gray-900 transition-colors'
  const mobileMenuSectionClass = 'px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-wider'
  return (
    <div className="min-h-screen bg-luxury-bg-primary dark:bg-black">
      {/* Navigation */}
      <nav className="premium-dark-nav sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-black/70 bg-white/80 dark:bg-black/90 border-b border-luxury-border-light dark:border-gray-900 h-16 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center gap-2 md:gap-6">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2" aria-label="3D ShareSpace Home">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">3D</span>
                </div>
                <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">ShareSpace</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-1" role="navigation" aria-label="Primary">
                <Link
                  to="/"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'text-gray-900 bg-gray-100 dark:text-gray-200 dark:bg-gray-800' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/explore"
                  className={`explore-glass-button flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border shadow-lg shadow-red-950/20 backdrop-blur-md transition-all duration-200 ${
                    isActive('/explore') 
                      ? 'explore-glass-button-active border-red-300/70 bg-red-600/90 text-white shadow-red-500/35 ring-1 ring-red-200/40' 
                      : 'border-red-400/35 bg-red-600/15 text-red-600 hover:-translate-y-0.5 hover:border-red-300/70 hover:bg-red-600 hover:text-white hover:shadow-red-500/35 dark:text-red-200 dark:bg-red-500/15 dark:hover:bg-red-600'
                  }`}
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore</span>
                </Link>
                {user && (
                  <>
                    <Link
                      to="/upload"
                      className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive('/upload') 
                          ? 'text-gray-900 bg-gray-100 dark:text-gray-200 dark:bg-gray-800' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload</span>
                    </Link>

                    {/* Creator Tools Dropdown */}
                    <div className="relative group">
                      <button className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800">
                        <TrendingUp className="w-4 h-4" />
                        <span>Creator</span>
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="premium-dark-surface absolute left-0 mt-1 w-48 bg-white dark:bg-black rounded-md shadow-lg border border-gray-200 dark:border-gray-800 py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                        <Link
                          to="/creator-tier"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Award className="w-4 h-4" />
                          <span>Creator Tier</span>
                        </Link>
                        <Link
                          to="/creators"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Users className="w-4 h-4" />
                          <span>Find Creators</span>
                        </Link>
                        <Link
                          to={`/store/${user.uid}`}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Store className="w-4 h-4" />
                          <span>My Storefront</span>
                        </Link>
                        <Link
                          to="/referrals"
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <Users className="w-4 h-4" />
                          <span>Referral Program</span>
                        </Link>
                      </div>
                    </div>

                  </>
                )}
              </div>
            </div>

            {/* Center - Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    const value = e.currentTarget.search?.value?.trim()
                    if (value) window.location.href = `/explore?q=${encodeURIComponent(value)}`
                  }}
                >
                  <input
                    name="search"
                    type="text"
                    placeholder="Search for 3D models, creators, tags, or categories..."
                    className="w-full pl-12 pr-24 py-2 bg-gray-100 border border-luxury-border-light rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:placeholder-gray-400"
                    aria-label="Search"
                  />
                  <Button type="submit" variant="outline" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 px-4">
                    Search
                  </Button>
                </form>
              </div>
            </div>

            {/* Right side - Theme and User */}
            <div className="flex items-center gap-3">
              {/* Mobile Search */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const value = e.currentTarget.search?.value?.trim()
                  if (value) window.location.href = `/explore?q=${encodeURIComponent(value)}`
                }}
                className="lg:hidden hidden sm:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2"
              >
                <Search className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <input
                  name="search"
                  type="text"
                  placeholder="Search..."
                  className="bg-transparent border-none outline-none text-sm text-gray-900 placeholder-gray-500 w-32 dark:text-gray-300 dark:placeholder-gray-400"
                />
              </form>

              {/* User Menu */}
              {user ? (
                <div className="relative">
                  <Button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    variant="ghost"
                    className="flex items-center gap-3 p-2 h-auto rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    aria-haspopup="menu"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black text-sm font-medium overflow-hidden">
                      {profile?.avatar ? (
                        <img 
                          src={profile.avatar} 
                          alt={displayName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{avatarFallback}</span>
                      )}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-900 dark:text-gray-300">{displayName}</span>
                  </Button>

                  {/* User Dropdown */}
                  {isUserMenuOpen && (
                    <div className="premium-dark-surface absolute right-0 mt-2 w-80 max-h-[calc(100vh-5rem)] overflow-y-auto bg-white dark:bg-black rounded-xl shadow-xl border border-luxury-border-light dark:border-gray-800 py-2 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-4 border-b border-luxury-border-light dark:border-gray-800">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-black text-sm font-semibold overflow-hidden flex-shrink-0">
                            {profile?.avatar ? (
                              <img 
                                src={profile.avatar} 
                                alt={displayName} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{avatarFallback}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {displayName}
                            </p>
                            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pb-1">
                        <p className={userMenuSectionClass}>Account</p>
                        <Link
                          to="/dashboard"
                          className={userMenuItemClass}
                        >
                          <Home className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to={`/profile/${user.uid}`}
                          className={userMenuItemClass}
                        >
                          <User className="w-4 h-4" />
                          <span>Public Profile</span>
                        </Link>
                        <Link
                          to="/profile/edit?tab=settings"
                          className={userMenuItemClass}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Account Settings</span>
                        </Link>
                      </div>

                      <div className="border-t border-luxury-border-light dark:border-gray-800 my-1"></div>

                      <div className="pb-1">
                        <p className={userMenuSectionClass}>Creator</p>
                        <Link
                          to="/upload"
                          className={userMenuItemClass}
                        >
                          <Upload className="w-4 h-4" />
                          <span>Upload 3D Model</span>
                        </Link>
                        <Link
                          to="/manage"
                          className={userMenuItemClass}
                        >
                          <Download className="w-4 h-4" />
                          <span>My Models</span>
                        </Link>
                        <Link
                          to="/tips"
                          className={userMenuItemClass}
                        >
                          <Heart className="w-4 h-4" />
                          <span>Tips & Earnings</span>
                        </Link>
                        <Link
                          to="/creator-tier"
                          className={userMenuItemClass}
                        >
                          <Award className="w-4 h-4" />
                          <span>Creator Tier</span>
                        </Link>
                        <Link
                          to={`/store/${user.uid}`}
                          className={userMenuItemClass}
                        >
                          <Store className="w-4 h-4" />
                          <span>My Storefront</span>
                        </Link>
                        <Link
                          to="/referrals"
                          className={userMenuItemClass}
                        >
                          <Users className="w-4 h-4" />
                          <span>Referral Program</span>
                        </Link>
                      </div>

                      {/* Admin Link - Only show for admin users */}
                      {isAdmin && (
                        <>
                          <div className="border-t border-luxury-border-light dark:border-gray-800 my-1"></div>
                          <p className={userMenuSectionClass}>Admin</p>
                          <Link
                            to="/admin"
                            className={userMenuItemClass}
                          >
                            <Shield className="w-4 h-4" />
                            <span>Admin Dashboard</span>
                          </Link>
                        </>
                      )}

                      {/* Divider */}
                      <div className="border-t border-luxury-border-light dark:border-gray-800 my-1"></div>

                      {/* Logout */}
                      <div className="py-1">
                        <Button
                          onClick={handleLogout}
                          variant="ghost"
                          className={`${userMenuItemClass} h-auto w-full justify-start rounded-none`}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Log out</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile menu button */}
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                className="md:hidden p-2 h-auto rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Toggle menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-luxury-border-light dark:border-gray-800">
              <div className="space-y-2">
                <Link
                  to="/"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/') 
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/explore"
                  className={`explore-glass-button block px-3 py-2 rounded-md text-base font-semibold border shadow-lg shadow-red-950/20 backdrop-blur-md ${
                    isActive('/explore') 
                      ? 'explore-glass-button-active border-red-300/70 bg-red-600/90 text-white shadow-red-500/35' 
                      : 'border-red-400/35 bg-red-600/15 text-red-600 hover:bg-red-600 hover:text-white dark:text-red-200 dark:bg-red-500/15'
                  }`}
                >
                  Explore
                </Link>
                {user && (
                  <>
                    <Link
                      to="/upload"
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        isActive('/upload') 
                          ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    >
                      Upload
                    </Link>
                    
                    <div className="pt-2 pb-1 border-t border-gray-200 dark:border-gray-800 mt-2">
                      <p className={mobileMenuSectionClass}>Account</p>
                      <Link to="/dashboard" className={mobileMenuItemClass}>
                        <Home className="w-4 h-4" />
                        <span>Dashboard</span>
                      </Link>
                      <Link to={`/profile/${user.uid}`} className={mobileMenuItemClass}>
                        <User className="w-4 h-4" />
                        <span>Public Profile</span>
                      </Link>
                      <Link to="/profile/edit?tab=settings" className={mobileMenuItemClass}>
                        <Settings className="w-4 h-4" />
                        <span>Account Settings</span>
                      </Link>
                    </div>

                    <div className="pt-2 pb-1 border-t border-gray-200 dark:border-gray-800 mt-2">
                      <p className={mobileMenuSectionClass}>Creator</p>
                      <Link to="/manage" className={mobileMenuItemClass}>
                        <Download className="w-4 h-4" />
                        <span>My Models</span>
                      </Link>
                      <Link to="/tips" className={mobileMenuItemClass}>
                        <Heart className="w-4 h-4" />
                        <span>Tips & Earnings</span>
                      </Link>
                      <Link to="/creator-tier" className={mobileMenuItemClass}>
                        <Award className="w-4 h-4" />
                        <span>Creator Tier</span>
                      </Link>
                      <Link to={`/store/${user.uid}`} className={mobileMenuItemClass}>
                        <Store className="w-4 h-4" />
                        <span>My Storefront</span>
                      </Link>
                      <Link to="/referrals" className={mobileMenuItemClass}>
                        <Users className="w-4 h-4" />
                        <span>Referral Program</span>
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-800 mt-2">
                      <Button
                        onClick={handleLogout}
                        variant="ghost"
                        className={`${mobileMenuItemClass} h-auto w-full justify-start`}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log out</span>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="premium-dark-footer bg-white dark:bg-black border-t border-luxury-border-light dark:border-gray-900 w-full">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">3D</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">ShareSpace</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                3D ShareSpace is a free platform where creators can upload, explore, and download 3D models. 
                Our mission is to make 3D assets accessible to everyone.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex gap-4">
                  <a href="mailto:support@3dsharespace.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    support@3dsharespace.com
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Support our platform:</span>
                  <TipButton
                    creatorId="platform"
                    creatorName="3D ShareSpace"
                    variant="small"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Platform
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/explore" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Explore Models
                  </Link>
                </li>
                <li>
                  <Link to="/free-3d-model-images" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Model Images
                  </Link>
                </li>
                <li>
                  <Link to="/upload" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Upload Models
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    About Us
                  </Link>
                </li>
                {popularGuideLinks.slice(0, 2).map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Searches */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Popular Searches
              </h3>
              <ul className="space-y-2">
                {popularSeoLinks.slice(0, 10).map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Collections */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Collections
              </h3>
              <ul className="space-y-2">
                {popularCollectionLinks.slice(0, 8).map((link) => (
                  <li key={link.path}>
                    <Link to={link.path} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/report" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
                    Report Content / DMCA
                  </Link>
                </li>
                <li>
                  <Button
                    onClick={() => window.dispatchEvent(new Event('openCookieSettings'))}
                    variant="ghost"
                    className="h-auto p-0 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    Manage Cookies
                  </Button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-luxury-border-light dark:border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © 2025 3D ShareSpace. All rights reserved.
              </p>
              
            </div>
          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      <PrivacyPreferences />
    </div>
  )
}

export default Layout
