import React from 'react'

export function Progress({ value = 0, className = '' }) {
  const clampedValue = Math.min(Math.max(value, 0), 100)
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div
        className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  )
}

export default Progress
