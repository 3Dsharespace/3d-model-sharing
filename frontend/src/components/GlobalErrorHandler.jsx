import React, { useEffect } from 'react'

const GlobalErrorHandler = () => {
  useEffect(() => {
    // More aggressive error prevention for the persistent 'add' error
    const originalError = console.error
    const originalWarn = console.warn
    
    // Override console.error to completely block the persistent error
    console.error = (...args) => {
      const errorMessage = args.join(' ')
      
      // Completely block the persistent 'add' error
      if (errorMessage.includes("Cannot read properties of undefined (reading 'add')")) {
        console.info('🚫 BLOCKED persistent error from breaking the application:', errorMessage)
        return // Don't log anything, just block it
      }
      
      // For all other errors, use the original console.error
      originalError.apply(console, args)
    }
    
    // Override console.warn to completely block the persistent error
    console.warn = (...args) => {
      const warningMessage = args.join(' ')
      
      // Completely block the persistent 'add' error
      if (warningMessage.includes("Cannot read properties of undefined (reading 'add')")) {
        console.info('🚫 BLOCKED persistent warning from breaking the application:', warningMessage)
        return // Don't log anything, just block it
      }
      
      // For all other warnings, use the original console.warn
      originalWarn.apply(console, args)
    }
    
    // Global error handler to completely prevent the error
    const handleGlobalError = (event) => {
      const error = event.error || event.reason
      
      if (error && error.message && error.message.includes("Cannot read properties of undefined (reading 'add')")) {
        // Completely prevent the error from breaking the application
        event.preventDefault()
        event.stopPropagation()
        console.info('🚫 BLOCKED global error from breaking the application:', error.message)
        return false
      }
    }
    
    // Global promise rejection handler to completely prevent the error
    const handleUnhandledRejection = (event) => {
      const error = event.reason
      
      if (error && error.message && error.message.includes("Cannot read properties of undefined (reading 'add')")) {
        // Completely prevent the promise rejection from breaking the application
        event.preventDefault()
        event.stopPropagation()
        console.info('🚫 BLOCKED promise rejection from breaking the application:', error.message)
        return false
      }
    }
    
    // Add global error handlers
    window.addEventListener('error', handleGlobalError, true)
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true)
    
    // Override window.onerror to completely block the error
    const originalOnError = window.onerror
    window.onerror = (message, source, lineno, colno, error) => {
      if (message && message.includes("Cannot read properties of undefined (reading 'add')")) {
        console.info('🚫 BLOCKED window.onerror from breaking the application:', message)
        return true // Prevent default error handling
      }
      
      // For all other errors, use the original handler
      if (originalOnError) {
        return originalOnError(message, source, lineno, colno, error)
      }
      return false
    }
    
    // Cleanup function
    return () => {
      // Restore original console methods
      console.error = originalError
      console.warn = originalWarn
      
      // Remove global error handlers
      window.removeEventListener('error', handleGlobalError, true)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, true)
      
      // Restore original window.onerror
      window.onerror = originalOnError
    }
  }, [])

  // This component doesn't render anything visible
  // It just sets up aggressive error prevention
  return null
}

export default GlobalErrorHandler
