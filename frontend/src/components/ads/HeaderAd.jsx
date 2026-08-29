import React from 'react'
import AdSense from '../AdSense'
import { getAdConfig } from '../../config/adsense'

const HeaderAd = () => {
  const adConfig = getAdConfig('manual', 'header')
  
  if (!adConfig || !adConfig.enabled) {
    return null
  }

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AdSense
          type="manual"
          position="header"
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

export default HeaderAd
