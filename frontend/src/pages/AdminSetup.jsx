import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { firebaseHelpers } from '../lib/firebase'
import { Shield, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/Button'

const AdminSetup = () => {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [setupStatus, setSetupStatus] = useState('')
  const [setupLoading, setSetupLoading] = useState(false)

  // Check current admin status
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return
      
      try {
        const adminCheck = await firebaseHelpers.checkAdminStatus(user.uid)
        setIsAdmin(adminCheck.isAdmin)
      } catch (err) {
        console.error('Error checking admin status:', err)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [user])

  // Set current user as admin
  const handleSetupAdmin = async () => {
    if (!user) return
    
    try {
      setSetupLoading(true)
      setSetupStatus('Setting up admin access...')
      
      const result = await firebaseHelpers.setUserAsAdmin(user.uid, true)
      
      if (result.success) {
        setSetupStatus('✅ Admin access granted successfully!')
        setIsAdmin(true)
        
        // Redirect to admin dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = '/admin'
        }, 2000)
      } else {
        setSetupStatus(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error setting up admin:', error)
      setSetupStatus(`❌ Error: ${error.message}`)
    } finally {
      setSetupLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></Loader2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking admin status...</p>
        </div>
      </div>
    )
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-500 text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            You're Already an Admin!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You have full administrative access to the platform.
          </p>
          <a href="/admin" className="inline-flex">
            <Button className="h-10 px-6 inline-flex items-center"><Shield className="h-5 w-5 mr-2" />Go to Admin Dashboard</Button>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Admin Setup Required
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Set up administrative access for your account
            </p>
          </div>

          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-yellow-800 dark:text-yellow-200">
                <p className="font-medium">Current User:</p>
                <p className="mt-1 break-all">{user?.email}</p>
                <p className="mt-2">This action will grant you full administrative access to the platform.</p>
              </div>
            </div>
          </div>

          <Button onClick={handleSetupAdmin} disabled={setupLoading} className="w-full h-12 inline-flex items-center justify-center">
            {setupLoading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Setting Up...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 mr-2" />
                Grant Admin Access
              </>
            )}
          </Button>

          {setupStatus && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              setupStatus.includes('✅') 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
                : setupStatus.includes('❌')
                ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
            }`}>
              {setupStatus}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              ⚠️ Admin access grants full control over the platform. Use responsibly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSetup
