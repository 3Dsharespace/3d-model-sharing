import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

const UserMenu = () => {
  const { user, profile, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen && typeof document !== 'undefined') {
      try {
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
          try {
            document.removeEventListener('mousedown', handleClickOutside)
          } catch (error) {
            console.warn('Error removing click listener:', error)
          }
        }
      } catch (error) {
        console.warn('Error setting up click listener:', error)
      }
    }
  }, [isOpen])

  const handleLogout = async () => {
    try {
      await logout()
      setIsOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!user) return null

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {profile?.profile_picture || user.photoURL ? (
          <img
            src={profile?.profile_picture || user.photoURL}
            alt={profile?.display_name || user.displayName || 'User'}
            className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800 object-cover"
          />
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {profile?.display_name?.[0] || user.displayName?.[0] || user.email?.[0] || 'U'}
            </span>
          </div>
        )}
        <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
          {profile?.display_name || user.displayName || 'User'}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          <Link
            to={`/profile/${user.uid}`}
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>
          <Link
            to="/models"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            My Models
          </Link>
          <Link
            to={`/profile/${user.uid}?tab=collections`}
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Collections
          </Link>
          <Link
            to="/profile/edit?tab=settings"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Account Settings
          </Link>
          <Link
            to="/upload"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Upload Model
          </Link>
          <hr className="my-1 border-gray-200 dark:border-gray-700" />
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}

export default UserMenu
