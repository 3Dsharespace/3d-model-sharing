import React from 'react'
import clsx from 'clsx'

export const Input = ({ className, ...props }) => (
  <input
    className={clsx(
      'block w-full rounded-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900/70 px-3 py-2 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-400 focus:border-blue-500 dark:focus:border-cyan-400',
      className
    )}
    {...props}
  />
)

export default Input


