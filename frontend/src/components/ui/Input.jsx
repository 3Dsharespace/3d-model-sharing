import React from 'react'
import clsx from 'clsx'

export const Input = ({ className, ...props }) => (
  <input
    className={clsx(
      'block w-full min-h-touch',
      'rounded-apple-md border border-apple-separator',
      'bg-[var(--apple-fill-tertiary)] text-apple-label',
      'px-apple-4 py-2 text-[var(--apple-text-body)]',
      'placeholder:text-apple-label-tertiary',
      'transition-colors duration-apple-fast ease-apple',
      'focus:outline-none focus:ring-2 focus:ring-[var(--apple-focus-ring)] focus:border-apple-blue',
      className
    )}
    {...props}
  />
)

export default Input
