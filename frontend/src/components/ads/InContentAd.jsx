import React from 'react'
import AdSense from '../AdSense'
import { getAdConfig } from '../../config/adsense'

const InContentAd = ({ className = '' }) => {
  const adConfig = getAdConfig('manual', 'inContent')
  
  if (!adConfig || !adConfig.enabled) {
    return null
  }

  return (
    <div className={`my-8 text-center ${className}`}>
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-3">
          Advertisement
        </div>
        <AdSense
          type="manual"
          position="inContent"
          adClient={adConfig.publisherId}
          adSlot={adConfig.adSlot}
          adFormat={adConfig.adFormat}
          fullWidthResponsive={adConfig.responsive}
          className={adConfig.className}
        />
      </div>
    </div>
  )
}

export default InContentAd
