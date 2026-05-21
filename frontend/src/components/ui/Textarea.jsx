import React from 'react'
import clsx from 'clsx'

export const Textarea = ({ className, ...props }) => (
  <textarea
    className={clsx(
      'block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
      className
    )}
    {...props}
  />
)

export default Textarea


