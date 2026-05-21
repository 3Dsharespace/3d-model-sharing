import React from 'react'
import clsx from 'clsx'

const variants = {
  default: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  gray: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

export const Badge = ({ variant = 'default', className, ...props }) => (
  <span
    className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}
    {...props}
  />
)

export default Badge


