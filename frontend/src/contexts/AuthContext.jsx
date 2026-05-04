import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { auth, firebaseHelpers } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

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
  const resolvedRef = useRef(false)

  useEffect(() => {
    console.log('🔍 AuthContext: Checking existing authentication...')
    resolvedRef.current = false

    const timeout = setTimeout(() => {
      if (!resolvedRef.current) {
        console.log('⏰ AuthContext: Auth check taking too long, stopping loading')
        setLoading(false)
      }
    }, 5000)

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 AuthContext: Auth state changed:', firebaseUser ? 'SIGNED_IN' : 'SIGNED_OUT')
      if (firebaseUser) {
        setUser(firebaseUser)
        try {
          const { profile: userProfile, error } = await firebaseHelpers.getProfile(firebaseUser.uid)
          if (error || !userProfile) {
            console.log('⚠️ AuthContext: Profile not found, creating one...')
            // Create profile for existing user
            const { profile: newProfile, error: createError } = await firebaseHelpers.ensureProfile(
              firebaseUser.uid, 
              firebaseUser.email?.split('@')[0] || 'user'
            )
            if (createError) {
              console.log('❌ AuthContext: Failed to create profile:', createError)
            } else if (newProfile) {
              setProfile(newProfile)
              console.log('✅ AuthContext: Profile created successfully')
            }
          } else {
            setProfile(userProfile)
            console.log('✅ AuthContext: Profile loaded successfully')
          }
        } catch (error) {
          console.log('❌ AuthContext: Profile error:', error)
          // Try to create profile as fallback
          try {
            const { profile: newProfile } = await firebaseHelpers.ensureProfile(
              firebaseUser.uid, 
              firebaseUser.email?.split('@')[0] || 'user'
            )
            if (newProfile) {
              setProfile(newProfile)
              console.log('✅ AuthContext: Profile created as fallback')
            }
          } catch (fallbackError) {
            console.log('❌ AuthContext: Fallback profile creation failed:', fallbackError)
          }
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      resolvedRef.current = true
      clearTimeout(timeout)
      setLoading(false)
      console.log('🏁 AuthContext: Initial auth check complete, setting loading to false')
    })

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  const login = async (email, password) => {
    console.log('🔐 AuthContext: Starting login process...')
    setLoading(true)
    
    try {
      const { user: firebaseUser, error } = await firebaseHelpers.signIn(email, password)
      
      if (error) {
        console.log('❌ AuthContext: Login failed:', error)
        setLoading(false)
        return { success: false, error }
      }
      
      if (firebaseUser) {
        setUser(firebaseUser)
        
        // Get profile
        const { profile: userProfile } = await firebaseHelpers.getProfile(firebaseUser.uid)
        setProfile(userProfile)
        
        console.log('✅ AuthContext: Login successful, user:', firebaseUser.uid)
        setLoading(false)
        return { success: true, error: null }
      }
    } catch (error) {
      console.log('❌ AuthContext: Login error:', error)
      setLoading(false)
      return { success: false, error: error.message }
    }
  }

  const signup = async (email, password, username) => {
    console.log('🔐 AuthContext: Starting signup process...')
    setLoading(true)
    
    try {
      const { user: firebaseUser, error } = await firebaseHelpers.signUp(email, password, username)
      
      if (error) {
        console.log('❌ AuthContext: Signup failed:', error)
        setLoading(false)
        return { success: false, error }
      }
      
      if (firebaseUser) {
        setUser(firebaseUser)
        
        // Profile should be created automatically
        const { profile: userProfile } = await firebaseHelpers.getProfile(firebaseUser.uid)
        setProfile(userProfile)
        
        console.log('✅ AuthContext: Signup successful, user:', firebaseUser.uid)
        setLoading(false)
        return { success: true, error: null }
      }
    } catch (error) {
      console.log('❌ AuthContext: Signup error:', error)
      setLoading(false)
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    console.log('🔐 AuthContext: Starting logout process...')
    setLoading(true)
    
    try {
      const { error } = await firebaseHelpers.signOut()
      
      if (error) {
        console.log('❌ AuthContext: Logout error:', error)
        setLoading(false)
        return { success: false, error }
      }
      
      setUser(null)
      setProfile(null)
      setLoading(false)
      
      console.log('✅ AuthContext: Logout successful')
      return { success: true, error: null }
    } catch (error) {
      console.log('❌ AuthContext: Logout error:', error)
      setLoading(false)
      return { success: false, error: error.message }
    }
  }

  const refreshProfile = async () => {
    if (!user) return { success: false, error: 'No user logged in' }
    
    try {
      const { profile: userProfile, error } = await firebaseHelpers.getProfile(user.uid)
      
      if (error) {
        console.log('❌ AuthContext: Profile refresh error:', error)
        return { success: false, error }
      }
      
      setProfile(userProfile)
      console.log('✅ AuthContext: Profile refreshed')
      return { success: true, error: null }
    } catch (error) {
      console.log('❌ AuthContext: Profile refresh error:', error)
      return { success: false, error: error.message }
    }
  }

  const checkAuthStatus = () => {
    console.log('🔍 AuthContext: Current auth status:', {
      user: !!user,
      profile: !!profile,
      loading,
      userId: user?.uid
    })
    return { user: !!user, profile: !!profile, loading, userId: user?.uid }
  }

  const refreshAuth = async () => {
    console.log('🔄 AuthContext: Refreshing auth...')
    setLoading(true)
    
    // Force re-check auth state
    const currentUser = auth.currentUser
    if (currentUser) {
      setUser(currentUser)
      const { profile: userProfile } = await firebaseHelpers.getProfile(currentUser.uid)
      setProfile(userProfile)
    }
    
    setLoading(false)
  }

  const createProfile = async () => {
    if (!user) return { success: false, error: 'No user logged in' }
    
    try {
      console.log('🔧 AuthContext: Manually creating profile for user:', user.uid)
      const { profile: newProfile, error } = await firebaseHelpers.ensureProfile(
        user.uid, 
        user.email?.split('@')[0] || 'user'
      )
      
      if (error) {
        console.log('❌ AuthContext: Manual profile creation failed:', error)
        return { success: false, error }
      }
      
      if (newProfile) {
        setProfile(newProfile)
        console.log('✅ AuthContext: Manual profile creation successful')
        return { success: true, profile: newProfile, error: null }
      }
      
      return { success: false, error: 'Failed to create profile' }
    } catch (error) {
      console.log('❌ AuthContext: Manual profile creation error:', error)
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    refreshProfile,
    checkAuthStatus,
    refreshAuth,
    createProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

