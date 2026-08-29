import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import PageMeta from '../components/PageMeta'

const Signup = () => {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleGoogleSignIn = async () => {
    setError('')

    try {
      setSubmitting(true)
      const result = await signInWithGoogle()
      if (result.success) {
        navigate('/', { replace: true })
      } else {
        setError(result.error || 'Google account setup failed')
      }
    } catch (err) {
      setError('Google account setup failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="studio-page flex items-center justify-center">
      <PageMeta title="Create account | 3D ShareSpace" description="Create a 3D ShareSpace account with Google." url="/signup" />

      <div className="studio-panel w-full max-w-[430px]">
        <div className="mb-7">
          <p className="studio-kicker">Account</p>
          <h1 className="studio-page-title mt-2 !text-2xl">Create account</h1>
          <p className="studio-page-subtitle mt-2 !text-sm">
            Use Google to create your creator profile, upload models, and download assets.
          </p>
        </div>

        <div className="space-y-4">
          {error && (
            <div className="flex gap-3 border border-red-950 bg-red-950/20 p-3 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button type="button" className="studio-primary-button w-full" onClick={handleGoogleSignIn} disabled={submitting}>
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating with Google</> : 'Create account with Google'}
          </button>

          <p className="pt-2 text-center text-sm text-[#737373]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#a3a3a3] hover:text-[#f5f5f5]">Log in with Google</Link>
          </p>
          <p className="text-center text-xs leading-5 text-[#737373]">
            By creating an account, you agree to our <Link to="/terms" className="text-[#a3a3a3] hover:text-[#f5f5f5]">Terms</Link> and <Link to="/privacy" className="text-[#a3a3a3] hover:text-[#f5f5f5]">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
