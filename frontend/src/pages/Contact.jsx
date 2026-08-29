import React, { useState } from 'react'
import PageMeta from '../components/PageMeta'
import StudioDocument from '../components/StudioDocument'
import { firebaseHelpers } from '../lib/firebase'

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', type: 'support', subject: '', message: '' })
  const [status, setStatus] = useState('')
  const [ticketId, setTicketId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setStatus('')
    setError('')
    setTicketId('')

    try {
      const result = await firebaseHelpers.submitSupportRequest({
        ...formData,
        source: 'contact',
        priority: formData.type === 'bug' ? 'high' : 'medium',
        url: window.location.href
      })

      if (!result.success) throw new Error(result.error || 'Support request failed')

      setStatus('success')
      setTicketId(result.ticketId || '')
      setFormData({ name: '', email: '', type: 'support', subject: '', message: '' })
    } catch (submitError) {
      setStatus('error')
      setError(submitError.message || 'Could not send support request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageMeta
        title="Contact | 3D ShareSpace"
        description="Contact 3D ShareSpace for account, upload, report, or platform support."
        url="/contact"
        type="website"
      />
      <StudioDocument
        kicker="Support"
        title="Contact the studio desk"
        subtitle="Use this form for account problems, upload issues, rights concerns, or feedback about the asset library."
        aside={(
          <>
            <h2>Contact paths</h2>
            <ul>
              <li>Messages go directly to the admin dashboard.</li>
              <li>No Gmail account is required.</li>
              <li>Use reports for IP or policy issues.</li>
              <li>Include the model URL when the issue is about one asset.</li>
            </ul>
          </>
        )}
      >
        <form onSubmit={handleSubmit} className="studio-doc-content">
          {status === 'success' && (
            <div className="border border-green-900 bg-green-950/20 p-3 text-sm text-green-200">
              Message received in the admin panel{ticketId ? ` as ticket ${ticketId}` : ''}. We will review it and respond if needed.
            </div>
          )}
          {status === 'error' && (
            <div className="border border-red-950 bg-red-950/20 p-3 text-sm text-red-200">
              {error || 'Message could not be sent. Please try again.'}
            </div>
          )}
          <section className="studio-doc-grid">
            <div>
              <label className="studio-label" htmlFor="name">Name</label>
              <input id="name" name="name" required value={formData.name} onChange={handleChange} className="studio-input" placeholder="Your name" />
            </div>
            <div>
              <label className="studio-label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} className="studio-input" placeholder="you@example.com" />
            </div>
          </section>
          <section>
            <label className="studio-label" htmlFor="type">Request type</label>
            <select id="type" name="type" value={formData.type} onChange={handleChange} className="studio-select">
              <option value="support">General support</option>
              <option value="account">Account problem</option>
              <option value="upload">Upload problem</option>
              <option value="download">Download problem</option>
              <option value="bug">Website bug</option>
              <option value="feedback">Feedback</option>
            </select>
          </section>
          <section>
            <label className="studio-label" htmlFor="subject">Subject</label>
            <input id="subject" name="subject" required value={formData.subject} onChange={handleChange} className="studio-input" placeholder="What should we look at?" />
          </section>
          <section>
            <label className="studio-label" htmlFor="message">Message</label>
            <textarea id="message" name="message" required rows={7} value={formData.message} onChange={handleChange} className="studio-textarea" placeholder="Give us the model URL, account email, or exact issue if you have it." />
          </section>
          <button type="submit" disabled={loading} className="studio-primary-button">
            {loading ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </StudioDocument>
    </>
  )
}

export default Contact
