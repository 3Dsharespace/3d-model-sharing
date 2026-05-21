import React from 'react'
import clsx from 'clsx'

export const Tabs = ({ value, onChange, children, className }) => (
  <div className={className}>{children}</div>
)

export const TabsList = ({ className, ...props }) => (
  <div
    className={clsx('inline-flex items-center justify-center rounded-lg bg-luxury-bg-secondary dark:bg-gray-800 p-1', className)}
    {...props}
  />
)

export const TabsTrigger = ({ active, className, ...props }) => (
  <button
    className={clsx(
      'px-4 py-2 rounded-md text-sm font-medium transition-colors',
      active
        ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow'
        : 'text-luxury-text-secondary dark:text-gray-300 hover:text-luxury-text-primary dark:hover:text-white',
      className
    )}
    {...props}
  />
)

export const TabsContent = ({ hidden, className, ...props }) => (
  <div className={clsx(hidden && 'hidden', className)} {...props} />
)

export default Tabs


