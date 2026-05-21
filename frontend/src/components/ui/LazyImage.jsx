import React, { useState, useRef, useEffect } from 'react'

const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYWEzYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    // Safety checks
    if (typeof window === 'undefined' || !window.IntersectionObserver) {
      // Fallback for browsers without IntersectionObserver
      setIsInView(true)
      return
    }

    if (!imgRef.current) return

    try {
      // Create intersection observer with safety checks
      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          try {
            if (entry && entry.isIntersecting && observerRef.current) {
              setIsInView(true)
              // Safely disconnect the observer
              try {
                observerRef.current.disconnect()
              } catch (disconnectError) {
                console.warn('Error disconnecting observer:', disconnectError)
              }
            }
          } catch (entryError) {
            console.warn('Error in intersection observer callback:', entryError)
            setIsInView(true) // Fallback: show image anyway
          }
        },
        {
          rootMargin: '50px', // Start loading 50px before the image comes into view
          threshold: 0.01
        }
      )

      // Safely observe the element
      try {
        observerRef.current.observe(imgRef.current)
      } catch (observeError) {
        console.warn('Error observing element:', observeError)
        setIsInView(true) // Fallback: show image anyway
      }

      return () => {
        try {
          if (observerRef.current) {
            observerRef.current.disconnect()
          }
        } catch (cleanupError) {
          console.warn('Error cleaning up observer:', cleanupError)
        }
      }
    } catch (observerError) {
      console.warn('Error creating IntersectionObserver:', observerError)
      setIsInView(true) // Fallback: show image anyway
    }
  }, [])

  const handleLoad = () => {
    try {
      setIsLoaded(true)
      onLoad?.(src)
    } catch (error) {
      console.warn('Error in image load handler:', error)
    }
  }

  const handleError = () => {
    try {
      setHasError(true)
      onError?.(src)
    } catch (error) {
      console.warn('Error in image error handler:', error)
    }
  }

  return (
    <img
      ref={imgRef}
      src={isInView ? src : placeholder}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-60'
      } ${className}`}
      onLoad={handleLoad}
      onError={handleError}
      loading="lazy"
      {...props}
    />
  )
}

export default LazyImage
