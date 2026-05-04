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

  if (loading) {
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

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center h-14">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
                  <span className="text-white dark:text-gray-900 font-semibold text-sm">3D</span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">ModelShare</span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/"
                  className={`text-sm font-medium ${
                    location.pathname === '/'
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/explore"
                  className={`text-sm font-medium ${
                    location.pathname === '/explore'
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  Explore
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      to="/upload"
                      className={`text-sm font-medium ${
                        location.pathname === '/upload'
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                      }`}
                    >
                      Upload
                    </Link>
                    <Link
                      to="/dashboard"
                      className={`text-sm font-medium ${
                        location.pathname === '/dashboard'
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
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
                      className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="px-3 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
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
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
              <p>&copy; 2024 ModelShare</p>
              <div className="flex items-center gap-4">
                <Link to="/privacy" className="hover:text-gray-900 dark:hover:text-white">Privacy</Link>
                <Link to="/terms" className="hover:text-gray-900 dark:hover:text-white">Terms</Link>
                <Link to="/contact" className="hover:text-gray-900 dark:hover:text-white">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Layout
