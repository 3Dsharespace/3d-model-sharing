import React from 'react'
import clsx from 'clsx'

export const Card = ({ className, ...props }) => (
  <div
    className={clsx(
      'premium-dark-surface bg-white dark:bg-gray-800 rounded-xl border border-luxury-border-light dark:border-gray-700 shadow-sm',
      className
    )}
    {...props}
  />
)

export const CardHeader = ({ className, ...props }) => (
  <div className={clsx('px-6 py-4 border-b border-luxury-border-light dark:border-gray-700', className)} {...props} />
)

export const CardTitle = ({ className, ...props }) => (
  <h3 className={clsx('text-lg font-semibold text-luxury-text-primary dark:text-white', className)} {...props} />
)

export const CardDescription = ({ className, ...props }) => (
  <p className={clsx('text-sm text-luxury-text-secondary dark:text-gray-400', className)} {...props} />
)

export const CardContent = ({ className, ...props }) => (
  <div className={clsx('px-6 py-4', className)} {...props} />
)

export const CardFooter = ({ className, ...props }) => (
  <div className={clsx('px-6 py-4 border-t border-luxury-border-light dark:border-gray-700', className)} {...props} />
)

export default Card


