import React from 'react'
import clsx from 'clsx'

export const Avatar = ({ src, alt, fallback, className }) => (
  <div className={clsx('relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white', className)}>
    {src ? (
      <img src={src} alt={alt} className="h-full w-full rounded-full object-cover" />
    ) : (
      <span className="text-sm font-medium">{fallback || 'U'}</span>
    )}
  </div>
)

export default Avatar


