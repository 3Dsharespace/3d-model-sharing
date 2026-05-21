import React, { useState, useEffect } from 'react'
import { X, Smartphone, QrCode, Copy, Check, ExternalLink, Loader2, AlertCircle, Heart } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { firebaseHelpers } from '../../lib/firebase'

const UPITipModal = ({ creatorId, creatorName, modelId, modelTitle, onClose }) => {
  const { user } = useAuth()
  const [amount, setAmount] = useState(50) // Default ₹50 for Indian users
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [creatorUPI, setCreatorUPI] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')

  const presetAmounts = [25, 50, 100, 250, 500, 1000] // Indian currency amounts

  // Load creator's UPI information
  useEffect(() => {
    const loadCreatorUPI = async () => {
      if (!creatorId) return
      
      setLoading(true)
      try {
        const result = await firebaseHelpers.getUserProfile(creatorId)
        if (result.success && result.profile?.upiId) {
          setCreatorUPI({
            upiId: result.profile.upiId,
            displayName: result.profile.displayName || result.profile.username || creatorName
          })
        } else {
          setError('Creator has not set up UPI payments yet')
        }
      } catch (err) {
        console.error('Error loading creator UPI:', err)
        setError('Failed to load creator payment information')
      } finally {
        setLoading(false)
      }
    }

    loadCreatorUPI()
  }, [creatorId, creatorName])

  // Generate UPI payment URL and QR code
  useEffect(() => {
    if (creatorUPI && amount > 0) {
      const finalAmount = customAmount !== '' ? parseFloat(customAmount) : amount
      const upiUrl = `upi://pay?pa=${encodeURIComponent(creatorUPI.upiId)}&pn=${encodeURIComponent(creatorUPI.displayName)}&tn=${encodeURIComponent(message || `Tip for ${modelTitle || creatorName}`)}&am=${finalAmount}&cu=INR`
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`
      setQrCodeUrl(qrApiUrl)
    }
  }, [creatorUPI, amount, customAmount, message, modelTitle, creatorName])

  const handleAmountChange = (e) => {
    setAmount(parseFloat(e.target.value))
    setCustomAmount('')
  }

  const handleCustomAmountChange = (e) => {
    const value = e.target.value
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setCustomAmount(value)
      setAmount(value === '' ? 0 : parseFloat(value))
    }
  }

  const copyUPIId = () => {
    if (creatorUPI?.upiId) {
      navigator.clipboard.writeText(creatorUPI.upiId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const openUPIApp = () => {
    if (creatorUPI && amount > 0) {
      const finalAmount = customAmount !== '' ? parseFloat(customAmount) : amount
      const upiUrl = `upi://pay?pa=${encodeURIComponent(creatorUPI.upiId)}&pn=${encodeURIComponent(creatorUPI.displayName)}&tn=${encodeURIComponent(message || `Tip for ${modelTitle || creatorName}`)}&am=${finalAmount}&cu=INR`
      window.open(upiUrl, '_blank')
    }
  }

  if (loading) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            <p className="ml-3 text-gray-600 dark:text-gray-400">Loading payment options...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Error</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-2 text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center mb-4">
          <Heart className="h-6 w-6 text-pink-500 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Send UPI Tip to {creatorName}
          </h2>
        </div>

        {modelTitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            For their model: <span className="font-medium">{modelTitle}</span>
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Amount Selection */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Choose tip amount (₹):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => { setAmount(preset); setCustomAmount(''); }}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      amount === preset && customAmount === ''
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="custom-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Or enter custom amount (₹):
              </label>
              <input
                type="text"
                id="custom-amount"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                placeholder="100.00"
                value={customAmount}
                onChange={handleCustomAmountChange}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message (optional):
              </label>
              <textarea
                id="message"
                rows="3"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Say thanks or leave a note..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>

          {/* Right Column - Payment Options */}
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                <Smartphone className="h-5 w-5 mr-2" />
                Payment Options
              </h3>

              {/* UPI ID Display */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Creator's UPI ID:
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-mono">
                    {creatorUPI?.upiId}
                  </code>
                  <button
                    onClick={copyUPIId}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Copy UPI ID"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* QR Code */}
              {qrCodeUrl && (
                <div className="text-center mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Scan QR code with any UPI app:
                  </p>
                  <img
                    src={qrCodeUrl}
                    alt="UPI QR Code"
                    className="w-32 h-32 mx-auto border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              )}

              {/* Payment Buttons */}
              <div className="space-y-2">
                <button
                  onClick={openUPIApp}
                  disabled={!creatorUPI || amount <= 0}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open UPI App (₹{customAmount !== '' ? parseFloat(customAmount) : amount})
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  Works with PhonePe, Google Pay, Paytm, BHIM, and all UPI apps
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                How to pay:
              </h4>
              <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>1. Scan the QR code or copy the UPI ID</li>
                <li>2. Open your UPI app (PhonePe, Google Pay, etc.)</li>
                <li>3. Enter the amount: ₹{customAmount !== '' ? parseFloat(customAmount) : amount}</li>
                <li>4. Add your message and complete the payment</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UPITipModal
