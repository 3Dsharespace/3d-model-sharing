import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import PageMeta from '../components/PageMeta'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const { user, login, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/'

  useEffect(() => {
    if (!loading && user) navigate(redirectTo, { replace: true })
  }, [loading, navigate, redirectTo, user])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    try {
      const result = await login(email, password)
      if (result.success) navigate(redirectTo, { replace: true })
      else setError(result.error || 'Login failed')
    } catch (err) {
      setError('An unexpected error occurred')
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')

    try {
      const result = await signInWithGoogle()
      if (result.success) navigate(redirectTo, { replace: true })
      else setError(result.error || 'Google sign-in failed')
    } catch (err) {
      setError('An unexpected error occurred')
    }
  }

  return (
    <div className="studio-page flex items-center justify-center">
      <PageMeta title="Log in | 3D ShareSpace" description="Log in to upload, download, and manage 3D models." url="/login" />

      <div className="w-full max-w-[430px] border border-[#242424] bg-[#0a0a0a] p-7">
        <div className="mb-7">
          <p className="studio-kicker">Account</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#f5f5f5]">Log in</h1>
          <p className="mt-2 text-sm leading-6 text-[#a3a3a3]">Access downloads, uploads, dashboard tools, and your creator profile.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="flex gap-3 border border-red-950 bg-red-950/20 p-3 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="studio-label">Email address</label>
            <input
              id="email"
              className="studio-input"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@example.com"
              disabled={loading}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="password" className="studio-label mb-0">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-[#a3a3a3] hover:text-[#f5f5f5]">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                id="password"
                className="studio-input pr-10"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Your password"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#f5f5f5]"
                onClick={() => setShowPassword((value) => !value)}
                disabled={loading}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" className="studio-primary-button w-full" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in</> : 'Sign in'}
          </button>

          <button type="button" className="studio-secondary-button w-full" onClick={handleGoogleSignIn} disabled={loading}>
            Continue with Google
          </button>

          <p className="pt-2 text-center text-sm text-[#737373]">
            New to 3D ShareSpace?{' '}
            <Link to="/signup" className="font-semibold text-[#a3a3a3] hover:text-[#f5f5f5]">Create an account</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
