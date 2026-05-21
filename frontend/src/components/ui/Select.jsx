import React, { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'

// Simple compound Select component for AdvancedEarnings
export function Select({ value, onValueChange, children, className = '' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(value)
  const selectRef = useRef(null)

  useEffect(() => {
    setSelectedValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (newValue) => {
    setSelectedValue(newValue)
    setIsOpen(false)
    if (onValueChange) {
      onValueChange(newValue)
    }
  }

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {React.Children.map(children, child => 
        React.cloneElement(child, { 
          isOpen, 
          setIsOpen, 
          selectedValue, 
          onSelect: handleSelect 
        })
      )}
    </div>
  )
}

export function SelectTrigger({ children, isOpen, setIsOpen, className = '' }) {
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={clsx(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {children}
      <svg
        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
      </svg>
    </button>
  )
}

export function SelectValue({ placeholder, selectedValue }) {
  return <span>{selectedValue || placeholder || 'Select...'}</span>
}

export function SelectContent({ children, isOpen, className = '' }) {
  if (!isOpen) return null

  return (
    <div className={clsx(
      'absolute top-full z-50 mt-1 w-full rounded-md border border-gray-200 bg-white py-1 shadow-lg',
      className
    )}>
      {children}
    </div>
  )
}

export function SelectItem({ value, children, onSelect, className = '' }) {
  return (
    <div
      onClick={() => onSelect(value)}
      className={clsx(
        'relative flex cursor-pointer select-none items-center px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
        className
      )}
    >
      {children}
    </div>
  )
}

export default Select


