import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import UserMenu from './ui/UserMenu'
import ThemeToggle from './ui/ThemeToggle'
import { firebaseHelpers } from '../lib/firebase'
import { Loader2 } from 'lucide-react'

const Layout = ({ children }) => {
  const { user, profile, loading, isAuthenticated, logout, refreshAuth, checkAuthStatus, refreshProfile, createProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  // Debug the loading state
  console.log('🔍 Layout: Loading state debug:', { loading, user: !!user, profile: !!profile, loadingType: typeof loading, loadingValue: loading })

  if (loading) {
    console.log('🔍 Layout: Showing loading screen because loading =', loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-secondary-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-secondary-600 dark:text-secondary-400 mb-4">
            Loading your account...
          </p>
          <div className="space-y-2">
            <button
              onClick={refreshAuth}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors mr-2"
            >
              Retry Auth
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-2 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    )
  }

  console.log('🔍 Layout: Showing main content because loading =', loading)

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Debug Panel */}
        <div className="bg-yellow-100 dark:bg-yellow-900 p-2 text-xs border-b">
          <div className="flex items-center justify-between">
            <div className="flex space-x-4">
              <span>Loading: {loading ? 'YES' : 'NO'}</span>
              <span>User: {user ? 'YES' : 'NO'} {user?.uid?.substring(0, 8)}</span>
              <span>Profile: {profile ? 'YES' : 'NO'}</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={async () => {
                  if (user) {
                    const result = await createProfile()
                    console.log('Create Profile result:', result)
                    if (result.success) {
                      console.log('Profile created successfully, refreshing...')
                      window.location.reload()
                    } else {
                      console.log('Profile creation failed:', result.error)
                    }
                  }
                }}
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
              >
                Create Profile
              </button>
              <button
                onClick={checkAuthStatus}
                className="px-2 py-1 bg-green-500 text-white rounded text-xs"
              >
                Check Auth
              </button>
              <button
                onClick={logout}
                className="px-2 py-1 bg-red-500 text-white rounded text-xs"
              >
                Force Logout
              </button>
              <button
                onClick={refreshProfile}
                className="px-2 py-1 bg-purple-500 text-white rounded text-xs"
              >
                Refresh Profile
              </button>
              <button
                onClick={refreshAuth}
                className="px-2 py-1 bg-orange-500 text-white rounded text-xs"
              >
                Retry Auth
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-2 py-1 bg-gray-500 text-white rounded text-xs"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">3D</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">ModelShare</span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex space-x-8">
                <Link
                  to="/"
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === '/'
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  Home
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      to="/upload"
                      className={`text-sm font-medium transition-colors ${
                        location.pathname === '/upload'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      Upload
                    </Link>
                    <Link
                      to="/dashboard"
                      className={`text-sm font-medium transition-colors ${
                        location.pathname === '/dashboard'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                      }`}
                    >
                      Dashboard
                    </Link>
                  </>
                )}
              </nav>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                {isAuthenticated ? (
                  <UserMenu />
                ) : (
                  <div className="flex space-x-2">
                    <Link
                      to="/login"
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <p>&copy; 2024 ModelShare. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Layout
