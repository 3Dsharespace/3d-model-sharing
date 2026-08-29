import React, { useEffect, useRef, useState } from 'react'
import { firebaseHelpers } from '../../lib/firebase'
import { ADSENSE_CONFIG, shouldShowAdsOnPage } from '../../config/adsense'

const AdvancedAdSense = ({ 
  placement, 
  modelId = null, 
  creatorId = null,
  className = '',
  style = {}
}) => {
  const adRef = useRef(null)
  const [adData, setAdData] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const impressionTracked = useRef(false)

  // Ad placement configurations
  const adConfigs = {
    homepage_hero: {
      size: [728, 90],
      className: 'w-full max-w-3xl mx-auto',
      style: { minHeight: '90px' }
    },
    homepage_sidebar: {
      size: [300, 250],
      className: 'w-full max-w-xs',
      style: { minHeight: '250px' }
    },
    model_detail_top: {
      size: [728, 90],
      className: 'w-full max-w-3xl mx-auto mb-4',
      style: { minHeight: '90px' }
    },
    model_detail_sidebar: {
      size: [300, 600],
      className: 'w-full max-w-xs',
      style: { minHeight: '600px' }
    },
    explore_grid: {
      size: [300, 250],
      className: 'w-full max-w-xs mx-auto',
      style: { minHeight: '250px' }
    },
    search_results: {
      size: [728, 90],
      className: 'w-full max-w-3xl mx-auto my-4',
      style: { minHeight: '90px' }
    },
    profile_header: {
      size: [970, 90],
      className: 'w-full max-w-4xl mx-auto',
      style: { minHeight: '90px' }
    },
    download_modal: {
      size: [300, 250],
      className: 'w-full max-w-xs mx-auto',
      style: { minHeight: '250px' }
    }
  }

  const config = adConfigs[placement] || adConfigs.homepage_sidebar

  useEffect(() => {
    loadAds()
  }, [placement])

  useEffect(() => {
    if (loaded && adRef.current && !impressionTracked.current) {
      trackImpression()
    }
  }, [loaded])

  const loadAds = async () => {
    try {
      // Get ads for this placement
      const result = await firebaseHelpers.getAdsForPlacement({ 
        placement, 
        limit: 1 
      })
      
      if (result.ads && result.ads.length > 0) {
        const ad = result.ads[0]
        setAdData(ad)
        
        if (ad.type === 'adsense') {
          loadAdSenseAd(ad)
        } else if (ad.type === 'sponsored') {
          setLoaded(true)
        }
      }
    } catch (error) {
      console.error('Error loading ads:', error)
    }
  }

  const loadAdSenseAd = (ad) => {
    if (!shouldShowAdsOnPage()) return

    // Ensure AdSense script is loaded
    if (!window.adsbygoogle) {
      const script = document.createElement('script')
      script.async = true
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CONFIG.PUBLISHER_ID}`
      script.crossOrigin = 'anonymous'
      document.head.appendChild(script)
      
      script.onload = () => {
        initializeAdSenseAd(ad)
      }
    } else {
      initializeAdSenseAd(ad)
    }
  }

  const initializeAdSenseAd = (ad) => {
    try {
      if (adRef.current && window.adsbygoogle) {
        // Clear any existing content
        adRef.current.innerHTML = ''
        
        // Create AdSense ad element
        const adElement = document.createElement('ins')
        adElement.className = 'adsbygoogle'
        adElement.style.display = 'block'
        adElement.setAttribute('data-ad-client', ADSENSE_CONFIG.PUBLISHER_ID)
        adElement.setAttribute('data-ad-slot', ad.adUnitId)
        adElement.setAttribute('data-ad-format', 'auto')
        adElement.setAttribute('data-full-width-responsive', 'true')
        
        if (ad.size) {
          adElement.style.width = `${ad.size[0]}px`
          adElement.style.height = `${ad.size[1]}px`
        }
        
        adRef.current.appendChild(adElement)
        
        // Push to AdSense
        window.adsbygoogle.push({})
        setLoaded(true)
      }
    } catch (error) {
      console.error('Error initializing AdSense ad:', error)
    }
  }

  const trackImpression = async () => {
    if (impressionTracked.current || !adData) return
    
    try {
      await firebaseHelpers.trackAdImpression({
        adId: adData.id,
        placement,
        modelId,
        userId: creatorId
      })
      impressionTracked.current = true
    } catch (error) {
      console.error('Error tracking impression:', error)
    }
  }

  const handleSponsoredClick = async () => {
    if (!adData || adData.type !== 'sponsored') return
    
    try {
      await firebaseHelpers.trackAdClick({
        adId: adData.id,
        placement,
        modelId,
        userId: creatorId
      })
      
      // Open target URL
      window.open(adData.targetUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error tracking click:', error)
    }
  }

  if (!adData) {
    return null
  }

  // Render sponsored ad
  if (adData.type === 'sponsored') {
    return (
      <div 
        className={`${config.className} ${className} border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow`}
        style={{ ...config.style, ...style }}
        onClick={handleSponsoredClick}
      >
        <div className="relative">
          {adData.imageUrl && (
            <img 
              src={adData.imageUrl} 
              alt={adData.title}
              className="w-full h-auto object-cover"
              style={{ maxHeight: config.size[1] }}
            />
          )}
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
            Sponsored
          </div>
        </div>
        <div className="p-3">
          <h4 className="font-semibold text-sm truncate">{adData.title}</h4>
          <p className="text-xs text-gray-600 line-clamp-2">{adData.description}</p>
        </div>
      </div>
    )
  }

  // Render AdSense ad
  return (
    <div 
      className={`${config.className} ${className} flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg`}
      style={{ ...config.style, ...style }}
    >
      <div ref={adRef} className="w-full h-full flex items-center justify-center">
        {!loaded && (
          <div className="text-gray-400 text-sm">
            Loading ad...
          </div>
        )}
      </div>
    </div>
  )
}

export default AdvancedAdSense
