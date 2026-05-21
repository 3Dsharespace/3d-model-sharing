import React, { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, firebaseHelpers } from '../lib/firebase'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true)
        
        if (firebaseUser) {
          setUser(firebaseUser)
          
          // Fetch user profile
          const { profile: userProfile, error } = await firebaseHelpers.getUserProfile(firebaseUser.uid)
          if (error) {
            console.warn('Error fetching user profile:', error)
            setProfile(null)
          } else {
            setProfile(userProfile)
          }
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    })

    // Check for Google redirect result
    const checkRedirectResult = async () => {
      try {
        const result = await firebaseHelpers.getGoogleRedirectResult()
        if (result.success && result.user) {
          // User signed in via redirect, profile will be handled by auth state change
          console.log('Google redirect sign-in successful')
        }
      } catch (error) {
        console.error('Error checking Google redirect result:', error)
      }
    }

    checkRedirectResult()

    return () => unsubscribe()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      const { user: firebaseUser, error } = await firebaseHelpers.signIn(email, password)
      
      if (error) {
        throw new Error(error)
      }
      
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signup = async (email, password, username) => {
    try {
      setLoading(true)
      const { user: firebaseUser, error } = await firebaseHelpers.signUp(email, password, username)
      
      if (error) {
        throw new Error(error)
      }
      
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      // Use Firebase auth signOut directly for more reliable logout
      await signOut(auth)
      // Clear local state after successful logout
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const resetPassword = async (email) => {
    try {
      const { error } = await firebaseHelpers.resetPassword(email)
      if (error) {
        throw new Error(error)
      }
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const signInWithGoogle = async () => {
    try {
      setLoading(true)
      const { user: firebaseUser, error } = await firebaseHelpers.signInWithGoogle()
      
      if (error) {
        throw new Error(error)
      }
      
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogleRedirect = async () => {
    try {
      const { error } = await firebaseHelpers.signInWithGoogleRedirect()
      if (error) {
        throw new Error(error)
      }
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateProfile = async (updates) => {
    if (!user) throw new Error('User not authenticated')
    
    try {
      const { error } = await firebaseHelpers.updateUserProfile(user.uid, updates)
      if (error) {
        throw new Error(error)
      }
      
      // Update local profile state
      setProfile(prev => ({ ...prev, ...updates }))
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const refreshProfile = async () => {
    if (!user) return { success: false, error: 'User not authenticated' }
    
    try {
      const { profile: userProfile, error } = await firebaseHelpers.getUserProfile(user.uid)
      if (error) {
        throw new Error(error)
      }
      
      setProfile(userProfile)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.isAdmin === true || profile?.role === 'admin' || profile?.role === 'super_admin',
    isSuperAdmin: profile?.role === 'super_admin',
    login,
    signup,
    logout,
    resetPassword,
    signInWithGoogle,
    signInWithGoogleRedirect,
    updateProfile,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

