import React, { useState } from 'react'
import PageMeta from '../components/PageMeta'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, Send, CheckCircle } from 'lucide-react'
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    try {
      const result = await firebaseHelpers.submitReport(form)
      if (!result.success) {
        throw new Error(result.error || 'Report submission failed')
      }
      setStatus('success')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  return (
    <>
      <PageMeta 
        title="Report Content / DMCA - 3DShareSpace"
        description="Report IP infringement, inappropriate content, or other policy violations on 3DShareSpace."
        url="/report"
        type="website"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Report Content / DMCA</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Use this form to report IP infringement or policy violations. We review all reports promptly.</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
            {status === 'success' && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-green-800 dark:text-green-200">Thank you. Your report has been submitted.</span>
              </div>
            )}
            {status === 'error' && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                Submission failed. Please try again.
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Report Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="ip_infringement">IP Infringement (DMCA)</option>
                <option value="inappropriate">Inappropriate Content</option>
                <option value="other">Other Policy Violation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model ID (optional)</label>
              <input name="modelId" value={form.modelId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="e.g., abc123" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL (optional)</label>
              <input name="url" value={form.url} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Page URL" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Details</label>
              <textarea name="details" value={form.details} onChange={handleChange} rows={6} required className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="Describe the issue and provide any relevant information." />
            </div>
            <button type="submit" disabled={status === 'submitting'} className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
              <Send className="h-4 w-4 mr-2" />
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Report


