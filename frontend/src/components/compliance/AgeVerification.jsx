import React, { useState } from 'react'
import { Users, Shield, AlertCircle, Calendar, CheckCircle, ExternalLink } from 'lucide-react'

const AgeVerification = ({ onVerificationComplete, onCancel }) => {
  const [birthDate, setBirthDate] = useState('')
  const [parentalConsent, setParentalConsent] = useState(false)
  const [step, setStep] = useState('age-check') // 'age-check', 'parental-consent', 'verification-failed'
  const [isMinor, setIsMinor] = useState(false)
  const [parentEmail, setParentEmail] = useState('')
  const [parentName, setParentName] = useState('')
  const [loading, setLoading] = useState(false)

  const calculateAge = (birthDate) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  const handleAgeCheck = () => {
    if (!birthDate) return
    
    const age = calculateAge(birthDate)
    
    if (age < 13) {
      setStep('verification-failed')
      return
    }
    
    if (age < 18) {
      setIsMinor(true)
      setStep('parental-consent')
      return
    }
    
    // User is 18 or older
    onVerificationComplete({
      age,
      isMinor: false,
      requiresParentalConsent: false,
      birthDate,
      verifiedAt: new Date().toISOString()
    })
  }

  const handleParentalConsent = async () => {
    if (!parentEmail || !parentName || !parentalConsent) return
    
    setLoading(true)
    
    try {
      // In a real implementation, you would:
      // 1. Send email to parent with consent form
      // 2. Generate a unique consent token
      // 3. Store pending verification in database
      // 4. Wait for parent to complete consent process
      
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const age = calculateAge(birthDate)
      onVerificationComplete({
        age,
        isMinor: true,
        requiresParentalConsent: true,
        birthDate,
        parentEmail,
        parentName,
        parentalConsentRequired: true,
        verifiedAt: new Date().toISOString(),
        status: 'pending_parental_consent'
      })
    } catch (error) {
      console.error('Error processing parental consent:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          
          {step === 'age-check' && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Age Verification Required
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  We need to verify your age to comply with child safety regulations and ensure a safe experience for all users.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                        Age Requirements
                      </h4>
                      <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                        <li>• You must be at least 13 years old to use 3DShareSpace</li>
                        <li>• Users under 18 require parental consent</li>
                        <li>• We comply with COPPA and other child protection laws</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={onCancel}
                    className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAgeCheck}
                    disabled={!birthDate}
                    className="px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    Verify Age
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'parental-consent' && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Parental Consent Required
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Since you're under 18, we need your parent or guardian's consent before you can create an account.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parent/Guardian Full Name
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Enter your parent's or guardian's full name"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parent/Guardian Email Address
                  </label>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    What happens next?
                  </h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• We'll send a consent form to your parent/guardian's email</li>
                    <li>• They'll need to verify their identity and provide consent</li>
                    <li>• Once approved, you can complete your account setup</li>
                    <li>• Special privacy protections apply to accounts under 18</li>
                  </ul>
                </div>

                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="parental-consent"
                    checked={parentalConsent}
                    onChange={(e) => setParentalConsent(e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="parental-consent" className="text-sm text-gray-700 dark:text-gray-300">
                    I confirm that the information above is accurate and that I have permission from my parent/guardian to request account creation on 3DShareSpace.
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setStep('age-check')}
                    className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleParentalConsent}
                    disabled={!parentEmail || !parentName || !parentalConsent || loading}
                    className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                    <span>{loading ? 'Processing...' : 'Request Consent'}</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {step === 'verification-failed' && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Age Requirement Not Met
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  We're sorry, but you must be at least 13 years old to create an account on 3DShareSpace.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border border-red-200 dark:border-red-800 mb-6">
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                      Why do we have age requirements?
                    </h4>
                    <ul className="text-red-700 dark:text-red-300 space-y-1">
                      <li>• We comply with COPPA (Children's Online Privacy Protection Act)</li>
                      <li>• We're committed to protecting children's privacy and safety online</li>
                      <li>• Age verification helps us provide appropriate content and features</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-6">
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Alternative Options
                </h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <li>• Explore 3D models without creating an account</li>
                  <li>• Learn about 3D modeling through our educational resources</li>
                  <li>• Return when you meet the age requirement</li>
                  <li className="flex items-center space-x-1">
                    <span>• Check out</span>
                    <a href="/community-guidelines" className="underline hover:no-underline">
                      our community guidelines
                    </a>
                    <ExternalLink className="w-3 h-3" />
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <button
                  onClick={onCancel}
                  className="px-6 py-3 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Return to Homepage
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  )
}

export default AgeVerification
