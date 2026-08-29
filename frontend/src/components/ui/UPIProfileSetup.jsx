import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { firebaseHelpers } from '../../lib/firebase'
import { 
  Smartphone, 
  QrCode, 
  Copy, 
  Check, 
  Save, 
  AlertCircle,
  ExternalLink,
  Download,
  Loader2,
  Shield,
  IndianRupee,
  Clock,
  Lock,
  FileText,
  CheckCircle2,
  XCircle
} from 'lucide-react'

const UPIProfileSetup = ({ onClose }) => {
  const { user } = useAuth()
  const [upiId, setUpiId] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  
  // New UPI enhancement states
  const [activeTab, setActiveTab] = useState('basic')
  const [verificationStatus, setVerificationStatus] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [microPayoutStatus, setMicroPayoutStatus] = useState(null)
  const [microPayoutLoading, setMicroPayoutLoading] = useState(false)
  const [payoutSchedule, setPayoutSchedule] = useState('instant')
  const [defaultMethod, setDefaultMethod] = useState('upi')
  const [savingSettings, setSavingSettings] = useState(false)
  const [withdrawalPin, setWithdrawalPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [settingPin, setSettingPin] = useState(false)
  const [legalName, setLegalName] = useState('')
  const [pan, setPan] = useState('')
  const [savingKyc, setSavingKyc] = useState(false)

  // Load existing UPI profile
  useEffect(() => {
    const loadUPIProfile = async () => {
      if (!user) return
      
      setLoading(true)
      try {
        const result = await firebaseHelpers.getUserProfile(user.uid)
        if (result.success && result.profile) {
          const profile = result.profile
          setUpiId(profile.upiId || '')
          setDisplayName(profile.displayName || profile.username || '')
          setPayoutSchedule(profile.payoutSchedule || 'instant')
          setDefaultMethod(profile.defaultPayoutMethod || 'upi')
          setLegalName(profile.kycLegalName || '')
          
          // Set verification status if available
          if (profile.upiVerified) {
            setVerificationStatus({
              verified: true,
              source: profile.upiVerificationSource || 'unknown',
              timestamp: profile.upiVerifiedAt
            })
          }
        }
      } catch (err) {
        console.error('Error loading UPI profile:', err)
      } finally {
        setLoading(false)
      }
    }

    loadUPIProfile()
  }, [user])

  // Generate QR code URL
  useEffect(() => {
    if (upiId && displayName) {
      const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(displayName)}&tn=Tip%20for%20your%20work&cu=INR`
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`
      setQrCodeUrl(qrApiUrl)
    }
  }, [upiId, displayName])

  const validateUPIId = (id) => {
    // Basic UPI ID validation
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/
    return upiRegex.test(id)
  }

  const handleSave = async (e) => {
    e.preventDefault() // Prevent form submission
    e.stopPropagation() // Stop event bubbling
    
    setError('')
    setSuccess('')

    if (!upiId.trim()) {
      setError('Please enter your UPI ID')
      return
    }

    if (!validateUPIId(upiId)) {
      setError('Please enter a valid UPI ID (e.g., username@bank)')
      return
    }

    setSaving(true)
    try {
      const result = await firebaseHelpers.updateUserProfile(user.uid, {
        upiId: upiId.trim(),
        displayName: displayName.trim() || user.displayName || user.email?.split('@')[0]
      })

      if (result.success) {
        setSuccess('UPI profile saved successfully!')
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setError(result.error || 'Failed to save UPI profile')
      }
    } catch (err) {
      console.error('Error saving UPI profile:', err)
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const copyUPIId = () => {
    navigator.clipboard.writeText(upiId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a')
      link.href = qrCodeUrl
      link.download = `upi-qr-${displayName || 'user'}.png`
      link.click()
    }
  }

  // Verify UPI VPA
  const handleVerifyUPI = async () => {
    if (!upiId || !validateUPIId(upiId)) {
      setError('Please enter a valid UPI ID first')
      return
    }

    setVerifying(true)
    setError('')
    try {
      const result = await firebaseHelpers.verifyUpiVpa({ 
        userId: user.uid, 
        upiId: upiId.trim() 
      })
      
      if (result.success) {
        setVerificationStatus({
          verified: result.verified,
          formatValid: result.formatValid,
          accountHolder: result.accountHolder,
          source: result.verified ? 'live_api' : 'format_only',
          timestamp: new Date().toISOString()
        })
        setSuccess(result.verified ? 
          `✅ UPI verified${result.accountHolder ? ` for ${result.accountHolder}` : ''}` : 
          '✅ UPI format validated'
        )
      } else {
        setError(result.error || 'Verification failed')
        setVerificationStatus({ verified: false, reason: result.reason })
      }
    } catch (err) {
      setError('Failed to verify UPI ID')
      console.error('UPI verification error:', err)
    } finally {
      setVerifying(false)
    }
  }

  // Test micro payout
  const handleMicroPayout = async () => {
    if (!upiId || !validateUPIId(upiId)) {
      setError('Please set and verify your UPI ID first')
      return
    }

    setMicroPayoutLoading(true)
    setError('')
    try {
      const result = await firebaseHelpers.initiateMicroPayout({ userId: user.uid })
      
      if (result.success) {
        setMicroPayoutStatus({
          status: result.status,
          timestamp: new Date().toISOString()
        })
        setSuccess(`🎉 ₹1 test ${result.status === 'verified_via_api' ? 'verified via API' : 'simulated successfully'}`)
      } else {
        setError(result.error || 'Micro payout failed')
      }
    } catch (err) {
      setError('Failed to initiate test payout')
      console.error('Micro payout error:', err)
    } finally {
      setMicroPayoutLoading(false)
    }
  }

  // Save payout settings
  const handleSaveSettings = async () => {
    setSavingSettings(true)
    setError('')
    try {
      const result = await firebaseHelpers.updatePayoutSettings({
        userId: user.uid,
        schedule: payoutSchedule,
        defaultMethod
      })
      
      if (result.success) {
        setSuccess('✅ Payout settings saved')
      } else {
        setError(result.error || 'Failed to save settings')
      }
    } catch (err) {
      setError('Failed to save payout settings')
      console.error('Settings save error:', err)
    } finally {
      setSavingSettings(false)
    }
  }

  // Set withdrawal PIN
  const handleSetPin = async () => {
    if (!withdrawalPin || withdrawalPin.length < 4) {
      setError('PIN must be at least 4 digits')
      return
    }
    if (withdrawalPin !== confirmPin) {
      setError('PINs do not match')
      return
    }

    setSettingPin(true)
    setError('')
    try {
      const result = await firebaseHelpers.setWithdrawalPin({
        userId: user.uid,
        pin: withdrawalPin
      })
      
      if (result.success) {
        setSuccess('🔐 Withdrawal PIN set successfully')
        setWithdrawalPin('')
        setConfirmPin('')
      } else {
        setError(result.error || 'Failed to set PIN')
      }
    } catch (err) {
      setError('Failed to set withdrawal PIN')
      console.error('PIN set error:', err)
    } finally {
      setSettingPin(false)
    }
  }

  // Save KYC info
  const handleSaveKyc = async () => {
    if (!legalName || legalName.length < 3) {
      setError('Legal name must be at least 3 characters')
      return
    }
    if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase())) {
      setError('Invalid PAN format (e.g., ABCDE1234F)')
      return
    }

    setSavingKyc(true)
    setError('')
    try {
      const result = await firebaseHelpers.updateKycLite({
        userId: user.uid,
        legalName: legalName.trim(),
        pan: pan.toUpperCase()
      })
      
      if (result.success) {
        setSuccess('📋 KYC information saved')
      } else {
        setError(result.error || 'Failed to save KYC')
      }
    } catch (err) {
      setError('Failed to save KYC information')
      console.error('KYC save error:', err)
    } finally {
      setSavingKyc(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        <p className="ml-3 text-gray-600 dark:text-gray-400">Loading UPI profile...</p>
      </div>
    )
  }

  const tabs = [
    { id: 'basic', label: 'Basic Setup', icon: Smartphone },
    { id: 'verify', label: 'Verification', icon: Shield },
    { id: 'settings', label: 'Payout Settings', icon: Clock },
    { id: 'security', label: 'Security PIN', icon: Lock },
    { id: 'kyc', label: 'KYC Info', icon: FileText }
  ]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <Smartphone className="h-6 w-6 mr-2 text-blue-600" />
          Advanced UPI Payment Setup
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ×
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Basic Setup Tab */}
        {activeTab === 'basic' && (
          <>
            {/* UPI ID Input */}
            <div>
              <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your UPI ID *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="upiId"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="username@bank (e.g., john@paytm, jane@ybl)"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                />
                {upiId && (
                  <button
                    onClick={copyUPIId}
                    className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    title="Copy UPI ID"
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Enter your UPI ID to receive tips directly in your bank account
              </p>
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Display Name for Payments
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name as it appears in UPI apps"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* QR Code Preview */}
            {upiId && displayName && validateUPIId(upiId) && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                  <QrCode className="h-5 w-5 mr-2" />
                  Your UPI QR Code
                </h3>
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="flex-shrink-0">
                    {qrCodeUrl && (
                      <img
                        src={qrCodeUrl}
                        alt="UPI QR Code"
                        className="w-32 h-32 border border-gray-300 dark:border-gray-600 rounded-lg"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Users can scan this QR code to send you tips via any UPI app:
                    </p>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• PhonePe</li>
                      <li>• Google Pay</li>
                      <li>• Paytm</li>
                      <li>• BHIM</li>
                      <li>• Any UPI-enabled app</li>
                    </ul>
                    <button
                      onClick={downloadQRCode}
                      className="mt-3 inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download QR Code
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Verification Tab */}
        {activeTab === 'verify' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                UPI Verification & Testing
              </h3>
              
              {/* Verification Status */}
              {verificationStatus && (
                <div className={`p-4 rounded-lg mb-4 ${verificationStatus.verified ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                  <div className="flex items-center">
                    {verificationStatus.verified ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <div>
                      <p className={`font-medium ${verificationStatus.verified ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                        {verificationStatus.verified ? 'UPI Verified' : 'Verification Failed'}
                      </p>
                      {verificationStatus.accountHolder && (
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Account holder: {verificationStatus.accountHolder}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Source: {verificationStatus.source} • {new Date(verificationStatus.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Verify UPI Button */}
                <button
                  onClick={handleVerifyUPI}
                  disabled={verifying || !upiId || !validateUPIId(upiId)}
                  className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Verify UPI ID
                    </>
                  )}
                </button>

                {/* Test Micro Payout Button */}
                <button
                  onClick={handleMicroPayout}
                  disabled={microPayoutLoading || !upiId || !validateUPIId(upiId)}
                  className="flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium"
                >
                  {microPayoutLoading ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <IndianRupee className="h-4 w-4 mr-2" />
                      Test ₹1 Payout
                    </>
                  )}
                </button>
              </div>

              {/* Micro Payout Status */}
              {microPayoutStatus && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mr-2" />
                    <div>
                      <p className="font-medium text-blue-800 dark:text-blue-200">
                        Test Payout Status: {microPayoutStatus.status}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">
                        {new Date(microPayoutStatus.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Verify UPI ID:</strong> Validates your UPI address with live banking APIs when possible.<br/>
                <strong>Test ₹1 Payout:</strong> Simulates a micro-transaction to confirm your UPI setup works.
              </p>
            </div>
          </div>
        )}

        {/* Payout Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Payout Schedule & Preferences
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payout Schedule */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payout Schedule
                </label>
                <select
                  value={payoutSchedule}
                  onChange={(e) => setPayoutSchedule(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="instant">Instant (2-4 hours)</option>
                  <option value="weekly">Weekly (Every Monday)</option>
                  <option value="monthly">Monthly (1st of month)</option>
                </select>
              </div>

              {/* Default Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Payout Method
                </label>
                <select
                  value={defaultMethod}
                  onChange={(e) => setDefaultMethod(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="upi">UPI Transfer</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </button>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Schedule Details:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• <strong>Instant:</strong> Processed within 2-4 hours (higher fees)</li>
                <li>• <strong>Weekly:</strong> Batched every Monday (standard fees)</li>
                <li>• <strong>Monthly:</strong> Processed on 1st of month (lowest fees)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Security PIN Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <Lock className="h-5 w-5 mr-2 text-red-600" />
              Withdrawal Security PIN
            </h3>
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Security Notice:</strong> Once set, you'll need to enter this PIN for all withdrawal requests.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New PIN (4-6 digits)
                </label>
                <input
                  type="password"
                  value={withdrawalPin}
                  onChange={(e) => setWithdrawalPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 4-6 digit PIN"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Confirm PIN"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleSetPin}
              disabled={settingPin || !withdrawalPin || withdrawalPin !== confirmPin}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg font-medium"
            >
              {settingPin ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Setting PIN...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Set Withdrawal PIN
                </>
              )}
            </button>
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              KYC-Lite Information
            </h3>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Privacy:</strong> Your PAN is masked and hashed for security. Only you can see the full details.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Legal Name (as per PAN)
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Full legal name"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={pan}
                  onChange={(e) => setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                  placeholder="ABCDE1234F"
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Format: 5 letters + 4 digits + 1 letter
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveKyc}
              disabled={savingKyc || !legalName || !pan}
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg font-medium"
            >
              {savingKyc ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Save KYC Info
                </>
              )}
            </button>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-2 text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
            <div className="flex">
              <Check className="h-5 w-5 text-green-400" />
              <p className="ml-2 text-sm text-green-700 dark:text-green-400">{success}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onClose()
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
          >
            Close
          </button>
          
          {activeTab === 'basic' && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !upiId.trim()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Basic UPI Info
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default UPIProfileSetup
