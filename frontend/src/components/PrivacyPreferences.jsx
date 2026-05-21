import React, { useState, useEffect } from 'react'
import { X, Cookie, Shield, Settings, CheckCircle } from 'lucide-react'

const PrivacyPreferences = () => {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Always required
    analytics: false,
    preferences: false,
    marketing: false
  })
  const [region, setRegion] = useState('unknown')

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      setShowBanner(true)
    } else {
      try {
        const parsed = JSON.parse(consent)
        setCookiePreferences(parsed.preferences || cookiePreferences)
      } catch {}
    }
    // Basic regional detection (EEA/UK prompt emphasis)
    try {
      const locale = navigator.language || ''
      const isEU = /^(de|fr|es|it|nl|sv|da|fi|no|pl|pt|ro|cs|sk|sl|hu|el|bg|hr|et|lv|lt|ga|mt|eu|en-GB)/i.test(locale)
      setRegion(isEU ? 'eea_uk' : 'other')
    } catch {
      setRegion('unknown')
    }

    // Listen for global event to open cookie settings
    const openHandler = () => setShowSettings(true)
    window.addEventListener('openCookieSettings', openHandler)
    return () => window.removeEventListener('openCookieSettings', openHandler)
  }, [])

  const handleAcceptAll = () => {
    const preferences = {
      essential: true,
      analytics: true,
      preferences: true,
      marketing: true
    }
    saveConsent(preferences)
    setCookiePreferences(preferences)
    setShowBanner(false)
  }

  const handleAcceptEssential = () => {
    const preferences = {
      essential: true,
      analytics: false,
      preferences: false,
      marketing: false
    }
    saveConsent(preferences)
    setCookiePreferences(preferences)
    setShowBanner(false)
  }

  const handleSavePreferences = () => {
    saveConsent(cookiePreferences)
    setShowBanner(false)
    setShowSettings(false)
  }

  const saveConsent = (preferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      preferences,
      timestamp: new Date().toISOString()
    }))
    // Broadcast change so other components (e.g., AdSense) can react
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: preferences }))
    // For now, we'll just log the preferences
    console.log('Cookie preferences saved:', preferences)
  }

  const handlePreferenceChange = (type, value) => {
    setCookiePreferences(prev => ({
      ...prev,
      [type]: value
    }))
  }

  if (!showBanner) return null

  return (
    <>
      {/* Main Banner */}
      {!showSettings && (
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-start space-x-3 flex-1">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Cookie className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    We use cookies to enhance your experience
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    We use cookies and similar technologies to personalize content, analyze traffic, and serve ads through Google AdSense.
                    {region === 'eea_uk' && (
                      <span className="ml-1 text-gray-600 dark:text-gray-400">You can choose which optional cookies to allow.</span>
                    )}
                    <button 
                      onClick={() => setShowSettings(true)}
                      className="text-blue-600 dark:text-blue-400 hover:underline ml-1"
                    >
                      Learn more
                    </button>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 flex-shrink-0">
                <button
                  onClick={handleAcceptEssential}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Essential Only
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Accept All
                </button>
                <button
                  onClick={() => setShowBanner(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSettings(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Cookie Preferences
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Essential Cookies</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Required for basic functionality</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    These cookies are necessary for the website to function and cannot be switched off. 
                    They are usually only set in response to actions made by you which amount to a request for services.
                  </p>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Settings className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Analytics Cookies</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Help us improve our website</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cookiePreferences.analytics}
                        onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.
                  </p>
                </div>

                {/* Preferences Cookies */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Preference Cookies</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Remember your settings</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cookiePreferences.preferences}
                        onChange={(e) => handlePreferenceChange('preferences', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    These cookies enable the website to provide enhanced functionality and personalization.
                  </p>
                </div>

                {/* Marketing Cookies */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                        <Settings className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">Marketing & Advertising Cookies</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Used for Google AdSense and advertising</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cookiePreferences.marketing}
                        onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                    </label>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    These cookies may be set through our site by Google AdSense and other advertising partners to create a profile of your interests and show you relevant ads on this and other websites.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PrivacyPreferences
