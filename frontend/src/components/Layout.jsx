import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import UserMenu from './ui/UserMenu'
import ThemeToggle from './ui/ThemeToggle'
import { Loader2 } from 'lucide-react'

const Layout = ({ children }) => {
  const { loading, isAuthenticated, refreshAuth } = useAuth()
  const { theme } = useTheme()
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">
            Loading your account...
          </p>
          <div className="space-y-2">
            <button
              onClick={refreshAuth}
              className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-white transition-colors mr-2"
            >
              Retry Auth
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-2 py-2 bg-gray-800 text-gray-100 rounded-lg hover:bg-gray-700 transition-colors"
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
      <div className="bg-gray-950 text-gray-100">
        {/* Header */}
        <header className="bg-gray-950 border-b border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center h-14">
              {/* Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-900 font-semibold text-sm">3D</span>
                </div>
                <span className="text-lg font-semibold text-white">ModelShare</span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link
                  to="/"
                  className={`text-sm font-medium ${
                    location.pathname === '/'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/explore"
                  className={`text-sm font-medium ${
                    location.pathname === '/explore'
                      ? 'text-white'
                      : 'text-gray-400 hover:text-gray-200'
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
                          ? 'text-white'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      Upload
                    </Link>
                    <Link
                      to="/dashboard"
                      className={`text-sm font-medium ${
                        location.pathname === '/dashboard'
                          ? 'text-white'
                          : 'text-gray-400 hover:text-gray-200'
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
                ) : !isAuthPage ? (
                  <div className="flex space-x-2">
                    <Link
                      to="/login"
                      className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/signup"
                      className="px-3 py-2 text-sm font-medium bg-white text-gray-900 rounded-lg hover:bg-gray-200"
                    >
                      Sign Up
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-gray-950 border-t border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
              <p>&copy; 2024 ModelShare</p>
              <div className="flex items-center gap-4">
                <Link to="/privacy" className="hover:text-white">Privacy</Link>
                <Link to="/terms" className="hover:text-white">Terms</Link>
                <Link to="/contact" className="hover:text-white">Contact</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default Layout
