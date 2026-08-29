import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import PageMeta from '../components/PageMeta'

const Login = () => {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { user, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (!loading && user) navigate(redirectTo, { replace: true })
  }, [loading, navigate, redirectTo, user])

  const handleGoogleSignIn = async () => {
    setError('')

    try {
      setSubmitting(true)
      const result = await signInWithGoogle()
      if (result.success) navigate(redirectTo, { replace: true })
      else setError(result.error || 'Google sign-in failed')
    } catch (err) {
      setError('Google sign-in failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="studio-page flex items-center justify-center">
      <PageMeta title="Log in | 3D ShareSpace" description="Log in with Google to upload, download, and manage 3D models." url="/login" />

      <div className="studio-panel w-full max-w-[430px]">
        <div className="mb-7">
          <p className="studio-kicker">Account</p>
          <h1 className="studio-page-title mt-2 !text-2xl">Log in</h1>
          <p className="studio-page-subtitle mt-2 !text-sm">
            Use Google to access downloads, uploads, dashboard tools, and your creator profile.
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
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Connecting Google</> : 'Continue with Google'}
          </button>

          <p className="pt-2 text-center text-sm studio-muted">
            New to Share Space?{' '}
            <Link to="/signup" className="font-semibold text-[var(--studio-text-2)] hover:text-[var(--studio-text)]">Create account with Google</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
