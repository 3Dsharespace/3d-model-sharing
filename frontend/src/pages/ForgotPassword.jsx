import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle, Loader2, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import PageMeta from '../components/PageMeta'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { resetPassword } = useAuth()

  const handleSubmit = async (event) => {
    event.preventDefault()
    const cleanEmail = email.trim()

    setError('')
    setSuccess('')

    if (!cleanEmail) {
      setError('Enter your email address.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Enter a valid email address.')
      return
    }

    try {
      setSubmitting(true)
      const result = await resetPassword(cleanEmail)

      if (result.success) {
        setSuccess('Reset link sent. Check your email inbox and spam folder, then open the link to choose a new password.')
      } else {
        setError(result.error || 'Could not send the reset link. Please try again.')
      }
    } catch (err) {
      setError('Could not send the reset link. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="studio-page flex items-center justify-center">
      <PageMeta
        title="Reset password | 3D ShareSpace"
        description="Reset your 3D ShareSpace account password."
        url="/forgot-password"
      />

      <div className="w-full max-w-[430px] border border-[#242424] bg-[#0a0a0a] p-7">
        <div className="mb-7">
          <p className="studio-kicker">Account recovery</p>
          <h1 className="mt-2 text-2xl font-semibold text-[#f5f5f5]">Reset password</h1>
          <p className="mt-2 text-sm leading-6 text-[#a3a3a3]">
            Enter your account email. We will send a secure Firebase reset link.
          </p>
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
            <label htmlFor="email" className="studio-label">Email address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373]" />
              <input
                id="email"
                className="studio-input pl-10"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
                disabled={submitting}
              />
            </div>
          </div>

          <button type="submit" className="studio-primary-button w-full" disabled={submitting}>
            {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending link</> : 'Send reset link'}
          </button>

          <div className="pt-2 text-center">
            <Link to="/login" className="inline-flex items-center text-sm font-semibold text-[#a3a3a3] hover:text-[#f5f5f5]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword
