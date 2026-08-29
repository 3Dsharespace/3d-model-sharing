import React, { useEffect, useState } from 'react'
import { shouldShowAdsOnPage, getPageContentLength } from '../config/adsense'

/**
 * AdSense Content Validator Component
 * 
 * This component helps ensure AdSense compliance by:
 * 1. Checking if pages have sufficient content
 * 2. Validating that ads are only shown on appropriate pages
 * 3. Providing warnings for pages that don't meet AdSense requirements
 */
const AdSenseContentValidator = ({ 
  showWarnings = false, 
  minContentLength = 200,
  className = '' 
}) => {
  const [contentLength, setContentLength] = useState(0)
  const [canShowAds, setCanShowAds] = useState(true)
  const [warnings, setWarnings] = useState([])

  useEffect(() => {
    const validateContent = () => {
      const currentPath = window.location.pathname
      const pageContentLength = getPageContentLength()
      const shouldShowAds = shouldShowAdsOnPage(currentPath)
      
      setContentLength(pageContentLength)
      setCanShowAds(shouldShowAds)
      
      // Generate warnings if needed
      const newWarnings = []
      
      if (!shouldShowAds) {
        newWarnings.push({
          type: 'excluded',
          message: `Ads disabled for page: ${currentPath}`,
          severity: 'info'
        })
      }
      
      if (pageContentLength < minContentLength) {
        newWarnings.push({
          type: 'insufficient_content',
          message: `Page content (${pageContentLength} chars) below minimum (${minContentLength} chars)`,
          severity: 'warning'
        })
      }
      
      if (currentPath.startsWith('/admin')) {
        newWarnings.push({
          type: 'admin_page',
          message: 'Admin pages are excluded from AdSense',
          severity: 'info'
        })
      }
      
      setWarnings(newWarnings)
    }

    // Validate on mount and when content changes
    validateContent()
    
    // Re-validate when content changes (for dynamic pages)
    const observer = new MutationObserver(validateContent)
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    })
    
    return () => observer.disconnect()
  }, [minContentLength])

  // Only show warnings in development or when explicitly requested
  if (!showWarnings && process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className={`adSense-content-validator ${className}`}>
      {warnings.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
            AdSense Content Validation
          </h4>
          <div className="space-y-1">
            {warnings.map((warning, index) => (
              <div key={index} className="text-xs text-blue-700 dark:text-blue-300">
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                  warning.severity === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></span>
                {warning.message}
              </div>
            ))}
          </div>
          <div className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            Content length: {contentLength} characters | Ads enabled: {canShowAds ? 'Yes' : 'No'}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdSenseContentValidator
