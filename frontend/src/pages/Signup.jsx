import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import AgeVerification from '../components/compliance/AgeVerification'

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showAgeVerification, setShowAgeVerification] = useState(false)
  const [ageVerificationData, setAgeVerificationData] = useState(null)

  const { signup, signInWithGoogle, loading } = useAuth()
  const navigate = useNavigate()

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields')
      return false
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    return true
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (validateForm()) setShowAgeVerification(true)
  }

  const handleAgeVerificationComplete = async (verificationData) => {
    setAgeVerificationData(verificationData)
    setShowAgeVerification(false)

    try {
      const result = await signup(formData.email, formData.password, formData.username, verificationData)
      if (result.success) {
        setSuccess(
          verificationData.status === 'pending_parental_consent'
            ? 'Account request submitted. A parent or guardian consent email has been sent.'
            : 'Account created. Please check your email for verification.'
        )
        setTimeout(() => navigate('/login'), 3000)
      } else {
        setError(result.error || 'Signup failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }
  }

  const handleGoogleSignIn = async () => {
    setError('')
    setSuccess('')

    try {
      const result = await signInWithGoogle()
      if (result.success) {
        setSuccess('Signed in with Google.')
        setTimeout(() => navigate('/'), 1500)
      } else {
        setError(result.error || 'Google sign-in failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    }
  }

  return (
    <div className="studio-page flex items-center justify-center">
      <div className="w-full max-w-[460px] border border-[#242424] bg-[#0a0a0a] p-7">
        <div className="mb-7">
          <p className="studio-kicker">Account</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#f5f5f5]">Create account</h1>
          <p className="mt-2 text-sm leading-6 text-[#a3a3a3]">Upload models, manage your creator page, and download assets.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="flex gap-3 border border-red-950 bg-red-950/20 p-3 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex gap-3 border border-emerald-950 bg-emerald-950/20 p-3 text-sm text-emerald-200">
              <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label htmlFor="username" className="studio-label">Username</label>
            <input id="username" name="username" className="studio-input" value={formData.username} onChange={handleChange} disabled={loading} required />
          </div>
          <div>
            <label htmlFor="email" className="studio-label">Email address</label>
            <input id="email" name="email" type="email" className="studio-input" value={formData.email} onChange={handleChange} disabled={loading} required />
          </div>
          <div>
            <label htmlFor="password" className="studio-label">Password</label>
            <div className="relative">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} className="studio-input pr-10" value={formData.password} onChange={handleChange} disabled={loading} required />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#f5f5f5]" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-[#737373]">Must be at least 6 characters long.</p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="studio-label">Confirm password</label>
            <div className="relative">
              <input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} className="studio-input pr-10" value={formData.confirmPassword} onChange={handleChange} disabled={loading} required />
              <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#f5f5f5]" onClick={() => setShowConfirmPassword((value) => !value)}>
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button type="submit" className="studio-primary-button w-full" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account</> : 'Create account'}
          </button>
          <button type="button" className="studio-secondary-button w-full" onClick={handleGoogleSignIn} disabled={loading}>
            Continue with Google
          </button>

          <p className="pt-2 text-center text-sm text-[#737373]">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#a3a3a3] hover:text-[#f5f5f5]">Sign in</Link>
          </p>
          <p className="text-center text-xs leading-5 text-[#737373]">
            By creating an account, you agree to our <Link to="/terms" className="text-[#a3a3a3] hover:text-[#f5f5f5]">Terms</Link> and <Link to="/privacy" className="text-[#a3a3a3] hover:text-[#f5f5f5]">Privacy Policy</Link>.
          </p>
        </form>
      </div>

      {showAgeVerification && (
        <AgeVerification
          onVerificationComplete={handleAgeVerificationComplete}
          onCancel={() => {
            setShowAgeVerification(false)
            setAgeVerificationData(null)
          }}
        />
      )}
    </div>
  )
}

export default Signup
