import React, { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../../contexts/AuthContext'
import { firebaseHelpers } from '../../lib/firebase'
import { 
  X, 
  Heart, 
  Coffee, 
  Gift, 
  Star, 
  CheckCircle, 
  Loader2,
  MessageCircle,
  DollarSign
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TipModal = ({ 
  creatorId, 
  creatorName, 
  modelId = null, 
  modelTitle = null,
  onClose 
}) => {
  const { user } = useAuth()
  const [selectedAmount, setSelectedAmount] = useState(50)
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const isProd = import.meta.env.PROD
  const [testMode, setTestMode] = useState(!isProd) // Default ON in dev, OFF in prod
  const [step, setStep] = useState(1) // 1 amount, 2 message, 3 pay

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const presetAmounts = [
    { amount: 50, label: '₹50', icon: Coffee, color: 'bg-green-500' },
    { amount: 100, label: '₹100', icon: Heart, color: 'bg-pink-500' },
    { amount: 250, label: '₹250', icon: Gift, color: 'bg-purple-500' },
    { amount: 500, label: '₹500', icon: Star, color: 'bg-yellow-500' }
  ]

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount)
    setCustomAmount('')
    setError('')
  }

  const handleCustomAmountChange = (e) => {
    const value = e.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value)
      setSelectedAmount(null)
      setError('')
    }
  }

  const finalAmount = useMemo(() => {
    if (customAmount) return parseFloat(customAmount) || 0
    return selectedAmount || 0
  }, [customAmount, selectedAmount])

  const handleTipSubmit = async () => {
    if (!user) {
      setError('Please log in to send a tip')
      return
    }

    const amount = finalAmount
    if (amount < 10) {
      setError('Minimum tip amount is ₹10')
      return
    }

    if (amount > 100000) {
      setError('Maximum tip amount is ₹100000')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      // 1) Create Razorpay order (amount in INR)
      let orderRes = await firebaseHelpers.createRazorpayOrder({
        amount,
        currency: 'INR',
        creatorId,
        message: message.trim(),
        type: 'tip',
        testMode
      })
      // Auto-fallback to test mode if live keys are not configured
      if (!orderRes.success && !testMode) {
        orderRes = await firebaseHelpers.createRazorpayOrder({
          amount,
          currency: 'INR',
          creatorId,
          message: message.trim(),
          type: 'tip',
          testMode: true
        })
        if (orderRes.success) {
          setTestMode(true)
        }
      }
      if (!orderRes.success) {
        setError(orderRes.error || 'Failed to create payment order. Try Test Mode.')
        return
      }

      // 2) Load Razorpay script if not present
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const s = document.createElement('script')
          s.src = 'https://checkout.razorpay.com/v1/checkout.js'
          s.onload = resolve
          s.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
          document.body.appendChild(s)
        })
      }

      // 3) Open Razorpay
      const options = {
        key: orderRes.key,
        amount: orderRes.amount, // in paise
        currency: orderRes.currency,
        name: '3D ShareSpace',
        description: (testMode || orderRes.testMode) ? 'Test Payment (no charge)' : 'Support a creator',
        order_id: orderRes.orderId,
        notes: { creatorId, modelId: modelId || '', testMode: String(testMode) },
        handler: async function (response) {
          try {
            const verifyRes = await firebaseHelpers.verifyRazorpayPayment({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              creatorId,
              amount: orderRes.amount,
              message: message.trim(),
              testMode: (testMode || orderRes.testMode)
            })
            if (verifyRes.success) {
              setIsSuccess(true)
              // keep open for animation; auto close after 3.5s
              setTimeout(() => onClose(), 3500)
            } else {
              setError(verifyRes.error || 'Payment verification failed')
            }
          } catch (e) {
            console.error('Verification error:', e)
            setError('Payment verification failed')
          }
        },
        prefill: {
          name: user?.displayName || user?.email?.split('@')[0] || 'User',
          email: user?.email || undefined,
          contact: user?.phoneNumber || undefined
        },
        image: '/favicon.svg',
        theme: { color: '#7c3aed' },
        // Hide QR; show UPI Intent and UPI ID (collect) only
        config: {
          display: {
            blocks: {
              upi: {
                name: 'UPI',
                instruments: [
                  { method: 'upi', flows: ['intent'] },
                  { method: 'upi', flows: ['collect'] }
                ]
              }
            },
            sequence: ['block.upi'],
            preferences: { show_default_blocks: false }
          }
        }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (e) {
        setError(e?.error?.description || 'Payment failed')
      })
      rzp.open()
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Tip error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const Confetti = () => {
    const pieces = Array.from({ length: 24 })
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {pieces.map((_, i) => {
          const left = Math.random() * 100
          const delay = Math.random() * 0.4
          const distance = 120 + Math.random() * 120
          const rotate = Math.random() * 360
          return (
            <motion.div
              key={i}
              initial={{ y: -10, opacity: 0, left: `${left}%`, rotate: 0 }}
              animate={{ y: distance, opacity: [0, 1, 1, 0], rotate }}
              transition={{ duration: 1.6 + Math.random() * 0.8, delay }}
              className="absolute top-0 w-2 h-3 rounded-sm"
              style={{ background: ['#ef4444','#10b981','#f59e0b','#3b82f6','#a855f7'][i % 5] }}
            />
          )
        })}
      </div>
    )
  }

  if (isSuccess) {
    return createPortal(
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        onClick={onClose}
        style={{ 
          zIndex: 999999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl p-10 max-w-md w-full text-center relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ zIndex: 1000000 }}
        >
          <Confetti />
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14 }}>
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          </motion.div>
          <motion.h3 initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-2xl font-extrabold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
            Thank you!
          </motion.h3>
          <motion.p initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-gray-600 dark:text-gray-300">
            Your tip helps {creatorName} keep creating awesome 3D models.
          </motion.p>
          <div className="mt-6 flex items-center justify-center gap-2 text-pink-500">
            <motion.span animate={{ y: [0,-4,0] }} transition={{ repeat: Infinity, duration: 1.2 }}>❤</motion.span>
            <motion.span animate={{ y: [0,-6,0] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }}>❤</motion.span>
            <motion.span animate={{ y: [0,-5,0] }} transition={{ repeat: Infinity, duration: 1.3, delay: 0.4 }}>❤</motion.span>
          </div>
        </div>
      </div>,
      document.body
    )
  }

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{ 
        zIndex: 999999,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >
      <div 
        className="bg-luxury-bg-card dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 1000000 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg mr-3">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tip {creatorName}
              </h3>
              {modelTitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  for "{modelTitle}"
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Test Mode Toggle */}
          <div className="mb-4 flex items-center justify-between">
            <label className="text-sm text-gray-600 dark:text-gray-400">Test Mode (no charge)</label>
            <input type="checkbox" checked={testMode} onChange={(e) => setTestMode(e.target.checked)} />
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-3 mb-4 text-sm">
            {[1,2,3].map(s => (
              <div key={s} className={`h-2 rounded-full transition-all ${step >= s ? 'bg-gradient-to-r from-pink-500 to-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`} style={{ width: s === step ? 40 : 24 }} />
            ))}
          </div>

          {/* Preset Amounts */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Choose an amount</h4>
            <div className="grid grid-cols-4 gap-2">
              {[50,100,250,500].map(a => (
                <button
                  key={a}
                  onClick={() => { setSelectedAmount(a); setCustomAmount(''); setStep(2) }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedAmount===a && !customAmount ? 'bg-pink-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                >₹{a}</button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div className="mb-6">
            <input
              type="range"
              min="10"
              max="10000"
              step="10"
              value={customAmount ? Number(customAmount) : selectedAmount}
              onChange={(e)=>{ setCustomAmount(''); setSelectedAmount(Number(e.target.value)); setStep(2) }}
              className="w-full accent-pink-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>₹10</span><span>₹10,000</span>
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Or enter a custom amount
            </h4>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 border border-luxury-border-light dark:border-gray-600 rounded-lg bg-luxury-bg-card dark:bg-gray-700 text-luxury-text-primary dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </div>

          {/* Message */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Add a message (optional)
            </h4>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Say something nice..."
                rows={3}
                maxLength={200}
                className="w-full pl-10 pr-4 py-3 border border-luxury-border-light dark:border-gray-600 rounded-lg bg-luxury-bg-card dark:bg-gray-700 text-luxury-text-primary dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none"
              />
            </div>
            <div className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
              {message.length}/200
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Summary */}
          {finalAmount > 0 && (
            <div className="mb-6 p-4 bg-luxury-bg-secondary dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-luxury-text-secondary dark:text-gray-400">Tip Amount:</span>
                <span className="text-lg font-semibold text-luxury-text-primary dark:text-white">
                  ₹{finalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-sm text-luxury-text-secondary dark:text-gray-400">Platform Fee (15%):</span>
                <span className="text-sm text-luxury-text-secondary dark:text-gray-400">
                  -₹{(finalAmount * 0.15).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <span className="text-sm font-medium text-luxury-text-primary dark:text-white">Creator Receives:</span>
                <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                  ₹{(finalAmount * 0.85).toFixed(2)}
                </span>
              </div>
            </div>
          )}
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Payments are securely processed by Razorpay.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleTipSubmit}
            disabled={finalAmount < 10 || isProcessing}
            className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                {testMode ? 'Test Tip' : `Send ₹${finalAmount.toFixed(0)}`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default TipModal
