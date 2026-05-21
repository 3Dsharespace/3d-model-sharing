import { useState, useCallback } from 'react'

// Simple toast system for the advanced earnings page
const toasts = []
let toastId = 0

export function useToast() {
  const [, forceUpdate] = useState(0)

  const toast = useCallback(({ title, description, variant = 'default' }) => {
    const id = ++toastId
    const newToast = { id, title, description, variant }
    
    toasts.push(newToast)
    forceUpdate(n => n + 1)

    // Auto-remove after 5 seconds
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id)
      if (index > -1) {
        toasts.splice(index, 1)
        forceUpdate(n => n + 1)
      }
    }, 5000)

    return id
  }, [])

  const dismiss = useCallback((id) => {
    const index = toasts.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.splice(index, 1)
      forceUpdate(n => n + 1)
    }
  }, [])

  return { toast, dismiss, toasts }
}
