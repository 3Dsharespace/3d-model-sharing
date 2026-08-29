import React from 'react'
import clsx from 'clsx'

export const Card = ({ className, ...props }) => (
  <div
    className={clsx(
      'rounded-apple-lg border border-apple-separator bg-apple-bg-elevated',
      className
    )}
    {...props}
  />
)

export const CardHeader = ({ className, ...props }) => (
  <div className={clsx('px-apple-6 py-apple-4 border-b border-apple-separator', className)} {...props} />
)

export const CardTitle = ({ className, ...props }) => (
  <h3 className={clsx('text-[var(--apple-text-title-3)] font-semibold text-apple-label', className)} {...props} />
)

export const CardDescription = ({ className, ...props }) => (
  <p className={clsx('text-[var(--apple-text-footnote)] text-apple-label-secondary', className)} {...props} />
)

export const CardContent = ({ className, ...props }) => (
  <div className={clsx('px-apple-6 py-apple-4', className)} {...props} />
)

export const CardFooter = ({ className, ...props }) => (
  <div className={clsx('px-apple-6 py-apple-4 border-t border-apple-separator', className)} {...props} />
)

export default Card
