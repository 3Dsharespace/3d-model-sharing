import React, { useState } from 'react'
import { Flag, AlertTriangle, Send, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { firebaseHelpers } from '../../lib/firebase'

const ReportButton = ({ contentType, contentId, contentTitle, contentAuthor }) => {
  const { user } = useAuth()
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const reportReasons = [
    { value: 'inappropriate', label: 'Inappropriate Content', description: 'Adult content, violence, or offensive material' },
    { value: 'copyright', label: 'Copyright Violation', description: 'Unauthorized use of copyrighted material' },
    { value: 'spam', label: 'Spam or Fake Content', description: 'Repetitive, fake, or low-quality content' },
    { value: 'harassment', label: 'Harassment or Abuse', description: 'Bullying, threats, or harmful behavior' },
    { value: 'underage', label: 'Underage User', description: 'User appears to be under 13 years old' },
    { value: 'misleading', label: 'Misleading Information', description: 'False or deceptive content description' },
    { value: 'other', label: 'Other', description: 'Other policy violation or concern' }
  ]

  const handleSubmitReport = async () => {
    if (!reportReason || !user) return

    setLoading(true)
    try {
      const reportData = {
        reporterId: user.uid,
        reporterEmail: user.email,
        contentType,
        contentId,
        contentTitle,
        contentAuthor,
        reason: reportReason,
        details: reportDetails,
        status: 'pending',
        createdAt: new Date().toISOString(),
        priority: reportReason === 'underage' ? 'high' : reportReason === 'inappropriate' ? 'medium' : 'normal'
      }

      const result = await firebaseHelpers.createReport(reportData)
      
      if (result.success) {
        setSubmitted(true)
        // Auto-close modal after 2 seconds
        setTimeout(() => {
          setShowReportModal(false)
          setSubmitted(false)
          setReportReason('')
          setReportDetails('')
        }, 2000)
      } else {
        console.error('Failed to submit report:', result.error)
      }
    } catch (error) {
      console.error('Error submitting report:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <>
      <button
        onClick={() => setShowReportModal(true)}
        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
        title="Report this content"
      >
        <Flag className="w-4 h-4" />
        <span>Report</span>
      </button>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {!submitted ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Report Content
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Help keep our community safe
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <strong>Reporting:</strong> {contentTitle}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      <strong>By:</strong> {contentAuthor}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        What's wrong with this content?
                      </label>
                      <div className="space-y-2">
                        {reportReasons.map((reason) => (
                          <label
                            key={reason.value}
                            className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                              reportReason === reason.value
                                ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name="reportReason"
                              value={reason.value}
                              checked={reportReason === reason.value}
                              onChange={(e) => setReportReason(e.target.value)}
                              className="mt-1 text-red-600 focus:ring-red-500"
                            />
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white text-sm">
                                {reason.label}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {reason.description}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Additional Details (Optional)
                      </label>
                      <textarea
                        value={reportDetails}
                        onChange={(e) => setReportDetails(e.target.value)}
                        placeholder="Provide any additional information that might help our review..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setShowReportModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitReport}
                      disabled={!reportReason || loading}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
                    >
                      <Send className="w-4 h-4" />
                      <span>{loading ? 'Submitting...' : 'Submit Report'}</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Report Submitted
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Thank you for helping keep our community safe. We'll review this content and take appropriate action.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ReportButton
