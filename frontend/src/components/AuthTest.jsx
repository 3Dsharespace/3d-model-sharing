import React from 'react'
import { useAuth } from '../contexts/AuthContext'

const AuthTest = () => {
  const { user, profile, isAuthenticated, signInWithGoogle, logout } = useAuth()

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle()
      if (result.success) {
        console.log('Google sign-in successful')
      } else {
        console.error('Google sign-in failed:', result.error)
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
    }
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Authentication Test
      </h2>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Authentication Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
          </p>
        </div>

        {user && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              User ID: {user.uid}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Email: {user.email}
            </p>
            {user.displayName && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Display Name: {user.displayName}
              </p>
            )}
            {user.photoURL && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Photo URL: {user.photoURL}
              </p>
            )}
          </div>
        )}

        {profile && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Username: {profile.username}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Provider: {profile.provider || 'email'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Verified: {profile.isVerified ? 'Yes' : 'No'}
            </p>
          </div>
        )}

        <div className="flex space-x-4">
          {!isAuthenticated ? (
            <button
              onClick={handleGoogleSignIn}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Sign in with Google
            </button>
          ) : (
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthTest
