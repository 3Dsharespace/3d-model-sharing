import React from 'react'
import clsx from 'clsx'

const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'

const variants = {
  solid: {
    default: 'bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200',
    secondary: 'bg-gray-900 text-white hover:bg-black/80 dark:bg-slate-700 dark:hover:bg-slate-600',
    success: 'bg-gray-800 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200',
    danger: 'bg-gray-800 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-gray-200',
  },
  outline: {
    default: 'border border-gray-300 text-gray-900 hover:bg-gray-50 dark:border-slate-600 dark:text-gray-200 dark:bg-slate-900/40 dark:hover:bg-slate-800',
  },
  ghost: {
    default: 'text-gray-800 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-white/10',
  }
}

const sizes = {
  sm: 'h-8 px-3',
  md: 'h-10 px-4',
  lg: 'h-12 px-5 text-base',
}

export const Button = ({
  variant = 'solid',
  color = 'default',
  size = 'md',
  className,
  asChild,
  ...props
}) => {
  const Comp = asChild ? 'span' : 'button'
  return (
    <Comp
      className={clsx(
        baseStyles,
        variants[variant]?.[color] || variants.solid.default,
        sizes[size],
        className
      )}
      {...props}
    />
  )
}

export default Button


