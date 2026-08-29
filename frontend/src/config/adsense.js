// AdSense Configuration
// Replace these placeholder values with your actual AdSense publisher ID and ad slots

export const ADSENSE_CONFIG = {
  // Your AdSense Publisher ID (replace with actual ID)
  PUBLISHER_ID: 'ca-pub-1908204778515307', // Example: ca-pub-1234567890123456
  
  // AdSense Auto Ads Configuration
  AUTO_ADS: {
    enabled: true,
    // Auto Ads will automatically place ads in optimal locations
    // No manual configuration needed for basic Auto Ads
  },
  
  // Manual Ad Placements (optional - for specific ad positions)
  MANUAL_ADS: {
    // Header Banner Ad
    header: {
      enabled: false,
      adSlot: '1234567890', // Replace with actual ad slot ID
      adFormat: 'auto',
      responsive: true,
      className: 'w-full h-90'
    },
    
    // Sidebar Ad
    sidebar: {
      enabled: false,
      adSlot: '0987654321', // Replace with actual ad slot ID
      adFormat: 'auto',
      responsive: true,
      className: 'w-full h-600'
    },
    
    // In-Content Ad
    inContent: {
      enabled: false,
      adSlot: '1122334455', // Replace with actual ad slot ID
      adFormat: 'auto',
      responsive: true,
      className: 'w-full h-250 my-8'
    },
    
    // Footer Ad
    footer: {
      enabled: false,
      adSlot: '5566778899', // Replace with actual ad slot ID
      adFormat: 'auto',
      responsive: true,
      className: 'w-full h-90'
    }
  },
  
  // AdSense Policy Compliance
  COMPLIANCE: {
    // Minimum content requirements
    minContentLength: 200, // Increased from 100 to 200
    
    // Prohibited content types
    prohibitedContent: [
      'adult_content',
      'violent_content',
      'hate_speech',
      'illegal_activities'
    ],
    
    // Pages to exclude from ads (admin pages, minimal content pages)
    excludedPages: [
      '/admin',
      '/admin-dashboard', 
      '/admin-reports',
      '/admin-cleanup',
      '/admin-analytics',
      '/admin-security',
      '/admin-users',
      '/admin-models',
      '/admin-settings',
      '/login',
      '/signup',
      '/forgot-password',
      '/upload',
      '/dashboard',
      '/profile/edit',
      '/notifications',
      '/settings',
      '/privacy',
      '/terms',
      '/contact',
      '/report'
    ],
    
    // Ad placement restrictions
    placementRestrictions: {
      noAdsAboveFold: false, // Can be true for better UX
      noAdsNearNavigation: true,
      noAdsInContent: false,
      maxAdsPerPage: 3,
      // Ensure ads only show on pages with sufficient content
      requireMinimumContent: true
    }
  },
  
  // Performance Settings
  PERFORMANCE: {
    // Lazy loading for ads
    lazyLoading: true,
    
    // Ad loading timeout (ms)
    loadingTimeout: 5000,
    
    // Retry attempts for failed ads
    retryAttempts: 3,
    
    // Ad refresh interval (0 = no refresh)
    refreshInterval: 0
  },
  
  // Testing and Development
  TESTING: {
    // Enable test mode (shows placeholder ads)
    testMode: false,
    
    // Test publisher ID
    testPublisherId: 'ca-pub-3940256099942544',
    
    // Test ad slots
    testAdSlots: {
      banner: '6300978111',
      sidebar: '6300978112',
      inContent: '6300978113'
    }
  }
}

// Helper function to get ad configuration
export const getAdConfig = (adType, position = 'default') => {
  const config = ADSENSE_CONFIG
  
  if (adType === 'auto') {
    return {
      type: 'auto',
      enabled: config.AUTO_ADS.enabled,
      publisherId: config.PUBLISHER_ID
    }
  }
  
  if (adType === 'manual' && config.MANUAL_ADS[position]) {
    const manualConfig = config.MANUAL_ADS[position]
    return {
      type: 'manual',
      enabled: manualConfig.enabled,
      publisherId: config.PUBLISHER_ID,
      adSlot: manualConfig.adSlot,
      adFormat: manualConfig.adFormat,
      responsive: manualConfig.responsive,
      className: manualConfig.className
    }
  }
  
  return null
}

// Helper function to check if ads are enabled
export const areAdsEnabled = () => {
  const config = ADSENSE_CONFIG
  return config.AUTO_ADS.enabled || Object.values(config.MANUAL_ADS).some(ad => ad.enabled)
}

// Helper function to get test configuration
export const getTestConfig = () => {
  const config = ADSENSE_CONFIG.TESTING
  return {
    publisherId: config.testPublisherId,
    adSlots: config.testAdSlots,
    testMode: config.testMode
  }
}

// Helper function to check if ads should be shown on current page
export const shouldShowAdsOnPage = (currentPath = window.location.pathname) => {
  const config = ADSENSE_CONFIG.COMPLIANCE
  
  // Check if current page is in excluded pages
  const isExcludedPage = config.excludedPages.some(excludedPath => 
    currentPath.startsWith(excludedPath)
  )
  
  if (isExcludedPage) {
    console.log('🚫 AdSense disabled for excluded page:', currentPath)
    return false
  }
  
  // Check if page has sufficient content (basic check)
  const pageContent = document.body?.textContent || ''
  const hasMinimumContent = pageContent.length >= config.minContentLength
  
  if (!hasMinimumContent) {
    console.log('🚫 AdSense disabled - insufficient content on page:', currentPath)
    return false
  }
  
  return true
}

// Helper function to get content length of current page
export const getPageContentLength = () => {
  return document.body?.textContent?.length || 0
}
