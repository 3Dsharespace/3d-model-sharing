import React, { useEffect, useRef, useState } from 'react'
import { DollarSign } from 'lucide-react'
import { ADSENSE_CONFIG, shouldShowAdsOnPage } from '../config/adsense'

const AdSense = ({ 
  type = 'auto', 
  position = 'bottom',
  className = '',
  adClient = ADSENSE_CONFIG.PUBLISHER_ID,
  adSlot = '',
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = 'display:block',
  testMode = false
}) => {
  const [adsEnabled, setAdsEnabled] = useState(false)
  const [testAd, setTestAd] = useState(false)
  const adRef = useRef(null)

  useEffect(() => {
    // Check if current page should show ads
    const canShowAds = shouldShowAdsOnPage()
    if (!canShowAds) {
      setAdsEnabled(false)
      return
    }

    // Check if user has consented to marketing cookies
    const cookieConsent = localStorage.getItem('cookieConsent')
    if (cookieConsent) {
      try {
        const consent = JSON.parse(cookieConsent)
        setAdsEnabled(!!consent.preferences?.marketing)
      } catch {
        setAdsEnabled(false)
      }
    }

    // React to consent changes live
    const onConsentChanged = (e) => {
      const prefs = e.detail || {}
      setAdsEnabled(!!prefs.marketing)
    }
    window.addEventListener('cookieConsentChanged', onConsentChanged)
    return () => window.removeEventListener('cookieConsentChanged', onConsentChanged)
  }, [type])

  useEffect(() => {
    if (!adsEnabled || testMode || type === 'auto' || !adRef.current || !window.adsbygoogle) return

    try {
      window.adsbygoogle.push({})
    } catch {
      // AdSense may reject duplicate pushes during route changes; the slot can stay empty.
    }
  }, [adsEnabled, testMode, type, adSlot])

  // Test mode - show placeholder ads
  if (testMode || testAd) {
    return (
      <div className={`bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-dashed border-yellow-300 rounded-lg p-6 text-center ${className}`}>
        <div className="flex items-center justify-center space-x-2 mb-3">
          <DollarSign className="h-5 w-5 text-yellow-600" />
          <span className="font-semibold text-yellow-800">AdSense Test Ad</span>
        </div>
        <div className="text-sm text-yellow-700 mb-3">
          <p>Position: {position}</p>
          <p>Type: {type}</p>
          <p>Format: {adFormat}</p>
        </div>
        <div className="bg-yellow-200 rounded p-2 text-xs text-yellow-800">
          This is a test advertisement placeholder. 
          Real ads will appear here when AdSense is configured.
        </div>
      </div>
    )
  }

  // Marketing cookies not consented
  if (!adsEnabled) {
    return null
  }

  // Auto Ads - handled by AdSense script
  if (type === 'auto') {
    return null
  }

  // Manual ad placement
  return (
    <div className={`ad-manual ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={style}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive}
      />
    </div>
  )
}

export default AdSense
