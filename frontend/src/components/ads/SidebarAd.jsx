import React from 'react'
import AdSense from '../AdSense'
import { getAdConfig } from '../../config/adsense'

const SidebarAd = () => {
  const adConfig = getAdConfig('manual', 'sidebar')
  
  if (!adConfig || !adConfig.enabled) {
    return null
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="text-center text-xs text-gray-500 dark:text-gray-400 mb-2">
        Advertisement
      </div>
      <AdSense
        type="manual"
        position="sidebar"
        adClient={adConfig.publisherId}
        adSlot={adConfig.adSlot}
        adFormat={adConfig.adFormat}
        fullWidthResponsive={adConfig.responsive}
        className={adConfig.className}
      />
    </div>
  )
}

export default SidebarAd
