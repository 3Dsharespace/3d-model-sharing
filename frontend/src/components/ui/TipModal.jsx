import React, { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, IndianRupee, Loader2, MessageCircle, ShieldCheck, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { firebaseHelpers } from '../../lib/firebase'

const TipModal = ({
  creatorId,
  creatorName,
  modelId = null,
  modelTitle = null,
  onClose
}) => {
  const { user } = useAuth()
  const [selectedAmount, setSelectedAmount] = useState(100)
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const isProd = import.meta.env.PROD
  const [testMode, setTestMode] = useState(!isProd)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  const presetAmounts = [50, 100, 250, 500]

  const finalAmount = useMemo(() => {
    if (customAmount) return parseFloat(customAmount) || 0
    return selectedAmount || 0
  }, [customAmount, selectedAmount])

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount)
    setCustomAmount('')
    setError('')
  }

  const handleCustomAmountChange = (event) => {
    const value = event.target.value
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomAmount(value)
      setSelectedAmount(null)
      setError('')
    }
  }

  const handleTipSubmit = async () => {
    if (!user) {
      setError('Please log in to send a tip.')
      return
    }

    if (!creatorId) {
      setError('Creator account is missing.')
      return
    }

    if (user.uid === creatorId) {
      setError('You cannot tip your own account.')
      return
    }

    const amount = finalAmount
    if (amount < 10) {
      setError('Minimum tip amount is INR 10.')
      return
    }

    if (amount > 100000) {
      setError('Maximum tip amount is INR 100000.')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const tipPayload = {
        amount,
        currency: 'INR',
        creatorId,
        message: message.trim(),
        modelId,
        modelTitle,
        type: 'tip',
        testMode
      }

      if (testMode) {
        const testRes = await firebaseHelpers.sendTip(tipPayload)
        if (testRes.success) {
          setIsSuccess(true)
          setTimeout(() => onClose(), 2600)
        } else {
          setError(testRes.error || 'Could not record the test tip.')
        }
        return
      }

      const orderRes = await firebaseHelpers.createRazorpayOrder(tipPayload)

      if (!orderRes.success) {
        setError(orderRes.error || 'Failed to create payment order.')
        return
      }

      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://checkout.razorpay.com/v1/checkout.js'
          script.onload = resolve
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))
          document.body.appendChild(script)
        })
      }

      const options = {
        key: orderRes.key,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: '3D ShareSpace',
        description: 'Support a creator',
        order_id: orderRes.orderId,
        notes: { creatorId, modelId: modelId || '', modelTitle: modelTitle || '' },
        handler: async (response) => {
          try {
            const verifyRes = await firebaseHelpers.verifyRazorpayPayment({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              creatorId,
              amount,
              message: message.trim(),
              modelId,
              modelTitle,
              testMode: false
            })

            if (verifyRes.success) {
              setIsSuccess(true)
              setTimeout(() => onClose(), 2600)
            } else {
              setError(verifyRes.error || 'Payment verification failed.')
            }
          } catch (verificationError) {
            console.error('Verification error:', verificationError)
            setError('Payment verification failed.')
          }
        },
        prefill: {
          name: user?.displayName || user?.email?.split('@')[0] || 'User',
          email: user?.email || undefined,
          contact: user?.phoneNumber || undefined
        },
        image: '/favicon.svg',
        theme: { color: '#111111' },
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

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', (event) => {
        setError(event?.error?.description || 'Payment failed.')
      })
      razorpay.open()
    } catch (err) {
      setError('An unexpected error occurred.')
      console.error('Tip error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isSuccess) {
    return createPortal(
      <div className="tip-modal-overlay" onClick={onClose}>
        <section className="tip-modal tip-modal--success" onClick={(event) => event.stopPropagation()}>
          <CheckCircle size={38} />
          <h2>Tip sent</h2>
          <p>Your support has been recorded for {creatorName}.</p>
        </section>
      </div>,
      document.body
    )
  }

  return createPortal(
    <div className="tip-modal-overlay" onClick={onClose}>
      <section className="tip-modal" onClick={(event) => event.stopPropagation()}>
        <header className="tip-modal__header">
          <div>
            <p className="studio-kicker">Creator tip</p>
            <h2>Support {creatorName}</h2>
            {modelTitle && <span>For {modelTitle}</span>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close tip dialog">
            <X size={18} />
          </button>
        </header>

        <div className="tip-modal__body">
          <div className="tip-mode-row">
            <span>Test mode</span>
            <label>
              <input type="checkbox" checked={testMode} onChange={(event) => setTestMode(event.target.checked)} />
              <strong>{testMode ? 'On' : 'Off'}</strong>
            </label>
          </div>

          <div>
            <label className="tip-modal__label">Amount</label>
            <div className="tip-amount-grid">
              {presetAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => handleAmountSelect(amount)}
                  className={selectedAmount === amount && !customAmount ? 'is-active' : ''}
                >
                  INR {amount}
                </button>
              ))}
            </div>
          </div>

          <label className="tip-input-row">
            <IndianRupee size={16} />
            <input
              type="text"
              value={customAmount}
              onChange={handleCustomAmountChange}
              placeholder="Custom amount"
            />
          </label>

          <label className="tip-message-row">
            <MessageCircle size={16} />
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Add a short note"
              rows={3}
              maxLength={200}
            />
          </label>

          {error && <div className="tip-modal__error">{error}</div>}

          <div className="tip-summary">
            <div>
              <span>Tip amount</span>
              <strong>INR {finalAmount.toFixed(2)}</strong>
            </div>
            <div>
              <span>Platform fee</span>
              <strong>INR {(finalAmount * 0.15).toFixed(2)}</strong>
            </div>
            <div>
              <span>Creator receives</span>
              <strong>INR {(finalAmount * 0.85).toFixed(2)}</strong>
            </div>
          </div>

          <p className="tip-secure-note">
            <ShieldCheck size={14} />
            Payments are securely processed by Razorpay.
          </p>
        </div>

        <footer className="tip-modal__footer">
          <button type="button" className="studio-button studio-button--secondary" onClick={onClose}>Cancel</button>
          <button
            type="button"
            className="studio-button studio-button--primary"
            onClick={handleTipSubmit}
            disabled={finalAmount < 10 || isProcessing}
          >
            {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {testMode ? 'Test tip' : `Send INR ${finalAmount.toFixed(0)}`}
          </button>
        </footer>
      </section>
    </div>,
    document.body
  )
}

export default TipModal
