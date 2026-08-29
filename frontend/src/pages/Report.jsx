import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageMeta from '../components/PageMeta'
import StudioDocument from '../components/StudioDocument'
import { firebaseHelpers } from '../lib/firebase'

const Report = () => {
  const [searchParams] = useSearchParams()
  const defaultModelId = searchParams.get('modelId') || ''
  const [form, setForm] = useState({
    type: 'ip_infringement',
    modelId: defaultModelId,
    url: window.location.origin + (defaultModelId ? `/model/${defaultModelId}` : ''),
    email: '',
    details: ''
  })
  const [status, setStatus] = useState('idle')

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('submitting')
    try {
      const result = await firebaseHelpers.submitReport(form)
      if (!result.success) throw new Error(result.error || 'Report submission failed')
      setStatus('success')
    } catch (error) {
      setStatus('error')
    }
  }

  return (
    <>
      <PageMeta
        title="Report Content | 3D ShareSpace"
        description="Report IP infringement, inappropriate content, or other policy issues on 3D ShareSpace."
        url="/report"
        type="website"
      />
      <StudioDocument
        kicker="Reports"
        title="Report a model or policy issue"
        subtitle="Send enough detail for review: the model URL, rights concern, and how we can contact you."
        aside={(
          <>
            <h2>Review scope</h2>
            <ul>
              <li>IP infringement or DMCA concerns.</li>
              <li>Inappropriate model content.</li>
              <li>Incorrect attribution or misleading uploads.</li>
              <li>Other platform policy issues.</li>
            </ul>
          </>
        )}
      >
        <form onSubmit={handleSubmit} className="studio-doc-content">
          {status === 'success' && <div className="border border-green-900 bg-green-950/20 p-3 text-sm text-green-200">Report submitted. Thank you.</div>}
          {status === 'error' && <div className="border border-red-950 bg-red-950/20 p-3 text-sm text-red-200">Submission failed. Please check the details and try again.</div>}
          <section>
            <label className="studio-label" htmlFor="type">Report type</label>
            <select id="type" name="type" value={form.type} onChange={handleChange} className="studio-select">
              <option value="ip_infringement">IP infringement / DMCA</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="other">Other policy issue</option>
            </select>
          </section>
          <section className="studio-doc-grid">
            <div>
              <label className="studio-label" htmlFor="modelId">Model ID</label>
              <input id="modelId" name="modelId" value={form.modelId} onChange={handleChange} className="studio-input" placeholder="Optional" />
            </div>
            <div>
              <label className="studio-label" htmlFor="email">Contact email</label>
              <input id="email" type="email" name="email" required value={form.email} onChange={handleChange} className="studio-input" placeholder="you@example.com" />
            </div>
          </section>
          <section>
            <label className="studio-label" htmlFor="url">URL</label>
            <input id="url" name="url" value={form.url} onChange={handleChange} className="studio-input" placeholder="Page URL" />
          </section>
          <section>
            <label className="studio-label" htmlFor="details">Details</label>
            <textarea id="details" name="details" required rows={7} value={form.details} onChange={handleChange} className="studio-textarea" placeholder="Describe the issue and include any proof, references, or model links." />
          </section>
          <button type="submit" disabled={status === 'submitting'} className="studio-primary-button">
            {status === 'submitting' ? 'Submitting...' : 'Submit report'}
          </button>
        </form>
      </StudioDocument>
    </>
  )
}

export default Report
